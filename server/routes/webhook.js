const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const db = require("../db");
const { hasLifetimeEntitlement } = require("../lifetime");
const { moneyWasReturned } = require("../refund-guard");
const { hasOwnLsSubscription, lemonSqueezyClockMs, appStoreClockMs, latestIso } = require("../subscription-clock");
const { applyRenewalGrace } = require("../renewal-grace");
const { findCatalogProduct, getDownloadUrl, getPackUrl } = require("../catalog");
const { sendOrderConfirmationEmail, sendProSubscriptionEmail, sendPreorderConfirmationEmail } = require("../email");

// Pack id used for the Accessibility Auditor pre-order (a not-yet-shipped
// product with no download). The Next.js LS webhook forwarder tags real
// pre-order payments with this id; everything keyed on it gets pre-order
// treatment (no download link, a dedicated confirmation mail).
const PREORDER_PACK_ID = "preorder-auditor";
const { constantTimeEqual } = require("../constant-time-eq");
const { resolveCancellation, resolveSubscriptionUpdate, ACTIVE_STATUSES, renewalExpiry } = require("../entitlement");

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
  // Lemon Squeezy ships `total` in MINOR units (JPY x100), and the forwarder passes
  // it through untouched. The `amount` column holds MAJOR units everywhere else —
  // /subscription-payment divides by 100 — so writing the raw value here stored a
  // ¥4,999 pre-order as 499900: shown in /admin as ¥499,900 and emailed to the
  // buyer as a ¥499,900 receipt, with nothing to reconcile it afterwards.
  const amountMajor = typeof amountTotal === "number" ? Math.round(amountTotal / 100) : 0;

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
  // order is the exact failure this loop is meant to fix. The two writes run in
  // one transaction so the order row + the buyer-subscriber row commit together
  // or both roll back — never a half-recorded payment.
  try {
    db.transaction(() => {
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
      amountMajor,
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
    })();
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
        amount: amountMajor,
        currency: currency || "jpy",
        isTest: Boolean(isTest),
      });
    } else {
      await sendOrderConfirmationEmail(email, {
        productName,
        downloadUrl,
        orderId,
        amount: amountMajor,
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
  const { sessionId, email, plan, subscriptionId, provider, customerId, amount, currency, testMode, cardFingerprint, status, trialEndsAt, renewsAt } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const paymentProvider = provider || "stripe";
  const isTest = testMode ? 1 : 0;
  const fingerprint = typeof cardFingerprint === "string" && cardFingerprint.length > 2 ? cardFingerprint : null;
  const providerCustomerId =
    typeof customerId === "string" && customerId.length > 0 ? customerId : null;

  // Entitlement clock (closes the failure-open hole where pro_expires_at stayed
  // NULL forever and auth.js therefore never expired the tier). Lifetime plans
  // legitimately have no expiry; subscriptions get trial end / next renewal +
  // 3-day grace, mirroring the Apple path. Fallback: 35 days for a monthly-ish
  // cycle so even a payload missing both timestamps is never unbounded.
  let proExpiresAt = null;
  if (plan !== "lifetime") {
    const anchor = trialEndsAt || renewsAt;
    const base = anchor ? new Date(anchor) : null;
    const d = base && !Number.isNaN(base.getTime()) ? base : new Date(Date.now() + 32 * 86400000);
    d.setDate(d.getDate() + 3); // grace
    proExpiresAt = d.toISOString();
  }
  const subscriptionStatus = typeof status === "string" && status.length > 0 ? status : "active";
  // The provider's next charge date. Until 2026-09-24 this handler never wrote it, so
  // a new subscription — every trial in particular — sat with the column NULL until
  // its first subscription_updated, invisible to the digest's overdue tripwire and to
  // renewal-grace, which both key on it. NULL here means "leave whatever is there".
  const renewsMs = Date.parse(typeof renewsAt === "string" ? renewsAt : "");
  const periodEnd = Number.isFinite(renewsMs) ? new Date(renewsMs).toISOString() : null;
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

  // A lifetime order_created re-delivered AFTER that order was refunded (an LS retry
  // of a failed delivery, or a dashboard resend) must not grant it again: that made
  // the account Pro forever on returned money (round 8, pre-existing).
  if (plan === "lifetime") {
    const lifetimeOrderId = subscriptionId || sessionId;
    const prior = lifetimeOrderId ? db.prepare("SELECT refunded FROM orders WHERE order_id = ?").get(lifetimeOrderId) : null;
    if (prior && prior.refunded) {
      console.log(`[webhook] Subscription checkout: lifetime ${lifetimeOrderId} was already refunded — not granted again`);
      return res.json({ ok: true, alreadyRefunded: true });
    }
  }

  if (user) {
    // A lifetime holder who starts (or restarts) a subscription must keep both
    // halves of the marker: pro_expires_at = NULL, and subscription_plan =
    // 'lifetime' — the latter because it is the ONLY record of a MANUAL lifetime
    // grant, which has no order row for hasLifetimeEntitlement() to find.
    const holdsLifetime = hasLifetimeEntitlement(db, user.id);
    // Keep the plan marker only where it already IS the marker. Deriving it from the
    // guard wrote 'lifetime' for anyone holding an App Store lifetime too, and that
    // manual-grant marker then outlived the App Store purchase's refund (2026-09-17).
    const { subscription_plan: currentPlan, payment_provider: currentProvider } = db
      .prepare("SELECT subscription_plan, payment_provider FROM users WHERE id = ?")
      .get(user.id);
    // A LIFETIME purchase is not a subscription. On a row that already carries one
    // (Lemon Squeezy or App Store — payment_provider is set), it must not overwrite
    // that subscription's status, provider or ids: it used to write status 'active',
    // provider 'lemonsqueezy' and its synthetic `lifetime_<id>` over them, after which
    // nothing could tell a live subscription from a cancelled, expired or refunded
    // one. Five review rounds on 2026-09-24/25 each found another way that let a
    // refunded lifetime hand access back or take a paid month away; all of them
    // started here. The lifetime is recorded by its order row and a NULL clock.
    const lifetimeOnExistingSubscription = plan === "lifetime" && Boolean(currentProvider);
    // subscription_plan = 'lifetime' is the ONLY record of a MANUAL lifetime grant, so
    // a new subscription keeps it — but only then. A PURCHASED lifetime is recorded by
    // its order row; keeping 'lifetime' over a real subscription's plan filed that
    // subscription's later yearly renewals as monthly with a 35-day horizon (round 8).
    const manualLifetimeMarker = currentPlan === "lifetime" && !hasPurchasedLifetime(db, user.id);
    db.prepare(
      `UPDATE users SET
        tier = 'pro',
        subscription_plan = CASE WHEN ? THEN subscription_plan ELSE ? END,
        subscription_status = CASE WHEN ? THEN subscription_status ELSE ? END,
        pro_expires_at = ?,
        subscription_current_period_end = COALESCE(?, subscription_current_period_end),
        stripe_subscription_id = CASE WHEN ? THEN stripe_subscription_id ELSE ? END,
        payment_provider = CASE WHEN ? THEN payment_provider ELSE ? END,
        provider_subscription_id = CASE WHEN ? THEN provider_subscription_id ELSE ? END,
        provider_customer_id = COALESCE(?, provider_customer_id),
        is_test = ?,
        card_fingerprint = COALESCE(?, card_fingerprint),
        is_duplicate = ?,
        duplicate_suspects = ?
      WHERE id = ?`
    ).run(
      lifetimeOnExistingSubscription ? 1 : 0,
      holdsLifetime && manualLifetimeMarker ? "lifetime" : plan || "monthly",
      lifetimeOnExistingSubscription ? 1 : 0,
      subscriptionStatus,
      holdsLifetime ? null : proExpiresAt,
      periodEnd,
      lifetimeOnExistingSubscription ? 1 : 0,
      subscriptionId || null,
      lifetimeOnExistingSubscription ? 1 : 0,
      paymentProvider,
      lifetimeOnExistingSubscription ? 1 : 0,
      subscriptionId || null,
      providerCustomerId,
      isTest,
      fingerprint,
      isDuplicate,
      duplicateSuspects.length > 0 ? JSON.stringify(duplicateSuspects.map((s) => s.id)) : null,
      user.id,
    );
    console.log(`[webhook] User ${email} upgraded to pro via ${paymentProvider} (customer=${providerCustomerId || "n/a"}, status=${subscriptionStatus}, expires=${proExpiresAt || "never"})`);
  }

  // Add to subscribers (tagged with is_test so subscriber-growth metrics can filter)
  db.prepare(
    "INSERT OR IGNORE INTO subscribers (email, source, is_test) VALUES (?, ?, ?)"
  ).run(email, `${paymentProvider}-subscription`, isTest);

  // Hoisted out of the lifetime block on 2026-08-18. Both were declared with
  // `const` INSIDE `if (plan === "lifetime")` while the receipt call below
  // referenced `orderId` from outside it — so evaluating the receipt's argument
  // object threw ReferenceError on EVERY plan, lifetime included (the block has
  // already closed by then). The throw landed in the try/catch below, was
  // logged as "Failed to send Pro email", and the route still returned 200:
  // no Pro subscriber has ever received a receipt, and nothing ever alarmed.
  const orderId = subscriptionId || sessionId || `sub_${Date.now()}`;
  // LS sends minor units (JPY ×100). The DB row was already storing the divided
  // value while the receipt was handed the raw one — and email.js prints JPY
  // unscaled, so a ¥19,999 lifetime purchase would have rendered ¥1,999,900.
  // Same asymmetry as the $3.47→$0.03 bug: exactly one side divides.
  const normalizedAmount =
    paymentProvider === "lemonsqueezy" && typeof amount === "number"
      ? Math.round(amount / 100)
      : amount || 0;

  // Record an order row ONLY for lifetime (a real one-off charge). Recurring
  // subscriptions get their money rows from /webhooks/subscription-payment —
  // the subscription_created payload carries no amount, so inserting here used
  // to materialize every trial as a phantom ¥0 "order" that polluted the gate
  // and revenue reports.
  if (plan === "lifetime") {
    const existing = db.prepare("SELECT id FROM orders WHERE order_id = ?").get(orderId);
    if (!existing) {
      db.prepare(
        `INSERT INTO orders (order_id, email, product, amount, currency, pack_id, is_test)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        orderId,
        email,
        `Pro ${plan}`,
        normalizedAmount,
        (currency || "JPY").toLowerCase(),
        `pro-${plan}`,
        isTest,
      );
    }
  }

  // Send receipt email. Pre-fix LS commerce silently skipped this — only
  // the legacy Stripe one-time pack path called it. For a SaaS purchase
  // the receipt is simpler (no download link).
  try {
    await sendProSubscriptionEmail(email, {
      plan: plan || "monthly",
      orderId,
      amount: normalizedAmount || null,
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
    updatedAt,             // Lemon Squeezy attributes.updated_at — event ordering
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

  // "cancelled" is NOT "access ends now" — see ../entitlement.js. This event
  // races subscription_cancelled for the same subscription, so both paths go
  // through the same resolver or the customer's expiry date would depend on
  // which webhook happened to land second.
  const decision = resolveSubscriptionUpdate({ status, periodEndIso });
  const isPro = decision.isPro;

  // Lemon Squeezy fires subscription_updated alongside EVERY cancellation, so this
  // is a second door onto the same users row as /subscription-cancelled. Guarding
  // only the cancellation handler would leave the lifetime wipe fully reachable
  // through here. See server/lifetime.js.
  if (isStaleProviderEvent(db, user.id, updatedAt)) {
    console.log(`[webhook] subscription-updated: IGNORED stale event for user=${user.id} (updated_at ${updatedAt} is older than the last one applied)`);
    return res.json({ ok: true, stale: true });
  }

  const keepsLifetime = hasLifetimeEntitlement(db, user.id);

  // Only the CANCELLATION shape consults the refund guard. A live subscription must
  // still be able to restore access — somebody refunded once and subscribing again is
  // a paying customer, and their new checkout is what grants it.
  const cancelledShape = ["cancelled", "canceled"].includes(String(status || "").toLowerCase());
  const refunded = cancelledShape && moneyWasReturned(db, user.id);

  // While the provider says the subscription is ALIVE, neither clock may move
  // backwards. This is the second half of the stale-event defence: it also covers a
  // resend that carries no updated_at at all.
  const current = db
    .prepare("SELECT subscription_current_period_end AS cpe, pro_expires_at AS pea FROM users WHERE id = ?")
    .get(user.id) || {};
  const alive = isPro && !cancelledShape;
  const writePeriodEnd = alive ? laterIso(periodEndIso, current.cpe) : periodEndIso;
  const writeProExpiresAt = alive ? laterIso(decision.proExpiresAt, current.pea) : decision.proExpiresAt;

  if (keepsLifetime || refunded) {
    db.prepare(
      `UPDATE users SET
        subscription_status = ?,
        stripe_customer_id = ?,
        stripe_subscription_id = ?,
        provider_subscription_id = COALESCE(?, provider_subscription_id),
        provider_customer_id = COALESCE(?, provider_customer_id),
        subscription_current_period_end = ?,
        subscription_cancel_at_period_end = ?
      WHERE id = ?`
    ).run(
      status,
      customerId || null,
      subscriptionId,
      subscriptionId || null,
      customerId || null,
      writePeriodEnd,
      cancelAtEnd,
      user.id
    );
  } else {
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
      writePeriodEnd,
      cancelAtEnd,
      writeProExpiresAt,
      user.id
    );
  }
  rememberProviderEvent(db, user.id, updatedAt);

  console.log(`[webhook] subscription-updated: user=${user.id} status=${status} pro=${keepsLifetime ? true : refunded ? "unchanged (money already returned)" : isPro}${keepsLifetime ? " (lifetime held)" : ""}`);
  return res.json({ ok: true });
});

// Shared four-column subscriber lookup — LS ids live in the provider_* columns
// (and are mirrored into the legacy stripe_* ones by subscription-checkout, but
// never rely on that mirroring alone).
/**
 * Lemon Squeezy emits a subscription_updated carrying a STALE renews_at within a
 * second of each renewal, then a corrected one about a minute later (observed on
 * this store's 07-22 and 08-22 renewals). It also retries failed deliveries at 5s,
 * 25s and 125s, and its dashboard can resend one by hand. So the corrected event can
 * land BEFORE the stale one, and the stale one then rewrote a paid subscriber's clock
 * to now+3d — locking them out three days later, with a payment replay unable to fix
 * it. These two keep the newest provider timestamp we have seen and drop anything
 * older. No timestamp on the event (legacy Stripe shape) means no opinion.
 */
function isStaleProviderEvent(db, userId, updatedAt) {
  if (!updatedAt) return false;
  try {
    const row = db.prepare("SELECT provider_event_at FROM users WHERE id = ?").get(userId);
    const seen = row && row.provider_event_at ? Date.parse(row.provider_event_at) : NaN;
    const incoming = Date.parse(updatedAt);
    return Number.isFinite(seen) && Number.isFinite(incoming) && incoming < seen;
  } catch {
    return false;
  }
}

function rememberProviderEvent(db, userId, updatedAt) {
  if (!updatedAt) return;
  try {
    db.prepare(
      `UPDATE users SET provider_event_at = ?
        WHERE id = ? AND (provider_event_at IS NULL OR provider_event_at < ?)`,
    ).run(updatedAt, userId, updatedAt);
  } catch {
    /* bookkeeping only — never block an entitlement write */
  }
}

/** The later of two ISO instants; tolerates null/garbage on either side. */
/**
 * The clock this account would hold if the refunded lifetime had never been bought:
 * the later of what its Lemon Squeezy subscription and its App Store purchases give
 * on their own (server/subscription-clock.js; every rule there is the owning
 * handler's). May be in the past (renewal-grace then treats it like any late
 * renewal); null when nothing on the account gives access.
 */
function clockWithoutLifetime(db, userId) {
  return latestIso(lemonSqueezyClockMs(db, userId), appStoreClockMs(db, userId));
}

/**
 * Did an LS lifetime PURCHASE write this row's 'lifetime' plan marker? Only the LS
 * lifetime checkout writes that marker (an App Store lifetime never does), so the
 * question is whether a real LS lifetime order exists — refunded or not. Counting an
 * App Store lifetime here erased an owner's manual grant marker (round 9).
 */
function hasPurchasedLifetime(db, userId) {
  const row = db.prepare("SELECT email FROM users WHERE id = ?").get(userId);
  if (!row) return false;
  return Boolean(
    db
      .prepare(`SELECT 1 AS yes FROM orders WHERE LOWER(email) = LOWER(?) AND pack_id = 'pro-lifetime' AND COALESCE(is_test, 0) = 0 LIMIT 1`)
      .get(row.email || ""),
  );
}


function laterIso(a, b) {
  const A = Date.parse(a || "");
  const B = Date.parse(b || "");
  if (!Number.isFinite(A)) return b;
  if (!Number.isFinite(B)) return a;
  return A >= B ? a : b;
}

function findSubscriptionUser({ subscriptionId, customerId, email }) {
  let user = null;
  if (subscriptionId) {
    user = db.prepare(
      "SELECT id, email FROM users WHERE stripe_subscription_id = ? OR provider_subscription_id = ?"
    ).get(subscriptionId, subscriptionId);
  }
  if (!user && customerId) {
    user = db.prepare(
      "SELECT id, email FROM users WHERE stripe_customer_id = ? OR provider_customer_id = ?"
    ).get(customerId, customerId);
  }
  if (!user && email) {
    user = db.prepare("SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)").get(email);
  }
  return user;
}

// POST /webhooks/subscription-payment
// A REAL charge: the signup order (order_created with total > 0) or a renewal
// invoice (subscription_payment_success). Writes the money row and extends the
// entitlement clock. Amounts arrive in LS minor units (JPY ×100).
router.post("/subscription-payment", (req, res) => {
  const { email, invoiceId, lsOrderId, subscriptionId, customerId, plan, amountMinor, currency, billingReason, testMode } = req.body;

  const isTest = testMode ? 1 : 0;
  const amount = typeof amountMinor === "number" ? Math.round(amountMinor / 100) : 0;
  const user = findSubscriptionUser({ subscriptionId, customerId, email });
  // NB: the fallback deliberately refuses to inherit "lifetime". A lifetime buyer
  // who still has a monthly subscription carries subscription_plan='lifetime' on
  // their user row, and app/api/webhook/route.ts sends no `plan` for
  // subscription_payment_success — so the old fallback filed their ¥499 renewal as
  // pack_id='pro-lifetime'. That both misreported revenue and, because
  // hasLifetimeEntitlement() counts UNREFUNDED pro-lifetime orders, meant refunding
  // the real ¥19,999 purchase no longer revoked anything: the phantom renewal row
  // kept the guard true. This route only ever handles subscription invoices.
  const inheritedPlan = user
    ? db.prepare("SELECT subscription_plan FROM users WHERE id = ?").get(user.id)?.subscription_plan
    : null;
  const resolvedPlan = plan || (inheritedPlan === "lifetime" ? null : inheritedPlan) || "monthly";

  // ¥0 initial order = free-trial signup, not money. Never materialize it as an
  // order row (that phantom was exactly what confused the gate metrics).
  if (amount <= 0) {
    console.log(`[webhook] subscription-payment: zero-amount ${billingReason || "?"} for ${email || subscriptionId} — no order row`);
    return res.json({ ok: true, trial: true });
  }

  const orderKey = invoiceId ? `lsinv_${invoiceId}` : `lsord_${lsOrderId}`;
  const orderEmail = email || user?.email || "unknown";
  const orderCurrency = (currency || "JPY").toLowerCase();
  let isReplay = false;
  let isDuplicateCharge = false;
  try {
    db.transaction(() => {
      // ONE charge reaches this route TWICE, under two different keys: LS sends
      // order_created (forwarded as lsord_<order id>) and, 1-2 minutes later,
      // subscription_payment_success (forwarded as lsinv_<invoice id>). Verified
      // against the production raw-event log, not assumed: the order payload
      // carries customer_id only, the invoice carries subscription_id +
      // customer_id, and NEITHER carries the other's id — so INSERT OR IGNORE on
      // order_id cannot see they are the same money.
      //
      // Nothing but the ¥0 short-circuit above has been stopping the double
      // count: every order_created in that log has total = 0 because the variant
      // has a free trial. Remove the trial, or ship the yearly plan that charges
      // at checkout, and one signup writes two rows for one charge — doubling
      // revenue in /admin, and leaving a phantom that a refund cannot clear
      // because subscription-revoke flags a single key.
      const twinLike = orderKey.startsWith("lsinv_") ? "lsord_%" : "lsinv_%";
      // COALESCE(twin_consumed,0) = 0 makes the pairing 1:1. Without it the
      // lookup asks "does an opposite-prefix row exist?" rather than "is THIS
      // charge already paired?", so a single row absorbs every later charge in
      // its window — measured: one lsord_ row swallowed three distinct invoices,
      // leaving one order row for four charges. A lone leg is not exotic: every
      // renewal is one, so a cancel-and-resubscribe at the same price inside 30
      // minutes would have dropped a genuine signup charge.
      const twin = db
        .prepare(
          `SELECT id, order_id FROM orders
            WHERE LOWER(email) = LOWER(?)
              AND amount = ?
              AND currency = ?
              AND order_id LIKE ?
              AND COALESCE(is_test, 0) = ?
              AND COALESCE(twin_consumed, 0) = 0
              AND created_at >= datetime('now', '-30 minutes')
            ORDER BY id
            LIMIT 1`,
        )
        .get(orderEmail, amount, orderCurrency, twinLike, isTest);
      if (twin) {
        // Consume the pairing, and record the key we are suppressing so a refund
        // issued against THAT id can still find the surviving row — otherwise
        // refunding by invoice id flags nothing and the money stays in revenue.
        db.prepare("UPDATE orders SET twin_consumed = 1, twin_order_id = ? WHERE id = ?").run(
          orderKey,
          twin.id,
        );
        isDuplicateCharge = true;
      }

      const inserted = isDuplicateCharge ? { changes: 0 } : db.prepare(
        `INSERT OR IGNORE INTO orders (order_id, email, product, amount, amount_minor, currency, pack_id, payment_intent, is_test)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        orderKey,
        orderEmail,
        `Pro ${resolvedPlan}`,
        amount,
        typeof amountMinor === "number" ? amountMinor : null,
        orderCurrency,
        `pro-${resolvedPlan}`,
        invoiceId || lsOrderId || null,
        isTest,
      );
      // Replay guard: a re-delivered (or maliciously replayed) old invoice hits
      // INSERT OR IGNORE with changes=0 — record nothing AND touch no
      // entitlement, otherwise a replay could resurrect a cancelled/refunded
      // Pro account whose pro_expires_at was NULLed.
      // A suppressed twin is not a replay: the money is real, we simply decline
      // to record it a second time.
      isReplay = !isDuplicateCharge && inserted.changes === 0;
      // Deliberately runs for a suppressed duplicate too. The pairing is INFERRED
      // (the two LS payloads share no identifier), so a wrong match must not be
      // able to leave a customer who was genuinely charged with an unmoved clock —
      // they would expire while paying. Extending twice is harmless because the
      // CASE below never shortens.
      if (user && !isReplay) {
        // Extend the clock generously; the follow-up subscription_updated event
        // snaps it to the exact renews_at. Never SHORTEN an existing expiry.
        const horizonDays = resolvedPlan === "yearly" ? 370 : 35;
        const candidate = new Date(Date.now() + horizonDays * 86400000).toISOString();
        // The guard has to run BEFORE the CASE below, not inside it. A lifetime
        // purchase is stored as pro_expires_at = NULL, and the CASE reads NULL as
        // "no expiry set yet" — so for a lifetime holder whose monthly subscription
        // renews once, "forever" silently became now+35d. They then cancel the
        // monthly (which correctly holds the tier but never restores the NULL) and
        // 35 days later effectiveTier() expires a ¥19,999 customer.
        if (hasLifetimeEntitlement(db, user.id)) {
          db.prepare(
            `UPDATE users SET tier = 'pro', subscription_status = 'active', pro_expires_at = NULL WHERE id = ?`
          ).run(user.id);
        } else {
          db.prepare(
            `UPDATE users SET
              tier = 'pro',
              subscription_status = 'active',
              pro_expires_at = CASE
                WHEN pro_expires_at IS NULL OR pro_expires_at < ? THEN ?
                ELSE pro_expires_at
              END
            WHERE id = ?`
          ).run(candidate, candidate, user.id);
        }
      }
    })();
  } catch (err) {
    console.error(`[webhook] subscription-payment DB error:`, err?.message || err);
    return res.status(500).json({ error: "db" });
  }

  console.log(
    `[webhook] subscription-payment: ${orderKey} ¥${amount} ${billingReason || ""} user=${user?.id ?? "unmatched"}` +
      `${isReplay ? " (replay — ignored)" : ""}${isDuplicateCharge ? " (same charge already recorded under the twin key — ignored)" : ""}`,
  );
  return res.json({ ok: true, replay: isReplay, duplicateCharge: isDuplicateCharge });
});

