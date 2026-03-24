const crypto = require("crypto");
const db = require("./db");
const { getSessionUser } = require("./auth");

// Limits per tier per day
const TIER_LIMITS = {
  anonymous: 3,
  free: 10,
  pro: Infinity,
};

function today() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function ipHash(req) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  return "ip:" + crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function getUsage(identifier, date) {
  const row = db.prepare("SELECT count FROM ai_usage WHERE identifier = ? AND date = ?").get(identifier, date);
  return row ? row.count : 0;
}

function incrementUsage(identifier, date) {
  db.prepare(
    `INSERT INTO ai_usage (identifier, date, count) VALUES (?, ?, 1)
     ON CONFLICT(identifier, date) DO UPDATE SET count = count + 1`
  ).run(identifier, date);
}

/**
 * Express middleware that enforces AI generation rate limits.
 * Attaches req.aiTier and req.aiIdentifier for downstream use.
 * Returns 429 when limit is exceeded.
 */
function aiRateLimit(req, res, next) {
  const user = getSessionUser(req);
  let tier = "anonymous";
  let identifier;

  if (user) {
    tier = user.tier || "free";
    identifier = "user:" + user.id;
  } else {
    identifier = ipHash(req);
  }

  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.anonymous;
  const dateKey = today();
  const used = getUsage(identifier, dateKey);

  if (used >= limit) {
    return res.status(429).json({
      error: "Daily AI generation limit reached.",
      limit: true,
      tier,
      used,
      dailyLimit: limit,
      upgradeUrl: tier === "anonymous" ? "/login" : "/pro",
      upgradeMessage:
        tier === "anonymous"
          ? "Sign in for 10 free AI generations per day."
          : tier === "free"
            ? "Upgrade to Pro for unlimited AI generations."
            : "Limit reached.",
    });
  }

  // Increment AFTER we know request will proceed
  incrementUsage(identifier, dateKey);

  req.aiTier = tier;
  req.aiIdentifier = identifier;
  req.aiUsed = used + 1;
  req.aiLimit = limit;

  return next();
}

module.exports = { aiRateLimit, TIER_LIMITS };
