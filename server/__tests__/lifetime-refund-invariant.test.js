/**
 * INVARIANT: a refunded lifetime leaves the account as it would be had the lifetime
 * never been bought.
 *
 * Checked differentially rather than case by case. Every scenario is a timed script
 * of real webhook bodies (the ones app/api/webhook/route.ts forwards), App Store
 * grants and real App Store notifications (routes/apple-notifications.js, only the
 * JWS layer stubbed), run twice on the real handlers and schema:
 *   TWIN      — the script alone;
 *   DETOUR    — the same script with an LS lifetime bought (at the start, at the end,
 *               or at a marked point) and then refunded now.
 * Steps dated after now run in BOTH arms while the walk passes them (events that
 * arrive after the refund); `detourAfter` steps run in the DETOUR only (the
 * lifetime's own events re-delivered). Both arms then walk 40 days in 12-hour steps,
 * renewal-grace running at each step as its hourly scheduler would, and at every step:
 *   - no lock-out:     if the TWIN has Pro, the DETOUR has Pro;
 *   - no unpaid grant: if the DETOUR has Pro, the TWIN has Pro — or an unrefunded,
 *                      unexpired App Store purchase pays for it (see TWIN_GAPS);
 * and right after the refund: identical payment_provider, identical
 * appleGovernsAccess(), identical subscription status (detour at the end), and at the
 * end identical filing of every non-lifetime order (monthly vs yearly).
 *
 * Why this file exists: seven review rounds (2026-09-24..27) of case-by-case tests
 * each found the previous version of this path wrong in a new way. Point tests encode
 * what the author thought of; this encodes what "correct" means. Round 8 searched for
 * counterexamples against it; the scenarios marked R8 are the ones it found.
 *
 * TWIN_GAPS: the TWIN itself is wrong in two places, both pre-existing and outside
 * this path — a Lemon Squeezy event writes tier='free' with no regard for a paid App
 * Store subscription, and an LS trial checkout overwrites an App Store clock. There the
 * DETOUR may keep access the TWIN lost, but only access an App Store purchase pays for.
 *
 * KNOWN (reported as TODO, not failures): pre-existing behaviour outside this change
 * that the invariant still exposes. Each names its reason; none is made worse here.
 */

require("./support/route-harness").install();

const Module = require("node:module");
let nextTxn = null;
let nextNotification = null;
{
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
}

const test = require("node:test");
const assert = require("node:assert");

const db = require("../db");
const router = require("../routes/webhook");
const { callRoute, callRouteChain } = require("./support/route-harness");
const notificationsRouter = require("../routes/apple-notifications");
const { grantApplePurchase, appleGovernsAccess } = require("../apple-grant");
const { applyRenewalGrace } = require("../renewal-grace");
const { effectiveTier } = require("../entitlement");

const DAY = 86400000;
const HOUR = 3600000;
const MIN = 60000;
const iso = (ms) => new Date(ms).toISOString();
const sqlTime = (ms) => iso(ms).replace("T", " ").slice(0, 19);
const post = (path, body) => callRoute(router, "post", path, { body });