// POST /webhooks/subscription-revoke
// Refund / chargeback / dispute: money went back, so Pro goes away and the
// order rows are flagged out of every revenue metric.
router.post("/subscription-revoke", (req, res) => {
  const { email, reason, lsId, subscriptionId, customerId } = req.body;

  const user = findSubscriptionUser({ subscriptionId, customerId, email });
  let downgraded = false;
  // A refund already applied to the lifetime order (LS retry, dashboard resend, a
  // second partial refund) changes nothing more: re-running it rewound whatever
  // renewal-grace or the subscription had done since (round 8).
  const alreadyRefundedLifetime = lsId
    ? db.prepare("SELECT refunded FROM orders WHERE order_id = ? AND pack_id = 'pro-lifetime'").get(`lifetime_${lsId}`)
    : null;
  if (alreadyRefundedLifetime && alreadyRefundedLifetime.refunded) {
    console.log(`[webhook] subscription-revoke: lifetime_${lsId} was already refunded - nothing to do (reason=${reason})`);
    return res.json({ ok: true, downgraded: false, alreadyRefunded: true });
  }
  try {
    db.transaction(() => {
      // Flag ONLY the specific reversed money row (never the whole history —
      // one refunded invoice must not erase prior kept revenue from reports).
      if (lsId) {
        // `lifetime_${lsId}` matters and was missing: a lifetime order is stored
        // with order_id = the synthetic subscription id built in
        // app/api/webhook/route.ts (`lifetime_<LS order id>`), which matches none
        // of the invoice-shaped keys. Without it a refunded lifetime is never
        // flagged, and the lifetime guard below — which counts only NON-refunded
        // orders — would then protect it forever: ¥19,999 back in the customer's
        // pocket and Pro retained for good.
        db.prepare(
          "UPDATE orders SET refunded = 1, refunded_at = datetime('now') "
          // twin_order_id: the key of a charge that was suppressed as a duplicate.
          // A refund quoting THAT id must still flag the surviving row, or the
          // money stays inside COALESCE(refunded,0)=0 revenue forever.
          + "WHERE order_id IN (?, ?, ?, ?) OR payment_intent = ? OR twin_order_id IN (?, ?, ?, ?)"
        ).run(
          `lsinv_${lsId}`, `lsord_${lsId}`, `lifetime_${lsId}`, String(lsId), String(lsId),
          `lsinv_${lsId}`, `lsord_${lsId}`, `lifetime_${lsId}`, String(lsId),
        );
      }

      // Entitlement: order_refunded can be a PACK/pre-order refund found via the
      // email fallback — that must NOT nuke an unrelated active Pro sub. Only
      // downgrade for order_refunded when the refunded order itself is a Pro
      // order; subscription-scoped reasons always downgrade.
      let shouldDowngrade = reason !== "order_refunded";
      if (!shouldDowngrade && lsId) {
        // `lifetime_${lsId}` here too (2026-09-24 review): the flag UPDATE above knew
        // the key, this lookup did not, and the lifetime insert writes no
        // payment_intent — so a refunded lifetime was flagged but never revoked:
        // ¥19,999 returned and Pro kept for good, the exact outcome the comment
        // above says the key was added to prevent. Executed in
        // server/__tests__/lifetime-refund-revoke.test.js.
        const row = db.prepare(
          "SELECT pack_id FROM orders WHERE order_id IN (?, ?, ?, ?) OR payment_intent = ?"
        ).get(`lsinv_${lsId}`, `lsord_${lsId}`, `lifetime_${lsId}`, String(lsId), String(lsId));
        shouldDowngrade = Boolean(row && typeof row.pack_id === "string" && row.pack_id.startsWith("pro-"));
      }
      // Is the refunded order the LIFETIME itself? Then the rule is: the account ends up
      // exactly as it would be had the lifetime never been bought — checked
      // differentially in server/__tests__/lifetime-refund-invariant.test.js.
      const refundedLifetime = Boolean(
        lsId && db.prepare("SELECT 1 AS yes FROM orders WHERE order_id = ? AND pack_id = 'pro-lifetime'").get(`lifetime_${lsId}`)
      );
      if (user && refundedLifetime) {
        // If it was the row's first purchase, its checkout wrote the row's provider,
        // status and subscription ids (recognisable by its own `lifetime_<id>`): put back
        // what the account would hold without it — 'apple' if the App Store ever granted
        // this account, else nothing. This runs whether or not another lifetime still
        // holds access: skipping it when an App Store lifetime was also held left the
        // row claiming a live Lemon Squeezy subscription, so Apple's later REFUND of that
        // lifetime could not revoke it (2026-09-27, round 8).
        const own = db
          .prepare("SELECT provider_subscription_id AS psid, apple_original_transaction_id AS appleTxn FROM users WHERE id = ?")
          .get(user.id);
        if (own && own.psid === `lifetime_${lsId}`) {
          db.prepare(
            `UPDATE users SET payment_provider = ?, subscription_status = NULL,
               provider_subscription_id = NULL, stripe_subscription_id = NULL WHERE id = ?`
          ).run(own.appleTxn ? "apple" : null, user.id);
        }
      }

      // A refund or dispute on a SUBSCRIPTION invoice must not revoke a lifetime
      // purchase that was paid for separately. Refunding the lifetime order
      // itself does revoke it: the UPDATE above sets refunded = 1 on that row
      // first, and hasLifetimeEntitlement() only counts non-refunded ones — so
      // this reads the post-refund state, not the pre-refund state.
      if (user && shouldDowngrade && hasLifetimeEntitlement(db, user.id)) {
        console.log(
          `[webhook] subscription-revoke: user=${user.id} keeps access — lifetime entitlement held (reason=${reason})`
        );
        // The lifetime protects ACCESS, not the subscription's record: when it is a
        // SUBSCRIPTION's money that was returned, still note it on the subscription,
        // exactly as it would be without the lifetime. Never for a refunded lifetime
        // (another lifetime still held): that money was not the subscription's.
        const sub = db.prepare("SELECT payment_provider, provider_subscription_id FROM users WHERE id = ?").get(user.id);
        if (!refundedLifetime && sub && hasOwnLsSubscription(sub)) {
          db.prepare(`UPDATE users SET subscription_status = ? WHERE id = ?`).run(reason || "refunded", user.id);
        }
        shouldDowngrade = false;
      }
      if (user && shouldDowngrade) {
        if (refundedLifetime) {
          const clock = clockWithoutLifetime(db, user.id);
          const live = clock !== null && Date.parse(clock) > Date.now();
          db.prepare(`UPDATE users SET tier = ?, pro_expires_at = ? WHERE id = ?`).run(live ? "pro" : "free", clock, user.id);
          // What renewal-grace's next hourly run would do for this account, now: a late
          // renewal's rebuilt clock may already be past (round 9: up to an hour without
          // access otherwise).
          applyRenewalGrace(db, { userId: user.id });
          console.log(
            `[webhook] subscription-revoke: user=${user.id} lifetime refunded — ${clock ? `access returns to what the account held without it, until ${clock}` : "no other access on the account"} (reason=${reason})`
          );
        } else {
          db.prepare(
            `UPDATE users SET tier = 'free', subscription_status = ?, pro_expires_at = NULL WHERE id = ?`
          ).run(reason || "refunded", user.id);
        }
        downgraded = true;
      }
    })();
  } catch (err) {
    console.error(`[webhook] subscription-revoke DB error:`, err?.message || err);
    return res.status(500).json({ error: "db" });
  }

  console.log(`[webhook] subscription-revoke: reason=${reason} user=${user?.id ?? "unmatched"} downgraded=${downgraded} lsId=${lsId || "-"}`);
  return res.json({ ok: true, downgraded });
});

