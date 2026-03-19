const express = require("express");
const router = express.Router();
const {
  MAGIC_LINK_TTL_MS,
  clearSession,
  clearSessionCookie,
  consumeMagicLinkToken,
  createMagicLinkToken,
  createSession,
  getSessionUser,
  setSessionCookie,
} = require("../auth");
const { sendMagicLinkEmail } = require("../email");
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://colorarchive.me";

router.post("/request-link", async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const { token } = createMagicLinkToken(email);
    const loginOrigin =
      typeof req.headers.origin === "string" && req.headers.origin
        ? req.headers.origin
        : FRONTEND_ORIGIN;
    const loginUrl = `${loginOrigin}/login?token=${encodeURIComponent(token)}`;
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
    user,
  });
});

router.post("/logout", (req, res) => {
  clearSession(req);
  clearSessionCookie(res);
  return res.json({ ok: true });
});

module.exports = router;
