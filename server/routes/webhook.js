const express = require("express");
const router = express.Router();
const db = require("../db");
const { findCatalogProduct, getDownloadUrl } = require("../catalog");
const { sendOrderConfirmationEmail } = require("../email");

const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET || "";

/** Verify requests come from our own Next.js webhook forwarder */
function requireInternalSecret(req, res, next) {
  if (!INTERNAL_SECRET) {
    console.warn("[webhook] INTERNAL_WEBHOOK_SECRET not set — allowing request");
    return next();
  }
  if (req.headers["x-internal-secret"] !== INTERNAL_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(requireInternalSecret);

// --- Pack purchase fulfilled ---
router.post("/order-completed", async (req, res) => {
  const { sessionId, email, packId, amountTotal, currency, paymentIntent } = req.body;

  if (!email || !packId) {
    return res.status(400).json({ error: "Missing email or packId" });
  }

  const orderId = paymentIntent || sessionId || `stripe_${Date.now()}`;
  const catalogProduct = findCatalogProduct(packId);
  const productName = catalogProduct?.title || packId;
  const downloadUrl = getDownloadUrl(packId);

  // Check for duplicate
  const existing = db.prepare("SELECT id FROM orders WHERE order_id = ?").get(orderId);
  if (existing) {
    console.log(`[webhook] Duplicate order skipped: ${orderId}`);
    return res.json({ ok: true, duplicate: true });
  }

  // Insert order
  db.prepare(
    `INSERT INTO orders (order_id, email, product, amount, currency, pack_id, download_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(orderId, email, productName, amountTotal || 0, currency || "jpy", packId, downloadUrl);

  console.log(`[webhook] Order recorded: ${orderId} — ${productName} for ${email}`);

  // Send confirmation email
  try {
    await sendOrderConfirmationEmail(email, {
      productName,
      downloadUrl,
      orderId,
      amount: amountTotal,
      currency: currency || "jpy",
    });
    console.log(`[webhook] Confirmation email sent to ${email}`);
  } catch (err) {
    console.error(`[webhook] Failed to send email to ${email}:`, err);
  }

  return res.json({ ok: true });
});

// --- Subscription checkout completed ---
router.post("/subscription-checkout", (req, res) => {
  const { sessionId, email, plan, subscriptionId } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  console.log(`[webhook] Subscription checkout: ${plan} for ${email} (sub=${subscriptionId})`);

  // Activate pro tier for this user (if they exist)
  const user = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email);
  if (user) {
    db.prepare("UPDATE users SET tier = 'pro' WHERE id = ?").run(user.id);
    console.log(`[webhook] User ${email} upgraded to pro`);
  } else {
    console.log(`[webhook] No user account found for ${email} — pro will activate on login`);
  }

  // Record as order for tracking
  const orderId = subscriptionId || sessionId || `sub_${Date.now()}`;
  const existing = db.prepare("SELECT id FROM orders WHERE order_id = ?").get(orderId);
  if (!existing) {
    db.prepare(
      `INSERT INTO orders (order_id, email, product, amount, currency, pack_id)
       VALUES (?, ?, ?, 0, 'jpy', ?)`
    ).run(orderId, email, `Pro ${plan}`, `pro-${plan}`);
  }

  return res.json({ ok: true });
});

// --- Subscription updated ---
router.post("/subscription-updated", (req, res) => {
  const { subscriptionId, customerId, status, currentPeriodEnd, cancelAtPeriodEnd, priceId } = req.body;

  console.log(`[webhook] Subscription updated: ${subscriptionId} status=${status} cancelAtEnd=${cancelAtPeriodEnd}`);

  // If subscription is active/trialing, keep pro. If past_due/unpaid, downgrade.
  if (status === "active" || status === "trialing") {
    // Update pro_expires_at if we have the period end
    if (currentPeriodEnd) {
      const expiresAt = new Date(currentPeriodEnd * 1000).toISOString();
      db.prepare(
        "UPDATE users SET tier = 'pro', pro_expires_at = ? WHERE LOWER(email) IN (SELECT LOWER(email) FROM orders WHERE order_id = ?)"
      ).run(expiresAt, subscriptionId);
    }
  } else if (status === "past_due" || status === "unpaid") {
    console.log(`[webhook] Subscription ${subscriptionId} is ${status} — will downgrade if not resolved`);
  }

  return res.json({ ok: true });
});

// --- Subscription cancelled ---
router.post("/subscription-cancelled", (req, res) => {
  const { subscriptionId, customerId } = req.body;

  console.log(`[webhook] Subscription cancelled: ${subscriptionId}`);

  // Find orders with this subscription ID and downgrade the user
  const order = db.prepare("SELECT email FROM orders WHERE order_id = ?").get(subscriptionId);
  if (order) {
    const user = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(order.email);
    if (user) {
      db.prepare("UPDATE users SET tier = 'free', pro_expires_at = NULL WHERE id = ?").run(user.id);
      console.log(`[webhook] User ${order.email} downgraded to free`);
    }
  }

  return res.json({ ok: true });
});

module.exports = router;
