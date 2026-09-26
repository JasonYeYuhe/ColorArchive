/**
 * Has this customer already had their money back?
 *
 * WHY. /webhooks/subscription-revoke handles a refund, a refunded subscription
 * invoice or a dispute: it flags the order rows and drops the user to tier='free'.
 * But Lemon Squeezy sends subscription_cancelled + subscription_updated whenever
 * the subscription itself ends, and those two handlers rebuild the entitlement from
 * the subscription's own dates alone. So refund-then-cancel HANDED PRO BACK, through
 * to the end of the period that had just been refunded — up to a month on the
 * monthly plan and up to a year on the published yearly one. (Cancel-then-refund was
 * always correct; only this order was wrong.) Found by audit 2026-09-16, reproduced
 * by executing the real handlers; no refund has happened in production yet.
 *
 * WHICH WAY IT FAILS. On any error this returns false, i.e. "no refund" — the
 * pre-existing behaviour. Failing the other way would lock out a paying customer on
 * a database hiccup, and in this codebase that is the more expensive mistake.
 */

// Written into users.subscription_status by /webhooks/subscription-revoke.
const REVOKE_STATUSES = new Set([
  "refunded",
  "order_refunded",
  "subscription_payment_refunded",
  "dispute_created",
]);

// SUBSCRIPTION money only. A refunded LIFETIME order is revoked by
// hasLifetimeEntitlement() (it counts only kept lifetime orders); letting it count
// here made a separately paid subscription look refunded, and renewal-grace then
// refused to extend that paying customer (2026-09-24 review).
const SUBSCRIPTION_ORDER = "pack_id LIKE 'pro-%' AND pack_id <> 'pro-lifetime'";

function moneyWasReturned(db, userId) {
  if (userId === null || userId === undefined || userId === "") return false;
  try {
    const row = db
      .prepare("SELECT email, subscription_status FROM users WHERE id = ?")
      .get(userId);
    if (!row) return false;

    // Fast path: the revoke wrote its reason and nothing has overwritten it yet.
    if (REVOKE_STATUSES.has(String(row.subscription_status || "").toLowerCase())) return true;

    // Durable path, and the one that survives an intervening subscription_updated:
    // a refunded Pro order with no kept Pro payment after it. Orders are keyed by
    // email, the same join the lifetime guard uses.
    const refunded = db
      .prepare(
        `SELECT MAX(COALESCE(refunded_at, created_at)) AS at FROM orders
          WHERE LOWER(email) = LOWER(?) AND refunded = 1
            AND ${SUBSCRIPTION_ORDER} AND COALESCE(is_test, 0) = 0`,
      )
      .get(row.email ?? "");
    if (!refunded || !refunded.at) return false;

    const keptSince = db
      .prepare(
        `SELECT COUNT(*) AS n FROM orders
          WHERE LOWER(email) = LOWER(?) AND COALESCE(refunded, 0) = 0
            AND ${SUBSCRIPTION_ORDER} AND COALESCE(is_test, 0) = 0
            AND created_at > ?`,
      )
      .get(row.email ?? "", refunded.at);

    return (keptSince?.n ?? 0) === 0;
  } catch {
    return false;
  }
}

module.exports = { moneyWasReturned, REVOKE_STATUSES };
