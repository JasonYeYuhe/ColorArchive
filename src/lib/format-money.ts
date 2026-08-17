/**
 * One money formatter, taking one unit, used by every surface that shows money.
 *
 * THE BUG THIS REPLACES
 * On 2026-08-17 the admin dashboard displayed this site's only real revenue —
 * a $3.47 subscription — as **$0.03**. Nothing was wrong with the payment or the
 * database; three layers simply disagreed about what `amount` meant:
 *
 *   1. server/routes/webhook.js stores `amount = Math.round(amountMinor / 100)`,
 *      so `orders.amount` is the rounded MAJOR unit (347 -> 3). server/db.js says
 *      so explicitly: "`amount` stays the rounded major-unit figure for display".
 *   2. server/routes/analytics.js summed that column.
 *   3. Both dashboards then divided by 100 again, treating it as minor units.
 *
 * JPY hid it for four months. Yen is zero-decimal, so the old code skipped the
 * divide for JPY and those rows looked right, while every decimal currency was
 * shown at 1/100 of its value. The only non-JPY order the site has ever taken is
 * the one real one.
 *
 * This is the same failure as `date` meaning five things in the notes pipeline,
 * and it gets the same fix: name the unit, put it in one place, and test it.
 * `amount_minor` is the audit-grade column added for exactly this (2026-07-22,
 * b506809) — every money query now reports it and every formatter consumes it.
 *
 * THE UNIT IS ALWAYS x100, INCLUDING YEN. Lemon Squeezy sends minor units scaled
 * by 100 for every currency, JPY included, even though yen has no minor unit
 * (server/db.js, and server/scripts/gate-report.cjs which already divided
 * uniformly and was the one report printing the right number). So ¥187 arrives
 * as 18700 and $3.47 as 347, and both divide by 100. Zero-decimal currencies
 * differ only in how many fraction digits are DISPLAYED, never in the divisor —
 * conflating those two things is what broke it.
 */

/** Currencies conventionally shown without decimal places. */
const ZERO_DECIMAL_DISPLAY = new Set(["JPY", "KRW"]);

/**
 * Format an exact minor-unit amount. Never pass `orders.amount` to this — that
 * column is major units; pass `amount_minor` (or the API fields derived from it).
 */
export function formatMinorCurrency(minorAmount: number, currency: string) {
  const normalized = (currency || "USD").toUpperCase();
  const isZeroDecimal = ZERO_DECIMAL_DISPLAY.has(normalized);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalized,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(minorAmount / 100);
}
