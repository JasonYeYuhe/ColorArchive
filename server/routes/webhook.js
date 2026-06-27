const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const db = require("../db");
const { findCatalogProduct, getDownloadUrl, getPackUrl } = require("../catalog");
const { sendOrderConfirmationEmail, sendProSubscriptionEmail, sendPreorderConfirmationEmail } = require("../email");

// Pack id used for the Accessibility Auditor pre-order (a not-yet-shipped
// product with no download). The Next.js LS webhook forwarder tags real
// pre-order payments with this id; everything keyed on it gets pre-order
// treatment (no download link, a dedicated confirmation mail).
const PREORDER_PACK_ID = "preorder-auditor";
const { constantTimeEqual } = require("../constant-time-eq");

const RAW_LOG_FILE = path.join(__dirname, "..", ".ls-event-log.jsonl");
const RAW_LOG_MAX_ENTRIES = 50;

const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET || "";
// Minimum secret strength. A misconfigured short secret is nearly as
// dangerous as no secret at all; fail-closed here rather than accept
// whitespace or placeholder values.
const MIN_SECRET_LENGTH = 16;

/** Verify requests come from our own Next.js webhook forwarder.
 *  Fail-closed in all environments. Previously a dev-mode branch
 *  allowed unauthenticated requests when INTERNAL_SECRET was unset —
 *  that branch was silently shipping to prod because NODE_ENV also
 *  wasn't set, allowing anonymous fraudulent Pro activations
 *  (2026-04-17 incident, docs/ls-commerce-validation-2026-04-17.md).
 */
