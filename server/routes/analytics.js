const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /analytics
// Returns subscriber count, order count, and recent activity
router.get("/", (req, res) => {
  const subscriberCount = db
    .prepare("SELECT COUNT(*) as count FROM subscribers")
    .get().count;

  const subscribersBySource = db
    .prepare(
      "SELECT source, COUNT(*) as count FROM subscribers GROUP BY source ORDER BY count DESC"
    )
    .all();

  const orderCount = db
    .prepare("SELECT COUNT(*) as count FROM orders")
    .get().count;

  const totalRevenue = db
    .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM orders")
    .get().total;

  const recentSubscribers = db
    .prepare(
      "SELECT email, source, created_at FROM subscribers ORDER BY created_at DESC LIMIT 10"
    )
    .all();

  const recentOrders = db
    .prepare(
      "SELECT email, product, amount, currency, created_at FROM orders ORDER BY created_at DESC LIMIT 10"
    )
    .all();

  res.json({
    subscribers: { total: subscriberCount, bySource: subscribersBySource },
    orders: { total: orderCount, revenue: totalRevenue },
    recent: { subscribers: recentSubscribers, orders: recentOrders },
  });
});

module.exports = router;
