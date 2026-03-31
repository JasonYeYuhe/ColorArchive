const express = require("express");
const db = require("../db");
const { requireAnalyticsAccess } = require("../auth");
const router = express.Router();

// Simple in-memory rate limiter: max 60 writes per IP per minute
const writeCounters = new Map();
setInterval(() => writeCounters.clear(), 60_000);
function rateLimitWrite(req, res, next) {
  const ip = req.ip || "unknown";
  const count = writeCounters.get(ip) || 0;
  if (count >= 60) return res.status(429).json({ error: "Rate limit exceeded" });
  writeCounters.set(ip, count + 1);
  next();
}

// POST /pageviews — record a page view (fire-and-forget beacon)
router.post("/", rateLimitWrite, (req, res) => {
  const { path, referrer, screen } = req.body || {};
  if (!path || typeof path !== "string") {
    return res.status(400).json({ error: "path required" });
  }

  try {
    db.prepare(
      `INSERT INTO pageviews (path, referrer, screen_width)
       VALUES (?, ?, ?)`
    ).run(
      path.slice(0, 512),
      (referrer || "").slice(0, 512) || null,
      typeof screen === "number" ? screen : null
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

  return res.json({
    totalViews,
    uniquePaths,
    topPages,
    dailyViews,
    topReferrers,
    deviceBreakdown,
    days,
  });
});

module.exports = router;