function verifyInternal(req, res, next) {
  if (!INTERNAL_SECRET || INTERNAL_SECRET.length < MIN_SECRET_LENGTH) {
    console.error(
      "[webhook] INTERNAL_WEBHOOK_SECRET missing or too short — refusing to serve"
    );
    return res.status(500).json({ error: "Server misconfiguration" });
  }
  // req.headers can return a string | string[]; coerce to a single string
  // so Buffer.from() never throws on an array and the comparison helper
  // gets well-typed input.
  const raw = req.headers["x-internal-secret"];
  const provided = Array.isArray(raw) ? raw[0] || "" : raw || "";
  if (!constantTimeEqual(provided, INTERNAL_SECRET)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(verifyInternal);

// POST /webhooks/order-completed
// Called by Next.js webhook route after Stripe checkout.session.completed
router.post("/order-completed", async (req, res) => {
  const { sessionId, email, packId, amountTotal, currency, paymentIntent, attributedSource } = req.body;

  if (!email || !packId) {
    return res.status(400).json({ error: "Missing email or packId" });
  }

  const provider = req.body.provider || "stripe";
  // Idempotency key. The Next webhook forwarder passes the real Lemon Squeezy
  // order id as paymentIntent, so LS retries of the same event de-dupe here.
  const orderId = paymentIntent || `${provider}_${sessionId}` || `${provider}_${Date.now()}`;
  const isTest = req.body.testMode ? 1 : 0;
  const isPreorder = packId === PREORDER_PACK_ID;

  const catalogProduct = findCatalogProduct(packId);
  const productName = isPreorder
    ? "ColorArchive Accessibility Auditor (Pre-order)"
    : catalogProduct?.title || packId;
  // A pre-order has no shippable download yet — never synthesize a /packs link
  // for it (that mail would dead-end the buyer). Real packs keep the fallback.
  const downloadUrl = isPreorder
    ? null
    : getDownloadUrl(packId) || `${process.env.FRONTEND_ORIGIN || "https://colorarchive.org"}/packs`;

  // Check for duplicate
  const existing = db.prepare("SELECT id FROM orders WHERE order_id = ?").get(orderId);
  if (existing) {
    console.log(`[webhook] Duplicate order skipped: ${orderId}`);
    return res.json({ ok: true, duplicate: true });
  }

  // Look up subscriber attribution (reverse-lookup from a prior email signup).
  const subscriberAttribution = db
    .prepare(
      "SELECT source, utm_source, utm_medium, utm_campaign, utm_term, utm_content, landing_path FROM subscribers WHERE lower(email) = lower(?)"
    )
    .get(email);
  // Prefer an explicit attributed_source from the payload (the pre-order forwarder
  // sends 'preorder') so the order carries the right channel even when the buyer
  // never left an email first; fall back to the subscriber reverse-lookup.
  const resolvedSource = attributedSource || subscriberAttribution?.source || null;

  // Insert order with attribution. A DB failure here must NOT 200 — returning
  // non-2xx makes the Next forwarder (and Lemon Squeezy) retry, and the
  // duplicate guard above keeps the retry idempotent. Silently dropping a paid
  // order is the exact failure this loop is meant to fix.
  try {
    db.prepare(
      `INSERT OR IGNORE INTO orders (
        order_id, email, product, amount, currency, pack_id,
        download_url, stripe_session_id, payment_intent, is_test,
        attributed_source, attributed_utm_source, attributed_utm_medium,
        attributed_utm_campaign, attributed_utm_term, attributed_utm_content,
        attributed_landing_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      isTest,
      resolvedSource,
      subscriberAttribution?.utm_source || null,
      subscriberAttribution?.utm_medium || null,
      subscriberAttribution?.utm_campaign || null,
      subscriberAttribution?.utm_term || null,
      subscriberAttribution?.utm_content || null,
      subscriberAttribution?.landing_path || null
    );

    // Add buyer to subscribers if not already (OR IGNORE preserves a prior
    // source='preorder' row so the gate's secondary numerator still counts them).
    db.prepare(
      "INSERT OR IGNORE INTO subscribers (email, source, is_test) VALUES (?, ?, ?)"
    ).run(email, `${provider}-purchase`, isTest);
  } catch (err) {
    console.error("[webhook] DB error (order):", err);
    return res.status(500).json({ error: "Failed to record order" });
  }

  console.log(`[webhook] Order recorded: ${orderId} — ${productName} for ${email} (test=${isTest})`);

  // Send confirmation email. Pre-orders get a dedicated "reservation confirmed"
  // mail (no download), not the generic "your download is ready" template.
  try {
    if (isPreorder) {
      await sendPreorderConfirmationEmail(email, {
        productName,
        orderId,
        amount: amountTotal,
        currency: currency || "jpy",
        isTest: Boolean(isTest),
      });
    } else {
      await sendOrderConfirmationEmail(email, {
        productName,
        downloadUrl,
        orderId,
        amount: amountTotal,
        currency: currency || "jpy",
      });
    }
    console.log(`[webhook] Confirmation email sent to ${email}`);
  } catch (err) {
    console.error(`[webhook] Failed to send email to ${email}:`, err);
  }

  return res.json({ ok: true });
});

// POST /webhooks/subscription-checkout
// Called after a subscription checkout completes
router.post("/subscription-checkout", async (req, res) => {
  const { sessionId, email, plan, subscriptionId, provider, customerId, amount, currency, testMode, cardFingerprint } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const paymentProvider = provider || "stripe";
  const isTest = testMode ? 1 : 0;
  const fingerprint = typeof cardFingerprint === "string" && cardFingerprint.length > 2 ? cardFingerprint : null;
  const providerCustomerId =
    typeof customerId === "string" && customerId.length > 0 ? customerId : null;
  console.log(
    `[webhook] Subscription checkout: ${plan} for ${email} (sub=${subscriptionId}, provider=${paymentProvider}, test=${isTest}, fp=${fingerprint || "none"})`
  );

  // Find or create user, activate pro
  let user = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email);
  if (!user) {
    db.prepare("INSERT INTO users (email, is_test) VALUES (?, ?)").run(email, isTest);
    user = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email);
  }

  // Duplicate detection — look for OTHER users currently on Pro with
  // the same card fingerprint. Soft-flag only (never rejects the
  // checkout); operator reviews flagged pairs via admin dashboard.
  // Intentionally no time window: a returning customer whose account
  // is old but subscription is new should still trip the flag. The
  // `tier='pro'` filter plus the admin-side cancellation check are
  // what keeps the list current, not an artificial age limit.
  //
  // Known blind spots (Gemini P1 review, 2026-04-18):
  //   - Virtual card services (Privacy.com, Apple Card, Revolut) mint
  //     unique PANs per merchant → last-four differs → bypass.
  //   - Two genuinely different physical cards → bypass.
  // This is a cheap net for casual abuse, not a shield.
  let duplicateSuspects = [];
  let isDuplicate = 0;
  if (fingerprint && user) {
    duplicateSuspects = db.prepare(
      `SELECT id, email FROM users
       WHERE card_fingerprint = ?
         AND id != ?
         AND tier = 'pro'`
    ).all(fingerprint, user.id);
    if (duplicateSuspects.length > 0) {
      isDuplicate = 1;
      console.warn(
        `[webhook] Duplicate-subscription suspicion: user=${user.id} (${email}) shares card ${fingerprint} with ${duplicateSuspects.length} other pro user(s):`,
        duplicateSuspects.map((s) => `${s.id}/${s.email}`).join(", ")
      );
    }
  }

  if (user) {
    db.prepare(
      `UPDATE users SET
        tier = 'pro',
        subscription_plan = ?,
        stripe_subscription_id = ?,
        payment_provider = ?,
        provider_subscription_id = ?,
        provider_customer_id = COALESCE(?, provider_customer_id),
        is_test = ?,
        card_fingerprint = COALESCE(?, card_fingerprint),
        is_duplicate = ?,
        duplicate_suspects = ?
      WHERE id = ?`
    ).run(
      plan || "monthly",
      subscriptionId || null,
      paymentProvider,
      subscriptionId || null,
      providerCustomerId,
      isTest,
      fingerprint,
      isDuplicate,
      duplicateSuspects.length > 0 ? JSON.stringify(duplicateSuspects.map((s) => s.id)) : null,
      user.id,
    );
    console.log(`[webhook] User ${email} upgraded to pro via ${paymentProvider} (customer=${providerCustomerId || "n/a"})`);
  }

  // Add to subscribers (tagged with is_test so subscriber-growth metrics can filter)
  db.prepare(
    "INSERT OR IGNORE INTO subscribers (email, source, is_test) VALUES (?, ?, ?)"
  ).run(email, `${paymentProvider}-subscription`, isTest);

  // Record as order for tracking
  const orderId = subscriptionId || sessionId || `sub_${Date.now()}`;
  const existing = db.prepare("SELECT id FROM orders WHERE order_id = ?").get(orderId);
  if (!existing) {
    db.prepare(
      `INSERT INTO orders (order_id, email, product, amount, currency, pack_id, is_test)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderId,
      email,
      `Pro ${plan}`,
      amount || 0,
      (currency || "JPY").toLowerCase(),
      `pro-${plan}`,
      isTest,
    );
  }

  // Send receipt email. Pre-fix LS commerce silently skipped this — only
  // the legacy Stripe one-time pack path called it. For a SaaS purchase
  // the receipt is simpler (no download link).
  try {
    await sendProSubscriptionEmail(email, {
      plan: plan || "monthly",
      orderId,
      amount: amount || null,
      currency: currency || "JPY",
      isTest: Boolean(testMode),
    });
    console.log(`[webhook] Pro subscription email sent to ${email}`);
  } catch (err) {
    console.error(`[webhook] Failed to send Pro email to ${email}:`, err?.message || err);
    // Fall through with 200 — the DB state is the source of truth; LS
    // should not retry just because our outbound SMTP blipped.
  }

  return res.json({ ok: true });
});

// POST /webhooks/subscription-updated
// Called on customer.subscription.created / updated
router.post("/subscription-updated", (req, res) => {
  const {
    subscriptionId,
    customerId,
    status,
    currentPeriodEnd,      // legacy Stripe name (unix seconds)
    cancelAtPeriodEnd,     // legacy Stripe name (boolean)
    renewsAt,              // Lemon Squeezy name (ISO string)
    endsAt,                // Lemon Squeezy name (ISO string, null when not cancelling)
    priceId,
  } = req.body;

  if (!subscriptionId) {
    return res.status(400).json({ error: "Missing subscriptionId" });
  }

  // Normalise across the two provider shapes. LS sends renewsAt/endsAt
  // as ISO strings; the legacy Stripe path sends unix-seconds numbers.
  // Pre-fix, the LS route.ts handler forwarded renewsAt/endsAt but
  // Express only consumed currentPeriodEnd/cancelAtPeriodEnd — every
  // LS update was silently dropping the period/cancel fields.
  const periodEndIso = renewsAt
    ? new Date(renewsAt).toISOString()
    : currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null;
  const cancelAtEnd = endsAt
    ? 1
    : cancelAtPeriodEnd
      ? 1
      : 0;

  console.log(
    `[webhook] Subscription updated: ${subscriptionId} status=${status} cancelAtEnd=${cancelAtEnd} period=${periodEndIso}`
  );

  // Find user by any provider subscription id / customer id
  const user = db.prepare(
    `SELECT id FROM users
     WHERE stripe_subscription_id = ?
        OR provider_subscription_id = ?
        OR stripe_customer_id = ?
        OR provider_customer_id = ?`
  ).get(subscriptionId, subscriptionId, customerId, customerId);

  if (!user) {
    console.log(`[webhook] subscription-updated: no user found for sub=${subscriptionId} cust=${customerId}`);
    return res.json({ ok: true, skipped: true });
  }

  const isPro = ["active", "trialing", "on_trial", "past_due"].includes(status);

  db.prepare(
    `UPDATE users SET
      tier = ?,
      subscription_status = ?,
      stripe_customer_id = ?,
      stripe_subscription_id = ?,
      provider_subscription_id = COALESCE(?, provider_subscription_id),
      provider_customer_id = COALESCE(?, provider_customer_id),
      subscription_current_period_end = ?,
      subscription_cancel_at_period_end = ?,
      pro_expires_at = ?
    WHERE id = ?`
  ).run(
    isPro ? "pro" : "free",
    status,
    customerId || null,
    subscriptionId,
    subscriptionId || null,
    customerId || null,
    periodEndIso,
    cancelAtEnd,
    periodEndIso,
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

/**
 * POST /webhooks/raw-log
 * Capture raw LS payloads (forwarded by the Next.js route.ts handler)
 * so the Phase B validator script can replay a REAL payload instead
 * of a synthetic model. Rolling JSONL, last N entries; oldest pruned.
 * Bearer-equivalent protected by the same INTERNAL secret as the
 * rest of /webhooks.
 */
router.post("/raw-log", (req, res) => {
  const entry = {
    at: new Date().toISOString(),
    event_name: req.body?.event_name || "unknown",
    test_mode: Boolean(req.body?.test_mode),
    raw: typeof req.body?.raw === "string" ? req.body.raw : JSON.stringify(req.body?.raw || {}),
  };
  try {
    let lines = [];
    if (fs.existsSync(RAW_LOG_FILE)) {
      lines = fs.readFileSync(RAW_LOG_FILE, "utf8").split("\n").filter(Boolean);
    }
    lines.push(JSON.stringify(entry));
    if (lines.length > RAW_LOG_MAX_ENTRIES) {
      lines = lines.slice(lines.length - RAW_LOG_MAX_ENTRIES);
    }
    fs.writeFileSync(RAW_LOG_FILE, lines.join("\n") + "\n", { encoding: "utf8", mode: 0o600 });
  } catch (err) {
    console.error("[webhook] raw-log write failed:", err.message);
  }
  return res.json({ ok: true });
});

module.exports = router;
