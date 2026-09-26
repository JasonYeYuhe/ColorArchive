/**
 * Refunding the LIFETIME order itself must revoke Pro.
 *
 * Found by review on 2026-09-24, present since the lifetime key was added to the
 * refund FLAG in /subscription-revoke: the flag UPDATE knew `lifetime_<order id>`,
 * the "is this a Pro order?" lookup two lines below did not, and the lifetime
 * insert writes no payment_intent — so order_refunded flagged the row and then
 * decided there was nothing to downgrade. ¥19,999 back in the customer's pocket,
 * Pro kept for good, effectiveTier() never able to expire a NULL clock.
 *
 * Runs the real handlers with the exact bodies app/api/webhook/route.ts forwards.
 */

require("./support/route-harness").install();

const test = require("node:test");
const assert = require("node:assert");

const db = require("../db");
const router = require("../routes/webhook");
const { callRoute } = require("./support/route-harness");
const { effectiveTier } = require("../entitlement");

const post = (path, body) => callRoute(router, "post", path, { body });
const reset = () => {
  // children before users (foreign keys are ON): the Apple cases leave apple_purchases rows
  for (const t of ["apple_revoked_transactions", "apple_purchases", "sessions", "magic_link_tokens", "orders", "subscribers", "users"]) db.exec(`DELETE FROM ${t}`);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users").get().n, 0, "reset() did not empty users");
};
const user = (email) => db.prepare("SELECT id, tier, pro_expires_at FROM users WHERE email = ?").get(email);

function buyLifetime(email, lsOrderId) {
  // order_created → /subscription-checkout, as route.ts forwards it
  return post("/subscription-checkout", {
    email, plan: "lifetime", subscriptionId: `lifetime_${lsOrderId}`, provider: "lemonsqueezy",
    customerId: `cus_${email}`, amount: 1999900, currency: "JPY", testMode: false,
  });
}
function refundOrder(email, lsOrderId) {
  // order_refunded → /subscription-revoke, as route.ts forwards it (an order has no subscription_id)
  return post("/subscription-revoke", { email, reason: "order_refunded", lsId: String(lsOrderId), subscriptionId: "", customerId: `cus_${email}` });
}

test("refunding the lifetime order revokes Pro", () => {
  reset();
  assert.equal(buyLifetime("life@x.com", 555).code, 200);
  assert.deepEqual([user("life@x.com").tier, user("life@x.com").pro_expires_at], ["pro", null], "precondition: lifetime granted with no expiry");

  const out = refundOrder("life@x.com", 555);
  assert.equal(out.code, 200);
  assert.equal(out.body.downgraded, true);
  const u = user("life@x.com");
  assert.equal(u.tier, "free");
  assert.equal(effectiveTier({ tier: u.tier, proExpiresAt: u.pro_expires_at }).tier, "free");
  assert.equal(db.prepare("SELECT refunded FROM orders WHERE order_id = 'lifetime_555'").get().refunded, 1);
});

test("controls: a pack refund does not touch an unrelated subscription, and a subscription-invoice refund does not touch a lifetime", () => {
  reset();
  // an active monthly subscriber with a refunded non-Pro order
  post("/subscription-checkout", { email: "sub@x.com", plan: "monthly", subscriptionId: "sub_1", provider: "lemonsqueezy", customerId: "cus_sub@x.com", status: "active", renewsAt: new Date(Date.now() + 20 * 86400000).toISOString(), testMode: false });
  db.prepare("INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test) VALUES ('lsord_777', 'sub@x.com', 'Pack', 900, 'jpy', 'pack-x', 0, 0)").run();
  assert.equal(refundOrder("sub@x.com", 777).body.downgraded, false);
  assert.equal(user("sub@x.com").tier, "pro");

  // a lifetime holder whose separate monthly invoice is refunded keeps the lifetime
  buyLifetime("both@x.com", 556);
  db.prepare("INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test) VALUES ('lsinv_888', 'both@x.com', 'Pro monthly', 499, 'jpy', 'pro-monthly', 0, 0)").run();
  const out = post("/subscription-revoke", { email: "both@x.com", reason: "subscription_payment_refunded", lsId: "888", subscriptionId: "sub_both", customerId: "cus_both@x.com" });
  assert.equal(out.body.downgraded, false);
  assert.deepEqual([user("both@x.com").tier, user("both@x.com").pro_expires_at], ["pro", null]);
});

