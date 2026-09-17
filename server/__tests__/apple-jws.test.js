/**
 * Tests for server/apple-jws.js — the StoreKit 2 receipt shape detector +
 * verifier. Pure Node, uses the built-in node:test runner.
 *
 * Run with:
 *   node --test server/__tests__/apple-jws.test.js
 *
 * Context for these tests (2026-04-24):
 * The iOS app's StoreManager.swift previously sent `Transaction.jsonRepresentation`
 * (plain JSON) as the `signedTransaction` field while the backend verifier
 * expected a JWS. These tests lock down the contract so the regression cannot
 * return silently: the shape detector must distinguish JWS / JSON / unknown
 * deterministically, and verifyAppleJWS must reject payloads whose certificate
 * chain does not terminate at Apple's Root CA G3 (covers both local StoreKit
 * test certificates and tampered real certificates).
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { createSign, createPrivateKey, generateKeyPairSync } = require("node:crypto");

const { detectTransactionShape, verifyAppleJWS } = require("../apple-jws");

// ---- detectTransactionShape -----------------------------------------------

describe("detectTransactionShape", () => {
  test("empty / null / non-string → unknown", () => {
    assert.equal(detectTransactionShape(""), "unknown");
    assert.equal(detectTransactionShape(null), "unknown");
    assert.equal(detectTransactionShape(undefined), "unknown");
    assert.equal(detectTransactionShape(123), "unknown");
    assert.equal(detectTransactionShape({}), "unknown");
  });

  test("leading `{` → json (Transaction.jsonRepresentation mistake)", () => {
    // Minimal StoreKit 2 Transaction.jsonRepresentation shape.
    const jsonString = JSON.stringify({
      transactionId: "2000000000000001",
      originalTransactionId: "2000000000000001",
      productId: "me.colorarchive.pro.monthly",
      bundleId: "me.colorarchive.app",
      purchaseDate: 1714089600000,
      environment: "Xcode",
    });
    assert.equal(detectTransactionShape(jsonString), "json");
    // Also with leading whitespace (conservative parser).
    assert.equal(detectTransactionShape("  \n  " + jsonString), "json");
  });

  test("three non-empty dot-separated segments → jws", () => {
    // A JWS is <header>.<payload>.<signature>, each base64url.
    const fakeJws = [
      "eyJhbGciOiJFUzI1NiIsIng1YyI6WyJjZXJ0MSIsImNlcnQyIiwiY2VydDMiXX0",
      "eyJwcm9kdWN0SWQiOiJtZS5jb2xvcmFyY2hpdmUucHJvLm1vbnRobHkifQ",
      "ABCDEFGHIJ0123456789",
    ].join(".");
    assert.equal(detectTransactionShape(fakeJws), "jws");
  });

  test("two-segment string (e.g. host.tld) → unknown", () => {
    assert.equal(detectTransactionShape("host.tld"), "unknown");
  });

  test("three-segment string with an empty middle → unknown", () => {
    assert.equal(detectTransactionShape("abc..def"), "unknown");
  });

  test("four+ dot-separated segments → unknown", () => {
    assert.equal(detectTransactionShape("a.b.c.d"), "unknown");
  });

  test("classification is stable under whitespace-only body", () => {
    assert.equal(detectTransactionShape("   "), "unknown");
  });
});

// ---- verifyAppleJWS certificate-chain enforcement ------------------------

describe("verifyAppleJWS", () => {
  test("rejects non-string input", async () => {
    await assert.rejects(
      () => verifyAppleJWS(null),
      /non-empty string/,
    );
    await assert.rejects(
      () => verifyAppleJWS(""),
      /non-empty string/,
    );
  });

  test("rejects JWS whose header has no x5c chain", async () => {
    // Build a valid-looking JWS with ES256 header but no x5c array.
    // Sign with a throwaway key — we should fail at x5c check, not signature.
    const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
    const header = { alg: "ES256" }; // deliberately missing x5c
    const payload = {
      bundleId: "me.colorarchive.app",
      productId: "me.colorarchive.pro.monthly",
    };
    const b64 = (obj) =>
      Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    const signingInput = `${b64(header)}.${b64(payload)}`;
    const sig = createSign("SHA256").update(signingInput).sign({
      key: privateKey,
      dsaEncoding: "ieee-p1363",
    });
    const jws = `${signingInput}.${sig
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")}`;

    await assert.rejects(
      () => verifyAppleJWS(jws),
      /missing x5c/,
    );
  });

  test("rejects JWS whose x5c chain does not terminate at Apple Root CA G3", async () => {
    // Build a JWS whose x5c contains bogus certs (self-signed local).
    // This simulates both:
    //   - StoreKit local testing (Xcode environment) — real JWS, test cert chain
    //   - A malicious client sending its own signed payload
    // In both cases the server must refuse.
    //
    // We don't need to craft a real x509 chain; verifyCertificateChain inspects
    // the x5c values as base64 DER and will fail either at parseCert (garbage)
    // or at the root-fingerprint check. Either way the outer error message
    // should include "chain" or "Apple" or similar — matched below by the
    // route handler's error classifier in server/routes/auth.js.
    const header = {
      alg: "ES256",
      x5c: ["AAAA", "BBBB", "CCCC"], // deliberately garbage
    };
    const payload = {
      bundleId: "me.colorarchive.app",
      productId: "me.colorarchive.pro.monthly",
    };
    const b64 = (obj) =>
      Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    const jws = `${b64(header)}.${b64(payload)}.ignored-signature`;

    await assert.rejects(
      () => verifyAppleJWS(jws),
      (err) => {
        // The verifier throws when parseCert fails on the first bogus cert,
        // OR when the chain doesn't terminate at Apple Root CA. Either
        // shape must be recognizable as an Apple / cert / JWS failure so the
        // route's error classifier can return INVALID_RECEIPT_SIGNATURE (403).
        const msg = String(err.message || err);
        return (
          /Apple|chain|x5c|Certificate|PEM|DER|BER|Unsupported|bad|invalid|asn1|tag|encoding|X509/i.test(
            msg,
          )
        );
      },
    );
  });

  test("rejects Transaction.jsonRepresentation (not a JWS at all)", async () => {
    // The specific bug this guards against: iOS pre-fix sent
    // `Transaction.jsonRepresentation` (JSON) in the signedTransaction field.
    // Before the shape detector existed, the verifier would try to
    // base64url-decode the JSON and either parse garbage or throw something
    // unrelated to Apple. Now we catch it pre-verify. verifyAppleJWS itself
    // still fails cleanly on this input — test covers the post-detector
    // pathway where something slipped through.
    const notJws = JSON.stringify({
      transactionId: "2000000000000001",
      productId: "me.colorarchive.pro.monthly",
    });
    await assert.rejects(() => verifyAppleJWS(notJws));
  });
});

// ---- certificate chain: the verifier must ACCEPT a real chain, not only refuse garbage ----
//
// 2026-09-17: the embedded Apple Root CA G3 had been corrupt since it was written,
// so no genuine Apple JWS could verify. Every App Store notification (3 retries of a
// real purchase on 09-16) and every iOS purchase sync was rejected, while the test
// above — which only feeds garbage — stayed green. These tests build real X.509
// chains so the accept path is executed, and prove each refusal is caused by the one
// defect it names.

const {
  oidDer,
  transactionFromPayload,
  verifyJWSAgainstRoot,
  APPLE_ROOT_CA_G3_BASE64,
  APPLE_ROOT_CA_G3_SHA256,
  OID_APP_STORE_SIGNING_LEAF,
  OID_WWDR_INTERMEDIATE,
} = require("../apple-jws");
const { X509Certificate } = require("node:crypto");
const { makeCert, keyPair, name, subjectNameDer, signJws } = require("./support/x509-forge");

const DAY = 86400000;
const LONG_AGO = new Date(Date.now() - 1000 * DAY);
const FAR_AHEAD = new Date(Date.now() + 1000 * DAY);

/** A complete, correctly formed chain under a test root. Override pieces to break one thing. */
function buildChain(overrides = {}) {
  const rootKeys = keyPair();
  const interKeys = keyPair();
  const leafKeys = keyPair();
  const rootDer = makeCert({
    subject: "Test Root",
    issuerName: name("Test Root"),
    publicKey: rootKeys.publicKey,
    signingKey: rootKeys.privateKey,
    ca: true,
    notBefore: LONG_AGO,
    notAfter: FAR_AHEAD,
  });
  const interDer = makeCert({
    subject: "Test WWDR",
    issuerName: name("Test Root"),
    publicKey: interKeys.publicKey,
    signingKey: overrides.interSigningKey || rootKeys.privateKey,
    ca: overrides.interCa ?? true,
    markerOids: overrides.interOids || [OID_WWDR_INTERMEDIATE],
    notBefore: LONG_AGO,
    notAfter: FAR_AHEAD,
  });
  const leafDer = makeCert({
    subject: "Test App Store Signing",
    issuerName: name("Test WWDR"),
    publicKey: leafKeys.publicKey,
    signingKey: overrides.leafSigningKey || interKeys.privateKey,
    markerOids: overrides.leafOids || [OID_APP_STORE_SIGNING_LEAF],
    notBefore: overrides.leafNotBefore,
    notAfter: overrides.leafNotAfter,
  });
  const payload = {
    bundleId: "me.colorarchive.app",
    productId: "me.colorarchive.pro.monthly",
    originalTransactionId: "2000000999999999",
    signedDate: overrides.signedDate ?? Date.now(),
    ...overrides.payload,
  };
  const x5c = overrides.x5c ? overrides.x5c({ leafDer, interDer, rootDer }) : [leafDer, interDer, rootDer];
  return {
    jws: signJws(payload, x5c, leafKeys.privateKey),
    rootB64: Buffer.from(rootDer).toString("base64"),
  };
}

