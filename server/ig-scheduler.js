/**
 * Instagram auto-posting scheduler.
 *
 * Schedule:
 *   - Daily Story at ~10:00 AM JST (01:00 UTC)
 *   - Feed Post every 3 days at ~12:00 PM JST (03:00 UTC)
 *
 * Content rotation:
 *   Stories — Color of the Day (60%), Palette from collection (40%)
 *   Posts   — Featured Color (50%), Palette Post (50%)
 *
 * Uses deterministic date-seeded selection so restarts don't double-post.
 */

const fs = require("fs");
const path = require("path");
const { colors, collections, getColorOfDay, getAnalogous } = require("./colors");
const {
  generateColorOfDayStory,
  generatePaletteStory,
  generateColorPost,
  generatePalettePost,
  cleanOldFiles,
} = require("./ig-image-generator");

const TOKEN_FILE = path.join(__dirname, ".env.instagram");
// Images are served from the API server, not the frontend
const API_ORIGIN = process.env.API_ORIGIN || "https://api.colorarchive.me";
// Bare domain for display in captions
const SITE_DOMAIN = (process.env.FRONTEND_ORIGIN || "https://colorarchive.me")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

// Track what we've already posted (persisted per-day)
const POSTED_LOG = path.join(__dirname, "generated", ".post-log.json");

/* ── Helpers ────────────────────────────────── */

function loadTokenStore() {
  try {
    if (fs.existsSync(TOKEN_FILE)) return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
  } catch (e) { /* ignore */ }
  return { access_token: null, user_id: null };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function loadPostLog() {
  try {
    if (fs.existsSync(POSTED_LOG)) return JSON.parse(fs.readFileSync(POSTED_LOG, "utf8"));
  } catch (e) { /* ignore */ }
  return {};
}

function markPosted(key) {
  const log = loadPostLog();
  log[key] = new Date().toISOString();
  fs.writeFileSync(POSTED_LOG, JSON.stringify(log, null, 2));
}

function alreadyPosted(key) {
  return Boolean(loadPostLog()[key]);
}

/** Publish to Instagram Graph API (works for both STORIES and feed posts). */
async function publishToInstagram(imageUrl, caption, mediaType = "IMAGE") {
  const store = loadTokenStore();
  if (!store.access_token || !store.user_id) {
    console.error("[ig-scheduler] No Instagram token available, skipping publish");
    return null;
  }

  const IG_GRAPH_URL = "https://graph.instagram.com/v22.0";

  // Step 1: Create media container
  const containerBody = {
    image_url: imageUrl,
    access_token: store.access_token,
  };
  if (mediaType === "STORIES") {
    containerBody.media_type = "STORIES";
  }
  if (caption && mediaType !== "STORIES") {
    containerBody.caption = caption;
  }

  const containerRes = await fetch(`${IG_GRAPH_URL}/${store.user_id}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(containerBody),
  });
  const containerData = await containerRes.json();
  if (!containerRes.ok || !containerData.id) {
    console.error("[ig-scheduler] Container creation failed:", containerData);
    return null;
  }

  // Step 2: Wait for media to be ready (poll status)
  console.log(`[ig-scheduler] Container created: ${containerData.id}, waiting for processing...`);
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((r) => setTimeout(r, 5000)); // wait 5s between checks
    const statusRes = await fetch(
      `${IG_GRAPH_URL}/${containerData.id}?fields=status_code&access_token=${store.access_token}`
    );
    const statusData = await statusRes.json();
    if (statusData.status_code === "FINISHED") {
      console.log("[ig-scheduler] Media ready, publishing...");
      break;
    }
    if (statusData.status_code === "ERROR") {
      console.error("[ig-scheduler] Media processing failed:", statusData);
      return null;
    }
    console.log(`[ig-scheduler] Status: ${statusData.status_code || "IN_PROGRESS"} (attempt ${attempt + 1}/10)`);
    if (attempt === 9) {
      console.error("[ig-scheduler] Media processing timed out after 10 attempts");
      return null;
    }
  }

  // Step 3: Publish
  const publishRes = await fetch(`${IG_GRAPH_URL}/${store.user_id}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerData.id,
      access_token: store.access_token,
    }),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok || !publishData.id) {
    console.error("[ig-scheduler] Publish failed:", publishData);
    return null;
  }

  return publishData.id;
}

/* ── Caption Templates ──────────────────────── */

const HASHTAGS = [
  "#colorarchive", "#colorpalette", "#designresources", "#colortheory",
  "#uidesign", "#webdesign", "#graphicdesign", "#brandcolors",
  "#colorswatch", "#designinspiration", "#colorhunters", "#colorscheme",
].join(" ");

function colorCaption(color) {
  return `🎨 ${color.name}\n\n` +
    `${color.hex} · ${color.family}\n` +
    `H${color.hue}° S${color.saturation}% L${color.lightness}%\n\n` +
    `Explore this color and 2000+ more at ${SITE_DOMAIN}/colors/${color.id}\n\n` +
    HASHTAGS;
}

