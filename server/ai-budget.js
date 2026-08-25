/**
 * Global daily spend ceiling for Gemini calls.
 *
 * WHY THIS EXISTS — and why it is not a cost-savings feature. Measured spend is
 * about $0.02/month (83 model calls since 2026-04-02, 7 in July) against a ~$74
 * Vercel bill, so there is nothing here worth economising. What this bounds is
 * the WORST CASE. Until 2026-07-26 every per-IP limit in the API collapsed into
 * one shared bucket (see client-ip.js), which meant the anonymous AI limit was
 * accidentally fail-closed. Fixing that turns 3/day-for-the-entire-internet into
 * a real per-IP limit with no ceiling above it, and the tier table had
 * `pro: Infinity`. Scripted at 1 req/s that is ~2.6M requests/month — roughly
 * $8,000 on the old default model. A solo operator cannot watch a dashboard, so
 * the ceiling has to be in the code.
 *
 * ORDERING IS A HARD DEPENDENCY: this module must be live in the same deploy as
 * the nginx X-Forwarded-For fix, or earlier. Shipping the identity fix first
 * opens the exposure this file exists to contain.
 *
 * STORAGE — deliberately one row per day in the EXISTING `ai_usage` table
 * (identifier `global:ai-spend-micros`), not a new telemetry table. Two reasons:
 *   1. The same better-sqlite3 handle serves the audit-grade subscription
 *      lifecycle on a 1 vCPU / ~395MB droplet. A per-request telemetry table
 *      would be unsized write contention against the payment webhook path.
 *      One UPSERT per model call, on a route that sees well under one call a
 *      day, is not.
 *   2. It survives `pm2 restart`. An in-memory counter would reset the ceiling
 *      on every crash, which is exactly when you want it to hold.
 *
 * Cost is tracked in micro-dollars (integers) because the `count` column is an
 * INTEGER and float accumulation would drift.
 */

const db = require("./db");

/**
 * USD per 1M tokens. Only models confirmed callable on OUR key are listed —
 * being present in the /models listing is not the same as being callable, as the
 * 2.5-flash-lite note below records. An unknown model falls back to the most
 * expensive entry, so a typo in GEMINI_MODEL cannot silently buy a bigger bill.
 */
const PRICING = {
  // gemini-2.5-flash-lite is deliberately absent: the models endpoint lists it,
  // but generateContent answers 404 "no longer available to new users" on our
  // key. Verified by live call 2026-07-26, which is also how it was caught.
  "gemini-3.1-flash-lite": { in: 0.3, out: 2.5 },
  "gemini-2.5-flash": { in: 0.3, out: 2.5 },
};
const FALLBACK_PRICE = { in: 2.0, out: 12.0 };

// NOTE on the 3.1-flash-lite figure above: circulated research put it at
// $0.25/$1.50, but every 3.x price row in that research was unverifiable from
// here, so it is priced at the 2.5-flash rate instead — a deliberate
// over-estimate. For a circuit breaker, over-charging trips slightly early,
// which is the safe direction; under-charging is how a breaker gets outrun.

const SPEND_KEY = "global:ai-spend-micros";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function budgetMicros() {
  const raw = Number(process.env.GEMINI_DAILY_BUDGET_USD);
  // $0.50/day. The first draft was $2/day, which review correctly called out as
  // ~$60/month — over 17x total monthly revenue, so not much of a ceiling. At
  // the flash-lite default this still buys ~1,300 requests a day against a
  // measured demand of five per fortnight, so honest traffic cannot reach it,
  // while the worst case stays smaller than the Vercel bill.
  const usd = Number.isFinite(raw) && raw > 0 ? raw : 0.5;
  return Math.round(usd * 1_000_000);
}

function spentMicrosToday() {
  const row = db
    .prepare("SELECT count FROM ai_usage WHERE identifier = ? AND date = ?")
    .get(SPEND_KEY, today());
  return row ? row.count : 0;
}

/**
 * Conservative pre-flight estimate: prompt length / 4 for input tokens, and the
 * FULL output allowance for output tokens. Over-estimating is the safe
 * direction — the breaker should trip early rather than late, and thinking
 * tokens (billed at the output rate) are why the old default was ~3x its
 * apparent cost.
 */