test("refunding the lifetime does not take a separately paid, still-running subscription with it", () => {
  reset();
  const DAY = 86400000;
  const periodEnd = new Date(Date.now() + 20 * DAY).toISOString();
  post("/subscription-checkout", { email: "both2@x.com", plan: "monthly", subscriptionId: "sub_b2", provider: "lemonsqueezy", customerId: "cus_both2@x.com", status: "active", renewsAt: periodEnd, testMode: false });
  post("/subscription-payment", { email: "both2@x.com", invoiceId: "inv_b2", subscriptionId: "sub_b2", customerId: "cus_both2@x.com", amountMinor: 49900, currency: "JPY", billingReason: "initial" });
  buyLifetime("both2@x.com", 557);
  assert.equal(user("both2@x.com").pro_expires_at, null, "precondition: lifetime made the clock undated");

  const out = refundOrder("both2@x.com", 557);
  assert.equal(out.body.downgraded, true, "the lifetime itself is revoked");
  const u = db.prepare("SELECT tier, pro_expires_at, subscription_status FROM users WHERE email = 'both2@x.com'").get();
  assert.equal(u.tier, "pro", "the ¥499 month that was never refunded was taken away");
  // what the account holds without the lifetime: the later of renewal + grace and the payment's 35-day horizon
  const invoiceAt = db.prepare("SELECT created_at FROM orders WHERE order_id = 'lsinv_inv_b2'").get().created_at;
  const horizon = Date.parse(`${invoiceAt.replace(" ", "T")}Z`) + 35 * DAY;
  assert.equal(u.pro_expires_at, new Date(Math.max(Date.parse(periodEnd) + 3 * DAY, horizon)).toISOString());
  assert.equal(u.subscription_status, "active", "the subscription's status must survive, or renewal-grace and the digest lose sight of them");
  assert.equal(db.prepare("SELECT refunded FROM orders WHERE order_id = 'lifetime_557'").get().refunded, 1);
  assert.equal(db.prepare("SELECT refunded FROM orders WHERE order_id = 'lsinv_inv_b2'").get().refunded, 0);
});

test("a REFUNDED subscription does not come back through the lifetime refund (the users row still looks alive, its money is gone)", () => {
  reset();
  const DAY = 86400000;
  const periodEnd = new Date(Date.now() + 300 * DAY).toISOString();
  post("/subscription-checkout", { email: "yr@x.com", plan: "yearly", subscriptionId: "sub_y", provider: "lemonsqueezy", customerId: "cus_yr@x.com", status: "active", renewsAt: periodEnd, testMode: false });
  post("/subscription-payment", { email: "yr@x.com", invoiceId: "inv_y", subscriptionId: "sub_y", customerId: "cus_yr@x.com", amountMinor: 399900, currency: "JPY", billingReason: "initial" });
  post("/subscription-revoke", { email: "yr@x.com", reason: "subscription_payment_refunded", lsId: "inv_y", subscriptionId: "sub_y", customerId: "cus_yr@x.com" });
  assert.equal(user("yr@x.com").tier, "free", "precondition: the yearly refund revoked");

  buyLifetime("yr@x.com", 559);
  assert.equal(db.prepare("SELECT subscription_status FROM users WHERE email = 'yr@x.com'").get().subscription_status, "subscription_payment_refunded",
    "the lifetime checkout forged 'active' over the refunded subscription's status — the root of five review findings");
  refundOrder("yr@x.com", 559);
  const u = db.prepare("SELECT tier, pro_expires_at FROM users WHERE email = 'yr@x.com'").get();
  assert.equal(u.tier, "free", "¥3,999 and ¥19,999 both returned, yet Pro for the rest of the year");
  assert.equal(u.pro_expires_at, null);
});

