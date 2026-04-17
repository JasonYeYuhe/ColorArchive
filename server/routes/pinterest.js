/**
 * Pinterest API proxy routes (v5)
 *
 * Acts as a backend proxy for Pinterest API calls to avoid CORS issues.
 * The frontend handles the OAuth redirect flow; this server exchanges
 * the authorization code for an access token and proxies board/pin API calls.
 *
 * Endpoints:
 *   POST /pinterest/token   — Exchange auth code for access token
 *   GET  /pinterest/boards  — Fetch user's boards (proxied)
 *   POST /pinterest/pins    — Create a pin (proxied)
 *   GET  /pinterest/status  — Health check
 */

const express = require("express");
const router = express.Router();

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
    const pinBody = { board_id, title, description, link, media_source };
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

module.exports = router;
