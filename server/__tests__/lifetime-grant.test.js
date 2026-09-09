/**
 * Executing tests for the lifetime GRANT invariant.
 *
 * WHY THIS FILE IS DIFFERENT FROM lifetime-wiring.test.js. That file asserts
 * against source TEXT and says so in its own docblock ("weaker than executing
 * them"). The 2026-09-08 audit demonstrated exactly what that weakness costs:
 * every source-text guard was green while a single subscription renewal
 * destroyed a ¥19,999 lifetime purchase, because the guards only ever looked at
 * the REVOCATION branches and the defect was in a GRANT branch.
 *
 * So this file runs the real handler. better-sqlite3 is shimmed onto node:sqlite
 * in memory, ../email is stubbed, and server/db.js builds the true schema — then
 * routes/webhook.js is require()d unmodified and its handlers are invoked with
 * the exact payloads app/api/webhook/route.ts forwards.
 *
 * THE INVARIANT: pro_expires_at = NULL is the ONLY thing that records "lifetime".
 * A grant path may raise tier, but must never replace that NULL with a date.
 */

// MUST come before ../db: install() swaps better-sqlite3 for node:sqlite in
// memory and stubs ../email, so requiring db.js builds the real schema against a
// throwaway database and nothing can send mail.
require("./support/route-harness").install();

const test = require("node:test");
const assert = require("node:assert");

const db = require("../db");
const { hasLifetimeEntitlement } = require("../lifetime");
const router = require("../routes/webhook");
const { callRoute } = require("./support/route-harness");

/** Local shim kept for readability: every call here is a POST webhook. */
const post = (path, body) => callRoute(router, "post", path, { body });

function reset() {
  // Children before parents (foreign_keys is ON), and assert it worked — a reset
  // that silently fails leaks rows between cases and quietly weakens every
  // assertion downstream.
  for (const t of ["apple_purchases", "projects", "sessions", "magic_link_tokens", "orders", "users"]) {
    try {
      db.prepare(`DELETE FROM ${t}`).run();
    } catch (e) {
      if (!/no such table/i.test(String(e && e.message))) throw e;
    }
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users").get().n, 0, "reset() did not empty users");
}

/** A lifetime buyer who ALSO still has the monthly subscription running. */
function seedLifetimeBuyer(email = "life@example.com") {
  db.prepare(
    `INSERT INTO users (email, tier, subscription_plan, subscription_status, pro_expires_at,
                        payment_provider, provider_customer_id, provider_subscription_id)
     VALUES (?, 'pro', 'lifetime', 'active', NULL, 'lemonsqueezy', 'cus_life', 'sub_life')`,
  ).run(email);
  db.prepare(
    `INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test)
     VALUES ('lifetime_777', ?, 'Pro Lifetime', 19999, 'jpy', 'pro-lifetime', 0, 0)`,
  ).run(email);
  return db.prepare("SELECT id FROM users WHERE email = ?").get(email).id;
}

const renewal = (email) => ({
  email,
  invoiceId: "inv_renew_1",
  subscriptionId: "sub_life",
  customerId: "cus_life",
  amountMinor: 49900,
  currency: "JPY",
  billingReason: "renewal",
  provider: "lemonsqueezy",
  testMode: false,
  // NB: app/api/webhook/route.ts sends NO `plan` for subscription_payment_success.
});

test("a monthly renewal does not turn a lifetime purchase into a 35-day clock", () => {
  reset();
  const id = seedLifetimeBuyer();
  post("/subscription-payment", renewal("life@example.com"));

  const row = db.prepare("SELECT tier, pro_expires_at FROM users WHERE id = ?").get(id);
  assert.equal(row.tier, "pro");
  assert.equal(
    row.pro_expires_at,
    null,
    "the renewal replaced the lifetime NULL with a dated expiry — 35 days after the " +
      "customer cancels the monthly, effectiveTier() will silently expire a ¥19,999 purchase",
  );
});

test("a subscription invoice is never filed as a pro-lifetime order", () => {
  reset();
  seedLifetimeBuyer();
  post("/subscription-payment", renewal("life@example.com"));

  const order = db.prepare("SELECT pack_id, amount FROM orders WHERE order_id = 'lsinv_inv_renew_1'").get();
  assert.ok(order, "the renewal wrote no order row at all");
  assert.equal(
    order.pack_id,
    "pro-monthly",
    `a ¥${order.amount} renewal was filed as '${order.pack_id}' — it inherits users.subscription_plan ` +
      `when the forwarder sends no plan, which misreports revenue AND defeats refund revocation`,
  );
});

test("refunding the real lifetime purchase still revokes, even after a renewal", () => {
  reset();
  const id = seedLifetimeBuyer();
  post("/subscription-payment", renewal("life@example.com"));

  assert.equal(hasLifetimeEntitlement(db, id), true, "guard should hold before the refund");
  db.prepare("UPDATE orders SET refunded = 1 WHERE order_id = 'lifetime_777'").run();
  assert.equal(
    hasLifetimeEntitlement(db, id),
    false,
    "money went back but the guard still grants lifetime — a mislabeled pro-lifetime renewal row " +
      "is being counted as an unrefunded lifetime order",
  );
});

test("a normal subscriber's clock is still extended (the fix must not fail closed)", () => {
  reset();
  db.prepare(
    `INSERT INTO users (email, tier, subscription_plan, pro_expires_at, provider_customer_id)
     VALUES ('plain@example.com', 'free', 'monthly', NULL, 'cus_plain')`,
  ).run();
  const id = db.prepare("SELECT id FROM users WHERE email = 'plain@example.com'").get().id;

  post("/subscription-payment", {
    email: "plain@example.com",
    invoiceId: "inv_plain",
    customerId: "cus_plain",
    amountMinor: 49900,
    currency: "JPY",
    billingReason: "renewal",
  });

  const row = db.prepare("SELECT tier, pro_expires_at FROM users WHERE id = ?").get(id);
  assert.equal(row.tier, "pro");
  assert.ok(row.pro_expires_at, "a non-lifetime subscriber must still get a dated expiry");
  const days = (new Date(row.pro_expires_at) - Date.now()) / 86400000;
  assert.ok(days > 30 && days < 40, `expected a ~35 day horizon, got ${days.toFixed(1)}`);
});

test("starting a subscription does not overwrite an existing lifetime", () => {
  reset();
  const id = seedLifetimeBuyer("both@example.com");
  post("/subscription-checkout", {
    email: "both@example.com",
    plan: "monthly",
    subscriptionId: "sub_new",
    provider: "lemonsqueezy",
    customerId: "cus_life",
    status: "active",
    renewsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    testMode: false,
  });

  const row = db.prepare("SELECT subscription_plan, pro_expires_at FROM users WHERE id = ?").get(id);
  assert.equal(row.pro_expires_at, null, "a new subscription dated a lifetime holder's expiry");
  assert.equal(
    row.subscription_plan,
    "lifetime",
    "subscription_plan was overwritten — that column is the ONLY record of a MANUAL lifetime grant",
  );
});