/** Both routes classify a rejection by message text; a chain error must satisfy both. */
function isClassifiableChainError(pattern) {
  return (err) => {
    const msg = String(err.message);
    assert.match(msg, pattern);
    assert.ok(msg.includes("Apple"), `auth.js / apple-notifications.js match on "Apple": ${msg}`);
    assert.ok(msg.includes("certificate"), `apple-notifications.js matches on "certificate": ${msg}`);
    return true;
  };
}

describe("Apple Root CA G3 trust anchor", () => {
  test("the embedded root is the genuine certificate (DER pinned to Apple's published fingerprint)", () => {
    const root = new X509Certificate(Buffer.from(APPLE_ROOT_CA_G3_BASE64, "base64"));
    // Written out a third time on purpose: a corrupt constant cannot match an
    // independently published digest.
    assert.equal(
      APPLE_ROOT_CA_G3_SHA256,
      "63:34:3A:BF:B8:9A:6A:03:EB:B5:7E:9B:3F:5F:A7:BE:7C:4F:5C:75:6F:30:17:B3:A8:C4:88:C3:65:3E:91:79",
    );
    assert.equal(root.fingerprint256, APPLE_ROOT_CA_G3_SHA256);
    assert.match(root.subject, /CN=Apple Root CA - G3/);
    assert.ok(root.verify(root.publicKey), "root must be self-signed with a valid signature");
    assert.ok(root.ca);
  });
});

