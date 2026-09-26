/**
 * Executing tests for server/renewal-grace.js — the automatic grace applied when
 * Lemon Squeezy is late to charge a renewal.
 *
 * Real schema, real SQL. The clock is injected (NOW = the moment this was written:
 * 2026-09-24 15:30 UTC, 18.5 h before the customer in question would have been
 * locked out for the second month running).
 */

require("./support/route-harness").install();

const test = require("node:test");
const assert = require("node:assert");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const db = require("../db");
const { applyRenewalGrace, findDelayedRenewals, graceUntil, parseUtc, MAX_GRACE_DAYS, LOOKAHEAD_HOURS } = require("../renewal-grace");

const DAY = 86400000;
const HOUR = 3600000;
const NOW = Date.parse("2026-09-24T15:30:00.000Z");
const iso = (ms) => new Date(ms).toISOString();
const silent = { now: NOW, log: () => {} };

function reset() {
  for (const t of ["apple_purchases", "projects", "sessions", "magic_link_tokens", "orders", "users"]) {
    db.exec(`DELETE FROM ${t}`);
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users").get().n, 0, "reset() did not empty users");
}

/** Hayley-shaped by default: active, renewal 2.5 days late, clock 18.5 h from lock-out, one kept $3 payment. */
function seed(email, o = {}) {
  const {
    status = "active", tier = "pro", provider = "lemonsqueezy", isTest = 0,
    periodEnd = iso(NOW - 2.5 * DAY), proExpires = iso(NOW + 18.5 * HOUR),
    paid = true, refunded = false, orderAmount = 3,
  } = o;
  db.prepare(
    `INSERT INTO users (email, tier, subscription_plan, subscription_status, pro_expires_at, subscription_current_period_end,
                        payment_provider, provider_customer_id, provider_subscription_id, is_test)
     VALUES (?, ?, 'monthly', ?, ?, ?, ?, ?, ?, ?)`,
  ).run(email, tier, status, proExpires, periodEnd, provider, `cus_${email}`, `sub_${email}`, isTest);
  const id = db.prepare("SELECT id FROM users WHERE email = ?").get(email).id;
  if (paid) {
    db.prepare(
      `INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test)
       VALUES (?, ?, 'Pro monthly', ?, 'usd', 'pro-monthly', ?, ?)`,
    ).run(`lsinv_${email}`, email, orderAmount, refunded ? 1 : 0, isTest);
  }
  return id;
}
const row = (id) => db.prepare("SELECT tier, pro_expires_at, subscription_current_period_end AS cpe, renewal_grace_until AS graced FROM users WHERE id = ?").get(id);

test("the real case: renewal 2.5 days late, provider still active, 18.5 h from lock-out → extended to renewal + 10 days", () => {
  reset();
  const id = seed("hayley@x.com");
  const logs = [];
  const done = applyRenewalGrace(db, { now: NOW, log: (m) => logs.push(m) });
  const r = row(id);
  assert.equal(done.length, 1);
  assert.equal(r.pro_expires_at, graceUntil(r.cpe));
  assert.equal(r.pro_expires_at, iso(NOW - 2.5 * DAY + MAX_GRACE_DAYS * DAY));
  assert.equal(r.tier, "pro");
  assert.equal(r.graced, r.pro_expires_at, "the marker the digest attributes by must be exactly the clock that was written");
  assert.match(logs.join("\n"), /user=\d+ renewal due .* not charged yet/);
});

test("a clock written without a zone is read as UTC, like SQLite reads it — even on a JST machine", () => {
  const before = process.env.TZ;
  process.env.TZ = "Asia/Tokyo";
  try {
    assert.equal(parseUtc("2026-09-25T10:00:00"), Date.parse("2026-09-25T10:00:00Z"));
    assert.equal(parseUtc("2026-09-25 10:00:00"), Date.parse("2026-09-25T10:00:00Z"));
    assert.equal(parseUtc("2026-09-25T10:00:00.000Z"), Date.parse("2026-09-25T10:00:00Z"));
    assert.equal(parseUtc("2026-09-25T19:00:00+09:00"), Date.parse("2026-09-25T10:00:00Z"));
    assert.ok(Number.isNaN(parseUtc(null)) && Number.isNaN(parseUtc("")));
    // The executed consequence has to be probed WEST of UTC: Date.parse reads a zone-less
    // string as local time, and only a zone behind UTC reads it LATER than the instant
    // (Los Angeles: +7 h), pushing a clock 1 s under the cap over it. East of UTC (JST) the
    // bug reads it earlier, which still counts as under the cap — the first version of this
    // test was aimed there and passed without the fix (2026-09-24 review).
    process.env.TZ = "America/Los_Angeles";
    reset();
    const capMs = NOW - 2.5 * DAY + MAX_GRACE_DAYS * DAY;
    const id = seed("nozone@x.com", { proExpires: new Date(capMs - 1000).toISOString().slice(0, 19) });
    assert.equal(applyRenewalGrace(db, { ...silent, now: capMs - 20 * HOUR }).length, 1, "a zone-less clock 1 s under the cap read as 7 h over it");
    assert.equal(row(id).pro_expires_at, iso(capMs));
  } finally {
    if (before === undefined) delete process.env.TZ; else process.env.TZ = before;
  }
});

test("a customer auth.js already locked out (tier=free, clock 2 h ago) is restored — no tier filter", () => {
  reset();
  const id = seed("late@x.com", { tier: "free", proExpires: iso(NOW - 2 * HOUR) });
  applyRenewalGrace(db, silent);
  assert.equal(row(id).tier, "pro");
  assert.equal(row(id).pro_expires_at, iso(NOW - 2.5 * DAY + MAX_GRACE_DAYS * DAY));
});

test("idempotent: a second run changes nothing, and a row already at the cap is left alone", () => {
  reset();
  const id = seed("once@x.com");
  assert.equal(applyRenewalGrace(db, silent).length, 1);
  const after = row(id).pro_expires_at;
  assert.equal(applyRenewalGrace(db, silent).length, 0);
  // NOW+7d is inside the 36 h look-ahead of the cap (NOW+7.5d): only the "< cap" check stops a re-extension here.
  assert.equal(applyRenewalGrace(db, { ...silent, now: NOW + 7 * DAY }).length, 0, "the hourly runs after the extension must not extend again");
  assert.equal(row(id).pro_expires_at, after);
});

test("a charge that landed (clock 30 days out) is not touched; a clock 5 days out is not touched YET", () => {
  reset();
  const paid = seed("paid@x.com", { proExpires: iso(NOW + 30 * DAY) });
  const early = seed("early@x.com", { proExpires: iso(NOW + 5 * DAY) });
  assert.equal(applyRenewalGrace(db, silent).length, 0);
  assert.equal(row(paid).pro_expires_at, iso(NOW + 30 * DAY));
  assert.equal(row(early).pro_expires_at, iso(NOW + 5 * DAY));
  // ...and it IS extended once inside the look-ahead window.
  assert.equal(applyRenewalGrace(db, { ...silent, now: NOW + 5 * DAY - (LOOKAHEAD_HOURS - 1) * HOUR }).length, 1);
});

test("the provider's own verdict wins: past_due, cancelled, expired and on_trial are never extended", () => {
  reset();
  const ids = ["past_due", "cancelled", "expired", "on_trial"].map((status) => seed(`${status}@x.com`, { status }));
  assert.equal(applyRenewalGrace(db, silent).length, 0);
  for (const id of ids) assert.equal(row(id).pro_expires_at, iso(NOW + 18.5 * HOUR));
});

test("positive control for the test above: the same row with status active IS extended", () => {
  reset();
  const id = seed("control@x.com", { status: "active" });
  assert.equal(applyRenewalGrace(db, silent).length, 1);
  assert.notEqual(row(id).pro_expires_at, iso(NOW + 18.5 * HOUR));
});

test("only Lemon Squeezy, only real accounts, only accounts with a kept paid Pro order, only dated clocks", () => {
  reset();
  const apple = seed("apple@x.com", { provider: "apple" });
  const testRow = seed("test@x.com", { isTest: 1, paid: false });
  db.prepare(`INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test)
              VALUES ('lsinv_real_for_test_user', 'test@x.com', 'Pro monthly', 3, 'usd', 'pro-monthly', 0, 0)`).run();
  const unpaid = seed("unpaid@x.com", { paid: false });
  const zero = seed("zero@x.com", { orderAmount: 0 }); // the ¥0 trial order_created row is not a payment
  const lifetime = seed("life@x.com", { proExpires: null });
  const noPeriod = seed("noperiod@x.com", { periodEnd: null });
  assert.equal(applyRenewalGrace(db, silent).length, 0);
  for (const id of [apple, testRow, unpaid, zero]) assert.equal(row(id).pro_expires_at, iso(NOW + 18.5 * HOUR));
  assert.equal(row(lifetime).pro_expires_at, null);
  assert.equal(row(noPeriod).pro_expires_at, iso(NOW + 18.5 * HOUR));
});

test("money returned: a refunded payment with nothing kept after it is not extended", () => {
  reset();
  const id = seed("refunded@x.com", { refunded: true });
  const logs = [];
  assert.equal(applyRenewalGrace(db, { now: NOW, log: (m) => logs.push(m) }).length, 0);
  assert.equal(row(id).pro_expires_at, iso(NOW + 18.5 * HOUR));
  // The refunded order fails the "kept paid order" clause before moneyWasReturned is even asked;
  // a refund recorded only in the status column is caught by moneyWasReturned itself.
  reset();
  const id2 = seed("revoked@x.com", { status: "active" });
  db.prepare(
    `INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test)
     VALUES ('lsinv_r2', 'revoked@x.com', 'Pro monthly', 3, 'usd', 'pro-monthly', 1, 0)`,
  ).run();
  // kept order (the seed) + a LATER refunded one: money for the latest period was returned
  db.prepare("UPDATE orders SET created_at = datetime('now', '-40 days') WHERE order_id = 'lsinv_revoked@x.com'").run();
  assert.equal(applyRenewalGrace(db, silent).length, 0, "the latest payment was refunded — nothing to extend");
  assert.equal(row(id2).pro_expires_at, iso(NOW + 18.5 * HOUR));
});

test("once the cap itself is in the past there is nothing to give", () => {
  reset();
  const id = seed("ancient@x.com", { tier: "free", periodEnd: iso(NOW - 12 * DAY), proExpires: iso(NOW - 9 * DAY) });
  assert.equal(findDelayedRenewals(db, NOW).length, 0);
  assert.equal(applyRenewalGrace(db, silent).length, 0);
  assert.equal(row(id).tier, "free");
});

test("the write is optimistic: a clock moved by a webhook between the read and the write is left as the webhook set it", () => {
  reset();
  const id = seed("race@x.com");
  const webhookValue = iso(NOW + 40 * DAY);
  const racing = {
    prepare(sql) {
      const stmt = db.prepare(sql);
      if (/UPDATE users SET tier = 'pro', pro_expires_at = \?/.test(sql)) {
        return { run: (...args) => { db.prepare("UPDATE users SET pro_expires_at = ? WHERE id = ?").run(webhookValue, id); return stmt.run(...args); } };
      }
      return stmt;
    },
  };
  assert.equal(applyRenewalGrace(racing, silent).length, 0);
  assert.equal(row(id).pro_expires_at, webhookValue);
});

test("the scheduler is wired under the same switch as the others, so a laptop never writes production-shaped grace", () => {
  const index = readFileSync(join(__dirname, "..", "index.js"), "utf8");
  assert.ok(index.includes('startScheduler("renewal-grace", "./renewal-grace")'), "index.js does not start renewal-grace through startScheduler()");
  const src = readFileSync(join(__dirname, "..", "renewal-grace.js"), "utf8");
  assert.ok(/subscription_status = 'active'/.test(src), "grace must be limited to subscriptions the provider calls active");
  assert.ok(!/tier = 'pro'\s+AND/.test(src.slice(src.indexOf("function findDelayedRenewals"), src.indexOf("function applyRenewalGrace"))), "a tier='pro' filter in the SELECT would hide every customer already harmed");
});
