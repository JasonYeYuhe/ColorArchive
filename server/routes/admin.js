const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAnalyticsAccess } = require("../auth");
const { findCatalogProduct, getDownloadUrl, getPackUrl } = require("../catalog");
const { sendOrderConfirmationEmail } = require("../email");
const pinterestAdmin = require("../pinterest-admin");
const pinScheduler = require("../pin-scheduler");

router.use(requireAnalyticsAccess);

router.get("/orders", (req, res) => {
  const { email, product, dateFrom, dateTo, page, limit: limitParam } = req.query;
  const limit = Math.min(parseInt(limitParam) || 25, 100);
  const offset = (Math.max(parseInt(page) || 1, 1) - 1) * limit;

  const conditions = [];
  const params = [];

  if (email) {
    conditions.push("LOWER(email) LIKE LOWER(?)");
    params.push(`%${email}%`);
  }
  if (product) {
    conditions.push("product = ?");
    params.push(product);
  }
  if (dateFrom) {
    conditions.push("datetime(created_at) >= datetime(?)");
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push("datetime(created_at) <= datetime(?)");
    params.push(dateTo);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM orders ${where}`)
    .get(...params);

  const rows = db
    .prepare(
      `
        SELECT
          order_id,
          email,
          product,
          amount,
          currency,
          created_at,
          pack_id,
          download_url,
          receipt_url
        FROM orders
        ${where}
        ORDER BY datetime(created_at) DESC
        LIMIT ? OFFSET ?
      `,
    )
    .all(...params, limit, offset);

  const orders = rows.map((order) => {
    const matchedProduct = findCatalogProduct(order.product);
    const packId = order.pack_id || matchedProduct?.packId || null;
    return {
      orderId: order.order_id,
      email: order.email,
      product: order.product,
      amount: order.amount,
      currency: order.currency,
      created_at: order.created_at,
      packId,
      downloadUrl: order.download_url || getDownloadUrl(order.product),
      receiptUrl: order.receipt_url || null,
      packUrl: packId ? getPackUrl(order.product) : null,
    };
  });

  return res.json({ orders, total, page: Math.max(parseInt(page) || 1, 1), limit });
});

router.post("/orders/:orderId/resend", async (req, res) => {
  const order = db
    .prepare(
      `
        SELECT order_id, email, product, download_url, receipt_url
        FROM orders
        WHERE order_id = ?
      `,
    )
    .get(req.params.orderId);

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
    console.error("admin resend order email error:", error);
    return res.status(500).json({ error: "Could not resend download email" });
  }
});

/**
 * GET /admin/autopilot-status
 *
 * Read-only health/metrics for the autopilot surfaces (Pinterest
 * pinning, commerce webhook activity, recent Pro activations).
 * Gated by requireAnalyticsAccess (same session as admin/orders),
 * so the browser admin page can reach it without a bearer.
 */
router.get("/autopilot-status", (req, res) => {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const includeTest = req.query.includeTest === "true";
  const testFilter = includeTest ? "" : " AND is_test = 0";

  // Pinterest: live token status + recent pins from the scheduler's log
  const pinterest = pinterestAdmin.getStatus();
  const log = pinScheduler.loadPinLog();
  const pinEntries = Object.entries(log)
    .map(([key, entry]) => ({ key, ...entry }))
    .filter((e) => Date.parse(e.at || "") >= now - 7 * 24 * 60 * 60 * 1000)
    .sort((a, b) => Date.parse(b.at || "") - Date.parse(a.at || ""));
  const today = new Date().toISOString().slice(0, 10);
  // Source last_pin_at from the durable log, not the in-memory value on
  // pinterest-admin. getStatus() resets to null on every pm2 restart,
  // which would show "never" to an operator right after a deploy even
  // when pins happened minutes earlier (Gemini P1, 2026-04-17).
  const lastRealPin = pinEntries.find((e) => !e.dryRun);
  pinterest.last_pin_at = lastRealPin?.at || pinterest.last_pin_at;
  pinterest.pins_today = pinScheduler.pinsTodayFromLog(log, today);
  pinterest.pins_last_7d = pinEntries.filter((e) => !e.dryRun).length;
  pinterest.recent_pins = pinEntries.slice(0, 10).map((e) => ({
    at: e.at,
    type: e.type,
    slug: e.slug,
    title: e.title,
    link: e.link,
    pinId: e.pinId,
    dryRun: Boolean(e.dryRun),
  }));

  // Commerce: pulled from the DB that webhook.js writes to on every LS event.
  // Defaults to real rows only; pass ?includeTest=true to see test-mode too.
  const proUsersTotal = db
    .prepare(`SELECT COUNT(*) AS n FROM users WHERE tier = 'pro'${testFilter}`)
    .get().n;
  const newProLast7d = db
    .prepare(
      `SELECT COUNT(*) AS n FROM users WHERE tier = 'pro' AND created_at >= ?${testFilter}`
    )
    .get(sevenDaysAgo).n;
  const ordersLast7d = db
    .prepare(`SELECT COUNT(*) AS n FROM orders WHERE created_at >= ?${testFilter}`)
    .get(sevenDaysAgo).n;
  const recentOrders = db
    .prepare(
      `SELECT order_id, email, product, amount, currency, created_at, is_test FROM orders
       WHERE 1=1${testFilter}
       ORDER BY created_at DESC LIMIT 10`
    )
    .all();
  const testRowsHidden = includeTest
    ? 0
    : db.prepare("SELECT COUNT(*) AS n FROM orders WHERE is_test = 1").get().n;

  // Suspected-duplicate subscriptions (same card fingerprint flagged
  // by the webhook handler). Operator-visible as an advisory; real rows
  // stay pro, never auto-cancelled.
  const duplicates = db
    .prepare(
      `SELECT id, email, subscription_plan, card_fingerprint, duplicate_suspects, created_at
       FROM users
       WHERE is_duplicate = 1${testFilter}
       ORDER BY created_at DESC LIMIT 25`
    )
    .all()
    .map((row) => {
      let suspectIds = [];
      try { suspectIds = JSON.parse(row.duplicate_suspects || "[]"); } catch { /* ignore */ }
      const suspects = suspectIds.length
        ? db.prepare(
            `SELECT id, email FROM users WHERE id IN (${suspectIds.map(() => "?").join(",")})`,
          ).all(...suspectIds)
        : [];
      return {
        user_id: row.id,
        email: row.email,
        plan: row.subscription_plan,
        card_fingerprint: row.card_fingerprint,
        created_at: row.created_at,
        suspects, // [{id, email}]
      };
    });

  return res.json({
    generated_at: new Date().toISOString(),
    include_test: includeTest,
    test_rows_hidden: testRowsHidden,
    pinterest,
    commerce: {
      pro_users_total: proUsersTotal,
      new_pro_last_7d: newProLast7d,
      orders_last_7d: ordersLast7d,
      recent_orders: recentOrders,
      suspected_duplicates: duplicates,
    },
  });
});

module.exports = router;
