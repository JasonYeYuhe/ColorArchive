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
    url: null,
    status: "pending",
    note: "Complete Archive Token Set — pending checkout setup.",
  },
  "dark-mode-ui-kit": {
    provider: "Lemon Squeezy",
    url: null,
    status: "pending",
    note: "Dark Mode UI Kit — pending checkout setup.",
  },
  "seasonal-spring-2026": {
    provider: "Lemon Squeezy",
    url: null,
    status: "pending",
    note: "Seasonal: Spring 2026 — pending checkout setup.",
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
