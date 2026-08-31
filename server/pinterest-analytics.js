/**
 * Pinterest pin analytics — read-only.
 *
 * ─── WHY THIS FILE EXISTS, AND WHY IT DID NOT NEED AN OAuth RE-AUTH ─────────
 *
 * `docs/dev-plan-2026-09-01-paid.md` §6.5 said the impression data was
 * unreachable without re-running OAuth for an "analytics scope". Measured on
 * prod 2026-09-01, that is **wrong**, and it is worth writing down why so the
 * conclusion is not re-derived a third time:
 *
 *   GET /v5/pins/{id}/analytics      → 200 with scope `pins:read`   ✅
 *   GET /v5/user_account/analytics   → 401 Missing ['user_accounts:read'] ❌
 *   GET /v5/user_account             → 401 Missing ['user_accounts:read'] ❌
 *
 * Pinterest gates ACCOUNT-level analytics behind `user_accounts:read`. PIN-level
 * analytics rides on `pins:read`, which the org token has held since 2026-06-10.
 * So the per-pin impression/save/click history for every pin we have ever
 * published was available the whole time — nobody had written the fetch.
 *
 * There is no `analytics:read` scope in Pinterest API v5 at all. Asking the owner
 * to click through a re-authorization would have bought us the account-level
 * roll-up (nice-to-have) and nothing that changes the §6 decision.
 *
 * ─── THE ONE TRAP: THIS MODULE MUST NOT REFRESH THE TOKEN ──────────────────
 *
 * Pinterest ROTATES the refresh token on every refresh_token grant
 * (pinterest-admin.js doRefresh: `if (data.refresh_token) tokenStore.refresh_token = ...`).
 * The long-running server already refreshes on boot + every 12h. If a CLI
 * read-out ALSO refreshed, two processes would race for one rotating credential
 * and the loser would persist a refresh_token Pinterest has already retired —
 * silently breaking daily pinning at the next 12h tick, days later, with no
 * connection to the read-out that caused it.
 *
 * So: `retryOn401: false` everywhere below, and a hard failure with an
 * instruction instead. A read-out is never worth risking the publish path.
 */

const fs = require("fs");
const path = require("path");

const PINTEREST_API_BASE =
  process.env.PINTEREST_SANDBOX === "true"
    ? "https://api-sandbox.pinterest.com/v5"
    : "https://api.pinterest.com/v5";

const TOKEN_FILE = path.join(__dirname, ".pinterest-admin-token.json");
const PIN_LOG = path.join(__dirname, ".pin-log.json");

/** Metric types confirmed working against pin-level analytics on prod. */
const PIN_METRICS = ["IMPRESSION", "PIN_CLICK", "OUTBOUND_CLICK", "SAVE"];

/**
 * Read the org token WITHOUT the side effects of pinterest-admin.init()
 * (which fires a refresh and installs a 12h interval that would keep a CLI
 * process alive forever). See the trap note above.
 */
function readTokenStore() {
  const raw = fs.readFileSync(TOKEN_FILE, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed.access_token) throw new Error(`no access_token in ${TOKEN_FILE}`);
  return parsed;
}

function readPinLog() {
  return JSON.parse(fs.readFileSync(PIN_LOG, "utf8"));
}

/**
 * Every real (non-dry-run) published pin, oldest first.
 * Key shape is `YYYY-MM-DD-{type}-{slug}` — the date prefix is the scheduling
 * date; `entry.at` is the actual publish instant and is what we key dates off.
 */
function publishedPins(log = readPinLog()) {
  return Object.entries(log)
    .filter(([, v]) => v && v.pinId && !v.dryRun)
    .map(([key, v]) => ({
      key,
      pinId: v.pinId,
      at: v.at,
      date: String(v.at || key).slice(0, 10),
      type: v.type || key.split("-")[3] || "unknown",
      slug: v.slug,
      title: v.title,
      link: v.link,
      boardId: v.boardId,
    }))
    .sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token.access_token}` };
}

async function apiGet(pathname, token) {
  const res = await fetch(`${PINTEREST_API_BASE}${pathname}`, {
    headers: authHeaders(token),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { _raw: text };
  }
  if (res.status === 401) {
    throw new Error(
      `401 from ${pathname}. NOT auto-refreshing on purpose (see header note). ` +
        `If the token genuinely expired, let the server's own 12h refresh handle it, ` +
        `or re-run OAuth via /pinterest/admin/auth/start. Body: ${text.slice(0, 300)}`
    );
  }
  return { ok: res.ok, status: res.status, body };
}

/** Lifetime-to-`endDate` metrics for one pin. */
async function fetchPinAnalytics(pinId, { startDate, endDate, token, metrics = PIN_METRICS }) {
  const qs = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    metric_types: metrics.join(","),
  });
  const { ok, status, body } = await apiGet(
    `/pins/${encodeURIComponent(pinId)}/analytics?${qs}`,
    token
  );
  if (!ok) return { ok: false, status, error: body };

  // Shape: { all: { summary_metrics: {...}, daily_metrics: [...] } }
  const summary = body?.all?.summary_metrics || {};
  const daily = body?.all?.daily_metrics || [];
  return {
    ok: true,
    summary: Object.fromEntries(metrics.map((m) => [m, Number(summary[m] || 0)])),
    // Days Pinterest actually had the pin live and measurable.
    readyDays: daily.filter((d) => d?.data_status === "READY").length,
    daily,
  };
}

/**
 * The pin as Pinterest itself stores it — used to verify the image aspect ratio
 * from the PLATFORM's side rather than by fetching our own og-image and
 * measuring it. `media.images` is keyed by size label; each has width/height.
 */
async function fetchPinMeta(pinId, token) {
  const { ok, status, body } = await apiGet(`/pins/${encodeURIComponent(pinId)}`, token);
  if (!ok) return { ok: false, status, error: body };

  const images = body?.media?.images || {};
  const sizes = Object.entries(images)
    .map(([label, img]) => ({
      label,
      width: Number(img?.width || 0),
      height: Number(img?.height || 0),
    }))
    .filter((s) => s.width > 0 && s.height > 0);

  // "originals" is the uncropped upload; fall back to the largest available.
  const original =
    sizes.find((s) => s.label === "originals") ||
    sizes.sort((a, b) => b.width * b.height - a.width * a.height)[0] ||
    null;

  return {
    ok: true,
    createdAt: body?.created_at,
    dominantColor: body?.dominant_color,
    hasBeenPromoted: body?.has_been_promoted,
    original,
    sizes,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  PINTEREST_API_BASE,
  PIN_METRICS,
  readTokenStore,
  readPinLog,
  publishedPins,
  fetchPinAnalytics,
  fetchPinMeta,
  sleep,
};
