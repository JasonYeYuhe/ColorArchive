const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAnalyticsAccess } = require("../auth");
const { DISTINCT_VISITS, windowCaveats } = require("../session-denominator");

// Every money figure this route returns is in EXACT MINOR UNITS, never the
// rounded major-unit `amount` column. `amount` is round(minor/100), so summing it
// discards cents and then the dashboards divided by 100 a second time — which is
// how $3.47 reached the screen as $0.03 and stayed there for four months. JPY hid
// it, because the frontend skipped the divisor for zero-decimal currencies and
// those rows happened to look right. Consumers must format with
// src/lib/format-money.ts, which divides by 100 for every currency including JPY
// (Lemon Squeezy scales yen by 100 too).
const MONEY_MINOR = "COALESCE(SUM(COALESCE(amount_minor, amount * 100)), 0)";

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

  // Revenue metrics count only real, kept money: exclude test-mode orders and
  // refunded/disputed rows (the gate queries already did; the admin dashboard
  // silently included both until 2026-07-22).
  clauses.push("COALESCE(is_test, 0) = 0");
  clauses.push("COALESCE(refunded, 0) = 0");

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
    .prepare(`SELECT ${MONEY_MINOR} as total FROM orders ${orderFilter.where}`)
    .get(...orderFilter.params).total;

  const previousRevenue = db
    .prepare(`SELECT ${MONEY_MINOR} as total FROM orders ${previousOrderFilter.where}`)
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
          COALESCE(amount_minor, amount * 100) as amount,
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
               ${MONEY_MINOR} as revenue
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
               ${MONEY_MINOR} as revenue,
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
      .prepare(`SELECT ${MONEY_MINOR} as total FROM orders ${cohortOrderFilter.where}`)
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
          ${MONEY_MINOR} as total_revenue,
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

/**
 * GET /analytics/gate — the exit-gate funnel, split by channel.
 *
 * One screen that answers the 2026-07-15 gate question directly: did we get ≥500 QUALIFIED
 * UV to /preorder (or ≥1000 paywall triggers), and from WHICH channels — so a "floor met but
 * 0 preorders" reading can be diagnosed as fed-the-wrong-people vs. no-demand. Reads the
 * first-party pageviews + events (now channel-stamped) and orders (the numerator).
 */
