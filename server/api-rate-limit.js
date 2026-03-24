const crypto = require("crypto");
const db = require("./db");

// API rate limits per hour
const API_TIER_LIMITS = {
  anonymous: 60,     // No API key, IP-based
  free: 1000,        // Free API key
  pro: 10000,        // Pro API key
};

function ipHash(req) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  return "api_ip:" + crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function currentHour() {
  const d = new Date();
  return `${d.toISOString().slice(0, 13)}`;
}

// Reuse ai_usage table with "api:" prefix for identifiers
function getApiUsage(identifier, hour) {
  const row = db.prepare("SELECT count FROM ai_usage WHERE identifier = ? AND date = ?").get(identifier, hour);
  return row ? row.count : 0;
}

function incrementApiUsage(identifier, hour) {
  db.prepare(
    `INSERT INTO ai_usage (identifier, date, count) VALUES (?, ?, 1)
     ON CONFLICT(identifier, date) DO UPDATE SET count = count + 1`
  ).run(identifier, hour);
}

function lookupApiKey(key) {
  if (!key) return null;
  return db.prepare("SELECT id, tier FROM users WHERE api_key = ?").get(key);
}

/**
 * Express middleware for API rate limiting.
 * Checks API key from Authorization header or query param.
 * Sets X-RateLimit-* headers on response.
 */
function apiRateLimit(req, res, next) {
  // Extract API key
  const authHeader = req.headers.authorization;
  const key = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.query.api_key;

  let tier = "anonymous";
  let identifier;

  if (key) {
    const user = lookupApiKey(key);
    if (user) {
      tier = user.tier || "free";
      identifier = "api_user:" + user.id;
    } else {
      return res.status(401).json({ error: "Invalid API key." });
    }
  } else {
    identifier = ipHash(req);
  }

  const limit = API_TIER_LIMITS[tier] ?? API_TIER_LIMITS.anonymous;
  const hour = currentHour();
  const used = getApiUsage(identifier, hour);
  const remaining = Math.max(0, limit - used);

  // Set rate limit headers
  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", new Date(new Date().setMinutes(60, 0, 0)).toISOString());

  if (used >= limit) {
    res.setHeader("Retry-After", "3600");
    return res.status(429).json({
      error: "API rate limit exceeded.",
      limit,
      used,
      tier,
      retryAfter: 3600,
    });
  }

  incrementApiUsage(identifier, hour);
  return next();
}

module.exports = { apiRateLimit, API_TIER_LIMITS };
