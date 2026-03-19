const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAnalyticsAccess } = require("../auth");
const { findCatalogProduct, getDownloadUrl, getPackUrl } = require("../catalog");
const { sendOrderConfirmationEmail } = require("../email");

router.use(requireAnalyticsAccess);

router.get("/orders", (req, res) => {
  const orders = db
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
        ORDER BY datetime(created_at) DESC
        LIMIT 50
      `,
    )
    .all()
    .map((order) => {
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

  return res.json({ orders });
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
