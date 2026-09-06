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

/**
 * 🔴 READ BEFORE SETTING NEXT_PUBLIC_GADS_PURCHASE_LABEL — DOUBLE-COUNT RISK.
 *
 * On 2026-09-06, after this file was written, the Ads account (403-639-9366)
 * was fixed directly in the UI instead. The real fault was never the code: the
 * account's website data source was still `colorarchive.me` — the domain the
 * site migrated OFF — so Google reported the tag as "Not installed yet" while
 * AW-11416473237 sat happily on colorarchive.org. Its only primary Purchase
 * action was `Page load: colorarchive.me/packs/`, i.e. a deleted route (00d7a04)
 * on a dead domain, created 3/26/2026, 0 conversions in its life, and
 * domain-locked so it could not even be repointed.
 *
 * What now exists in the account:
 *   · data source  -> colorarchive.org (tag detected as installed)
 *   · "Pro purchase — colorarchive.org/thanks", Purchase, PRIMARY, ¥499 JPY,
 *     matched on URL-starts-with. It fires from the page load, WITHOUT any code.
 *   · "Visit Packs Page" demoted to Secondary rather than deleted.
 *
 * VERIFIED END-TO-END 2026-09-06 — measured, not assumed. Loading /thanks/ in a
 * real browser issues
 *   GET www.googleadservices.com/pagead/conversion/11416473237/
 *       ?…&en=page_view&url=…colorarchive.org%2Fthanks%2F
 *       &label=XjvJCLDfie8cEJWd5sMq            -> 200
 * That label is the one Ads minted for this action (it also appears in the
 * action's own Tag Assistant link), so the ping reaches the right CONVERSION —
 * not merely the remarketing list, which is a different endpoint. To re-check,
 * load the page and filter the network log for `pagead/conversion`.
 *
 * Until that first ping the action read "Inactive" and the Purchase GOAL read
 * "Misconfigured" (red). Neither is a defect. A goal whose only primary action
 * has never received data is reported as misconfigured, and Google's own
 * troubleshooter says so outright: "this conversion action hasn't received any
 * data recently". Do NOT answer it by running the "Finish setting up conversion
 * tracking" wizard — its steps are literally "Create a conversion action" and
 * "Add site tags", so completing it with goal=Purchase mints a SECOND primary
 * Purchase action on the same page and every sale is then counted twice.
 *
 * So a purchase is ALREADY counted. If you also set
 * NEXT_PUBLIC_GADS_PURCHASE_LABEL, /thanks/ will report the conversion twice —
 * once by URL match and once by this gtag event — and Smart Bidding will believe
 * each sale is two. Before setting it, either remove the URL-based action or
 * switch it to a different event.
 *
 * `checkout_click` has no such conflict: nothing in the account matches it, so
 * NEXT_PUBLIC_GADS_CHECKOUT_LABEL is still safe to set on its own.
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
