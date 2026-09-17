/**
 * Apple JWS Transaction Verification for StoreKit 2.
 *
 * Verifies signed transactions and notification payloads from Apple by:
 * 1. Decoding the JWS header to extract the x5c certificate chain
 * 2. Verifying the chain terminates at Apple's known Root CA (G3)
 * 3. Verifying the JWS signature using the leaf certificate
 * 4. Validating the payload (bundleId, environment)
 *
 * References:
 * - https://developer.apple.com/documentation/appstoreserverapi/jwstransaction
 * - https://developer.apple.com/documentation/appstoreservernotifications
 */

const { importX509, jwtVerify, base64url } = require("jose");
const crypto = require("crypto");

// Apple Root CA - G3 (DER-encoded, base64)
// Source: the macOS system trust store (SystemRootCertificates.keychain), the same
// certificate Apple serves at https://www.apple.com/certificateauthority/.
//
// Until 2026-09-17 this constant was corrupt — 61 characters in the public key and
// the subject key identifier did not match the real certificate — so no genuine
// Apple chain could ever match it. Every App Store notification and every iOS
// purchase sync was rejected, and the only test checked that garbage is rejected.
// The test file now pins this DER to APPLE_ROOT_CA_G3_SHA256 below, which comes
// from a second, independent source.
const APPLE_ROOT_CA_G3_BASE64 =
  "MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS" +
  "QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u" +
  "IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN" +
  "MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS" +
  "b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y" +
  "aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49" +
  "AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf" +
  "TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517" +
  "IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr" +
  "MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA" +
  "MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4" +
  "at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM" +
  "6BgD56KyKA==";

// SHA-256 fingerprint of Apple Root CA - G3 as Apple publishes it.
const APPLE_ROOT_CA_G3_SHA256 =
  "63:34:3A:BF:B8:9A:6A:03:EB:B5:7E:9B:3F:5F:A7:BE:7C:4F:5C:75:6F:30:17:B3:A8:C4:88:C3:65:3E:91:79";

// Marker extensions Apple puts in the certificates it signs App Store data with.
// A chain that merely ends at Apple's root is not enough: that root also issues,
// through other intermediates, certificates that ordinary developers hold together
// with their private keys (Apple Pay merchant identities, for one). Without these
// checks any of those could sign a "purchase". Apple's own App Store Server Library
// performs the same two checks.
const OID_APP_STORE_SIGNING_LEAF = "1.2.840.113635.100.6.11.1";
const OID_WWDR_INTERMEDIATE = "1.2.840.113635.100.6.2.1";

const EXPECTED_BUNDLE_ID = process.env.APPLE_BUNDLE_ID || "me.colorarchive.app";

/** DER encoding (tag + length + body) of a dotted OID, for matching inside cert.raw. */
function oidDer(dotted) {
  const parts = dotted.split(".").map(Number);
  const bytes = [40 * parts[0] + parts[1]];
  for (const n of parts.slice(2)) {
    const chunk = [n & 0x7f];
    for (let v = Math.floor(n / 128); v > 0; v = Math.floor(v / 128)) chunk.unshift((v & 0x7f) | 0x80);
    bytes.push(...chunk);
  }
  return Buffer.from([0x06, bytes.length, ...bytes]);
}

function chainError(message) {
  // Both routes classify failures by message text ("Apple", "Certificate",
  // "certificate"), so every chain rejection names both.
  return new Error(`Apple JWS certificate chain: ${message}`);
}

/**
 * Parse a PEM or base64 DER certificate to a crypto.X509Certificate.
 */
function parseCert(base64Der) {
  if (typeof base64Der !== "string" || !/^[A-Za-z0-9+/=]+$/.test(base64Der)) {
    throw chainError("x5c entries must be base64 DER strings");
  }
  const pem =
    "-----BEGIN CERTIFICATE-----\n" +
    base64Der.match(/.{1,64}/g).join("\n") +
    "\n-----END CERTIFICATE-----";
  return new crypto.X509Certificate(pem);
}

function assertValidAt(cert, when, label) {
  // An Invalid Date compares false both ways, which would pass every certificate.
  if (!Number.isFinite(when.getTime())) {
    throw chainError("no valid date to check the certificates against");
  }
  if (when < new Date(cert.validFrom) || when > new Date(cert.validTo)) {
    throw chainError(`${label} certificate is not valid at ${when.toISOString()}`);
  }
}

/**
 * Verify the x5c certificate chain from Apple JWS: exactly leaf → intermediate → root,
 * where the root is byte-identical to `trustedRootBase64`, every link is proven by a
 * SIGNATURE (not just matching names), the leaf and intermediate carry Apple's
 * App Store marker extensions, and all three were valid at `effectiveDate`.
 *
 * `checkIssued()` alone compares names and key identifiers — it never checks a
 * signature — so a chain of [self-made leaf, copy of Apple's public intermediate,
 * copy of Apple's public root] passes it. Only verify() closes that.
 *
 * @returns {string} the leaf certificate as PEM, for signature verification
 */
