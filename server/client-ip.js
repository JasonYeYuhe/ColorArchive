/**
 * Resolve the real client IP for rate-limit / abuse keying.
 *
 * Express derives `req.ip` from the connection plus the `trust proxy` setting
 * (set to 1 in server/index.js, so exactly one hop — our reverse proxy — is
 * trusted). NEVER read the left-most `X-Forwarded-For` entry directly: that
 * value is fully client-controlled, so an attacker could mint a fresh
 * rate-limit bucket (or slip past a throttle) on every request by rotating it.
 *
 * Shared by ai-rate-limit.js, api-rate-limit.js, routes/auth.js (authRateLimit)
 * and routes/ai.js (/ai/usage) so the keying is identical everywhere — in
 * particular /ai/usage must hash the same IP as ai-rate-limit.js or the usage
 * badge would disagree with the enforced limit.
 */
function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

module.exports = { getClientIp };
