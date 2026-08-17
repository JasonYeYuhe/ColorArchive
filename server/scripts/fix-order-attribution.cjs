#!/usr/bin/env node
/**
 * One-off correction to `orders`: the currency-unit bug, and the six rows that
 * are not customers.
 *
 * Run with --apply to write; without it, prints the diff and changes nothing.
 *   node server/scripts/fix-order-attribution.cjs            # dry run
 *   node server/scripts/fix-order-attribution.cjs --apply    # write
 *
 * ── 1. THE ¥18,700 QUESTION, ANSWERED FROM THE CODE ──────────────────────────
 * docs/dev-plan-2026-08-15.md §0 flagged two March rows storing amount=18700 and
 * said the repo could no longer tell whether that meant ¥18,700 or ¥187 — a
 * hundredfold difference — and that only the payment provider's dashboard could
 * settle it. It is settleable from git, and neither guess was quite right about
 * where the error came from.
 *
 * Those two rows are not Lemon Squeezy at all. Their order_ids start `gumroad_`,
 * and the handler that wrote them (app/api/gumroad-webhook/route.ts, added in
 * 065b8cd on 2026-03-31, deleted with the pack products in 00d7a04) did:
 *
 *     // Convert price string (e.g. "9.99") to cents/smallest unit
 *     const amountTotal = Math.round(parseFloat(price) * 100) || 0;
 *
 * Gumroad already sends `price` in the smallest unit of the sale currency, so
 * that multiply is wrong for every row it ever wrote. Storing 18700 means it
 * received "187". The sale was ~¥187, and `amount` is inflated 100x — the same
 * class of bug as the one fixed for Lemon Squeezy on 2026-07-22 (b506809), which
 * is why `amount_minor` exists.
 *
 * The third March row is Stripe (`pi_...`), amount=299, and matches the pack's
 * listed price of ¥299 exactly (palette-packs.ts at 065b8cd, `priceHint: "¥299"`
 * — the plan said this definition no longer existed; it is in git history).
 * Stripe reports zero-decimal currencies like JPY in whole yen, so that row is
 * already correct and only needs amount_minor filled to match the convention.
 *
 * ── 2. SIX OF THE EIGHT ORDERS ARE THE OWNER ─────────────────────────────────
 * More consequential than the unit. Of the eight rows in `orders`, six carry
 * yyyyy.yeyuhe@gmail.com or yyyyy.yeyuhe@icloud.com — the owner's own two
 * addresses. Two are already tagged attributed_source='test'; four are not, so
 * every "kept money" total quotes the owner's own payments back at him as
 * revenue. Only hayleyjunefry@gmail.com is a customer: one ¥0 trial on 07-20 and
 * one real $3.47 charge on 07-22.
 *
 * So the site has had exactly ONE paying customer, ever. That is the number the
 * §5 decision rule should be read against — "≥3 real payments" is a move from
 * one to three, not from eight to eleven.
 *
 * is_test is used as the exclusion flag by gate-report.cjs, conversion-digest.cjs
 * and routes/analytics.js, so setting it here fixes all three at once. It is a
 * flag, not a delete: the rows stay, and this is reversible.
 */

const path = require("path");
const SERVER_DIR = path.resolve(__dirname, "..");
const Database = require(path.join(SERVER_DIR, "node_modules/better-sqlite3"));

const APPLY = process.argv.includes("--apply");
const DB_PATH = process.env.DB_PATH || path.join(SERVER_DIR, "data.db");
const OWNER_EMAILS = ["yyyyy.yeyuhe@gmail.com", "yyyyy.yeyuhe@icloud.com"];

const db = new Database(DB_PATH, { readonly: !APPLY });

const before = db
  .prepare(`SELECT id, substr(created_at,1,10) d, order_id, product, amount, amount_minor, currency, is_test, email FROM orders ORDER BY created_at`)
  .all();

console.log("BEFORE:");
for (const r of before) {
  console.log(
    `  #${String(r.id).padStart(2)} ${r.d} ${String(r.product).padEnd(22)} amount=${String(r.amount).padEnd(6)} minor=${String(r.amount_minor ?? "-").padEnd(5)} ${r.currency} test=${r.is_test} ${r.email}`,
  );
}

if (!APPLY) {
  console.log("\nDRY RUN — nothing written. Re-run with --apply.");
}

const run = (label, sql, params = []) => {
  if (!APPLY) {
    const n = db.prepare(sql.replace(/^UPDATE orders SET .*? WHERE/is, "SELECT COUNT(*) c FROM orders WHERE")).get(...params);
    console.log(`  would update ${n.c} row(s) — ${label}`);
    return;
  }
  const info = db.prepare(sql).run(...params);
  console.log(`  updated ${info.changes} row(s) — ${label}`);
};

console.log(`\n${APPLY ? "APPLYING" : "PLAN"}:`);
run(
  "gumroad rows: amount is 100x, so the real smallest-unit figure IS the stored amount",
  `UPDATE orders SET amount_minor = amount WHERE order_id LIKE 'gumroad_%' AND amount_minor IS NULL`,
);
run(
  "stripe JPY row: already whole yen, fill amount_minor to match convention",
  `UPDATE orders SET amount_minor = amount * 100 WHERE order_id LIKE 'pi_%' AND amount_minor IS NULL`,
);
run(
  "owner's own addresses are not customers",
  `UPDATE orders SET is_test = 1 WHERE email IN (${OWNER_EMAILS.map(() => "?").join(",")})`,
  OWNER_EMAILS,
);

if (APPLY) {
  const real = db
    .prepare(
      `SELECT UPPER(currency) cur, COUNT(*) n, SUM(COALESCE(amount_minor, amount*100))/100.0 total
         FROM orders WHERE COALESCE(is_test,0)=0 AND COALESCE(refunded,0)=0 AND amount > 0 GROUP BY cur`,
    )
    .all();
  console.log("\nAFTER — real customer revenue, all time:");
  console.log(real.length ? real.map((r) => `  ${r.n} order(s), ${r.total.toFixed(2)} ${r.cur}`).join("\n") : "  none");
}