function verifyCertificateChain(x5cArray, { trustedRootBase64 = APPLE_ROOT_CA_G3_BASE64, effectiveDate = new Date() } = {}) {
  if (!Array.isArray(x5cArray) || x5cArray.length !== 3) {
    throw chainError("x5c must contain exactly 3 certificates (leaf, intermediate, root)");
  }

  const [leaf, intermediate, root] = x5cArray.map(parseCert);
  const trustedRoot = parseCert(trustedRootBase64);

  if (!root.raw.equals(trustedRoot.raw)) {
    throw chainError("does not terminate at Apple Root CA G3");
  }
  if (!intermediate.checkIssued(root) || !intermediate.verify(root.publicKey)) {
    throw chainError("intermediate certificate is not signed by Apple Root CA G3");
  }
  if (!leaf.checkIssued(intermediate) || !leaf.verify(intermediate.publicKey)) {
    throw chainError("leaf certificate is not signed by the intermediate");
  }
  if (!intermediate.ca) {
    throw chainError("intermediate certificate is not a CA");
  }
  if (!intermediate.raw.includes(oidDer(OID_WWDR_INTERMEDIATE))) {
    throw chainError("intermediate certificate lacks Apple's WWDR marker extension");
  }
  if (!leaf.raw.includes(oidDer(OID_APP_STORE_SIGNING_LEAF))) {
    throw chainError("leaf certificate lacks Apple's App Store signing marker extension");
  }
  assertValidAt(root, effectiveDate, "root");
  assertValidAt(intermediate, effectiveDate, "intermediate");
  assertValidAt(leaf, effectiveDate, "leaf");

  return (
    "-----BEGIN CERTIFICATE-----\n" +
    x5cArray[0].match(/.{1,64}/g).join("\n") +
    "\n-----END CERTIFICATE-----"
  );
}

/**
 * The date the certificates must have been valid at. Apple's library (offline mode)
 * uses the payload's signedDate: a transaction restored months later is still signed
 * by the certificate that was current when Apple signed it. Reading it before the
 * signature is checked is safe — it only selects the validity instant, and nothing
 * else from the payload is used until jwtVerify has passed.
 */
function effectiveDateOf(signedJws) {
  try {
    const payload = JSON.parse(Buffer.from(base64url.decode(signedJws.split(".")[1])).toString("utf8"));
    // Number.isFinite alone admits 1e300, which becomes an Invalid Date.
    const d = new Date(payload.signedDate);
    if (typeof payload.signedDate === "number" && Number.isFinite(d.getTime())) return d;
  } catch (_) {
    // fall through — a malformed payload fails at jwtVerify anyway
  }
  return new Date();
}

/**
 * Verify and decode an Apple-signed JWS (transaction or notification payload).
 *
 * @param {string} signedJws - The JWS string from Apple (e.g., signedTransaction or signedPayload)
 * @param {object} [options] - Optional overrides
 * @param {boolean} [options.skipBundleCheck] - Skip bundleId verification (for notification payloads)
 * @returns {Promise<object>} The verified and decoded payload
 * @throws {Error} If verification fails
 */
async function verifyAppleJWS(signedJws, options = {}) {
  return verifyJWSAgainstRoot(signedJws, APPLE_ROOT_CA_G3_BASE64, options);
}

/** verifyAppleJWS with the trust anchor as a parameter, so tests can execute the
 *  whole pipeline against a chain they built. Production callers use verifyAppleJWS. */
async function verifyJWSAgainstRoot(signedJws, trustedRootBase64, options = {}) {
  if (!signedJws || typeof signedJws !== "string") {
    throw new Error("Invalid JWS: must be a non-empty string");
  }

  // 1. Decode header to get x5c chain
  const headerPart = signedJws.split(".")[0];
  const headerJson = Buffer.from(
    base64url.decode(headerPart)
  ).toString("utf8");
  const header = JSON.parse(headerJson);

  if (!header.x5c || !Array.isArray(header.x5c)) {
    throw new Error("JWS header missing x5c certificate chain");
  }
  if (header.alg !== "ES256") {
    throw new Error(`Apple JWS must be ES256, got ${header.alg}`);
  }

  // 2. Verify the certificate chain
  const leafPem = verifyCertificateChain(header.x5c, {
    trustedRootBase64,
    effectiveDate: effectiveDateOf(signedJws),
  });

  // 3. Import the leaf certificate public key and verify signature
  const publicKey = await importX509(leafPem, "ES256");
  const { payload } = await jwtVerify(signedJws, publicKey, {
    algorithms: ["ES256"],
  });

  // 4. Validate bundleId. Absent counts as a mismatch: Apple also signs data that is
  // not a transaction and carries no bundleId (JWSRenewalInfo has productId and
  // originalTransactionId but no bundleId), and skipping the check whenever the field
  // was missing let that pass as a purchase.
  if (!options.skipBundleCheck) {
    if (payload.bundleId !== EXPECTED_BUNDLE_ID) {
      throw new Error(
        `Bundle ID mismatch: expected ${EXPECTED_BUNDLE_ID}, got ${payload.bundleId}`
      );
    }
  }

  return payload;
}

