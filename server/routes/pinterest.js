/**
 * Pinterest API proxy routes (v5)
 *
 * Acts as a backend proxy for Pinterest API calls to avoid CORS issues.
 * Two logically-distinct surfaces share this module:
 *
 *   User flow (browser → their own account):
 *     POST /pinterest/token   — exchange auth code for the visitor's token
 *     GET  /pinterest/boards  — fetch the visitor's boards
 *     POST /pinterest/pins    — create a pin on the visitor's board
 *     GET  /pinterest/status  — health check
 *
 *   Admin flow (server-initiated, publishes on OUR Pinterest account):
 *     GET    /pinterest/admin/auth/start    — OAuth bootstrap (admin-only)
 *     GET    /pinterest/admin/auth/callback — store admin token
 *     POST   /pinterest/admin/publish       — create pin on org board
 *     DELETE /pinterest/admin/pins/:id      — un-publish a pin
 *     GET    /pinterest/admin/boards        — list org boards
 *     POST   /pinterest/admin/boards        — create a new org board
 *     GET    /pinterest/admin/status        — token freshness + last pin
 *
 *   Admin routes are guarded by requireAdminBearer (Authorization:
 *   Bearer ${ADMIN_API_TOKEN}). Autopilot scripts should NOT hit these
 *   HTTP endpoints — require("../pinterest-admin") directly instead.
 */

const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { requireAdminBearer } = require("../require-admin-bearer");
const pinterestAdmin = require("../pinterest-admin");

const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID || "1559553";
const PINTEREST_APP_SECRET = process.env.PINTEREST_APP_SECRET || "";
// App has Standard access (approved 2026-04-15). Reads + writes both hit production.
// PINTEREST_SANDBOX=true is a dev escape hatch for local testing against the sandbox cluster.
const USE_SANDBOX = process.env.PINTEREST_SANDBOX === "true";
const PINTEREST_API_BASE = USE_SANDBOX
  ? "https://api-sandbox.pinterest.com/v5"
  : "https://api.pinterest.com/v5";

function isConfigured() {
  return Boolean(PINTEREST_APP_ID && PINTEREST_APP_SECRET);
}

/**
 * Build Basic auth header for token exchange.
 * Pinterest requires Base64(app_id:app_secret).
 */
function basicAuthHeader() {
  return "Basic " + Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString("base64");
}

/* ── Token Exchange ─────────────────────────────────────── */

/**
 * POST /pinterest/token
 * Body: { code, redirect_uri }
 * Returns: { access_token, token_type, expires_in, scope }
 */
