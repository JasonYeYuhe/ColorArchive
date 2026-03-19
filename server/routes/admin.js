const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAnalyticsAccess } = require("../auth");
const { findCatalogProduct, getDownloadUrl, getPackUrl } = require("../catalog");
const { sendOrderConfirmationEmail } = require("../email");

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
          ls_order_id,
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
      orderId: order.ls_order_id,
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
        SELECT ls_order_id, email, product, download_url, receipt_url
        FROM orders
        WHERE ls_order_id = ?
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
      orderId: order.ls_order_id,
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error("admin resend order email error:", error);
    return res.status(500).json({ error: "Could not resend download email" });
  }
});

module.exports = router;
