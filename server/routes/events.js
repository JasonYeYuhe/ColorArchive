const express = require("express");
const router = express.Router();
const db = require("../db");
const { getSessionUser, isAnalyticsAdmin } = require("../auth");

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

// POST /events — fire-and-forget event tracking
router.post("/", rateLimitWrite, (req, res) => {
  const { event, props = {}, path } = req.body ?? {};

  if (!event || typeof event !== "string") {
    return res.status(400).json({ error: "Missing event name" });
  }

  const user = getSessionUser(req);
  const p = props && typeof props === "object" ? props : {};
  // First-touch acquisition source rides on every event's props (see src/lib/attribution).
  // Mirror the key fields into dedicated columns so the funnel can be GROUP BY channel.
  // Redact email-like substrings (defense-in-depth: utm_* are free text stored in plaintext;
  // the client scrubs too, but a direct POST could smuggle PII into the admin-readable store).
  const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const str = (v, max) => (typeof v === "string" && v ? v.replace(EMAIL_RE, "[redacted]").slice(0, max) : null);

  try {
    db.prepare(
      `INSERT INTO events
         (event_name, props_json, user_id, path, channel, utm_source, utm_medium, utm_campaign, referrer_domain, landing_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      event.slice(0, 100),
      JSON.stringify(p),
      user?.id ?? null,
      typeof path === "string" ? path.slice(0, 500) : null,
      str(p.channel, 60),
      str(p.utm_source, 120),
      str(p.utm_medium, 120),
      str(p.utm_campaign, 120),
      str(p.referrer_domain, 120),
      str(p.landing_path, 200),
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

  // Per-channel breakdown of each event — the "split by source" the exit gate needs to
  // tell qualified ICP traffic apart from generic gawkers.
  const byChannel = db.prepare(`
    SELECT event_name, COALESCE(NULLIF(channel, ''), 'unknown') as channel, COUNT(*) as count
    FROM events
    WHERE created_at >= ?
    GROUP BY event_name, channel
    ORDER BY event_name ASC, count DESC
  `).all(since);

  return res.json({ counts, daily, byChannel, days });
});

module.exports = router;