test("an Apple subscriber who buys and refunds a Lemon Squeezy lifetime keeps the App Store month they paid for", () => {
  reset();
  const DAY = 86400000;
  const { grantApplePurchase } = require("../apple-grant");
  db.prepare("INSERT INTO users (email) VALUES ('ios@x.com')").run();
  const id = user("ios@x.com").id;
  const appleUntil = new Date(Date.now() + 25 * DAY).toISOString();
  grantApplePurchase(db, { userId: id, productId: "me.colorarchive.pro.monthly", txnId: "t-ios", transactionId: "t-ios", expiresDate: appleUntil, environment: "Production", verified: true });
  buyLifetime("ios@x.com", 560);
  assert.equal(db.prepare("SELECT payment_provider FROM users WHERE id = ?").get(id).payment_provider, "apple", "a lifetime purchase must not take the row away from the subscription on it");

  refundOrder("ios@x.com", 560);
  const u = db.prepare("SELECT tier, pro_expires_at, payment_provider FROM users WHERE id = ?").get(id);
  assert.equal(u.tier, "pro", "the paid App Store month was taken away with the refunded lifetime");
  assert.equal(u.pro_expires_at, new Date(Date.parse(appleUntil) + 3 * DAY).toISOString());
  assert.equal(u.payment_provider, "apple", "the row must say who actually governs access now");
});

test("the survivor of a lifetime refund is not 'money returned' to refund-guard, so renewal-grace can still extend them", () => {
  reset();
  const DAY = 86400000, HOUR = 3600000;
  const { moneyWasReturned } = require("../refund-guard");
  const { applyRenewalGrace } = require("../renewal-grace");
  post("/subscription-checkout", { email: "surv@x.com", plan: "monthly", subscriptionId: "sub_s", provider: "lemonsqueezy", customerId: "cus_surv@x.com", status: "active", renewsAt: new Date(Date.now() + 20 * DAY).toISOString(), testMode: false });
  post("/subscription-payment", { email: "surv@x.com", invoiceId: "inv_s", subscriptionId: "sub_s", customerId: "cus_surv@x.com", amountMinor: 49900, currency: "JPY", billingReason: "initial" });
  buyLifetime("surv@x.com", 561);
  refundOrder("surv@x.com", 561);
  const id = user("surv@x.com").id;
  assert.equal(user("surv@x.com").tier, "pro");
  assert.equal(moneyWasReturned(db, id), false, "a refunded LIFETIME made the paid subscription look refunded");

  // ...and when Lemon Squeezy is then late with the next charge, renewal-grace extends them like anyone else.
  const NOW = Date.now();
  db.prepare("UPDATE users SET subscription_current_period_end = ?, pro_expires_at = ? WHERE id = ?").run(new Date(NOW - 2.5 * DAY).toISOString(), new Date(NOW + 18 * HOUR).toISOString(), id);
  assert.equal(applyRenewalGrace(db, { now: NOW, log: () => {} }).length, 1, "renewal-grace skipped the survivor as 'money returned'");
});

