// Checkout configuration for all products.
// All 6 products are currently LIVE on Lemon Squeezy (production URLs, JPY pricing).
// To disable test mode in Lemon Squeezy: app.lemonsqueezy.com → Settings → Store → disable Test mode.
// To switch providers: update `provider` and `url` per entry below.
export type CheckoutProvider = "Lemon Squeezy" | "Stripe Payment Link";

export interface CheckoutConfigEntry {
  note: string;
  provider: CheckoutProvider;
  status: "live" | "pending";
  url: string | null;
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
  "brand-starter-kit": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/99e20a70-b3b6-4cc6-95c0-3eda68e1bfe4",
    status: "live",
    note: "Brand Color Starter Kit — live on Lemon Squeezy.",
  },
  "content-creator-bundle": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/3e147f06-4f49-48f2-b404-a92ed4d2b905",
    status: "live",
    note: "Creator Bundle — live on Lemon Squeezy.",
  },
  "palette-pack-vol-1": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/99c655d3-7408-4cbd-b4ed-b04fa15af1f6",
    status: "live",
    note: "Palette Pack Vol. 1 — live on Lemon Squeezy.",
  },
  "complete-archive": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/78609f8d-1a2b-45da-ba39-af50f8fa0795",
    status: "live",
    note: "Complete Archive Token Set — live on Lemon Squeezy.",
  },
  "dark-mode-ui-kit": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/5dca2881-8d8d-457e-8b74-89a1444ef517",
    status: "live",
    note: "Dark Mode UI Kit — live on Lemon Squeezy.",
  },
  "seasonal-spring-2026": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/b10990ee-3a5c-430c-b6bf-0bfbb2d37d6d",
    status: "live",
    note: "Seasonal: Spring 2026 — live on Lemon Squeezy.",
  },
  "all-access-bundle": {
    provider: "Lemon Squeezy",
    url: null,
    status: "pending",
    note: "All Access Bundle — create on Lemon Squeezy at ¥2,999 JPY, then paste checkout URL here.",
  },
} satisfies Record<string, CheckoutConfigEntry>;

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
