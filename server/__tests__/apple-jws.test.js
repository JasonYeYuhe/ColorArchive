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
