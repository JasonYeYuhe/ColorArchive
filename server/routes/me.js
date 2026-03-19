const express = require("express");
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

router.get("/preferences", (req, res) => {
  return res.json(getUserPreferences(req.user.id));
});

router.put("/preferences", (req, res) => {
  const { favorites = [], palette = [] } = req.body ?? {};
  return res.json(saveUserPreferences(req.user.id, { favorites, palette }));
});

router.get("/orders", (req, res) => {
  const orders = db
    .prepare(
      `
        SELECT
          ls_order_id,
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
        orderId: order.ls_order_id,
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
        SELECT ls_order_id, email, product, download_url, receipt_url
        FROM orders
        WHERE ls_order_id = ? AND lower(email) = lower(?)
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
      orderId: order.ls_order_id,
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error("resend order email error:", error);
    return res.status(500).json({ error: "Could not resend download email" });
  }
});

module.exports = router;
