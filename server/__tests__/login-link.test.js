/**
 * A magic link requested from the iOS app must say so, and one requested from the
 * web must not — /login decides from that whether it may redeem the single-use token
 * itself or must leave it for the app. See server/login-link.js for the 2026-09-16
 * incident this closes.
 *
 * /auth/request-link is executed for real (real schema, real token row); only the
 * email sender is replaced, to capture the URL that would have been mailed.
 */

require("./support/route-harness").install();

const Module = require("node:module");
const test = require("node:test");
const assert = require("node:assert");

const sent = [];
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === "../email") {
    return {
      sendMagicLinkEmail: async (email, opts) => {
        sent.push({ email, ...opts });
        return { ok: true };
      },
    };
  }
  return origLoad.call(this, request, ...rest);
};

const router = require("../routes/auth");
const { callRouteChain } = require("./support/route-harness");
const { isIosAppRequest } = require("../login-link");

// Verbatim from nginx on 2026-09-16 — the app build that lost the race.
const APP_UA = "ColorArchive/7 CFNetwork/3896.100.1.2.1 Darwin/27.0.0";
const EDGE_IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/151.0.4129.72 Version/27.0 Mobile/15E148 Safari/604.1";

let n = 0;
async function requestLink(headers) {
  const before = sent.length;
  const out = await callRouteChain(router, "post", "/request-link", {
    headers,
    body: { email: `link-test-${++n}@example.com` },
    ip: `203.0.113.${n}`,
    socket: { remoteAddress: `203.0.113.${n}` },
  });
  assert.equal(out.code, 200, `request-link failed: ${JSON.stringify(out.body)}`);
  assert.equal(sent.length, before + 1, "no email was sent");
  return new URL(sent[sent.length - 1].loginUrl);
}

test("a link requested by the iOS app is tagged app=ios", async () => {
  const url = await requestLink({ "user-agent": APP_UA });
  assert.equal(url.searchParams.get("app"), "ios");
  assert.ok(url.searchParams.get("token"), "the token must still be in the link");
});

test("a link requested from the website is not tagged, on any device", async () => {
  for (const ua of [EDGE_IOS_UA, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"]) {
    const url = await requestLink({ origin: "https://colorarchive.org", "user-agent": ua });
    assert.equal(url.searchParams.get("app"), null, `web request tagged as app: ${ua}`);
  }
});

test("the app user agent alone is not enough when a browser Origin is present", () => {
  assert.equal(isIosAppRequest({ origin: "https://colorarchive.org", "user-agent": APP_UA }), false);
  assert.equal(isIosAppRequest({ "user-agent": APP_UA }), true);
  assert.equal(isIosAppRequest({ "user-agent": EDGE_IOS_UA }), false);
  assert.equal(isIosAppRequest({}), false);
  assert.equal(isIosAppRequest({ "user-agent": "ColorArchive/7.1.2 CFNetwork/3896.100.1.2.1 Darwin/27.0.0" }), true, "CFBundleVersion may contain dots");
});
