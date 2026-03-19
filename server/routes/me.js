const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  getUserPreferences,
  requireUser,
  saveUserPreferences,
} = require("../auth");
const { findCatalogProduct, getDownloadUrl, getPackUrl } = require("../catalog");

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
          receipt_url
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
      };
    });

  return res.json({ orders });
});

module.exports = router;
