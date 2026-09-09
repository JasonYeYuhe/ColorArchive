/**
 * Executing tests for the four defects the 2026-09-08 audit rated medium/low.
 *
 * Three of them share one shape: something reads users.tier RAW instead of
 * asking effectiveTier(). That column is stale by design — auth.js only rewrites
 * it on a SESSION request — so every raw reader disagrees with what the product
 * actually grants, for exactly the users who stopped visiting.
 */

require("./support/route-harness").install();

const test = require("node:test");
const assert = require("node:assert");
const crypto = require("node:crypto");
const { callRoute, callMiddleware } = require("./support/route-harness");

const db = require("../db");
const projects = require("../routes/projects");
const webhook = require("../routes/webhook");
const me = require("../routes/me");

const PAST = "2026-08-03T04:38:34.000Z";
const FUTURE = new Date(Date.now() + 30 * 86400000).toISOString();

function reset() {
  // Children BEFORE parents: db.js turns foreign_keys ON, so deleting users
  // while an apple_purchases row still references one fails. The first version of
  // this helper swallowed that error, so rows from earlier tests survived and the
  // admin count test read them as real Pro users — a test helper that could not
  // fail, which is the same defect this file exists to fix. Hence the assert.
  for (const t of ["apple_purchases", "projects", "sessions", "magic_link_tokens", "orders", "users"]) {
    try {
      db.prepare(`DELETE FROM ${t}`).run();
    } catch (e) {
      if (!/no such table/i.test(String(e && e.message))) throw e;
    }
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users").get().n, 0, "reset() did not empty users");
}

// ---------------------------------------------------------------- API key ---

function seedKeyUser(email, proExpiresAt, key) {
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  db.prepare(
    `INSERT INTO users (email, tier, pro_expires_at, api_key_hash) VALUES (?, 'pro', ?, ?)`,
  ).run(email, proExpiresAt, hash);
  return db.prepare("SELECT id FROM users WHERE email = ?").get(email).id;
}

test("an API key on a LAPSED Pro resolves to free", () => {
  reset();
  const id = seedKeyUser("lapsed@example.com", PAST, "key-lapsed");
  const { passed, req } = callMiddleware(projects, "requireUserOrApiKey", {
    headers: { authorization: "Bearer key-lapsed" },
  });

  assert.equal(passed, true, "the key should still authenticate — it is valid, just not Pro");
  assert.equal(
    req.user.tier,
    "free",
    "the API key path read users.tier raw, so a lapsed subscriber kept unlimited projects forever " +
      "while the same account was correctly free in the browser",
  );
  assert.equal(
    db.prepare("SELECT tier FROM users WHERE id = ?").get(id).tier,
    "free",
    "the row should self-heal the way auth.js does, so the staleness does not persist",
  );
});

test("an API key on a LIVE Pro is still Pro (the fix must not fail closed)", () => {
  reset();
  seedKeyUser("live@example.com", FUTURE, "key-live");
  const { passed, req } = callMiddleware(projects, "requireUserOrApiKey", {
    headers: { authorization: "Bearer key-live" },
  });
  assert.equal(passed, true);
  assert.equal(req.user.tier, "pro", "a paying subscriber's key must keep Pro limits");
});

// ------------------------------------------------------- duplicate charge ---

test("one initial charge arriving as two LS events writes ONE order row", () => {
  reset();
  db.prepare(
    `INSERT INTO users (email, tier, subscription_plan, provider_customer_id)
     VALUES ('dup@example.com', 'free', 'monthly', 'cus_dup')`,
  ).run();

  // order_created for a subscription variant -> lsord_<order id>
  callRoute(webhook, "/subscription-payment", {
    body: {
      email: "dup@example.com",
      lsOrderId: "9000001",
      customerId: "cus_dup",
      plan: "yearly",
      amountMinor: 399900,
      currency: "JPY",
      billingReason: "initial",
    },
  });
  // subscription_payment_success for the SAME money -> lsinv_<invoice id>
  const second = callRoute(webhook, "/subscription-payment", {
    body: {
      email: "dup@example.com",
      invoiceId: "8000001",
      subscriptionId: "sub_dup",
      customerId: "cus_dup",
      amountMinor: 399900,
      currency: "JPY",
      billingReason: "initial",
    },
  });

  const rows = db.prepare("SELECT order_id, amount FROM orders ORDER BY order_id").all();
  assert.equal(
    rows.length,
    1,
    `one charge produced ${rows.length} order rows (${rows.map((r) => r.order_id).join(", ")}) — ` +
      `revenue doubles for every non-trial signup, and a refund flags only one of them`,
  );
  assert.equal(second.body.duplicateCharge, true, "the second event should report itself as the twin");
});

test("a genuinely different charge is still recorded (dedupe must not eat revenue)", () => {
  reset();
  db.prepare(
    `INSERT INTO users (email, tier, subscription_plan, provider_customer_id)
     VALUES ('two@example.com', 'free', 'monthly', 'cus_two')`,
  ).run();

  callRoute(webhook, "/subscription-payment", {
    body: { email: "two@example.com", invoiceId: "inv_a", customerId: "cus_two", amountMinor: 49900, currency: "JPY" },
  });
  callRoute(webhook, "/subscription-payment", {
    body: { email: "two@example.com", lsOrderId: "ord_b", customerId: "cus_two", amountMinor: 399900, currency: "JPY" },
  });

  assert.equal(
    db.prepare("SELECT COUNT(*) AS n FROM orders").get().n,
    2,
    "two different amounts are two different charges and must both be recorded",
  );
});

// --------------------------------------------------------- Apple /me/sub ---

test("/me/subscription fills plan, status and renewal for an Apple subscriber", () => {
  reset();
  db.prepare(
    `INSERT INTO users (email, tier, payment_provider, apple_original_transaction_id, pro_expires_at)
     VALUES ('ios@example.com', 'pro', 'apple', 'txn_9', ?)`,
  ).run(FUTURE);
  const id = db.prepare("SELECT id FROM users WHERE email = 'ios@example.com'").get().id;
  db.prepare(
    `INSERT INTO apple_purchases (user_id, product_id, original_transaction_id, transaction_date, status)
     VALUES (?, 'me.colorarchive.pro.yearly', 'txn_9', '2026-09-01', 'active')`,
  ).run(id);

  const out = callRoute(me, "/subscription", { user: { id } });
  assert.ok(out.body, "/me/subscription returned null for a Pro Apple user");
  assert.equal(out.body.provider, "apple");
  assert.equal(out.body.plan, "yearly", "Plan rendered as an empty cell for Apple subscribers");
  assert.equal(out.body.status, "active", "Status rendered as an empty cell for Apple subscribers");
  assert.equal(
    out.body.currentPeriodEnd,
    FUTURE,
    "no renewal row was shown at all, even though the server was holding a usable expiry",
  );
});

// -------------------------------------------------------------- admin count ---

test("the admin dashboard counts Pro through effectiveTier, not raw tier", () => {
  reset();
  const admin = require("../routes/admin");
  const live = new Date(Date.now() + 30 * 86400000).toISOString();
  db.prepare(`INSERT INTO users (email, tier, pro_expires_at) VALUES ('a@x.com','pro',?)`).run(live);
  db.prepare(`INSERT INTO users (email, tier, pro_expires_at) VALUES ('b@x.com','pro',NULL)`).run(); // lifetime
  db.prepare(`INSERT INTO users (email, tier, pro_expires_at) VALUES ('c@x.com','pro',?)`).run(PAST);
  db.prepare(`INSERT INTO users (email, tier, pro_expires_at) VALUES ('d@x.com','free',NULL)`).run();

  const out = callRoute(admin, "/autopilot-status", {});
  assert.ok(out.body, "the admin handler returned nothing");
  assert.equal(
    out.body.commerce.pro_users_total,
    2,
    `reported ${out.body.commerce.pro_users_total} Pro users; effectiveTier says 2 (one dated-future, one ` +
      `lifetime NULL). The expired row is stale because its owner never came back.`,
  );
});
