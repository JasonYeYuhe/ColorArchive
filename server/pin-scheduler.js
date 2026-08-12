/**
 * Pinterest auto-pinning scheduler.
 *
 * Daily rotation across content types (colors, collections, guides),
 * one daily window per type. Defaults to colors-only at 1 pin/day;
 * operators opt in to additional types by setting env vars.
 *
 * Schedule:
 *   - Daily pin window opens at ~11 AM JST (02:00 UTC), between IG
 *     Story (01:00) and IG Post (03:00) windows. All enabled content
 *     types publish in the same window, spaced ~30s apart.
 *
 * Rate cap: PIN_SCHEDULER_MAX_PER_DAY (default 1, hard ceiling 5).
 *   - At the current 1/day default this behaves identically to
 *     Phase 2b (single COTD pin).
 *   - Ramp to 2 then 3 across successive weeks once Pinterest growth
 *     signals no anti-spam flags on our recent account.
 *
 * Dedup: server/.pin-log.json keyed by `YYYY-MM-DD-{type}-{slug}`.
 *   Same content type can be re-pinned on later dates; same slug
 *   within PIN_REPEAT_DAYS (30 by default) is skipped.
 *
 * Dry-run: PIN_SCHEDULER_DRY_RUN=true logs payloads without calling
 *   the Pinterest API. Still writes to pin-log so we see the intended
 *   rotation.
 */

const fs = require("fs");
const path = require("path");
const { colors, getColorOfDay } = require("./colors");
const pinterestAdmin = require("./pinterest-admin");

const PIN_LOG = path.join(__dirname, ".pin-log.json");
const DEFAULT_BOARD_ID = "855684066641154147"; // "ColorArchive Pro", prod
const BOARD_ID = process.env.PINTEREST_BOARD_COLORS || DEFAULT_BOARD_ID;
const SITE_ORIGIN = (process.env.FRONTEND_ORIGIN || "https://colorarchive.org").replace(/\/$/, "");
const DRY_RUN = process.env.PIN_SCHEDULER_DRY_RUN === "true";

const ENABLED_TYPES = (process.env.PIN_SCHEDULER_CONTENT_TYPES || "color")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const RAW_MAX = parseInt(process.env.PIN_SCHEDULER_MAX_PER_DAY || "1", 10);
const MAX_PER_DAY = Math.max(1, Math.min(5, Number.isFinite(RAW_MAX) ? RAW_MAX : 1));

const RAW_REPEAT = parseInt(process.env.PIN_REPEAT_DAYS || "30", 10);
const REPEAT_DAYS = Math.max(1, Math.min(365, Number.isFinite(RAW_REPEAT) ? RAW_REPEAT : 30));

// Content snapshot fetched from the Next.js app. TTL matches the
// Next.js route's revalidate=3600 — longer on the Droplet side would
// defeat the freshness ISR provides (Gemini P1, 2026-04-17).
const CONTENT_URL = `${SITE_ORIGIN}/api/autopilot/content/`;
let contentCache = null;
let contentCacheAt = 0;
const CONTENT_TTL_MS = 60 * 60 * 1000;

const HOURLY = 60 * 60 * 1000;
const PIN_UTC_HOUR = 2;
const PIN_SPACING_MS = 30 * 1000;
let pinTimer = null;

/* ── Persistence ─────────────────────────────────────────── */

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadPinLog() {
  try {
    if (fs.existsSync(PIN_LOG)) return JSON.parse(fs.readFileSync(PIN_LOG, "utf8"));
  } catch {
    /* ignore */
  }
  return {};
}

