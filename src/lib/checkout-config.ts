// Checkout configuration — Lemon Squeezy subscription-only model.

export interface CheckoutFlowConfig {
  cancelPath: string;
  successPath: string;
}

/** Lemon Squeezy store slug — used to build checkout URLs. */
const LS_STORE_SLUG = "colorarchive";

export const proSubscriptionConfig = {
  monthly: {
    price: "¥499",
    period: "month" as const,
    trialDays: 3,
    variantId: "59d0c0b3-a368-440b-942c-0c53a8f3d64b",
    note: "Pro monthly subscription",
  },
  yearly: {
    price: "¥3,999",
    period: "year" as const,
    trialDays: 3,
    savings: "33%",
    variantId: "72fe6359-636e-4675-a0d6-c03b70154b68",
    note: "Pro yearly subscription",
  },
  lifetime: {
    price: "¥9,999",
    period: "lifetime" as const,
    earlyBird: true,
    regularPrice: "¥12,999",
    variantId: "235af9d9-2263-47e5-8de9-29712ed39965",
    note: "Pro lifetime — early bird pricing",
  },
} as const;

export type ProPlan = keyof typeof proSubscriptionConfig;

export const checkoutFlowConfig: CheckoutFlowConfig = {
  successPath: "/thanks",
  cancelPath: "/cancel",
};

/**
 * Generate a Lemon Squeezy checkout URL for a given plan.
 */
export function getCheckoutUrl(plan: ProPlan): string | null {
  const variantId = proSubscriptionConfig[plan].variantId;
  if (!variantId) return null;
  return `https://${LS_STORE_SLUG}.lemonsqueezy.com/checkout/buy/${variantId}`;
}
