const express = require("express");
const router = express.Router();
const db = require("../db");
const { getSessionUser, isAnalyticsAdmin } = require("../auth");

// Simple in-memory rate limiter: max 60 writes per IP per minute
const writeCounters = new Map();
setInterval(() => writeCounters.clear(), 60_000);
function rateLimitWrite(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const count = writeCounters.get(ip) || 0;
  if (count >= 60) return res.status(429).json({ error: "Rate limit exceeded" });
  writeCounters.set(ip, count + 1);
  next();
}

// POST /events — fire-and-forget event tracking
router.post("/", rateLimitWrite, (req, res) => {
  const { event, props = {}, path } = req.body ?? {};

  if (!event || typeof event !== "string") {
    return res.status(400).json({ error: "Missing event name" });
  }

  const user = getSessionUser(req);

  try {
    db.prepare(
      "INSERT INTO events (event_name, props_json, user_id, path) VALUES (?, ?, ?, ?)"
    ).run(
      event.slice(0, 100),
      JSON.stringify(typeof props === "object" ? props : {}),
      user?.id ?? null,
      typeof path === "string" ? path.slice(0, 500) : null,
    );
  } catch {
    // Don't let tracking errors break the user experience
  }

  return res.json({ ok: true });
});

// GET /events/summary — aggregate event counts (admin only)
router.get("/summary", (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (!isAnalyticsAdmin(user)) return res.status(403).json({ error: "Forbidden" });

  const days = parseInt(String(req.query.days)) || 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const counts = db.prepare(`
    SELECT event_name, COUNT(*) as count
    FROM events
    WHERE created_at >= ?
    GROUP BY event_name
    ORDER BY count DESC
  `).all(since);

  const daily = db.prepare(`
    SELECT date(created_at) as day, event_name, COUNT(*) as count
    FROM events
    WHERE created_at >= ?
    GROUP BY day, event_name
    ORDER BY day DESC
  `).all(since);

  return res.json({ counts, daily, days });
});

module.exports = router;
