const express = require("express");
const router = express.Router();
const db = require("../db");

function getSubscriberCountBySource(source) {
  return (
    db
      .prepare("SELECT COUNT(*) as count FROM subscribers WHERE source = ?")
      .get(source).count ?? 0
  );
}

function getDistinctPurchaserCountForSource(source) {
  return (
    db
      .prepare(
        `
          SELECT COUNT(DISTINCT orders.email) as count
          FROM orders
          INNER JOIN subscribers ON subscribers.email = orders.email
          WHERE subscribers.source = ?
        `
      )
      .get(source).count ?? 0
  );
}

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

  const subscriberSeries = db
    .prepare(
      `
        SELECT date(created_at) as day, COUNT(*) as count
        FROM subscribers
        WHERE datetime(created_at) >= datetime('now', '-13 days')
        GROUP BY date(created_at)
        ORDER BY day ASC
      `
    )
    .all();

  const orderSeries = db
    .prepare(
      `
        SELECT date(created_at) as day,
               COUNT(*) as count,
               COALESCE(SUM(amount), 0) as revenue
        FROM orders
        WHERE datetime(created_at) >= datetime('now', '-13 days')
        GROUP BY date(created_at)
        ORDER BY day ASC
      `
    )
    .all();

  const products = db
    .prepare(
      `
        SELECT product,
               COUNT(*) as orders,
               COALESCE(SUM(amount), 0) as revenue,
               MIN(currency) as currency
        FROM orders
        GROUP BY product
        ORDER BY orders DESC, revenue DESC
      `
    )
    .all();

  const freePackSubscribers = getSubscriberCountBySource("free-pack");
  const waitlistSubscribers = getSubscriberCountBySource("waitlist");
  const purchasers = db
    .prepare("SELECT COUNT(DISTINCT email) as count FROM orders")
    .get().count;
  const freePackPurchasers = getDistinctPurchaserCountForSource("free-pack");
  const waitlistPurchasers = getDistinctPurchaserCountForSource("waitlist");

  res.json({
    subscribers: { total: subscriberCount, bySource: subscribersBySource },
    orders: { total: orderCount, revenue: totalRevenue },
    funnel: {
      freePackSubscribers,
      waitlistSubscribers,
      purchasers,
      freePackPurchasers,
      waitlistPurchasers,
      freePackConversionRate:
        freePackSubscribers > 0 ? freePackPurchasers / freePackSubscribers : 0,
      waitlistConversionRate:
        waitlistSubscribers > 0 ? waitlistPurchasers / waitlistSubscribers : 0,
    },
    series: {
      subscribers: subscriberSeries,
      orders: orderSeries,
    },
    products,
    recent: { subscribers: recentSubscribers, orders: recentOrders },
  });
});

module.exports = router;
