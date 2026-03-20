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

function buildTimeRangeClause(days, previous = false) {
  if (previous) {
    return {
      clauses: [
        `datetime(created_at) >= datetime('now', ?)`,
        `datetime(created_at) < datetime('now', ?)`,
      ],
      params: [`-${days * 2 - 1} days`, `-${days - 1} days`],
    };
  }

  return {
    clauses: [`datetime(created_at) >= datetime('now', ?)`],
    params: [`-${days - 1} days`],
  };
}

function pushFilter(clauses, params, column, value) {
  if (!value) {
    return;
  }

  clauses.push(`${column} = ?`);
  params.push(value);
}

function buildSubscriberWhere(filters, previous = false) {
  const { clauses, params } = buildTimeRangeClause(filters.days, previous);

  pushFilter(clauses, params, "source", filters.source);
  pushFilter(clauses, params, "utm_campaign", filters.utmCampaign);
  pushFilter(clauses, params, "utm_source", filters.utmSource);
  pushFilter(clauses, params, "utm_medium", filters.utmMedium);
  pushFilter(clauses, params, "utm_term", filters.utmTerm);
  pushFilter(clauses, params, "utm_content", filters.utmContent);
  pushFilter(clauses, params, "landing_path", filters.landingPath);

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

function buildOrderWhere(filters, previous = false) {
  const { clauses, params } = buildTimeRangeClause(filters.days, previous);

  pushFilter(clauses, params, "attributed_source", filters.source);
  pushFilter(clauses, params, "attributed_utm_campaign", filters.utmCampaign);
  pushFilter(clauses, params, "attributed_utm_source", filters.utmSource);
  pushFilter(clauses, params, "attributed_utm_medium", filters.utmMedium);
  pushFilter(clauses, params, "attributed_utm_term", filters.utmTerm);
  pushFilter(clauses, params, "attributed_utm_content", filters.utmContent);
  pushFilter(clauses, params, "attributed_landing_path", filters.landingPath);

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

function calculateDelta(current, previous) {
  const delta = current - previous;
  const change = previous > 0 ? delta / previous : current > 0 ? 1 : 0;

  return {
    current,
    previous,
    delta,
    change,
  };
}

router.get("/", (req, res) => {
  const filters = {
    days: normalizeDays(req.query.days),
    source: normalizeFilter(req.query.source),
    utmCampaign: normalizeFilter(req.query.utm_campaign),
    utmSource: normalizeFilter(req.query.utm_source),
    utmMedium: normalizeFilter(req.query.utm_medium),
    utmTerm: normalizeFilter(req.query.utm_term),
    utmContent: normalizeFilter(req.query.utm_content),
    landingPath: normalizeFilter(req.query.landing_path),
  };

  const subscriberFilter = buildSubscriberWhere(filters);
  const orderFilter = buildOrderWhere(filters);
  const previousSubscriberFilter = buildSubscriberWhere(filters, true);
  const previousOrderFilter = buildOrderWhere(filters, true);

  const subscriberCount = db
    .prepare(`SELECT COUNT(*) as count FROM subscribers ${subscriberFilter.where}`)
    .get(...subscriberFilter.params).count;

  const previousSubscriberCount = db
    .prepare(`SELECT COUNT(*) as count FROM subscribers ${previousSubscriberFilter.where}`)
    .get(...previousSubscriberFilter.params).count;

  const subscribersBySource = db
    .prepare(
      `
        SELECT source, COUNT(*) as count
        FROM subscribers
        ${subscriberFilter.where}
        GROUP BY source
        ORDER BY count DESC
      `,
    )
    .all(...subscriberFilter.params);

  const orderCount = db
    .prepare(`SELECT COUNT(*) as count FROM orders ${orderFilter.where}`)
    .get(...orderFilter.params).count;

  const previousOrderCount = db
    .prepare(`SELECT COUNT(*) as count FROM orders ${previousOrderFilter.where}`)
    .get(...previousOrderFilter.params).count;

  const totalRevenue = db
    .prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM orders ${orderFilter.where}`)
    .get(...orderFilter.params).total;

  const previousRevenue = db
    .prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM orders ${previousOrderFilter.where}`)
    .get(...previousOrderFilter.params).total;

  const recentSubscribers = db
    .prepare(
      `
        SELECT email, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content, landing_path, created_at
        FROM subscribers
        ${subscriberFilter.where}
        ORDER BY datetime(created_at) DESC
        LIMIT 10
      `,
    )
    .all(...subscriberFilter.params);

  const recentOrders = db
    .prepare(
      `
        SELECT
          email,
          product,
          amount,
          currency,
          attributed_source,
          attributed_utm_source,
          attributed_utm_medium,
          attributed_utm_campaign,
          attributed_utm_term,
          attributed_utm_content,
          attributed_landing_path,
          created_at
        FROM orders
        ${orderFilter.where}
        ORDER BY datetime(created_at) DESC
        LIMIT 10
      `,
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
      `,
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
      `,
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
      `,
    )
    .all(...orderFilter.params);

  const freePackSubscribers = db
    .prepare(
      `SELECT COUNT(*) as count FROM subscribers ${subscriberFilter.where}${subscriberFilter.where ? " AND" : " WHERE"} source = ?`,
    )
    .get(...subscriberFilter.params, "free-pack").count;

  const waitlistSubscribers = db
    .prepare(
      `SELECT COUNT(*) as count FROM subscribers ${subscriberFilter.where}${subscriberFilter.where ? " AND" : " WHERE"} source = ?`,
    )
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

  const cohortSources =
    filters.source && filters.source !== "all"
      ? [filters.source]
      : subscribersBySource.map((row) => row.source).filter(Boolean);

  const sourceCohorts = cohortSources.map((source) => {
    const cohortSubscriberFilter = buildSubscriberWhere({ ...filters, source });
    const cohortOrderFilter = buildOrderWhere({ ...filters, source });

    const subscribers = db
      .prepare(`SELECT COUNT(*) as count FROM subscribers ${cohortSubscriberFilter.where}`)
      .get(...cohortSubscriberFilter.params).count;

    const purchasersForSource = db
      .prepare(`SELECT COUNT(DISTINCT email) as count FROM orders ${cohortOrderFilter.where}`)
      .get(...cohortOrderFilter.params).count;

    const orderCountForSource = db
      .prepare(`SELECT COUNT(*) as count FROM orders ${cohortOrderFilter.where}`)
      .get(...cohortOrderFilter.params).count;

    const revenueForSource = db
      .prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM orders ${cohortOrderFilter.where}`)
      .get(...cohortOrderFilter.params).total;

    return {
      source,
      subscribers,
      purchasers: purchasersForSource,
      orders: orderCountForSource,
      revenue: revenueForSource,
      conversionRate: subscribers > 0 ? purchasersForSource / subscribers : 0,
    };
  });

  res.json({
    filters: {
      selected: filters,
      options: {
        sources: queryDistinct("source", "subscribers"),
        utmCampaigns: queryDistinct("utm_campaign", "subscribers"),
        utmSources: queryDistinct("utm_source", "subscribers"),
        utmMediums: queryDistinct("utm_medium", "subscribers"),
        utmTerms: queryDistinct("utm_term", "subscribers"),
        utmContents: queryDistinct("utm_content", "subscribers"),
        landingPaths: queryDistinct("landing_path", "subscribers"),
      },
    },
    subscribers: { total: subscriberCount, bySource: subscribersBySource },
    orders: { total: orderCount, revenue: totalRevenue },
    comparisons: {
      subscribers: calculateDelta(subscriberCount, previousSubscriberCount),
      orders: calculateDelta(orderCount, previousOrderCount),
      revenue: calculateDelta(totalRevenue, previousRevenue),
    },
    sourceCohorts,
    funnel: {
      freePackSubscribers,
      waitlistSubscribers,
      purchasers,
      freePackPurchasers,
      waitlistPurchasers,
      freePackConversionRate: freePackSubscribers > 0 ? freePackPurchasers / freePackSubscribers : 0,
      waitlistConversionRate: waitlistSubscribers > 0 ? waitlistPurchasers / waitlistSubscribers : 0,
    },
    series: {
      subscribers: subscriberSeries,
      orders: orderSeries,
    },
    products,
    recent: { subscribers: recentSubscribers, orders: recentOrders },
  });
});