describe("real Apple certificates pass the new checks", () => {
  // Every other accept-path test uses certificates this file built, whose marker
  // extensions are encoded by the same kind of code that checks them — a shared
  // encoding mistake would pass here and reject every real purchase. This is Apple's
  // own App Store intermediate (Apple Worldwide Developer Relations CA - G6, public;
  // taken from the macOS keychain), so it can only pass if the checks match reality.
  const WWDR_G6_BASE64 =
  "MIIDFjCCApygAwIBAgIUIsGhRwp0c2nvU4YSycafPTjzbNcwCgYIKoZIzj0EAwMw" +
  "ZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBD" +
  "ZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkG" +
  "A1UEBhMCVVMwHhcNMjEwMzE3MjAzNzEwWhcNMzYwMzE5MDAwMDAwWjB1MUQwQgYD" +
  "VQQDDDtBcHBsZSBXb3JsZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9ucyBDZXJ0aWZp" +
  "Y2F0aW9uIEF1dGhvcml0eTELMAkGA1UECwwCRzYxEzARBgNVBAoMCkFwcGxlIElu" +
  "Yy4xCzAJBgNVBAYTAlVTMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEbsQKC94PrlWm" +
  "ZXnXgtxzdVJL8T0SGYngDRGpngn3N6PT8JMEb7FDi4bBmPhCnZ3/sq6PF/cGcKXW" +
  "sL5vOteRhyJ45x3ASP7cOB+aao90fcpxSv/EZFbniAbNgZGhIhpIo4H6MIH3MBIG" +
  "A1UdEwEB/wQIMAYBAf8CAQAwHwYDVR0jBBgwFoAUu7DeoVgziJqkipnevr3rr9rL" +
  "JKswRgYIKwYBBQUHAQEEOjA4MDYGCCsGAQUFBzABhipodHRwOi8vb2NzcC5hcHBs" +
  "ZS5jb20vb2NzcDAzLWFwcGxlcm9vdGNhZzMwNwYDVR0fBDAwLjAsoCqgKIYmaHR0" +
  "cDovL2NybC5hcHBsZS5jb20vYXBwbGVyb290Y2FnMy5jcmwwHQYDVR0OBBYEFD8v" +
  "lCNR01DJmig97bB85c+lkGKZMA4GA1UdDwEB/wQEAwIBBjAQBgoqhkiG92NkBgIB" +
  "BAIFADAKBggqhkjOPQQDAwNoADBlAjBAXhSq5IyKogMCPtw490BaB677CaEGJXuf" +
  "QB/EqZGd6CSjiCtOnuMTbXVXmxxcxfkCMQDTSPxarZXvNrkxU3TkUMI33yzvFVVR" +
  "T4wxWJC994OsdcZ4+RGNsYDyR5gmdr0nDGg=";

  test("WWDR G6 is signed by the embedded root and carries the marker the chain check requires", () => {
    const root = new X509Certificate(Buffer.from(APPLE_ROOT_CA_G3_BASE64, "base64"));
    const g6 = new X509Certificate(Buffer.from(WWDR_G6_BASE64, "base64"));
    assert.ok(g6.checkIssued(root) && g6.verify(root.publicKey), "the real intermediate must verify against the embedded root");
    assert.ok(g6.ca);
    assert.ok(g6.raw.includes(oidDer(OID_WWDR_INTERMEDIATE)), "marker OID encoding does not match Apple's certificate");
  });

  test("marker OID encodings match an independent encoder (openssl asn1parse -genstr OID:…)", () => {
    assert.equal(oidDer(OID_WWDR_INTERMEDIATE).toString("hex"), "060a2a864886f76364060201");
    assert.equal(oidDer(OID_APP_STORE_SIGNING_LEAF).toString("hex"), "060a2a864886f76364060b01");
  });
});