test("a row from before the renewal date was recorded (period_end NULL) still keeps its paid month", () => {
  reset();
  const DAY = 86400000;
  post("/subscription-checkout", { email: "old@x.com", plan: "monthly", subscriptionId: "sub_o", provider: "lemonsqueezy", customerId: "cus_old@x.com", status: "active", testMode: false }); // no renewsAt: the pre-2026-09-24 shape
  post("/subscription-payment", { email: "old@x.com", invoiceId: "inv_o", subscriptionId: "sub_o", customerId: "cus_old@x.com", amountMinor: 49900, currency: "JPY", billingReason: "initial" });
  assert.equal(db.prepare("SELECT subscription_current_period_end AS c FROM users WHERE email = 'old@x.com'").get().c, null, "precondition");
  buyLifetime("old@x.com", 562);
  refundOrder("old@x.com", 562);
  const u = db.prepare("SELECT tier, pro_expires_at, payment_provider FROM users WHERE email = 'old@x.com'").get();
  assert.equal(u.tier, "pro", "the paid month was revoked because the renewal date was never recorded");
  const invoiceAt = db.prepare("SELECT created_at FROM orders WHERE order_id = 'lsinv_inv_o'").get().created_at;
  const expected = new Date(Date.parse(`${invoiceAt.replace(" ", "T")}Z`) + 35 * DAY).toISOString();
  assert.equal(u.pro_expires_at, expected, "clock rebuilt from the invoice with the payment handler's own 35-day horizon");
  assert.equal(u.payment_provider, "lemonsqueezy");
});

test("an Apple subscriber with a Lemon Squeezy TRIAL running is not handed to Apple: a later Apple expiry must not be able to downgrade the LS customer", () => {
  reset();
  const DAY = 86400000;
  const { grantApplePurchase, appleGovernsAccess } = require("../apple-grant");
  db.prepare("INSERT INTO users (email) VALUES ('mix@x.com')").run();
  const id = user("mix@x.com").id;
  const appleUntil = new Date(Date.now() + 25 * DAY).toISOString();
  grantApplePurchase(db, { userId: id, productId: "me.colorarchive.pro.monthly", txnId: "t-mix", transactionId: "t-mix", expiresDate: appleUntil, environment: "Production", verified: true });
  post("/subscription-checkout", { email: "mix@x.com", plan: "monthly", subscriptionId: "sub_m", provider: "lemonsqueezy", customerId: "cus_mix@x.com", status: "on_trial", trialEndsAt: new Date(Date.now() + 3 * DAY).toISOString(), renewsAt: new Date(Date.now() + 3 * DAY).toISOString(), testMode: false });
  buyLifetime("mix@x.com", 563);
  refundOrder("mix@x.com", 563);
  const u = db.prepare("SELECT tier, pro_expires_at, payment_provider FROM users WHERE id = ?").get(id);
  assert.equal(u.tier, "pro");
  assert.equal(u.pro_expires_at, new Date(Date.parse(appleUntil) + 3 * DAY).toISOString(), "the Apple month is what is paid right now");
  assert.equal(u.payment_provider, "lemonsqueezy", "the LS trial is still on this row: handing it to Apple is one-way and later locks out a paying LS customer");
  assert.equal(appleGovernsAccess(db, id), false, "an Apple EXPIRED must not be able to write free/NULL over the LS subscription");
});

test("a lifetime bought on a row with a subscription leaves that subscription's status, provider and ids alone; a fresh buyer still gets a full row", () => {
  reset();
  const DAY = 86400000;
  post("/subscription-checkout", { email: "keep@x.com", plan: "monthly", subscriptionId: "sub_k", provider: "lemonsqueezy", customerId: "cus_keep@x.com", status: "active", renewsAt: new Date(Date.now() + 20 * DAY).toISOString(), testMode: false });
  db.prepare("UPDATE users SET subscription_status = 'cancelled', subscription_cancel_at_period_end = 1 WHERE email = 'keep@x.com'").run();
  buyLifetime("keep@x.com", 564);
  const k = db.prepare("SELECT tier, pro_expires_at, subscription_status AS st, payment_provider AS pp, provider_subscription_id AS psid, stripe_subscription_id AS ssid FROM users WHERE email = 'keep@x.com'").get();
  assert.deepEqual({ ...k }, { tier: "pro", pro_expires_at: null, st: "cancelled", pp: "lemonsqueezy", psid: "sub_k", ssid: "sub_k" });

  buyLifetime("fresh@x.com", 565);
  const f = db.prepare("SELECT tier, pro_expires_at, subscription_status AS st, payment_provider AS pp, provider_subscription_id AS psid FROM users WHERE email = 'fresh@x.com'").get();
  assert.deepEqual({ ...f }, { tier: "pro", pro_expires_at: null, st: "active", pp: "lemonsqueezy", psid: "lifetime_565" });
});

