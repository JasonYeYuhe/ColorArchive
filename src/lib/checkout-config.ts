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
    priceUsd: "$6.99",
    period: "month" as const,
    trialDays: 3,
    note: "Pro monthly subscription",
  },
  yearly: {
    price: "¥3,999",
    priceUsd: "$49.99",
    period: "year" as const,
    trialDays: 3,
    savings: "33%",
    note: "Pro yearly subscription",
  },
  lifetime: {
    price: "¥9,999",
    priceUsd: "$99.99",
    period: "lifetime" as const,
    earlyBird: true,
    regularPrice: "¥12,999",
    note: "Pro lifetime — early bird pricing",
  },
} as const;

export const teamPlanConfig = {
  monthly: {
    price: "¥1,499",
    period: "month" as const,
    seats: 5,
    note: "Team Pro — 5 seats",
  },
  yearly: {
    price: "¥11,999",
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

// ---- Provider implementations ----

/** Lemon Squeezy */
const LS_STORE_SLUG = "colorarchive";
const lsVariantIds: Record<ProPlan, string> = {
  monthly: "59d0c0b3-a368-440b-942c-0c53a8f3d64b",
  yearly: "72fe6359-636e-4675-a0d6-c03b70154b68",
  lifetime: "235af9d9-2263-47e5-8de9-29712ed39965",
};

const lemonsqueezyProvider: ProviderConfig = {
  name: "Lemon Squeezy",
  checkoutMode: "redirect",
  getCheckoutUrl(plan) {
    const variantId = lsVariantIds[plan];
    if (!variantId) return null;
    return `https://${LS_STORE_SLUG}.lemonsqueezy.com/checkout/buy/${variantId}`;
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