router.get("/gate", (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
  // Bind the window as a relative SQLite modifier and compare with datetime() on both sides.
  // (Comparing created_at — stored as 'YYYY-MM-DD HH:MM:SS' via datetime('now') — against a
  // raw ISO string '...T...Z' silently drops boundary-day rows: ' ' < 'T' lexically.)
  const sinceParam = `-${days} days`;

  const byChannel = (sql) =>
    db
      .prepare(sql)
      .all(sinceParam)
      .map((r) => ({ channel: r.channel || "unknown", count: r.count }));

  // Denominators are VISITS from `events`, not rows. `pageviews` has no caller
  // identifier and 2026-07-27 measured it as 22.5% automated (vs 1.5% of events),
  // so it was counting crawlers as prospects; counting event ROWS double-counted
  // one visitor who reloads. Both fixes are the same expression — see
  // server/session-denominator.js, which also documents the two dates that make a
  // session count misleading (session_id starts 2026-07-26; /guides/ stopped
  // emitting a read-only event on 2026-08-10).
  const preorderUvByChannel = byChannel(
    `SELECT COALESCE(NULLIF(channel, ''), 'unknown') as channel, ${DISTINCT_VISITS} as count
     FROM events
     WHERE datetime(created_at) >= datetime('now', ?) AND path LIKE '/preorder%'
     GROUP BY channel ORDER BY count DESC`,
  );

  // Denominator B: paywall triggers (hit + restored), by channel.
  const paywallByChannel = byChannel(
    `SELECT COALESCE(NULLIF(channel, ''), 'unknown') as channel, ${DISTINCT_VISITS} as count
     FROM events
     WHERE datetime(created_at) >= datetime('now', ?) AND event_name IN ('word_paywall_hit', 'word_paywall_restored')
     GROUP BY channel ORDER BY count DESC`,
  );

  // The site's actual size, on the only denominator that survives scrutiny.
  const engagedVisits = db
    .prepare(`SELECT ${DISTINCT_VISITS} as c FROM events WHERE datetime(created_at) >= datetime('now', ?)`)
    .get(sinceParam).c;

  // Conversion steps, by event × channel.
  const GATE_EVENTS = [
    "preorder_view",
    "preorder_cta_click",
    "preorder_email_reserve",
    "preorder_checkout_clicked",
    "preorder_checkout_redirected",
    "preorder_purchase_confirmed",
    "word_paywall_hit",
    "word_paywall_restored",
    "word_paywall_pro_click",
    "word_paywall_email_unlock",
    "word_pro_click",
  ];
  const placeholders = GATE_EVENTS.map(() => "?").join(", ");
  const stepRows = db
    .prepare(
      `SELECT event_name,
              COALESCE(NULLIF(channel, ''), 'unknown') as channel,
              COUNT(*) as count
       FROM events
       WHERE datetime(created_at) >= datetime('now', ?) AND event_name IN (${placeholders})
       GROUP BY event_name, channel
       ORDER BY event_name ASC, count DESC`,
    )
    .all(sinceParam, ...GATE_EVENTS);

  const stepsByEvent = {};
  for (const ev of GATE_EVENTS) stepsByEvent[ev] = { total: 0, byChannel: {} };
  for (const row of stepRows) {
    stepsByEvent[row.event_name].total += row.count;
    stepsByEvent[row.event_name].byChannel[row.channel] = row.count;
  }

  // Numerator: real orders in the window (the thing the gate ultimately counts).
  // COALESCE(is_test,0)=0 excludes owner/QA test-mode orders, which would
  // otherwise falsely satisfy the PROCEED threshold. is_test is written by the
  // order-completed / subscription-checkout webhook handlers.
  const ordersTotal = db
    .prepare(`SELECT COUNT(*) as count FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test, 0) = 0`)
    .get(sinceParam).count;
  // The gate's real PROCEED criterion is Auditor PRE-orders specifically — an
  // unrelated pack/Pro sale must not satisfy "≥10 real pre-orders". ordersTotal
  // stays as the all-products context number; preorder is what the verdict keys on.
  const preorderOrders = db
    .prepare(`SELECT COUNT(*) as count FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test, 0) = 0 AND pack_id = 'preorder-auditor'`)
    .get(sinceParam).count;
  const ordersByProduct = db
    .prepare(
      `SELECT product, COUNT(*) as count, ${MONEY_MINOR} as revenue
       FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test, 0) = 0
       GROUP BY product ORDER BY count DESC`,
    )
    .all(sinceParam);
  // NB: orders are attributed by SIGN-UP SOURCE tag (free-pack / waitlist / preorder / …),
  // NOT the first-touch acquisition channel — orders.attributed_source comes from the form's
  // `source`, not classifyChannel. So this is a different axis than the channel-keyed
  // denominators above and can't be joined to them. True acquisition-channel attribution on
  // the numerator would require threading `channel` through the purchase webhook (deferred —
  // out of scope this sprint; the gate decision uses orders.total, not the per-source split).
  const ordersBySource = db
    .prepare(
      `SELECT COALESCE(NULLIF(attributed_source, ''), 'unknown') as source, COUNT(*) as count
       FROM orders WHERE datetime(created_at) >= datetime('now', ?) AND COALESCE(is_test, 0) = 0
       GROUP BY source ORDER BY count DESC`,
    )
    .all(sinceParam)
    .map((r) => ({ source: r.source, count: r.count }));

  // Secondary signal: distinct people who left a paid-INTENT email reservation
  // (subscribers.source='preorder'). NOT the gate's primary count (real
  // pre-orders is) but, while card checkout is gated, the funnel's one live
  // signal. Counted to-date, NOT windowed: an upsert that flips an older
  // subscriber to source='preorder' keeps the original created_at, so a window
  // filter would silently miss them. Test rows excluded.
  const emailReservesTotal = db
    .prepare(`SELECT COUNT(*) as count FROM subscribers WHERE source = 'preorder' AND COALESCE(is_test, 0) = 0`)
    .get().count;

  const sum = (rows) => rows.reduce((n, r) => n + r.count, 0);
  const preorderUvTotal = sum(preorderUvByChannel);
  const paywallTotal = sum(paywallByChannel);

  // Generic-traffic channels do NOT count toward the qualified floor (dev-plan §5 channel
  // hygiene). Unknown referral domains ('referral:*') are also treated as generic — a random
  // referral shouldn't inflate the qualified count. Explicit campaign tags ('utm:*') DO count
  // (the operator set them deliberately). This is advisory: the owner sees raw + qualified.
  const GENERIC = new Set(["hackernews", "organic-search", "direct", "unknown", "reddit"]);
  const isGeneric = (ch) => GENERIC.has(ch) || ch.startsWith("referral:");
  const qualifiedPreorderUv = preorderUvByChannel
    .filter((r) => !isGeneric(r.channel))
    .reduce((n, r) => n + r.count, 0);

  return res.json({
    days,
    engagedVisits,
    caveats: windowCaveats(days),
    floors: {
      preorderUv: { total: preorderUvTotal, qualified: qualifiedPreorderUv, target: 500 },
      paywallTriggers: { total: paywallTotal, target: 1000 },
      genericChannels: [...GENERIC, "referral:*"],
    },
    preorderUvByChannel,
    paywallByChannel,
    steps: stepsByEvent,
    orders: {
      total: ordersTotal,
      // Auditor pre-orders only — this is the gate's PROCEED criterion (≥10).
      preorder: preorderOrders,
      target: 10,
      byProduct: ordersByProduct,
      bySource: ordersBySource,
      // Secondary signal only — distinct paid-intent email reservers, not orders.
      emailReserves: emailReservesTotal,
    },
  });
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
