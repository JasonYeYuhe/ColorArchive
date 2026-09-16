#!/usr/bin/env node
/**
 * Daily Color of the Day post to X and the Facebook Page.
 *
 * WHY THIS IS A SCRIPT. Until 2026-09-16 the scheduled task "daily-color-post" asked a
 * model to WRITE this posting code fresh every day from a task file last edited
 * 2026-06-16. An audit of 60 days of Facebook posts found 5 bad days: 07-31 and 09-01
 * missing (one run stalled on a permission prompt for 35 hours and was still recorded
 * "succeeded"), 07-28 and 08-26 duplicated, and 08-12 posted the WRONG COLOUR because
 * the task file still described the old `dayHash` formula while the site, the email,
 * Instagram and Pinterest had long moved to COTD v2. Two runs also printed the live X
 * and Facebook credentials into local session transcripts, because the redaction they
 * used did not match JSON credential files.
 *
 * So: one colour source (getColorOfDay, the same function the server and Instagram
 * use), a per-date log so a rerun cannot double-post, X's WEIGHTED character count,
 * no credential ever printed, and a non-zero exit when anything fails.
 *
 *   node scripts/post-daily-color.cjs [--dry-run] [--date=YYYY-MM-DD] [--force]
 *
 * --dry-run prints exactly what would be posted and touches nothing.
 * --force ignores the per-date log (use only to repair a genuinely missing day).
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const REPO = path.resolve(__dirname, "..");
const { getColorOfDay } = require(path.join(REPO, "server", "colors"));
const STATE_FILE = path.join(
  process.env.HOME || "",
  ".claude",
  "scheduled-tasks",
  "daily-color-post",
  ".posted.json",
);
const SITE = "https://colorarchive.org";
const HASHTAGS = "#ColorArchive #ColorPalette #DesignInspiration #WebDesign #UIDesign";

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const FORCE = argv.includes("--force");
const dateArg = (argv.find((a) => a.startsWith("--date=")) || "").split("=")[1];
const today = dateArg || new Date().toISOString().slice(0, 10);

/* ---------------- per-date log: a rerun must not double-post ---------------- */

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}
function markPosted(key, id) {
  const state = readState();
  state[key] = { at: new Date().toISOString(), id: id || null };
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/* ---------------- X's weighted character count ---------------- */
// X counts most characters as 2, and only these ranges as 1. A 2-emoji template
// measured 278 by code points but exactly 280 weighted — at the limit, and the old
// `.length` check could not see it.
const LIGHT = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
];
function weightedLength(text) {
  let n = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    n += LIGHT.some(([lo, hi]) => cp >= lo && cp <= hi) ? 1 : 2;
  }
  return n;
}

/* ---------------- credentials (never printed) ---------------- */

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/* ---------------- X ---------------- */

function oauthHeader(method, url, creds) {
  // JSON body params are deliberately NOT part of the signature base string.
  const params = {
    oauth_consumer_key: creds.consumer_key,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.access_token,
    oauth_version: "1.0",
  };
  const enc = encodeURIComponent;
  const base = [
    method.toUpperCase(),
    enc(url),
    enc(
      Object.keys(params)
        .sort()
        .map((k) => `${enc(k)}=${enc(params[k])}`)
        .join("&"),
    ),
  ].join("&");
  const key = `${enc(creds.consumer_secret)}&${enc(creds.access_token_secret)}`;
  params.oauth_signature = crypto.createHmac("sha1", key).update(base).digest("base64");
  return (
    "OAuth " +
    Object.keys(params)
      .sort()
      .map((k) => `${enc(k)}="${enc(params[k])}"`)
      .join(", ")
  );
}

async function postToX(text) {
  const creds = readJson(path.join(REPO, "server", ".env.twitter"));
  const url = "https://api.x.com/2/tweets";
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: oauthHeader("POST", url, creds), "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`X ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body?.data?.id || "posted";
}

/* ---------------- Facebook ---------------- */

async function postToFacebook(message, link) {
  const creds = readJson(path.join(REPO, "server", ".env.facebook"));
  const form = new URLSearchParams({ access_token: creds.page_access_token, message, link });
  const res = await fetch(`https://graph.facebook.com/v25.0/${creds.page_id}/feed`, {
    method: "POST",
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = body?.error?.code;
    throw new Error(
      `Facebook ${res.status} (code ${code}): ${String(body?.error?.message || "").slice(0, 200)}` +
        (code === 190 ? " — the page token is invalid; re-mint it (see the task's SKILL.md)" : ""),
    );
  }
  return body?.id || "posted";
}

/* ---------------- main ---------------- */

(async () => {
  const color = getColorOfDay(today);
  if (!color) throw new Error(`no Color of the Day for ${today}`);
  const url = `${SITE}/colors/${color.id}/`;

  const fbText =
    `🎨 Color of the Day: ${color.name} ${color.hex}\n\n` +
    `${color.family} · H${color.hue}° S${color.saturation}% L${color.lightness}% — ` +
    `pairs well in ${color.lightness > 60 ? "airy, low-contrast" : "bold, high-contrast"} layouts.\n\n` +
    `${url}\n\n${HASHTAGS}`;

  // No URL and no bare domain in the tweet: with X's pay-per-use pricing a post with a
  // link costs $0.20 against $0.015 without one.
  const xText =
    `🎨 Color of the Day: ${color.name} ${color.hex}\n\n` +
    `${color.family} · H${color.hue}° S${color.saturation}% L${color.lightness}%\n` +
    `Browse 5,400+ shades on ColorArchive 🎨\n\n${HASHTAGS}`;

  const weighted = weightedLength(xText);
  if (weighted > 280) throw new Error(`tweet is ${weighted} weighted chars (limit 280) — refusing to post a truncated tweet`);
  if (/https?:\/\/|colorarchive\.(org|me)/i.test(xText)) throw new Error("tweet contains a link — that costs 13x");

  const state = readState();
  const plan = [
    { key: `x-${today}`, label: "X", run: () => postToX(xText), text: xText },
    { key: `fb-${today}`, label: "Facebook", run: () => postToFacebook(fbText, url), text: fbText },
  ];

  console.log(`Color of the Day ${today}: ${color.name} ${color.hex} (${color.id})`);
  console.log(`tweet: ${weighted} weighted chars`);

  let failures = 0;
  for (const p of plan) {
    if (state[p.key] && !FORCE) {
      console.log(`${p.label}: already posted for ${today} (${state[p.key].at}) — skipping`);
      continue;
    }
    if (DRY) {
      console.log(`\n--- ${p.label} (dry run, not posted) ---\n${p.text}\n`);
      continue;
    }
    try {
      const id = await p.run();
      markPosted(p.key, id);
      console.log(`${p.label}: posted (${id})`);
    } catch (err) {
      failures++;
      console.error(`${p.label}: FAILED — ${err.message}`);
    }
  }
  if (failures) process.exit(1);
})().catch((err) => {
  console.error(`FATAL — ${err.message}`);
  process.exit(2);
});
