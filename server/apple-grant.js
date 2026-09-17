/**
 * Link a VERIFIED App Store transaction to an account and grant Pro.
 *
 * One implementation for both callers — /auth/apple-purchase (the app's own sync)
 * and scripts/link-apple-purchase.cjs (linking a purchase the sync never delivered) —
 * so a manual link cannot write anything the app's sync would not have.
 */

const { hasLifetimeEntitlement } = require("./lifetime");

const VALID_APPLE_PRODUCTS = [
  "me.colorarchive.pro.monthly",
  "me.colorarchive.pro.yearly",
  "me.colorarchive.pro.lifetime",
];
const SUBSCRIPTION_PRODUCTS = new Set(["me.colorarchive.pro.monthly", "me.colorarchive.pro.yearly"]);

// Lemon Squeezy statuses that still carry access (same set as the digest's tripwires).
// `cancelled` also does until its period ends — see appleGovernsAccess().
const ALIVE_SUBSCRIPTION = new Set(["active", "trialing", "on_trial", "past_due"]);

/**
 * The Pro clock to write when an Apple event would set `candidate`: never earlier
 * than what the user already has. An undated Pro row (lifetime, or a manual grant)
 * stays undated. Before 2026-09-17 no Apple JWS ever verified, so every iOS purchase
 * is still an UNFINISHED StoreKit transaction that the app replays on its next launch
 * — oldest included. Without this, an old monthly transaction replayed after a newer
 * one moves the expiry backwards, and a Lemon Squeezy subscriber with a lapsed App
 * Store purchase is locked out by it.
 */
function laterProClock(db, userId, candidate) {
  const current = db.prepare("SELECT tier, pro_expires_at FROM users WHERE id = ?").get(userId);
  if (!current || current.tier !== "pro") return candidate;
  if (current.pro_expires_at === null) return null;
  if (candidate === null) return null;
  return Date.parse(current.pro_expires_at) > Date.parse(candidate) ? current.pro_expires_at : candidate;
}

/**
 * Whether Apple's subscription is what governs this user's access. False when another
 * provider's subscription is still alive (or they hold a lifetime purchase): an App
 * Store subscription ending must not take away access paid for elsewhere.
 */
function appleGovernsAccess(db, userId, now = Date.now()) {
  const u = db
    .prepare("SELECT payment_provider, subscription_status, subscription_current_period_end FROM users WHERE id = ?")
    .get(userId);
  if (!u) return false;
  if (!u.payment_provider || u.payment_provider === "apple") return true;
  if (ALIVE_SUBSCRIPTION.has(u.subscription_status)) return false;
  // LS "cancelled" means "will not renew", not "access ends now" (server/entitlement.js).
  const paidThrough = Date.parse(u.subscription_current_period_end || "");
  if (u.subscription_status === "cancelled" && Number.isFinite(paidThrough) && paidThrough > now) return false;
  return true;
}

/**
 * @returns {{granted: true, proExpiresAt: string|null} | {granted: false, reason: string}}
 */
function grantApplePurchase(db, { userId, productId, txnId, transactionId = null, transactionDate, environment, expiresDate, verified, revocationDate = null, now = Date.now() }) {
  const apply = db.transaction(() => {
    // A signed transaction is a snapshot. One captured before its refund still
    // verifies afterwards, so the refund Apple notified us of outranks it. Checked per
    // transaction: refunding one period of a subscription must not block the next.
    const revoked = transactionId
      ? db.prepare("SELECT reason FROM apple_revoked_transactions WHERE transaction_id = ?").get(String(transactionId))
      : null;
    if (revoked) return { granted: false, reason: revoked.reason === "REVOKE" ? "revoked" : "refunded" };
    if (revocationDate) return { granted: false, reason: "revoked" };
    if (verified && SUBSCRIPTION_PRODUCTS.has(productId) && !expiresDate) {
      // A real subscription transaction always carries expiresDate. Signed data
      // without one is something else Apple signed (renewal info), not a purchase.
      return { granted: false, reason: "no-expiry" };
    }

    // Calculate pro expiration
    let proExpiresAt = null;
    if (expiresDate && verified) {
      // Use Apple-provided expiration date when available (most accurate)
      const d = new Date(expiresDate);
      d.setDate(d.getDate() + 3); // 3-day grace
      proExpiresAt = d.toISOString();
    } else if (productId === "me.colorarchive.pro.monthly") {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      d.setDate(d.getDate() + 3); // 3-day grace
      proExpiresAt = d.toISOString();
    } else if (productId === "me.colorarchive.pro.yearly") {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      d.setDate(d.getDate() + 3);
      proExpiresAt = d.toISOString();
    }
    // lifetime → proExpiresAt stays null (no expiration)

    // An Apple subscription purchase must not overwrite an existing Lemon
    // Squeezy lifetime. Same defect as the LS renewal path: NULL is the only
    // thing that records "forever", so a dated Apple expiry silently converts
    // a lifetime purchase into a subscription that later expires.
    const lifetime = hasLifetimeEntitlement(db, userId);
    if (lifetime) proExpiresAt = null;

    const lapsed = proExpiresAt !== null && Date.parse(proExpiresAt) <= now;

    db.prepare(`
      INSERT INTO apple_purchases (user_id, product_id, original_transaction_id, transaction_date, environment, expires_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(original_transaction_id) DO UPDATE SET
        status = CASE WHEN excluded.status = 'active' THEN 'active' ELSE apple_purchases.status END,
        product_id = excluded.product_id,
        expires_date = CASE
          WHEN apple_purchases.expires_date IS NULL OR excluded.expires_date > apple_purchases.expires_date
          THEN excluded.expires_date ELSE apple_purchases.expires_date END
    `).run(
      userId,
      productId,
      txnId,
      transactionDate || new Date().toISOString(),
      environment || "Production",
      expiresDate || null,
      lapsed ? "expired" : "active"
    );

    // A subscription that has already run out is recorded — so Apple's future
    // notifications for it (a resubscribe) find this account — but grants nothing.
    if (lapsed) return { granted: false, reason: "expired" };

    proExpiresAt = laterProClock(db, userId, proExpiresAt);
    // Keep another provider's name on the row while that provider's subscription is
    // alive or the user holds a lifetime purchase through it — the digest's renewal
    // tripwires and appleGovernsAccess() both key on it.
    const { payment_provider: provider } = db.prepare("SELECT payment_provider FROM users WHERE id = ?").get(userId);
    const keepProvider = Boolean(provider && provider !== "apple" && (lifetime || !appleGovernsAccess(db, userId)));

    db.prepare(`
      UPDATE users SET
        tier = 'pro',
        pro_expires_at = ?,
        apple_original_transaction_id = ?,
        payment_provider = CASE WHEN ? THEN payment_provider ELSE 'apple' END
      WHERE id = ?
    `).run(proExpiresAt, txnId, keepProvider ? 1 : 0, userId);

    return { granted: true, proExpiresAt };
  });
  return apply();
}

