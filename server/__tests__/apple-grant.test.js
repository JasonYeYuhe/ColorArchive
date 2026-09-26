/**
 * Executing tests for the Apple grant — server/apple-grant.js, the /auth/apple-purchase
 * route that calls it, the App Store notification branches that share its clock rules,
 * and the manual link step.
 *
 * Why these paths need more than the old code had: until 2026-09-17 the embedded Apple
 * root was corrupt, so no Apple JWS ever verified and none of this could run. Fixing
 * verification made every grant path live at once, and a review of the newly live code
 * found that a transaction captured before a refund still verified — and re-granted
 * Pro — and that replayed old transactions moved expiry dates backwards.
 *
 * Only ../apple-jws is replaced (signature verification is apple-jws.test.js's job);
 * routes, schema and SQL run for real.
 */

require("./support/route-harness").install();

const Module = require("node:module");
const test = require("node:test");
const assert = require("node:assert");

let nextTxn = null;
let nextNotification = null;
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === "../apple-jws") {
    return {
      detectTransactionShape: () => "jws",
      verifySignedTransaction: async () => nextTxn,
      verifyNotificationPayload: async () => nextNotification,
    };
  }
  return origLoad.call(this, request, ...rest);
};

const db = require("../db");
const { createSession } = require("../auth");
const authRouter = require("../routes/auth");
const notificationsRouter = require("../routes/apple-notifications");
const { grantApplePurchase, linkUnlinkedTransaction } = require("../apple-grant");
const { callRouteChain } = require("./support/route-harness");

const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString();

