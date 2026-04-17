/**
 * Admin bearer-token middleware.
 *
 * Gates routes that publish content on behalf of the org (Pinterest
 * autopilot pins, Instagram admin publish, etc.). Checks that the
 * Authorization header is `Bearer ${ADMIN_API_TOKEN}` where
 * ADMIN_API_TOKEN is a random secret set in the server's .env.
 *
 * Rejection is fail-closed: missing env var → 500 (refuse to serve)
 * rather than accidentally opening the route.
 */

const crypto = require("crypto");

// Compare two strings in constant time. We hash both to a fixed-length
// digest first so that any length difference in the inputs does not
// leak through the comparison runtime — node's crypto.timingSafeEqual
// throws on length mismatch, which would otherwise be a timing oracle.
function constantTimeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ah = crypto.createHash("sha256").update(a).digest();
  const bh = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ah, bh);
}

function requireAdminBearer(req, res, next) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected || expected.length < 16) {
    console.error("[admin-auth] ADMIN_API_TOKEN not set or too short — refusing to serve admin route");
    return res.status(500).json({ error: "Admin auth not configured on server" });
  }

  const header = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(header);
  const provided = m ? m[1].trim() : "";

  if (!constantTimeEqual(provided, expected)) {
    return res.status(401).json({ error: "Admin bearer token required" });
  }

  next();
}

module.exports = { requireAdminBearer };
