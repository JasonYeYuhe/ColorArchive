/**
 * INVARIANT: an App Store purchase that ends (EXPIRED, DID_FAIL_TO_RENEW, REFUND,
 * REVOKE) leaves the account as if that purchase had never been made.
 *
 * The App Store counterpart of lifetime-refund-invariant.test.js, for
 * routes/apple-notifications.js downgrade(). Until 2026-09-27 downgrade() returned
 * early whenever a Lemon Squeezy subscription governed access, leaving the ended App
 * Store purchase's clock on the account — an App Store yearly refunded next to an LS
 * monthly kept up to ~300 days of access. It now removes that clock, and only that
 * clock (server/subscription-clock.js).
 *
 *   TWIN   — the scenario alone (LS events, other App Store purchases, LS lifetime …);
 *   DETOUR — the same scenario plus one App Store purchase (synced through
 *            grantApplePurchase + Apple's SUBSCRIBED notification), later ended through
 *            the REAL /apple-notifications/v2 handler (only ../apple-jws stubbed).
 * One timeline for both arms; renewal-grace runs hourly near the action. From the end
 * event on, at every tick and right after each event:
 *   - no lock-out:     TWIN pro  => DETOUR pro;
 *   - no unpaid grant: DETOUR pro => TWIN pro, or another active App Store purchase pays.
 *
 * Built by the round-9 counterexample search (2026-09-27), which found CE-A..F against
 * the first version of the downgrade() change. KNOWN (TODO): pre-existing or accepted
 * gaps, each with its reason.
 */

require("./support/route-harness").install();

const test = require("node:test");
const assert = require("node:assert");
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
// The handlers log every event; thousands of simulated hours would drown the test output.
if (!process.env.VERBOSE) {
  console.log = () => {};
  console.warn = () => {};
}

const db = require("../db");
const router = require("../routes/webhook");
const { callRoute, callRouteChain } = require("./support/route-harness");
const notificationsRouter = require("../routes/apple-notifications");
const { grantApplePurchase } = require("../apple-grant");
const { applyRenewalGrace } = require("../renewal-grace");
const { effectiveTier } = require("../entitlement");

const DAY = 86400000;
const HOUR = 3600000;
const MIN = 60000;
const iso = (ms) => new Date(ms).toISOString();
const sqlTime = (ms) => iso(ms).replace("T", " ").slice(0, 19);

let SIM = null; // simulated wall clock
const realNow = Date.now.bind(Date);
Date.now = () => (SIM === null ? realNow() : SIM);

