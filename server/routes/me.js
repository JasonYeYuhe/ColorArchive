const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db");
const {
  getUserPreferences,
  requireUser,
  saveUserPreferences,
} = require("../auth");
const { findCatalogProduct, getDownloadUrl, getPackUrl } = require("../catalog");
const { sendOrderConfirmationEmail } = require("../email");

router.use(requireUser);

router.get("/", (req, res) => {
  return res.json({
    user: req.user,
  });
});

router.get("/usage", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const tier = req.user.tier || "free";

  // AI usage today
  const aiRow = db.prepare(
    "SELECT count FROM ai_usage WHERE identifier = ? AND date = ?"
  ).get(`user:${req.user.id}`, today);
  const aiUsed = aiRow ? aiRow.count : 0;
  const aiLimit = tier === "pro" ? null : tier === "free" ? 10 : 3;

  // Project count
  const projectRow = db.prepare(
    "SELECT COUNT(*) as count FROM projects WHERE user_id = ?"
  ).get(req.user.id);
  const projectCount = projectRow ? projectRow.count : 0;
  const projectLimit = tier === "pro" ? null : 3;

  // Favorites count (from user_preferences)
  let favoritesCount = 0;
  try {
    const prefRow = db.prepare(
      "SELECT favorites_json FROM user_preferences WHERE user_id = ?"
    ).get(req.user.id);
    if (prefRow) {
      favoritesCount = JSON.parse(prefRow.favorites_json).length;
    }
  } catch {
    favoritesCount = 0;
  }

  return res.json({
    tier,
    ai: { used: aiUsed, limit: aiLimit },
    projects: { count: projectCount, limit: projectLimit },
    favorites: { count: favoritesCount },
  });
});

router.get("/preferences", (req, res) => {
  return res.json(getUserPreferences(req.user.id));
});

router.put("/preferences", (req, res) => {
  const { favorites = [], palette = [] } = req.body ?? {};
  return res.json(saveUserPreferences(req.user.id, { favorites, palette }));
});

router.get("/subscription", (req, res) => {
  const user = db
    .prepare(
      `SELECT tier, stripe_customer_id, stripe_subscription_id,
              subscription_status, subscription_plan,
              subscription_current_period_end, subscription_cancel_at_period_end,
              payment_provider, provider_subscription_id,
              apple_original_transaction_id, pro_expires_at
       FROM users WHERE id = ?`
    )
    .get(req.user.id);

  // Check both legacy and new provider columns
  const hasSubscription =
    user &&
    (user.stripe_subscription_id ||
      user.provider_subscription_id ||
      user.apple_original_transaction_id ||
      user.tier === "pro");

  if (!hasSubscription) {
    return res.json(null);
  }

  return res.json({
    tier: user.tier,
    status: user.subscription_status,
    plan: user.subscription_plan,
    currentPeriodEnd: user.subscription_current_period_end,
    cancelAtPeriodEnd: !!user.subscription_cancel_at_period_end,
    provider: user.payment_provider || "stripe",
    proExpiresAt: user.pro_expires_at,
  });
});

router.get("/orders", (req, res) => {
  const orders = db
    .prepare(
      `
        SELECT
          order_id,
          product,
          amount,
          currency,
          created_at,
          pack_id,
          download_url,
          receipt_url,
          attributed_source,
          attributed_utm_source,
          attributed_utm_medium,
          attributed_utm_campaign,
          attributed_utm_term,
          attributed_utm_content,
          attributed_landing_path
        FROM orders
        WHERE lower(email) = lower(?)
        ORDER BY datetime(created_at) DESC
      `,
    )
    .all(req.user.email)
    .map((order) => {
      const matchedProduct = findCatalogProduct(order.product);
      const packId = order.pack_id || matchedProduct?.packId || null;

      return {
        orderId: order.order_id,
        product: order.product,
        amount: order.amount,
        currency: order.currency,
        created_at: order.created_at,
        packId,
        downloadUrl: order.download_url || getDownloadUrl(order.product),
        receiptUrl: order.receipt_url || null,
        packUrl: packId ? getPackUrl(order.product) : null,
        attribution: {
          source: order.attributed_source || null,
          utmSource: order.attributed_utm_source || null,
          utmMedium: order.attributed_utm_medium || null,
          utmCampaign: order.attributed_utm_campaign || null,
          utmTerm: order.attributed_utm_term || null,
          utmContent: order.attributed_utm_content || null,
          landingPath: order.attributed_landing_path || null,
        },
      };
    });

  return res.json({ orders });
});

router.post("/orders/:orderId/resend", async (req, res) => {
  const order = db
    .prepare(
      `
        SELECT order_id, email, product, download_url, receipt_url
        FROM orders
        WHERE order_id = ? AND lower(email) = lower(?)
      `,
    )
    .get(req.params.orderId, req.user.email);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  try {
    await sendOrderConfirmationEmail(order.email, {
      productName: order.product,
      downloadUrl: order.download_url || order.receipt_url || getDownloadUrl(order.product),
      orderId: order.order_id,
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error("resend order email error:", error);
    return res.status(500).json({ error: "Could not resend download email" });
  }
});

// --- Referral System ---

function ensureReferralCode(userId) {
  const user = db.prepare("SELECT referral_code FROM users WHERE id = ?").get(userId);
  if (user.referral_code) return user.referral_code;
  const code = crypto.randomBytes(4).toString("hex");
  db.prepare("UPDATE users SET referral_code = ? WHERE id = ?").run(code, userId);
  return code;
}

router.get("/referral", (req, res) => {
  const code = ensureReferralCode(req.user.id);
  const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(req.user.id);

  // Count referrals
  const referrals = db
    .prepare("SELECT COUNT(*) as count FROM subscribers WHERE referred_by = ?")
    .get(code);

  return res.json({
    code,
    credits: user.credits || 0,
    referrals: referrals.count,
    link: `${process.env.FRONTEND_ORIGIN || "https://colorarchive.me"}/?ref=${code}`,
  });
});

router.post("/referral/share", (req, res) => {
  // Award credits for sharing (best-effort, called when share intent fires)
  const SHARE_CREDITS = 2;
  db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(SHARE_CREDITS, req.user.id);
  const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(req.user.id);
  return res.json({ ok: true, credits: user.credits });
});

// --- API Key Management ---

router.get("/api-key", (req, res) => {
  const user = db.prepare("SELECT api_key_hash, api_key_prefix FROM users WHERE id = ?").get(req.user.id);
  return res.json({
    hasKey: !!user.api_key_hash,
    prefix: user.api_key_prefix || null,
  });
});

router.post("/api-key", (req, res) => {
  const existing = db.prepare("SELECT api_key_hash FROM users WHERE id = ?").get(req.user.id);
  if (existing.api_key_hash) {
    return res.status(409).json({ error: "API key already exists. Delete it first to generate a new one." });
  }

  const key = `ca_${crypto.randomBytes(16).toString("hex")}`;
  const { hashApiKey } = require("../db");
  db.prepare("UPDATE users SET api_key_hash = ?, api_key_prefix = ?, api_key = NULL WHERE id = ?")
    .run(hashApiKey(key), key.slice(0, 7) + "...", req.user.id);
  return res.json({ apiKey: key });
});

router.delete("/api-key", (req, res) => {
  db.prepare("UPDATE users SET api_key_hash = NULL, api_key_prefix = NULL, api_key = NULL WHERE id = ?").run(req.user.id);
  return res.json({ ok: true });
});

module.exports = router;
