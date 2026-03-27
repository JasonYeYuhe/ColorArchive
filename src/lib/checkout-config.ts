// Checkout configuration for all products.
// All products are configured with Stripe Checkout (JPY pricing).
// To switch providers: update `provider` and `stripePriceId` per entry below.

export type CheckoutProvider = "Stripe";

export interface CheckoutConfigEntry {
  note: string;
  provider: CheckoutProvider;
  status: "ready" | "pending";
  stripePriceId: string;
}

export interface WaitlistConfig {
  contactEmail: string;
  note: string;
  provider: "Email" | "Buttondown" | "ConvertKit" | "Mailchimp";
  url: string | null;
}

export interface CheckoutFlowConfig {
  cancelPath: string;
  successPath: string;
}

export const checkoutConfig = {
  "palette-pack-vol-1": {
    provider: "Stripe",
    stripePriceId: "price_1TFR1pGzX2t5YKIzymEBf5Wc",
    status: "ready",
    note: "Palette Pack Vol. 1 — ¥599",
  },
  "brand-starter-kit": {
    provider: "Stripe",
    stripePriceId: "price_1TFR1qGzX2t5YKIz01JvhSc1",
    status: "ready",
    note: "Brand Color Starter Kit — ¥1,499",
  },
  "content-creator-bundle": {
    provider: "Stripe",
    stripePriceId: "price_1TFR1qGzX2t5YKIzNSZljxBi",
    status: "ready",
    note: "Creator Bundle — ¥999",
  },
  "complete-archive": {
    provider: "Stripe",
    stripePriceId: "price_1TFR1rGzX2t5YKIzzq74qnH8",
    status: "ready",
    note: "Complete Archive Token Set — ¥2,499",
  },
  "dark-mode-ui-kit": {
    provider: "Stripe",
    stripePriceId: "price_1TFR1rGzX2t5YKIzmHmxxJZI",
    status: "ready",
    note: "Dark Mode UI Kit — ¥999",
  },
  "seasonal-spring-2026": {
    provider: "Stripe",
    stripePriceId: "price_1TFR1sGzX2t5YKIzBu5zuMSJ",
    status: "ready",
    note: "Seasonal: Spring 2026 — ¥299",
  },
  "all-access-bundle": {
    provider: "Stripe",
    stripePriceId: "price_1TFR1sGzX2t5YKIzUvpoOKZp",
    status: "ready",
    note: "All Access Bundle — ¥3,999",
  },
} satisfies Record<string, CheckoutConfigEntry>;

export type CheckoutProductId = keyof typeof checkoutConfig;

export const proSubscriptionConfig = {
  monthly: {
    price: "¥499",
    period: "month",
    trialDays: 3,
    stripePriceId: "price_1TFR1tGzX2t5YKIzi3MGUVxy",
    note: "Pro monthly subscription",
  },
  yearly: {
    price: "¥3,999",
    period: "year",
    trialDays: 3,
    savings: "33%",
    stripePriceId: "price_1TFR1tGzX2t5YKIzlj8hT5za",
    note: "Pro yearly subscription",
  },
} as const;

export const checkoutFlowConfig: CheckoutFlowConfig = {
  successPath: "/thanks",
  cancelPath: "/cancel",
};

export const waitlistConfig: WaitlistConfig = {
  provider: "Email",
  url: null,
  contactEmail: "hello@colorarchive.me",
  note:
    "Use direct email capture until a dedicated waitlist provider is connected. Replace this with a hosted form URL later if needed.",
};