function reset() {
  for (const t of ["apple_revoked_transactions", "apple_unlinked_transactions", "apple_purchases", "sessions", "magic_link_tokens", "orders", "subscribers", "users"]) {
    db.exec(`DELETE FROM ${t}`);
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
const post = (p, body) => callRoute(router, "post", p, { body });

// ---- building blocks: real handler calls with route.ts payload shapes ----
const ls = {
  checkout: (e, t, { status = "active", renewsAt, trialEndsAt, plan = "monthly", sid = "sub" }) =>
    post("/subscription-checkout", {
      email: e, plan, subscriptionId: `${sid}_${e}`, provider: "lemonsqueezy", customerId: `cus_${e}`,
      status, renewsAt: renewsAt == null ? null : iso(renewsAt), trialEndsAt: trialEndsAt == null ? null : iso(trialEndsAt), testMode: false,
    }),
  pay: (e, t, { invoice, amountMinor = 49900, sid = "sub" }) => {
    post("/subscription-payment", { email: e, invoiceId: invoice, subscriptionId: `${sid}_${e}`, customerId: `cus_${e}`, amountMinor, currency: "JPY", billingReason: "renewal", provider: "lemonsqueezy", testMode: false });
    db.prepare("UPDATE orders SET created_at = ? WHERE order_id = ?").run(sqlTime(t), `lsinv_${invoice}`);
  },
  initialOrder: (e, t, { order, plan = "monthly", amountMinor = 49900 }) => {
    post("/subscription-payment", { email: e, lsOrderId: order, customerId: `cus_${e}`, plan, amountMinor, currency: "JPY", billingReason: "initial", provider: "lemonsqueezy", testMode: false });
    db.prepare("UPDATE orders SET created_at = ? WHERE order_id = ?").run(sqlTime(t), `lsord_${order}`);
  },
  update: (e, t, { status, renewsAt, endsAt = null, updatedAt = t, sid = "sub" }) =>
    post("/subscription-updated", { subscriptionId: `${sid}_${e}`, customerId: `cus_${e}`, status, renewsAt: renewsAt == null ? null : iso(renewsAt), endsAt: endsAt === null ? null : iso(endsAt), updatedAt: iso(updatedAt), provider: "lemonsqueezy", testMode: false }),
  cancel: (e, t, { endsAt, sid = "sub" }) => post("/subscription-cancelled", { subscriptionId: `${sid}_${e}`, customerId: `cus_${e}`, endsAt: iso(endsAt), updatedAt: iso(t), provider: "lemonsqueezy", testMode: false }),
  expire: (e, t, { sid = "sub" } = {}) => post("/subscription-cancelled", { subscriptionId: `${sid}_${e}`, customerId: `cus_${e}`, updatedAt: iso(t), provider: "lemonsqueezy", reason: "expired", testMode: false }),
  refundInvoice: (e, t, { invoice, sid = "sub" }) => {
    post("/subscription-revoke", { email: e, reason: "subscription_payment_refunded", lsId: invoice, subscriptionId: `${sid}_${e}`, customerId: `cus_${e}`, provider: "lemonsqueezy", testMode: false });
    db.prepare("UPDATE orders SET refunded_at = ? WHERE order_id = ?").run(sqlTime(t), `lsinv_${invoice}`);
  },
};
const lifetime = {
  buy: (e, t, { n }) =>
    post("/subscription-checkout", { email: e, plan: "lifetime", subscriptionId: `lifetime_${n}`, provider: "lemonsqueezy", customerId: `cus_${e}`, amount: 1999900, currency: "JPY", testMode: false }),
  refund: (e, t, { n }) => {
    post("/subscription-revoke", { email: e, reason: "order_refunded", lsId: String(n), subscriptionId: "", customerId: `cus_${e}`, provider: "lemonsqueezy", testMode: false });
    db.prepare("UPDATE orders SET refunded_at = ? WHERE order_id = ?").run(sqlTime(t), `lifetime_${n}`);
  },
};
const PRODUCT = { monthly: "me.colorarchive.pro.monthly", yearly: "me.colorarchive.pro.yearly", lifetime: "me.colorarchive.pro.lifetime" };
const apple = {
  // the app's own sync (/auth/apple-purchase -> grantApplePurchase)
  sync: (e, t, { txn, transactionId = txn, product = "monthly", expires }) =>
    grantApplePurchase(db, { userId: userId(e), productId: PRODUCT[product], txnId: txn, transactionId, transactionDate: iso(t), expiresDate: expires == null ? null : iso(expires), environment: "Production", verified: true }),
  notify: (e, t, type, { txn, transactionId = txn, subtype = null, product = "monthly", expires = null, purchased = t }) => {
    nextNotification = { notificationType: type, subtype, data: { signedTransactionInfo: "stubbed" } };
    nextTxn = {
      originalTransactionId: txn, transactionId, productId: PRODUCT[product], purchaseDate: iso(purchased),
      expiresDate: expires === null ? null : iso(expires), environment: "Production", bundleId: "me.colorarchive.app", revocationDate: null,
    };
    return callRouteChain(notificationsRouter, "post", "/v2", { body: { signedPayload: "stubbed" } });
  },
};

/** An LS monthly paid 30 days before its renewal date P (absolute ms). */
function paidMonthly(P) {
  const payAt = P - 30 * DAY;
  return [
    [payAt, (e, t) => ls.checkout(e, t, { renewsAt: P })],
    [payAt + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })],
    [payAt + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
  ];
}

/**
 * The App Store purchase the DETOUR adds, and how it ends.
 * kind: REFUND | REVOKE | EXPIRED | DID_FAIL_TO_RENEW | EXPIRED_AFTER_RETRY
 */
function detourSteps({ kind, product = "monthly", endAt, buyAt }) {
  const txn = (e) => `ta_${e}`;
  const steps = [];
  if (product === "lifetime") {
    steps.push([buyAt, (e, t) => apple.sync(e, t, { txn: txn(e), product, expires: null })]);
    steps.push([buyAt + MIN, (e, t) => apple.notify(e, t, "SUBSCRIBED", { txn: txn(e), product, expires: null })]);
    steps.push([endAt, (e, t) => apple.notify(e, t, kind, { txn: txn(e), product, expires: null, purchased: buyAt }), `APPLE ${kind}`]);
    return steps;
  }
  const len = product === "yearly" ? 365 * DAY : 30 * DAY;
  if (kind === "REFUND" || kind === "REVOKE") {
    // bought at buyAt, renewed as needed, refunded at endAt (inside the current period)
    let start = buyAt;
    let expires = buyAt + len;
    steps.push([buyAt, (e, t) => apple.sync(e, t, { txn: txn(e), product, expires: buyAt + len })]);
    steps.push([buyAt + MIN, (e, t) => apple.notify(e, t, "SUBSCRIBED", { txn: txn(e), product, expires: buyAt + len })]);
    let k = 1;
    while (expires <= endAt) {
      const s = expires;
      const ex = expires + len;
      const tid = `r${k}`;
      steps.push([s - HOUR, (e, t) => apple.notify(e, t, "DID_RENEW", { txn: txn(e), transactionId: `${tid}_${e}`, product, expires: ex, purchased: s })]);
      start = s;
      expires = ex;
      k++;
    }
    const lastTid = k === 1 ? null : `r${k - 1}`;
    const ex = expires;
    const st = start;
    steps.push([endAt, (e, t) => apple.notify(e, t, kind, { txn: txn(e), transactionId: lastTid ? `${lastTid}_${e}` : txn(e), product, expires: ex, purchased: st }), `APPLE ${kind}`]);
    return steps;
  }
  // EXPIRED / DID_FAIL_TO_RENEW: one period ending at `endAt` (buyAt = endAt - len)
  const b = endAt - len;
  steps.push([b, (e, t) => apple.sync(e, t, { txn: txn(e), product, expires: endAt })]);
  steps.push([b + MIN, (e, t) => apple.notify(e, t, "SUBSCRIBED", { txn: txn(e), product, expires: endAt })]);
  if (kind === "EXPIRED") {
    steps.push([b + 2 * DAY, (e, t) => apple.notify(e, t, "DID_CHANGE_RENEWAL_STATUS", { txn: txn(e), subtype: "AUTO_RENEW_DISABLED", product, expires: endAt })]);
    steps.push([endAt + 5 * MIN, (e, t) => apple.notify(e, t, "EXPIRED", { txn: txn(e), subtype: "VOLUNTARY", product, expires: endAt, purchased: b }), "APPLE EXPIRED"]);
  } else if (kind === "DID_FAIL_TO_RENEW") {
    steps.push([endAt + 5 * MIN, (e, t) => apple.notify(e, t, "DID_FAIL_TO_RENEW", { txn: txn(e), product, expires: endAt, purchased: b }), "APPLE DID_FAIL_TO_RENEW"]);
  } else if (kind === "GRACE_THEN_EXPIRED") {
    steps.push([endAt + 5 * MIN, (e, t) => apple.notify(e, t, "DID_FAIL_TO_RENEW", { txn: txn(e), subtype: "GRACE_PERIOD", product, expires: endAt, purchased: b })]);
    steps.push([endAt + 16 * DAY, (e, t) => apple.notify(e, t, "EXPIRED", { txn: txn(e), subtype: "BILLING_RETRY", product, expires: endAt, purchased: b }), "APPLE EXPIRED/BILLING_RETRY"]);
  }
  return steps;
}

const row = (e) => db.prepare("SELECT id, tier, pro_expires_at, payment_provider, subscription_status, subscription_current_period_end AS cpe, renewal_grace_until AS rgu FROM users WHERE email = ?").get(e);
const pro = (e, t) => {
  const r = row(e);
  return effectiveTier({ tier: r.tier, proExpiresAt: r.pro_expires_at, now: t }).tier === "pro";
};
const applePaid = (e, t, excludeTxn) =>
  db.prepare("SELECT original_transaction_id AS otid, expires_date FROM apple_purchases WHERE user_id = ? AND status = 'active'").all(row(e).id)
    .some((p) => p.otid !== excludeTxn && (p.expires_date === null ? true : Date.parse(p.expires_date) + 3 * DAY > t));
const short = (r) => `${r.tier}/${r.pro_expires_at ? r.pro_expires_at.slice(0, 16) : "null"}/${r.payment_provider}/${r.subscription_status}`;

let seq = 0;
/**
 * Run one differential case. scenario(now0) -> [[absMs, fn, label?], ...] (both arms).
 * detour -> {kind, product, endAt, buyAt} absolute ms.
 * Returns {lockoutHours, unpaidHours, firstFail, log}
 */
async function runCase(scenario, detour, { walkDays = 40, now0 } = {}) {
  reset();
  seq++;
  const twin = `twin${seq}@x.com`;
  const det = `det${seq}@x.com`;
  userId(twin);
  userId(det);
  const both = scenario(now0).map(([t, fn, label]) => ({ t, fn, label: label || "", arms: [twin, det] }));
  const only = (detour.steps ? detour.steps(now0) : detourSteps(detour)).map(([t, fn, label]) => ({ t, fn, label: label || "", arms: [det] }));
  const events = [...both, ...only].sort((a, b) => a.t - b.t || (a.arms.length - b.arms.length));
  const endEvent = only.find((x) => x.label.startsWith("APPLE "));
  const endAt = endEvent.t;
  const start = events[0].t - HOUR;
  const stop = Math.max(now0 + walkDays * DAY, endAt + walkDays * DAY);
  const log = [];
  let lockout = 0;
  let unpaid = 0;
  let firstFail = null;
  const excl = `ta_${det}`;
  const check = (t, where) => {
    if (t < endAt) return;
    const a = pro(twin, t);
    // One second of tolerance: a rebuilt clock comes from orders.created_at (SQLite,
    // whole seconds) where the TWIN's came from Date.now() (milliseconds). A tick that
    // lands inside that sub-second difference is not a lock-out anyone could see.
    const b = pro(det, t) || pro(det, t - 1000);
    if (a && !b) {
      if (!firstFail) firstFail = `LOCK-OUT at ${((t - now0) / DAY).toFixed(2)}d (${where})`;
      return "L";
    }
    if (b && !a && !applePaid(det, t, excl)) {
      if (!firstFail) firstFail = `UNPAID GRANT at ${((t - now0) / DAY).toFixed(2)}d (${where})`;
      return "U";
    }
    return "";
  };
  let ei = 0;
  let lastTick = start;
  for (let t = start; t <= stop; ) {
    while (ei < events.length && events[ei].t <= t) {
      const ev = events[ei++];
      for (const e of ev.arms) {
        SIM = ev.t;
        try {
          await ev.fn(e, ev.t);
        } finally {
          SIM = null;
        }
      }
      if (ev.label) log.push(`  @${((ev.t - now0) / DAY).toFixed(2)}d ${ev.label}: twin=${short(row(twin))} det=${short(row(det))}`);
      const r = check(ev.t, `right after ${ev.label || "event"}`);
      if (r) log.push(`  !! ${r} right after event @${((ev.t - now0) / DAY).toFixed(2)}d twin=${short(row(twin))} det=${short(row(det))}`);
    }
    SIM = t;
    applyRenewalGrace(db, { now: t, log: () => {} });
    SIM = null;
    const r = check(t, "tick");
    if (r === "L") lockout += (t - lastTick) / HOUR;
    if (r === "U") unpaid += (t - lastTick) / HOUR;
    if (r) log.push(`  !! ${r} tick @${((t - now0) / DAY).toFixed(2)}d twin=${short(row(twin))} det=${short(row(det))}`);
    lastTick = t;
    // Hourly (renewal-grace's own cadence) from a day before the App Store end to five
    // days after it, and for 36 h after any event; 6-hourly elsewhere, which is still
    // well inside renewal-grace's 36 h lookahead. Hourly everywhere took 80 s a run.
    const near = (t >= endAt - DAY && t <= endAt + 5 * DAY) || events.some((ev) => t >= ev.t && t <= ev.t + 36 * HOUR);
    const step = near ? HOUR : 6 * HOUR;
    const nextEv = ei < events.length ? events[ei].t : Infinity;
    t = Math.min(t + step, Math.max(nextEv, t + 1));
  }
  return { lockoutHours: Math.round(lockout), unpaidHours: Math.round(unpaid), firstFail, log, twin: row(twin), det: row(det) };
}



const SCENARIOS = {
  "none": (N) => [],
  "LS monthly paid, renews +20d": (N) => paidMonthly(N + 20 * DAY),
  "LS late 20h": (N) => paidMonthly(N - 20 * HOUR),
  "LS late 6d": (N) => paidMonthly(N - 6 * DAY),
  "LS late 40d (expiry missed)": (N) => paidMonthly(N - 40 * DAY),
  "LS past_due (renewal 11d ago)": (N) => [...paidMonthly(N - 11 * DAY), [N - HOUR, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: N - 11 * DAY })]],
  "LS past_due at renewal (P=-4d)": (N) => [...paidMonthly(N - 4 * DAY), [N - 4 * DAY + HOUR, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: N - 4 * DAY })]],
  "NEW LS late -> grace -> charge fails -> past_due": (N) => {
    const P = N - 6 * DAY;
    return [...paidMonthly(P), [P + 4 * DAY, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P }), "LS past_due (late charge failed)"]];
  },
  "LS trial (trial_end = renews_at)": (N) => [[N - DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: N + 2 * DAY, trialEndsAt: N + 2 * DAY })]],
  "LS trial real shape (trial_end 9h after renews_at)": (N) => [[N - DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: N + 2 * DAY, trialEndsAt: N + 2 * DAY + 9 * HOUR })]],
  "LS trial real shape, converts 4 days late": (N) => [[N - DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: N + 2 * DAY, trialEndsAt: N + 2 * DAY + 9 * HOUR })],
    [N + 6 * DAY, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })], [N + 6 * DAY + MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: N + 36 * DAY })]],
  "LS cancelled, period runs 10d": (N) => {
    const P = N + 10 * DAY;
    return [[N - 20 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P })], [N - 20 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })], [N - HOUR, (e, t) => ls.cancel(e, t, { endsAt: P })]];
  },
  "LS cancelled, period over": (N) => {
    const P = N - 5 * DAY;
    return [[N - 35 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P })], [N - 35 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })], [N - 7 * DAY, (e, t) => ls.cancel(e, t, { endsAt: P })]];
  },
  "LS paused": (N) => [...paidMonthly(N + 20 * DAY), [N - HOUR, (e, t) => ls.update(e, t, { status: "paused", renewsAt: N + 20 * DAY })]],
  "LS invoice refunded": (N) => [...paidMonthly(N + 20 * DAY), [N - HOUR, (e, t) => ls.refundInvoice(e, t, { invoice: `i1_${e}` })]],
  "LS expired": (N) => [...paidMonthly(N - 5 * DAY), [N - 2 * DAY, (e, t) => ls.expire(e, t)]],
  "LS yearly paid, renews +100d": (N) => {
    const P = N + 100 * DAY;
    return [[P - 365 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P, plan: "yearly" })],
      [P - 365 * DAY + MIN, (e, t) => ls.initialOrder(e, t, { order: `o1_${e}`, plan: "yearly", amountMinor: 399900 })],
      [P - 365 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })]];
  },
  "NEW monthly renewal paid, corrected subscription_updated lost": (N) => {
    const P = N - 12 * DAY;
    return [...paidMonthly(P), [P, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })], [P + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })]];
  },
  "NEW yearly renewal paid, corrected subscription_updated lost": (N) => {
    const P = N - 12 * DAY;
    return [[P - 365 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P, plan: "yearly" })],
      [P - 365 * DAY + MIN, (e, t) => ls.initialOrder(e, t, { order: `o1_${e}`, plan: "yearly", amountMinor: 399900 })],
      [P - 365 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [P, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [P + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}`, amountMinor: 399900 })]];
  },
  "NEW past_due 12 days, recovered by payment; corrected update lost": (N) => {
    const P = N - 14 * DAY;
    return [...paidMonthly(P), [P + HOUR, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P })],
      [N - 2 * DAY, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })]];
  },
  "after: monthly renews on day 20 (out-of-order updates)": (N) => {
    const P = N + 20 * DAY;
    return [...paidMonthly(P), [P + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })],
      [P + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 30 * DAY })],
      [P + 3 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P, updatedAt: t - 2 * MIN })]];
  },
  "after: cancels day 1, expiry day 23": (N) => {
    const P = N + 20 * DAY;
    return [...paidMonthly(P), [N + DAY, (e, t) => ls.cancel(e, t, { endsAt: P })],
      [N + DAY + 1000, (e, t) => ls.update(e, t, { status: "cancelled", renewsAt: P, endsAt: P })], [N + 23 * DAY, (e, t) => ls.expire(e, t)]];
  },
  "after: resumed after pause": (N) => {
    const P = N + 20 * DAY;
    return [...paidMonthly(P), [N - HOUR, (e, t) => ls.update(e, t, { status: "paused", renewsAt: P })], [N + 3 * DAY, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 3 * DAY })]];
  },
  "after: renewal invoice refunded day 21": (N) => {
    const P = N + 20 * DAY;
    return [...paidMonthly(P), [P + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })], [P + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 30 * DAY })],
      [N + 21 * DAY, (e, t) => ls.refundInvoice(e, t, { invoice: `i2_${e}` })]];
  },
  "after: past_due, dunning fails, expires day 10": (N) => {
    const P = N - 4 * DAY;
    return [...paidMonthly(P), [N - 3 * DAY, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P })],
      [N + 10 * DAY, (e, t) => ls.update(e, t, { status: "expired", renewsAt: P, endsAt: t })], [N + 10 * DAY + MIN, (e, t) => ls.expire(e, t)]];
  },
  "after: past_due recovered day 2": (N) => [...paidMonthly(N - 11 * DAY), [N - HOUR, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: N - 11 * DAY })],
    [N + 2 * DAY, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })], [N + 2 * DAY + MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: N + 32 * DAY })]],
  "after: LS finally charges 8-day-overdue renewal on day 2": (N) => {
    const P = N - 8 * DAY;
    return [...paidMonthly(P), [N + 2 * DAY, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
      [N + 2 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i2_${e}` })], [N + 2 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P + 30 * DAY })]];
  },
  "LS monthly without renewal dates (legacy payload)": (N) => [[N - 10 * DAY, (e, t) => ls.checkout(e, t, {})], [N - 10 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })]],
  "LS lifetime held + LS monthly": (N) => [...paidMonthly(N + 20 * DAY), [N - 15 * DAY, (e, t) => lifetime.buy(e, t, { n: 700000 + (e.length * 7) })]],
  "LS lifetime held + LS monthly; lifetime refunded day 3": (N) => [...paidMonthly(N + 20 * DAY), [N - 15 * DAY, (e, t) => lifetime.buy(e, t, { n: 700000 + (e.length * 7) })], [N + 3 * DAY, (e, t) => lifetime.refund(e, t, { n: 700000 + (e.length * 7) }), "LS lifetime refunded"]],
  "LS lifetime alone; refunded day 3": (N) => [[N - 15 * DAY, (e, t) => lifetime.buy(e, t, { n: 700000 + (e.length * 7) })], [N + 3 * DAY, (e, t) => lifetime.refund(e, t, { n: 700000 + (e.length * 7) }), "LS lifetime refunded"]],
  "LS lifetime + LS monthly cancelled (period over); lifetime refunded day 3": (N) => [
    [N - 35 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: N - 5 * DAY })], [N - 35 * DAY + MIN, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })],
    [N - 30 * DAY, (e, t) => lifetime.buy(e, t, { n: 700000 + (e.length * 7) })],
    [N - 28 * DAY, (e, t) => ls.cancel(e, t, { endsAt: N - 5 * DAY })],
    [N + 3 * DAY, (e, t) => lifetime.refund(e, t, { n: 700000 + (e.length * 7) }), "LS lifetime refunded"]],
  "other App Store yearly (both arms)": (N) => [[N - 40 * DAY, (e, t) => apple.sync(e, t, { txn: `t2_${e}`, product: "yearly", expires: N + 325 * DAY })]],
  "other App Store monthly expiring +10d (both arms)": (N) => [[N - 20 * DAY, (e, t) => apple.sync(e, t, { txn: `t2_${e}`, product: "monthly", expires: N + 10 * DAY })],
    [N + 10 * DAY + 5 * MIN, (e, t) => apple.notify(e, t, "EXPIRED", { txn: `t2_${e}`, subtype: "VOLUNTARY", product: "monthly", expires: N + 10 * DAY })]],
  "other App Store lifetime (both arms)": (N) => [[N - 40 * DAY, (e, t) => apple.sync(e, t, { txn: `t2_${e}`, product: "lifetime", expires: null })]],
  "LS monthly + other App Store yearly (both arms)": (N) => [...paidMonthly(N + 20 * DAY), [N - 40 * DAY, (e, t) => apple.sync(e, t, { txn: `t2_${e}`, product: "yearly", expires: N + 325 * DAY })]],
  "LS monthly + other App Store lifetime (both arms)": (N) => [...paidMonthly(N + 20 * DAY), [N - 40 * DAY, (e, t) => apple.sync(e, t, { txn: `t2_${e}`, product: "lifetime", expires: null })]],
  "LS late 6d + other App Store lifetime refunded day 2 (both arms)": (N) => [...paidMonthly(N - 6 * DAY), [N - 40 * DAY, (e, t) => apple.sync(e, t, { txn: `t2_${e}`, product: "lifetime", expires: null })],
    [N + 2 * DAY, (e, t) => apple.notify(e, t, "REFUND", { txn: `t2_${e}`, product: "lifetime", expires: null }), "other App Store lifetime REFUND"]],
};


