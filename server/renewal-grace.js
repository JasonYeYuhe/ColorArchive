/**
 * Automatic grace when the payment provider is late to charge a renewal.
 *
 * Lemon Squeezy has twice let a paying subscriber's renewal date pass without
 * attempting the charge: 2026-08-22 (charged 08-27, after the customer had already
 * been locked out) and 2026-09-22 (still unattempted at 09-24 while the LS
 * dashboard showed "Active · Renews 22 Sep"). Our clock — pro_expires_at, the
 * renewal date plus 3 days — runs out first, and auth.js then writes tier='free'
 * on the customer's next page load. The daily digest's overdue tripwire does
 * report it, at 08:00 UTC to an inbox, which is how a customer can still be locked
 * out at 10:00.
 *
 * So: while the provider itself still says the subscription is ACTIVE — not
 * past_due (a failed charge is real information), not on trial (nothing has been
 * paid yet), not cancelled — and its renewal date has passed with no charge having
 * moved the clock, the clock is moved to renewal + MAX_GRACE_DAYS. That is the
 * decision a human makes from the digest, made before the lock-out instead of
 * after. It is bounded: never more than MAX_GRACE_DAYS past the provider's own
 * renewal date, only for an account that has a kept Pro payment on record, and
 * never for one whose money was returned. When the charge lands, the payment and
 * subscription_updated handlers move both clocks forward as they always did.
 *
 *   node server/renewal-grace.js            # dry run: prints who would be extended
 *   node server/renewal-grace.js --apply    # extends them (the hourly scheduler does the same)
 */

const { moneyWasReturned } = require("./refund-guard");

const MAX_GRACE_DAYS = 10;
// Extend only once the clock is about to run out: a renewal charged a day late
// never needs this at all, and a clock that is extended early hides how late the
// provider actually is.
const LOOKAHEAD_HOURS = 36;
const INTERVAL_MS = 60 * 60 * 1000;

/**
 * Date.parse() reads "2026-09-25T10:00:00" (no zone) as LOCAL time. Every value
 * the webhooks write carries a Z, but three hand-written rows do not, and the CLI
 * may run on a JST laptop; SQLite's datetime() reads the same strings as UTC. So
 * the JS side treats a zone-less value as UTC too, matching the SQL side.
 */
function parseUtc(value) {
  if (typeof value !== "string" || !value) return NaN;
  const zoned = /(?:[zZ]|[+-]\d\d:?\d\d)$/.test(value);
  return Date.parse(zoned ? value : `${value.replace(" ", "T")}Z`);
}

function graceUntil(periodEndIso, maxDays = MAX_GRACE_DAYS) {
  const ms = parseUtc(periodEndIso);
  return Number.isFinite(ms) ? new Date(ms + maxDays * 86400000).toISOString() : null;
}

/**
 * Subscribers whose renewal date has passed while Lemon Squeezy still calls the
 * subscription active, whose clock is about to run out (or already has — no
 * tier='pro' filter here: auth.js writes tier='free' the moment a customer is
 * harmed, and the 2026-09-15 digest fix is what a tier filter costs), and who
 * have not yet had the full grace.
 */
function findDelayedRenewals(db, now = Date.now(), { userId = null } = {}) {
  const nowIso = new Date(now).toISOString();
  const soonIso = new Date(now + LOOKAHEAD_HOURS * 3600000).toISOString();
  return db
    .prepare(
      `SELECT id, email, tier, subscription_status, subscription_current_period_end, pro_expires_at
         FROM users
        WHERE payment_provider = 'lemonsqueezy'
          AND (? IS NULL OR id = ?)
          AND COALESCE(is_test, 0) = 0
          AND subscription_status = 'active'
          AND subscription_current_period_end IS NOT NULL
          AND datetime(subscription_current_period_end) < datetime(?)
          AND pro_expires_at IS NOT NULL
          AND datetime(pro_expires_at) <= datetime(?)
          -- evidence that this account has actually paid: a kept, real Pro order
          AND EXISTS (
            SELECT 1 FROM orders o
             WHERE LOWER(o.email) = LOWER(users.email)
               AND o.pack_id LIKE 'pro-%'
               AND COALESCE(o.refunded, 0) = 0
               AND COALESCE(o.is_test, 0) = 0
               AND COALESCE(o.amount, 0) > 0)
        ORDER BY subscription_current_period_end`,
    )
    .all(userId, userId, nowIso, soonIso)
    .filter((row) => {
      const cap = graceUntil(row.subscription_current_period_end);
      // Nothing to give once the cap itself is in the past, and nothing to give
      // twice: a row already at the cap stays where it is.
      return cap !== null && parseUtc(cap) > now && parseUtc(row.pro_expires_at) < parseUtc(cap);
    });
}

/** @returns {{id:number, from:string, until:string}[]} the rows extended */
function applyRenewalGrace(db, { now = Date.now(), log = console.log, userId = null } = {}) {
  const extended = [];
  for (const row of findDelayedRenewals(db, now, { userId })) {
    if (moneyWasReturned(db, row.id)) {
      log(`[renewal-grace] user=${row.id} renewal ${row.subscription_current_period_end} overdue but money was returned — not extended`);
      continue;
    }
    const until = graceUntil(row.subscription_current_period_end);
    // Optimistic: if a webhook moved the clock between the read and this write,
    // the write does nothing and the next hourly run re-evaluates.
    // renewal_grace_until records what THIS wrote, so the digest attributes
    // correctly: once a webhook moves the clock on, the two no longer match.
    const result = db
      .prepare(`UPDATE users SET tier = 'pro', pro_expires_at = ?, renewal_grace_until = ? WHERE id = ? AND pro_expires_at = ?`)
      .run(until, until, row.id, row.pro_expires_at);
    if (result.changes !== 1) continue;
    log(
      `[renewal-grace] user=${row.id} renewal due ${row.subscription_current_period_end} not charged yet, ` +
        `provider still says ${row.subscription_status}; access extended ${row.pro_expires_at} → ${until} ` +
        `(cap: renewal + ${MAX_GRACE_DAYS} days)${row.tier === "free" ? " — was locked out" : ""}`,
    );
    extended.push({ id: row.id, from: row.pro_expires_at, until });
  }
  return extended;
}

function startScheduler() {
  const db = require("./db");
  const run = () => {
    try {
      applyRenewalGrace(db);
    } catch (err) {
      console.error("[renewal-grace] run failed:", err.message);
    }
  };
  run();
  setInterval(run, INTERVAL_MS);
  console.log("[renewal-grace] started (hourly)");
}

module.exports = { MAX_GRACE_DAYS, LOOKAHEAD_HOURS, parseUtc, graceUntil, findDelayedRenewals, applyRenewalGrace, startScheduler };

if (require.main === module) {
  const db = require("./db");
  const apply = process.argv.includes("--apply");
  const rows = findDelayedRenewals(db);
  if (!rows.length) {
    console.log("[renewal-grace] nobody is waiting on a late provider charge");
  } else {
    for (const r of rows) {
      console.log(
        `  user=${r.id} tier=${r.tier} status=${r.subscription_status} renewal_due=${r.subscription_current_period_end} ` +
          `clock=${r.pro_expires_at} → would extend to ${graceUntil(r.subscription_current_period_end)}` +
          `${moneyWasReturned(db, r.id) ? "  (SKIP: money returned)" : ""}`,
      );
    }
  }
  if (apply) {
    const done = applyRenewalGrace(db);
    console.log(`[renewal-grace] extended ${done.length} row(s)`);
  } else if (rows.length) {
    console.log("--dry-run: nothing written. Re-run with --apply to extend.");
  }
}
