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
 * parsed "187" — the same class of bug as the one fixed for Lemon Squeezy on
 * 2026-07-22 (b506809), which is why `amount_minor` exists.
 *
 * HOW FAR THAT ACTUALLY GOES — the honest limit. Adversarial review (Codex)
 * pushed back on "the sale was ¥187, case closed", and the pushback holds. The
 * code proves a duplicated x100 scaling; it does not prove the money that moved.
 * The stored currency is `jpy`, which rules out the "it was really $187.00 in
 * cents" reading, but Gumroad also supports discount codes, PPP and
 * pay-what-you-want, and a seller's own test purchase is not charged at all —
 * and both of these rows are the owner's addresses. So:
 *   - certain: `amount` is 100x too large, and the figure is the ~¥187 order of
 *     magnitude rather than ~¥18,700. That is the decision-relevant part.
 *   - unverified: the exact yen, and whether any money moved at all.
 * The Gumroad dashboard for these two sale_ids would settle it. Nothing in the
 * plan depends on the difference, because both rows are self-purchases.
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

// Every amount change names the exact order_id and asserts the value it expects
// to find. A blanket `LIKE 'gumroad_%'` would also rewrite any future row from a
// re-enabled provider, and a migration that cannot tell "already applied" from
// "unexpected data" is one that corrupts on a second run. Adversarial review
// (Codex, 2026-08-17) caught both, plus the bigger one: the first version set
// amount_minor and left `amount` at 18700, so every JPY display surface would
// have gone on printing ¥18,700.
//
// The repo convention is `amount` = rounded MAJOR unit for display, `amount_minor`
// = exact processor value which LS sends x100 for every currency including JPY
// (server/db.js). So ¥187 is amount=187, amount_minor=18700.
const AMOUNT_FIXES = [
  { order_id: "gumroad_YJS2j3xeynVUT5EtHzMMYw==", expectAmount: 18700, amount: 187, amount_minor: 18700 },
  { order_id: "gumroad_P_kAmjSlfVb7K-Zbd4-lgg==", expectAmount: 18700, amount: 187, amount_minor: 18700 },
  // Stripe JPY: `amount` was already correct whole yen; only amount_minor is missing.
  { order_id: "pi_3TGCkBGzX2t5YKIz0qs8SaJs", expectAmount: 299, amount: 299, amount_minor: 29900 },
];

console.log(`\n${APPLY ? "APPLYING" : "PLAN"}:`);

const apply = db.transaction(() => {
  for (const f of AMOUNT_FIXES) {
    const cur = db.prepare(`SELECT amount, amount_minor FROM orders WHERE order_id = ?`).get(f.order_id);
    if (!cur) {
      console.log(`  SKIP  ${f.order_id} — no such order`);
      continue;
    }
    if (cur.amount === f.amount && cur.amount_minor === f.amount_minor) {
      console.log(`  ok    ${f.order_id} — already corrected`);
      continue;
    }
    if (cur.amount !== f.expectAmount) {
      throw new Error(
        `REFUSING: ${f.order_id} has amount=${cur.amount}, expected ${f.expectAmount}. Someone else changed this row; re-derive before writing.`,
      );
    }
    console.log(`  ${APPLY ? "fix  " : "would"} ${f.order_id}: amount ${cur.amount} -> ${f.amount}, amount_minor ${cur.amount_minor ?? "NULL"} -> ${f.amount_minor}`);
    if (APPLY) {
      db.prepare(`UPDATE orders SET amount = ?, amount_minor = ? WHERE order_id = ?`).run(f.amount, f.amount_minor, f.order_id);
    }
  }

  const owned = db
    .prepare(`SELECT COUNT(*) c FROM orders WHERE email IN (${OWNER_EMAILS.map(() => "?").join(",")}) AND COALESCE(is_test,0)=0`)
    .get(...OWNER_EMAILS).c;
  console.log(`  ${APPLY ? "flag " : "would"} ${owned} owner-owned order(s) as is_test=1`);
  if (APPLY) {
    db.prepare(`UPDATE orders SET is_test = 1 WHERE email IN (${OWNER_EMAILS.map(() => "?").join(",")})`).run(...OWNER_EMAILS);
  }
});

try {
  apply();
} catch (err) {
  console.error(`\n${err.message}`);
  process.exit(1);
}

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
