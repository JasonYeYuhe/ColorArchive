#!/usr/bin/env node
/**
 * Link an App Store purchase that reached no account to the account that made it.
 *
 *   node server/scripts/link-apple-purchase.cjs --user-id=48 --txn=2000001234567890           # dry run
 *   node server/scripts/link-apple-purchase.cjs --user-id=48 --txn=2000001234567890 --apply   # write
 *
 * The transaction must already be in apple_unlinked_transactions, which only a
 * notification whose Apple signature VERIFIED can write — so product, purchase date
 * and expiry come from Apple, never from this command line. The write is the same
 * grantApplePurchase() the app's own sync uses (server/apple-grant.js), lifetime
 * guard included.
 *
 * Choosing the account is the part that needs evidence, and this script cannot supply
 * it. The trail that works (2026-09-16): nginx `POST /auth/apple-purchase 401` within
 * seconds of the purchase time, from an IP whose `POST /auth/request-link` calls map to
 * magic_link_tokens.user_id. The daily digest prints the same recipe.
 */

const path = require("path");
const SERVER_DIR = path.resolve(__dirname, "..");
const Database = require(path.join(SERVER_DIR, "node_modules/better-sqlite3"));
const { linkUnlinkedTransaction } = require(path.join(SERVER_DIR, "apple-grant"));

const arg = (name) => (process.argv.find((a) => a.startsWith(`--${name}=`)) || "").split("=")[1];
const APPLY = process.argv.includes("--apply");
const userId = Number(arg("user-id"));
const txnId = arg("txn");
if (!Number.isInteger(userId) || userId <= 0 || !txnId) {
  console.error("usage: link-apple-purchase.cjs --user-id=<id> --txn=<originalTransactionId> [--apply]");
  process.exit(2);
}

const DB_PATH = process.env.DB_PATH || path.join(SERVER_DIR, "data.db");
const db = new Database(DB_PATH, { readonly: !APPLY });

try {
  const { before, plan, after } = linkUnlinkedTransaction(db, { userId, txnId, apply: APPLY });
  console.log("transaction:", plan);
  console.log("user before:", before);
  if (APPLY) {
    console.log("user after: ", after);
  } else {
    console.log("\n--dry-run: nothing written. Re-run with --apply to link.");
  }
} catch (e) {
  console.error(`refused: ${e.message}`);
  process.exit(1);
}
