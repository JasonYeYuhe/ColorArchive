// Checkout configuration — Lemon Squeezy subscription-only model.
// Variant IDs will be filled in after Lemon Squeezy store approval.

export interface CheckoutFlowConfig {
  cancelPath: string;
  successPath: string;
}

export const proSubscriptionConfig = {
  monthly: {
    price: "¥499",
    period: "month" as const,
    trialDays: 0,
    variantId: "", // Lemon Squeezy variant ID — pending approval
    note: "Pro monthly subscription",
  },
  yearly: {
    price: "¥3,999",
    period: "year" as const,
    trialDays: 0,
    savings: "33%",
    variantId: "", // Lemon Squeezy variant ID — pending approval
    note: "Pro yearly subscription",
  },
  lifetime: {
    price: "¥9,999",
    period: "lifetime" as const,
    earlyBird: true,
    regularPrice: "¥12,999",
    variantId: "", // Lemon Squeezy variant ID — pending approval
    note: "Pro lifetime — early bird pricing",
  },
} as const;

export type ProPlan = keyof typeof proSubscriptionConfig;

export const checkoutFlowConfig: CheckoutFlowConfig = {
  successPath: "/thanks",
  cancelPath: "/cancel",
};

/**
 * Generate a Lemon Squeezy checkout URL for a given variant.
 * Once the store is approved, this will return the hosted checkout overlay URL.
 */
export function getCheckoutUrl(plan: ProPlan): string | null {
  const storeSlug = process.env.NEXT_PUBLIC_LS_STORE_SLUG ?? "";
  const variantId = proSubscriptionConfig[plan].variantId;
  if (!storeSlug || !variantId) return null;
  return `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}`;
}