test("a CANCELLED subscription that survives a lifetime refund stays cancelled, so renewal-grace never extends it", () => {
  reset();
  const DAY = 86400000, HOUR = 3600000;
  const { applyRenewalGrace } = require("../renewal-grace");
  const periodEnd = new Date(Date.now() + 20 * DAY).toISOString();
  post("/subscription-checkout", { email: "cx@x.com", plan: "monthly", subscriptionId: "sub_cx", provider: "lemonsqueezy", customerId: "cus_cx@x.com", status: "active", renewsAt: periodEnd, testMode: false });
  post("/subscription-payment", { email: "cx@x.com", invoiceId: "inv_cx", subscriptionId: "sub_cx", customerId: "cus_cx@x.com", amountMinor: 49900, currency: "JPY", billingReason: "initial" });
  post("/subscription-cancelled", { subscriptionId: "sub_cx", customerId: "cus_cx@x.com", endsAt: periodEnd });
  buyLifetime("cx@x.com", 566);
  refundOrder("cx@x.com", 566);
  const u = db.prepare("SELECT id, tier, pro_expires_at, subscription_status AS st FROM users WHERE email = 'cx@x.com'").get();
  assert.equal(u.tier, "pro", "the paid remainder of the cancelled month is kept");
  assert.equal(u.st, "cancelled");
  // LS never sends subscription_expired; 1.5 days after the period end renewal-grace looks at the row:
  const later = Date.parse(periodEnd) + 1.5 * DAY;
  db.prepare("UPDATE users SET pro_expires_at = ? WHERE id = ?").run(new Date(later + 20 * HOUR).toISOString(), u.id);
  assert.equal(applyRenewalGrace(db, { now: later, log: () => {} }).length, 0, "a subscription that will never renew was given 7 more days");
});

// ---- round 6 (2026-09-26): a paying LS subscription that is merely late, on trial, or paused ----

function lsMonthly(email, { status = "active", renewsAt, invoiceDaysAgo = 30 } = {}) {
  post("/subscription-checkout", { email, plan: "monthly", subscriptionId: `sub_${email}`, provider: "lemonsqueezy", customerId: `cus_${email}`, status, renewsAt, testMode: false });
  if (invoiceDaysAgo !== null) {
    db.prepare(`INSERT INTO orders (order_id, email, product, amount, currency, pack_id, refunded, is_test, created_at)
                VALUES (?, ?, 'Pro monthly', 499, 'jpy', 'pro-monthly', 0, 0, datetime('now', ?))`).run(`lsinv_${email}`, email, `-${invoiceDaysAgo} days`);
  }
  return user(email).id;
}

test("a lifetime refund during a Lemon Squeezy TRIAL keeps the trial", () => {
  reset();
  const DAY = 86400000;
  const trialEnd = new Date(Date.now() + 2 * DAY).toISOString();
  const id = lsMonthly("tr@x.com", { status: "on_trial", renewsAt: trialEnd, invoiceDaysAgo: null });
  buyLifetime("tr@x.com", 572);
  refundOrder("tr@x.com", 572);
  const u = db.prepare("SELECT tier, pro_expires_at, subscription_status AS st FROM users WHERE id = ?").get(id);
  assert.equal(u.tier, "pro");
  assert.equal(u.st, "on_trial");
  assert.equal(u.pro_expires_at, new Date(Date.parse(trialEnd) + 3 * DAY).toISOString());
});

