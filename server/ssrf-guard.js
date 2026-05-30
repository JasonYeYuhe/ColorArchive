const dns = require("dns").promises;
const net = require("net");

/**
 * SSRF guard for server-side fetches of user-supplied URLs.
 *
 * Blocks requests to private, loopback, link-local, and reserved IP ranges so
 * an attacker can't make the server reach internal services or the cloud
 * metadata endpoint (169.254.169.254). Used by POST /ai/analyze-url.
 *
 * NOTE: validation resolves the hostname and rejects if ANY resolved address is
 * blocked. There is a residual DNS-rebinding window (the kernel re-resolves at
 * fetch time); for this low-value color-scraping feature the hostname check plus
 * per-redirect re-validation is a proportionate mitigation.
 */

function ipv4ToLong(ip) {
  return ip.split(".").reduce((acc, oct) => (acc * 256 + parseInt(oct, 10)) >>> 0, 0) >>> 0;
}

function inCidr(ip, cidr, bits) {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipv4ToLong(ip) & mask) === (ipv4ToLong(cidr) & mask);
}

function isBlockedIPv4(ip) {
  return (
    inCidr(ip, "0.0.0.0", 8) || // "this" network
    inCidr(ip, "10.0.0.0", 8) || // private
    inCidr(ip, "100.64.0.0", 10) || // CGNAT
    inCidr(ip, "127.0.0.0", 8) || // loopback
    inCidr(ip, "169.254.0.0", 16) || // link-local (incl. cloud metadata)
    inCidr(ip, "172.16.0.0", 12) || // private
    inCidr(ip, "192.0.0.0", 24) || // IETF protocol assignments
    inCidr(ip, "192.168.0.0", 16) || // private
    inCidr(ip, "198.18.0.0", 15) || // benchmarking
    inCidr(ip, "224.0.0.0", 4) || // multicast
    inCidr(ip, "240.0.0.0", 4) // reserved
  );
}

function isBlockedIPv6(ip) {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // loopback / unspecified
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); // IPv4-mapped
  if (mapped) return isBlockedIPv4(mapped[1]);
  return false;
}

function isBlockedIp(ip) {
  if (net.isIPv4(ip)) return isBlockedIPv4(ip);
  if (net.isIPv6(ip)) return isBlockedIPv6(ip);
  return true; // unknown format -> block
}

/**
 * Validate a user-supplied URL for safe server-side fetching.
 * @throws Error with message INVALID_URL | BLOCKED_SCHEME | BLOCKED_HOST | DNS_FAILED
 * @returns {Promise<URL>} the parsed, safe URL
 */
async function assertSafeUrl(rawUrl) {
  const s = String(rawUrl).trim();
  // Only default to https:// when the input has NO scheme at all. Prepending to
  // a string that already has a scheme (file:, ftp:, …) would mask it and let it
  // slip past the scheme check below.
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s);
  let parsed;
  try {
    parsed = new URL(hasScheme ? s : `https://${s}`);
  } catch {
    throw new Error("INVALID_URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("BLOCKED_SCHEME");
  }

  // URL.hostname keeps the [ ] around IPv6 literals; strip them for net.isIP.
  const host = parsed.hostname.replace(/^\[|\]$/g, "");

  // Literal IP in the host
  if (net.isIP(host)) {
    if (isBlockedIp(host)) throw new Error("BLOCKED_HOST");
    return parsed;
  }

  let addrs;
  try {
    addrs = await dns.lookup(host, { all: true });
  } catch {
    throw new Error("DNS_FAILED");
  }
  if (!addrs || addrs.length === 0) throw new Error("DNS_FAILED");
  for (const { address } of addrs) {
    if (isBlockedIp(address)) throw new Error("BLOCKED_HOST");
  }

  return parsed;
}

module.exports = { isBlockedIp, assertSafeUrl };
