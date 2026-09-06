/**
 * Source invariants for the lifetime guard.
 *
 * server/__tests__/lifetime.test.js proves the DECISION is right. This file
 * proves it is actually CONSULTED — the two are different failures, and the
 * second is the one that shipped: `resolveCancellation` was correct all along;
 * the defect was that /webhooks/subscription-updated never asked it anything.
 *
 * These handlers cannot be require()d in a unit test — they pull in the real
 * better-sqlite3 connection at module load — so this asserts against the source
 * text. That is weaker than executing them, and it is deliberately narrow: it
 * checks only that no revocation site writes tier='free' without the guard being
 * present in the same handler. Real behaviour is verified against production
 * after deploy, not here.
 */

const test = require("node:test");
const assert = require("node:assert");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const ROOT = join(__dirname, "..");
const webhook = readFileSync(join(ROOT, "routes/webhook.js"), "utf8");
const apple = readFileSync(join(ROOT, "routes/apple-notifications.js"), "utf8");

/** Body of `router.post("<path>", ...)` up to the next router.post or EOF. */
function handlerBody(src, routePath) {
  const start = src.indexOf(`router.post("${routePath}"`);
  assert.notEqual(start, -1, `handler ${routePath} not found — did it get renamed?`);
  const next = src.indexOf("router.post(", start + 10);
  return src.slice(start, next === -1 ? src.length : next);
}

for (const route of ["/subscription-cancelled", "/subscription-updated", "/subscription-revoke"]) {
  test(`${route} consults the lifetime guard`, () => {
    const body = handlerBody(webhook, route);
    assert.ok(
      body.includes("hasLifetimeEntitlement"),
      `${route} revokes access but never asks whether the user holds a lifetime purchase. ` +
        `Lemon Squeezy fires subscription_updated alongside every cancellation, so guarding ` +
        `only one of these leaves the wipe fully reachable through the others.`,
    );
  });
}

test("apple-notifications routes every downgrade through the guarded helper", () => {
  // Exactly one raw write, inside `downgrade()` itself. EXPIRED,
  // DID_FAIL_TO_RENEW, REFUND and REVOKE must all go through it.
  const raw = apple.match(/UPDATE users SET tier = 'free'/g) || [];
  assert.equal(
    raw.length,
    1,
    `expected exactly one raw tier='free' write (the one inside downgrade()), found ${raw.length} — ` +
      `a new branch is revoking Apple-side without checking for a Lemon Squeezy lifetime.`,
  );
  assert.ok(apple.includes("hasLifetimeEntitlement"), "apple-notifications does not import the guard");
});

test("the lifetime guard is hoisted above the switch, not declared between cases", () => {
  // `switch` shares one block scope, so a const declared between cases is in the
  // temporal dead zone when execution jumps straight to a later case — a
  // ReferenceError on every expiry instead of a downgrade. The first draft of
  // this fix did exactly that.
  const declIdx = apple.indexOf("const keepsLifetime =");
  const switchIdx = apple.indexOf("switch (notificationType)");
  assert.notEqual(declIdx, -1);
  assert.notEqual(switchIdx, -1);
  assert.ok(
    declIdx < switchIdx,
    "keepsLifetime is declared inside the switch block; jumping to a case would skip it (TDZ)",
  );
});

test("a refunded lifetime order is reachable by the refund flagger", () => {
  // A lifetime order is stored with order_id = `lifetime_<LS order id>`, which
  // matches none of the invoice-shaped keys. Without this the refund never sets
  // refunded = 1, and the guard — which counts only non-refunded orders — would
  // protect a refunded lifetime forever.
  assert.ok(
    /order_id IN \(\?, \?, \?, \?\)/.test(webhook),
    "the refund flagger no longer matches four order-id shapes",
  );
  assert.ok(
    webhook.includes("`lifetime_${lsId}`"),
    "the refund flagger does not match lifetime order ids, so a refunded lifetime would keep Pro forever",
  );
});
