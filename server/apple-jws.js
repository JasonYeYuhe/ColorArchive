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
// Downloaded from https://www.apple.com/certificateauthority/
// This is the root certificate that terminates all App Store Server certificate chains.
const APPLE_ROOT_CA_G3_BASE64 =
  "MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS" +
  "QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u" +
  "IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN" +
  "MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS" +
  "b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y" +
  "aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49" +
  "AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf" +
  "TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyQ2YGQWpkHn9wuo8W8hdXu7" +
  "SSynY4yunDykM6GNR6NCMEAwHQYDVR0OBBYEFLuw3GKhE9I0JhVMGaxhMno0SQGZ" +
  "MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA" +
  "MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4" +
  "at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM" +
  "6BgD56KyKA==";

const EXPECTED_BUNDLE_ID = process.env.APPLE_BUNDLE_ID || "me.colorarchive";

/**
 * Parse a PEM or base64 DER certificate to a crypto.X509Certificate.
 */
function parseCert(base64Der) {
  const pem =
    "-----BEGIN CERTIFICATE-----\n" +
    base64Der.match(/.{1,64}/g).join("\n") +
    "\n-----END CERTIFICATE-----";
  return new crypto.X509Certificate(pem);
}

/**
 * Verify the x5c certificate chain from Apple JWS:
 * - leaf → intermediate → root
 * - root must match the known Apple Root CA G3
 */
function verifyCertificateChain(x5cArray) {
  if (!x5cArray || x5cArray.length < 3) {
    throw new Error("Apple JWS x5c chain must have at least 3 certificates");
  }

  const certs = x5cArray.map(parseCert);
  const rootCert = parseCert(APPLE_ROOT_CA_G3_BASE64);

  // Verify the chain: each cert must be issued by the next
  for (let i = 0; i < certs.length - 1; i++) {
    if (!certs[i].checkIssued(certs[i + 1])) {
      throw new Error(`Certificate chain validation failed at index ${i}`);
    }
  }

  // The last cert in x5c must match Apple's Root CA G3
  const chainRoot = certs[certs.length - 1];
  if (chainRoot.fingerprint256 !== rootCert.fingerprint256) {
    throw new Error(
      "Certificate chain does not terminate at Apple Root CA G3"
    );
  }

  // Return the leaf certificate PEM for signature verification
  const leafPem =
    "-----BEGIN CERTIFICATE-----\n" +
    x5cArray[0].match(/.{1,64}/g).join("\n") +
    "\n-----END CERTIFICATE-----";
  return leafPem;
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

  // 2. Verify the certificate chain
  const leafPem = verifyCertificateChain(header.x5c);

  // 3. Import the leaf certificate public key and verify signature
  const publicKey = await importX509(leafPem, header.alg || "ES256");
  const { payload } = await jwtVerify(signedJws, publicKey, {
    algorithms: [header.alg || "ES256"],
  });

  // 4. Validate bundleId (for transaction payloads)
  if (!options.skipBundleCheck && payload.bundleId) {
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
  const payload = await verifyAppleJWS(signedTransaction);

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

module.exports = {
  verifySignedTransaction,
  verifyNotificationPayload,
  verifyAppleJWS,
};
