/**
 * Instagram API routes (Instagram Login / Graph API)
 *
 * Endpoints:
 *   GET  /instagram/auth/start     — Redirect to Instagram OAuth
 *   GET  /instagram/auth/callback  — Exchange code for token, store it
 *   GET  /instagram/profile        — Get connected IG profile info
 *   POST /instagram/publish        — Publish a photo post (admin only)
 *   GET  /instagram/media          — Get recent media (public, cached)
 *
 * Token flow (Instagram Login approach):
 *   1. Admin visits /instagram/auth/start → redirected to Instagram
 *   2. Instagram redirects back with ?code=… to /instagram/auth/callback
 *   3. Server exchanges code for short-lived token (1h)
 *   4. Server exchanges short-lived token for long-lived token (60 days)
 *   5. Long-lived token stored in memory + .env for persistence
 *   6. Autopilot/cron refreshes token before expiry
 */

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://colorarchive.me";

// Manual cookie helpers (matches existing server pattern — no cookie-parser dep)
function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [name, ...rest] = part.trim().split("=");
      return [name, decodeURIComponent(rest.join("="))];
    })
  );
}
function setNamedCookie(res, name, value, maxAgeMs) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/", "HttpOnly", "Secure", "SameSite=Lax",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  res.setHeader("Set-Cookie", parts.join("; "));
}
function clearNamedCookie(res, name) {
  res.setHeader("Set-Cookie", `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

// Instagram API credentials (from Meta Developer Portal)
// Uses Facebook Login for Business with Instagram Graph API configuration
const FB_APP_ID = process.env.FB_APP_ID || process.env.INSTAGRAM_APP_ID || "";
const FB_APP_SECRET = process.env.FB_APP_SECRET || process.env.INSTAGRAM_APP_SECRET || "";
const IG_APP_ID = process.env.INSTAGRAM_APP_ID || "";
const IG_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "";
const IG_REDIRECT_URI =
  process.env.INSTAGRAM_REDIRECT_URI || "https://api.colorarchive.me/instagram/auth/callback";
const IG_CONFIG_ID = process.env.INSTAGRAM_CONFIG_ID || "1662120915240411";

// Graph API base URLs
const IG_GRAPH_URL = "https://graph.instagram.com";
const FB_GRAPH_URL = "https://graph.facebook.com";
const IG_API_URL = "https://api.instagram.com";

// In-memory token store (persisted to .env.instagram file)
const TOKEN_FILE = path.join(__dirname, "..", ".env.instagram");
let tokenStore = loadTokenStore();

function loadTokenStore() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
      console.log("[instagram] Loaded stored token (expires:", data.expires_at || "unknown", ")");
      return data;
    }
  } catch (err) {
    console.error("[instagram] Failed to load token store:", err.message);
  }
  return { access_token: null, user_id: null, expires_at: null };
}

function saveTokenStore() {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenStore, null, 2));
    console.log("[instagram] Token saved to", TOKEN_FILE);
  } catch (err) {
    console.error("[instagram] Failed to save token:", err.message);
  }
}

function isConfigured() {
  return Boolean(IG_APP_ID && IG_APP_SECRET);
}

function hasToken() {
  return Boolean(tokenStore.access_token);
}

/* ── OAuth Flow ──────────────────────────────────────────── */

/**
 * GET /instagram/auth/start
 * Redirects admin to Instagram OAuth consent screen.
 * Scopes: instagram_business_basic, instagram_business_content_publish,
 *         instagram_business_manage_messages, instagram_business_manage_comments
 */
router.get("/auth/start", (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({ error: "Instagram API not configured" });
  }

  const state = crypto.randomBytes(16).toString("hex");
  // Store state in cookie for CSRF validation
  setNamedCookie(res, "ig_oauth_state", state, 10 * 60 * 1000);

  // Use Instagram Login (direct Instagram OAuth, not Facebook Login for Business)
  // This works for first-party apps where we own both the app and the IG account
  const scopes = [
    "instagram_business_basic",
    "instagram_business_content_publish",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
  ].join(",");
  const url =
    `https://www.instagram.com/oauth/authorize?` +
    `client_id=${IG_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(IG_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${state}`;

  return res.redirect(url);
});

/**
 * GET /instagram/auth/callback
 * Instagram redirects here with ?code=…&state=…
 * Exchanges code for short-lived token, then long-lived token.
 */
