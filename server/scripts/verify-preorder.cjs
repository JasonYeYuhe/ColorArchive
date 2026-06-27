#!/usr/bin/env node
/**
 * Repeatable integration check for the pre-order measurement/fulfillment loop
 * (dev-plan-2026-06-27 §5). Run ON THE DROPLET after deploy:
 *   node /root/ColorArchive/server/scripts/verify-preorder.cjs
 *
 * Exercises the REAL Express handlers over localhost (internal-secret auth) and
 * asserts against the live SQLite DB, then cleans up its own test rows so it can
 * be re-run. Exits non-zero if any assertion fails.
 *
 * Asserts:
 *   1. order-completed records a pre-order row (is_test=1, attributed_source='preorder',
 *      pack_id='preorder-auditor', product=pre-order name, download_url NULL).
 *   2. The gate's is_test-filtered numerator EXCLUDES the test order.
 *   3. Re-posting the same LS order id is idempotent (duplicate:true, no 2nd row).
 *   4. /subscribe with source='preorder' tags the subscriber, does NOT opt into COTD,
 *      and feeds the gate's secondary (email-reserve) numerator.
 *   5. /subscribe is per-IP rate limited (>10/min → 429).
 */
const path = require("path");
const SERVER_DIR = "/root/ColorArchive/server";
require(path.join(SERVER_DIR, "node_modules/dotenv")).config({ path: path.join(SERVER_DIR, ".env") });
const Database = require(path.join(SERVER_DIR, "node_modules/better-sqlite3"));

const PORT = process.env.PORT || 3001;
const BASE = `http://127.0.0.1:${PORT}`;
const SECRET = process.env.INTERNAL_WEBHOOK_SECRET || "";
const db = new Database(path.join(SERVER_DIR, "data.db"));

const STAMP = Date.now();
const ORDER_ID = `VERIFY_${STAMP}`;
const BUYER_EMAIL = `preorder-verify+${STAMP}@colorarchive.org`;
const RESERVE_EMAIL = `reserve-verify+${STAMP}@colorarchive.org`;

let failures = 0;
function check(name, cond, detail) {
  if (cond) {
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.log(`  FAIL  ${name}${detail ? `  — ${detail}` : ""}`);
  }
}

async function post(pathname, body, headers = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* ignore */ }
  return { status: res.status, json };
}

function cleanup() {
  db.prepare("DELETE FROM orders WHERE order_id = ?").run(ORDER_ID);
  db.prepare("DELETE FROM subscribers WHERE email IN (?, ?)").run(BUYER_EMAIL, RESERVE_EMAIL);
}

(async () => {
  if (!SECRET) { console.error("INTERNAL_WEBHOOK_SECRET missing — cannot run."); process.exit(2); }
  cleanup(); // start clean (in case a prior run aborted)

  console.log(`\n=== verify-preorder (order ${ORDER_ID}) ===`);

  // 1. Paid pre-order, test-mode
  const r1 = await post("/webhooks/order-completed", {
    email: BUYER_EMAIL,
    packId: "preorder-auditor",
    paymentIntent: ORDER_ID,
    provider: "lemonsqueezy",
    amountTotal: 4999,
    currency: "JPY",
    testMode: true,
    attributedSource: "preorder",
  }, { "x-internal-secret": SECRET });
  check("order-completed returns 200 ok", r1.status === 200 && r1.json?.ok === true, `status=${r1.status} body=${JSON.stringify(r1.json)}`);

  const row = db.prepare("SELECT * FROM orders WHERE order_id = ?").get(ORDER_ID);
  check("order row inserted", !!row, "no row found");
  if (row) {
    check("is_test = 1", row.is_test === 1, `is_test=${row.is_test}`);
    check("attributed_source = 'preorder'", row.attributed_source === "preorder", `got ${row.attributed_source}`);
    check("pack_id = 'preorder-auditor'", row.pack_id === "preorder-auditor", `got ${row.pack_id}`);
    check("product is the pre-order name", /pre-?order/i.test(row.product || ""), `got ${row.product}`);
    check("download_url is NULL (no shippable download)", row.download_url == null, `got ${row.download_url}`);
  }

  // 2. Gate numerator (is_test filtered) excludes the test order
  const inNumerator = db
    .prepare("SELECT COUNT(*) c FROM orders WHERE order_id = ? AND COALESCE(is_test,0)=0")
    .get(ORDER_ID).c;
  check("test order EXCLUDED from is_test-filtered gate numerator", inNumerator === 0, `numerator saw ${inNumerator}`);

  // 3. Idempotency: re-post same LS order id
  const r2 = await post("/webhooks/order-completed", {
    email: BUYER_EMAIL, packId: "preorder-auditor", paymentIntent: ORDER_ID,
    provider: "lemonsqueezy", amountTotal: 4999, currency: "JPY", testMode: true, attributedSource: "preorder",
  }, { "x-internal-secret": SECRET });
  check("re-post flagged duplicate", r2.json?.duplicate === true, JSON.stringify(r2.json));
  const rowCount = db.prepare("SELECT COUNT(*) c FROM orders WHERE order_id = ?").get(ORDER_ID).c;
  check("no duplicate row created", rowCount === 1, `rows=${rowCount}`);

  // 4. Email reserve path
  const r3 = await post("/subscribe", { email: RESERVE_EMAIL, source: "preorder", cotd: false });
  check("/subscribe (preorder) returns ok", r3.status === 200 && r3.json?.ok === true, `status=${r3.status}`);
  const sub = db.prepare("SELECT * FROM subscribers WHERE email = ?").get(RESERVE_EMAIL);
  check("subscriber tagged source='preorder'", sub?.source === "preorder", `got ${sub?.source}`);
  check("preorder reserver NOT opted into COTD", !sub?.cotd_subscribed, `cotd_subscribed=${sub?.cotd_subscribed}`);
  const reserves = db
    .prepare("SELECT COUNT(*) c FROM subscribers WHERE email = ? AND source='preorder' AND COALESCE(is_test,0)=0")
    .get(RESERVE_EMAIL).c;
  check("reserve feeds gate secondary numerator", reserves === 1, `count=${reserves}`);

  // 5. Rate limit: hammer /subscribe (>10/min from one IP)
  let got429 = false;
  for (let i = 0; i < 13; i++) {
    const rr = await post("/subscribe", { email: `rl-${STAMP}-${i}@colorarchive.org`, source: "free-pack", cotd: false });
    if (rr.status === 429) got429 = true;
  }
  check("/subscribe rate limit fires (429)", got429, "no 429 after 13 rapid posts");

  // cleanup (also remove the rate-limit probe rows)
  cleanup();
  db.prepare("DELETE FROM subscribers WHERE email LIKE ?").run(`rl-${STAMP}-%@colorarchive.org`);

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED ✅" : `${failures} CHECK(S) FAILED ❌`}\n`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error("verify-preorder crashed:", err);
  try { cleanup(); } catch { /* ignore */ }
  process.exit(2);
});
