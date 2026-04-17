/**
 * Constant-time string comparison for authentication tokens.
 *
 * Uses sha256 digests so that any length mismatch between inputs
 * does NOT leak through short-circuit branches (node's
 * crypto.timingSafeEqual throws on mismatched lengths, and a
 * string-length precheck would itself be a timing oracle).
 *
 * Used by:
 *   - server/routes/webhook.js — verifying INTERNAL_WEBHOOK_SECRET
 *   - server/require-admin-bearer.js — verifying ADMIN_API_TOKEN
 *
 * Also defensively handles non-string inputs (e.g. Express passes
 * an array when a client sends the same header twice, which would
 * otherwise crash Buffer.from()).
 */

const crypto = require("crypto");

function constantTimeEqual(a, b) {
  // Normalise non-strings to empty — never equal.
  if (typeof a !== "string") a = "";
  if (typeof b !== "string") b = "";
  const ah = crypto.createHash("sha256").update(a).digest();
  const bh = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ah, bh);
}

module.exports = { constantTimeEqual };