router.get("/buyers", (req, res) => {
  const days = normalizeDays(req.query.days);
  const source = normalizeFilter(req.query.source);

  const orderFilter = buildOrderWhere({ days, source, utmCampaign: null, utmSource: null, utmMedium: null, utmTerm: null, utmContent: null, landingPath: null });

  const rows = db
    .prepare(
      `
        SELECT
          email,
          COUNT(*) as order_count,
          COALESCE(SUM(amount), 0) as total_revenue,
          MIN(created_at) as first_purchase_at,
          MAX(created_at) as last_purchase_at,
          GROUP_CONCAT(product, '||') as products_raw
        FROM orders
        ${orderFilter.where}
        GROUP BY email
        ORDER BY total_revenue DESC
        LIMIT 100
      `,
    )
    .all(...orderFilter.params);

  const buyers = rows.map((row) => {
    const at = row.email.indexOf("@");
    const masked =
      at > 1
        ? `${row.email.slice(0, 1)}${"*".repeat(Math.min(at - 1, 4))}${row.email.slice(at)}`
        : `${"*".repeat(row.email.length - 1)}${row.email.slice(-1)}`;
    return {
      emailMasked: masked,
      orderCount: row.order_count,
      totalRevenue: row.total_revenue,
      firstPurchaseAt: row.first_purchase_at,
      lastPurchaseAt: row.last_purchase_at,
      products: row.products_raw ? [...new Set(row.products_raw.split("||"))] : [],
    };
  });

  return res.json({ buyers, source: source ?? "all", days });
});

