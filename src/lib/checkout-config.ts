/**
 * Multi-provider checkout configuration.
 *
 * Switch providers via NEXT_PUBLIC_PAYMENT_PROVIDER env var.
 * Pricing data is provider-agnostic — only checkout URL generation differs.
 */

// ---- Provider types ----

export type PaymentProvider = "lemonsqueezy" | "paddle" | "paypal" | "none";

export type ProPlan = "monthly" | "yearly" | "lifetime";

export interface CheckoutFlowConfig {
  cancelPath: string;
  successPath: string;
}

interface ProviderConfig {
  name: string;
  getCheckoutUrl: (plan: ProPlan) => string | null;
  getBillingPortalUrl: () => string | null;
  checkoutMode: "redirect" | "server-session";
}

// ---- Provider-agnostic pricing ----

export const proSubscriptionConfig = {
  monthly: {
    price: "¥499",
    currency: "JPY" as const,
    // USD labels are approximate (billing is JPY) at ~150 JPY/USD — keep in sync if FX drifts a lot.
    priceUsd: "$3.49",
    period: "month" as const,
    trialDays: 3,
    note: "Pro monthly subscription",
  },
  yearly: {
    price: "¥3,999",
    currency: "JPY" as const,
    priceUsd: "$26.99",
    period: "year" as const,
    trialDays: 3,
    savings: "33%",
    note: "Pro yearly subscription",
  },
  lifetime: {
    price: "¥19,999",
    currency: "JPY" as const,
    priceUsd: "$129",
    period: "lifetime" as const,
    note: "Pro lifetime — one-time purchase",
  },
} as const;

// NOTE: a `teamPlanConfig` (Team Pro, ¥1,499/mo · ¥11,999/yr, 5 seats) used to sit
// here. It was a priced SKU nobody could buy: `ProPlan` has no "team" member, no
// checkout variant existed, and no page ever rendered it — the only reference in
// the whole repo was its own definition. Removed 2026-08-18. Do not re-add pricing
// for a plan before the thing that sells it exists; a price with no checkout is a
// promise the site cannot keep.

/**
 * Refund terms. Stated in two places that MUST agree — the /support FAQ and the
 * 特定商取引法 disclosure at /commerce-disclosure — and they did not:
 * /support advertised a 7-day money-back guarantee while the legally-binding
 * disclosure said digital goods were non-refundable. Resolved in favour of the
 * promise a buyer actually relies on at purchase time; advertising a guarantee
 * and then refusing it is the worse failure, and the disclosure is required to
 * describe the policy we actually run.
 *
 * `price-copy.test.ts` fails if either page states a different window.
 */
export const refundPolicy = {
  moneyBackDays: 7,
  /** No proration of the unused remainder — cancelling keeps access to the end
   *  of the paid period instead (server/entitlement.js enforces that half). */
  proratesOnCancel: false,
} as const;

export const checkoutFlowConfig: CheckoutFlowConfig = {
  successPath: "/thanks",
  cancelPath: "/cancel",
};

// ---- Willingness-to-pay experiment: pre-order a future Pro feature ----
//
// This is a validation test, not a live product. The goal is a REAL signal that a
// designer will commit money to an upcoming capability — which a free email waitlist
// does not give. When `checkoutUrl` is set (create a Lemon Squeezy "pre-order" product,
// then put its checkout URL in NEXT_PUBLIC_PREORDER_CHECKOUT_URL), the page shows a
// card-required "Pre-order" button = the real test. Until then it falls back to an
// email capture ("reserve your founder price") = a weaker, but live, signal.
//
// Pre-order was an honest willingness-to-pay test for an upcoming feature.
//
// CLOSED 2026-07-24. The 07-15 exit gate returned STOP (0 of the 10 required
// pre-orders after the traffic was connected), so the Auditor was off-ramped
// per dev-plan-2026-06-19 §5 — but the sell surfaces stayed live for another
// four days and 3 people still reached the ¥4,999 checkout. Nobody paying was
// luck, not design: shipping nothing after taking money is the one outcome we
// will not risk.
//
// `closed` is a hardcoded kill switch ON PURPOSE. `checkoutUrl` comes from a
// NEXT_PUBLIC_ env var that is baked in at build time, and clearing it merely
// falls back to the "reserve your founder price" email capture — i.e. still
// promising a product we are not building. Everything that could take money or
// collect intent must be gated on `closed` first, in code, so no deploy-time
// env state can resurrect it.
export const preorderConfig = {
  feature: "Accessibility Auditor",
  tagline: "Audit an entire palette or design system for accessibility in one pass.",
  // Billed in JPY (the store currency). Founder ¥4,999 (≈ $33), regular ¥9,999 (≈ $67) at launch.
  price: "¥4,999",
  regularPrice: "¥9,999",
  // Approximate USD (billing is JPY) at ~150 JPY/USD — for display only.
  priceUsd: "$33",
  regularPriceUsd: "$67",
  shipBy: "Q3 2026",
  closed: true,
  closedOn: "2026-07-24",
  checkoutUrl: process.env.NEXT_PUBLIC_PREORDER_CHECKOUT_URL || null,
} as const;

