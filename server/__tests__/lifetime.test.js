/**
 * Tests for server/lifetime.js — the guard that stops a subscription event
 * from revoking a lifetime purchase.
 *
 * Run with:
 *   node --test server/__tests__/lifetime.test.js
 *
 * Context (2026-09-06). Lifetime was blocked in the website's code for a day
 * because buying it was unsafe: a lifetime row is `pro_expires_at = NULL`, and
 * every revocation path wrote `tier='free', pro_expires_at=NULL` after matching
 * the user on a SHARED provider_customer_id. A monthly subscriber who upgraded
 * to lifetime and then cancelled the monthly lost the ¥19,999 they had just
 * paid, silently. These assertions exist because that path was real, not
 * hypothetical.
 *
 * The two directions matter equally, and the second is the one a naive fix
 * gets wrong: a REFUNDED lifetime must still be revocable, or the guard just
 * trades a silent lockout for free Pro forever.
 */

const test = require("node:test");
const assert = require("node:assert");
// node:sqlite, not better-sqlite3: the native binding for better-sqlite3 is not
// built for this machine's Node (a known local breakage), and a test that cannot
// run locally is a test nobody runs. The API surface used here — prepare().get()
// / .all() / .run() and exec() — is the same on both, and production still uses
// better-sqlite3.
const { DatabaseSync } = require("node:sqlite");

const { hasLifetimeEntitlement, LIFETIME_PACK_ID } = require("../lifetime");

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      email TEXT,
      tier TEXT,
      subscription_plan TEXT,
      pro_expires_at TEXT
    );
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      order_id TEXT UNIQUE,
      email TEXT,
      pack_id TEXT,
      refunded INTEGER DEFAULT 0,
      is_test INTEGER DEFAULT 0
    );
  `);
  return db;
}

function addUser(db, { id = 1, email = "buyer@example.com", plan = null } = {}) {
  db.prepare(
    "INSERT INTO users (id, email, tier, subscription_plan) VALUES (?, ?, 'pro', ?)",
  ).run(id, email, plan);
  return id;
}

function addLifetimeOrder(db, { email = "buyer@example.com", refunded = 0, isTest = 0, orderId } = {}) {
  db.prepare(
    "INSERT INTO orders (order_id, email, pack_id, refunded, is_test) VALUES (?, ?, ?, ?, ?)",
  ).run(orderId || `lifetime_${Math.floor(performance.now() * 1000)}_${email}`, email, LIFETIME_PACK_ID, refunded, isTest);
}

test("a kept lifetime order is protected", () => {
  const db = makeDb();
  const id = addUser(db);
  addLifetimeOrder(db);
  assert.equal(hasLifetimeEntitlement(db, id), true);
});

test("THE INCIDENT: a lifetime buyer who also had a monthly subscription is protected", () => {
  // The monthly and the lifetime share one users row and one provider_customer_id,
  // which is exactly how the cancellation webhook reached the lifetime entitlement.
  const db = makeDb();
  const id = addUser(db, { plan: "monthly" }); // row still says monthly from the sub
  addLifetimeOrder(db);
  assert.equal(hasLifetimeEntitlement(db, id), true);
});

test("a REFUNDED lifetime is NOT protected — the money went back", () => {
  const db = makeDb();
  const id = addUser(db, { plan: "lifetime" });
  addLifetimeOrder(db, { refunded: 1 });
  assert.equal(
    hasLifetimeEntitlement(db, id),
    false,
    "guarding on subscription_plan alone would make a refunded lifetime un-revocable",
  );
});

test("one refunded and one kept lifetime order still protects", () => {
  const db = makeDb();
  const id = addUser(db);
  addLifetimeOrder(db, { refunded: 1, orderId: "lifetime_a" });
  addLifetimeOrder(db, { refunded: 0, orderId: "lifetime_b" });
  assert.equal(hasLifetimeEntitlement(db, id), true);
});

test("a plain monthly subscriber is NOT protected", () => {
  const db = makeDb();
  const id = addUser(db, { plan: "monthly" });
  assert.equal(hasLifetimeEntitlement(db, id), false);
});

test("a manual grant with no order at all is honoured", () => {
  const db = makeDb();
  const id = addUser(db, { plan: "lifetime" });
  assert.equal(hasLifetimeEntitlement(db, id), true);
});

test("another customer's lifetime order does not protect this user", () => {
  const db = makeDb();
  const id = addUser(db, { email: "someone@example.com" });
  addLifetimeOrder(db, { email: "different@example.com" });
  assert.equal(hasLifetimeEntitlement(db, id), false);
});

test("email match is case-insensitive", () => {
  const db = makeDb();
  const id = addUser(db, { email: "Buyer@Example.com" });
  addLifetimeOrder(db, { email: "buyer@example.com" });
  assert.equal(hasLifetimeEntitlement(db, id), true);
});

test("a TEST-mode lifetime order does not protect a real user", () => {
  const db = makeDb();
  const id = addUser(db);
  addLifetimeOrder(db, { isTest: 1 });
  assert.equal(hasLifetimeEntitlement(db, id), false);
});

test("an unknown or missing user id is not protected, and does not throw", () => {
  const db = makeDb();
  addUser(db);
  for (const bad of [null, undefined, "", 9999]) {
    assert.equal(hasLifetimeEntitlement(db, bad), false, `input ${String(bad)}`);
  }
});

test("FAILS CLOSED: a broken database returns false rather than throwing", () => {
  // A guard that throws inside a revocation handler would abort the request and
  // leave state half-written; returning false means the pre-existing behaviour
  // (revoke) applies, which is the safe direction for an unknown user.
  const exploding = {
    prepare() {
      throw new Error("no such table: users");
    },
  };
  assert.equal(hasLifetimeEntitlement(exploding, 1), false);
});