function markPinned(key, record) {
  const log = loadPinLog();
  log[key] = { at: new Date().toISOString(), ...record };
  try {
    fs.writeFileSync(PIN_LOG, JSON.stringify(log, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
  } catch (err) {
    console.error("[pin-scheduler] failed to write pin log:", err.message);
  }
}

function alreadyPinnedToday(key) {
  return Boolean(loadPinLog()[key]);
}

/**
 * Was a slug of the same content type pinned within REPEAT_DAYS?
 * Used to avoid re-pinning the same collection/guide too soon even
 * if the dedup key (which includes the date) wouldn't catch it.
 */
function recentlyPinned(type, slug) {
  return recentlyPinnedInLog(loadPinLog(), type, slug);
}

function recentlyPinnedInLog(log, type, slug) {
  const cutoffMs = Date.now() - REPEAT_DAYS * 24 * 60 * 60 * 1000;
  for (const [key, entry] of Object.entries(log)) {
    // key shape: YYYY-MM-DD-{type}-{slug}
    if (!key.includes(`-${type}-${slug}`)) continue;
    const t = Date.parse(entry?.at || "");
    if (Number.isFinite(t) && t >= cutoffMs) return true;
  }
  return false;
}

/**
 * Count pins already produced today for quota enforcement. Must be
 * sourced from the pin-log (not an in-process counter) because the
 * scheduler's hourly tick can fire twice inside the daily window
 * (UTC hour 02 AND 03) — a fresh in-process counter would reset
 * and leak past MAX_PER_DAY (Gemini P0, 2026-04-17).
 */
function pinsTodayFromLog(log, date) {
  let count = 0;
  for (const [key, entry] of Object.entries(log)) {
    if (!key.startsWith(`${date}-`)) continue;
    if (entry?.dryRun) continue; // dry-run entries don't consume quota
    count += 1;
  }
  return count;
}

/* ── Content snapshot ────────────────────────────────────── */

async function fetchContentSnapshot() {
  const now = Date.now();
  if (contentCache && now - contentCacheAt < CONTENT_TTL_MS) return contentCache;
  try {
    const res = await fetch(CONTENT_URL, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`content fetch ${res.status}`);
    contentCache = await res.json();
    contentCacheAt = now;
    return contentCache;
  } catch (err) {
    console.error("[pin-scheduler] content fetch failed:", err.message);
    return contentCache; // may be stale but better than nothing
  }
}

/* ── Deterministic pickers ───────────────────────────────── */

function hashString(s) {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickDeterministic(list, seed) {
  if (!list || list.length === 0) return null;
  return list[hashString(seed) % list.length];
}

/* ── Payload builders ────────────────────────────────────── */

function buildColorPayload(color) {
  const slug = color.id;
  return {
    type: "color",
    slug,
    boardId: BOARD_ID,
    title: `${color.name} — ${color.hex}`.slice(0, 100),
    description: [
      `${color.name} (${color.hex}) — Color of the Day on ColorArchive.`,
      `Hue ${color.hue}°, saturation ${color.saturation}%, lightness ${color.lightness}%.`,
      `Part of the ${color.family} family.`,
      "Browse 5,446 curated colors and export palettes in CSS, Tailwind, Figma tokens.",
    ]
      .join(" ")
      .slice(0, 500),
    link: `${SITE_ORIGIN}/colors/${slug}/`,
    imageUrl: `${SITE_ORIGIN}/colors/${slug}/opengraph-image/`,
    altText: `${color.name} color swatch (${color.hex})`.slice(0, 500),
  };
}

function buildCollectionPayload(collection) {
  const slug = collection.slug;
  const tags = (collection.tags || []).slice(0, 3).join(" · ");
  return {
    type: "collection",
    slug,
    boardId: BOARD_ID,
    title: `${collection.title} palette`.slice(0, 100),
    description: [
      collection.summary || "",
      tags ? `Tags: ${tags}.` : "",
      "Full palette + export formats at ColorArchive.",
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 500),
    link: `${SITE_ORIGIN}/collections/${slug}/`,
    imageUrl: `${SITE_ORIGIN}/collections/${slug}/opengraph-image/`,
    altText: `${collection.title} palette preview`.slice(0, 500),
  };
}

function buildGuidePayload(guide) {
  const slug = guide.slug;
  return {
    type: "guide",
    slug,
    boardId: BOARD_ID,
    title: guide.title.slice(0, 100),
    description: [
      guide.summary || "",
      guide.category ? `Category: ${guide.category}.` : "",
      "Read the full guide on ColorArchive.",
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 500),
    link: `${SITE_ORIGIN}/guides/${slug}/`,
    imageUrl: `${SITE_ORIGIN}/guides/${slug}/opengraph-image/`,
    altText: guide.title.slice(0, 500),
  };
}

/* ── Rotation ────────────────────────────────────────────── */

/**
 * Pick an eligible (not recently-pinned) item from `list`, starting at
 * the deterministic hash offset and advancing until we find one that
 * passes recentlyPinned. If every slug in `list` is blocked, returns
 * null and the caller falls through to the next content type.
 *
 * Previously the picker returned at offset+0 only, so a collision with
 * the 30-day blocklist stalled the rotation entirely for that type
 * even when other slugs were eligible (Gemini P0, 2026-04-17).
 */
function pickEligible(list, type, seed, log) {
  if (!list || list.length === 0) return null;
  const start = hashString(seed) % list.length;
  for (let i = 0; i < list.length; i++) {
    const item = list[(start + i) % list.length];
    const slug = item.slug || item.id;
    if (!recentlyPinnedInLog(log, type, slug)) return item;
  }
  return null;
}

async function pickForType(type, date, log) {
  if (type === "color") {
    const cod = getColorOfDay(date);
    if (!cod) return null;
    const color = colors.find((c) => c.id === cod.id) || cod;
    // For colors we don't walk through the 5,446 list on collision — the
    // daily-hash collision probability is already tiny and mixing COTD
    // determinism with the autopilot skip would diverge from Instagram
    // (which pins the same COTD). If blocked, skip color for the day.
    if (recentlyPinnedInLog(log, "color", color.id)) return null;
    return buildColorPayload(color);
  }

  const snapshot = await fetchContentSnapshot();
  if (!snapshot) return null;

  if (type === "collection") {
    const candidate = pickEligible(snapshot.collections, "collection", `${date}-collection`, log);
    if (!candidate) return null;
    return buildCollectionPayload(candidate);
  }

  if (type === "guide") {
    const candidate = pickEligible(snapshot.guides, "guide", `${date}-guide`, log);
    if (!candidate) return null;
    return buildGuidePayload(candidate);
  }

  console.warn(`[pin-scheduler] unknown content type: ${type}`);
  return null;
}

async function pinOne(payload, dedupKey) {
  if (DRY_RUN) {
    console.log(`[pin-scheduler] DRY-RUN would pin: ${payload.title} (${payload.link})`);
    markPinned(dedupKey, {
      dryRun: true,
      type: payload.type,
      slug: payload.slug,
      title: payload.title,
    });
    return { ok: true, dryRun: true };
  }

  if (!pinterestAdmin.hasToken()) {
    console.error("[pin-scheduler] no admin token; aborting pin");
    return { ok: false, reason: "no-token" };
  }

  try {
    const pin = await pinterestAdmin.publishPin(payload);
    console.log(`[pin-scheduler] pinned ${pin.id} — ${payload.title}`);
    markPinned(dedupKey, {
      type: payload.type,
      slug: payload.slug,
      title: payload.title,
      link: payload.link,
      pinId: pin.id,
      boardId: payload.boardId,
    });
    return { ok: true, pinId: pin.id };
  } catch (err) {
    console.error("[pin-scheduler] publish failed:", err.message);
    return { ok: false, reason: err.message };
  }
}

async function runDailyRotation() {
  const date = todayStr();
  // Quota is sourced from the pin-log so hourly ticks that fire twice
  // in the same window never exceed MAX_PER_DAY.
  const log = loadPinLog();
  let pinsToday = pinsTodayFromLog(log, date);

  if (pinsToday >= MAX_PER_DAY) {
    console.log(
      `[pin-scheduler] already at ${pinsToday}/${MAX_PER_DAY} pins today, nothing to do`
    );
    return { pinsToday };
  }

  for (const type of ENABLED_TYPES) {
    if (pinsToday >= MAX_PER_DAY) {
      console.log(
        `[pin-scheduler] reached MAX_PER_DAY=${MAX_PER_DAY}, stopping rotation`
      );
      break;
    }

    // Reload the log each iteration so previously-pinned items in THIS
    // rotation show up in recentlyPinned and same-day dedup checks.
    const currentLog = loadPinLog();
    const payload = await pickForType(type, date, currentLog);
    if (!payload) {
      console.log(`[pin-scheduler] no eligible ${type} for ${date}`);
      continue;
    }

    const dedupKey = `${date}-${payload.type}-${payload.slug}`;
    if (currentLog[dedupKey]) {
      console.log(`[pin-scheduler] already pinned today: ${dedupKey}`);
      continue;
    }

    const result = await pinOne(payload, dedupKey);
    if (result.ok) pinsToday += 1;

    // Space successful pins to avoid anti-spam heuristics
    if (result.ok && pinsToday < MAX_PER_DAY) {
      await new Promise((r) => setTimeout(r, PIN_SPACING_MS));
    }
  }

  return { pinsToday };
}

// Back-compat: pin-scheduler used to expose runDailyPin. Keep an alias
// so any external caller (eg monitoring or smoke tests) still works.
async function runDailyPin() {
  return runDailyRotation();
}

function startScheduler() {
  console.log(
    `[pin-scheduler] started (board=${BOARD_ID}, types=[${ENABLED_TYPES.join(",")}], max=${MAX_PER_DAY}, dryRun=${DRY_RUN}, window=02:00 UTC)`
  );

  pinTimer = setInterval(async () => {
    const hour = new Date().getUTCHours();
    if (hour === PIN_UTC_HOUR || hour === PIN_UTC_HOUR + 1) {
      await runDailyRotation();
    }
  }, HOURLY);

  setTimeout(async () => {
    console.log("[pin-scheduler] initial check");
    await runDailyRotation();
  }, 45 * 1000);
}

function stopScheduler() {
  if (pinTimer) {
    clearInterval(pinTimer);
    pinTimer = null;
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
  runDailyPin,
  runDailyRotation,
  buildColorPayload,
  buildCollectionPayload,
  buildGuidePayload,
  pickForType,
  loadPinLog,
  pinsTodayFromLog,
};
