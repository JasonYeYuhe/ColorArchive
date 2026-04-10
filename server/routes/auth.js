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
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://colorarchive.org";

// --- Simple in-memory rate limiter for auth endpoints ---
const authAttempts = new Map();
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_MAX_ATTEMPTS = 5; // 5 attempts per window

function authRateLimit(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  // For /request-link: rate-limits by IP+email; for /verify: by IP only (no email in body)
  const email = (req.body?.email || "").toLowerCase();
  const key = `${ip}:${email}`;
  const now = Date.now();

  const entry = authAttempts.get(key);
  if (entry) {
    // Purge expired entries
    if (now - entry.firstAttempt > AUTH_WINDOW_MS) {
      authAttempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }
    if (entry.count >= AUTH_MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((entry.firstAttempt + AUTH_WINDOW_MS - now) / 1000);
      return res.status(429).json({ error: "Too many attempts. Please try again later.", retryAfter });
    }
    entry.count++;
  } else {
    authAttempts.set(key, { count: 1, firstAttempt: now });
  }

  return next();
}

// Cleanup stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of authAttempts) {
    if (now - entry.firstAttempt > AUTH_WINDOW_MS) authAttempts.delete(key);
  }
}, 30 * 60 * 1000);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "https://api.colorarchive.org/auth/google/callback";

function isGoogleEnabled() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI);
}

function normalizeNextPath(value) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/favorites";
  }

  return value;
}

// Dynamically match the configured domain + its subdomains
const _authDomain = (FRONTEND_ORIGIN).replace(/^https?:\/\//, "").replace(/\/$/, "");
const ALLOWED_ORIGIN_RE = new RegExp(
  `^https:\\/\\/[\\w-]+\\.${_authDomain.replace(/\./g, "\\.")}$|^https:\\/\\/${_authDomain.replace(/\./g, "\\.")}$`
);

function getLoginOrigin(req) {
  const reqOrigin = req?.headers?.origin;
  if (reqOrigin && ALLOWED_ORIGIN_RE.test(reqOrigin)) return reqOrigin;
  return FRONTEND_ORIGIN;
}

router.post("/request-link", authRateLimit, async (req, res) => {
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

router.post("/verify", authRateLimit, (req, res) => {
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

// ---- Apple IAP Purchase Verification ----

const db = require("../db");
const { verifySignedTransaction } = require("../apple-jws");

const VALID_APPLE_PRODUCTS = [
  "me.colorarchive.pro.monthly",
  "me.colorarchive.pro.yearly",
  "me.colorarchive.pro.lifetime",
];

/**
 * Called by the iOS app after a successful StoreKit 2 purchase.
 * Links the Apple transaction to the authenticated user and grants Pro tier.
 *
 * Accepts two modes:
 * 1. signedTransaction (preferred) — JWS from Transaction.jwsRepresentation,
 *    verified server-side against Apple's certificate chain.
 * 2. Legacy fields (productId, originalTransactionId, etc.) — backward
 *    compatible with older iOS app versions. Logs a deprecation warning.
 */
router.post("/apple-purchase", async (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  let productId, originalTransactionId, transactionDate, environment, expiresDate;
  let verified = false;

  try {
    // Preferred path: verify the Apple-signed JWS
    if (req.body.signedTransaction) {
      const txn = await verifySignedTransaction(req.body.signedTransaction);
      productId = txn.productId;
      originalTransactionId = txn.originalTransactionId;
      transactionDate = txn.purchaseDate;
      environment = txn.environment;
      expiresDate = txn.expiresDate;
      verified = true;
    } else {
      // Legacy path: trust client-supplied data (backward compat)
      console.warn(
        `[DEPRECATION] apple-purchase called without signedTransaction (user ${user.id}). ` +
        "Update the iOS app to send transaction.jwsRepresentation."
      );
      ({ productId, originalTransactionId, transactionDate, environment } = req.body);
    }

    if (!productId || !originalTransactionId) {
      return res.status(400).json({ error: "Missing productId or originalTransactionId" });
    }

    if (!VALID_APPLE_PRODUCTS.includes(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const txnId = String(originalTransactionId);

    // Fix #3: Check if this transaction is already linked to a different user
    const existing = db.prepare(
      "SELECT user_id FROM apple_purchases WHERE original_transaction_id = ?"
    ).get(txnId);

    if (existing && existing.user_id !== user.id) {
      return res.status(409).json({
        error: "This purchase is already linked to a different account",
      });
    }

    // Upsert the purchase record (within a transaction for atomicity)
    const applyPurchase = db.transaction(() => {
      db.prepare(`
        INSERT INTO apple_purchases (user_id, product_id, original_transaction_id, transaction_date, environment, expires_date)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(original_transaction_id) DO UPDATE SET
          status = 'active',
          product_id = excluded.product_id,
          expires_date = excluded.expires_date
      `).run(
        user.id,
        productId,
        txnId,
        transactionDate || new Date().toISOString(),
        environment || "Production",
        expiresDate || null
      );

      // Calculate pro expiration
      let proExpiresAt = null;
      if (expiresDate && verified) {
        // Use Apple-provided expiration date when available (most accurate)
        const d = new Date(expiresDate);
        d.setDate(d.getDate() + 3); // 3-day grace
        proExpiresAt = d.toISOString();
      } else if (productId === "me.colorarchive.pro.monthly") {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setDate(d.getDate() + 3); // 3-day grace
        proExpiresAt = d.toISOString();
      } else if (productId === "me.colorarchive.pro.yearly") {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        d.setDate(d.getDate() + 3);
        proExpiresAt = d.toISOString();
      }
      // lifetime → proExpiresAt stays null (no expiration)

      db.prepare(`
        UPDATE users SET
          tier = 'pro',
          pro_expires_at = ?,
          apple_original_transaction_id = ?,
          payment_provider = 'apple'
        WHERE id = ?
      `).run(proExpiresAt, txnId, user.id);

      return proExpiresAt;
    });

    const proExpiresAt = applyPurchase();

    return res.json({ ok: true, tier: "pro", proExpiresAt, verified });
  } catch (err) {
    // Distinguish JWS verification failures from other errors
    if (err.message && err.message.includes("Apple")) {
      console.error("apple-purchase JWS verification failed:", err.message);
      return res.status(403).json({ error: "Transaction verification failed" });
    }
    console.error("apple-purchase error:", err);
    return res.status(500).json({ error: "Failed to process purchase" });
  }
});

module.exports = router;
