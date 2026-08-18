/**
 * Pro pricing, for the CommonJS server.
 *
 * The single source of truth is src/lib/checkout-config.ts. The server cannot
 * import it (TypeScript + ESM on the Next side, CommonJS here), so this file
 * mirrors it — and a mirror that nobody checks is just a second source of
 * truth waiting to drift.
 *
 * It already had: three live emails quoted Pro at "$4.99/month" while the site
 * charged ¥499 ≈ $3.49. Nobody wrote a wrong number on purpose; the price
 * changed on the web surface and the emails were in another language in another
 * directory.
 *
 * So the drift is a TEST FAILURE, not a code review question:
 *   src/lib/__tests__/price-copy.test.ts parses checkout-config.ts and asserts
 *   every field below matches. Change one, change the other, or it goes red.
 */

const proPricing = {
  monthly: { price: "¥499", priceUsd: "$3.49", currency: "JPY", trialDays: 3 },
  yearly: { price: "¥3,999", priceUsd: "$26.99", currency: "JPY", trialDays: 3, savings: "33%" },
  lifetime: { price: "¥19,999", priceUsd: "$129", currency: "JPY" },
};

/** "¥499 (≈ $3.49) / month" — the phrasing every outbound mail should use, so a
 *  recipient sees the currency they will actually be charged in. Billing is JPY;
 *  the USD figure is an approximation and is labelled as one. */
function monthlyBlurb() {
  return `${proPricing.monthly.price}/month (≈ ${proPricing.monthly.priceUsd} USD)`;
}

module.exports = { proPricing, monthlyBlurb };