describe("verifyJWSAgainstRoot — accept path", () => {
  test("a correctly formed chain and signature verifies and returns the payload", async () => {
    const { jws, rootB64 } = buildChain();
    const payload = await verifyJWSAgainstRoot(jws, rootB64);
    assert.equal(payload.originalTransactionId, "2000000999999999");
    assert.equal(payload.productId, "me.colorarchive.pro.monthly");
  });

  test("certificates are judged at the payload's signedDate, so an old restored transaction still verifies", async () => {
    const signedDate = Date.now() - 400 * DAY;
    const { jws, rootB64 } = buildChain({
      signedDate,
      leafNotBefore: new Date(signedDate - 30 * DAY),
      leafNotAfter: new Date(signedDate + 30 * DAY), // expired long before today
    });
    const payload = await verifyJWSAgainstRoot(jws, rootB64);
    assert.equal(payload.signedDate, signedDate);
  });
});

describe("verifyJWSAgainstRoot — each defect is refused on its own", () => {
  test("chain ending at a different root", async () => {
    const { jws } = buildChain();
    const other = buildChain();
    await assert.rejects(() => verifyJWSAgainstRoot(jws, other.rootB64), isClassifiableChainError(/does not terminate at Apple Root CA G3/));
  });

  test("intermediate whose names match the root but whose signature does not", async () => {
    const { jws, rootB64 } = buildChain({ interSigningKey: keyPair().privateKey });
    await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), isClassifiableChainError(/intermediate certificate is not signed/));
  });

  test("leaf whose names match the intermediate but whose signature does not", async () => {
    const { jws, rootB64 } = buildChain({ leafSigningKey: keyPair().privateKey });
    await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), isClassifiableChainError(/leaf certificate is not signed/));
  });

  test("leaf without the App Store signing marker (another certificate under the same root)", async () => {
    const { jws, rootB64 } = buildChain({ leafOids: [] });
    await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), isClassifiableChainError(/App Store signing marker/));
  });

  test("intermediate without the WWDR marker", async () => {
    const { jws, rootB64 } = buildChain({ interOids: [] });
    await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), isClassifiableChainError(/WWDR marker/));
  });

  test("intermediate that is not a CA", async () => {
    const { jws, rootB64 } = buildChain({ interCa: false });
    await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), isClassifiableChainError(/not a CA/));
  });

  test("leaf not valid at the signed date", async () => {
    const { jws, rootB64 } = buildChain({ leafNotBefore: new Date(Date.now() + DAY), leafNotAfter: new Date(Date.now() + 2 * DAY) });
    await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), isClassifiableChainError(/leaf certificate is not valid/));
  });

  test("chains of the wrong length", async () => {
    for (const shape of [({ leafDer, rootDer }) => [leafDer, rootDer], ({ leafDer, interDer, rootDer }) => [leafDer, interDer, interDer, rootDer]]) {
      const { jws, rootB64 } = buildChain({ x5c: shape });
      await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), isClassifiableChainError(/exactly 3 certificates/));
    }
  });

  test("payload altered after signing", async () => {
    const { jws, rootB64 } = buildChain();
    const [h, , s] = jws.split(".");
    const forged = Buffer.from(JSON.stringify({ bundleId: "me.colorarchive.app", productId: "me.colorarchive.pro.lifetime", signedDate: Date.now() })).toString("base64url");
    await assert.rejects(() => verifyJWSAgainstRoot(`${h}.${forged}.${s}`, rootB64));
  });

  test("bundle id of another app", async () => {
    const { jws, rootB64 } = buildChain({ payload: { bundleId: "com.example.other" } });
    await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), /Bundle ID mismatch/);
  });
});