function paletteCaption(title, paletteColors) {
  const swatches = paletteColors.map((c) => `${c.hex} ${c.name}`).join("\n");
  return `🎨 ${title}\n\n${swatches}\n\n` +
    `Browse all palettes at ${SITE_DOMAIN}/collections\n\n` +
    HASHTAGS;
}

/* ── Scheduled Jobs ─────────────────────────── */

async function runDailyStory() {
  const key = `story-${todayStr()}`;
  if (alreadyPosted(key)) {
    console.log("[ig-scheduler] Story already posted today, skipping");
    return;
  }

  try {
    const day = dayOfYear();
    let filename;

    if (day % 5 < 3) {
      // Color of the Day (60% of days)
      const color = getColorOfDay(todayStr());
      filename = await generateColorOfDayStory(color);
      console.log(`[ig-scheduler] Story: Color of the Day — ${color.name}`);
    } else {
      // Palette from a collection (40% of days)
      const collection = collections[day % collections.length];
      filename = await generatePaletteStory(collection.palette, collection.title);
      console.log(`[ig-scheduler] Story: Palette — ${collection.title}`);
    }

    const imageUrl = `${API_ORIGIN}/generated/${filename}`;
    const mediaId = await publishToInstagram(imageUrl, null, "STORIES");

    if (mediaId) {
      markPosted(key);
      console.log(`[ig-scheduler] Story published! Media ID: ${mediaId}`);
    }
  } catch (err) {
    console.error("[ig-scheduler] Story failed:", err.message);
  }
}

async function runPeriodicPost() {
  const day = dayOfYear();
  // Post every 3 days
  if (day % 3 !== 0) return;

  const key = `post-${todayStr()}`;
  if (alreadyPosted(key)) {
    console.log("[ig-scheduler] Post already published today, skipping");
    return;
  }

  try {
    let filename, caption;
    const cycle = Math.floor(day / 3) % 2;

    if (cycle === 0) {
      // Featured Color
      const color = getColorOfDay(todayStr() + "-post");
      filename = await generateColorPost(color);
      caption = colorCaption(color);
      console.log(`[ig-scheduler] Post: Featured Color — ${color.name}`);
    } else {
      // Palette Post
      const collection = collections[Math.floor(day / 3) % collections.length];
      filename = await generatePalettePost(collection.palette, collection.title);
      caption = paletteCaption(collection.title, collection.palette);
      console.log(`[ig-scheduler] Post: Palette — ${collection.title}`);
    }

    const imageUrl = `${API_ORIGIN}/generated/${filename}`;
    const mediaId = await publishToInstagram(imageUrl, caption, "IMAGE");

    if (mediaId) {
      markPosted(key);
      console.log(`[ig-scheduler] Post published! Media ID: ${mediaId}`);
    }
  } catch (err) {
    console.error("[ig-scheduler] Post failed:", err.message);
  }
}

/* ── Scheduler Start ────────────────────────── */

const STORY_INTERVAL = 60 * 60 * 1000;  // Check every hour
const POST_INTERVAL = 60 * 60 * 1000;   // Check every hour

let storyTimer = null;
let postTimer = null;

function startScheduler() {
  console.log("[ig-scheduler] Instagram auto-posting scheduler started");
  console.log("[ig-scheduler] Story: daily ~10 AM JST | Post: every 3 days ~12 PM JST");

  // Run story check every hour (will skip if already posted today)
  storyTimer = setInterval(async () => {
    const hour = new Date().getUTCHours(); // JST = UTC + 9
    // Target: 10 AM JST = 1 AM UTC (allow 1-2 AM UTC window)
    if (hour === 1 || hour === 2) {
      await runDailyStory();
    }
  }, STORY_INTERVAL);

  // Run post check every hour
  postTimer = setInterval(async () => {
    const hour = new Date().getUTCHours();
    // Target: 12 PM JST = 3 AM UTC (allow 3-4 AM UTC window)
    if (hour === 3 || hour === 4) {
      await runPeriodicPost();
    }
  }, POST_INTERVAL);

  // Clean old generated images daily
  setInterval(() => cleanOldFiles(), 24 * 60 * 60 * 1000);

  // Initial run after 30 seconds (for testing / restart recovery)
  setTimeout(async () => {
    console.log("[ig-scheduler] Running initial check...");
    await runDailyStory();
    await runPeriodicPost();
  }, 30 * 1000);
}

function stopScheduler() {
  if (storyTimer) clearInterval(storyTimer);
  if (postTimer) clearInterval(postTimer);
  console.log("[ig-scheduler] Scheduler stopped");
}

module.exports = {
  startScheduler,
  stopScheduler,
  // Expose for manual/test triggering
  runDailyStory,
  runPeriodicPost,
  publishToInstagram,
};
