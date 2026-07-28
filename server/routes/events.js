const express = require("express");
const router = express.Router();
const db = require("../db");
const { getSessionUser, isAnalyticsAdmin } = require("../auth");
const { getRateLimitKey } = require("../client-ip");
const { rejectBotAnalytics, dailyCapGuard } = require("../bot-detect");

// In-memory per-caller write limiter for the analytics path.
//
// This read `req.ip` directly until 2026-07-26, which sounds equivalent to
// keying on the client but was not: nginx never set X-Forwarded-For, so with
// `trust proxy = 1` every request resolved to the loopback address and this
// became a SITE-WIDE cap shared by everyone. It was measurably harmful, not
// theoretical — nginx logs for 07-12..07-26 show 516 `POST /pageviews` and 509
// `POST /events` rejections with 429, all from real browser user-agents. Our own
// funnel measurement looked lossy — but read client-ip.js before repeating that:
// 1,024 of those 1,025 429s were ONE flooding address on ONE day, correctly
// throttled. The real defect is that the cap was GLOBAL, so any noisy caller could
// throttle everyone else. Route through getRateLimitKey() so the key is the real
// client (and so an IPv6 /64 cannot mint unlimited buckets).
// 25 writes/minute/caller.
//
// FALSIFIED AT 15 BY OUR OWN LOGS. The comment here claimed "~5x headroom over a
// real person". On 2026-07-27 20:56, caller 70.112.65.60 — a single Safari UA, the
// very session elsewhere described as the largest genuine human session on this
// site — put ALL 14 of its pageviews inside ONE minute. Against a cap of 15 that is
// one request of headroom, not five times. A tab-restore or a fast scroll through a
// colour family would have clipped a real visitor.
//
// Rate still discriminates where daily volume does not, which is why this carries
// the load: observed floods run 253/min, 55/min and 22/min sustained, while the
// fastest real callers reach 14/min and 9/min. 25 sits above every human burst seen
// and still cuts a 253/min flood by 90% from its first second. The sustained-22/min
// class slips past this one and is caught by the 200/day backstop in bot-detect.js
// instead — the two limits are layered on purpose, one for bursts and one for
// patience, because neither separates the populations alone.
//
// Derive any future value from COMPLETE UTC days. The 15 came from a partial one.
const PER_MINUTE_CAP = Number(process.env.ANALYTICS_PER_MINUTE_CAP) || 25;

const writeCounters = new Map();
setInterval(() => writeCounters.clear(), 60_000);
function rateLimitWrite(req, res, next) {
  const key = getRateLimitKey(req) || "unknown";
  const count = writeCounters.get(key) || 0;
  if (count >= PER_MINUTE_CAP) return res.status(429).json({ error: "Rate limit exceeded" });
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
router.post("/", rejectBotAnalytics(200), rateLimitWrite, dailyCapGuard(200), (req, res) => {
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
