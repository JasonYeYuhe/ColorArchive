const express = require("express");
const router = express.Router();
const db = require("../db");
const { getSessionUser, isAnalyticsAdmin } = require("../auth");
const { getRateLimitKey } = require("../client-ip");
const { rejectBotAnalytics } = require("../bot-detect");

// Simple in-memory rate limiter: max 60 writes per IP per minute.
//
// This read `req.ip` directly until 2026-07-26, which sounds equivalent to
// keying on the client but was not: nginx never set X-Forwarded-For, so with
// `trust proxy = 1` every request resolved to the loopback address and this
// became a SITE-WIDE 60 writes/minute cap. It was measurably harmful, not
// theoretical — nginx logs for 07-12..07-26 show 516 `POST /pageviews` and 509
// `POST /events` rejections with 429, all from real browser user-agents. Our own
// funnel measurement looked lossy — but read client-ip.js before repeating that:
// 1,024 of those 1,025 429s were ONE flooding address on ONE day, correctly
// throttled. The real defect is that the cap was GLOBAL, so any noisy caller could
// throttle everyone else. Route through getRateLimitKey() so the key is the real
// client (and so an IPv6 /64 cannot mint unlimited buckets).
const writeCounters = new Map();
setInterval(() => writeCounters.clear(), 60_000);
function rateLimitWrite(req, res, next) {
  const key = getRateLimitKey(req) || "unknown";
  const count = writeCounters.get(key) || 0;
  if (count >= 60) return res.status(429).json({ error: "Rate limit exceeded" });
  writeCounters.set(key, count + 1);
  next();
}

// POST /events — fire-and-forget event tracking.
//
// The bot filter runs FIRST, before the rate limiter, for two reasons: a dropped
// write should not consume a human's rate-limit budget, and 28.6% of the traffic
// arriving here was never a person (see bot-detect.js for the measurement).
// Impression-style events are the worst affected — this table is 84%
// `recruit_banner_impression`, which jumped from 50 rows in June to 3,900 in July.
router.post("/", rejectBotAnalytics(200), rateLimitWrite, (req, res) => {
  const { event, props = {}, path, sessionId } = req.body ?? {};

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
         (event_name, props_json, user_id, session_id, path, channel, utm_source, utm_medium, utm_campaign, referrer_domain, landing_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      event.slice(0, 100),
      JSON.stringify(p),
      user?.id ?? null,
      // session_id has existed in the schema since the table was created and was
      // populated in 0 of 4,690 rows. It is what makes a per-visit ratio possible:
      // COUNT(DISTINCT session_id) instead of COUNT(*), so one person scrolling
      // past the AI card fifty times counts once. Client-supplied and ephemeral
      // (sessionStorage) — never trust it for anything but division.
      typeof sessionId === "string" && sessionId.length <= 64 ? sessionId : null,
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