router.get("/auth/callback", async (req, res) => {
  if (!isConfigured()) {
    return res.redirect(`${FRONTEND_ORIGIN}/?ig_error=not-configured`);
  }

  const { code, state, error, error_reason } = req.query;

  // User denied
  if (error) {
    console.warn("[instagram] OAuth denied:", error, error_reason);
    return res.redirect(`${FRONTEND_ORIGIN}/?ig_error=denied`);
  }

  // CSRF check
  const cookies = parseCookies(req);
  const storedState = cookies.ig_oauth_state;
  clearNamedCookie(res, "ig_oauth_state");
  if (!state || !storedState || state !== storedState) {
    return res.redirect(`${FRONTEND_ORIGIN}/?ig_error=state-mismatch`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_ORIGIN}/?ig_error=no-code`);
  }

  try {
    // Step 1: Exchange code for short-lived token via Instagram API
    const tokenBody = new URLSearchParams({
      client_id: IG_APP_ID,
      client_secret: IG_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: IG_REDIRECT_URI,
      code,
    });
    const tokenRes = await fetch(`${IG_API_URL}/oauth/access_token`, {
      method: "POST",
      body: tokenBody,
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[instagram] Token exchange failed:", tokenData);
      return res.redirect(`${FRONTEND_ORIGIN}/?ig_error=token-exchange`);
    }

    console.log("[instagram] Short-lived token obtained for user:", tokenData.user_id);

    // Step 2: Exchange short-lived token for long-lived token (60 days)
    const longRes = await fetch(
      `${IG_GRAPH_URL}/access_token?` +
      `grant_type=ig_exchange_token` +
      `&client_secret=${IG_APP_SECRET}` +
      `&access_token=${tokenData.access_token}`
    );
    const longData = await longRes.json();

    let finalToken = tokenData.access_token;
    let expiresIn = 3600; // short-lived default 1h
    let tokenType = "short-lived";

    if (longData.access_token) {
      finalToken = longData.access_token;
      expiresIn = longData.expires_in || 5184000; // 60 days
      tokenType = "long-lived";
      console.log("[instagram] Long-lived token obtained, expires in", expiresIn, "seconds");
    } else {
      console.warn("[instagram] Long-lived token exchange failed, using short-lived:", longData);
    }

    tokenStore = {
      access_token: finalToken,
      user_id: String(tokenData.user_id),
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      token_type: tokenType,
    };

    // Get username for logging
    try {
      const meRes = await fetch(`${IG_GRAPH_URL}/me?fields=id,username&access_token=${finalToken}`);
      const meData = await meRes.json();
      if (meData.username) {
        tokenStore.username = meData.username;
        console.log("[instagram] Connected as:", meData.username, "(ID:", meData.id, ")");
      }
    } catch (e) {
      console.warn("[instagram] Could not fetch IG user info:", e.message);
    }

    saveTokenStore();

    return res.redirect(`${FRONTEND_ORIGIN}/?ig_success=true`);
  } catch (err) {
    console.error("[instagram] OAuth callback error:", err);
    return res.redirect(`${FRONTEND_ORIGIN}/?ig_error=server`);
  }
});

/* ── Token Refresh ───────────────────────────────────────── */

/**
 * POST /instagram/auth/refresh
 * Refresh a long-lived token (valid for 60 more days).
 * Should be called by cron/autopilot before expiry.
 */
router.post("/auth/refresh", async (req, res) => {
  if (!hasToken()) {
    return res.status(400).json({ error: "No token to refresh" });
  }

  try {
    const refreshRes = await fetch(
      `${IG_GRAPH_URL}/refresh_access_token?` +
        `grant_type=ig_refresh_token` +
        `&access_token=${tokenStore.access_token}`
    );

    const data = await refreshRes.json();
    if (!refreshRes.ok || !data.access_token) {
      return res.status(500).json({ error: "Refresh failed", details: data });
    }

    tokenStore.access_token = data.access_token;
    tokenStore.expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString();
    tokenStore.token_type = "long-lived";
    saveTokenStore();

    return res.json({ ok: true, expires_at: tokenStore.expires_at });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── Profile ─────────────────────────────────────────────── */

/**
 * GET /instagram/profile
 * Returns connected Instagram account profile info.
 */
router.get("/profile", async (req, res) => {
  if (!hasToken()) {
    return res.json({ connected: false });
  }

  try {
    const profileRes = await fetch(
      `${IG_GRAPH_URL}/me?fields=id,username,name,profile_picture_url,followers_count,media_count` +
        `&access_token=${tokenStore.access_token}`
    );

    const data = await profileRes.json();
    if (!profileRes.ok) {
      return res.json({ connected: false, error: data.error?.message });
    }

    return res.json({
      connected: true,
      profile: data,
      token_expires: tokenStore.expires_at,
    });
  } catch (err) {
    return res.json({ connected: false, error: err.message });
  }
});

/* ── Media Feed ──────────────────────────────────────────── */

let mediaCache = { data: null, cachedAt: 0 };
const MEDIA_CACHE_TTL = 5 * 60 * 1000; // 5 min

/**
 * GET /instagram/media
 * Returns recent media posts. Cached for 5 minutes.
 */
router.get("/media", async (req, res) => {
  if (!hasToken()) {
    return res.json({ media: [], connected: false });
  }

  const now = Date.now();
  if (mediaCache.data && now - mediaCache.cachedAt < MEDIA_CACHE_TTL) {
    return res.json({ media: mediaCache.data, cached: true });
  }

  try {
    const mediaRes = await fetch(
      `${IG_GRAPH_URL}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12` +
        `&access_token=${tokenStore.access_token}`
    );

    const data = await mediaRes.json();
    if (!mediaRes.ok) {
      return res.json({ media: [], error: data.error?.message });
    }

    mediaCache = { data: data.data || [], cachedAt: now };
    return res.json({ media: data.data || [] });
  } catch (err) {
    return res.json({ media: [], error: err.message });
  }
});

/* ── Content Publishing ──────────────────────────────────── */

/**
 * POST /instagram/publish
 * Publish a single image post to Instagram.
 * Body: { image_url, caption }
 * Requires admin session (checked via auth middleware).
 *
 * Two-step process:
 *   1. Create media container (POST /{ig-user-id}/media)
 *   2. Publish container (POST /{ig-user-id}/media_publish)
 */
router.post("/publish", async (req, res) => {
  if (!hasToken()) {
    return res.status(401).json({ error: "Instagram not connected" });
  }

  const { image_url, caption, media_type } = req.body;
  if (!image_url) {
    return res.status(400).json({ error: "image_url is required" });
  }

  const userId = tokenStore.user_id;

  try {
    // Step 1: Create media container
    const containerPayload = {
      image_url,
      access_token: tokenStore.access_token,
    };
    if (media_type === "STORIES") {
      containerPayload.media_type = "STORIES";
    } else {
      containerPayload.caption = caption || "";
    }

    const containerRes = await fetch(`${IG_GRAPH_URL}/${userId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerPayload),
    });

    const containerData = await containerRes.json();
    if (!containerRes.ok || !containerData.id) {
      return res.status(500).json({ error: "Failed to create media container", details: containerData });
    }

    // Step 2: Publish
    const publishRes = await fetch(`${IG_GRAPH_URL}/${userId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: tokenStore.access_token,
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok || !publishData.id) {
      return res.status(500).json({ error: "Failed to publish", details: publishData });
    }

    // Clear media cache so next fetch shows new post
    mediaCache = { data: null, cachedAt: 0 };

    return res.json({ ok: true, media_id: publishData.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── Status ──────────────────────────────────────────────── */

/**
 * GET /instagram/status
 * Quick health check for Instagram integration.
 */
router.get("/status", (req, res) => {
  return res.json({
    configured: isConfigured(),
    connected: hasToken(),
    user_id: tokenStore.user_id,
    token_type: tokenStore.token_type || null,
    expires_at: tokenStore.expires_at,
  });
});

/* ── Webhooks ────────────────────────────────────────────── */

const WEBHOOK_VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
if (!WEBHOOK_VERIFY_TOKEN) console.warn("INSTAGRAM_WEBHOOK_VERIFY_TOKEN not set — webhook verification disabled");

/**
 * GET /instagram/webhook
 * Verification endpoint for Instagram webhook subscription.
 * Meta sends a GET with hub.mode, hub.verify_token, hub.challenge.
 */
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("[instagram] Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/**
 * POST /instagram/webhook
 * Receives webhook events (comments, messages, etc).
 * Logs them for now; can be extended to trigger actions.
 */
router.post("/webhook", (req, res) => {
  const body = req.body;
  console.log("[instagram] Webhook event:", JSON.stringify(body).slice(0, 500));
  // Always return 200 quickly to acknowledge receipt
  return res.sendStatus(200);
});

/* ── Auto Token Refresh ──────────────────────────────────── */

/**
 * Automatically refresh the long-lived token when it's within 7 days of expiry.
 * Runs every 12 hours. Long-lived tokens last 60 days and can be refreshed
 * as long as they haven't expired yet.
 */
async function autoRefreshToken() {
  if (!hasToken() || !tokenStore.expires_at || tokenStore.expires_at === "never") return;

  const expiresAt = new Date(tokenStore.expires_at).getTime();
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (expiresAt - now > sevenDays) {
    console.log("[instagram] Token still valid, expires:", tokenStore.expires_at);
    return;
  }

  console.log("[instagram] Token expiring soon, refreshing...");
  try {
    const refreshRes = await fetch(
      `${IG_GRAPH_URL}/refresh_access_token?` +
        `grant_type=ig_refresh_token` +
        `&access_token=${tokenStore.access_token}`
    );
    const data = await refreshRes.json();
    if (data.access_token) {
      tokenStore.access_token = data.access_token;
      tokenStore.expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString();
      tokenStore.token_type = "long-lived";
      saveTokenStore();
      console.log("[instagram] Token refreshed, new expiry:", tokenStore.expires_at);
    } else {
      console.error("[instagram] Auto-refresh failed:", data);
    }
  } catch (err) {
    console.error("[instagram] Auto-refresh error:", err.message);
  }
}

// Run refresh check every 12 hours
setInterval(autoRefreshToken, 12 * 60 * 60 * 1000);
// Also check on startup (after 30s delay to let server settle)
setTimeout(autoRefreshToken, 30 * 1000);

/* ── Manual Trigger Endpoints (for testing) ──── */

router.post("/test-story", async (req, res) => {
  try {
    const { runDailyStory } = require("../ig-scheduler");
    await runDailyStory();
    res.json({ ok: true, message: "Story triggered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/test-post", async (req, res) => {
  try {
    const { runPeriodicPost } = require("../ig-scheduler");
    await runPeriodicPost();
    res.json({ ok: true, message: "Post triggered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
