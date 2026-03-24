// Checkout configuration for all products.
// All 7 products are published in Lemon Squeezy with JPY pricing and hosted checkout URLs.
// The store is still in review while Test mode remains enabled, so treat these as checkout-ready
// links pending store activation rather than fully public live checkout.
// Test mode can be switched from the bottom-left toggle in the Lemon Squeezy dashboard once the store is approved.
// For hosted product checkouts, set the Confirmation modal button link and receipt CTA to https://colorarchive.me/thanks/
// Do not assume a product-level cancel redirect exists in the current hosted product UI.
// To switch providers: update `provider` and `url` per entry below.
export type CheckoutProvider = "Lemon Squeezy" | "Stripe Payment Link";

export interface CheckoutConfigEntry {
  note: string;
  provider: CheckoutProvider;
  status: "ready" | "pending";
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
    status: "ready",
    note: "Brand Color Starter Kit — published in Lemon Squeezy, pending store activation.",
  },
  "content-creator-bundle": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/3e147f06-4f49-48f2-b404-a92ed4d2b905",
    status: "ready",
    note: "Creator Bundle — published in Lemon Squeezy, pending store activation.",
  },
  "palette-pack-vol-1": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/99c655d3-7408-4cbd-b4ed-b04fa15af1f6",
    status: "ready",
    note: "Palette Pack Vol. 1 — published in Lemon Squeezy, pending store activation.",
  },
  "complete-archive": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/78609f8d-1a2b-45da-ba39-af50f8fa0795",
    status: "ready",
    note: "Complete Archive Token Set — published in Lemon Squeezy, pending store activation.",
  },
  "dark-mode-ui-kit": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/5dca2881-8d8d-457e-8b74-89a1444ef517",
    status: "ready",
    note: "Dark Mode UI Kit — published in Lemon Squeezy, pending store activation.",
  },
  "seasonal-spring-2026": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/b10990ee-3a5c-430c-b6bf-0bfbb2d37d6d",
    status: "ready",
    note: "Seasonal: Spring 2026 — published in Lemon Squeezy, pending store activation.",
  },
  "all-access-bundle": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/320433d4-537a-4f5e-b1ca-40e3cf0ea97c",
    status: "ready",
    note: "All Access Bundle — published in Lemon Squeezy, pending store activation.",
  },
} satisfies Record<string, CheckoutConfigEntry>;

export const proSubscriptionConfig = {
  monthly: {
    price: "$4.99",
    period: "month",
    url: null as string | null, // Set when Lemon Squeezy / Stripe subscription product is created
    note: "Pro monthly subscription — pending product creation in payment provider.",
  },
  yearly: {
    price: "$39.99",
    period: "year",
    savings: "33%",
    url: null as string | null,
    note: "Pro yearly subscription — pending product creation in payment provider.",
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
