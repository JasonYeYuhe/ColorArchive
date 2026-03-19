const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAnalyticsAccess } = require("../auth");

router.use(requireAnalyticsAccess);

function normalizeDays(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return [14, 30, 90].includes(parsed) ? parsed : 14;
}

function normalizeFilter(value) {
  return typeof value === "string" && value && value !== "all" ? value : null;
}

function buildSubscriberWhere({ days, source, utmCampaign, utmSource, landingPath }) {
  const clauses = [`datetime(created_at) >= datetime('now', ?)`];
  const params = [`-${days - 1} days`];

  if (source) {
    clauses.push(`source = ?`);
    params.push(source);
  }
  if (utmCampaign) {
    clauses.push(`utm_campaign = ?`);
    params.push(utmCampaign);
  }
  if (utmSource) {
    clauses.push(`utm_source = ?`);
    params.push(utmSource);
  }
  if (landingPath) {
    clauses.push(`landing_path = ?`);
    params.push(landingPath);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

function buildOrderWhere({ days, source, utmCampaign, utmSource, landingPath }) {
  const clauses = [`datetime(created_at) >= datetime('now', ?)`];
  const params = [`-${days - 1} days`];

  if (source) {
    clauses.push(`attributed_source = ?`);
    params.push(source);
  }
  if (utmCampaign) {
    clauses.push(`attributed_utm_campaign = ?`);
    params.push(utmCampaign);
  }
  if (utmSource) {
    clauses.push(`attributed_utm_source = ?`);
    params.push(utmSource);
  }
  if (landingPath) {
    clauses.push(`attributed_landing_path = ?`);
    params.push(landingPath);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

function queryDistinct(column, table) {
  return db
    .prepare(
      `SELECT DISTINCT ${column} as value FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != '' ORDER BY ${column} ASC`,
    )
    .all()
    .map((row) => row.value);
}

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
  const days = normalizeDays(req.query.days);
  const source = normalizeFilter(req.query.source);
  const utmCampaign = normalizeFilter(req.query.utm_campaign);
  const utmSource = normalizeFilter(req.query.utm_source);
  const landingPath = normalizeFilter(req.query.landing_path);
  const subscriberFilter = buildSubscriberWhere({
    days,
    source,
    utmCampaign,
    utmSource,
    landingPath,
  });
  const orderFilter = buildOrderWhere({
    days,
    source,
    utmCampaign,
    utmSource,
    landingPath,
  });

  const subscriberCount = db
    .prepare(`SELECT COUNT(*) as count FROM subscribers ${subscriberFilter.where}`)
    .get(...subscriberFilter.params).count;

  const subscribersBySource = db
    .prepare(
      `
        SELECT source, COUNT(*) as count
        FROM subscribers
        ${subscriberFilter.where}
        GROUP BY source
        ORDER BY count DESC
      `
    )
    .all(...subscriberFilter.params);

  const orderCount = db
    .prepare(`SELECT COUNT(*) as count FROM orders ${orderFilter.where}`)
    .get(...orderFilter.params).count;

  const totalRevenue = db
    .prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM orders ${orderFilter.where}`)
    .get(...orderFilter.params).total;

  const recentSubscribers = db
    .prepare(
      `
        SELECT email, source, utm_source, utm_campaign, landing_path, created_at
        FROM subscribers
        ${subscriberFilter.where}
        ORDER BY datetime(created_at) DESC
        LIMIT 10
      `
    )
    .all(...subscriberFilter.params);

  const recentOrders = db
    .prepare(
      `
        SELECT email, product, amount, currency, attributed_source, attributed_utm_campaign, created_at
        FROM orders
        ${orderFilter.where}
        ORDER BY datetime(created_at) DESC
        LIMIT 10
      `
    )
    .all(...orderFilter.params);

  const subscriberSeries = db
    .prepare(
      `
        SELECT date(created_at) as day, COUNT(*) as count
        FROM subscribers
        ${subscriberFilter.where}
        GROUP BY date(created_at)
        ORDER BY day ASC
      `
    )
    .all(...subscriberFilter.params);

  const orderSeries = db
    .prepare(
      `
        SELECT date(created_at) as day,
               COUNT(*) as count,
               COALESCE(SUM(amount), 0) as revenue
        FROM orders
        ${orderFilter.where}
        GROUP BY date(created_at)
        ORDER BY day ASC
      `
    )
    .all(...orderFilter.params);

  const products = db
    .prepare(
      `
        SELECT product,
               COUNT(*) as orders,
               COALESCE(SUM(amount), 0) as revenue,
               MIN(currency) as currency
        FROM orders
        ${orderFilter.where}
        GROUP BY product
        ORDER BY orders DESC, revenue DESC
      `
    )
    .all(...orderFilter.params);

  const freePackSubscribers = db
    .prepare(`SELECT COUNT(*) as count FROM subscribers ${subscriberFilter.where}${subscriberFilter.where ? " AND" : " WHERE"} source = ?`)
    .get(...subscriberFilter.params, "free-pack").count;
  const waitlistSubscribers = db
    .prepare(`SELECT COUNT(*) as count FROM subscribers ${subscriberFilter.where}${subscriberFilter.where ? " AND" : " WHERE"} source = ?`)
    .get(...subscriberFilter.params, "waitlist").count;
  const purchasers = db
    .prepare(`SELECT COUNT(DISTINCT email) as count FROM orders ${orderFilter.where}`)
    .get(...orderFilter.params).count;
  const freePackPurchasers = db
    .prepare(
      `
        SELECT COUNT(DISTINCT email) as count
        FROM orders
        ${orderFilter.where}${orderFilter.where ? " AND" : " WHERE"} attributed_source = ?
      `,
    )
    .get(...orderFilter.params, "free-pack").count;
  const waitlistPurchasers = db
    .prepare(
      `
        SELECT COUNT(DISTINCT email) as count
        FROM orders
        ${orderFilter.where}${orderFilter.where ? " AND" : " WHERE"} attributed_source = ?
      `,
    )
    .get(...orderFilter.params, "waitlist").count;

  res.json({
    filters: {
      selected: {
        days,
        source,
        utmCampaign,
        utmSource,
        landingPath,
      },
      options: {
        sources: queryDistinct("source", "subscribers"),
        utmCampaigns: queryDistinct("utm_campaign", "subscribers"),
        utmSources: queryDistinct("utm_source", "subscribers"),
        landingPaths: queryDistinct("landing_path", "subscribers"),
      },
    },
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
