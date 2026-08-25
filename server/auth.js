const crypto = require("crypto");
const db = require("./db");
const { effectiveTier } = require("./entitlement");

const SESSION_COOKIE = "colorarchive_session";
const GOOGLE_STATE_COOKIE = "colorarchive_google_state";
const MAGIC_LINK_TTL_MS = 1000 * 60 * 30;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const GOOGLE_STATE_TTL_MS = 1000 * 60 * 10;
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

function now() {
  return Date.now();
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createOpaqueToken() {
  return crypto.randomBytes(32).toString("hex");
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) {
    return {};
  }

  return Object.fromEntries(
    header.split(";").map((part) => {
      const [name, ...rest] = part.trim().split("=");
      return [name, decodeURIComponent(rest.join("="))];
    }),
  );
}

function buildCookie(value, maxAgeMs = SESSION_TTL_MS) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];

  return parts.join("; ");
}

function buildClearCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function buildNamedCookie(name, value, maxAgeMs) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];

  return parts.join("; ");
}

function buildNamedClearCookie(name) {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function getOrCreateUser(email) {
  const normalizedEmail = email.trim().toLowerCase();

  db.prepare("INSERT OR IGNORE INTO users (email) VALUES (?)").run(normalizedEmail);

  return db
    .prepare("SELECT id, email, created_at FROM users WHERE email = ?")
    .get(normalizedEmail);
}

function isAnalyticsAdmin(user) {
  return Boolean(user && ADMIN_EMAILS.size > 0 && ADMIN_EMAILS.has(user.email));
}

function createMagicLinkToken(email) {
  const user = getOrCreateUser(email);
  const token = createOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = now() + MAGIC_LINK_TTL_MS;

  db.prepare(
    "INSERT INTO magic_link_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
  ).run(user.id, tokenHash, expiresAt);

  return {
    user,
    token,
    expiresAt,
  };
}

function consumeMagicLinkToken(token) {
  const tokenHash = hashToken(token);
  const record = db
    .prepare(
      `
        SELECT magic_link_tokens.id, magic_link_tokens.user_id, magic_link_tokens.expires_at,
               magic_link_tokens.used_at,
               users.email, users.created_at
        FROM magic_link_tokens
        INNER JOIN users ON users.id = magic_link_tokens.user_id
        WHERE magic_link_tokens.token_hash = ?
      `,
    )
    .get(tokenHash);

  if (!record || record.used_at || record.expires_at < now()) {
    if (record && record.expires_at < now()) {
      db.prepare("DELETE FROM magic_link_tokens WHERE id = ?").run(record.id);
    }
    return null;
  }

  db.prepare("UPDATE magic_link_tokens SET used_at = datetime('now') WHERE id = ?").run(record.id);

  return {
    id: record.user_id,
    email: record.email,
    created_at: record.created_at,
  };
}

function createSession(userId) {
  const token = createOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = now() + SESSION_TTL_MS;

  db.prepare("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)").run(
    userId,
    tokenHash,
    expiresAt,
  );

  return {
    token,
    expiresAt,
  };
}

function getSessionToken(req) {
  const cookies = parseCookies(req);
  return cookies[SESSION_COOKIE] ?? null;
}

function getSessionUser(req) {
  const sessionToken = getSessionToken(req);

  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashToken(sessionToken);
  const session = db
    .prepare(
      `
        SELECT sessions.id as session_id, sessions.user_id, sessions.expires_at,
               users.email, users.created_at, users.tier, users.pro_expires_at
        FROM sessions
        INNER JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ?
      `,
    )
    .get(tokenHash);

  if (!session || session.expires_at < now()) {
    if (session) {
      db.prepare("DELETE FROM sessions WHERE id = ?").run(session.session_id);
    }
    return null;
  }

  // Check if pro has expired. The rule itself lives in ../entitlement.js so the
  // API-key path cannot answer this question differently — see effectiveTier().
  const resolved = effectiveTier({
    tier: session.tier,
    proExpiresAt: session.pro_expires_at,
    now: now(),
  });
  const tier = resolved.tier;
  if (resolved.expired) {
    db.prepare("UPDATE users SET tier = 'free' WHERE id = ?").run(session.user_id);
  }

  return {
    id: session.user_id,
    email: session.email,
    created_at: session.created_at,
    tier,
  };
}

function clearSession(req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return;
  }

  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(sessionToken));
}

function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", buildCookie(token));
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", buildClearCookie());
}

function setGoogleStateCookie(res, state) {
  res.append("Set-Cookie", buildNamedCookie(GOOGLE_STATE_COOKIE, state, GOOGLE_STATE_TTL_MS));
}

function clearGoogleStateCookie(res) {
  res.append("Set-Cookie", buildNamedClearCookie(GOOGLE_STATE_COOKIE));
}

function getGoogleState(req) {
  const cookies = parseCookies(req);
  return cookies[GOOGLE_STATE_COOKIE] ?? null;
}

function requireUser(req, res, next) {
  const user = getSessionUser(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = user;
  return next();
}

function requireAnalyticsAccess(req, res, next) {
  const user = getSessionUser(req);

  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!isAnalyticsAdmin(user)) {
    return res.status(403).json({ error: "Analytics access denied" });
  }

  req.user = user;
  return next();
}

function sanitizeStringArray(value, limit = 64) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((entry) => typeof entry === "string"))].slice(0, limit);
}

function getUserPreferences(userId) {
  const record = db
    .prepare(
      "SELECT favorites_json, palette_json FROM user_preferences WHERE user_id = ?",
    )
    .get(userId);

  if (!record) {
    return {
      favorites: [],
      palette: [],
    };
  }

  try {
    return {
      favorites: sanitizeStringArray(JSON.parse(record.favorites_json)),
      palette: sanitizeStringArray(JSON.parse(record.palette_json), 6),
    };
  } catch {
    return {
      favorites: [],
      palette: [],
    };
  }
}

function saveUserPreferences(userId, { favorites, palette }) {
  const nextFavorites = sanitizeStringArray(favorites);
  const nextPalette = sanitizeStringArray(palette, 6);

  db.prepare(
    `
      INSERT INTO user_preferences (user_id, favorites_json, palette_json, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        favorites_json = excluded.favorites_json,
        palette_json = excluded.palette_json,
        updated_at = datetime('now')
    `,
  ).run(userId, JSON.stringify(nextFavorites), JSON.stringify(nextPalette));

  return {
    favorites: nextFavorites,
    palette: nextPalette,
  };
}

module.exports = {
  createMagicLinkToken,
  consumeMagicLinkToken,
  createSession,
  getSessionUser,
  setSessionCookie,
  clearSessionCookie,
  clearSession,
  requireUser,
  requireAnalyticsAccess,
  getUserPreferences,
  saveUserPreferences,
  getOrCreateUser,
  isAnalyticsAdmin,
  setGoogleStateCookie,
  clearGoogleStateCookie,
  getGoogleState,
  MAGIC_LINK_TTL_MS,
};
