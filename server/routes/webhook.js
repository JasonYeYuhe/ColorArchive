const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");
const { findCatalogProduct, getDownloadUrl, getPackUrl } = require("../catalog");
const { sendOrderConfirmationEmail } = require("../email");

const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET || "";

/** Verify requests come from our own Next.js webhook forwarder.
 *  Fail-closed in all environments. Previously a dev-mode branch
 *  allowed unauthenticated requests when INTERNAL_SECRET was unset —
 *  that branch was silently shipping to prod because NODE_ENV also
 *  wasn't set, allowing anonymous fraudulent Pro activations
 *  (2026-04-17 incident, docs/ls-commerce-validation-2026-04-17.md).
 */
function verifyInternal(req, res, next) {
  if (!INTERNAL_SECRET) {
    console.error("[webhook] INTERNAL_WEBHOOK_SECRET not set — refusing to serve");
    return res.status(500).json({ error: "Server misconfiguration" });
  }
  const provided = req.headers["x-internal-secret"] || "";
  const expected = Buffer.from(INTERNAL_SECRET);
  const received = Buffer.from(provided);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(verifyInternal);

// POST /webhooks/order-completed
// Called by Next.js webhook route after Stripe checkout.session.completed
router.post("/order-completed", async (req, res) => {
  const { sessionId, email, packId, amountTotal, currency, paymentIntent } = req.body;

  if (!email || !packId) {
    return res.status(400).json({ error: "Missing email or packId" });
  }

  const provider = req.body.provider || "stripe";
  const orderId = paymentIntent || `${provider}_${sessionId}` || `${provider}_${Date.now()}`;
  const catalogProduct = findCatalogProduct(packId);
  const productName = catalogProduct?.title || packId;
  const downloadUrl = getDownloadUrl(packId) || `${process.env.FRONTEND_ORIGIN || "https://colorarchive.org"}/packs`;

  // Check for duplicate
  const existing = db.prepare("SELECT id FROM orders WHERE order_id = ?").get(orderId);
  if (existing) {
    console.log(`[webhook] Duplicate order skipped: ${orderId}`);
    return res.json({ ok: true, duplicate: true });
  }

  // Look up subscriber attribution
  const subscriberAttribution = db
    .prepare(
      "SELECT source, utm_source, utm_medium, utm_campaign, utm_term, utm_content, landing_path FROM subscribers WHERE lower(email) = lower(?)"
    )
    .get(email);

  // Insert order with attribution
  try {
    db.prepare(
      `INSERT OR IGNORE INTO orders (
        order_id, email, product, amount, currency, pack_id,
        download_url, stripe_session_id, payment_intent,
        attributed_source, attributed_utm_source, attributed_utm_medium,
        attributed_utm_campaign, attributed_utm_term, attributed_utm_content,
        attributed_landing_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderId,
      email,
      productName,
      amountTotal || 0,
      currency || "jpy",
      packId,
      downloadUrl,
      sessionId || null,
      paymentIntent || null,
      subscriberAttribution?.source || null,
      subscriberAttribution?.utm_source || null,
      subscriberAttribution?.utm_medium || null,
      subscriberAttribution?.utm_campaign || null,
      subscriberAttribution?.utm_term || null,
      subscriberAttribution?.utm_content || null,
      subscriberAttribution?.landing_path || null
    );

    // Add buyer to subscribers if not already
    db.prepare(
      "INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)"
    ).run(email, `${provider}-purchase`);
  } catch (err) {
    console.error("[webhook] DB error (order):", err);
  }

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

// POST /webhooks/subscription-checkout
// Called after a subscription checkout completes
router.post("/subscription-checkout", (req, res) => {
  const { sessionId, email, plan, subscriptionId, provider } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const paymentProvider = provider || "stripe";
  console.log(`[webhook] Subscription checkout: ${plan} for ${email} (sub=${subscriptionId}, provider=${paymentProvider})`);

  // Find or create user, activate pro
  let user = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email);
  if (!user) {
    db.prepare("INSERT INTO users (email) VALUES (?)").run(email);
    user = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email);
  }

  if (user) {
    db.prepare(
      `UPDATE users SET
        tier = 'pro',
        subscription_plan = ?,
        stripe_subscription_id = ?,
        payment_provider = ?,
        provider_subscription_id = ?
      WHERE id = ?`
    ).run(plan || "monthly", subscriptionId || null, paymentProvider, subscriptionId || null, user.id);
    console.log(`[webhook] User ${email} upgraded to pro via ${paymentProvider}`);
  }

  // Add to subscribers
  db.prepare(
    "INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)"
  ).run(email, "stripe-subscription");

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

// POST /webhooks/subscription-updated
// Called on customer.subscription.created / updated
router.post("/subscription-updated", (req, res) => {
  const { subscriptionId, customerId, status, currentPeriodEnd, cancelAtPeriodEnd, priceId } = req.body;

  if (!subscriptionId) {
    return res.status(400).json({ error: "Missing subscriptionId" });
  }

  console.log(`[webhook] Subscription updated: ${subscriptionId} status=${status} cancelAtEnd=${cancelAtPeriodEnd}`);

  // Find user by stripe_subscription_id or stripe_customer_id
  const user = db.prepare(
    "SELECT id FROM users WHERE stripe_subscription_id = ? OR stripe_customer_id = ?"
  ).get(subscriptionId, customerId);

  if (!user) {
    console.log(`[webhook] subscription-updated: no user found for sub=${subscriptionId} cust=${customerId}`);
    return res.json({ ok: true, skipped: true });
  }

  const isPro = ["active", "trialing"].includes(status);

  db.prepare(
    `UPDATE users SET
      tier = ?,
      subscription_status = ?,
      stripe_customer_id = ?,
      stripe_subscription_id = ?,
      subscription_current_period_end = ?,
      subscription_cancel_at_period_end = ?,
      pro_expires_at = ?
    WHERE id = ?`
  ).run(
    isPro ? "pro" : "free",
    status,
    customerId || null,
    subscriptionId,
    currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    cancelAtPeriodEnd ? 1 : 0,
    currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    user.id
  );

  console.log(`[webhook] subscription-updated: user=${user.id} status=${status} pro=${isPro}`);
  return res.json({ ok: true });
});

// POST /webhooks/subscription-cancelled
// Called on customer.subscription.deleted
router.post("/subscription-cancelled", (req, res) => {
  const { subscriptionId, customerId } = req.body;

  console.log(`[webhook] Subscription cancelled: ${subscriptionId}`);

  const user = db.prepare(
    "SELECT id FROM users WHERE stripe_subscription_id = ? OR stripe_customer_id = ?"
  ).get(subscriptionId, customerId);

  if (!user) {
    console.log(`[webhook] subscription-cancelled: no user found for sub=${subscriptionId}`);
    return res.json({ ok: true, skipped: true });
  }

  db.prepare(
    `UPDATE users SET
      tier = 'free',
      subscription_status = 'cancelled',
      subscription_cancel_at_period_end = 1
    WHERE id = ?`
  ).run(user.id);

  console.log(`[webhook] subscription-cancelled: user=${user.id}`);
  return res.json({ ok: true });
});

module.exports = router;
