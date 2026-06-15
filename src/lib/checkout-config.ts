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
    priceUsd: "$6.99",
    period: "month" as const,
    trialDays: 3,
    note: "Pro monthly subscription",
  },
  yearly: {
    price: "¥3,999",
    currency: "JPY" as const,
    priceUsd: "$49.99",
    period: "year" as const,
    trialDays: 3,
    savings: "33%",
    note: "Pro yearly subscription",
  },
  lifetime: {
    price: "¥19,999",
    currency: "JPY" as const,
    priceUsd: "$199.99",
    period: "lifetime" as const,
    note: "Pro lifetime — one-time purchase",
  },
} as const;

export const teamPlanConfig = {
  monthly: {
    price: "¥1,499",
    currency: "JPY" as const,
    period: "month" as const,
    seats: 5,
    note: "Team Pro — 5 seats",
  },
  yearly: {
    price: "¥11,999",
    currency: "JPY" as const,
    period: "year" as const,
    seats: 5,
    savings: "33%",
    note: "Team Pro yearly — 5 seats",
  },
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
// Pre-order is honest: an upcoming feature with a ship-by date and a full refund if it
// doesn't ship. Kill criterion lives in docs/human-todo.md.
export const preorderConfig = {
  feature: "Accessibility Auditor",
  tagline: "Audit an entire palette or design system for accessibility in one pass.",
  // Billed in JPY (the store currency), referencing the existing Pro price scale
  // (¥3,999/yr ≈ the "$49.99" tier). Founder ¥4,999, regular ¥9,999 at launch.
  price: "¥4,999",
  regularPrice: "¥9,999",
  shipBy: "Q3 2026",
  checkoutUrl: process.env.NEXT_PUBLIC_PREORDER_CHECKOUT_URL || null,
} as const;

// ---- Provider implementations ----

/** Lemon Squeezy — single product with 3 variants; customer picks on checkout page */
const LS_STORE_SLUG = "colorarchive";
const LS_CHECKOUT_URL = `https://${LS_STORE_SLUG}.lemonsqueezy.com/checkout/buy/771b252b-14d2-45ed-b4d5-b9f39f0883f8`;

const lemonsqueezyProvider: ProviderConfig = {
  name: "Lemon Squeezy",
  checkoutMode: "redirect",
  getCheckoutUrl() {
    return LS_CHECKOUT_URL;
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