router.post("/token", async (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({ error: "Pinterest API not configured (missing app secret)" });
  }

  const { code, redirect_uri } = req.body;
  if (!code || !redirect_uri) {
    return res.status(400).json({ error: "code and redirect_uri are required" });
  }

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri,
    });

    const tokenRes = await fetch(`${PINTEREST_API_BASE}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok || !data.access_token) {
      console.error("[pinterest] Token exchange failed:", data);
      return res.status(tokenRes.status).json({ error: "Token exchange failed", details: data });
    }

    console.log("[pinterest] Token exchange successful, scope:", data.scope);
    return res.json({ access_token: data.access_token });
  } catch (err) {
    console.error("[pinterest] Token exchange error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ── Boards ─────────────────────────────────────────────── */

/**
 * GET /pinterest/boards
 * Header: Authorization: Bearer <user_token>
 * Proxies to Pinterest API v5 /boards endpoint.
 */
router.get("/boards", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  try {
    const url = new URL(`${PINTEREST_API_BASE}/boards`);
    url.searchParams.set("page_size", "50");
    if (req.query.bookmark) {
      url.searchParams.set("bookmark", req.query.bookmark);
    }

    const boardsRes = await fetch(url.toString(), {
      headers: { Authorization: token },
    });

    const data = await boardsRes.json();
    if (!boardsRes.ok) {
      console.error("[pinterest] Fetch boards failed:", data);
      return res.status(boardsRes.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error("[pinterest] Fetch boards error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ── Pins ───────────────────────────────────────────────── */

/**
 * POST /pinterest/pins
 * Header: Authorization: Bearer <user_token>
 * Body: { board_id, title, description, link, media_source, alt_text }
 * Proxies to Pinterest API v5 /pins endpoint.
 */
router.post("/pins", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const { board_id, title, description, link, media_source, alt_text } = req.body;
  if (!board_id || !media_source) {
    return res.status(400).json({ error: "board_id and media_source are required" });
  }

  try {
    // Defensive normalization: colorarchive.org enforces trailingSlash:true,
    // so any /colors/:slug/opengraph-image without a trailing slash 308-redirects.
    // Pinterest's image fetcher does not follow that redirect (error 2786).
    // Older clients or service-worker-cached builds may send the unslashed form —
    // fix it here so the proxy is robust regardless of what the client sent.
    const normalizedMedia = { ...media_source };
    if (
      normalizedMedia?.url &&
      typeof normalizedMedia.url === "string" &&
      /\/opengraph-image$/.test(normalizedMedia.url)
    ) {
      normalizedMedia.url = normalizedMedia.url + "/";
    }
    const pinBody = { board_id, title, description, link, media_source: normalizedMedia };
    if (alt_text) pinBody.alt_text = alt_text;

    const pinRes = await fetch(`${PINTEREST_API_BASE}/pins`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pinBody),
    });

    const data = await pinRes.json();
    if (!pinRes.ok) {
      console.error("[pinterest] Create pin failed:", data);
      return res.status(pinRes.status).json(data);
    }

    console.log("[pinterest] Pin created:", data.id);
    return res.json(data);
  } catch (err) {
    console.error("[pinterest] Create pin error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ── Status ─────────────────────────────────────────────── */

router.get("/status", (req, res) => {
  return res.json({
    configured: isConfigured(),
    app_id: PINTEREST_APP_ID,
    sandbox: USE_SANDBOX,
    api_base: PINTEREST_API_BASE,
  });
});

/* ── Admin flow ─────────────────────────────────────────────
 *
 * All /admin/* routes require Authorization: Bearer ${ADMIN_API_TOKEN}.
 * Except for the OAuth callback, which has its own CSRF defense via
 * a server-generated state cookie.
 */

const ADMIN_REDIRECT_URI =
  process.env.PINTEREST_ADMIN_REDIRECT_URI ||
  "https://api.colorarchive.org/pinterest/admin/auth/callback";
const ADMIN_OAUTH_STATE_COOKIE = "pin_admin_oauth_state";

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

function setShortCookie(res, name, value, maxAgeMs) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  res.setHeader("Set-Cookie", parts.join("; "));
}

/**
 * GET /pinterest/admin/auth/start
 * Admin-gated OAuth kickoff. Returns 302 to Pinterest authorize URL.
 * Bootstrap path for refreshing the org token when it expires.
 */
router.get("/admin/auth/start", requireAdminBearer, (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({ error: "Pinterest app not configured" });
  }
  const state = crypto.randomBytes(16).toString("hex");
  setShortCookie(res, ADMIN_OAUTH_STATE_COOKIE, state, 10 * 60 * 1000);

  const url = new URL("https://www.pinterest.com/oauth/");
  url.searchParams.set("client_id", PINTEREST_APP_ID);
  url.searchParams.set("redirect_uri", ADMIN_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "boards:read,boards:write,pins:read,pins:write");
  url.searchParams.set("state", state);
  return res.redirect(url.toString());
});

/**
 * GET /pinterest/admin/auth/callback
 * OAuth redirect target. Verifies state cookie, exchanges code,
 * persists token via pinterest-admin helper. No bearer required
 * because Pinterest is the caller; state cookie is the CSRF defense.
 */
router.get("/admin/auth/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return res.status(400).send(`Pinterest OAuth error: ${String(error)}`);
  if (!code) return res.status(400).send("Missing code");

  const cookies = parseCookies(req);
  if (!cookies[ADMIN_OAUTH_STATE_COOKIE] || cookies[ADMIN_OAUTH_STATE_COOKIE] !== state) {
    return res.status(400).send("Invalid state — CSRF check failed");
  }

  try {
    await pinterestAdmin.exchangeAuthCode(String(code), ADMIN_REDIRECT_URI);
    return res.status(200).send("Pinterest admin token stored. You can close this tab.");
  } catch (err) {
    console.error("[pinterest-admin] callback error:", err);
    return res.status(500).send("Token exchange failed: " + err.message);
  }
});

router.get("/admin/status", requireAdminBearer, (req, res) => {
  return res.json(pinterestAdmin.getStatus());
});

router.get("/admin/boards", requireAdminBearer, async (req, res) => {
  try {
    const boards = await pinterestAdmin.listBoards();
    return res.json({ items: boards });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/admin/boards", requireAdminBearer, async (req, res) => {
  const { name, description, privacy } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  try {
    const board = await pinterestAdmin.createBoard({ name, description, privacy });
    return res.status(201).json(board);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/admin/publish", requireAdminBearer, async (req, res) => {
  const { board_id, title, description, link, image_url, alt_text } = req.body || {};
  if (!board_id || !image_url) {
    return res.status(400).json({ error: "board_id and image_url are required" });
  }
  try {
    const pin = await pinterestAdmin.publishPin({
      boardId: board_id,
      title,
      description,
      link,
      imageUrl: image_url,
      altText: alt_text,
    });
    return res.status(201).json(pin);
  } catch (err) {
    console.error("[pinterest-admin] publish error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/admin/pins/:id", requireAdminBearer, async (req, res) => {
  try {
    const result = await pinterestAdmin.deletePin(req.params.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
