// Checkout configuration for all products.
// Supports Stripe and Gumroad. Set `activeProvider` to switch globally.
// Gumroad product URLs must be configured on gumroad.com first.

export type CheckoutProvider = "Stripe" | "Gumroad";

/** Change this to switch the active payment provider site-wide. */
export const activeProvider: CheckoutProvider = "Gumroad";

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
    gumroadProductUrl: "https://5465438432684.gumroad.com/l/palette-pack-vol-1",
    status: "ready",
    note: "Palette Pack Vol. 1 — ¥599",
  },
  "brand-starter-kit": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1qGzX2t5YKIz01JvhSc1",
    gumroadProductUrl: "https://5465438432684.gumroad.com/l/brand-starter-kit",
    status: "ready",
    note: "Brand Color Starter Kit — ¥1,499",
  },
  "content-creator-bundle": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1qGzX2t5YKIzNSZljxBi",
    gumroadProductUrl: "https://5465438432684.gumroad.com/l/content-creator-bundle",
    status: "ready",
    note: "Creator Bundle — ¥999",
  },
  "complete-archive": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1rGzX2t5YKIzzq74qnH8",
    gumroadProductUrl: "https://5465438432684.gumroad.com/l/complete-archive",
    status: "ready",
    note: "Complete Archive Token Set — ¥2,499",
  },
  "dark-mode-ui-kit": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1rGzX2t5YKIzmHmxxJZI",
    gumroadProductUrl: "https://5465438432684.gumroad.com/l/dark-mode-ui-kit",
    status: "ready",
    note: "Dark Mode UI Kit — ¥999",
  },
  "seasonal-spring-2026": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1sGzX2t5YKIzBu5zuMSJ",
    gumroadProductUrl: "https://5465438432684.gumroad.com/l/seasonal-spring-2026",
    status: "ready",
    note: "Seasonal: Spring 2026 — ¥299",
  },
  "all-access-bundle": {
    provider: activeProvider,
    stripePriceId: "price_1TFR1sGzX2t5YKIzUvpoOKZp",
    gumroadProductUrl: "https://5465438432684.gumroad.com/l/all-access-bundle",
    status: "ready",
    note: "All Access Bundle — ¥3,999",
  },
} satisfies Record<string, CheckoutConfigEntry>;

export type CheckoutProductId = keyof typeof checkoutConfig;

export const proSubscriptionConfig = {
  monthly: {
    price: "¥499",
    period: "month",
    trialDays: 0,
    stripePriceId: "price_1TFR1tGzX2t5YKIzi3MGUVxy",
    note: "Pro monthly subscription",
  },
  yearly: {
    price: "¥3,999",
    period: "year",
    trialDays: 0,
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
