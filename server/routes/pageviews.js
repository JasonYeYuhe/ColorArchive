const express = require("express");
const db = require("../db");
const { requireAnalyticsAccess } = require("../auth");
const { getRateLimitKey } = require("../client-ip");
const router = express.Router();

// Simple in-memory rate limiter: max 60 writes per IP per minute.
// Keyed via getRateLimitKey() — reading `req.ip` directly made this a site-wide
// cap for four months, because nginx never set X-Forwarded-For and every request
// therefore resolved to loopback. 516 real-browser pageview beacons were 429'd
// in the 07-12..07-26 log window alone. See client-ip.js for the full history.
const writeCounters = new Map();
setInterval(() => writeCounters.clear(), 60_000);
function rateLimitWrite(req, res, next) {
  const key = getRateLimitKey(req) || "unknown";
  const count = writeCounters.get(key) || 0;
  if (count >= 60) return res.status(429).json({ error: "Rate limit exceeded" });
  writeCounters.set(key, count + 1);
  next();
}

// POST /pageviews — record a page view (fire-and-forget beacon)
router.post("/", rateLimitWrite, (req, res) => {
  const body = req.body || {};
  const { path, referrer, screen } = body;
  if (!path || typeof path !== "string") {
    return res.status(400).json({ error: "path required" });
  }

  // Redact email-like substrings from free-text attribution before plaintext storage.
  const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const str = (v, max) => (typeof v === "string" && v ? v.replace(EMAIL_RE, "[redacted]").slice(0, max) : null);

  try {
    db.prepare(
      `INSERT INTO pageviews
         (path, referrer, screen_width, channel, utm_source, utm_medium, utm_campaign, referrer_domain, landing_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      path.slice(0, 512),
      (referrer || "").slice(0, 512) || null,
      typeof screen === "number" ? screen : null,
      str(body.channel, 60),
      str(body.utm_source, 120),
      str(body.utm_medium, 120),
      str(body.utm_campaign, 120),
      str(body.referrer_domain, 120),
      str(body.landing_path, 200)
    );
  } catch (err) {
    console.error("[pageviews] insert error:", err.message);
  }

  return res.status(204).end();
});

// GET /pageviews/stats — page view analytics (protected, same as /analytics)
router.get("/stats", requireAnalyticsAccess, (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 365);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const totalViews = db
    .prepare(`SELECT COUNT(*) as count FROM pageviews WHERE created_at >= ?`)
    .get(since).count;

  const uniquePaths = db
    .prepare(`SELECT COUNT(DISTINCT path) as count FROM pageviews WHERE created_at >= ?`)
    .get(since).count;

  const topPages = db
    .prepare(
      `SELECT path, COUNT(*) as views
       FROM pageviews WHERE created_at >= ?
       GROUP BY path ORDER BY views DESC LIMIT 20`
    )
    .all(since);

  const dailyViews = db
    .prepare(
      `SELECT DATE(created_at) as date, COUNT(*) as views
       FROM pageviews WHERE created_at >= ?
       GROUP BY DATE(created_at) ORDER BY date`
    )
    .all(since);

  const topReferrers = db
    .prepare(
      `SELECT referrer, COUNT(*) as views
       FROM pageviews WHERE created_at >= ? AND referrer IS NOT NULL AND referrer != ''
       GROUP BY referrer ORDER BY views DESC LIMIT 10`
    )
    .all(since);

  const deviceBreakdown = db
    .prepare(
      `SELECT
         CASE
           WHEN screen_width IS NULL THEN 'unknown'
           WHEN screen_width < 768 THEN 'mobile'
           WHEN screen_width < 1024 THEN 'tablet'
           ELSE 'desktop'
         END as device,
         COUNT(*) as views
       FROM pageviews WHERE created_at >= ?
       GROUP BY device ORDER BY views DESC`
    )
    .all(since);

  // Channel breakdown of all views + the exit-gate denominator: /preorder views by channel.
  const byChannel = db
    .prepare(
      `SELECT COALESCE(NULLIF(channel, ''), 'unknown') as channel, COUNT(*) as views
       FROM pageviews WHERE created_at >= ?
       GROUP BY channel ORDER BY views DESC`
    )
    .all(since);

  const preorderByChannel = db
    .prepare(
      `SELECT COALESCE(NULLIF(channel, ''), 'unknown') as channel, COUNT(*) as views
       FROM pageviews WHERE created_at >= ? AND path LIKE '/preorder%'
       GROUP BY channel ORDER BY views DESC`
    )
    .all(since);

  return res.json({
    totalViews,
    uniquePaths,
    topPages,
    dailyViews,
    topReferrers,
    deviceBreakdown,
    byChannel,
    preorderByChannel,
    days,
  });
});

module.exports = router;
