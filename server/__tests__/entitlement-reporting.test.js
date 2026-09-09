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
  callRoute(webhook, "post", "/subscription-payment", {
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
  const second = callRoute(webhook, "post", "/subscription-payment", {
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

  callRoute(webhook, "post", "/subscription-payment", {
    body: { email: "two@example.com", invoiceId: "inv_a", customerId: "cus_two", amountMinor: 49900, currency: "JPY" },
  });
  callRoute(webhook, "post", "/subscription-payment", {
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

  const out = callRoute(me, "get", "/subscription", { user: { id } });
  assert.ok(out.body, "/me/subscription returned null for a Pro Apple user");
  assert.equal(out.body.provider, "apple");
  assert.equal(out.body.plan, "yearly", "Plan rendered as an empty cell for Apple subscribers");
  assert.equal(out.body.status, "active", "Status rendered as an empty cell for Apple subscribers");
  // currentPeriodEnd stays null on purpose: it means "the date the card is
  // charged", which Apple never gives us. proExpiresAt is the entitlement clock
  // (with a +3 day grace) and is what the client renders, under its own
  // "Access until" label. Conflating the two on the server stated a renewal date
  // three days after the real charge.
  assert.equal(out.body.currentPeriodEnd, null, "the charge date must not be faked from the entitlement clock");
  assert.equal(
    out.body.proExpiresAt,
    FUTURE,
    "the client needs the entitlement clock to render an access date at all",
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

  const out = callRoute(admin, "get", "/autopilot-status", {});
  assert.ok(out.body, "the admin handler returned nothing");
  assert.equal(
    out.body.commerce.pro_users_total,
    2,
    `reported ${out.body.commerce.pro_users_total} Pro users; effectiveTier says 2 (one dated-future, one ` +
      `lifetime NULL). The expired row is stale because its owner never came back.`,
  );
});

// ------------------------------------- regressions found by the final audit ---

test("the twin pairing is 1:1 — one order leg cannot absorb several invoices", () => {
  reset();
  db.prepare(`INSERT INTO users (email, tier, provider_customer_id) VALUES ('n1@x.com','free','cus_n')`).run();
  const charge = (key, extra) =>
    callRoute(webhook, "post", "/subscription-payment", {
      body: { email: "n1@x.com", customerId: "cus_n", amountMinor: 49900, currency: "JPY", ...extra, ...key },
    });

  charge({ lsOrderId: "ORD_1" }); // a lone order leg
  charge({ invoiceId: "INV_1" }); // its real twin -> correctly suppressed
  charge({ invoiceId: "INV_2" }); // a DIFFERENT charge -> must NOT be suppressed
  charge({ invoiceId: "INV_3" }); // and neither must this one

  assert.equal(
    db.prepare("SELECT COUNT(*) AS n FROM orders").get().n,
    3,
    "one row absorbed every later charge in its window — the lookup asked 'does a twin exist' " +
      "rather than 'is this charge already paired', so real revenue was dropped",
  );
});

test("a refund quoting the SUPPRESSED key still flags the surviving row", () => {
  reset();
  db.prepare(`INSERT INTO users (email, tier, provider_customer_id) VALUES ('r@x.com','free','cus_r')`).run();
  callRoute(webhook, "post", "/subscription-payment", {
    body: { email: "r@x.com", lsOrderId: "ORD_R", customerId: "cus_r", amountMinor: 49900, currency: "JPY" },
  });
  callRoute(webhook, "post", "/subscription-payment", {
    body: { email: "r@x.com", invoiceId: "INV_R", customerId: "cus_r", amountMinor: 49900, currency: "JPY" },
  });

  callRoute(webhook, "post", "/subscription-revoke", {
    body: { email: "r@x.com", reason: "subscription_payment_refunded", lsId: "INV_R", customerId: "cus_r" },
  });

  const row = db.prepare("SELECT refunded FROM orders WHERE order_id = 'lsord_ORD_R'").get();
  assert.equal(
    row.refunded,
    1,
    "the refund quoted the invoice id, which was suppressed as a duplicate — without twin_order_id " +
      "nothing matches and refunded money stays inside the revenue totals forever",
  );
});

test("the share reward is bounded — a loop cannot mint unlimited AI credits", () => {
  reset();
  db.prepare(`INSERT INTO users (email, tier, credits) VALUES ('spam@x.com','free',0)`).run();
  const id = db.prepare("SELECT id FROM users WHERE email = 'spam@x.com'").get().id;

  for (let i = 0; i < 25; i++) callRoute(me, "post", "/referral/share", { user: { id } });

  const credits = db.prepare("SELECT credits FROM users WHERE id = ?").get(id).credits;
  assert.ok(
    credits <= 2,
    `25 calls minted ${credits} credits. Registration is a free magic link and credits buy AI ` +
      `generations against a GLOBAL daily budget, so an unbounded grant lets one free account 503 ` +
      `the AI for every user, paying subscribers included.`,
  );
});

// ------------------------------------------------ the harness guards itself ---

test("callRoute refuses to run the wrong verb's handler", () => {
  const { callRoute: cr } = require("./support/route-harness");
  assert.throws(
    () => cr(me, "post", "/subscription", { user: { id: 1 } }),
    /not found/,
    "matching on path alone silently ran whichever verb was registered first, so a POST test " +
      "could pass while never reaching the POST branch",
  );
});

test("the sqlite shim rejects a statement with too few bound values", () => {
  assert.throws(
    () => db.prepare("SELECT * FROM users WHERE email = ? AND tier = ?").get("a@x.com"),
    /expected 2, got 1/,
    "node:sqlite binds NULL for a missing parameter where better-sqlite3 throws — a shim more " +
      "permissive than production lets a broken INSERT ship green",
  );
});

test("a suppressed duplicate still extends the entitlement clock", () => {
  reset();
  db.prepare(
    `INSERT INTO users (email, tier, subscription_plan, pro_expires_at, provider_customer_id)
     VALUES ('ext@x.com','free','monthly',NULL,'cus_e')`,
  ).run();
  const id = db.prepare("SELECT id FROM users WHERE email = 'ext@x.com'").get().id;

  callRoute(webhook, "post", "/subscription-payment", {
    body: { email: "ext@x.com", lsOrderId: "ORD_E", customerId: "cus_e", amountMinor: 49900, currency: "JPY" },
  });
  const afterFirst = db.prepare("SELECT pro_expires_at FROM users WHERE id = ?").get(id).pro_expires_at;
  db.prepare("UPDATE users SET pro_expires_at = NULL, tier = 'free' WHERE id = ?").run(id);

  // The twin leg — suppressed as a duplicate order, but the money was real.
  callRoute(webhook, "post", "/subscription-payment", {
    body: { email: "ext@x.com", invoiceId: "INV_E", customerId: "cus_e", amountMinor: 49900, currency: "JPY" },
  });

  const row = db.prepare("SELECT tier, pro_expires_at FROM users WHERE id = ?").get(id);
  assert.ok(afterFirst, "sanity: the first leg should have set a clock");
  assert.equal(row.tier, "pro");
  assert.ok(
    row.pro_expires_at,
    "the pairing is INFERRED from email+amount+window, so a wrong match must not leave a customer " +
      "who was genuinely charged with an unmoved clock — they would expire while still paying",
  );
});

test("the duplicate advisory clears when the COUNTERPART lapses, not just the flagged row", () => {
  reset();
  const admin = require("../routes/admin");
  const live = new Date(Date.now() + 30 * 86400000).toISOString();
  // The suspect id must be the REAL one: sqlite AUTOINCREMENT keeps its high-water
  // mark across DELETE, so a hardcoded '[2]' resolves to nobody and the assertion
  // below passes whether or not the filter works — which is exactly what the first
  // version of this test did.
  db.prepare(`INSERT INTO users (email, tier, pro_expires_at) VALUES ('lapsed@x.com','pro',?)`).run(PAST);
  const lapsedId = db.prepare("SELECT id FROM users WHERE email = 'lapsed@x.com'").get().id;
  db.prepare(
    `INSERT INTO users (email, tier, pro_expires_at, is_duplicate, duplicate_suspects, card_fingerprint)
     VALUES ('flagged@x.com','pro',?,1,?,'visa:3816')`,
  ).run(live, JSON.stringify([lapsedId]));

  // Sanity: the id really does resolve, so an empty result below means the FILTER
  // worked and not that the lookup found nothing.
  assert.ok(db.prepare("SELECT 1 FROM users WHERE id = ?").get(lapsedId), "suspect id must exist");

  const out = callRoute(admin, "get", "/autopilot-status", {});
  const adv = out.body.commerce.suspected_duplicates;
  assert.equal(adv.length, 1, "the flagged row is still entitled, so the row itself stays");
  assert.deepEqual(
    adv[0].suspects,
    [],
    "the counterpart lapsed 36 days ago, but the banner still called it 'another active Pro user'",
  );
});

test("a pre-order charge is stored in major units, like every other order row", () => {
  reset();
  callRoute(webhook, "post", "/order-completed", {
    body: {
      email: "pre@x.com",
      packId: "preorder-auditor",
      paymentIntent: "9999",
      provider: "lemonsqueezy",
      amountTotal: 499900, // Lemon Squeezy ships minor units: this is ¥4,999
      currency: "JPY",
      attributedSource: "preorder",
    },
  });
  const row = db.prepare("SELECT amount FROM orders WHERE email = 'pre@x.com'").get();
  assert.ok(row, "no order row was written");
  assert.equal(
    row.amount,
    4999,
    `stored ${row.amount}. Every other order writer divides by 100, so the raw value shows in ` +
      `/admin as ¥499,900 and is emailed to the buyer as a ¥499,900 receipt, permanently.`,
  );
});
