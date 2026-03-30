// Checkout configuration for all products.
// Supports Stripe and Gumroad. Set `activeProvider` to switch globally.
// Gumroad product URLs must be configured on gumroad.com first.

export type CheckoutProvider = "Stripe" | "Gumroad";

/** Change this to switch the active payment provider site-wide. */
export const activeProvider: CheckoutProvider = "Stripe";

export interface CheckoutConfigEntry {
  note: string;
  provider: CheckoutProvider;
  status: "ready" | "pending";
  stripePriceId: string;
  gumroadProductUrl: string | null;
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
    provider: activeProvider,
    stripePriceId: "price_1TFR1pGzX2t5YKIzymEBf5Wc",
    gumroadProductUrl: null, // TODO: set after creating product on Gumroad
    status: "ready",
    note: "Palette Pack Vol. 1 — ¥599",
  },
  "brand-starter-kit": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1qGzX2t5YKIz01JvhSc1",
    gumroadProductUrl: null,
    status: "ready",
    note: "Brand Color Starter Kit — ¥1,499",
  },
  "content-creator-bundle": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1qGzX2t5YKIzNSZljxBi",
    gumroadProductUrl: null,
    status: "ready",
    note: "Creator Bundle — ¥999",
  },
  "complete-archive": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1rGzX2t5YKIzzq74qnH8",
    gumroadProductUrl: null,
    status: "ready",
    note: "Complete Archive Token Set — ¥2,499",
  },
  "dark-mode-ui-kit": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1rGzX2t5YKIzmHmxxJZI",
    gumroadProductUrl: null,
    status: "ready",
    note: "Dark Mode UI Kit — ¥999",
  },
  "seasonal-spring-2026": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1sGzX2t5YKIzBu5zuMSJ",
    gumroadProductUrl: null,
    status: "ready",
    note: "Seasonal: Spring 2026 — ¥299",
  },
  "all-access-bundle": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1sGzX2t5YKIzUvpoOKZp",
    gumroadProductUrl: null,
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