// ---- Provider implementations ----

/**
 * Lemon Squeezy — one product (981696) with 3 published variants.
 *
 * 🔴 CORRECTED 2026-09-06. This block used to call `LS_CHECKOUT_URL` "the product-level
 * buy link" that "opens the hosted page with a variant PICKER". That is FALSE, and the
 * false version made the id41 mis-charge look like a subtle attribution gap when it is
 * something much blunter. Measured by fetching the URL and decoding the checkout page's
 * own Inertia payload:
 *
 *   isMultiVariant: false
 *   cart.items:     [ { variant_id: 1540585, variant.name: "ColorArchive Pro — Monthly",
 *                       price: 49900 } ]
 *
 * There is no picker. The uuid 771b252b… is the MONTHLY VARIANT'S OWN SLUG (Lemon Squeezy
 * also reports it as the product's `buy_now_url`, which is how the wrong reading arose).
 * So the fallback did not "default to monthly" — it could only ever sell monthly. Anyone
 * sent there after pressing "yearly" was buying a ¥499/mo subscription, full stop.
 *
 * `checkout_clicked{plan}` still records what was pressed, and the webhook still records
 * what was bought (it string-matches `variant_name`; see app/api/webhook/route.ts).
 *
 * `LS_PLAN_CHECKOUT_URLS` fixes that by giving each plan its own variant-level buy link.
 * Values come from env because they are store data, not code (owner: LS dashboard →
 * the variant → Share → copy link). Each is read as a LITERAL `process.env.X` member
 * access — Next.js inlines NEXT_PUBLIC_* at build time by static analysis, so a computed
 * key like `process.env[name]` would silently evaluate to undefined in the browser.
 *
 * THE LIVE STORE, read 2026-09-06 from the checkout payload (isTestMode: false). Prices
 * are minor units and each one matches `proSubscriptionConfig` above:
 *
 *   variant 1540585  771b252b-14d2-45ed-b4d5-b9f39f0883f8  Monthly   ¥499     published
 *   variant 1540561  afa1271a-0b82-4346-bee3-ad37af963410  Yearly    ¥3,999   published
 *   variant 1540570  00e86059-6879-479a-a0af-2c1aa4010a2a  Lifetime  ¥19,999  published
 *   variant 1540588  f06bb51b-3159-47ec-a8b9-ce1fae981bdf  "Default" ¥499     PENDING — unused
 *
 * Both /buy/<uuid> and /checkout/buy/<uuid> resolve to the same cart. Each link above was
 * confirmed by loading it and asserting the resulting cart's variant_id AND price, with
 * monthly as the positive control — not by copying a uuid out of a dashboard.
 *
 * The fourth row is the reason to be careful here. `app/api/webhook/route.ts:41` warns that
 * LS may report a single-variant order's `variant_name` as "Default", which would fail both
 * `includes("lifetime")` and `includes("pro")` and drop a paid order on the floor. That risk
 * was REFUTED rather than assumed: `orders` rows 26–30 on the production box were written by
 * the `variantName.includes("pro")` branch at route.ts:308, which cannot execute unless LS
 * sent the real variant name. Five orders, 2026-07-22 → 2026-09-03.
 */
const LS_STORE_SLUG = "colorarchive";
/** The MONTHLY variant's buy link. Not a picker — see the block above. */
const LS_CHECKOUT_URL = `https://${LS_STORE_SLUG}.lemonsqueezy.com/checkout/buy/771b252b-14d2-45ed-b4d5-b9f39f0883f8`;

