/**
 * Long-tail color page cache warmer.
 *
 * app/colors/[slug]/page.tsx prerenders only a representative subset
 * (~2,500 of 5,446 colors) to stay within Vercel's 80 MB deployment output
 * limit; the rest render on-demand with `dynamicParams = true`. First
 * visitors to a long-tail slug pay an SSR round trip until Vercel's edge
 * cache kicks in.
 *
 * This module runs a weekly pass (Monday 03:00 UTC) that HEADs every
 * long-tail slug so the edge cache stays warm between deploys. Requests
 * are spaced to avoid burning our own egress quota or looking like a
 * scraper.
 *
 * Opt out with CACHE_WARMER_ENABLED=false. Dry-run with
 * CACHE_WARMER_DRY_RUN=true.
 */

const { colors } = require("./colors");

// Keep this list in sync with app/colors/[slug]/page.tsx generateStaticParams.
// Any slug whose prefix appears here is already prerendered at build time
// and does not need warming.
const ORIGINAL_HUE_ROOTS = new Set([
  "crimson", "ruby", "ember", "coral", "apricot", "amber",
  "citrine", "honey", "olive", "lime", "moss", "leaf",
  "emerald", "mint", "seafoam", "jade", "teal", "lagoon",
  "aqua", "cerulean", "azure", "sapphire", "cobalt", "indigo",
  "iris", "violet", "orchid", "plum", "mulberry", "magenta",
  "fuchsia", "peony", "rose", "blush", "garnet", "merlot",
]);
const ORIGINAL_CHROMA = new Set(["faint", "muted", "soft", "clear", "vivid", "pure"]);
const NEUTRAL_ROOTS = ["warm-gray", "true-gray", "cool-gray"];

function isPrerendered(id) {
  if (NEUTRAL_ROOTS.some((r) => id.startsWith(r))) return true;
  const parts = id.split("-");
  return ORIGINAL_HUE_ROOTS.has(parts[0]) && ORIGINAL_CHROMA.has(parts[2]);
}

function getLongTailSlugs() {
  return colors.map((c) => c.id.toLowerCase()).filter((id) => !isPrerendered(id));
}

const SITE_URL = (process.env.SITE_URL || "https://colorarchive.org").replace(/\/$/, "");
const ENABLED = process.env.CACHE_WARMER_ENABLED !== "false";
const DRY_RUN = process.env.CACHE_WARMER_DRY_RUN === "true";
const SPACING_MS = Number(process.env.CACHE_WARMER_SPACING_MS) || 400;
const BATCH_SIZE = Number(process.env.CACHE_WARMER_BATCH_SIZE) || 250;
const WARM_HOUR_UTC = 3;
const WARM_WEEKDAY_UTC = 1;

const HOURLY = 60 * 60 * 1000;
let timer = null;
let lastRunDate = null;

async function warmOne(slug) {
  const url = `${SITE_URL}/colors/${slug}/`;
  if (DRY_RUN) {
    return { slug, status: 0, cache: "dry-run" };
  }
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: {
        "user-agent": "ColorArchive-CacheWarmer/1.0 (+https://colorarchive.org)",
      },
    });
    const cache = res.headers.get("x-vercel-cache") || "unknown";
    return { slug, status: res.status, cache };
  } catch (err) {
    return { slug, status: 0, cache: "error", error: err.message };
  }
}

async function runWeeklyWarm() {
  const slugs = getLongTailSlugs();
  const capped = slugs.slice(0, BATCH_SIZE);
  console.log(
    `[cache-warmer] starting pass: ${capped.length} of ${slugs.length} long-tail slugs (spacing=${SPACING_MS}ms, dryRun=${DRY_RUN})`
  );
  const stats = { total: capped.length, hit: 0, miss: 0, stale: 0, error: 0, other: 0 };
  for (const slug of capped) {
    const result = await warmOne(slug);
    const c = (result.cache || "").toLowerCase();
    if (c === "hit") stats.hit += 1;
    else if (c === "miss") stats.miss += 1;
    else if (c === "stale") stats.stale += 1;
    else if (c === "error" || result.status === 0) stats.error += 1;
    else stats.other += 1;
    await new Promise((r) => setTimeout(r, SPACING_MS));
  }
  console.log(`[cache-warmer] pass complete:`, stats);
  return stats;
}

function startScheduler() {
  if (!ENABLED) {
    console.log("[cache-warmer] disabled via CACHE_WARMER_ENABLED=false");
    return;
  }
  console.log(
    `[cache-warmer] started (site=${SITE_URL}, batch=${BATCH_SIZE}, weekday=Mon ${WARM_HOUR_UTC}:00 UTC, dryRun=${DRY_RUN})`
  );
  timer = setInterval(() => {
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10);
    if (
      now.getUTCDay() === WARM_WEEKDAY_UTC &&
      now.getUTCHours() === WARM_HOUR_UTC &&
      lastRunDate !== ymd
    ) {
      lastRunDate = ymd;
      runWeeklyWarm().catch((err) => {
        console.error("[cache-warmer] pass failed:", err);
      });
    }
  }, HOURLY);
}

function stopScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
  runWeeklyWarm,
  getLongTailSlugs,
  isPrerendered,
};
