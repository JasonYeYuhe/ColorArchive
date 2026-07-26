const crypto = require("crypto");
const db = require("./db");
const { getSessionUser } = require("./auth");
const { getRateLimitKey } = require("./client-ip");

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

// Limits per tier per day.
//
// `pro: Infinity` LOOKS like a bug — unmetered access to a metered vendor for
// $3.47/month — and a 50/day cap was drafted for exactly that reason. It was
// reverted, because "unlimited AI" is not a loose marketing phrase here: it is a
// documented promise in the Terms of Service (src/components/terms-page.tsx:16),
// on the Pro page, in the upgrade modal, in both English and Chinese sales copy
// (src/lib/i18n.ts), and in two transactional emails. Quietly converting our one
// paying subscriber from unlimited to 50/day would be a broken contract, and
// discovering that from a 429 is worse than the cost we were avoiding.
//
// Containment therefore lives where it does not require lying to a customer:
//   * BURST_PER_MIN below — stops scripting without touching normal use.
//   * The global daily spend breaker in ai-budget.js — a system-wide safety
//     valve rather than a per-account quota, which is the ordinary meaning of
//     "unlimited" in any subscription (fair use, no unreasonable automation).
// At the burst ceiling of 10/min, the spend breaker binds long before any daily
// per-user number would, so the tighter of the two controls is already the one
// that is honest about what it is.
//
// AI_PRO_DAILY_LIMIT exists as an operator lever if abuse ever appears. Leave it
// unset — setting it makes the Terms wrong until that copy changes too.
const TIER_LIMITS = {
  anonymous: 3,
  free: 10,
  get pro() {
    const raw = Number(process.env.AI_PRO_DAILY_LIMIT);
    return Number.isFinite(raw) && raw > 0 ? raw : Infinity;
  },
};

// Per-minute burst ceilings. The daily quota alone lets a botnet spend the whole
// day's budget in one second, long before any digest or alert could fire.
const BURST_PER_MIN = { anonymous: 2, free: 5, pro: 10 };
const GLOBAL_BURST_PER_MIN = 30;

// Fixed one-minute window, in memory. Deliberately not in sqlite: a burst
// limiter is worthless if measuring it costs a write on the same handle that
// serves the payment webhooks.
let burstWindow = { startedAt: Date.now(), counts: new Map(), total: 0 };
function burstCheck(identifier, tier) {
  const now = Date.now();
  if (now - burstWindow.startedAt >= 60_000) {
    burstWindow = { startedAt: now, counts: new Map(), total: 0 };
  }
  if (burstWindow.total >= GLOBAL_BURST_PER_MIN) return { ok: false, scope: "global" };
  const used = burstWindow.counts.get(identifier) || 0;
  const cap = BURST_PER_MIN[tier] ?? BURST_PER_MIN.anonymous;
  if (used >= cap) return { ok: false, scope: "identifier" };
  burstWindow.counts.set(identifier, used + 1);
  burstWindow.total += 1;
  return { ok: true };
}

function today() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function ipHash(req) {
  // getRateLimitKey() derives from req.ip (which honors `trust proxy`), never
  // the raw left-most X-Forwarded-For entry — that value is client-spoofable and
  // would let an attacker mint a fresh bucket per request. It also collapses
  // IPv6 to its /64 network prefix, because a single subscriber typically
  // controls a whole /64 and could otherwise rotate suffixes for free buckets.
  // Must match /ai/usage's keying or the badge disagrees with enforcement.
  const ip = getRateLimitKey(req);
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

  // Burst ceiling is checked BEFORE the daily quota so a flood is rejected
  // without touching the database at all.
  const burst = burstCheck(identifier, tier);
  if (!burst.ok) {
    return res.status(429).json({
      error:
        burst.scope === "global"
          ? "AI is busy right now. Please try again in a minute."
          : "Too many AI requests in a row. Please wait a moment.",
      retryAfter: Math.ceil((burstWindow.startedAt + 60_000 - Date.now()) / 1000),
      // NOT `limit: true` — that shape drives the upgrade modal, and a burst
      // block is about pacing, not about the plan you are on.
      burst: true,
    });
  }

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
        // A credit is real currency, so a server-side failure has to give it
        // back as well — not just the day's counter.
        refundOnServerError(req, res, identifier, dateKey, userId);
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

  refundOnServerError(req, res, identifier, dateKey);

  return next();
}

/**
 * Give the quota back when WE failed, not when the user changed their mind.
 *
 * The quota is still debited up-front (fail-safe: a route that forgets to
 * commit must not hand out free inference), but a model 5xx, a malformed-JSON
 * parse failure or a timeout used to silently cost an anonymous visitor a third
 * of their day for zero output. During the two months the model name was wrong,
 * every single request was in that category.
 *
 * Idempotency is structural rather than bolted on: the hook is bound to one
 * request object, fires once, and is scoped by a `refunded` flag — so there is
 * exactly one possible decrement per increment. That closes the hole a naive
 * "refund endpoint" would open, where a client-abort loop mints free quota.
 * Deliberately keyed on an explicit 5xx: an aborted request finishes without a
 * server error status, so walking away cannot farm quota either.
 */
function refundOnServerError(req, res, identifier, dateKey, creditUserId = null) {
  let refunded = false;
  res.on("finish", () => {
    if (refunded || res.statusCode < 500) return;
    refunded = true;
    try {
      db.prepare(
        "UPDATE ai_usage SET count = MAX(count - 1, 0) WHERE identifier = ? AND date = ?"
      ).run(identifier, dateKey);
      if (creditUserId) {
        db.prepare("UPDATE users SET credits = credits + 1 WHERE id = ?").run(creditUserId);
      }
      console.error(`[ai-quota] refunded 1 to ${identifier} after HTTP ${res.statusCode}`);
    } catch {
      /* a failed refund must never turn into a second failure */
    }
  });
}

module.exports = { aiRateLimit, TIER_LIMITS };