const LS_PLAN_CHECKOUT_URLS: Record<ProPlan, string | undefined> = {
  monthly: process.env.NEXT_PUBLIC_PRO_MONTHLY_CHECKOUT_URL,
  yearly: process.env.NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL,
  lifetime: process.env.NEXT_PUBLIC_PRO_LIFETIME_CHECKOUT_URL,
};

/**
 * Which plans may fall back to the hardcoded MONTHLY variant link, and which must not.
 *
 * ── WHAT THIS COST (2026-08-31) ──────────────────────────────────────────────
 * The fallback used to be unconditional: `LS_PLAN_CHECKOUT_URLS[plan] || LS_CHECKOUT_URL`,
 * with the comment "a missing env var must not disable the button". That is right
 * for monthly and wrong for everything else, because that link IS the monthly variant
 * and sells monthly no matter which button was pressed. Customer id41 pressed "yearly" twice (08-31
 * 09:07 and 09:09) and was charged ¥500 on the MONTHLY variant — invoice
 * lsinv_8357021. We under-billed by ~¥3,500 and, worse, the customer believes they
 * bought a year and will be surprised at the 2026-10-03 renewal.
 *
 * ── WHY MONTHLY MAY STILL FALL BACK ──────────────────────────────────────────
 * Not a guess, and now understood exactly: the fallback URL resolves to variant
 * 1540585 "ColorArchive Pro — Monthly" and nothing else, so for the monthly button
 * the promise and the charge agree by construction. All three external subscriptions
 * in the site's history arrived through it and all three are monthly. For yearly and
 * lifetime the same link silently sells a different product than the button promised —
 * so those return null, and CheckoutButton renders a disabled control rather than
 * a working button to the wrong thing.
 *
 * ── WHY NOT A QUERY PARAM ────────────────────────────────────────────────────
 * Lemon Squeezy selects a variant by PATH — each variant has its own /buy/<uuid>
 * (equivalently /checkout/buy/<uuid>) link — not by query string. There is no
 * `?variant=` to append, and inventing one would produce a URL that looks right and
 * silently ignores the parameter, i.e. sells monthly again.
 *
 * ── DONE 2026-09-06: ALL THREE ARE NOW SET IN VERCEL PRODUCTION ──────────────
 * Added with `vercel env add <NAME> production --no-sensitive --value <url>`.
 * `--no-sensitive` is deliberate and is not a downgrade: NEXT_PUBLIC_* is compiled
 * into the client bundle and visible to every visitor, so there is nothing to
 * protect, and the default (sensitive) makes the value UNREADABLE afterwards —
 * `vercel env pull` returns an empty string for it. That empty string is a trap:
 * it looks exactly like "the value failed to save". The control that settles it is
 * NEXT_PUBLIC_POSTHOG_KEY, which also pulls back empty while PostHog demonstrably
 * works in production. Non-sensitive means the value can be read back and checked.
 *
 * A REDEPLOY IS NOT OPTIONAL (NEXT_PUBLIC_* is inlined at build time) AND IS NOT
 * AUTOMATIC. vercel.json runs scripts/vercel-ignore.sh, which decides from
 * `git diff --name-only`; an env-only change touches no file, so a deploy triggered
 * without a source-file commit is CANCELLED by that gate and goes Ready with the
 * OLD (undefined) value. This file is not in the METADATA regex, so committing it
 * is what forces the build.
 *
 * Verify from the build product, never from the dashboard:
 *
 *   curl -s https://colorarchive.org/pro/ | grep -o '/_next/static/chunks/[^"]*\.js' \
 *     | sort -u | while read c; do curl -s "https://colorarchive.org$c"; done \
 *     | grep -o 'env\.NEXT_PUBLIC_PRO_[A-Z_]*'
 *
 * An UNSET var survives into the bundle as the literal member expression
 * `process.env.NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL` (undefined in the browser);
 * a SET one is replaced by its string. On 2026-09-05 all three printed, while
 * NEXT_PUBLIC_PREORDER_CHECKOUT_URL did not — the positive control proving the
 * mechanism works. After this change the three must STOP printing, and the
 * variant uuids must start appearing in the chunks instead. Stronger still, and
 * the check actually run on 2026-09-06: read the href off the deployed /pro/,
 * fetch it, and assert the cart's variant_id. That one cannot pass while broken.
 */
