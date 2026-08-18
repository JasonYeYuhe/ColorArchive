/**
 * App Store Server Notifications V2 handler.
 *
 * Receives signed notification payloads from Apple when subscription lifecycle
 * events occur (renewal, expiration, refund, etc.).
 *
 * Setup: In App Store Connect → App → App Store Server Notifications:
 *   URL: https://api.colorarchive.org/apple-notifications/v2
 *   Version: Version 2 Notifications
 *
 * Reference: https://developer.apple.com/documentation/appstoreservernotifications
 */

const express = require("express");
const router = express.Router();
const { renewalExpiry } = require("../entitlement");
const db = require("../db");
const {
  verifyNotificationPayload,
  verifySignedTransaction,
} = require("../apple-jws");

/**
 * POST /apple-notifications/v2
 *
 * Apple sends { signedPayload: "<JWS>" } for all notification types.
 * We verify the outer JWS, then verify the inner signedTransactionInfo.
 */
router.post("/v2", async (req, res) => {
  const { signedPayload } = req.body;

  if (!signedPayload) {
    console.warn("[apple-notifications] Missing signedPayload");
    return res.status(400).json({ error: "Missing signedPayload" });
  }

  try {
    // 1. Verify and decode the outer notification payload
    const notification = await verifyNotificationPayload(signedPayload);
    const { notificationType, subtype, data } = notification;

    console.log(
      `[apple-notifications] ${notificationType}${subtype ? ` (${subtype})` : ""}`
    );

    // 2. Verify the inner signedTransactionInfo if present
    let txn = null;
    if (data.signedTransactionInfo) {
      txn = await verifySignedTransaction(data.signedTransactionInfo);
    }

    if (!txn || !txn.originalTransactionId) {
      // Some notification types may not include transaction info
      console.log(
        `[apple-notifications] No transaction info for ${notificationType}`
      );
      return res.json({ ok: true });
    }

    const txnId = txn.originalTransactionId;

    // 3. Look up the user by their Apple transaction
    const purchase = db
      .prepare(
        "SELECT user_id FROM apple_purchases WHERE original_transaction_id = ?"
      )
      .get(txnId);

    if (!purchase) {
      console.warn(
        `[apple-notifications] Unknown transaction ${txnId} for ${notificationType}`
      );
      // Return 200 so Apple doesn't retry — we don't have this transaction
      return res.json({ ok: true, skipped: true });
    }

    const userId = purchase.user_id;

    // 4. Handle each notification type
    switch (notificationType) {
      case "DID_RENEW": {
        // Subscription successfully renewed. renewalExpiry() applies the same
        // 3-day grace as before but NEVER yields null: writing tier='pro' beside
        // a NULL pro_expires_at means auth.js can never expire this user, which
        // is the failure-open hole the web checkout path was fixed to close.
        const proExpiresAt = renewalExpiry(txn.expiresDate);

        db.prepare(`
          UPDATE users SET tier = 'pro', pro_expires_at = ? WHERE id = ?
        `).run(proExpiresAt, userId);

        db.prepare(`
          UPDATE apple_purchases SET
            status = 'active',
            expires_date = ?,
            product_id = ?
          WHERE original_transaction_id = ?
        `).run(txn.expiresDate, txn.productId, txnId);

        console.log(
          `[apple-notifications] DID_RENEW: user ${userId} renewed until ${proExpiresAt}`
        );
        break;
      }

      case "EXPIRED": {
        // Subscription expired — downgrade to free
        db.prepare(`
          UPDATE users SET tier = 'free', pro_expires_at = NULL WHERE id = ?
        `).run(userId);

        db.prepare(`
          UPDATE apple_purchases SET status = 'expired' WHERE original_transaction_id = ?
        `).run(txnId);

        console.log(`[apple-notifications] EXPIRED: user ${userId} downgraded`);
        break;
      }

      case "DID_FAIL_TO_RENEW": {
        if (subtype === "GRACE_PERIOD") {
          // User is in billing retry grace period — keep Pro for now
          console.log(
            `[apple-notifications] GRACE_PERIOD: user ${userId} in billing retry`
          );
        } else {
          // Billing retry exhausted — downgrade
          db.prepare(`
            UPDATE users SET tier = 'free', pro_expires_at = NULL WHERE id = ?
          `).run(userId);

          db.prepare(`
            UPDATE apple_purchases SET status = 'billing_retry_failed'
            WHERE original_transaction_id = ?
          `).run(txnId);

          console.log(
            `[apple-notifications] DID_FAIL_TO_RENEW: user ${userId} downgraded`
          );
        }
        break;
      }

      case "REFUND": {
        // Apple issued a refund — immediately downgrade
        db.prepare(`
          UPDATE users SET tier = 'free', pro_expires_at = NULL WHERE id = ?
        `).run(userId);

        db.prepare(`
          UPDATE apple_purchases SET status = 'refunded'
          WHERE original_transaction_id = ?
        `).run(txnId);

        console.log(`[apple-notifications] REFUND: user ${userId} refunded & downgraded`);
        break;
      }

      case "REVOKE": {
        // Family sharing revoked or App Store revocation
        db.prepare(`
          UPDATE users SET tier = 'free', pro_expires_at = NULL WHERE id = ?
        `).run(userId);

        db.prepare(`
          UPDATE apple_purchases SET status = 'revoked'
          WHERE original_transaction_id = ?
        `).run(txnId);

        console.log(`[apple-notifications] REVOKE: user ${userId} revoked`);
        break;
      }

      case "DID_CHANGE_RENEWAL_STATUS": {
        // User toggled auto-renew on/off
        const autoRenew = subtype === "AUTO_RENEW_ENABLED" ? 1 : 0;
        db.prepare(`
          UPDATE apple_purchases SET auto_renew_status = ?
          WHERE original_transaction_id = ?
        `).run(autoRenew, txnId);

        console.log(
          `[apple-notifications] AUTO_RENEW ${autoRenew ? "ON" : "OFF"}: user ${userId}`
        );
        break;
      }

      case "DID_CHANGE_RENEWAL_INFO": {
        // Renewal info changed (e.g., plan upgrade/downgrade)
        if (txn.productId) {
          db.prepare(`
            UPDATE apple_purchases SET product_id = ?
            WHERE original_transaction_id = ?
          `).run(txn.productId, txnId);
        }
        console.log(
          `[apple-notifications] RENEWAL_INFO_CHANGED: user ${userId}`
        );
        break;
      }

      case "SUBSCRIBED": {
        // Initial subscription or resubscribe. See DID_RENEW above for why this
        // must not be able to produce null.
        const proExpiresAt = renewalExpiry(txn.expiresDate);

        db.prepare(`
          UPDATE users SET tier = 'pro', pro_expires_at = ? WHERE id = ?
        `).run(proExpiresAt, userId);

        db.prepare(`
          UPDATE apple_purchases SET
            status = 'active',
            expires_date = ?,
            product_id = ?
          WHERE original_transaction_id = ?
        `).run(txn.expiresDate, txn.productId, txnId);

        console.log(
          `[apple-notifications] SUBSCRIBED: user ${userId}, plan ${txn.productId}`
        );
        break;
      }

      default:
        console.log(
          `[apple-notifications] Unhandled: ${notificationType} (${subtype || "no subtype"})`
        );
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[apple-notifications] Verification failed:", err.message);
    // Return 400 so Apple retries for transient errors, but 200 for
    // permanent failures (invalid JWS = not from Apple)
    if (err.message.includes("Apple") || err.message.includes("certificate")) {
      return res.status(400).json({ error: "Invalid notification payload" });
    }
    return res.status(500).json({ error: "Internal error" });
  }
});

module.exports = router;