// Notification types after which an unclaimed transaction carries no access.
const NO_ACCESS_NOTIFICATION = /^(REFUND|REVOKE|EXPIRED)(\/|$)|^DID_FAIL_TO_RENEW$/;

/**
 * Link a transaction recorded in apple_unlinked_transactions to an account.
 * Rows there are written only after Apple's signature verified, so the product and
 * dates are Apple's, not anyone's claim. Refuses anything ambiguous; with
 * apply=false it only reports what it would do.
 */
function linkUnlinkedTransaction(db, { userId, txnId, apply = false }) {
  const row = db.prepare("SELECT * FROM apple_unlinked_transactions WHERE original_transaction_id = ?").get(txnId);
  if (!row) throw new Error(`no verified unlinked transaction ${txnId}`);
  if (row.environment !== "Production") throw new Error(`transaction ${txnId} is ${row.environment}, not Production`);
  if (!VALID_APPLE_PRODUCTS.includes(row.product_id)) throw new Error(`unknown product ${row.product_id}`);
  if (NO_ACCESS_NOTIFICATION.test(row.last_notification_type || "")) {
    throw new Error(`transaction ${txnId} last reported ${row.last_notification_type} — nothing to grant`);
  }
  const linked = db.prepare("SELECT user_id FROM apple_purchases WHERE original_transaction_id = ?").get(txnId);
  if (linked) throw new Error(`transaction ${txnId} is already linked to user ${linked.user_id}`);
  const readUser = () =>
    db.prepare("SELECT id, tier, pro_expires_at, payment_provider, apple_original_transaction_id FROM users WHERE id = ?").get(userId);
  const before = readUser();
  if (!before) throw new Error(`no user ${userId}`);

  // A lapsed subscription must be refused BEFORE the grant runs: the grant records a
  // lapsed transaction against the account (so resubscribe notifications find it),
  // which for a manual link would bind it to an account nobody has confirmed.
  if (SUBSCRIPTION_PRODUCTS.has(row.product_id)) {
    const until = Date.parse(row.expires_date || "");
    if (!Number.isFinite(until) || until + 3 * 86400000 <= Date.now()) {
      throw new Error(`transaction ${txnId} has no current period (expires ${row.expires_date}) — nothing to grant`);
    }
  }

  const plan = {
    userId,
    txnId,
    productId: row.product_id,
    purchaseDate: row.purchase_date,
    expiresDate: row.expires_date,
  };
  if (!apply) return { before, plan, after: null };

  const result = grantApplePurchase(db, {
    userId,
    productId: row.product_id,
    txnId,
    transactionId: row.transaction_id,
    transactionDate: row.purchase_date,
    environment: row.environment,
    expiresDate: row.expires_date,
    verified: true,
  });
  if (!result.granted) throw new Error(`transaction ${txnId} not granted: ${result.reason}`);
  return { before, plan, after: readUser() };
}

module.exports = {
  VALID_APPLE_PRODUCTS,
  NO_ACCESS_NOTIFICATION,
  appleGovernsAccess,
  grantApplePurchase,
  laterProClock,
  linkUnlinkedTransaction,
};
