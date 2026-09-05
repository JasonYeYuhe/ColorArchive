/**
 * Google Ads conversion reporting.
 *
 * ── WHY THIS FILE EXISTS (2026-09-06) ────────────────────────────────────────
 * The Google Ads tag has been in app/layout.tsx since before this file, but it
 * only ever ran `gtag('config', 'AW-11416473237')` — a page view. A repo-wide
 * grep for `gtag('event'` returned nothing, so in the tag's whole life it has
 * never told Google Ads that anything happened. That is exactly what the Ads UI
 * means by "Set up conversion tracking to enable campaign optimization".
 *
 * The consequence is not cosmetic. Without a conversion signal, Smart Bidding
 * has nothing to bid toward: the campaign optimises for clicks it cannot value,
 * on a keyword as broad as "color". Every pound spent buys traffic chosen by a
 * model that has never been told what a good visitor looks like.
 *
 * ── WHY THE LABELS COME FROM ENV ─────────────────────────────────────────────
 * A conversion label is minted inside the Ads account (Goals → Conversions →
 * the action → "Tag setup" → the `send_to` value looks like AW-11416473237/AbC…).
 * It is account data, not code, and it cannot be guessed. Each is read as a
 * LITERAL `process.env.X` member so Next inlines it at build time — a computed
 * key would silently evaluate to undefined in the browser.
 *
 * ── UNSET IS LOUD, NOT SILENT ────────────────────────────────────────────────
 * The 2026-08-31 mis-charge happened because an unset NEXT_PUBLIC_* degraded
 * quietly for five days. So an unset label here warns at BUILD time, and you can
 * verify the deployed state from the build product without opening a dashboard:
 *
 *   curl -s https://colorarchive.org/thanks/ | grep -o '/_next/static/chunks/[^"]*\.js' \
 *     | sort -u | while read c; do curl -s "https://colorarchive.org$c"; done \
 *     | grep -o 'env\.NEXT_PUBLIC_GADS_[A-Z_]*'
 *
 * A label that IS set disappears from that output (replaced by its string); one
 * that is not set survives as the literal member expression. Same positive
 * control as the checkout URLs.
 */

/** The account-level tag id, already loaded in app/layout.tsx. */
const ADS_ID = "AW-11416473237";

/**
 * One entry per conversion action configured in Google Ads.
 *
 * `purchase` is the money event and should be the campaign's PRIMARY action.
 * `checkout_click` is a micro-conversion and should be marked SECONDARY
 * ("observation only") — it exists because this account will never see enough
 * purchases to train bidding on its own, and a bid strategy starved of data is
 * worse than no bid strategy. Do not let Google optimise toward the micro one.
 */
const CONVERSION_LABELS = {
  purchase: process.env.NEXT_PUBLIC_GADS_PURCHASE_LABEL,
  checkout_click: process.env.NEXT_PUBLIC_GADS_CHECKOUT_LABEL,
} as const;

export type AdsConversion = keyof typeof CONVERSION_LABELS;

if (typeof window === "undefined") {
  const missing = (Object.keys(CONVERSION_LABELS) as AdsConversion[]).filter(
    (k) => !CONVERSION_LABELS[k],
  );
  if (missing.length > 0) {
    console.warn(
      `[google-ads] No conversion label for: ${missing.join(", ")}. Those conversions ` +
        `will NOT be reported and the campaign cannot optimise. Set ` +
        `NEXT_PUBLIC_GADS_PURCHASE_LABEL / NEXT_PUBLIC_GADS_CHECKOUT_LABEL in Vercel ` +
        `and REDEPLOY (NEXT_PUBLIC_* are inlined at build time).`,
    );
  }
}

/**
 * Report a conversion to Google Ads. Never throws, never blocks, and is a no-op
 * when the label is unconfigured — a missing label must not break a purchase
 * confirmation page.
 *
 * `value`/`currency` are sent when known so the Ads account can report revenue
 * rather than just counts. Pro is billed in JPY.
 */
export function reportAdsConversion(
  kind: AdsConversion,
  opts?: { value?: number; currency?: string; transactionId?: string },
): void {
  if (typeof window === "undefined") return;
  const label = CONVERSION_LABELS[kind];
  if (!label) return;

  try {
    // Reproduce the official snippet's shape exactly: gtag reads `arguments`,
    // and gtag.js is loaded with strategy="lazyOnload", so at the moment a
    // visitor lands on /thanks/ the library may not have parsed yet. Pushing the
    // arguments object onto dataLayer is what makes the call survive that gap —
    // gtag.js drains the queue when it loads.
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    const push = (...args: unknown[]) => {
      // The official snippet pushes the `arguments` object. gtag.js reads each
      // queued item as array-like — [0] command, [1] name, [2] params — so a
      // rest array is indistinguishable to it, and it type-checks.
      w.dataLayer!.push(args);
    };
    push("event", "conversion", {
      send_to: `${ADS_ID}/${label}`,
      ...(opts?.value !== undefined ? { value: opts.value } : {}),
      ...(opts?.currency ? { currency: opts.currency } : {}),
      ...(opts?.transactionId ? { transaction_id: opts.transactionId } : {}),
    });
  } catch {
    // Analytics must never break the page it measures.
  }
}
