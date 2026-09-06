/**
 * Lifetime entitlement protection.
 *
 * ── THE BUG THIS EXISTS TO PREVENT (found 2026-09-06, before anyone could buy) ──
 *
 * A lifetime purchase is stored as `pro_expires_at = NULL`, meaning "no expiry"
 * (routes/webhook.js, `if (plan !== "lifetime")`). Nothing else on the users row
 * distinguishes "lifetime" from "no entitlement at all" — NULL is both.
 *
 * Every revocation path then finds the user by a shared key and writes
 * `tier='free', pro_expires_at=NULL` unconditionally:
 *
 *   POST /webhooks/subscription-cancelled  findSubscriptionUser() → provider_customer_id
 *   POST /webhooks/subscription-updated    same customer-id fallback, fires alongside
 *                                          EVERY cancellation
 *   POST /webhooks/subscription-revoke     refunds and disputes
 *   Apple notifications                    EXPIRED / DID_FAIL_TO_RENEW / REFUND /
 *                                          REVOKE, keyed only on the users row
 *
 * So the ordinary upgrade destroys what it just sold: a monthly subscriber buys
 * lifetime for ¥19,999, cancels the monthly they no longer need, and when that
 * period ends the expiry webhook flips them to free. They paid the largest
 * amount this site charges and lose everything, silently. Same shape as the
 * 2026-07-20 and 2026-08-18 incidents.
 *
 * ── WHY A REFUND MUST STILL REVOKE ───────────────────────────────────────────
 *
 * The guard keys off a NON-REFUNDED lifetime order, not off `subscription_plan`
 * alone. `subscription_plan` stays 'lifetime' forever, so guarding on it would
 * make a refunded lifetime permanently un-revocable — trading a silent
 * lockout for free Pro forever, which is not an improvement. Refunding the
 * lifetime order sets `refunded = 1` (routes/webhook.js subscription-revoke),
 * the guard stops applying, and normal revocation resumes.
 *
 * `subscription_plan = 'lifetime'` is still honoured as a fallback for a row
 * that has no order at all (a manual grant), but only when no lifetime order
 * has been refunded — otherwise the refund would be overridden by the fallback.
 *
 * ── WHY db IS A PARAMETER ────────────────────────────────────────────────────
 *
 * So this is testable against an in-memory database instead of production.
 * entitlement.js took the same shape for the same reason.
 */

/** pack_id written for a lifetime order (routes/webhook.js writes `pro-${plan}`). */
const LIFETIME_PACK_ID = "pro-lifetime";

/**
 * Does this user hold a lifetime entitlement that a SUBSCRIPTION lifecycle
 * event must not revoke?
 *
 * @param {object} db            better-sqlite3 handle
 * @param {number|string|null} userId
 * @returns {boolean}
 */
function hasLifetimeEntitlement(db, userId) {
  if (userId === null || userId === undefined || userId === "") return false;

  let row;
  try {
    row = db
      .prepare("SELECT email, subscription_plan FROM users WHERE id = ?")
      .get(userId);
  } catch {
    // A guard that throws would fail OPEN — the revocation would proceed and
    // wipe the entitlement, which is the exact outcome this file prevents.
    return false;
  }
  if (!row) return false;

  // Orders are keyed by email (routes/webhook.js inserts the checkout email),
  // so a user who bought lifetime under the same address is matched even if the
  // subscription row was later relinked to a different provider id.
  let orders = [];
  try {
    orders = db
      .prepare(
        `SELECT refunded FROM orders
          WHERE pack_id = ?
            AND LOWER(email) = LOWER(?)
            AND COALESCE(is_test, 0) = 0`,
      )
      .all(LIFETIME_PACK_ID, row.email ?? "");
  } catch {
    orders = [];
  }

  const kept = orders.some((o) => !o.refunded);
  if (kept) return true;

  // A lifetime order exists but every one of them was refunded — the customer
  // has their money back, so the entitlement is genuinely gone.
  if (orders.length > 0) return false;

  // No lifetime order at all: honour a manual grant recorded on the user row.
  return row.subscription_plan === "lifetime";
}

module.exports = { hasLifetimeEntitlement, LIFETIME_PACK_ID };
