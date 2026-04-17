/**
 * Pinterest auto-pinning scheduler.
 *
 * Pins one featured color per day to our org Pinterest board, using
 * the same "Color of the Day" deterministic picker that Instagram's
 * scheduler uses. This keeps the daily content narrative consistent
 * across channels.
 *
 * Schedule:
 *   - Daily pin at ~11 AM JST (02:00 UTC), between IG Story (01:00)
 *     and IG Post (03:00) windows.
 *
 * Rate cap: max 1 pin per day from this scheduler. Hard ceiling in
 * the scheduler itself — if someone wants to pin more by hand, they
 * can hit POST /pinterest/admin/publish directly with a bearer.
 *
 * Dedup: server/.pin-log.json keyed by YYYY-MM-DD-{colorId} so a
 * restart or timer fire within the same day never double-pins.
 *
 * Dry-run: set PIN_SCHEDULER_DRY_RUN=true to log what WOULD have been
 * pinned without calling the Pinterest API.
 */

const fs = require("fs");
const path = require("path");
const { colors, getColorOfDay } = require("./colors");
const pinterestAdmin = require("./pinterest-admin");

const PIN_LOG = path.join(__dirname, ".pin-log.json");
// Default to the production "ColorArchive Pro" board created 2026-04-17.
// Override per-env with PINTEREST_BOARD_COLORS.
const DEFAULT_BOARD_ID = "855684066641154147";
const BOARD_ID = process.env.PINTEREST_BOARD_COLORS || DEFAULT_BOARD_ID;
const SITE_ORIGIN = (process.env.FRONTEND_ORIGIN || "https://colorarchive.org").replace(/\/$/, "");
const DRY_RUN = process.env.PIN_SCHEDULER_DRY_RUN === "true";

const HOURLY = 60 * 60 * 1000;
const PIN_UTC_HOUR = 2; // 02:00 UTC = 11:00 JST
let pinTimer = null;

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

function alreadyPinned(key) {
  return Boolean(loadPinLog()[key]);
}

/** Look up a ColorRecord from the flat `colors` array by id. */
function findColor(colorId) {
  return colors.find((c) => c.id === colorId);
}

function buildPinPayload(color) {
  const slug = color.id;
  const pageUrl = `${SITE_ORIGIN}/colors/${slug}/`;
  const imageUrl = `${SITE_ORIGIN}/colors/${slug}/opengraph-image/`;
  return {
    boardId: BOARD_ID,
    title: `${color.name} — ${color.hex}`.slice(0, 100),
    description: [
      `${color.name} (${color.hex}) — Color of the Day on ColorArchive.`,
      `Hue ${color.hue}°, saturation ${color.saturation}%, lightness ${color.lightness}%.`,
      `Part of the ${color.family} family.`,
      "Browse 5,400+ curated colors and export palettes in CSS, Tailwind, Figma tokens.",
    ]
      .join(" ")
      .slice(0, 500),
    link: pageUrl,
    imageUrl,
    altText: `${color.name} color swatch (${color.hex})`.slice(0, 500),
  };
}

async function runDailyPin() {
  const date = todayStr();
  const cod = getColorOfDay(date);
  if (!cod) {
    console.error("[pin-scheduler] getColorOfDay returned no result for", date);
    return;
  }

  // getColorOfDay from server/colors.js returns a heroColors entry.
  // Those entries carry full ColorRecord fields, but we defensively
  // look up by id to make sure downstream shape is consistent.
  const color = findColor(cod.id) || cod;
  const dedupKey = `${date}-${color.id}`;

  if (alreadyPinned(dedupKey)) {
    console.log(`[pin-scheduler] already pinned today (${dedupKey}), skipping`);
    return;
  }

  const payload = buildPinPayload(color);

  if (DRY_RUN) {
    console.log("[pin-scheduler] DRY-RUN would pin:", JSON.stringify(payload));
    markPinned(dedupKey, { dryRun: true, title: payload.title });
    return;
  }

  if (!pinterestAdmin.hasToken()) {
    console.error("[pin-scheduler] no Pinterest admin token available, skipping");
    return;
  }

  try {
    const pin = await pinterestAdmin.publishPin(payload);
    console.log(`[pin-scheduler] pinned ${pin.id} — ${payload.title}`);
    markPinned(dedupKey, {
      pinId: pin.id,
      boardId: payload.boardId,
      title: payload.title,
      link: payload.link,
    });
  } catch (err) {
    console.error("[pin-scheduler] publish failed:", err.message);
  }
}

function startScheduler() {
  console.log(
    `[pin-scheduler] Pinterest auto-pinner started (board=${BOARD_ID}, dryRun=${DRY_RUN}, window=02:00 UTC)`
  );

  pinTimer = setInterval(async () => {
    const hour = new Date().getUTCHours();
    if (hour === PIN_UTC_HOUR || hour === PIN_UTC_HOUR + 1) {
      await runDailyPin();
    }
  }, HOURLY);

  // Initial check ~45s after boot — lets the admin token load first,
  // and covers the case where the server restarts during the daily
  // window and would otherwise miss that day.
  setTimeout(async () => {
    console.log("[pin-scheduler] initial check");
    await runDailyPin();
  }, 45 * 1000);
}

function stopScheduler() {
  if (pinTimer) {
    clearInterval(pinTimer);
    pinTimer = null;
  }
}

module.exports = { startScheduler, stopScheduler, runDailyPin, buildPinPayload };
