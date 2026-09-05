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
 * Lemon Squeezy — one product with 3 variants.
 *
 * `LS_CHECKOUT_URL` is the product-level buy link: it opens the hosted page with a
 * variant PICKER, so whichever plan button you pressed, the choice is made again on
 * Lemon Squeezy's side. The button's intent is therefore dropped at the boundary —
 * `checkout_clicked{plan}` records what was pressed here, and the webhook records what
 * was actually bought (it string-matches `variant_name`; see app/api/webhook/route.ts),
 * but nothing carries the selection ACROSS. A buyer who presses "yearly" and then leaves
 * the picker on its default is indistinguishable from one who meant monthly.
 *
 * `LS_PLAN_CHECKOUT_URLS` fixes that by giving each plan its own variant-level buy link.
 * Values come from env because they are store data, not code (owner: LS dashboard →
 * the variant → Share → copy link). Each is read as a LITERAL `process.env.X` member
 * access — Next.js inlines NEXT_PUBLIC_* at build time by static analysis, so a computed
 * key like `process.env[name]` would silently evaluate to undefined in the browser.
 *
 * Unset vars fall back to the shared picker URL, so this is a no-op until the owner
 * fills them in — never a dead button.
 */
const LS_STORE_SLUG = "colorarchive";
const LS_CHECKOUT_URL = `https://${LS_STORE_SLUG}.lemonsqueezy.com/checkout/buy/771b252b-14d2-45ed-b4d5-b9f39f0883f8`;

const LS_PLAN_CHECKOUT_URLS: Record<ProPlan, string | undefined> = {
  monthly: process.env.NEXT_PUBLIC_PRO_MONTHLY_CHECKOUT_URL,
  yearly: process.env.NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL,
  lifetime: process.env.NEXT_PUBLIC_PRO_LIFETIME_CHECKOUT_URL,
};

/**
 * Which plans may fall back to the shared variant-PICKER link, and which must not.
 *
 * ── WHAT THIS COST (2026-08-31) ──────────────────────────────────────────────
 * The fallback used to be unconditional: `LS_PLAN_CHECKOUT_URLS[plan] || LS_CHECKOUT_URL`,
 * with the comment "a missing env var must not disable the button". That is right
 * for monthly and wrong for everything else, because the picker does not carry the
 * pressed plan across the boundary. Customer id41 pressed "yearly" twice (08-31
 * 09:07 and 09:09) and was charged ¥500 on the MONTHLY variant — invoice
 * lsinv_8357021. We under-billed by ~¥3,500 and, worse, the customer believes they
 * bought a year and will be surprised at the 2026-10-03 renewal.
 *
 * ── WHY MONTHLY MAY STILL FALL BACK ──────────────────────────────────────────
 * Not a guess: all three external subscriptions in the site's history arrived
 * through this exact fallback and all three are monthly. For monthly the pressed
 * intent and the picker's outcome agree, so the fallback is harmless. For yearly
 * and lifetime it silently sells a different product than the button promised —
 * so those return null, and CheckoutButton renders a disabled control rather than
 * a working button to the wrong thing.
 *
 * ── WHY NOT A QUERY PARAM ────────────────────────────────────────────────────
 * Lemon Squeezy preselects a variant by PATH (a variant-level /buy/<uuid> link
 * from the dashboard: variant → Share), not by query string. There is no
 * `?variant=` to append — searched, zero hits repo-wide, and inventing one would
 * produce a URL that looks right and silently ignores the parameter.
 *
 * ── HOW TO TURN THE OTHER TWO BACK ON ────────────────────────────────────────
 * Set NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL / NEXT_PUBLIC_PRO_LIFETIME_CHECKOUT_URL
 * in Vercel and REDEPLOY (NEXT_PUBLIC_* are inlined at build time, so a redeploy
 * is not optional). Verify from the build product, never from the dashboard:
 *
 *   curl -s https://colorarchive.org/pro/ | grep -o '/_next/static/chunks/[^"]*\.js' \
 *     | sort -u | while read c; do curl -s "https://colorarchive.org$c"; done \
 *     | grep -o 'env\.NEXT_PUBLIC_PRO_[A-Z_]*'
 *
 * An UNSET var survives into the bundle as the literal member expression
 * `process.env.NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL` (undefined in the browser);
 * a SET one is replaced by its string. On 2026-09-05 all three printed, while
 * NEXT_PUBLIC_PREORDER_CHECKOUT_URL did not — that is the positive control
 * proving the mechanism works and the values are simply missing.
 */
const LS_PLANS_MAY_USE_PICKER: Record<ProPlan, boolean> = {
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
        `Plans that may not use the shared picker (` +
        `${(Object.keys(LS_PLANS_MAY_USE_PICKER) as ProPlan[]).filter((p) => !LS_PLANS_MAY_USE_PICKER[p]).join(", ")}` +
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
    // No variant link. Only fall back where the picker's outcome matches the
    // button's promise; otherwise sell nothing rather than the wrong thing.
    return LS_PLANS_MAY_USE_PICKER[plan] ? LS_CHECKOUT_URL : null;
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
