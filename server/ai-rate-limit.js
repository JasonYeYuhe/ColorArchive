const crypto = require("crypto");
const db = require("./db");
const { getSessionUser } = require("./auth");

// Lazy-load email to avoid circular deps
let sendProUpsellEmail = null;
function getSendProUpsellEmail() {
  if (!sendProUpsellEmail) {
    try {
      sendProUpsellEmail = require("./email").sendProUpsellEmail;
    } catch {
      sendProUpsellEmail = () => {};
    }
  }
  return sendProUpsellEmail;
}

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
  // Use req.ip (Express resolves the real client IP via `trust proxy`). Do NOT
  // read the left-most X-Forwarded-For entry — that value is client-controlled
  // and lets an attacker mint a fresh rate-limit bucket per request.
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
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

function getUserCredits(userId) {
  const row = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId);
  return row ? row.credits : 0;
}

function consumeCredit(userId) {
  db.prepare("UPDATE users SET credits = MAX(credits - 1, 0) WHERE id = ?").run(userId);
}

/**
 * Express middleware that enforces AI generation rate limits.
 * Credits are consumed first before falling back to tier limits.
 * Returns 429 when limit is exceeded.
 */
function aiRateLimit(req, res, next) {
  const user = getSessionUser(req);
  let tier = "anonymous";
  let identifier;
  let userId = null;

  if (user) {
    tier = user.tier || "free";
    identifier = "user:" + user.id;
    userId = user.id;
  } else {
    identifier = ipHash(req);
  }

  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.anonymous;
  const dateKey = today();
  const used = getUsage(identifier, dateKey);

  if (used >= limit) {
    // Check if user has credits to spend
    if (userId) {
      const credits = getUserCredits(userId);
      if (credits > 0) {
        consumeCredit(userId);
        incrementUsage(identifier, dateKey);
        req.aiTier = tier;
        req.aiIdentifier = identifier;
        req.aiUsed = used + 1;
        req.aiLimit = limit;
        req.aiCreditsUsed = true;
        return next();
      }
    }

    // Trigger Pro upsell email for free-tier users (max 1/day, fire-and-forget)
    if (userId && tier === "free") {
      const upsellKey = `upsell:${userId}`;
      const alreadySent = getUsage(upsellKey, dateKey);
      if (alreadySent === 0) {
        incrementUsage(upsellKey, dateKey);
        const userRow = db.prepare("SELECT email FROM users WHERE id = ?").get(userId);
        if (userRow) {
          const send = getSendProUpsellEmail();
          if (send) send(userRow.email).catch(() => {});
        }
      }
    }

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