const N = Date.now();
const verdict = (r) => `${r.firstFail} (lock-out ${r.lockoutHours} h, unpaid ${r.unpaidHours} h)\n${r.log.slice(0, 6).join("\n")}`;

test("CE-A LS renewal late -> renewal-grace -> late charge fails (past_due); App Store monthly EXPIRED during dunning", { todo: "renewal-grace cannot run while an App Store clock is later than the LS one; if LS then goes past_due, the grace the TWIN got is never recorded, so the DETOUR falls back to the past_due floor. Needs per-source clocks; exotic (LS late + App Store clock masking the cap + dunning + App Store end)." }, async () => {
  const P = N - 6 * DAY; // LS renewal date; LS did not attempt the charge on time
  const sc = () => [
    ...paidMonthly(P),                                                   // checkout, invoice i1, subscription_updated
    [P + 4 * DAY, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P }), "LS subscription_updated past_due"],
  ];
  // App Store monthly bought P-23d, auto-renew off, expires P+7d; Apple sends EXPIRED/VOLUNTARY
  const r = await runCase(sc, { kind: "EXPIRED", product: "monthly", endAt: P + 7 * DAY }, { now0: N });
  assert.equal(r.firstFail, null, verdict(r));
});

test("CE-A' same, App Store billing retry exhausted (DID_FAIL_TO_RENEW, no subtype)", { todo: "as CE-A, with the App Store billing retry exhausted." }, async () => {
  const P = N - 6 * DAY;
  const sc = () => [...paidMonthly(P), [P + 4 * DAY, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P }), "LS past_due"]];
  const r = await runCase(sc, { kind: "DID_FAIL_TO_RENEW", product: "monthly", endAt: P + 7 * DAY }, { now0: N });
  assert.equal(r.firstFail, null, verdict(r));
});

