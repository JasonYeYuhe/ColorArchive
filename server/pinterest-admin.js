/**
 * Pinterest admin helper — owns the org-level access/refresh token used
 * by the autopilot and any server-initiated publishing.
 *
 * Token storage mirrors the existing Instagram pattern: a flat JSON file
 * on disk (`.pinterest-admin-token.json`) that persists across restarts.
 * A `PINTEREST_ADMIN_TOKEN` env var acts as an initial seed when the
 * file does not yet exist — useful for bootstrapping without running
 * the full OAuth flow first.
 *
 * Refresh strategy (mirrors instagram.js exactly — picked one approach
 * and stuck to it per Codex review):
 *   1. On server boot, run autoRefreshToken() once
 *   2. Every 12 hours via setInterval
 *   3. If a publish request returns 401, refresh once and retry
 *
 * This module exports in-process functions. The HTTP admin routes in
 * routes/pinterest.js are a thin wrapper around these functions for
 * manual/curl use. Autopilot scripts should require() this module
 * directly — no internal HTTP hop required.
 */

const fs = require("fs");
const path = require("path");

const PINTEREST_API_BASE = process.env.PINTEREST_SANDBOX === "true"
  ? "https://api-sandbox.pinterest.com/v5"
  : "https://api.pinterest.com/v5";

const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID || "1559553";
const PINTEREST_APP_SECRET = process.env.PINTEREST_APP_SECRET || "";

const TOKEN_FILE = path.join(__dirname, ".pinterest-admin-token.json");
const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12h

let tokenStore = {
  access_token: null,
  refresh_token: null,
  expires_at: null, // ms epoch
  username: null,
  updated_at: null,
};

let lastPinAt = null;
let refreshTimer = null;

/* ── Token persistence ────────────────────────────────────── */

function loadTokenStore() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const raw = fs.readFileSync(TOKEN_FILE, "utf8");
      const parsed = JSON.parse(raw);
      tokenStore = { ...tokenStore, ...parsed };
      return;
    }
  } catch (err) {
    console.error("[pinterest-admin] failed to read token file:", err.message);
  }

  // Fallback: seed from env if present
  const seed = process.env.PINTEREST_ADMIN_TOKEN;
  if (seed && seed.startsWith("pina_")) {
    tokenStore.access_token = seed;
    tokenStore.updated_at = new Date().toISOString();
    console.log("[pinterest-admin] seeded access_token from PINTEREST_ADMIN_TOKEN env");
  }
}

function saveTokenStore() {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenStore, null, 2), "utf8");
  } catch (err) {
    console.error("[pinterest-admin] failed to write token file:", err.message);
  }
}

function hasToken() {
  return Boolean(tokenStore.access_token);
}

function basicAuthHeader() {
  return "Basic " + Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString("base64");
}

/* ── OAuth bootstrap ──────────────────────────────────────── */

async function exchangeAuthCode(code, redirectUri) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(`${PINTEREST_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`token exchange failed: ${res.status} — ${JSON.stringify(data)}`);
  }

  tokenStore.access_token = data.access_token;
  tokenStore.refresh_token = data.refresh_token || tokenStore.refresh_token;
  tokenStore.expires_at = data.expires_in
    ? Date.now() + data.expires_in * 1000
    : null;
  tokenStore.updated_at = new Date().toISOString();

  // Fetch username for /status display
  try {
    const me = await fetch(`${PINTEREST_API_BASE}/user_account`, {
      headers: { Authorization: `Bearer ${tokenStore.access_token}` },
    }).then((r) => r.json());
    if (me?.username) tokenStore.username = me.username;
  } catch (err) {
    console.error("[pinterest-admin] user_account fetch failed:", err.message);
  }

  saveTokenStore();
  return tokenStore;
}

/* ── Token refresh ────────────────────────────────────────── */

async function autoRefreshToken() {
  if (!tokenStore.refresh_token) {
    // Nothing to refresh — the token was likely seeded from env
    // (long-lived user token). Pinterest will surface a 401 when it
    // actually expires; we refresh reactively then.
    return;
  }

  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenStore.refresh_token,
      scope: "boards:read,boards:write,pins:read,pins:write",
    });

    const res = await fetch(`${PINTEREST_API_BASE}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
      console.error("[pinterest-admin] refresh failed:", res.status, data);
      return;
    }

    tokenStore.access_token = data.access_token;
    if (data.refresh_token) tokenStore.refresh_token = data.refresh_token;
    tokenStore.expires_at = data.expires_in
      ? Date.now() + data.expires_in * 1000
      : null;
    tokenStore.updated_at = new Date().toISOString();
    saveTokenStore();
    console.log("[pinterest-admin] token refreshed");
  } catch (err) {
    console.error("[pinterest-admin] refresh error:", err.message);
  }
}

function scheduleAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(autoRefreshToken, REFRESH_INTERVAL_MS);
}

/* ── API wrappers ─────────────────────────────────────────── */

function normalizeMediaUrl(media) {
  if (!media?.url || typeof media.url !== "string") return media;
  if (/\/opengraph-image$/.test(media.url)) {
    return { ...media, url: media.url + "/" };
  }
  return media;
}

async function apiFetch(pathname, options = {}, { retryOn401 = true } = {}) {
  if (!hasToken()) throw new Error("admin token not configured");

  const doFetch = () =>
    fetch(`${PINTEREST_API_BASE}${pathname}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${tokenStore.access_token}`,
      },
    });

  let res = await doFetch();
  if (res.status === 401 && retryOn401) {
    console.log("[pinterest-admin] 401 — refreshing token and retrying");
    await autoRefreshToken();
    res = await doFetch();
  }
  return res;
}

async function listBoards() {
  const res = await apiFetch("/boards?page_size=50");
  const data = await res.json();
  if (!res.ok) throw new Error(`listBoards failed: ${res.status} — ${JSON.stringify(data)}`);
  return data.items || [];
}

async function createBoard({ name, description, privacy = "PUBLIC" }) {
  const res = await apiFetch("/boards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, privacy }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`createBoard failed: ${res.status} — ${JSON.stringify(data)}`);
  return data;
}

async function publishPin({ boardId, title, description, link, imageUrl, altText }) {
  const media_source = normalizeMediaUrl({ source_type: "image_url", url: imageUrl });

  const body = {
    board_id: boardId,
    title: (title || "").slice(0, 100),
    description: (description || "").slice(0, 500),
    link,
    media_source,
  };
  if (altText) body.alt_text = altText.slice(0, 500);

  const res = await apiFetch("/pins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`publishPin failed: ${res.status} — ${JSON.stringify(data)}`);
  }

  lastPinAt = new Date().toISOString();
  return data;
}

async function deletePin(pinId) {
  const res = await apiFetch(`/pins/${encodeURIComponent(pinId)}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`deletePin failed: ${res.status} — ${JSON.stringify(data)}`);
  }
  return { ok: true };
}

function getStatus() {
  return {
    connected: hasToken(),
    username: tokenStore.username,
    expires_at: tokenStore.expires_at,
    updated_at: tokenStore.updated_at,
    last_pin_at: lastPinAt,
    sandbox: process.env.PINTEREST_SANDBOX === "true",
  };
}

/* ── Init ─────────────────────────────────────────────────── */

function init() {
  loadTokenStore();
  // Fire-and-forget boot refresh so startup isn't blocked on Pinterest's API
  autoRefreshToken().catch((err) =>
    console.error("[pinterest-admin] boot refresh failed:", err.message)
  );
  scheduleAutoRefresh();
}

module.exports = {
  init,
  exchangeAuthCode,
  listBoards,
  createBoard,
  publishPin,
  deletePin,
  getStatus,
  hasToken,
};
