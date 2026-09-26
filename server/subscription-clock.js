/**
 * The access each paid source gives an account ON ITS OWN, rebuilt from the rules
 * the owning handlers apply. Used where one source's access must be removed without
 * disturbing another's:
 *   - routes/webhook.js /subscription-revoke, when the refunded order is the LS
 *     LIFETIME (the account must end as if the lifetime had never been bought —
 *     server/__tests__/lifetime-refund-invariant.test.js);
 *   - routes/apple-notifications.js downgrade(), when an App Store purchase ends
 *     while a Lemon Squeezy subscription governs access (it used to return early and
 *     leave the ended App Store purchase's clock on the account — up to a year of
 *     access on a refunded yearly; found 2026-09-27).
 *
 * Nothing here is a rule of its own:
 *   Lemon Squeezy — a REAL subscription on the row (provider_subscription_id is not a
 *   lifetime's own `lifetime_<order id>`):
 *     - status + renewal date → resolveSubscriptionUpdate() as of the last provider
 *       event (what /subscription-updated wrote: grace, and its floor while alive);
 *     - never earlier than the newest kept payment's horizon, 35 / 370 days (what
 *       /subscription-payment writes; alive and not cancelled only, since
 *       /subscription-updated never moves an alive clock backwards);
 *     - a cancelled one only if refund-guard says its money was not returned (as
 *       /subscription-cancelled);
 *     - renewal-grace's own extension, while it is still the account's clock.
 *   (There is deliberately no "missed expiry" rule for a stale 'active' status: no
 *   handler has one, and it discarded real payments made after a lost
 *   subscription_updated — up to a paid year. Round 9, 2026-09-27.)
 *   App Store — MAX(expires_date) of active purchases + 3 days (grantApplePurchase,
 *   DID_RENEW).
 * Results may lie in the past: a late renewal's rebuilt clock is exactly what
 * renewal-grace then extends, as it does for any subscriber.
 */

const { ACTIVE_STATUSES, resolveSubscriptionUpdate, renewalExpiry } = require("./entitlement");
const { moneyWasReturned } = require("./refund-guard");
const { parseUtc } = require("./renewal-grace");

const DAY = 86400000;

/**
 * A Lemon Squeezy SUBSCRIPTION on the row, as opposed to a lifetime's own fresh-row
 * entry. Recognised by its subscription id, not by payment_provider: that column is
 * handed to 'apple' when an App Store purchase is made while LS is paused, and no LS
 * handler writes it back on resume — a resumed, paying LS subscription must still count
 * (round 9, 2026-09-27).
 */
function hasOwnLsSubscription(row) {
  const sid = String((row && row.provider_subscription_id) || "");
  return Boolean(row) && sid !== "" && !sid.startsWith("lifetime_");
}

/** ms, or NaN when the row carries no LS subscription or it gives nothing. */
function lemonSqueezyClockMs(db, userId) {
  const row = db
    .prepare(
      `SELECT email, payment_provider, subscription_status, subscription_current_period_end, provider_subscription_id,
              provider_event_at, pro_expires_at, renewal_grace_until
         FROM users WHERE id = ?`,
    )
    .get(userId);
  if (!hasOwnLsSubscription(row)) return NaN;
  const now = Date.now();
  const status = String(row.subscription_status || "").toLowerCase();
  const cancelled = status === "cancelled" || status === "canceled";
  const endMs = parseUtc(row.subscription_current_period_end);
  const invoice = db
    .prepare(
      `SELECT created_at, pack_id FROM orders
        WHERE LOWER(email) = LOWER(?) AND pack_id LIKE 'pro-%' AND pack_id <> 'pro-lifetime'
          AND COALESCE(refunded, 0) = 0 AND COALESCE(is_test, 0) = 0 AND COALESCE(amount, 0) > 0
        ORDER BY created_at DESC, id DESC LIMIT 1`,
    )
    .get(row.email || "");
  const horizonMs = invoice ? parseUtc(invoice.created_at) + (invoice.pack_id === "pro-yearly" ? 370 : 35) * DAY : NaN;
  const alive = ACTIVE_STATUSES.includes(status);
  const eventMs = parseUtc(row.provider_event_at);
  const gated = cancelled && moneyWasReturned(db, userId);

  const candidates = [];
  if (Number.isFinite(endMs) && !gated) {
    const decision = resolveSubscriptionUpdate({
      status,
      periodEndIso: new Date(endMs).toISOString(),
      now: Number.isFinite(eventMs) ? eventMs : 0,
    });
    if (decision.isPro && decision.proExpiresAt) candidates.push(parseUtc(decision.proExpiresAt));
  }
  if (alive && !cancelled && Number.isFinite(horizonMs)) candidates.push(horizonMs);
  // renewal-grace's extension of a late LS renewal, while it is still the account's
  // clock (renewal-grace records what it wrote; any later write makes them differ).
  // Without it, an App Store purchase ending during a late LS renewal shortened the
  // extension until renewal-grace's next hourly run.
  if (alive && row.renewal_grace_until && row.renewal_grace_until === row.pro_expires_at) {
    candidates.push(parseUtc(row.renewal_grace_until));
  }
  return candidates.length ? Math.max(...candidates) : NaN;
}

/** ms of the latest active App Store purchase's expiry + 3 days, or NaN. `excludeTxn` leaves one purchase out. */
function appStoreClockMs(db, userId, { excludeTxn = null } = {}) {
  const r = db
    .prepare(
      `SELECT MAX(expires_date) AS until FROM apple_purchases
        WHERE user_id = ? AND status = 'active' AND expires_date IS NOT NULL
          AND (? IS NULL OR original_transaction_id <> ?)`,
    )
    .get(userId, excludeTxn, excludeTxn);
  return r && r.until ? parseUtc(renewalExpiry(r.until)) : NaN;
}

/** The later of the given clocks as ISO, or null if none. */
function latestIso(...ms) {
  const ok = ms.filter(Number.isFinite);
  return ok.length ? new Date(Math.max(...ok)).toISOString() : null;
}

module.exports = { hasOwnLsSubscription, lemonSqueezyClockMs, appStoreClockMs, latestIso };
