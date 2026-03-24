const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const {
  MAGIC_LINK_TTL_MS,
  clearSession,
  clearSessionCookie,
  clearGoogleStateCookie,
  consumeMagicLinkToken,
  createMagicLinkToken,
  createSession,
  getGoogleState,
  getOrCreateUser,
  getSessionUser,
  isAnalyticsAdmin,
  setGoogleStateCookie,
  setSessionCookie,
} = require("../auth");
const { sendMagicLinkEmail } = require("../email");
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://colorarchive.me";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "https://api.colorarchive.me/auth/google/callback";

function isGoogleEnabled() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI);
}

function normalizeNextPath(value) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/favorites";
  }

  return value;
}

function getLoginOrigin(req) {
  return typeof req.headers.origin === "string" && req.headers.origin
    ? req.headers.origin
    : FRONTEND_ORIGIN;
}

router.post("/request-link", async (req, res) => {
  const { email, next } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const { token } = createMagicLinkToken(email);
    const loginOrigin = getLoginOrigin(req);
    const nextPath = normalizeNextPath(next);
    const loginUrl = `${loginOrigin}/login?token=${encodeURIComponent(token)}&next=${encodeURIComponent(nextPath)}`;
    await sendMagicLinkEmail(email, {
      loginUrl,
      expiresInMinutes: Math.round(MAGIC_LINK_TTL_MS / 60000),
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error("request-link error:", err);
    return res.status(500).json({ error: "Failed to send login link" });
  }
});

router.post("/verify", (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Missing token" });
  }

  const user = consumeMagicLinkToken(token);

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired login link" });
  }

  const session = createSession(user.id);
  setSessionCookie(res, session.token);

  return res.json({
    ok: true,
    user,
  });
});

router.get("/session", (req, res) => {
  const user = getSessionUser(req);
  return res.json({
    user: user ? { id: user.id, email: user.email, created_at: user.created_at } : null,
    auth: {
      googleEnabled: isGoogleEnabled(),
      analyticsAccess: isAnalyticsAdmin(user),
      tier: user?.tier ?? "anonymous",
    },
  });
});

router.post("/logout", (req, res) => {
  clearSession(req);
  clearSessionCookie(res);
  return res.json({ ok: true });
});

router.get("/google/start", (req, res) => {
  if (!isGoogleEnabled()) {
    return res.status(404).send("Google auth is not configured");
  }

  const nextPath = normalizeNextPath(req.query.next);
  const statePayload = {
    nonce: crypto.randomBytes(16).toString("hex"),
    nextPath,
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");
  setGoogleStateCookie(res, state);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);

  return res.redirect(url.toString());
});

router.get("/google/callback", async (req, res) => {
  if (!isGoogleEnabled()) {
    return res.redirect(`${FRONTEND_ORIGIN}/login?error=google-not-configured`);
  }

  const { code, state } = req.query;
  const storedState = getGoogleState(req);

  if (!code || typeof code !== "string" || !state || typeof state !== "string") {
    clearGoogleStateCookie(res);
    return res.redirect(`${FRONTEND_ORIGIN}/login?error=google-invalid`);
  }

  if (!storedState || storedState !== state) {
    clearGoogleStateCookie(res);
    return res.redirect(`${FRONTEND_ORIGIN}/login?error=google-state`);
  }

  let nextPath = "/favorites";

  try {
    const parsedState = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    nextPath = normalizeNextPath(parsedState.nextPath);
  } catch {
    nextPath = "/favorites";
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenPayload = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenPayload.access_token) {
      throw new Error(tokenPayload.error_description || tokenPayload.error || "Token exchange failed");
    }

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });
    const profile = await profileResponse.json();

    if (!profileResponse.ok || !profile.email || profile.email_verified === false) {
      throw new Error("Google account email is unavailable or unverified");
    }

    const user = getOrCreateUser(profile.email);
    const session = createSession(user.id);
    setSessionCookie(res, session.token);
    clearGoogleStateCookie(res);

    const successUrl = new URL("/login", FRONTEND_ORIGIN);
    successUrl.searchParams.set("auth", "google-success");
    successUrl.searchParams.set("next", nextPath);
    return res.redirect(successUrl.toString());
  } catch (error) {
    console.error("google callback error:", error);
    clearGoogleStateCookie(res);
    return res.redirect(`${FRONTEND_ORIGIN}/login?error=google-failed`);
  }
});

module.exports = router;