function estimateCostMicros({ model, promptChars = 0, maxOutputTokens = 900 }) {
  const price = PRICING[model] ?? FALLBACK_PRICE;
  const inTokens = Math.ceil(promptChars / 4);
  const usd = (inTokens * price.in + maxOutputTokens * price.out) / 1_000_000;
  return Math.max(1, Math.round(usd * 1_000_000));
}

function recordSpendMicros(micros) {
  if (!Number.isFinite(micros) || micros <= 0) return;
  db.prepare(
    `INSERT INTO ai_usage (identifier, date, count) VALUES (?, ?, ?)
     ON CONFLICT(identifier, date) DO UPDATE SET count = count + excluded.count`
  ).run(SPEND_KEY, today(), Math.round(micros));
}

function budgetStatus() {
  const spent = spentMicrosToday();
  const budget = budgetMicros();
  return {
    tripped: spent >= budget,
    spentMicros: spent,
    budgetMicros: budget,
    spentUsd: spent / 1_000_000,
    budgetUsd: budget / 1_000_000,
  };
}

/**
 * Express middleware. Sits in front of the model-calling routes only — never in
 * front of anything on the money path.
 *
 * Returns 503 with a plain `error` string because that is what the existing
 * clients already surface verbatim (src/lib/error-utils.ts passes a server
 * message straight through). Deliberately NOT a 429 with `limit: true`: that
 * shape drives the upgrade modal, and telling a paying subscriber to upgrade
 * because WE hit OUR ceiling would be a lie. The wording avoids the substrings
 * error-utils rewrites ("503", "not configured", "network").
 */
function aiBudgetGuard(req, res, next) {
  let status;
  try {
    status = budgetStatus();
  } catch {
    // A breaker that fails closed on a read error would take the feature down
    // for a schema hiccup. Per-request and per-day limits still apply.
    return next();
  }

  if (status.tripped) {
    console.error(
      `[ai-budget] daily ceiling reached: $${status.spentUsd.toFixed(4)} of $${status.budgetUsd.toFixed(2)} — serving no model calls until UTC midnight`
    );
    return res.status(503).json({
      error:
        "AI is resting for today — the daily generation budget is used up. The archive tools (contrast, colorblind, compare) are all still available.",
      budgetExhausted: true,
    });
  }

  req.aiBudget = status;
  return next();
}

/**
 * Consecutive model-call failures, surfaced through /health.
 *
 * THIS EXACT BUG CLASS HAS ALREADY COST THIS PROJECT TWO MONTHS. The model id
 * was once hardcoded to `gemini-3-flash`, which does not exist; every AI request
 * 404'd from roughly 2026-04-23 onward and nobody noticed, because a feature
 * nobody uses fails silently by definition. It recurred while deploying this very
 * change: `gemini-2.5-flash-lite` is listed by the models endpoint but returns
 * "no longer available to new users" on generateContent, so the first live call
 * after deploy 500'd.
 *
 * A boot-time probe would cost a paid API call on every restart, so instead the
 * first real call reports. Nothing here retries or falls back to another model:
 * silently switching models would hide the very signal this exists to raise.
 */
let modelFailStreak = 0;
let lastModelError = null;

function recordModelOutcome(ok, errorMessage) {
  if (ok) {
    modelFailStreak = 0;
    lastModelError = null;
    return;
  }
  modelFailStreak += 1;
  lastModelError = String(errorMessage || "unknown").slice(0, 200);
}

function modelHealth() {
  if (modelFailStreak === 0) return "ok";
  // Three in a row is past coincidence: a bad model id fails every time, whereas
  // a transient upstream blip does not.
  const severity = modelFailStreak >= 3 ? "failing" : "degraded";
  return `${severity}: ${modelFailStreak} consecutive model errors (${lastModelError})`;
}

module.exports = {
  aiBudgetGuard,
  budgetStatus,
  estimateCostMicros,
  recordSpendMicros,
  recordModelOutcome,
  modelHealth,
  PRICING,
};