// A/B test results — shows conversion rates per variant per follow-up stage
router.get("/ab-results", (req, res) => {
  const stages = ["3d", "7d", "14d"];
  const results = {};

  for (const stage of stages) {
    const variantCol = `follow_up_${stage}_variant`;
    const sentCol = `follow_up_${stage}_sent`;

    // Count sent per variant
    const sentRows = db
      .prepare(
        `SELECT ${variantCol} as variant, COUNT(*) as sent_count
         FROM subscribers
         WHERE source = 'free-pack' AND ${sentCol} IS NOT NULL AND ${variantCol} IS NOT NULL
         GROUP BY ${variantCol}`,
      )
      .all();

    // Count conversions (subscribers who later became buyers) per variant
    const conversionRows = db
      .prepare(
        `SELECT s.${variantCol} as variant, COUNT(DISTINCT o.email) as converted_count
         FROM subscribers s
         INNER JOIN orders o ON s.email = o.email
         WHERE s.source = 'free-pack'
           AND s.${sentCol} IS NOT NULL
           AND s.${variantCol} IS NOT NULL
           AND datetime(o.created_at) >= datetime(s.${sentCol})
         GROUP BY s.${variantCol}`,
      )
      .all();

    const conversionMap = Object.fromEntries(
      conversionRows.map((r) => [r.variant, r.converted_count]),
    );

    results[`day_${stage.replace("d", "")}`] = sentRows.map((r) => ({
      variant: r.variant,
      sent: r.sent_count,
      converted: conversionMap[r.variant] || 0,
      conversionRate:
        r.sent_count > 0
          ? Math.round(((conversionMap[r.variant] || 0) / r.sent_count) * 1000) / 10
          : 0,
    }));
  }

  return res.json({ abResults: results });
});

module.exports = router;
