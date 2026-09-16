/**
 * Two defects found by the 2026-09-16 audit, both in how a subscription's own events
 * rebuild an entitlement that something else already decided.
 *
 *  1. Refund/dispute, then cancel, HANDED PRO BACK through the end of the period that
 *     had just been refunded — up to a year on the yearly plan.
 *  2. A stale or replayed subscription_updated could undo a renewal that was already
 *     paid, locking the subscriber out three days later.
 *
 * Executed against the real handlers; see server/refund-guard.js.
 */

require("./support/route-harness").install();

const test = require("node:test");
const assert = require("node:assert");
const { callRoute } = require("./support/route-harness");

const db = require("../db");
const webhook = require("../routes/webhook");

const iso = (msFromNow) => new Date(Date.now() + msFromNow).toISOString();
const DAY = 86400000;

function reset() {
  for (const t of ["apple_purchases", "projects", "sessions", "magic_link_tokens", "orders", "users"]) {
    try { db.prepare(`DELETE FROM ${t}`).run(); } catch (e) {
      if (!/no such table/i.test(String(e && e.message))) throw e;
    }
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users").get().n, 0, "reset() did not empty users");
}

/** A paying monthly subscriber with one kept Pro order. */
function seedSubscriber(email = "sub@x.com", plan = "monthly", amount = 500) {
  db.prepare(
    `INSERT INTO users (email, tier, subscription_plan, subscription_status, pro_expires_at,
                        subscription_current_period_end, payment_provider, provider_customer_id, provider_subscription_id)
     VALUES (?, 'pro', ?, 'active', ?, ?, 'lemonsqueezy', 'cus_1', 'sub_1')`,
  ).run(email, plan, iso(20 * DAY), iso(17 * DAY));
  db.prepare(
    `INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test)
     VALUES ('lsinv_INV1', ?, 'Pro', ?, 'jpy', ?, 0, 0)`,
  ).run(email, amount, `pro-${plan}`);
  return db.prepare("SELECT id FROM users WHERE email = ?").get(email).id;
}

const refund = (email) =>
  callRoute(webhook, "post", "/subscription-revoke", {
    body: { email, reason: "subscription_payment_refunded", lsId: "INV1", subscriptionId: "sub_1", customerId: "cus_1" },
  });
const cancel = (extra = {}) =>
  callRoute(webhook, "post", "/subscription-cancelled", {
    body: { subscriptionId: "sub_1", customerId: "cus_1", endsAt: iso(17 * DAY), ...extra },
  });
const update = (body) =>
  callRoute(webhook, "post", "/subscription-updated", {
    body: { subscriptionId: "sub_1", customerId: "cus_1", ...body },
  });
const row = (id) => db.prepare("SELECT tier, pro_expires_at, subscription_current_period_end AS cpe FROM users WHERE id = ?").get(id);

// ------------------------------------------------------- refund then cancel ---

test("a refund followed by a cancellation does not hand Pro back", () => {
  reset();
  const id = seedSubscriber();
  refund("sub@x.com");
  assert.equal(row(id).tier, "free", "sanity: the refund should revoke");
  cancel();
  const after = row(id);
  assert.equal(after.tier, "free",
    "the cancellation restored Pro to a customer who already had their money back — up to a year on the yearly plan");
  assert.equal(after.pro_expires_at, null);
});

test("a refund followed by subscription_updated(cancelled) does not hand Pro back either", () => {
  reset();
  const id = seedSubscriber();
  refund("sub@x.com");
  update({ status: "cancelled", renewsAt: iso(17 * DAY), endsAt: iso(17 * DAY) });
  assert.equal(row(id).tier, "free", "subscription_updated is the second door onto the same row");
});

test("cancelling WITHOUT a refund still keeps Pro to the end of the paid period (control)", () => {
  reset();
  const id = seedSubscriber();
  cancel();
  const after = row(id);
  assert.equal(after.tier, "pro", "an ordinary cancellation must not lock a paying customer out early");
  assert.ok(after.pro_expires_at, "and must keep a dated clock");
});

test("a refunded customer who subscribes again is restored (the guard must not be permanent)", () => {
  reset();
  const id = seedSubscriber();
  refund("sub@x.com");
  // A new paid invoice, i.e. they came back.
  db.prepare(
    `INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test, created_at)
     VALUES ('lsinv_INV2', 'sub@x.com', 'Pro', 500, 'jpy', 'pro-monthly', 0, 0, datetime('now','+1 second'))`,
  ).run();
  update({ status: "active", renewsAt: iso(30 * DAY) });
  assert.equal(row(id).tier, "pro", "a live subscription after a later kept payment must restore access");
});

// ------------------------------------------------------ stale event ordering ---

test("a stale subscription_updated delivered last cannot undo a paid renewal", () => {
  reset();
  const id = seedSubscriber();
  const renewed = iso(30 * DAY);
  update({ status: "active", renewsAt: renewed, updatedAt: "2026-09-22T10:36:13.000Z" });
  const good = row(id);
  // The stale twin LS emits within a second of the charge, arriving last after a retry.
  update({ status: "active", renewsAt: iso(-36 * 60 * 1000), updatedAt: "2026-09-22T10:36:12.000Z" });
  const after = row(id);
  assert.equal(after.cpe, good.cpe, "the stale event rewound the billing date");
  assert.equal(after.pro_expires_at, good.pro_expires_at,
    "the stale event rewound the access clock — the subscriber pays, then loses Pro three days later");
});

test("a NEWER event still applies (the ordering guard must not freeze the row)", () => {
  reset();
  const id = seedSubscriber();
  update({ status: "active", renewsAt: iso(30 * DAY), updatedAt: "2026-09-22T10:36:13.000Z" });
  const later = iso(60 * DAY);
  update({ status: "active", renewsAt: later, updatedAt: "2026-10-22T10:36:13.000Z" });
  assert.equal(row(id).cpe, later, "a genuinely newer event must be applied");
});

test("even with no timestamp at all, an alive subscription's clocks never move backwards", () => {
  reset();
  const id = seedSubscriber();
  update({ status: "active", renewsAt: iso(30 * DAY) });
  const good = row(id);
  update({ status: "active", renewsAt: iso(-36 * 60 * 1000) }); // legacy shape, no updatedAt
  assert.equal(row(id).cpe, good.cpe);
  assert.equal(row(id).pro_expires_at, good.pro_expires_at);
});

test("an expiry still revokes — going backwards is only blocked while the provider says alive", () => {
  reset();
  const id = seedSubscriber();
  callRoute(webhook, "post", "/subscription-cancelled", {
    body: { subscriptionId: "sub_1", customerId: "cus_1", reason: "expired" },
  });
  assert.equal(row(id).tier, "free", "subscription_expired must still end access");
});
