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
const { hasLifetimeEntitlement } = require("../lifetime");
const { appleGovernsAccess, grantApplePurchase, laterProClock } = require("../apple-grant");
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

    // Refunds are recorded per TRANSACTION, before anything else and whether or not an
    // account owns it: /auth/apple-purchase checks this table, so a transaction captured
    // before its refund cannot be replayed into Pro — including by someone who bought
    // while logged out and only claims it afterwards.
    if ((notificationType === "REFUND" || notificationType === "REVOKE") && txn.transactionId) {
      db.prepare(`
        INSERT INTO apple_revoked_transactions (transaction_id, original_transaction_id, reason)
        VALUES (?, ?, ?)
        ON CONFLICT(transaction_id) DO NOTHING
      `).run(String(txn.transactionId), txnId, notificationType);
    } else if (notificationType === "REFUND_REVERSED" && txn.transactionId) {
      db.prepare("DELETE FROM apple_revoked_transactions WHERE transaction_id = ?").run(String(txn.transactionId));
    }

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
      // 200 tells Apple to stop retrying, so this row is the only record left of a
      // customer who paid without the purchase reaching an account (the iOS app
      // syncs only while logged in). The daily digest reports Production rows until
      // one is linked through /auth/apple-purchase or dismissed.
      db.prepare(`
        INSERT INTO apple_unlinked_transactions
          (original_transaction_id, transaction_id, product_id, environment, purchase_date, expires_date, last_notification_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(original_transaction_id) DO UPDATE SET
          transaction_id = excluded.transaction_id,
          product_id = excluded.product_id,
          environment = excluded.environment,
          expires_date = excluded.expires_date,
          last_notification_type = excluded.last_notification_type,
          times_seen = times_seen + 1,
          last_seen_at = datetime('now')
      `).run(
        txnId,
        txn.transactionId ? String(txn.transactionId) : null,
        txn.productId || null,
        txn.environment || null,
        txn.purchaseDate || null,
        txn.expiresDate || null,
        `${notificationType}${subtype ? `/${subtype}` : ""}`
      );
      return res.json({ ok: true, skipped: true });
    }

    const userId = purchase.user_id;

    // An APPLE subscription ending must not revoke a LEMON SQUEEZY lifetime. The
    // revoking branches below key only on the users row, with no check that the
    // entitlement being revoked is the one that expired — so a user who bought
    // lifetime on the web and later let an App Store subscription lapse would
    // lose the lifetime. See server/lifetime.js.
    //
    // Declared ABOVE the switch on purpose: `switch` shares one block scope, and
    // jumping straight to `case "EXPIRED"` skips any const declared between the
    // cases, leaving it in the temporal dead zone — a ReferenceError on every
    // expiry rather than a downgrade. (This is exactly what the first draft did.)
    const keepsLifetime = hasLifetimeEntitlement(db, userId);
    // Asks at CALL time, not from the hoisted keepsLifetime: REFUND/REVOKE mark the row
    // first, so a refunded App Store lifetime no longer counts as the lifetime that
    // protects itself.
    const downgrade = (label) => {
      if (hasLifetimeEntitlement(db, userId)) {
        console.log(
          `[apple-notifications] ${label}: user ${userId} keeps access — lifetime entitlement held`
        );
        return;
      }
      // Same reasoning for a live subscription paid through another provider.
      if (!appleGovernsAccess(db, userId)) {
        console.log(
          `[apple-notifications] ${label}: user ${userId} keeps access — another provider's subscription is alive`
        );
        return;
      }
      // Another App Store subscription of theirs may still be paid (e.g. a refunded
      // lifetime next to an active yearly): fall back to it rather than to nothing.
      const other = db.prepare(`
        SELECT MAX(expires_date) AS until FROM apple_purchases
         WHERE user_id = ? AND original_transaction_id <> ? AND status = 'active' AND expires_date IS NOT NULL
      `).get(userId, txnId);
      if (other && other.until && Date.parse(other.until) > Date.now()) {
        db.prepare(`UPDATE users SET tier = 'pro', pro_expires_at = ? WHERE id = ?`).run(renewalExpiry(other.until), userId);
        console.log(`[apple-notifications] ${label}: user ${userId} falls back to another active App Store subscription`);
        return;
      }
      db.prepare(`UPDATE users SET tier = 'free', pro_expires_at = NULL WHERE id = ?`).run(userId);
    };

    // 4. Handle each notification type
    switch (notificationType) {
      case "DID_RENEW": {
        // Subscription successfully renewed. renewalExpiry() applies the same
        // 3-day grace as before but NEVER yields null: writing tier='pro' beside
        // a NULL pro_expires_at means auth.js can never expire this user, which
        // is the failure-open hole the web checkout path was fixed to close.
        // keepsLifetime (hoisted above the switch) is a VERIFIED lifetime purchase,
        // so writing NULL here is the marker, not the failure-open hole the comment
        // above warns about: auth.js is meant never to expire a lifetime holder.
        // Without this, an Apple renewal replaces a Lemon Squeezy lifetime's NULL
        // with a dated clock and the purchase quietly becomes a subscription.
        const proExpiresAt = laterProClock(db, userId, keepsLifetime ? null : renewalExpiry(txn.expiresDate));

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
        downgrade(notificationType);

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
          downgrade(notificationType);

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

      case "REFUND":
      case "REVOKE": {
        // A refund covers one transaction. If it is an earlier period than the one on
        // record, the current period is still paid for: nothing to take away.
        const onRecord = db
          .prepare("SELECT expires_date FROM apple_purchases WHERE original_transaction_id = ?")
          .get(txnId);
        if (
          txn.expiresDate && onRecord && onRecord.expires_date &&
          Date.parse(txn.expiresDate) < Date.parse(onRecord.expires_date)
        ) {
          console.log(
            `[apple-notifications] ${notificationType}: user ${userId}, an earlier period — current period still paid`
          );
          break;
        }

        // Status first, so downgrade() no longer counts this purchase as a lifetime.
        db.prepare(`
          UPDATE apple_purchases SET status = ?
          WHERE original_transaction_id = ?
        `).run(notificationType === "REFUND" ? "refunded" : "revoked", txnId);
        downgrade(notificationType);

        console.log(`[apple-notifications] ${notificationType}: user ${userId} downgraded`);
        break;
      }

      case "REFUND_REVERSED": {
        // Apple took the refund back: restore exactly what the purchase grants. The
        // revocation row was deleted above, so the grant's own checks let it through.
        const restored = grantApplePurchase(db, {
          userId,
          productId: txn.productId,
          txnId,
          transactionId: txn.transactionId,
          transactionDate: txn.purchaseDate,
          environment: txn.environment,
          expiresDate: txn.expiresDate,
          verified: true,
        });
        if (!restored.granted && restored.reason === "expired") {
          // The period ended while the refund stood: the purchase is lapsed, not refunded.
          db.prepare(`
            UPDATE apple_purchases SET status = 'expired'
            WHERE original_transaction_id = ? AND status IN ('refunded', 'revoked')
          `).run(txnId);
        }
        console.log(`[apple-notifications] REFUND_REVERSED: user ${userId} ${restored.granted ? "restored" : `not restored (${restored.reason})`}`);
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
        // keepsLifetime (hoisted above the switch) is a VERIFIED lifetime purchase,
        // so writing NULL here is the marker, not the failure-open hole the comment
        // above warns about: auth.js is meant never to expire a lifetime holder.
        // Without this, an Apple renewal replaces a Lemon Squeezy lifetime's NULL
        // with a dated clock and the purchase quietly becomes a subscription.
        const proExpiresAt = laterProClock(db, userId, keepsLifetime ? null : renewalExpiry(txn.expiresDate));

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
