/**
 * An App Store purchase that no account has claimed must leave a durable record,
 * and the daily digest must report it.
 *
 * 2026-09-16: an iOS customer paid while logged out of the app. The app's sync got
 * 401; Apple's server notification was the only other trace, and the handler's
 * "unknown transaction" branch logged one console line and answered 200 — which
 * tells Apple to stop retrying. (That day it never got that far: the embedded Apple
 * root was corrupt, so the notification failed verification. apple-jws.test.js
 * covers that half.)
 *
 * The route is executed for real against the real schema. Only ../apple-jws is
 * replaced, so a test can hand the handler a notification without an Apple
 * signature; verification itself is exercised in apple-jws.test.js.
 */

require("./support/route-harness").install();

const Module = require("node:module");
const test = require("node:test");
const assert = require("node:assert");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

let next = null;
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === "../apple-jws") {
    return {
      verifyNotificationPayload: async () => next.notification,
      verifySignedTransaction: async () => next.txn,
    };
  }
  return origLoad.call(this, request, ...rest);
};

const db = require("../db");
const router = require("../routes/apple-notifications");
const { callRouteChain } = require("./support/route-harness");

function notify(notificationType, txn) {
  next = {
    notification: { notificationType, subtype: null, data: { signedTransactionInfo: "stubbed" } },
    txn,
  };
  return callRouteChain(router, "post", "/v2", { body: { signedPayload: "stubbed" } });
}

function reset() {
  for (const t of ["apple_revoked_transactions", "apple_unlinked_transactions", "apple_purchases", "sessions", "magic_link_tokens", "users"]) {
    db.exec(`DELETE FROM ${t}`);
  }
}

const TXN = {
  originalTransactionId: "2000001234567890",
  transactionId: "2000001234567890",
  productId: "me.colorarchive.pro.yearly",
  purchaseDate: "2026-09-16T11:23:30.000Z",
  expiresDate: "2027-09-16T11:23:30.000Z",
  environment: "Production",
  bundleId: "me.colorarchive.app",
};

/** The digest's own SQL, taken from the script so a rewrite there is what gets tested. */
function digestUnlinkedSql() {
  const src = readFileSync(join(__dirname, "..", "scripts", "conversion-digest.cjs"), "utf8");
  const start = src.indexOf("unlinkedApple = db.prepare(");
  assert.notEqual(start, -1, "digest query for unlinked Apple purchases not found — renamed?");
  const open = src.indexOf("`", start);
  return src.slice(open + 1, src.indexOf("`", open + 1));
}

test("a verified notification for an unclaimed transaction is recorded, and repeats are counted", async () => {
  reset();
  const first = await notify("SUBSCRIBED", TXN);
  assert.equal(first.code, 200);
  assert.deepEqual(first.body, { ok: true, skipped: true });

  const row = db.prepare("SELECT * FROM apple_unlinked_transactions WHERE original_transaction_id = ?").get(TXN.originalTransactionId);
  assert.ok(row, "no durable record of an unclaimed paid transaction");
  assert.equal(row.product_id, TXN.productId);
  assert.equal(row.environment, "Production");
  assert.equal(row.purchase_date, TXN.purchaseDate);
  assert.equal(row.expires_date, TXN.expiresDate);
  assert.equal(row.last_notification_type, "SUBSCRIBED");
  assert.equal(row.times_seen, 1);

  await notify("DID_RENEW", { ...TXN, expiresDate: "2028-09-16T11:23:30.000Z" });
  const again = db.prepare("SELECT * FROM apple_unlinked_transactions WHERE original_transaction_id = ?").get(TXN.originalTransactionId);
  assert.equal(again.times_seen, 2);
  assert.equal(again.last_notification_type, "DID_RENEW");
  assert.equal(again.expires_date, "2028-09-16T11:23:30.000Z");
  assert.equal(again.purchase_date, TXN.purchaseDate, "the original purchase date must survive later notifications");
});

test("a transaction that IS linked to an account is not recorded as unlinked", async () => {
  reset();
  const { lastInsertRowid: userId } = db
    .prepare("INSERT INTO users (email) VALUES (?)")
    .run("linked@example.com");
  db.prepare(
    "INSERT INTO apple_purchases (user_id, product_id, original_transaction_id, transaction_date) VALUES (?, ?, ?, ?)",
  ).run(Number(userId), TXN.productId, TXN.originalTransactionId, TXN.purchaseDate);

  const out = await notify("DID_RENEW", TXN);
  assert.equal(out.code, 200);
  const n = db.prepare("SELECT COUNT(*) AS c FROM apple_unlinked_transactions").get().c;
  assert.equal(n, 0);
});

test("the digest reports unclaimed Production purchases only — not linked, sandbox or dismissed ones", async () => {
  reset();
  const sql = digestUnlinkedSql();

  await notify("SUBSCRIBED", TXN);
  assert.deepEqual(db.prepare(sql).all().map((r) => r.txn), [TXN.originalTransactionId], "positive control: the real case must be reported");

  await notify("SUBSCRIBED", { ...TXN, originalTransactionId: "sandbox-1", environment: "Sandbox" });
  await notify("REFUND", { ...TXN, originalTransactionId: "refunded-1" });
  await notify("EXPIRED", { ...TXN, originalTransactionId: "expired-1" });
  await notify("SUBSCRIBED", { ...TXN, originalTransactionId: "dismissed-1" });
  db.prepare("UPDATE apple_unlinked_transactions SET dismissed_at = datetime('now') WHERE original_transaction_id = 'dismissed-1'").run();
  assert.deepEqual(db.prepare(sql).all().map((r) => r.txn), [TXN.originalTransactionId]);

  // Once the customer logs in inside the app and the sync lands, the alert clears.
  const { lastInsertRowid: userId } = db.prepare("INSERT INTO users (email) VALUES (?)").run("buyer@example.com");
  db.prepare(
    "INSERT INTO apple_purchases (user_id, product_id, original_transaction_id, transaction_date) VALUES (?, ?, ?, ?)",
  ).run(Number(userId), TXN.productId, TXN.originalTransactionId, TXN.purchaseDate);
  assert.deepEqual(db.prepare(sql).all(), []);
});

test("an unlinked purchase makes the digest send on an otherwise quiet day", () => {
  const src = readFileSync(join(__dirname, "..", "scripts", "conversion-digest.cjs"), "utf8");
  const decision = src.slice(src.indexOf("const hasOpsAlert"), src.indexOf("const shouldSend"));
  assert.ok(decision.includes("unlinkedApple.length"), "the digest stays silent on quiet days, exactly when this must be said");
  assert.ok(decision.includes("unlinkedAppleError"), "a failing check must not be indistinguishable from a clean one");
});