test("a PAUSED Lemon Squeezy subscription is not handed to Apple by a lifetime refund, so after LS resumes an Apple expiry cannot lock the payer out", () => {
  reset();
  const DAY = 86400000;
  const { grantApplePurchase, appleGovernsAccess } = require("../apple-grant");
  const id = lsMonthly("pz@x.com", { renewsAt: new Date(Date.now() + 20 * DAY).toISOString() });
  grantApplePurchase(db, { userId: id, productId: "me.colorarchive.pro.monthly", txnId: "t-pz", transactionId: "t-pz", expiresDate: new Date(Date.now() + 25 * DAY).toISOString(), environment: "Production", verified: true });
  buyLifetime("pz@x.com", 573);
  db.prepare("UPDATE users SET subscription_status = 'paused' WHERE id = ?").run(id);
  refundOrder("pz@x.com", 573);
  assert.equal(db.prepare("SELECT payment_provider AS pp FROM users WHERE id = ?").get(id).pp, "lemonsqueezy", "a paused LS subscription can come back; the row must stay with it");
  assert.equal(db.prepare("SELECT tier FROM users WHERE id = ?").get(id).tier, "pro", "the App Store month is paid and running");
  // LS resumes:
  db.prepare("UPDATE users SET subscription_status = 'active' WHERE id = ?").run(id);
  assert.equal(appleGovernsAccess(db, id), false, "an Apple EXPIRED would now downgrade a paying LS customer");
});

test("both still paid (live LS monthly and a longer App Store yearly): the later clock is kept", () => {
  reset();
  const DAY = 86400000;
  const { grantApplePurchase } = require("../apple-grant");
  const lsDue = new Date(Date.now() + 20 * DAY).toISOString();
  const id = lsMonthly("two@x.com", { renewsAt: lsDue });
  const appleUntil = new Date(Date.now() + 300 * DAY).toISOString();
  grantApplePurchase(db, { userId: id, productId: "me.colorarchive.pro.yearly", txnId: "t-two", transactionId: "t-two", expiresDate: appleUntil, environment: "Production", verified: true });
  buyLifetime("two@x.com", 574);
  refundOrder("two@x.com", 574);
  const u = db.prepare("SELECT tier, pro_expires_at, payment_provider AS pp FROM users WHERE id = ?").get(id);
  assert.equal(u.pro_expires_at, new Date(Date.parse(appleUntil) + 3 * DAY).toISOString(), "the paid App Store year was cut to the LS month");
  assert.equal(u.pp, "lemonsqueezy");
});

test("a lifetime refund delivered twice changes nothing the second time (no gap until renewal-grace runs again)", () => {
  reset();
  const DAY = 86400000, HOUR = 3600000;
  const { applyRenewalGrace, graceUntil } = require("../renewal-grace");
  const due = new Date(Date.now() - 6 * DAY).toISOString(); // LS late to charge; renewal-grace territory
  const id = lsMonthly("twice@x.com", { renewsAt: due, invoiceDaysAgo: 36 }); // paid a month before the renewal
  buyLifetime("twice@x.com", 576);
  refundOrder("twice@x.com", 576);
  applyRenewalGrace(db, { now: Date.now(), log: () => {} });
  const extended = db.prepare("SELECT tier, pro_expires_at FROM users WHERE id = ?").get(id);
  assert.deepEqual([extended.tier, extended.pro_expires_at], ["pro", graceUntil(due)], "precondition: renewal-grace extended the late renewal");

  const again = refundOrder("twice@x.com", 576); // LS retry / dashboard resend
  assert.equal(again.body.alreadyRefunded, true);
  const after = db.prepare("SELECT tier, pro_expires_at FROM users WHERE id = ?").get(id);
  assert.deepEqual([after.tier, after.pro_expires_at], [extended.tier, extended.pro_expires_at], "the re-delivered refund rewound renewal-grace's extension");
});

// The full invariant — a refunded lifetime leaves the account as it would be without it —
// is checked differentially over 22 scenarios × 2 orderings in lifetime-refund-invariant.test.js.
// The tests above pin specific mechanisms; where they and that file ever disagree, that file wins.
