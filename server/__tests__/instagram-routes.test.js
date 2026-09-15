/**
 * Security properties of server/routes/instagram.js, executed through the full
 * route layer stack (callRouteChain), so route-level auth middleware actually runs.
 *
 * Found 2026-09-16 by a production audit:
 *  - GET /instagram/webhook reflected hub.challenge as text/html while
 *    INSTAGRAM_WEBHOOK_VERIFY_TOKEN was unset (undefined === undefined), a
 *    reflected XSS on the origin that holds the login cookie;
 *  - POST /instagram/test-story, /test-post and /auth/refresh had no auth, so
 *    anyone could publish to the brand Instagram account.
 *
 * Never exercises the OAuth callback's success path: that writes server/.env.instagram,
 * which on a developer machine is a real, gitignored token file.
 */

require("./support/route-harness").install();

const test = require("node:test");
const assert = require("node:assert");
const { callRouteChain } = require("./support/route-harness");
const { accountSwitchBlocked } = require("../ig-account-guard");

// No real network, ever. Written after the red run of this file against the
// unguarded instagram.js: POST /auth/refresh went straight through to Instagram's
// refresh endpoint with the developer machine's real token file, and a successful
// refresh would have rewritten server/.env.instagram. A regression must fail here,
// not reach out.
global.fetch = async (url) => {
  throw new Error(`network disabled in instagram-routes.test.js (attempted ${String(url).split("?")[0]})`);
};

const ADMIN = "test-admin-token-0123456789";
process.env.ADMIN_API_TOKEN = ADMIN;

const INSTAGRAM = require.resolve("../routes/instagram");
const SCHEDULER = require.resolve("../ig-scheduler");

// instagram.js starts a 12h auto-refresh interval and a 30s timer at load. Unref
// them so this test process can exit.
function loadInstagram(verifyToken) {
  if (verifyToken === undefined) delete process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  else process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN = verifyToken;
  const si = global.setInterval, st = global.setTimeout;
  global.setInterval = (...a) => { const t = si(...a); if (t && t.unref) t.unref(); return t; };
  global.setTimeout = (...a) => { const t = st(...a); if (t && t.unref) t.unref(); return t; };
  const warn = console.warn;
  console.warn = () => {};
  try {
    delete require.cache[INSTAGRAM];
    return require(INSTAGRAM);
  } finally {
    global.setInterval = si;
    global.setTimeout = st;
    console.warn = warn;
  }
}

// A scheduler stub that records calls, so a refused trigger provably published nothing.
const calls = { story: 0, post: 0 };
require.cache[SCHEDULER] = {
  id: SCHEDULER, filename: SCHEDULER, loaded: true,
  exports: { runDailyStory: async () => { calls.story++; }, runPeriodicPost: async () => { calls.post++; } },
};

const XSS = "<script>alert(document.domain)</script>";

// ------------------------------------------------------------------ webhook ---

test("webhook verification with NO configured token refuses and never reflects markup", async () => {
  const router = loadInstagram(undefined);
  const out = await callRouteChain(router, "get", "/webhook", {
    query: { "hub.mode": "subscribe", "hub.challenge": XSS },
  });
  assert.equal(out.code, 403, "an unconfigured verify token matched a request that omitted hub.verify_token");
  assert.ok(!String(out.body).includes("<script"), "the challenge was reflected into the response");
});

test("webhook verification with a configured token echoes only a safe challenge, as text/plain", async () => {
  const router = loadInstagram("verify-me-please-123");
  const ok = await callRouteChain(router, "get", "/webhook", {
    query: { "hub.mode": "subscribe", "hub.verify_token": "verify-me-please-123", "hub.challenge": "1158201444" },
  });
  assert.equal(ok.code, 200, "a genuine Meta verification must still succeed");
  assert.equal(ok.body, "1158201444");
  assert.match(String(ok.headers["content-type"]), /text\/plain/);
  assert.equal(ok.headers["x-content-type-options"], "nosniff");

  const markup = await callRouteChain(router, "get", "/webhook", {
    query: { "hub.mode": "subscribe", "hub.verify_token": "verify-me-please-123", "hub.challenge": XSS },
  });
  assert.equal(markup.code, 403, "even with the right token, a challenge carrying markup must not be echoed");

  const wrong = await callRouteChain(router, "get", "/webhook", {
    query: { "hub.mode": "subscribe", "hub.verify_token": "nope", "hub.challenge": "123" },
  });
  assert.equal(wrong.code, 403);
});

// ------------------------------------------------------------ publish/refresh ---

for (const [path, kind] of [["/test-post", "post"], ["/test-story", "story"]]) {
  test(`POST ${path} without the admin bearer publishes nothing`, async () => {
    const router = loadInstagram(undefined);
    const before = calls[kind];
    const out = await callRouteChain(router, "post", path, { headers: {} });
    assert.equal(out.code, 401, `${path} ran for an anonymous caller`);
    assert.equal(calls[kind], before, `${path} reached the publisher without auth — anyone could post to the brand account`);
  });

  test(`POST ${path} with the admin bearer still works (control)`, async () => {
    const router = loadInstagram(undefined);
    const before = calls[kind];
    const out = await callRouteChain(router, "post", path, { headers: { authorization: `Bearer ${ADMIN}` } });
    assert.equal(out.code, 200);
    assert.equal(calls[kind], before + 1, "an authorised trigger must still reach the publisher");
  });
}

test("POST /auth/refresh without the admin bearer is refused", async () => {
  const router = loadInstagram(undefined);
  const out = await callRouteChain(router, "post", "/auth/refresh", { headers: {} });
  assert.equal(out.code, 401);
});

// ----------------------------------------------------------- account switch ---

test("a different Instagram account cannot replace the connected one", () => {
  assert.equal(accountSwitchBlocked("17841400000000001", "17841499999999999", {}), true);
});

test("re-authorising the same account, or connecting the first time, is allowed", () => {
  assert.equal(accountSwitchBlocked("17841400000000001", "17841400000000001", {}), false);
  // A number vs its string form must compare equal. (Use a safe integer here: a literal like
  // 17841400000000001 exceeds Number.MAX_SAFE_INTEGER and is already rounded before the call.)
  assert.equal(accountSwitchBlocked(1784140000, "1784140000", {}), false, "number vs string ids");
  assert.equal(accountSwitchBlocked(null, "17841499999999999", {}), false);
});

test("an explicit override allows a deliberate switch", () => {
  assert.equal(accountSwitchBlocked("1", "2", { INSTAGRAM_ALLOW_ACCOUNT_SWITCH: "1" }), false);
});

test("the OAuth callback consults the guard before it overwrites the token store", () => {
  const src = require("node:fs").readFileSync(INSTAGRAM, "utf8");
  const cb = src.slice(src.indexOf('router.get("/auth/callback"'), src.indexOf("/* ── Token Refresh"));
  const guard = cb.indexOf("accountSwitchBlocked(");
  const overwrite = cb.indexOf("tokenStore = {");
  assert.ok(guard !== -1, "the callback no longer calls accountSwitchBlocked");
  assert.ok(overwrite !== -1, "token store assignment moved — re-anchor this test");
  assert.ok(guard < overwrite, "the guard must run BEFORE tokenStore is replaced");
});
