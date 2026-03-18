import { checkoutConfig, type CheckoutProvider } from "@/src/lib/checkout-config";

export interface PackFulfillment {
  method: string;
  timeline: string;
  steps: string[];
  fileNote: string;
}

export interface PalettePack {
  audience: string;
  checkoutNote: string;
  checkoutProvider: CheckoutProvider;
  checkoutStatus: "live" | "pending";
  checkoutUrl: string | null;
  ctaLabel: string;
  deliverables: string[];
  detail: string;
  faqs: {
    answer: string;
    question: string;
  }[];
  fulfillment: PackFulfillment;
  launchAssets: string[];
  formatList: string[];
  id: string;
  previewCollectionIds: string[];
  previewCollections: string[];
  priceHint: string;
  proofPoints: string[];
  reviewNote: string;
  sampleDownloads: {
    format: string;
    href: string;
    label: string;
  }[];
  title: string;
}

export const palettePacks: PalettePack[] = [
  {
    id: "palette-pack-vol-1",
    title: "Palette Pack Vol. 1",
    priceHint: "$12–24",
    ctaLabel: "Start here",
    audience: "Designers and founders who want polished palettes they can apply immediately.",
    checkoutProvider: checkoutConfig["palette-pack-vol-1"].provider,
    checkoutStatus: checkoutConfig["palette-pack-vol-1"].status,
    checkoutUrl: checkoutConfig["palette-pack-vol-1"].url,
    checkoutNote: checkoutConfig["palette-pack-vol-1"].note,
    previewCollections: ["Quiet Luxury", "Modern Seaside", "Editorial Warmth", "Forest Terrain"],
    previewCollectionIds: ["quiet-luxury", "modern-seaside", "editorial-warmth", "forest-terrain"],
    formatList: ["CSS variables", "Tailwind tokens", "PNG boards", "Usage notes"],
    deliverables: [
      "8 curated five-color palette boards",
      "Copy-ready CSS variable exports",
      "Tailwind token snippets for fast setup",
      "A short PDF-style usage guide",
    ],
    faqs: [
      {
        question: "What does the buyer actually receive?",
        answer:
          "A downloadable bundle of curated palettes, token exports, and quick usage guidance derived from live ColorArchive collections.",
      },
      {
        question: "Is this aimed at developers or designers?",
        answer:
          "Both. The full pack is intended to bridge design direction and implementation by shipping visual boards and code-friendly tokens together.",
      },
    ],
    fulfillment: {
      method: "Instant download via checkout provider",
      timeline: "Delivered immediately after payment confirmation",
      steps: [
        "Complete checkout on the provider page (Lemon Squeezy or Stripe).",
        "Receive a confirmation email with a secure download link.",
        "Download the ZIP bundle — no account required.",
        "Unzip to find palette boards, CSS tokens, JSON data, and the usage guide.",
      ],
      fileNote:
        "The bundle includes: 12 PNG palette boards, a CSS variables file, a JSON data export, Tailwind token snippets, and a short usage PDF. All files are named and documented inside the ZIP.",
    },
    launchAssets: ["Product examples page", "Collection previews", "Static shareable URLs"],
    proofPoints: [
      "Every palette is already visible on the public site.",
      "Collections can be copied today as text and CSS variables.",
      "The product is a direct packaging of existing archive value.",
    ],
    reviewNote:
      "Best first paid product because it is concrete, low-risk, and already backed by public examples.",
    sampleDownloads: [
      {
        label: "Preview CSS tokens",
        format: "CSS",
        href: "/downloads/palette-pack-vol-1-preview.css",
      },
      {
        label: "Preview JSON data",
        format: "JSON",
        href: "/downloads/palette-pack-vol-1-preview.json",
      },
    ],
    detail:
      "A first paid drop built from your strongest collections. Small enough to ship quickly, concrete enough to test demand.",
  },
  {
    id: "brand-starter-kit",
    title: "Brand Color Starter Kit",
    priceHint: "$29–59",
    ctaLabel: "Brand & UI",
    audience: "Solo founders, small studios, and landing-page builders who need a coherent starting system.",
    checkoutProvider: checkoutConfig["brand-starter-kit"].provider,
    checkoutStatus: checkoutConfig["brand-starter-kit"].status,
    checkoutUrl: checkoutConfig["brand-starter-kit"].url,
    checkoutNote: checkoutConfig["brand-starter-kit"].note,
    previewCollections: ["Quiet Luxury", "Nocturne Tech", "Orchid Bloom", "Nordic Frost"],
    previewCollectionIds: ["quiet-luxury", "nocturne-tech", "orchid-bloom", "nordic-frost"],
    formatList: ["Brand palette sets", "Light/dark pairings", "Landing-page presets", "Export tokens"],
    deliverables: [
      "Primary, secondary, and accent palette groups",
      "Light/dark interface pairings",
      "CTA and campaign accent recommendations",
      "Export-ready token sheets",
    ],
    faqs: [
      {
        question: "Who is the best fit for this kit?",
        answer:
          "Founders, solo builders, and small teams that need a coherent starting palette for a landing page or lightweight brand system.",
      },
      {
        question: "How is this different from the lower-priced pack?",
        answer:
          "It is less about exploration and more about structured application: pairings, contrast roles, and page-level usage guidance.",
      },
    ],
    fulfillment: {
      method: "Instant download via checkout provider",
      timeline: "Delivered immediately after payment confirmation",
      steps: [
        "Complete checkout on the provider page (Lemon Squeezy or Stripe).",
        "Receive a confirmation email with a secure download link.",
        "Download the ZIP bundle — no account required.",
        "Unzip to find palette sets, pairing guides, token sheets, and usage notes.",
      ],
      fileNote:
        "The bundle includes: primary/secondary/accent palette groups, light and dark pairings, CTA accent recommendations, export-ready CSS token sheets, and page-level usage notes. All labeled and ready to apply.",
    },
    launchAssets: ["Pack overview", "Collection source sets", "Support page offer framing"],
    proofPoints: [
      "Built from palette families already live in the archive.",
      "Matches the exact use case described on the Support page.",
      "Can point to an off-site checkout without adding backend complexity.",
    ],
    reviewNote:
      "Higher-ticket offer aimed at real landing pages and brand refresh work rather than generic swatches.",
    sampleDownloads: [
      {
        label: "Preview theme tokens",
        format: "CSS",
        href: "/downloads/brand-starter-kit-preview.css",
      },
      {
        label: "Preview usage notes",
        format: "TXT",
        href: "/downloads/brand-starter-kit-preview.txt",
      },
    ],
    detail:
      "A more premium pack aimed at founders and designers who need a coherent starting point rather than one-off swatches.",
  },
  {
    id: "content-creator-bundle",
    title: "Creator Bundle",
    priceHint: "$19–39",
    ctaLabel: "For creators",
    audience: "Creators, marketers, and social designers who need visually consistent color sets fast.",
    checkoutProvider: checkoutConfig["content-creator-bundle"].provider,
    checkoutStatus: checkoutConfig["content-creator-bundle"].status,
    checkoutUrl: checkoutConfig["content-creator-bundle"].url,
    checkoutNote: checkoutConfig["content-creator-bundle"].note,
    previewCollections: ["Modern Seaside", "Orchid Bloom", "Candy Pop"],
    previewCollectionIds: ["modern-seaside", "orchid-bloom", "candy-pop"],
    formatList: ["Social palette cards", "Wallpaper assets", "Prompt-ready color sets", "Mini guide"],
    deliverables: [
      "Social-ready palette boards",
      "Wallpaper and background color sets",
      "Prompt-friendly descriptive palette text",
      "Mini usage guide for content workflows",
    ],
    faqs: [
      {
        question: "Why is this useful for creators?",
        answer:
          "It shortens the gap between a color idea and a publishable asset by packaging ready-to-use palette combinations and prompt-friendly descriptions.",
      },
      {
        question: "Could this also work as a free lead magnet?",
        answer:
          "Yes. The same bundle structure can be used as a paid product or as a lighter free sample to collect interest before releasing bigger packs.",
      },
    ],
    fulfillment: {
      method: "Instant download via checkout provider",
      timeline: "Delivered immediately after payment confirmation",
      steps: [
        "Complete checkout on the provider page (Lemon Squeezy or Stripe).",
        "Receive a confirmation email with a secure download link.",
        "Download the ZIP bundle — no account required.",
        "Unzip to find palette cards, wallpaper sets, prompt notes, and the mini guide.",
      ],
      fileNote:
        "The bundle includes: social-ready PNG palette boards, wallpaper and background color sets, prompt-friendly descriptive text for each palette, and a mini usage guide for content workflows.",
    },
    launchAssets: ["Word → Color generator", "Surprise route", "Collection previews"],
    proofPoints: [
      "Ties directly into the existing word-to-color and discovery flows.",
      "Easy to position as a creator-facing digital download.",
      "Has a natural free-to-paid upgrade story.",
    ],
    reviewNote:
      "Useful as either a paid bundle or a lead-generation product because it is highly shareable.",
    sampleDownloads: [
      {
        label: "Preview creator palette",
        format: "JSON",
        href: "/downloads/content-creator-bundle-preview.json",
      },
      {
        label: "Preview prompt notes",
        format: "TXT",
        href: "/downloads/content-creator-bundle-preview.txt",
      },
    ],
    detail:
      "More visual and shareable. Good for creators, social designers, and as a list-building product.",
  },
];