const LS_PLANS_MAY_USE_MONTHLY_FALLBACK: Record<ProPlan, boolean> = {
  monthly: true,
  yearly: false,
  lifetime: false,
};

/**
 * Build-time warning, printed once per prerender pass. Guarded on `window` so it
 * goes to the BUILD log and never to a visitor's console. This exists because the
 * failure it reports is otherwise completely silent: an unset variant link used to
 * degrade into a working button that sold the wrong plan, and it survived from
 * 2026-08-31 to 2026-09-05 precisely because nothing ever said so out loud.
 */
if (typeof window === "undefined") {
  const missing = (Object.keys(LS_PLAN_CHECKOUT_URLS) as ProPlan[]).filter(
    (plan) => !LS_PLAN_CHECKOUT_URLS[plan],
  );
  if (missing.length > 0) {
    console.warn(
      `[checkout-config] No Lemon Squeezy variant link for: ${missing.join(", ")}. ` +
        `Plans that may not use the monthly-variant fallback (` +
        `${(Object.keys(LS_PLANS_MAY_USE_MONTHLY_FALLBACK) as ProPlan[]).filter((p) => !LS_PLANS_MAY_USE_MONTHLY_FALLBACK[p]).join(", ")}` +
        `) will render as unavailable. Set NEXT_PUBLIC_PRO_<PLAN>_CHECKOUT_URL in Vercel and REDEPLOY.`,
    );
  }
}

const lemonsqueezyProvider: ProviderConfig = {
  name: "Lemon Squeezy",
  checkoutMode: "redirect",
  getCheckoutUrl(plan) {
    const variantUrl = LS_PLAN_CHECKOUT_URLS[plan];
    if (variantUrl) return variantUrl;
    // No variant link. The fallback IS the monthly variant, so only monthly may use
    // it; otherwise sell nothing rather than the wrong thing.
    return LS_PLANS_MAY_USE_MONTHLY_FALLBACK[plan] ? LS_CHECKOUT_URL : null;
  },
  getBillingPortalUrl() {
    return `https://${LS_STORE_SLUG}.lemonsqueezy.com/billing`;
  },
};

/** Paddle (Merchant of Record) — Price IDs to be filled after approval */
const paddlePriceIds: Record<ProPlan, string> = {
  monthly: "", // pending Paddle approval
  yearly: "",
  lifetime: "",
};

const paddleProvider: ProviderConfig = {
  name: "Paddle",
  checkoutMode: "redirect",
  getCheckoutUrl(plan) {
    const priceId = paddlePriceIds[plan];
    if (!priceId) return null;
    return `https://checkout.paddle.com/checkout/custom/${priceId}`;
  },
  getBillingPortalUrl() {
    return null; // Paddle provides in-app subscription management
  },
};

/** PayPal Direct — fallback option */
const paypalProvider: ProviderConfig = {
  name: "PayPal",
  checkoutMode: "server-session",
  getCheckoutUrl() {
    // PayPal requires server-side session creation via /api/checkout
    return null;
  },
  getBillingPortalUrl() {
    return "https://www.paypal.com/myaccount/autopay";
  },
};

/** No provider — show "Coming Soon" */
const noneProvider: ProviderConfig = {
  name: "None",
  checkoutMode: "redirect",
  getCheckoutUrl() {
    return null;
  },
  getBillingPortalUrl() {
    return null;
  },
};

// ---- Provider registry ----

const providers: Record<PaymentProvider, ProviderConfig> = {
  lemonsqueezy: lemonsqueezyProvider,
  paddle: paddleProvider,
  paypal: paypalProvider,
  none: noneProvider,
};

// ---- Active provider (env-driven) ----

export const activeProvider: PaymentProvider =
  (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as PaymentProvider) || "none";

export function getProviderConfig(): ProviderConfig {
  return providers[activeProvider] || noneProvider;
}

export function getCheckoutUrl(plan: ProPlan): string | null {
  return getProviderConfig().getCheckoutUrl(plan);
}

export function getBillingPortalUrl(): string | null {
  return getProviderConfig().getBillingPortalUrl();
}

export function getCheckoutMode(): "redirect" | "server-session" {
  return getProviderConfig().checkoutMode;
}

export function getProviderName(): string {
  return getProviderConfig().name;
}