test("CE-B LS yearly renewed and paid, corrected subscription_updated lost; App Store monthly EXPIRED 20 days later", async () => {
  const P = N - 20 * DAY; // yearly renewal date
  const sc = () => [
    [P - 365 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P, plan: "yearly" })],
    [P - 365 * DAY + MIN, (e, t) => ls.initialOrder(e, t, { order: `o1_${e}`, plan: "yearly", amountMinor: 399900 })],
    [P - 365 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
    [P, (e, t) => ls.update(e, t, { status: "active", renewsAt: P }), "LS stale subscription_updated (renews_at not yet moved)"],
    [P + MIN, (e, t) => ls.pay(e, t, { invoice: `y2_${e}`, amountMinor: 399900 }), "LS subscription_payment_success (yearly renewal, ¥3,999)"],
    // the corrected subscription_updated (renews_at = P + 365d) never arrives
  ];
  const r = await runCase(sc, { kind: "EXPIRED", product: "monthly", endAt: N }, { now0: N });
  assert.equal(r.firstFail, null, verdict(r));
});

test("CE-B' same LS state; an App Store month that lapsed BEFORE the LS renewal is refunded by Apple now", async () => {
  const P = N - 20 * DAY;
  const sc = () => [
    [P - 365 * DAY, (e, t) => ls.checkout(e, t, { renewsAt: P, plan: "yearly" })],
    [P - 365 * DAY + MIN, (e, t) => ls.initialOrder(e, t, { order: `o1_${e}`, plan: "yearly", amountMinor: 399900 })],
    [P - 365 * DAY + 2 * MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
    [P, (e, t) => ls.update(e, t, { status: "active", renewsAt: P })],
    [P + MIN, (e, t) => ls.pay(e, t, { invoice: `y2_${e}`, amountMinor: 399900 })],
  ];
  const A = N - 40 * DAY; // App Store monthly: bought A-30d, expired at A (EXPIRED then), refunded now
  const steps = () => [
    [A - 30 * DAY, (e, t) => apple.sync(e, t, { txn: `ta_${e}`, product: "monthly", expires: A })],
    [A + 5 * MIN, (e, t) => apple.notify(e, t, "EXPIRED", { txn: `ta_${e}`, subtype: "VOLUNTARY", product: "monthly", expires: A, purchased: A - 30 * DAY })],
    [N, (e, t) => apple.notify(e, t, "REFUND", { txn: `ta_${e}`, product: "monthly", expires: A, purchased: A - 30 * DAY }), "APPLE REFUND of a month that ended 40 days ago"],
  ];
  const r = await runCase(sc, { steps }, { now0: N });
  assert.equal(r.firstFail, null, verdict(r));
});

test("CE-C LS renewal 6 days late (renewal-grace territory); App Store monthly EXPIRED -> locked out until renewal-grace's next hourly run", async () => {
  const P = N - 6 * DAY;
  const r = await runCase(() => paidMonthly(P), { kind: "EXPIRED", product: "monthly", endAt: N }, { now0: N });
  assert.equal(r.firstFail, null, verdict(r));
});

test("CE-D LS trial (real payload: trial_ends_at 9 h after renews_at), App Store monthly EXPIRED during the trial, LS converts late", { todo: "a trial’s clock is anchored on trial_ends_at, which is not stored; rebuilding it from renews_at loses up to ~9 h (same KNOWN as the lifetime invariant)." }, async () => {
  const sc = (N) => [[N - DAY, (e, t) => ls.checkout(e, t, { status: "on_trial", renewsAt: N + 2 * DAY, trialEndsAt: N + 2 * DAY + 9 * HOUR })],
    [N + 6 * DAY, (e, t) => ls.pay(e, t, { invoice: `i1_${e}` })], [N + 6 * DAY + MIN, (e, t) => ls.update(e, t, { status: "active", renewsAt: N + 36 * DAY })]];
  const r = await runCase(sc, { kind: "EXPIRED", product: "monthly", endAt: N + DAY }, { now0: N });
  assert.equal(r.firstFail, null, verdict(r));
});

test("CE-E owner hand-extends a late LS renewal past renewal-grace's cap; App Store monthly EXPIRED", async () => {
  const P = N - 6 * DAY;
  const sc = (N) => [...paidMonthly(P), [N - 2 * DAY, (e) => db.prepare("UPDATE users SET tier='pro', pro_expires_at=? WHERE email=?").run(new Date(P + 14 * DAY).toISOString(), e), "owner: UPDATE pro_expires_at = P+14d"]];
  const r = await runCase(sc, { kind: "EXPIRED", product: "monthly", endAt: N }, { now0: N });
  assert.equal(r.firstFail, null, verdict(r));
});

test("CE-F past_due subscription_updated delivered 2 days after its updated_at (LS dashboard resend); App Store monthly EXPIRED", { todo: "the dunning floor is rebuilt from LS updated_at; a resent event delivered later gave the TWIN a floor from its delivery time. Up to the delivery delay." }, async () => {
  const P = N - 4 * DAY;
  const sc = (N) => [...paidMonthly(P), [N - DAY, (e, t) => ls.update(e, t, { status: "past_due", renewsAt: P, updatedAt: N - 3 * DAY }), "LS past_due (resent)"]];
  const r = await runCase(sc, { kind: "EXPIRED", product: "monthly", endAt: N - DAY }, { now0: N });
  assert.equal(r.firstFail, null, verdict(r));
});

// ---- the grid: every scenario × five ways the App Store purchase ends × five end times ----
const N0 = Date.now();
const ENDS = [-5, -1 / 24, 3, 9, 21];
const KINDS = [
  { kind: "REFUND", product: "monthly", buy: 5 },
  { kind: "EXPIRED", product: "monthly" },
  { kind: "DID_FAIL_TO_RENEW", product: "monthly" },
  { kind: "REFUND", product: "yearly", buy: 20 },
  { kind: "REFUND", product: "lifetime", buy: 5 },
];
const GRID_KNOWN = {
  "NEW LS late -> grace -> charge fails -> past_due": "CE-A (see above)",
  "LS trial real shape (trial_end 9h after renews_at)": "CE-D (see above)",
  "LS trial real shape, converts 4 days late": "CE-D (see above)",
};
for (const [name, sc] of Object.entries(SCENARIOS)) {
  const opts = GRID_KNOWN[name] ? { todo: GRID_KNOWN[name] } : {};
  test(`grid: ${name}`, opts, async () => {
    const failures = [];
    for (const k of KINDS) {
      for (const endD of ENDS) {
        const endAt = N0 + endD * DAY;
        const r = await runCase(sc, { kind: k.kind, product: k.product, endAt, buyAt: endAt - (k.buy || 0) * DAY }, { now0: N0 });
        if (r.firstFail) failures.push(`${k.kind}/${k.product} ending at ${endD.toFixed(2)}d: ${r.firstFail} (lock-out ${r.lockoutHours} h, unpaid ${r.unpaidHours} h)\n${r.log.slice(0, 8).join("\n")}`);
      }
    }
    assert.equal(failures.length, 0, failures.slice(0, 3).join("\n\n"));
  });
}