/**
 * Verify a signed transaction from StoreKit 2 (sent by the iOS app).
 *
 * @param {string} signedTransaction - The JWS from Transaction.jwsRepresentation
 * @returns {Promise<object>} Verified transaction data with fields:
 *   - originalTransactionId
 *   - productId
 *   - purchaseDate
 *   - expiresDate (for subscriptions)
 *   - environment
 *   - type ('Auto-Renewable Subscription', 'Non-Consumable', etc.)
 */
async function verifySignedTransaction(signedTransaction) {
  return transactionFromPayload(await verifyAppleJWS(signedTransaction));
}

/** Map a VERIFIED payload to a transaction, refusing signed data that is not one. */
function transactionFromPayload(payload) {
  if (!payload.transactionId || !payload.originalTransactionId || !payload.purchaseDate) {
    throw new Error("Apple JWS is not a transaction (no transactionId / originalTransactionId / purchaseDate)");
  }

  return {
    originalTransactionId: String(
      payload.originalTransactionId || payload.originalTransactionID
    ),
    transactionId: String(payload.transactionId || payload.transactionID),
    productId: payload.productId || payload.productID,
    purchaseDate: payload.purchaseDate
      ? new Date(payload.purchaseDate).toISOString()
      : new Date().toISOString(),
    expiresDate: payload.expiresDate
      ? new Date(payload.expiresDate).toISOString()
      : null,
    environment:
      payload.environment === "Sandbox" ? "Sandbox" : "Production",
    type: payload.type || "Unknown",
    bundleId: payload.bundleId,
    // Set once Apple refunds or revokes it. StoreKit delivers the updated transaction
    // through Transaction.updates, which the app syncs like any other.
    revocationDate: payload.revocationDate ? new Date(payload.revocationDate).toISOString() : null,
  };
}

/**
 * Verify a signed notification payload from App Store Server Notifications V2.
 *
 * @param {string} signedPayload - The JWS from the notification body
 * @returns {Promise<object>} Verified notification data with fields:
 *   - notificationType (e.g., 'DID_RENEW', 'EXPIRED', 'REFUND')
 *   - subtype (optional)
 *   - data.signedTransactionInfo (still needs separate verification)
 *   - data.signedRenewalInfo
 */
async function verifyNotificationPayload(signedPayload) {
  const payload = await verifyAppleJWS(signedPayload, {
    skipBundleCheck: true,
  });

  return {
    notificationType: payload.notificationType,
    subtype: payload.subtype || null,
    notificationUUID: payload.notificationUUID,
    data: payload.data || {},
    version: payload.version,
    signedDate: payload.signedDate
      ? new Date(payload.signedDate).toISOString()
      : null,
  };
}

/**
 * Shape detection for StoreKit-provided `signedTransaction` strings.
 *
 * iOS `Transaction.jsonRepresentation` returns plain JSON (not a JWS) — a common
 * mistake that would fail JWS cryptographic verification. The correct field is
 * `VerificationResult.jwsRepresentation`. This helper distinguishes them so we can:
 *   - verify real JWS cryptographically, or
 *   - accept legacy JSON with an explicit `verified=false` flag and deprecation warning.
 *
 * Returns one of: "jws" | "json" | "unknown".
 */
function detectTransactionShape(s) {
  if (typeof s !== "string" || s.length === 0) return "unknown";
  const trimmed = s.trim();
  if (trimmed.startsWith("{")) return "json";
  const parts = trimmed.split(".");
  if (parts.length === 3 && parts.every((p) => p.length > 0)) return "jws";
  return "unknown";
}

module.exports = {
  verifySignedTransaction,
  verifyNotificationPayload,
  verifyAppleJWS,
  detectTransactionShape,
  // for tests
  oidDer,
  transactionFromPayload,
  verifyJWSAgainstRoot,
  verifyCertificateChain,
  APPLE_ROOT_CA_G3_BASE64,
  APPLE_ROOT_CA_G3_SHA256,
  OID_APP_STORE_SIGNING_LEAF,
  OID_WWDR_INTERMEDIATE,
};
