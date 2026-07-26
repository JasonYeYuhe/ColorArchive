/**
 * Resolve the real client IP for rate-limit / abuse keying.
 *
 * Express derives `req.ip` from the connection plus the `trust proxy` setting
 * (set to 1 in server/index.js, so exactly one hop — our reverse proxy — is
 * trusted). NEVER read the left-most `X-Forwarded-For` entry directly: that
 * value is fully client-controlled, so an attacker could mint a fresh
 * rate-limit bucket (or slip past a throttle) on every request by rotating it.
 *
 * `trust proxy = 1` + nginx's `$proxy_add_x_forwarded_for` is the safe pairing:
 * a client-supplied `X-Forwarded-For: 1.2.3.4` becomes `1.2.3.4, <real>`, and
 * peeling exactly one trusted hop off the right lands on the real address.
 *
 * Shared by ai-rate-limit.js, api-rate-limit.js, routes/auth.js (authRateLimit),
 * routes/subscribe.js, routes/events.js and routes/ai.js (/ai/usage) so the
 * keying is identical everywhere — in particular /ai/usage must hash the same
 * IP as ai-rate-limit.js or the usage badge would disagree with the enforced
 * limit.
 *
 * HISTORY — the bug this file now guards against. From 2026-04-02 to 2026-07-26
 * nginx set only `X-Real-IP` and never `X-Forwarded-For`, so `req.ip` fell back
 * to the socket address, which for a loopback reverse-proxy hop is always
 * 127.0.0.1 / ::1. Every per-IP limit in the API therefore collapsed into ONE
 * shared bucket for the entire internet, and `/verify` (5 per 15 min, keyed on an
 * email the request body never carries) was a one-actor site-wide login
 * denial-of-service.
 *
 * ON THE DAMAGE FIGURE, because the first version of this comment overstated it:
 * nginx logs for 07-12..07-26 contain 1,025 429s on those two routes, but 1,024 of
 * them are one address (174.173.86.177) on one day, and that address sent 5,561
 * analytics writes in total — a flood being correctly throttled, not real users
 * losing data. Exactly ONE other 429 appears in the whole fortnight. The collapsed
 * bucket was real and worth fixing; the claim that it silently cost us a thousand
 * genuine measurements was not, and should not be repeated. `isLoopbackIp()`
 * exists so index.js can detect a regression at boot instead of us finding out
 * four months later.
 */

/** True for the addresses a loopback reverse-proxy hop produces. */
function isLoopbackIp(ip) {
  if (!ip) return false;
  const v = String(ip).trim().toLowerCase();
  return (
    v === "127.0.0.1" ||
    v === "::1" ||
    v === "::ffff:127.0.0.1" ||
    v === "localhost" ||
    v.startsWith("127.")
  );
}

function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

/**
 * The value rate limits should be keyed on.
 *
 * IPv6 is handed out in enormous per-customer allocations: a single subscriber
 * routinely controls a /64, which is 2^64 addresses. Keying on the full address
 * would let one actor mint an unlimited number of fresh buckets just by picking
 * a new suffix per request — no proxy pool required. Collapse IPv6 to its /64
 * network prefix so a rotation stays inside one bucket. IPv4 is keyed whole.
 */
function getRateLimitKey(req) {
  const ip = getClientIp(req);
  if (typeof ip !== "string" || !ip.includes(":")) return ip;

  // IPv4-mapped IPv6 (::ffff:1.2.3.4) is really IPv4 — key it as such.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped) return mapped[1];

  // Expand "::" before slicing. Naively taking `split(":").slice(0, 4)` looks
  // right but silently fails on compressed addresses: "2001:db8::1" splits to
  // ["2001","db8","","1"], whose first four parts rejoin to the WHOLE address —
  // so every interface id would get its own bucket, which is the exact hole
  // this function exists to close.
  const [head, tail] = ip.split("::");
  const left = head ? head.split(":").filter(Boolean) : [];
  const right = tail !== undefined && tail ? tail.split(":").filter(Boolean) : [];
  const hextets =
    tail === undefined
      ? left // no "::" at all — already fully written out
      : [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right];

  const prefix = hextets
    .slice(0, 4)
    .map((h) => h.replace(/^0+(?=.)/, "")) // 0db8 and db8 must key alike
    .join(":");
  return prefix + "::/64";
}

module.exports = { getClientIp, getRateLimitKey, isLoopbackIp };