function reset() {
  for (const t of ["apple_revoked_transactions", "apple_unlinked_transactions", "apple_purchases", "orders", "sessions", "magic_link_tokens", "users"]) {
    db.exec(`DELETE FROM ${t}`);
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS c FROM apple_revoked_transactions").get().c, 0, "reset() leaked revocations");
}
const addUser = (email, cols = {}) => {
  const id = Number(db.prepare("INSERT INTO users (email) VALUES (?)").run(email).lastInsertRowid);
  for (const [k, v] of Object.entries(cols)) db.prepare(`UPDATE users SET ${k} = ? WHERE id = ?`).run(v, id);
  return id;
};
const user = (id) => ({ ...db.prepare("SELECT tier, pro_expires_at, payment_provider, apple_original_transaction_id FROM users WHERE id = ?").get(id) });
const purchaseRow = (txn) => db.prepare("SELECT user_id, status, expires_date FROM apple_purchases WHERE original_transaction_id = ?").get(txn);

function txn(over = {}) {
  return {
    originalTransactionId: "2000001",
    transactionId: "2000001",
    productId: "me.colorarchive.pro.yearly",
    purchaseDate: iso(Date.now() - DAY),
    expiresDate: iso(Date.now() + 364 * DAY),
    environment: "Production",
    bundleId: "me.colorarchive.app",
    revocationDate: null,
    ...over,
  };
}

/** POST /auth/apple-purchase as the signed-in user, with `t` as the verified transaction. */
async function sync(userId, t) {
  nextTxn = t;
  const { token } = createSession(userId);
  return callRouteChain(authRouter, "post", "/apple-purchase", {
    headers: { cookie: `colorarchive_session=${token}` },
    body: { signedTransaction: "stubbed.jws.value" },
  });
}

const lsWebhook = require("../routes/webhook");
const { callRoute } = require("./support/route-harness");

function notify(notificationType, t, subtype = null) {
  nextNotification = { notificationType, subtype, data: { signedTransactionInfo: "stubbed" } };
  nextTxn = t;
  return callRouteChain(notificationsRouter, "post", "/v2", { body: { signedPayload: "stubbed" } });
}

// ---- the grant ------------------------------------------------------------------

test("a verified subscription grants Pro until Apple's expiry plus 3 days of grace", async () => {
  reset();
  const id = addUser("sub@example.com");
  const t = txn();
  const out = await sync(id, t);
  assert.equal(out.code, 200);
  const expected = iso(Date.parse(t.expiresDate) + 3 * DAY);
  assert.deepEqual(out.body, { ok: true, tier: "pro", proExpiresAt: expected, verified: true });
  assert.deepEqual(user(id), { tier: "pro", pro_expires_at: expected, payment_provider: "apple", apple_original_transaction_id: "2000001" });
  assert.equal(purchaseRow("2000001").status, "active");
});

test("an Apple lifetime purchase is recorded with no expiry", async () => {
  reset();
  const id = addUser("life@example.com");
  const out = await sync(id, txn({ productId: "me.colorarchive.pro.lifetime", expiresDate: null }));
  assert.equal(out.body.proExpiresAt, null);
  assert.equal(user(id).tier, "pro");
  assert.equal(user(id).pro_expires_at, null);
});

test("an Apple subscription never dates an existing lifetime entitlement", async () => {
  reset();
  const id = addUser("ls-lifetime@example.com", { subscription_plan: "lifetime", tier: "pro" });
  await sync(id, txn({ productId: "me.colorarchive.pro.monthly", expiresDate: iso(Date.now() + 30 * DAY) }));
  assert.equal(user(id).pro_expires_at, null);
});

// ---- review findings, 2026-09-17 --------------------------------------------------

test("REPLAY AFTER REFUND: a transaction captured before its refund does not bring Pro back", async () => {
  reset();
  const id = addUser("refunder@example.com");
  const beforeRefund = txn({ productId: "me.colorarchive.pro.lifetime", expiresDate: null });
  await sync(id, beforeRefund);
  assert.equal(user(id).tier, "pro");

  await notify("REFUND", beforeRefund);
  assert.equal(user(id).tier, "free", "precondition: the refund notification downgraded");
  assert.equal(purchaseRow("2000001").status, "refunded");

  const replay = await sync(id, beforeRefund); // the same signed snapshot, still valid
  assert.equal(replay.code, 200, "genuine-but-spent transactions answer 200 so the app stops replaying them");
  assert.deepEqual(replay.body, { ok: true, granted: false, reason: "refunded", verified: true });
  assert.equal(user(id).tier, "free");
  assert.equal(purchaseRow("2000001").status, "refunded", "a sync must never flip refunded back to active");
});

test("a transaction that carries revocationDate grants nothing", async () => {
  reset();
  const id = addUser("revoked@example.com");
  const out = await sync(id, txn({ revocationDate: iso(Date.now() - DAY) }));
  assert.deepEqual(out.body, { ok: true, granted: false, reason: "revoked", verified: true });
  assert.equal(user(id).tier, "free");
});

test("verified subscription data with no expiry (e.g. renewal info) is not a purchase", async () => {
  reset();
  const id = addUser("renewal-info@example.com");
  const out = await sync(id, txn({ expiresDate: null }));
  assert.deepEqual(out.body, { ok: true, granted: false, reason: "no-expiry", verified: true });
  assert.equal(user(id).tier, "free");
});

test("a subscription that has already lapsed is recorded for future notifications but grants nothing", async () => {
  reset();
  const id = addUser("lapsed@example.com");
  const out = await sync(id, txn({ purchaseDate: iso(Date.now() - 400 * DAY), expiresDate: iso(Date.now() - 35 * DAY) }));
  assert.deepEqual(out.body, { ok: true, granted: false, reason: "expired", verified: true });
  assert.deepEqual(user(id), { tier: "free", pro_expires_at: null, payment_provider: null, apple_original_transaction_id: null });
  assert.equal(purchaseRow("2000001").status, "expired");
  assert.equal(purchaseRow("2000001").user_id, id, "linked, so a later resubscribe notification finds this account");
});

test("BACKWARDS CLOCK: replaying an older transaction never shortens a later expiry", async () => {
  reset();
  const id = addUser("replayer@example.com");
  const later = Date.now() + 300 * DAY;
  await sync(id, txn({ originalTransactionId: "new", transactionId: "new", expiresDate: iso(later) }));
  const kept = user(id).pro_expires_at;

  await sync(id, txn({ originalTransactionId: "old", transactionId: "old", productId: "me.colorarchive.pro.monthly", expiresDate: iso(Date.now() + 10 * DAY) }));
  assert.equal(user(id).pro_expires_at, kept);

  await notify("DID_RENEW", txn({ originalTransactionId: "old", transactionId: "old", expiresDate: iso(Date.now() + 20 * DAY) }));
  assert.equal(user(id).pro_expires_at, kept, "a renewal notification must not shorten it either");
});

test("a live Lemon Squeezy subscriber keeps their provider, and an App Store expiry does not lock them out", async () => {
  reset();
  const lsEnd = iso(Date.now() + 25 * DAY);
  // a real LS row: subscription id and renewal date (renewal + 3 days grace = lsEnd)
  const id = addUser("both@example.com", {
    tier: "pro", pro_expires_at: lsEnd, payment_provider: "lemonsqueezy", subscription_status: "active",
    provider_subscription_id: "sub_both", subscription_current_period_end: iso(Date.now() + 22 * DAY),
  });
  const old = txn({ productId: "me.colorarchive.pro.monthly", expiresDate: iso(Date.now() + 5 * DAY) });
  await sync(id, old);
  assert.equal(user(id).payment_provider, "lemonsqueezy");
  assert.equal(user(id).pro_expires_at, lsEnd);

  await notify("EXPIRED", old);
  assert.equal(user(id).tier, "pro", "Apple's subscription ending took away access paid through Lemon Squeezy");
  assert.equal(user(id).pro_expires_at, lsEnd);
  assert.equal(purchaseRow("2000001").status, "expired");
});

test("positive control: an Apple-only subscriber IS downgraded when Apple says it expired", async () => {
  reset();
  const id = addUser("apple-only@example.com");
  const t = txn({ productId: "me.colorarchive.pro.monthly", expiresDate: iso(Date.now() + 5 * DAY) });
  await sync(id, t);
  assert.equal(user(id).tier, "pro");
  await notify("EXPIRED", t);
  assert.equal(user(id).tier, "free");
});

// ---- linking ------------------------------------------------------------------------

function recordUnlinked(id, over = {}) {
  db.prepare(
    `INSERT INTO apple_unlinked_transactions (original_transaction_id, product_id, environment, purchase_date, expires_date, last_notification_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, over.product_id ?? "me.colorarchive.pro.yearly", over.environment ?? "Production", iso(Date.now() - DAY), over.expires_date ?? iso(Date.now() + 364 * DAY), over.type ?? "SUBSCRIBED");
}

test("linking: dry run writes nothing; apply writes exactly what the sync would", () => {
  reset();
  const id = addUser("buyer@example.com");
  recordUnlinked("2000009");

  const dry = linkUnlinkedTransaction(db, { userId: id, txnId: "2000009" });
  assert.equal(dry.after, null);
  assert.equal(user(id).tier, "free");
  assert.equal(db.prepare("SELECT COUNT(*) AS c FROM apple_purchases").get().c, 0);

  const done = linkUnlinkedTransaction(db, { userId: id, txnId: "2000009", apply: true });
  assert.equal(done.after.tier, "pro");
  assert.equal(purchaseRow("2000009").user_id, id);
});

test("linking refuses what it cannot vouch for", () => {
  reset();
  const id = addUser("buyer@example.com");
  const other = addUser("other@example.com");
  assert.throws(() => linkUnlinkedTransaction(db, { userId: id, txnId: "never-verified", apply: true }), /no verified unlinked transaction/);

  recordUnlinked("sandbox", { environment: "Sandbox" });
  assert.throws(() => linkUnlinkedTransaction(db, { userId: id, txnId: "sandbox", apply: true }), /not Production/);

  recordUnlinked("weird", { product_id: "com.example.other" });
  assert.throws(() => linkUnlinkedTransaction(db, { userId: id, txnId: "weird", apply: true }), /unknown product/);

  for (const type of ["REFUND", "REVOKE", "EXPIRED/VOLUNTARY", "DID_FAIL_TO_RENEW"]) {
    recordUnlinked(`gone-${type}`, { type });
    assert.throws(() => linkUnlinkedTransaction(db, { userId: id, txnId: `gone-${type}`, apply: true }), /nothing to grant/, type);
  }

  recordUnlinked("grace", { type: "DID_FAIL_TO_RENEW/GRACE_PERIOD" });
  assert.doesNotThrow(() => linkUnlinkedTransaction(db, { userId: other, txnId: "grace" }), "billing grace still carries access");

  recordUnlinked("taken");
  linkUnlinkedTransaction(db, { userId: other, txnId: "taken", apply: true });
  assert.throws(() => linkUnlinkedTransaction(db, { userId: id, txnId: "taken", apply: true }), /already linked to user/);

  recordUnlinked("nouser");
  assert.throws(() => linkUnlinkedTransaction(db, { userId: 999999, txnId: "nouser", apply: true }), /no user/);

  assert.equal(user(id).tier, "free", "a refused link must not have written anything");
});

test("the grant function itself refuses a refunded transaction, for callers other than the route", () => {
  reset();
  const id = addUser("direct@example.com");
  db.prepare("INSERT INTO apple_revoked_transactions (transaction_id, original_transaction_id, reason) VALUES ('t-r1', 'r1', 'REFUND')").run();
  const r = grantApplePurchase(db, { userId: id, productId: "me.colorarchive.pro.lifetime", txnId: "r1", transactionId: "t-r1", verified: true });
  assert.deepEqual(r, { granted: false, reason: "refunded" });
  assert.equal(user(id).tier, "free");
});

// ---- second review, 2026-09-17 --------------------------------------------------

test("UNLINKED REFUND: a purchase refunded before any account claimed it cannot be claimed afterwards", async () => {
  reset();
  const id = addUser("claims-later@example.com");
  const captured = txn({ productId: "me.colorarchive.pro.lifetime", expiresDate: null });
  await notify("REFUND", captured); // no account owns it yet
  assert.equal(db.prepare("SELECT COUNT(*) AS c FROM apple_purchases").get().c, 0, "precondition: unlinked");

  const out = await sync(id, captured);
  assert.deepEqual(out.body, { ok: true, granted: false, reason: "refunded", verified: true });
  assert.equal(user(id).tier, "free");
});

test("REFUND of an EARLIER period leaves the current paid period alone, and its sync still works", async () => {
  reset();
  const id = addUser("renewed@example.com");
  const t1 = txn({ transactionId: "t1", productId: "me.colorarchive.pro.monthly", purchaseDate: iso(Date.now() - 35 * DAY), expiresDate: iso(Date.now() - 5 * DAY) });
  const t2 = txn({ transactionId: "t2", productId: "me.colorarchive.pro.monthly", purchaseDate: iso(Date.now() - 5 * DAY), expiresDate: iso(Date.now() + 25 * DAY) });
  await sync(id, t2);
  assert.equal(user(id).tier, "pro");

  await notify("REFUND", { ...t1, revocationDate: iso(Date.now()) });
  assert.equal(user(id).tier, "pro", "refunding last month took away the month that is paid for");

  const restore = await sync(id, t2); // e.g. Restore Purchases
  assert.equal(restore.body.tier, "pro");
  const replayRefunded = await sync(id, t1);
  assert.equal(replayRefunded.body.reason, "refunded", "the refunded transaction itself stays refused");
});

test("REFUND_REVERSED restores a refunded lifetime, and its sync is accepted again", async () => {
  reset();
  const id = addUser("reversed@example.com");
  const life = txn({ transactionId: "life-1", originalTransactionId: "life-1", productId: "me.colorarchive.pro.lifetime", expiresDate: null });
  await sync(id, life);
  await notify("REFUND", life);
  assert.equal(user(id).tier, "free");

  await notify("REFUND_REVERSED", life);
  assert.equal(user(id).tier, "pro");
  assert.equal(user(id).pro_expires_at, null);
  assert.equal(purchaseRow("life-1").status, "active");
  assert.equal((await sync(id, life)).body.tier, "pro");
});

test("APPLE LIFETIME is a lifetime: an iOS monthly lapsing after an iOS lifetime upgrade does not revoke it", async () => {
  reset();
  const id = addUser("upgrader@example.com");
  const monthly = txn({ originalTransactionId: "m-1", transactionId: "m-1", productId: "me.colorarchive.pro.monthly", expiresDate: iso(Date.now() + 10 * DAY) });
  await sync(id, monthly);
  await sync(id, txn({ originalTransactionId: "l-1", transactionId: "l-1", productId: "me.colorarchive.pro.lifetime", expiresDate: null }));
  assert.equal(user(id).pro_expires_at, null);

  await notify("EXPIRED", monthly);
  assert.equal(user(id).tier, "pro");
  assert.equal(user(id).pro_expires_at, null);
});

test("a refunded App Store lifetime does not protect itself — but an active yearly next to it is kept", async () => {
  reset();
  const id = addUser("two-purchases@example.com");
  const yearlyUntil = Date.now() + 200 * DAY;
  await sync(id, txn({ originalTransactionId: "y-1", transactionId: "y-1", productId: "me.colorarchive.pro.yearly", expiresDate: iso(yearlyUntil) }));
  const life = txn({ originalTransactionId: "l-2", transactionId: "l-2", productId: "me.colorarchive.pro.lifetime", expiresDate: null });
  await sync(id, life);

  await notify("REFUND", life);
  assert.equal(user(id).tier, "pro", "the paid yearly was wiped along with the refunded lifetime");
  assert.equal(user(id).pro_expires_at, iso(yearlyUntil + 3 * DAY));
});

test("positive control: a refunded App Store lifetime with nothing else IS revoked", async () => {
  reset();
  const id = addUser("only-lifetime@example.com");
  const life = txn({ originalTransactionId: "l-3", transactionId: "l-3", productId: "me.colorarchive.pro.lifetime", expiresDate: null });
  await sync(id, life);
  await notify("REFUND", life);
  assert.equal(user(id).tier, "free");
});

test("a Lemon Squeezy cancellation does not date an App Store lifetime", () => {
  reset();
  const id = addUser("ls-then-ios@example.com", {
    tier: "pro", subscription_plan: "monthly", subscription_status: "active", payment_provider: "lemonsqueezy",
    provider_customer_id: "cus_9", provider_subscription_id: "sub_9",
    pro_expires_at: iso(Date.now() + 20 * DAY), subscription_current_period_end: iso(Date.now() + 17 * DAY),
  });
  grantApplePurchase(db, { userId: id, productId: "me.colorarchive.pro.lifetime", txnId: "l-4", transactionId: "l-4", verified: true });
  assert.equal(user(id).pro_expires_at, null);

  callRoute(lsWebhook, "post", "/subscription-cancelled", {
    body: { subscriptionId: "sub_9", customerId: "cus_9", endsAt: iso(Date.now() + 17 * DAY) },
  });
  assert.equal(user(id).tier, "pro");
  assert.equal(user(id).pro_expires_at, null, "the LS cancellation turned an App Store lifetime into a 20-day subscription");
});

test("a CANCELLED Lemon Squeezy subscription still inside its paid period keeps access when an App Store purchase lapses", async () => {
  reset();
  const lsEnd = iso(Date.now() + 197 * DAY);
  const id = addUser("cancelled-ls@example.com", {
    tier: "pro", pro_expires_at: lsEnd, payment_provider: "lemonsqueezy", provider_subscription_id: "sub_cx",
    subscription_status: "cancelled", subscription_current_period_end: iso(Date.now() + 194 * DAY),
  });
  const monthly = txn({ productId: "me.colorarchive.pro.monthly", expiresDate: iso(Date.now() + 5 * DAY) });
  await sync(id, monthly);
  await notify("EXPIRED", monthly);
  assert.equal(user(id).tier, "pro");
  assert.equal(user(id).pro_expires_at, lsEnd);
});

test("linking a lapsed purchase is refused WITHOUT binding it to the account", () => {
  reset();
  const id = addUser("guess@example.com");
  recordUnlinked("lapsed-1", { product_id: "me.colorarchive.pro.monthly", expires_date: iso(Date.now() - 10 * DAY) });
  assert.throws(() => linkUnlinkedTransaction(db, { userId: id, txnId: "lapsed-1", apply: true }), /no current period/);
  assert.equal(purchaseRow("lapsed-1"), undefined, "a refused link wrote an apple_purchases row");
});

// ---- third review, 2026-09-17 ---------------------------------------------------

test("a refunded App Store lifetime cannot be kept alive through a Lemon Squeezy trial's plan marker", async () => {
  reset();
  const email = "trial-trick@example.com";
  const id = addUser(email);
  const life = txn({ originalTransactionId: "l-9", transactionId: "l-9", productId: "me.colorarchive.pro.lifetime", expiresDate: null });
  await sync(id, life);

  callRoute(lsWebhook, "post", "/subscription-checkout", {
    body: {
      email, plan: "monthly", subscriptionId: "sub_trial", provider: "lemonsqueezy", customerId: "cus_trial",
      status: "on_trial", renewsAt: iso(Date.now() + 7 * DAY), testMode: false,
    },
  });
  const plan = db.prepare("SELECT subscription_plan FROM users WHERE id = ?").get(id).subscription_plan;
  assert.notEqual(plan, "lifetime", "an App Store lifetime was written down as a MANUAL lifetime grant");

  await notify("REFUND", life);
  callRoute(lsWebhook, "post", "/subscription-cancelled", { body: { subscriptionId: "sub_trial", customerId: "cus_trial", reason: "expired" } });
  const { tier, pro_expires_at } = user(id);
  const effective = tier === "pro" && (pro_expires_at === null || Date.parse(pro_expires_at) > Date.now());
  assert.equal(effective, false, `refunded lifetime + lapsed trial still has Pro (tier=${tier}, expires=${pro_expires_at})`);
});

test("lifetime guard: an App Store lifetime counts until refunded, and a manual grant survives a refunded one", async () => {
  reset();
  const { hasLifetimeEntitlement } = require("../lifetime");
  const buyer = addUser("ios-life@example.com");
  const life = txn({ originalTransactionId: "lm-1", transactionId: "lm-1", productId: "me.colorarchive.pro.lifetime", expiresDate: null });
  await sync(buyer, life);
  assert.equal(hasLifetimeEntitlement(db, buyer), true);
  await notify("REFUND", life);
  assert.equal(hasLifetimeEntitlement(db, buyer), false, "a refunded App Store lifetime still counted");

  // The owner's manual grant, then an App Store lifetime bought and refunded by mistake.
  const manual = addUser("manual@example.com", { tier: "pro", subscription_plan: "lifetime" });
  const mistake = txn({ originalTransactionId: "lm-2", transactionId: "lm-2", productId: "me.colorarchive.pro.lifetime", expiresDate: null });
  await sync(manual, mistake);
  await notify("REFUND", mistake);
  assert.equal(hasLifetimeEntitlement(db, manual), true);
  assert.deepEqual([user(manual).tier, user(manual).pro_expires_at], ["pro", null], "refunding a mistaken purchase took away a manual lifetime grant");
});

test("REFUND_REVERSED after the period has ended records the purchase as expired, not refunded", async () => {
  reset();
  const id = addUser("late-reversal@example.com");
  const t = txn({ productId: "me.colorarchive.pro.monthly", expiresDate: iso(Date.now() + 10 * DAY) });
  await sync(id, t);
  await notify("REFUND", t);
  await notify("REFUND_REVERSED", { ...t, expiresDate: iso(Date.now() - 10 * DAY) });
  assert.equal(purchaseRow("2000001").status, "expired");
  assert.equal(user(id).tier, "free");
});

test("an App Store yearly REFUNDED while a Lemon Squeezy monthly governs access does not keep the refunded year", async () => {
  // 2026-09-27: downgrade() used to return early whenever another provider governed,
  // leaving the refunded App Store year on the account's clock (up to ~300 days free).
  reset();
  const lsDue = Date.now() + 20 * DAY;
  const id = addUser("ls-and-yearly@example.com", {
    tier: "pro", pro_expires_at: iso(lsDue + 3 * DAY), payment_provider: "lemonsqueezy", subscription_status: "active",
    provider_subscription_id: "sub_ly", subscription_current_period_end: iso(lsDue),
  });
  const yearly = txn({ originalTransactionId: "yr-1", transactionId: "yr-1", productId: "me.colorarchive.pro.yearly", expiresDate: iso(Date.now() + 300 * DAY) });
  await sync(id, yearly);
  assert.ok(Date.parse(user(id).pro_expires_at) > Date.now() + 290 * DAY, "precondition: the App Store year is on the clock");

  await notify("REFUND", yearly);
  assert.equal(user(id).tier, "pro", "the LS monthly is still paid");
  assert.equal(user(id).pro_expires_at, iso(lsDue + 3 * DAY), "the refunded App Store year stayed on the clock");
  assert.equal(user(id).payment_provider, "lemonsqueezy");
});

test("an App Store purchase ending during a LATE Lemon Squeezy renewal keeps renewal-grace's extension", async () => {
  reset();
  const { applyRenewalGrace, graceUntil } = require("../renewal-grace");
  const due = iso(Date.now() - 6 * DAY); // LS late to charge, status still active
  const id = addUser("late-ls-plus-apple@example.com", {
    tier: "pro", pro_expires_at: iso(Date.now() - DAY), payment_provider: "lemonsqueezy", subscription_status: "active",
    provider_subscription_id: "sub_late", subscription_current_period_end: due,
  });
  db.prepare("INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test, created_at) VALUES ('lsinv_late', 'late-ls-plus-apple@example.com', 'Pro monthly', 499, 'jpy', 'pro-monthly', 0, 0, datetime('now','-36 days'))").run();
  applyRenewalGrace(db, { now: Date.now(), log: () => {} });
  assert.equal(user(id).pro_expires_at, graceUntil(due), "precondition: renewal-grace extended the late renewal");

  const monthly = txn({ originalTransactionId: "ap-late", transactionId: "ap-late", productId: "me.colorarchive.pro.monthly", expiresDate: iso(Date.now() - 2 * DAY) });
  db.prepare("INSERT INTO apple_purchases (user_id, product_id, original_transaction_id, transaction_date, environment, expires_date, status) VALUES (?, ?, 'ap-late', ?, 'Production', ?, 'active')").run(id, monthly.productId, iso(Date.now() - 32 * DAY), monthly.expiresDate);
  await notify("EXPIRED", monthly);
  assert.equal(user(id).tier, "pro");
  assert.equal(user(id).pro_expires_at, graceUntil(due), "the App Store expiry shortened renewal-grace's extension");
});


test("a manual lifetime grant survives: App Store lifetime bought by mistake, then an LS monthly, then Apple refunds the lifetime", async () => {
  // Round 9 (2026-09-27): the LS checkout counted the App Store lifetime as a PURCHASED
  // one and overwrote the plan column — the manual grant's only record — so Apple's
  // later refund ended the grant with the monthly.
  reset();
  const { hasLifetimeEntitlement } = require("../lifetime");
  const id = addUser("manual-ls@example.com", { tier: "pro", subscription_plan: "lifetime" });
  const mistake = txn({ originalTransactionId: "lm-3", transactionId: "lm-3", productId: "me.colorarchive.pro.lifetime", expiresDate: null });
  await sync(id, mistake);
  await callRoute(lsWebhook, "post", "/subscription-checkout", {
    body: {
      email: "manual-ls@example.com", plan: "monthly", subscriptionId: "sub_mls", provider: "lemonsqueezy", customerId: "cus_mls",
      status: "active", renewsAt: iso(Date.now() + 20 * DAY), testMode: false,
    },
  });
  await notify("REFUND", mistake);
  assert.equal(hasLifetimeEntitlement(db, id), true, "the manual lifetime grant was lost");
  assert.deepEqual([user(id).tier, user(id).pro_expires_at], ["pro", null]);
});