describe("signed by Apple is not the same as a purchase", () => {
  // Review of 2026-09-17: the bundle check ran only when bundleId was present, and
  // Apple also signs JWSRenewalInfo — productId and originalTransactionId, but no
  // bundleId, no transactionId, no expiresDate. It verified and was granted as a
  // purchase with a server-invented month of Pro.
  test("a payload without bundleId is refused unless the caller opts out (notification envelopes)", async () => {
    const { jws, rootB64 } = buildChain({ payload: { bundleId: undefined } });
    await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), /Bundle ID mismatch/);
    const payload = await verifyJWSAgainstRoot(jws, rootB64, { skipBundleCheck: true });
    assert.equal(payload.bundleId, undefined);
  });

  test("renewal-info shaped data is not a transaction", () => {
    assert.throws(
      () => transactionFromPayload({ originalTransactionId: "1", productId: "me.colorarchive.pro.monthly", autoRenewStatus: 1, signedDate: Date.now() }),
      /not a transaction/,
    );
  });

  test("a real transaction maps through, revocationDate included", () => {
    const t = transactionFromPayload({
      transactionId: "2", originalTransactionId: "1", productId: "me.colorarchive.pro.monthly", bundleId: "me.colorarchive.app",
      purchaseDate: 1757000000000, expiresDate: 1759600000000, revocationDate: 1758000000000, environment: "Production", type: "Auto-Renewable Subscription",
    });
    assert.equal(t.originalTransactionId, "1");
    assert.equal(t.revocationDate, new Date(1758000000000).toISOString());
    assert.equal(transactionFromPayload({ transactionId: "2", originalTransactionId: "1", purchaseDate: 1 }).revocationDate, null);
  });

  test("an impossible signedDate cannot switch the certificate date check off", async () => {
    // 1e300 passes Number.isFinite but is an Invalid Date, and an Invalid Date compares
    // false both ways — so an expired leaf used to pass.
    const { jws, rootB64 } = buildChain({
      signedDate: 1e300,
      leafNotBefore: new Date(Date.now() - 60 * DAY),
      leafNotAfter: new Date(Date.now() - 30 * DAY),
    });
    await assert.rejects(() => verifyJWSAgainstRoot(jws, rootB64), isClassifiableChainError(/leaf certificate is not valid/));
  });
});

describe("verifyAppleJWS — forging against the REAL Apple root", () => {
  test("self-made intermediate + leaf presented with a copy of Apple's public root certificate is refused", async () => {
    // The attack the corrupt root used to block by accident: everything in this
    // chain except the root is the attacker's, and the root is public. checkIssued()
    // accepts it — names line up byte-for-byte — so only signature verification stops it.
    const appleRootDer = Buffer.from(APPLE_ROOT_CA_G3_BASE64, "base64");
    const attacker = keyPair();
    const leafKeys = keyPair();
    const interDer = makeCert({
      subject: "Apple Worldwide Developer Relations Certification Authority",
      issuerName: subjectNameDer(appleRootDer),
      publicKey: attacker.publicKey,
      signingKey: attacker.privateKey,
      ca: true,
      markerOids: [OID_WWDR_INTERMEDIATE],
    });
    const leafDer = makeCert({
      subject: "Prod ECC Mac App Store and iTunes Store Receipt Signing",
      issuerName: name("Apple Worldwide Developer Relations Certification Authority"),
      publicKey: leafKeys.publicKey,
      signingKey: attacker.privateKey,
      markerOids: [OID_APP_STORE_SIGNING_LEAF],
    });
    const jws = signJws(
      { bundleId: "me.colorarchive.app", productId: "me.colorarchive.pro.lifetime", originalTransactionId: "1", signedDate: Date.now() },
      [leafDer, interDer, appleRootDer],
      leafKeys.privateKey,
    );

    // Precondition, so this test cannot pass for the wrong reason: the forged
    // intermediate really does satisfy the name check against Apple's root.
    const inter = new X509Certificate(interDer);
    const root = new X509Certificate(appleRootDer);
    assert.ok(inter.checkIssued(root), "forged intermediate must pass checkIssued, or this test proves nothing");

    await assert.rejects(() => verifyAppleJWS(jws), isClassifiableChainError(/intermediate certificate is not signed by Apple Root CA G3/));
  });
});