function reset() {
  for (const t of ["apple_revoked_transactions", "apple_unlinked_transactions", "apple_purchases", "sessions", "magic_link_tokens", "orders", "subscribers", "users"]) {
    db.exec(`DELETE FROM ${t}`);
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users").get().n, 0, "reset() did not empty users");
}

/** Run fn as if the wall clock read `at` (handlers read Date.now()). */
function atTime(at, fn) {
  const real = Date.now;
  Date.now = () => at;
  try {
    return fn();
  } finally {
    Date.now = real;
  }
}

async function atTimeAsync(at, fn) {
  const real = Date.now;
  Date.now = () => at;
  try {
    return await fn();
  } finally {
    Date.now = real;
  }
}

const userId = (email) => {
  let u = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (!u) {
    db.prepare("INSERT INTO users (email) VALUES (?)").run(email);
    u = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  }
  return u.id;
};

// ---- building blocks: each is a real handler call with a real payload shape ----

const ls = {
  checkout: (e, t, { status = "active", renewsAt, trialEndsAt, plan = "monthly" }) =>
    post("/subscription-checkout", {
      email: e, plan, subscriptionId: `sub_${e}`, provider: "lemonsqueezy", customerId: `cus_${e}`,
      status, renewsAt: renewsAt === undefined ? undefined : iso(renewsAt), trialEndsAt: trialEndsAt === undefined ? undefined : iso(trialEndsAt), testMode: false,
    }),
  pay: (e, t, { invoice, amountMinor = 49900 }) => {
    post("/subscription-payment", { email: e, invoiceId: invoice, subscriptionId: `sub_${e}`, customerId: `cus_${e}`, amountMinor, currency: "JPY", billingReason: "renewal" });
    db.prepare("UPDATE orders SET created_at = ? WHERE order_id = ?").run(sqlTime(t), `lsinv_${invoice}`);
  },
  // subscription_updated exactly as route.ts forwards it, with LS updated_at (= the event time unless given)
  update: (e, t, { status, renewsAt, endsAt = null, updatedAt = t }) =>
    post("/subscription-updated", { subscriptionId: `sub_${e}`, customerId: `cus_${e}`, status, renewsAt: iso(renewsAt), endsAt: endsAt === null ? null : iso(endsAt), updatedAt: iso(updatedAt), provider: "lemonsqueezy", testMode: false }),
  cancel: (e, t, { endsAt }) => post("/subscription-cancelled", { subscriptionId: `sub_${e}`, customerId: `cus_${e}`, endsAt: iso(endsAt) }),
  expire: (e) => post("/subscription-cancelled", { subscriptionId: `sub_${e}`, customerId: `cus_${e}`, reason: "expired" }),
  refundInvoice: (e, t, { invoice }) =>
    post("/subscription-revoke", { email: e, reason: "subscription_payment_refunded", lsId: invoice, subscriptionId: `sub_${e}`, customerId: `cus_${e}` }),
};
// a second LS subscription on the same customer (another subscription id)
const ls2 = {
  checkout: (e, t, { sid, status = "active", renewsAt, trialEndsAt, plan = "monthly" }) =>
    post("/subscription-checkout", {
      email: e, plan, subscriptionId: `${sid}_${e}`, provider: "lemonsqueezy", customerId: `cus_${e}`,
      status, renewsAt: renewsAt === undefined ? undefined : iso(renewsAt), trialEndsAt: trialEndsAt === undefined ? undefined : iso(trialEndsAt), testMode: false,
    }),
  pay: (e, t, { sid, invoice, amountMinor = 49900 }) => {
    post("/subscription-payment", { email: e, invoiceId: invoice, subscriptionId: `${sid}_${e}`, customerId: `cus_${e}`, amountMinor, currency: "JPY", billingReason: "renewal" });
    db.prepare("UPDATE orders SET created_at = ? WHERE order_id = ?").run(sqlTime(t), `lsinv_${invoice}`);
  },
  update: (e, t, { sid, status, renewsAt, endsAt = null }) =>
    post("/subscription-updated", { subscriptionId: `${sid}_${e}`, customerId: `cus_${e}`, status, renewsAt: iso(renewsAt), endsAt: endsAt === null ? null : iso(endsAt), updatedAt: iso(t), provider: "lemonsqueezy", testMode: false }),
  expire: (e, t, { sid }) => post("/subscription-cancelled", { subscriptionId: `${sid}_${e}`, customerId: `cus_${e}`, reason: "expired", updatedAt: iso(t) }),
  refundInvoice: (e, t, { sid, invoice }) =>
    post("/subscription-revoke", { email: e, reason: "subscription_payment_refunded", lsId: invoice, subscriptionId: `${sid}_${e}`, customerId: `cus_${e}` }),
};
const apple = {
  buy: (e, t, { expires, product = "me.colorarchive.pro.monthly", txn = `t_${e}` }) =>
    grantApplePurchase(db, { userId: userId(e), productId: product, txnId: txn, transactionId: txn, transactionDate: iso(t), expiresDate: iso(expires), environment: "Production", verified: true }),
  // what the REFUND notification leaves behind (routes/apple-notifications.js; covered by apple-grant.test.js)
  refund: (e, t, { txn = `t_${e}` }) => {
    db.prepare("UPDATE apple_purchases SET status = 'refunded' WHERE original_transaction_id = ?").run(txn);
    db.prepare("UPDATE users SET tier = 'free', pro_expires_at = NULL WHERE id = ? AND payment_provider = 'apple'").run(userId(e));
  },
};
// App Store: the real /apple-notifications/v2 handler, only the JWS layer stubbed (as apple-grant.test.js does).
apple.buyLifetime = (e, t, { txn = `tl_${e}` } = {}) =>
  grantApplePurchase(db, { userId: userId(e), productId: "me.colorarchive.pro.lifetime", txnId: txn, transactionId: txn, transactionDate: iso(t), expiresDate: null, environment: "Production", verified: true });
apple.notify = (e, t, type, { txn = `t_${e}`, transactionId = txn, subtype = null, product = "me.colorarchive.pro.monthly", expires = null, purchased = t } = {}) => {
  nextNotification = { notificationType: type, subtype, data: { signedTransactionInfo: "stubbed" } };
  nextTxn = {
    originalTransactionId: txn, transactionId, productId: product, purchaseDate: iso(purchased),
    expiresDate: expires === null ? null : iso(expires), environment: "Production", bundleId: "me.colorarchive.app", revocationDate: null,
  };
  return callRouteChain(notificationsRouter, "post", "/v2", { body: { signedPayload: "stubbed" } });
};
/** An LS yearly invoice paid at t (a real subscription_payment_success, filed by its created_at). */
const yearlyPay = (e, t, invoice, extra = {}) => {
  post("/subscription-payment", { email: e, invoiceId: invoice, subscriptionId: `sub_${e}`, customerId: `cus_${e}`, amountMinor: 399900, currency: "JPY", billingReason: "renewal", ...extra });
  db.prepare("UPDATE orders SET created_at = ? WHERE order_id = ?").run(sqlTime(t), `lsinv_${invoice}`);
};
const lifetime = {
  buy: (e, n) =>
    post("/subscription-checkout", { email: e, plan: "lifetime", subscriptionId: `lifetime_${n}`, provider: "lemonsqueezy", customerId: `cus_${e}`, amount: 1999900, currency: "JPY", testMode: false }),
  refund: (e, n, reason = "order_refunded") => post("/subscription-revoke", { email: e, reason, lsId: String(n), subscriptionId: "", customerId: `cus_${e}` }),
};

// ---- scenarios: [offset from now, action] ----
// P = the LS renewal date. Payments are dated where LS would make them (P - 30 days).

const SCENARIOS = {
  "nothing else on the account": () => [],
  "LS monthly, paid, renewing in 20 days": () => paidMonthly(20),
  "LS renewal 20 h overdue, LS late to charge": () => lateBy(20 * HOUR),
  "LS renewal 6 days overdue (renewal-grace territory)": () => lateBy(6 * DAY),
  "LS renewal 40 days overdue, expiry webhook missed": () => lateBy(40 * DAY),
  "LS past_due, card being retried": () => [...lateBy(11 * DAY), [-HOUR, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: NOW() - 11 * DAY })]],
  "LS trial, converting in 2 days": () => [[-DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: NOW() + 2 * DAY, trialEndsAt: NOW() + 2 * DAY })]],
  "LS cancelled, paid period runs 10 more days": () => {
    const P = NOW() + 10 * DAY;
    return [[-20 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P })], [-20 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })], [-HOUR, (e, t) => ls.cancel(e, t, { endsAt: P })]];
  },
  "LS cancelled, paid period over": () => {
    const P = NOW() - 5 * DAY;
    return [[-35 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P })], [-35 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })], [-7 * DAY, (e, t) => ls.cancel(e, t, { endsAt: P })]];
  },
  "LS paused": () => [...paidMonthly(20), [-HOUR, (e, t) => ls.update(e, t, { status: "paused", renewsAt: NOW() + 20 * DAY })]],
  "LS invoice refunded": () => [...paidMonthly(20), [-HOUR, (e, t) => ls.refundInvoice(e, t, { invoice: `i1_${e}` })]],
  "LS expired": () => [...paidMonthly(-5), [-2 * DAY, (e) => ls.expire(e)]],
  "App Store monthly, 25 days left": () => [[-5 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 25 * DAY })]],
  "App Store monthly expired yesterday (inside Apple's 3-day grace)": () => [[-30 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() - DAY })]],
  "App Store monthly refunded": () => [[-5 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 25 * DAY })], [-HOUR, (e, t) => apple.refund(e, t, {})]],
  "LS monthly paid + App Store yearly": () => [...paidMonthly(20), [-5 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 300 * DAY, product: "me.colorarchive.pro.yearly" })]],
  "LS trial + App Store monthly": () => [[-2 * DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: NOW() + 2 * DAY, trialEndsAt: NOW() + 2 * DAY })], [-DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 25 * DAY })]],
  "LS paused + App Store monthly": () => [...paidMonthly(20), [-5 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 25 * DAY })], [-HOUR, (e, t) => ls.update(e, t, { status: "paused", renewsAt: NOW() + 20 * DAY })]],
  "LS expiry missed 40 days ago + App Store yearly": () => [...lateBy(40 * DAY), [-5 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 300 * DAY, product: "me.colorarchive.pro.yearly" })]],
  "LS monthly from before renewal dates were recorded (no period end)": () => [[-10 * DAY, (e, t) => ls.checkout(e, t, {})], [-10 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })]],
  "LS monthly from before renewal dates were recorded, paid 50 days ago": () => [[-50 * DAY, (e, t) => ls.checkout(e, t, {})], [-50 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })]],
  "App Store monthly, then an LS monthly on top": () => [[-10 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 20 * DAY })], ...paidMonthly(25)],

  // ---------------- r8: App Store interplay ----------------
  "XLS2 LS yearly paid, renews after the refund (renewal invoice carries no plan)": () => {
    const P = NOW() + 5 * DAY;
    return {
      steps: [
        [-360 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P, plan: "yearly" })],
        [-360 * DAY + MIN, (e, t) => { post("/subscription-payment", { email: e, invoiceId: `y1_${e}`, subscriptionId: `sub_${e}`, customerId: `cus_${e}`, plan: "yearly", amountMinor: 399900, currency: "JPY", billingReason: "initial" }); db.prepare("UPDATE orders SET created_at = ? WHERE order_id = ?").run(sqlTime(t), `lsinv_y1_${e}`); }],
      ],
      after: [[5 * DAY, (e, t) => { ls.pay(e, t, { invoice: `y2_${e}`, amountMinor: 399900 }); }, "yearly renewal payment (no subscription_updated yet)"]],
      only: ["end"],
    };
  },
  "APL13 LS monthly paid + App Store lifetime cancelled monthly (period runs), Apple refunds the App Store lifetime after": () => ({
    steps: [...paidMonthly(20), [-5 * DAY, (e, t) => apple.buyLifetime(e, t)], [-4 * DAY, (e, t) => ls.cancel(e, t, { endsAt: NOW() + 20 * DAY })]],
    after: [[2 * DAY, (e, t) => apple.notify(e, t, "REFUND", { txn: `tl_${e}`, product: "me.colorarchive.pro.lifetime" }), "Apple REFUND of the App Store lifetime"]],
  }),
  "XLS1 LS monthly paid + a second web lifetime (bought twice), which is refunded later": () => ({
    steps: [...paidMonthly(20), [-5 * DAY, (e) => lifetime.buy(e, 500000 + (Math.abs(hash(e)) % 90000))]],
    after: [[2 * DAY, (e) => lifetime.refund(e, 500000 + (Math.abs(hash(e)) % 90000)), "refund of the other web lifetime"]],
    only: ["end"],
  }),
  "APL1 App Store lifetime (web lifetime bought too, web one refunded)": () => [[-5 * DAY, (e, t) => apple.buyLifetime(e, t)]],
  "APL2 App Store lifetime, Apple refunds it 2 days after the web refund": () => ({
    steps: [[-5 * DAY, (e, t) => apple.buyLifetime(e, t)]],
    after: [[2 * DAY, (e, t) => apple.notify(e, t, "REFUND", { txn: `tl_${e}`, product: "me.colorarchive.pro.lifetime" }), "Apple REFUND of the App Store lifetime"]],
  }),
  "APL3 LS monthly paid + App Store lifetime": () => [...paidMonthly(20), [-5 * DAY, (e, t) => apple.buyLifetime(e, t)]],
  "APL4 LS monthly paid + App Store lifetime, Apple refunds it after the web refund": () => ({
    steps: [...paidMonthly(20), [-5 * DAY, (e, t) => apple.buyLifetime(e, t)]],
    after: [[2 * DAY, (e, t) => apple.notify(e, t, "REFUND", { txn: `tl_${e}`, product: "me.colorarchive.pro.lifetime" }), "Apple REFUND of the App Store lifetime"]],
  }),
  "APL5 lapsed App Store monthly replayed by the app (records, grants nothing)": () => [[-3 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() - 20 * DAY })]],
  "APL6 LS monthly, lifetime upgrade, monthly cancelled + expired, then App Store monthly": () => {
    const P = NOW() - 10 * DAY;
    return [
      [-45 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: NOW() - 15 * DAY })],
      [-45 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })],
      [-15 * DAY, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
      [-15 * DAY + MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: NOW() + 15 * DAY })],
      [-14 * DAY, "LIFETIME"],
      [-13 * DAY, (e, t) => ls.cancel(e, t, { endsAt: NOW() + 15 * DAY })],
      [-5 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 25 * DAY })],
    ];
  },
  "APL6b LS monthly, lifetime upgrade, monthly expired, then App Store monthly": () => [
    ...paidMonthly(-5),
    [-34 * DAY, "LIFETIME"],
    [-30 * DAY, (e, t) => ls.cancel(e, t, { endsAt: NOW() - 5 * DAY })],
    [-4 * DAY, (e) => ls.expire(e)],
    [-3 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 27 * DAY })],
  ],
  "APL7 LS monthly + App Store yearly; lifetime; Apple refunds the yearly while the lifetime is held": () => [
    ...paidMonthly(20),
    [-6 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 300 * DAY, product: "me.colorarchive.pro.yearly" })],
    [-4 * DAY, "LIFETIME"],
    [-2 * DAY, (e, t) => apple.notify(e, t, "REFUND", { product: "me.colorarchive.pro.yearly", expires: NOW() + 300 * DAY })],
  ],
  "APL8 App Store monthly; DID_RENEW, then EXPIRED after the refund": () => ({
    steps: [[-20 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 10 * DAY })]],
    after: [
      [10 * DAY - HOUR, (e, t) => apple.notify(e, t, "DID_RENEW", { transactionId: `r1_${e}`, expires: NOW() + 40 * DAY, purchased: t }), "DID_RENEW"],
      [40 * DAY - 2 * DAY, (e, t) => apple.notify(e, t, "EXPIRED", { transactionId: `r1_${e}`, expires: NOW() + 40 * DAY }), "EXPIRED"],
    ],
  }),
  "APL9 App Store monthly; DID_FAIL_TO_RENEW (grace) then EXPIRED after the refund": () => ({
    steps: [[-28 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 2 * DAY })]],
    after: [
      [2 * DAY + HOUR, (e, t) => apple.notify(e, t, "DID_FAIL_TO_RENEW", { subtype: "GRACE_PERIOD", expires: NOW() + 2 * DAY }), "DID_FAIL_TO_RENEW/GRACE_PERIOD"],
      [6 * DAY, (e, t) => apple.notify(e, t, "DID_FAIL_TO_RENEW", { expires: NOW() + 2 * DAY }), "DID_FAIL_TO_RENEW"],
    ],
  }),
  "APL10 App Store monthly refunded during the lifetime, REFUND_REVERSED after": () => ({
    steps: [
      [-10 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 20 * DAY })],
      [-5 * DAY, "LIFETIME"],
      [-2 * DAY, (e, t) => apple.notify(e, t, "REFUND", { expires: NOW() + 20 * DAY })],
    ],
    after: [[3 * DAY, (e, t) => apple.notify(e, t, "REFUND_REVERSED", { expires: NOW() + 20 * DAY, purchased: NOW() - 10 * DAY }), "REFUND_REVERSED"]],
  }),
  "APL11 App Store monthly expired during the lifetime, SUBSCRIBED (resubscribe) after": () => ({
    steps: [
      [-40 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() - 10 * DAY })],
      [-20 * DAY, "LIFETIME"],
      [-10 * DAY + HOUR, (e, t) => apple.notify(e, t, "EXPIRED", { expires: NOW() - 10 * DAY })],
    ],
    after: [[4 * DAY, (e, t) => apple.notify(e, t, "SUBSCRIBED", { transactionId: `s2_${e}`, expires: NOW() + 34 * DAY, purchased: t }), "SUBSCRIBED"]],
  }),
  "APL12 App Store monthly bought during the lifetime, REFUND after the web refund": () => ({
    steps: [[-10 * DAY, "LIFETIME"], [-5 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 25 * DAY })]],
    after: [[3 * DAY, (e, t) => apple.notify(e, t, "REFUND", { expires: NOW() + 25 * DAY }), "REFUND"]],
  }),

  // ---------------- R8: LS events around and after the refund ----------------
  "R8 LS renewal 8 days overdue, LS late to charge": () => lateBy(8 * DAY),
  "R8 LS renewal 9.5 days overdue, LS late to charge": () => lateBy(9.5 * DAY),
  "R8 LS renewal 9.9 days overdue, LS late to charge": () => lateBy(9.9 * DAY),
  "R8 LS renewal 8 days overdue, renewal-grace already ran hourly before the lifetime": () => [
    ...lateBy(8 * DAY),
    ...[-72, -48, -24, -12, -2].map((h) => [h * HOUR, (e, t) => applyRenewalGrace(db, { now: t, log: () => {} })]),
  ],
  "R8 LS past_due for 3 days (renewal 4 days ago), card being retried": () => {
    const P = NOW() - 4 * DAY;
    return [...paidMonthly(-4), [-3 * DAY, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P })]];
  },
  "R8 LS trial ended a day ago, conversion not charged yet": () => [[-8 * DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: NOW() - DAY, trialEndsAt: NOW() - DAY })]],
  "R8 after: LS finally charges the 8-day-overdue renewal on day 2 (stale update, payment, corrected update)": () => {
    const P = NOW() - 8 * DAY;
    return [...lateBy(8 * DAY),
      [2 * DAY, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [2 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
      [2 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 30 * DAY })]];
  },
  "R8 after: monthly renews on day 20 (stale + corrected updates delivered out of order)": () => {
    const P = NOW() + 20 * DAY;
    return [...paidMonthly(20),
      [20 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
      [20 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 30 * DAY })],
      [20 * DAY + 3 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P, updatedAt: t - 2 * MIN })]];
  },
  "R8 after: customer cancels the monthly on day 1, expiry arrives on day 23": () => {
    const P = NOW() + 20 * DAY;
    return [...paidMonthly(20),
      [DAY, (e, t) => ls.cancel(e, t, { endsAt: P })],
      [DAY + 1000, (e, t) => ls.update(e, t, { status: "cancelled", renewsAt: P, endsAt: P })],
      [23 * DAY, (e) => ls.expire(e)]];
  },
  "R8 after: resumed after a pause": () => {
    const P = NOW() + 20 * DAY;
    return [...paidMonthly(20), [-HOUR, (e, t) => ls.update(e, t, { status: "paused", renewsAt: P })],
      [3 * DAY, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 3 * DAY })]];
  },
  "R8 after: renewal invoice refunded on day 21": () => {
    const P = NOW() + 20 * DAY;
    return [...paidMonthly(20),
      [20 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
      [20 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 30 * DAY })],
      [21 * DAY, (e, t) => ls.refundInvoice(e, t, { invoice: `i2_${e}` })]];
  },
  "R8 after: past_due, dunning fails, subscription expires on day 10": () => {
    const P = NOW() - 4 * DAY;
    return [...paidMonthly(-4), [-3 * DAY, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P })],
      [10 * DAY, (e, t) => ls.update(e, t, { status: "expired", renewsAt: P, endsAt: t })],
      [10 * DAY + MIN, (e) => ls.expire(e)]];
  },
  "R8 after: past_due recovered 2 days after the refund": () => [...lateBy(11 * DAY), [-HOUR, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: NOW() - 11 * DAY })],
    [2 * DAY, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })], [2 * DAY + MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: NOW() + 32 * DAY })]],
  "R8 after: cancelled (period runs 10 days), resumed after the refund": () => {
    const P = NOW() + 10 * DAY;
    return [[-20 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P })], [-20 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })], [-HOUR, (e, t) => ls.cancel(e, t, { endsAt: P })],
      [2 * DAY, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })]];
  },
  "R8 after: trial converts 4 days late": () => [[-DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: NOW() + 2 * DAY, trialEndsAt: NOW() + 2 * DAY })],
    [6 * DAY, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })], [6 * DAY + MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: NOW() + 36 * DAY })]],
  "R8 after: trial cancelled after the refund": () => [[-DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: NOW() + 2 * DAY, trialEndsAt: NOW() + 2 * DAY })],
    [DAY, (e, t) => ls.cancel(e, t, { endsAt: NOW() + 2 * DAY })]],
  "R8 after: resubscribes monthly on day 1; subscription_updated lands before subscription_created": () => {
    const P = NOW() + 31 * DAY;
    return [
      [DAY, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [DAY + 1000, (e, t) => post("/subscription-payment", { email: e, lsOrderId: `o9_${e}`, customerId: `cus_${e}`, plan: "monthly", amountMinor: 49900, currency: "JPY", billingReason: "initial" })],
      [DAY + 5000, (e, t) => ls.checkout(e, t, { renewsAt: P })],
    ];
  },
  "R8 invoice refunded, then a benign subscription_updated (refund-guard blind spot on both arms)": () => {
    const P = NOW() + 20 * DAY;
    return [...paidMonthly(20), [-2 * HOUR, (e, t) => ls.refundInvoice(e, t, { invoice: `i1_${e}` })], [-HOUR, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })]];
  },
  "R8 earlier subscription's invoice refunded, new LS trial now": () => {
    const PA = NOW() - 30 * DAY;
    return [
      [-60 * DAY, (e, t) => ls2.checkout(e, t, { sid: "subA", renewsAt: PA })],
      [-60 * DAY + MIN, (e, t) => ls2.pay(e, t, { sid: "subA", invoice: `iA_${e}` })],
      [-60 * DAY + 2 * MIN, (e, t) => ls2.update(e, t, { sid: "subA", status: "active", renewsAt: PA })],
      [-40 * DAY, (e, t) => ls2.refundInvoice(e, t, { sid: "subA", invoice: `iA_${e}` })],
      [-30 * DAY, (e, t) => ls2.expire(e, t, { sid: "subA" })],
      [-DAY, (e, t) => ls2.checkout(e, t, { sid: "subB", status: "on_trial", renewsAt: NOW() + 2 * DAY, trialEndsAt: NOW() + 2 * DAY })],
      [2 * DAY, (e, t) => ls2.pay(e, t, { sid: "subB", invoice: `iB_${e}` })],
      [2 * DAY + MIN, (e, t) => ls2.update(e, t, { sid: "subB", status: "active", renewsAt: NOW() + 32 * DAY })],
    ];
  },
  "R8 earlier subscription's invoice refunded, new LS subscription on a 100%-off code (no order row)": () => {
    const PA = NOW() - 30 * DAY;
    return [
      [-60 * DAY, (e, t) => ls2.checkout(e, t, { sid: "subA", renewsAt: PA })],
      [-60 * DAY + MIN, (e, t) => ls2.pay(e, t, { sid: "subA", invoice: `iA_${e}` })],
      [-40 * DAY, (e, t) => ls2.refundInvoice(e, t, { sid: "subA", invoice: `iA_${e}` })],
      [-30 * DAY, (e, t) => ls2.expire(e, t, { sid: "subA" })],
      [-5 * DAY, (e, t) => ls2.checkout(e, t, { sid: "subB", renewsAt: NOW() + 25 * DAY })],
      [-5 * DAY + MIN, (e, t) => ls2.pay(e, t, { sid: "subB", invoice: `iB_${e}`, amountMinor: 0 })],
      [-5 * DAY + 2 * MIN, (e, t) => ls2.update(e, t, { sid: "subB", status: "active", renewsAt: NOW() + 25 * DAY })],
    ];
  },
  "R8 LS monthly + a kept lifetime; the detour's lifetime is a second one; the kept one refunded an hour later": () => [
    ...paidMonthly(20),
    [-2 * DAY, (e) => lifetime.buy(e, 700000 + (Math.abs(hash(e)) % 90000))],
    [HOUR, (e) => lifetime.refund(e, 700000 + (Math.abs(hash(e)) % 90000))],
  ],
  "R8 LS monthly + a kept lifetime (no second refund)": () => [...paidMonthly(20), [-2 * DAY, (e) => lifetime.buy(e, 700000 + (Math.abs(hash(e)) % 90000))]],
  "R8 yearly renewing tomorrow; renewal after the refund, all three LS events delivered": () => {
    const P = NOW() + DAY;
    return [
      [P - 365 * DAY - NOW(), (e, t) => ls.checkout(e, t, { renewsAt: P, plan: "yearly" })],
      [P - 365 * DAY - NOW() + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}`, amountMinor: 399900 })],
      [P - 365 * DAY - NOW() + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [DAY, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}`, amountMinor: 399900 })],
      [DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 365 * DAY })],
    ];
  },
  "R8 yearly renewing tomorrow; renewal after the refund, corrected subscription_updated lost": () => {
    const P = NOW() + DAY;
    return [
      [P - 365 * DAY - NOW(), (e, t) => ls.checkout(e, t, { renewsAt: P, plan: "yearly" })],
      [P - 365 * DAY - NOW() + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}`, amountMinor: 399900 })],
      [P - 365 * DAY - NOW() + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [DAY, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}`, amountMinor: 399900 })],
    ];
  },
  "R8 yearly from before renewal dates were recorded, paid 50 days ago": () => [[-50 * DAY, (e, t) => ls.checkout(e, t, { plan: "yearly" })], [-50 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}`, amountMinor: 399900 })]],
  "R8 App Store monthly lapsed long ago, replayed by the app (recorded, grants nothing)": () => [[-5 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() - 40 * DAY })]],
  "R8 App Store monthly; LS subscription_updated for a new LS sub lands before its subscription_created": () => [
    [-5 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 25 * DAY })],
    [DAY, (e, t) => ls.update(e, t, { status: "on_trial", renewsAt: NOW() + 4 * DAY })],
  ],

  // ---------------- R8: the lifetime's own events re-delivered (DETOUR only) ----------------
  "R8 lifetime order_created re-delivered after its refund (nothing else)": () => ({ steps: [], detourAfter: [[HOUR, (e, t, n) => lifetime.buy(e, n)]] }),
  "R8 lifetime order_created re-delivered after its refund (LS monthly, paid)": () => ({ steps: paidMonthly(20), detourAfter: [[HOUR, (e, t, n) => lifetime.buy(e, n)]] }),
  "R8 lifetime order_refunded delivered again on day 4.5 (renewal 5 days overdue)": () => ({ steps: lateBy(5 * DAY), detourAfter: [[4.5 * DAY, (e, t, n) => lifetime.refund(e, n)]] }),
  "R8 lifetime order_refunded delivered again on days 2 and 4.5 (past_due since 3 days)": () => {
    const P = NOW() - 4 * DAY;
    return { steps: [...paidMonthly(-4), [-3 * DAY, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P })]],
      detourAfter: [[2 * DAY, (e, t, n) => lifetime.refund(e, n)], [4.5 * DAY, (e, t, n) => lifetime.refund(e, n)]] };
  },
  "R8 lifetime refunded as a dispute instead (dispute_created)": () => ({ steps: paidMonthly(20), reason: "dispute_created" }),

  // ---------------- R9: round 9's counterexamples (2026-09-27), and the variants it checked ----------------
  // A: an on-time renewal whose corrected subscription_updated was lost (the R8 assumption),
  // 12 days ago: the row still shows the old renewal date, the payment's horizon is live.
  "R9-A monthly renewed on time 12 days ago, corrected subscription_updated lost": () => {
    const P0 = NOW() - 12 * DAY;
    return {
      steps: [
        [P0 - 30 * DAY - NOW(), (e, t) => ls.checkout(e, t, { renewsAt: P0 })],
        [P0 - 30 * DAY - NOW() + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })],
        [P0 - 30 * DAY - NOW() + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P0 })],
        [P0 - NOW(), (e, t) => ls.update(e, t, { status: "active", renewsAt: P0 })], // stale one
        [P0 - NOW() + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
      ],
    };
  },
  "R9-A2 yearly renewed on time 12 days ago, corrected subscription_updated lost": () => {
    const P0 = NOW() - 12 * DAY;
    const s = P0 - 365 * DAY - NOW();
    return {
      steps: [
        [s, (e, t) => ls.checkout(e, t, { renewsAt: P0, plan: "yearly" })],
        [s + MIN, (e, t) => yearlyPay(e, t, `y1_${e}`, { plan: "yearly", billingReason: "initial" })],
        [s + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P0 })],
        [P0 - NOW(), (e, t) => ls.update(e, t, { status: "active", renewsAt: P0 })], // stale one
        [P0 - NOW() + MIN, (e, t) => yearlyPay(e, t, `y2_${e}`)],
      ],
    };
  },
  // B: LS 11 days late to charge; the customer updates their card today (subscription_updated,
  // status active, renews_at still the old date) — the handler's floor gives 3 days.
  "R9-B LS 11 days late to charge, card updated an hour ago": () => [
    ...lateBy(11 * DAY),
    [-HOUR, (e, t) => ls.update(e, t, { status: "active", renewsAt: NOW() - 11 * DAY })],
  ],
  // B2: LS finally charges an 11-day-overdue renewal an hour before the refund; corrected update lost
  "R9-B2 LS charges an 11-day-overdue renewal an hour ago, corrected update lost": () => {
    const P = NOW() - 11 * DAY;
    return [
      ...lateBy(11 * DAY),
      [-HOUR, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [-HOUR + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
    ];
  },
  // C: LS paused; App Store monthly bought during the pause (App Store then governs, provider
  // 'apple'); LS resumed later — subscription_updated never writes payment_provider.
  "R9-C LS paused, App Store monthly bought in the pause, LS resumed": () => {
    const P1 = NOW() - 10 * DAY;
    return [
      [-40 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P1 })],
      [-40 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })],
      [-40 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P1 })],
      [-30 * DAY, (e, t) => ls.update(e, t, { status: "paused", renewsAt: P1 })],
      [-25 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 5 * DAY })],
      [-DAY, (e, t) => ls.update(e, t, { status: "active", renewsAt: NOW() + 29 * DAY })],
      [-DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
    ];
  },
  // D: an earlier subscription's invoice refunded; a new trial, cancelled during the trial
  // (LS keeps access to ends_at). refund-guard's durable path still says "money returned".
  "R9-D earlier subscription's invoice refunded, new LS trial cancelled mid-trial": () => {
    const PA = NOW() - 30 * DAY;
    const TE = NOW() + 4 * DAY;
    return {
      steps: [
      [-60 * DAY, (e, t) => ls2.checkout(e, t, { sid: "subA", renewsAt: PA })],
      [-60 * DAY + MIN, (e, t) => ls2.pay(e, t, { sid: "subA", invoice: `iA_${e}` })],
      [-60 * DAY + 2 * MIN, (e, t) => ls2.update(e, t, { sid: "subA", status: "active", renewsAt: PA })],
      [-40 * DAY, (e, t) => ls2.refundInvoice(e, t, { sid: "subA", invoice: `iA_${e}` })],
      [-30 * DAY, (e, t) => ls2.expire(e, t, { sid: "subA" })],
      [-3 * DAY, (e, t) => ls2.checkout(e, t, { sid: "subB", status: "on_trial", renewsAt: TE, trialEndsAt: TE })],
      [-DAY, (e, t) => post("/subscription-cancelled", { subscriptionId: `subB_${e}`, customerId: `cus_${e}`, endsAt: iso(TE), updatedAt: iso(t) })],
      [-DAY + 1000, (e, t) => ls2.update(e, t, { sid: "subB", status: "cancelled", renewsAt: TE, endsAt: TE })],
    ],
    known: "a cancelled subscription is gated on refund-guard's ACCOUNT-wide moneyWasReturned(): orders carry no subscription id, so an earlier subscription's refund cannot be told from this one's. The handler in that state records and leaves the checkout's clock, which the lifetime's NULL clock had already erased. Up to a trial's remaining days, only when a lifetime is bought and refunded during such a trial; at HEAD the refunded lifetime was never revoked at all.",
    };
  },
  // E: renewal-grace had already extended the TWIN before the refund (hourly scheduler);
  // checked immediately after the refund, before renewal-grace's next hourly run.
  "R9-E LS 6 days overdue, renewal-grace ran before the refund; checked right after it": () => ({
    steps: [...lateBy(6 * DAY), ...[-30, -20, -10, -2].map((h) => [h * HOUR, (e, t) => applyRenewalGrace(db, { now: t, log: () => {} })])],
    immediate: true,
  }),
  // F: dispute variant of A (HEAD downgrades a dispute outright)
  "R9-F (dispute) monthly renewed on time 12 days ago, corrected update lost": () => {
    const P0 = NOW() - 12 * DAY;
    return {
      steps: [
        [P0 - 30 * DAY - NOW(), (e, t) => ls.checkout(e, t, { renewsAt: P0 })],
        [P0 - 30 * DAY - NOW() + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })],
        [P0 - 30 * DAY - NOW() + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P0 })],
        [P0 - NOW(), (e, t) => ls.update(e, t, { status: "active", renewsAt: P0 })],
        [P0 - NOW() + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
      ],
      reason: "dispute_created",
    };
  },
  // G: LS monthly + App Store monthly; LS subscription replaced by a second LS subscription
  // (yearly) during the lifetime; the first one's expiry lands after the second's checkout.
  "R9-G LS monthly A cancelled, yearly B bought, A's expiry lands after B's checkout": () => {
    const PA = NOW() + 5 * DAY;
    const PB = NOW() + 360 * DAY;
    return {
      steps: [
        [-25 * DAY, (e, t) => ls2.checkout(e, t, { sid: "subA", renewsAt: PA })],
        [-25 * DAY + MIN, (e, t) => ls2.pay(e, t, { sid: "subA", invoice: `iA_${e}` })],
        [-25 * DAY + 2 * MIN, (e, t) => ls2.update(e, t, { sid: "subA", status: "active", renewsAt: PA })],
        [-6 * DAY, (e, t) => post("/subscription-cancelled", { subscriptionId: `subA_${e}`, customerId: `cus_${e}`, endsAt: iso(PA), updatedAt: iso(t) })],
        [-5 * DAY, (e, t) => ls2.checkout(e, t, { sid: "subB", renewsAt: PB, plan: "yearly" })],
        [-5 * DAY + MIN, (e, t) => { post("/subscription-payment", { email: e, lsOrderId: `oB_${e}`, customerId: `cus_${e}`, plan: "yearly", amountMinor: 399900, currency: "JPY", billingReason: "initial" }); db.prepare("UPDATE orders SET created_at = ? WHERE order_id = ?").run(sqlTime(t), `lsord_oB_${e}`); }],
        [-5 * DAY + 2 * MIN, (e, t) => ls2.update(e, t, { sid: "subB", status: "active", renewsAt: PB })],
      ],
    };
  },
  // H: App Store yearly + LS monthly past_due; Apple REFUND of the yearly after the lifetime refund
  "R9-H LS past_due 3 days + App Store yearly; Apple refunds the yearly on day 2": () => {
    const P = NOW() - 4 * DAY;
    return {
      steps: [...paidMonthly(-4), [-10 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 300 * DAY, product: "me.colorarchive.pro.yearly" })], [-3 * DAY, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P })]],
      after: [[2 * DAY, (e, t) => apple.notify(e, t, "REFUND", { product: "me.colorarchive.pro.yearly", expires: NOW() + 300 * DAY }), "Apple REFUND yearly"]],
    };
  },
  // I: lifetime mid-way; LS yearly cancelled during the lifetime (period runs); refund
  "R9-I LS yearly; lifetime; yearly cancelled during the lifetime (period runs 200 days)": () => {
    const P = NOW() + 200 * DAY;
    const s = P - 365 * DAY - NOW();
    return [
      [s, (e, t) => ls.checkout(e, t, { renewsAt: P, plan: "yearly" })],
      [s + MIN, (e, t) => yearlyPay(e, t, `y1_${e}`, { plan: "yearly", billingReason: "initial" })],
      [s + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [-100 * DAY, "LIFETIME"],
      [-50 * DAY, (e, t) => post("/subscription-cancelled", { subscriptionId: `sub_${e}`, customerId: `cus_${e}`, endsAt: iso(P), updatedAt: iso(t) })],
      [-50 * DAY + 1000, (e, t) => ls.update(e, t, { status: "cancelled", renewsAt: P, endsAt: P })],
    ];
  },
  // J: renewal-grace mid-way: extension written, LS then charges late after the lifetime refund, but
  // the stale update arrives after the corrected one (dashboard resend).
  "R9-J LS 7 days late, renewal-grace ran; charged on day 1, stale update resent after the corrected one": () => {
    const P = NOW() - 7 * DAY;
    return [
      ...lateBy(7 * DAY),
      ...[-30, -10, -2].map((h) => [h * HOUR, (e, t) => applyRenewalGrace(db, { now: t, log: () => {} })]),
      [DAY, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
      [DAY + MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 30 * DAY })],
      [DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P, updatedAt: t - 90 * 1000 })],
    ];
  },
  // K: App Store monthly with DID_RENEW during the lifetime, then EXPIRED after, LS paid monthly too
  "R9-K LS monthly + App Store monthly renewed during lifetime; App Store EXPIRED after the refund": () => ({
    steps: [
      ...paidMonthly(20),
      [-30 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() - 2 * DAY })],
      [-20 * DAY, "LIFETIME"],
      [-2 * DAY, (e, t) => apple.notify(e, t, "DID_RENEW", { transactionId: `r1_${e}`, expires: NOW() + 28 * DAY, purchased: t })],
    ],
    after: [[3 * DAY, (e, t) => apple.notify(e, t, "EXPIRED", { transactionId: `r1_${e}`, expires: NOW() + 28 * DAY }), "EXPIRED"]],
  }),
  "R9-L LS yearly + App Store monthly; lifetime; yearly cancelled during it; App Store EXPIRED after the refund": () => {
    const P = NOW() + 100 * DAY;
    const s = P - 365 * DAY - NOW();
    return {
      steps: [
        [s, (e, t) => ls.checkout(e, t, { renewsAt: P, plan: "yearly" })],
        [s + MIN, (e, t) => yearlyPay(e, t, `y1_${e}`, { plan: "yearly", billingReason: "initial" })],
        [s + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
        [-20 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 10 * DAY })],
        [-15 * DAY, "LIFETIME"],
        [-10 * DAY, (e, t) => post("/subscription-cancelled", { subscriptionId: `sub_${e}`, customerId: `cus_${e}`, endsAt: iso(P), updatedAt: iso(t) })],
      ],
      after: [[10 * DAY + HOUR, (e, t) => apple.notify(e, t, "EXPIRED", { expires: NOW() + 10 * DAY, purchased: NOW() - 20 * DAY }), "App Store EXPIRED"]],
    };
  },
  "R9-M two concurrent LS monthlies (subscribed twice); A cancelled after the refund, B renews": () => {
    const PA = NOW() + 10 * DAY, PB = NOW() + 20 * DAY;
    return [
      [-20 * DAY, (e, t) => ls2.checkout(e, t, { sid: "subA", renewsAt: PA })],
      [-20 * DAY + MIN, (e, t) => ls2.pay(e, t, { sid: "subA", invoice: `iA_${e}` })],
      [-20 * DAY + 2 * MIN, (e, t) => ls2.update(e, t, { sid: "subA", status: "active", renewsAt: PA })],
      [-10 * DAY, (e, t) => ls2.checkout(e, t, { sid: "subB", renewsAt: PB })],
      [-10 * DAY + MIN, (e, t) => ls2.pay(e, t, { sid: "subB", invoice: `iB_${e}` })],
      [-10 * DAY + 2 * MIN, (e, t) => ls2.update(e, t, { sid: "subB", status: "active", renewsAt: PB })],
      [DAY, (e, t) => post("/subscription-cancelled", { subscriptionId: `subA_${e}`, customerId: `cus_${e}`, endsAt: iso(PA), updatedAt: iso(t) })],
      [20 * DAY + MIN, (e, t) => ls2.pay(e, t, { sid: "subB", invoice: `iB2_${e}` })],
      [20 * DAY + 2 * MIN, (e, t) => ls2.update(e, t, { sid: "subB", status: "active", renewsAt: PB + 30 * DAY })],
    ];
  },
  "R9-N App Store monthly, then LS monthly on top; App Store EXPIRED after the refund": () => ({
    steps: [[-25 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 5 * DAY })], ...paidMonthly(20)],
    after: [[5 * DAY + HOUR, (e, t) => apple.notify(e, t, "EXPIRED", { expires: NOW() + 5 * DAY, purchased: NOW() - 25 * DAY }), "App Store EXPIRED"]],
  }),
  "R9-P LS trial + App Store monthly; lifetime; trial converts during it; App Store EXPIRED after": () => {
    const TE = NOW() - 5 * DAY;
    return {
      steps: [
        [-12 * DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: TE, trialEndsAt: TE })],
        [-11 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 2 * DAY })],
        [-10 * DAY, "LIFETIME"],
        [TE - NOW(), (e, t) => ls.update(e, t, { status: "active", renewsAt: TE })],
        [TE - NOW() + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })],
        [TE - NOW() + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: TE + 30 * DAY })],
      ],
      after: [[2 * DAY + HOUR, (e, t) => apple.notify(e, t, "EXPIRED", { expires: NOW() + 2 * DAY, purchased: NOW() - 11 * DAY }), "App Store EXPIRED"]],
    };
  },
  "R9-R fresh-row lifetime first, then App Store monthly, then LS yearly; App Store REFUND after": () => ({
    steps: [
      [-30 * DAY, "LIFETIME"],
      [-20 * DAY, (e, t) => apple.buy(e, t, { expires: NOW() + 10 * DAY })],
      [-10 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: NOW() + 355 * DAY, plan: "yearly" })],
      [-10 * DAY + MIN, (e, t) => yearlyPay(e, t, `y1_${e}`, { plan: "yearly", billingReason: "initial" })],
      [-10 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: NOW() + 355 * DAY })],
    ],
    after: [[DAY, (e, t) => apple.notify(e, t, "REFUND", { expires: NOW() + 10 * DAY }), "Apple REFUND monthly"]],
  }),

  // ---------------- KNOWN: pre-existing, outside this change (reported as TODO) ----------------
  "KNOWN the owner's manual lifetime grant, then an LS lifetime bought by mistake and refunded": () => ({
    steps: [[-5 * DAY, (e) => db.prepare("UPDATE users SET tier = 'pro', subscription_plan = 'lifetime', pro_expires_at = NULL WHERE email = ?").run(e)]],
    known: "server/lifetime.js: once an LS lifetime order exists and every one is refunded, the manual-grant marker is no longer honoured (documented trade-off since 2026-09-06: the marker cannot tell a manual grant from a purchase). Same at HEAD.",
  }),
  "KNOWN trial with the real payload shape (trial_ends_at 9 h after renews_at)": () => ({
    steps: [[-DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: NOW() + 2 * DAY, trialEndsAt: NOW() + 2 * DAY + 9 * HOUR })]],
    known: "checkout anchors a trial's clock on trial_ends_at, which is not stored; the refund can only rebuild it from renews_at — up to ~9 h of a free trial's grace, in the rare case of a lifetime refunded during a trial.",
  }),
  "KNOWN an order_refunded for a second lifetime lands before that order's order_created": () => ({
    steps: [],
    detourAfter: [[HOUR, (e, t, n) => lifetime.refund(e, n + 1)], [2 * HOUR, (e, t, n) => lifetime.buy(e, n + 1)]],
    known: "a refund for an order not yet recorded is dropped; the late order_created then grants a lifetime whose money was returned. Same at HEAD; needs refunds recorded for unknown order ids.",
  }),
  "KNOWN an LS test-mode lifetime bought and refunded": () => ({
    steps: [],
    detourAfter: [
      [HOUR, (e, t, n) => post("/subscription-checkout", { email: e, plan: "lifetime", subscriptionId: `lifetime_${n + 2}`, provider: "lemonsqueezy", customerId: `cus_${e}`, amount: 1999900, currency: "JPY", testMode: true })],
      [2 * HOUR, (e, t, n) => post("/subscription-revoke", { email: e, reason: "order_refunded", lsId: String(n + 2), subscriptionId: "", customerId: `cus_${e}`, testMode: true })],
    ],
    known: "test-mode orders are excluded from the lifetime guard, which then falls back to the plan marker the checkout wrote; QA-only, same at HEAD.",
  }),
};

let now0 = 0;
const NOW = () => now0;

/** An LS monthly paid 30 days before its renewal date P = now + days. */
function paidMonthly(days) {
  const P = NOW() + days * DAY;
  const payAt = P - 30 * DAY - NOW();
  return [
    [payAt, (e, t) => ls.checkout(e, t, { renewsAt: P })],
    [payAt + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })],
    [payAt + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
  ];
}
/** An LS monthly whose renewal date was `late` ago and has not been charged; LS still says active. */
function lateBy(late) {
  return paidMonthly(-late / DAY);
}

function scenarioOf(name) {
  const v = SCENARIOS[name]();
  const o = Array.isArray(v) ? { steps: v } : v;
  const all = (o.steps || []).concat(o.after || []);
  return {
    before: all.filter(([off]) => off <= 0),
    after: all.filter(([off]) => off > 0), // both arms, while the walk passes them
    detourAfter: o.detourAfter || [],
    only: o.only || null,
    known: o.known || null,
    reason: o.reason || "order_refunded",
    // also assert right after the refund, before renewal-grace's next hourly run
    immediate: Boolean(o.immediate),
  };
}
function hash(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return h;
}
const lifetimeNumber = (e) => 900000 + (Math.abs(hash(e)) % 90000);

/** Run one arm up to now; returns the email used. */
async function runArm(name, arm, detourAt) {
  const e = `${arm}-${detourAt}-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 80)}@x.com`;
  userId(e); // both arms start from a signed-up account
  const sc = scenarioOf(name);
  const steps = sc.before.slice().sort((a, b) => a[0] - b[0]);
  const first = steps.length ? steps[0][0] : -DAY;
  const n = lifetimeNumber(e);
  if (arm === "detour" && detourAt === "start") atTime(NOW() + first - HOUR, () => lifetime.buy(e, n));
  for (const [offset, action] of steps) {
    if (action === "LIFETIME") {
      if (arm === "detour" && detourAt === "mid") atTime(NOW() + offset, () => lifetime.buy(e, n));
      continue;
    }
    await atTimeAsync(NOW() + offset, () => action(e, NOW() + offset));
  }
  if (arm === "detour" && detourAt === "end") atTime(NOW() - 10 * MIN, () => lifetime.buy(e, n));
  if (arm === "detour") lifetime.refund(e, n, sc.reason); // now, on the real clock
  return e;
}

const row = (e) => db.prepare("SELECT id, tier, pro_expires_at, payment_provider, subscription_status FROM users WHERE email = ?").get(e);
const pro = (e, t) => {
  const r = row(e);
  return effectiveTier({ tier: r.tier, proExpiresAt: r.pro_expires_at, now: t }).tier === "pro";
};
const applePaid = (e, t) =>
  db.prepare("SELECT expires_date FROM apple_purchases WHERE user_id = ? AND status = 'active'").all(row(e).id)
    .some((p) => Date.parse(p.expires_date) + 3 * DAY > t);
const filings = (e) =>
  db.prepare("SELECT pack_id FROM orders WHERE email = ? AND pack_id <> 'pro-lifetime' ORDER BY id").all(e).map((r) => r.pack_id).join(",");

for (const name of Object.keys(SCENARIOS)) {
  const sc = scenarioOf(name);
  const hasMid = sc.before.some(([, a]) => a === "LIFETIME");
  for (const detourAt of hasMid ? ["mid"] : ["end", "start"]) {
    if (sc.only && !sc.only.includes(detourAt)) continue;
    test(`${name} — lifetime bought at the ${detourAt}, then refunded`, sc.known ? { todo: sc.known } : {}, async () => {
      reset();
      now0 = Date.now();
      const sc = scenarioOf(name); // rebuilt now: its steps read NOW()
      const twin = await runArm(name, "twin", detourAt);
      const detour = await runArm(name, "detour", detourAt);

      assert.equal(row(detour).payment_provider, row(twin).payment_provider, "the lifetime detour changed the provider");
      // The decision those columns feed: may an App Store REFUND / EXPIRED revoke this account?
      assert.equal(appleGovernsAccess(db, row(detour).id), appleGovernsAccess(db, row(twin).id), "the lifetime detour changed who governs access");
      if (detourAt === "end") {
        assert.equal(row(detour).subscription_status, row(twin).subscription_status, "the lifetime detour changed the subscription's status");
      }

      const events = [
        ...sc.after.map(([off, action, label]) => ({ off, arms: [twin, detour], action, label: label || "event (both arms)" })),
        ...sc.detourAfter.map(([off, action]) => ({ off, arms: [detour], action, label: "lifetime event (detour only)" })),
      ].sort((a, b) => a.off - b.off);
      let ei = 0;
      const log = [];
      if (sc.immediate) {
        const t1 = now0 + MIN;
        assert.ok(!pro(twin, t1) || pro(detour, t1), `IMMEDIATE LOCK-OUT at +1min: twin=${JSON.stringify(row(twin))} detour=${JSON.stringify(row(detour))}`);
      }
      for (let t = now0 + 5 * HOUR; t <= now0 + 40 * DAY; t += 12 * HOUR) {
        while (ei < events.length && now0 + events[ei].off <= t) {
          const ev = events[ei++];
          for (const e of ev.arms) {
            await atTimeAsync(now0 + ev.off, () => ev.action(e, now0 + ev.off, lifetimeNumber(e)));
          }
          log.push(`  (+${(ev.off / DAY).toFixed(2)}d ${ev.label}) twin=${JSON.stringify(row(twin))} detour=${JSON.stringify(row(detour))}`);
        }
        applyRenewalGrace(db, { now: t, log: () => {} });
        const a = pro(twin, t);
        const b = pro(detour, t);
        log.push(`${((t - now0) / DAY).toFixed(1)}d twin=${a ? "pro" : "free"} detour=${b ? "pro" : "free"}`);
        assert.ok(!a || b, `LOCK-OUT at +${((t - now0) / DAY).toFixed(1)}d: the lifetime detour took access the account had\n${log.join("\n")}`);
        assert.ok(!b || a || applePaid(detour, t), `UNPAID GRANT at +${((t - now0) / DAY).toFixed(1)}d: access nothing pays for\n${log.join("\n")}`);
      }
      assert.equal(filings(detour), filings(twin), "the lifetime detour changed how the subscription's invoices are filed");
    });
  }
}
