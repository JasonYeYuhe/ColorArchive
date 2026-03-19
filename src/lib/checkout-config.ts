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
    provider: "Stripe Payment Link",
    url: null,
    status: "pending",
    note: "Paste the final Stripe Payment Link here when the product is ready to sell.",
  },
  "content-creator-bundle": {
    provider: "Lemon Squeezy",
    url: null,
    status: "pending",
    note: "Use Lemon Squeezy if this becomes a shareable creator-facing digital download.",
  },
  "palette-pack-vol-1": {
    provider: "Lemon Squeezy",
    url: "https://colorarchive.lemonsqueezy.com/checkout/buy/99c655d3-7408-4cbd-b4ed-b04fa15af1f6",
    status: "live",
    note: "Palette Pack Vol. 1 — live on Lemon Squeezy.",
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