// POST /webhooks/subscription-cancelled
// Two DIFFERENT provider events land here, told apart only by `reason`:
//   subscription_cancelled → the customer turned off renewal. They keep the
//                            period they already paid for, through `endsAt`.
//   subscription_expired   → reason="expired", the clock ran out. Access ends.
// Treating both as "revoke now" took paid days away from a paying customer
// while /support and /account promised in writing that it would not. The
// decision itself lives in ../entitlement.js so it can be tested.
router.post("/subscription-cancelled", (req, res) => {
  const { subscriptionId, customerId, reason, endsAt, updatedAt } = req.body;

  console.log(`[webhook] Subscription ${reason === "expired" ? "expired" : "cancelled"}: ${subscriptionId} endsAt=${endsAt || "-"}`);

  const user = findSubscriptionUser({ subscriptionId, customerId });

  if (!user) {
    console.log(`[webhook] subscription-cancelled: no user found for sub=${subscriptionId}`);
    return res.json({ ok: true, skipped: true });
  }

  if (isStaleProviderEvent(db, user.id, updatedAt)) {
    console.log(`[webhook] subscription-cancelled: IGNORED stale event for user=${user.id} (updated_at ${updatedAt})`);
    return res.json({ ok: true, stale: true });
  }

  const decision = resolveCancellation({ reason, endsAt });

  // A lifetime purchase must survive a SUBSCRIPTION ending. Both are keyed to the
  // same users row via provider_customer_id, so without this the ordinary upgrade
  // path (buy lifetime, then cancel the monthly you no longer need) revokes the
  // lifetime when the monthly period runs out. See server/lifetime.js.
  const keepsLifetime = hasLifetimeEntitlement(db, user.id);

  // A cancellation must not RESTORE access that a refund already took away. LS sends
  // subscription_cancelled whenever the subscription ends, and resolveCancellation()
  // rebuilds the entitlement from the subscription's dates alone — so refund-then-
  // cancel used to hand Pro back through the end of the refunded period (up to a year
  // on the yearly plan). See server/refund-guard.js.
  const refunded = moneyWasReturned(db, user.id);

  if (keepsLifetime || refunded) {
    // Record the subscription's own bookkeeping, but never its verdict on access.
    db.prepare(
      `UPDATE users SET
        subscription_status = ?,
        subscription_cancel_at_period_end = ?,
        subscription_current_period_end = COALESCE(?, subscription_current_period_end)
      WHERE id = ?`
    ).run(
      decision.subscriptionStatus,
      decision.cancelAtPeriodEnd,
      decision.currentPeriodEnd,
      user.id,
    );
  } else {
    db.prepare(
      `UPDATE users SET
        tier = ?,
        subscription_status = ?,
        subscription_cancel_at_period_end = ?,
        subscription_current_period_end = COALESCE(?, subscription_current_period_end),
        pro_expires_at = ?
      WHERE id = ?`
    ).run(
      decision.tier,
      decision.subscriptionStatus,
      decision.cancelAtPeriodEnd,
      decision.currentPeriodEnd,
      decision.proExpiresAt,
      user.id,
    );
  }

  rememberProviderEvent(db, user.id, updatedAt);
  console.log(
    `[webhook] subscription-cancelled: user=${user.id} tier=${keepsLifetime ? "pro (lifetime held)" : refunded ? "unchanged (money already returned)" : decision.tier} keepsAccess=${keepsLifetime || (!refunded && decision.keepsAccess)} until=${keepsLifetime ? "never" : refunded ? "-" : decision.proExpiresAt || "-"}`
  );
  return res.json({ ok: true, keepsAccess: decision.keepsAccess });
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
