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
  checkoutStatus: "ready" | "pending";
  checkoutUrl: string | null;
  ctaLabel: string;
  deliverables: string[];
  detail: string;
  tierBadge?: string;
  seasonEnds?: string;
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
    priceHint: "¥980",
    ctaLabel: "Start here",
    tierBadge: "Best starter",
    audience: "Designers and founders who want polished palettes they can apply immediately.",
    checkoutProvider: checkoutConfig["palette-pack-vol-1"].provider,
    checkoutStatus: checkoutConfig["palette-pack-vol-1"].status,
    checkoutUrl: checkoutConfig["palette-pack-vol-1"].url,
    checkoutNote: checkoutConfig["palette-pack-vol-1"].note,
    previewCollections: ["Quiet Luxury", "Modern Seaside", "Editorial Warmth", "Forest Terrain"],
    previewCollectionIds: ["quiet-luxury", "modern-seaside", "editorial-warmth", "forest-terrain"],
    formatList: ["CSS variables", "Tailwind tokens", "SVG boards", "Gradient wallpapers", "SwiftUI", "Android XML", "Flutter Dart", "CSS-in-JS"],
    deliverables: [
      "4 curated five-color palette boards (SVG)",
      "SVG gradient wallpapers (horizontal + diagonal per collection)",
      "Copy-ready CSS variable exports",
      "Tailwind token snippets for fast setup",
      "SwiftUI, Android XML, Flutter Dart, and CSS-in-JS token exports",
      "A short usage guide with color role assignments",
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
      {
        label: "Adobe Photoshop swatches",
        format: "ACO",
        href: "/downloads/colorarchive.aco",
      },
      {
        label: "Framer design tokens",
        format: "CSS",
        href: "/downloads/colorarchive-framer-tokens.css",
      },
    ],
    detail:
      "A first paid drop built from your strongest collections. Small enough to ship quickly, concrete enough to test demand.",
  },
  {
    id: "brand-starter-kit",
    title: "Brand Color Starter Kit",
    priceHint: "¥2,480",
    ctaLabel: "Brand & UI",
    tierBadge: "Brand systems",
    audience: "Solo founders, small studios, and landing-page builders who need a coherent starting system.",
    checkoutProvider: checkoutConfig["brand-starter-kit"].provider,
    checkoutStatus: checkoutConfig["brand-starter-kit"].status,
    checkoutUrl: checkoutConfig["brand-starter-kit"].url,
    checkoutNote: checkoutConfig["brand-starter-kit"].note,
    previewCollections: ["Quiet Luxury", "Nocturne Tech", "Orchid Bloom", "Nordic Frost"],
    previewCollectionIds: ["quiet-luxury", "nocturne-tech", "orchid-bloom", "nordic-frost"],
    formatList: ["Brand palette sets", "Light/dark pairings", "Landing-page presets", "Export tokens", "Brand guides", "Psychology notes", "Mobile tokens"],
    deliverables: [
      "Primary, secondary, and accent palette groups",
      "Light/dark interface pairings",
      "CTA and campaign accent recommendations",
      "Export-ready token sheets",
      "Brand usage guides per collection (primary/secondary/accent roles, do/don't rules)",
      "Color psychology notes with mood and cultural associations",
      "SwiftUI, Android XML, Flutter Dart, and CSS-in-JS token exports",
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
    priceHint: "¥1,480",
    ctaLabel: "For creators",
    tierBadge: "Most shareable",
    audience: "Creators, marketers, and social designers who need visually consistent color sets fast.",
    checkoutProvider: checkoutConfig["content-creator-bundle"].provider,
    checkoutStatus: checkoutConfig["content-creator-bundle"].status,
    checkoutUrl: checkoutConfig["content-creator-bundle"].url,
    checkoutNote: checkoutConfig["content-creator-bundle"].note,
    previewCollections: ["Modern Seaside", "Orchid Bloom", "Candy Pop"],
    previewCollectionIds: ["modern-seaside", "orchid-bloom", "candy-pop"],
    formatList: ["SVG boards", "Gradient wallpapers", "AI prompts", "Psychology notes", "Brand guides", "Prompt-ready color sets"],
    deliverables: [
      "SVG palette boards per collection (visual color cards)",
      "SVG gradient wallpapers (horizontal + diagonal per collection)",
      "AI prompt templates per palette (3 ready-to-use prompts)",
      "Color psychology notes with mood and cultural associations",
      "Brand usage guides with primary/secondary/accent role assignments",
      "Prompt-friendly descriptive palette text for content workflows",
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
  {
    id: "complete-archive",
    title: "Complete Archive Token Set",
    priceHint: "¥3,980",
    ctaLabel: "Full archive",
    tierBadge: "Flagship",
    audience: "Design system leads and developers who need a comprehensive, production-ready color token library.",
    checkoutProvider: checkoutConfig["complete-archive"].provider,
    checkoutStatus: checkoutConfig["complete-archive"].status,
    checkoutUrl: checkoutConfig["complete-archive"].url,
    checkoutNote: checkoutConfig["complete-archive"].note,
    previewCollections: ["Quiet Luxury", "Nocturne Tech", "Sunset Boulevard", "Neon After Dark"],
    previewCollectionIds: ["quiet-luxury", "nocturne-tech", "sunset-boulevard", "neon-after-dark"],
    formatList: ["CSS variables", "Tailwind tokens", "Figma tokens", "Style Dictionary", "SCSS maps", "SwiftUI", "Android XML", "Flutter Dart", "CSS-in-JS", "Contrast reports"],
    deliverables: [
      "All 3,000+ colors in CSS variable format",
      "Complete Tailwind CSS 4 theme tokens",
      "Figma-friendly token JSON export",
      "Style Dictionary token JSON for build pipelines",
      "Structured JSON with hex, HSL, RGB for every color",
      "SCSS color maps organized by hue family",
      "SwiftUI Color extensions for iOS development",
      "Android colors.xml resource file",
      "Flutter Dart color constants",
      "CSS-in-JS theme object (styled-components / emotion)",
      "WCAG contrast ratio matrix for all collections (JSON + Markdown)",
      "AA/AAA compliance reports with recommended text/background combos",
    ],
    faqs: [
      {
        question: "Does this include every color on the site?",
        answer:
          "Yes. The complete archive ships all 3,000+ colors across every hue, lightness, and chroma combination in four production-ready formats.",
      },
      {
        question: "Can I use these tokens in my design system?",
        answer:
          "Absolutely. The tokens are structured for direct integration into CSS, Tailwind, SCSS, or any JSON-based design tool pipeline.",
      },
    ],
    fulfillment: {
      method: "Instant download via checkout provider",
      timeline: "Delivered immediately after payment confirmation",
      steps: [
        "Complete checkout on the provider page (Lemon Squeezy or Stripe).",
        "Receive a confirmation email with a secure download link.",
        "Download the ZIP bundle — no account required.",
        "Unzip to find CSS variables, Tailwind tokens, JSON data, and SCSS maps for all 3,000+ colors.",
      ],
      fileNote:
        "The bundle includes: complete CSS variables file, Tailwind CSS 4 theme tokens, structured JSON export with hex/HSL/RGB, and SCSS maps organized by hue family. All 3,000+ colors included.",
    },
    launchAssets: ["Full color catalog", "Collection previews", "Token format samples"],
    proofPoints: [
      "Every single color from the public archive in production-ready token format.",
      "Four export formats cover every major frontend workflow.",
      "The most comprehensive color token set available from ColorArchive.",
    ],
    reviewNote:
      "The premium tier product — highest price point justified by comprehensive coverage of the entire 3,000+ color catalog.",
    sampleDownloads: [
      {
        label: "Preview CSS tokens",
        format: "CSS",
        href: "/downloads/complete-archive-preview.css",
      },
      {
        label: "Preview JSON data",
        format: "JSON",
        href: "/downloads/complete-archive-preview.json",
      },
      {
        label: "Figma / Tokens Studio (nested by family)",
        format: "JSON",
        href: "/downloads/complete-archive-figma-tokens.json",
      },
      {
        label: "Style Dictionary tokens",
        format: "JSON",
        href: "/downloads/complete-archive-style-dictionary.json",
      },
      {
        label: "Adobe Photoshop swatches",
        format: "ACO",
        href: "/downloads/complete-archive.aco",
      },
      {
        label: "Framer design tokens",
        format: "CSS",
        href: "/downloads/complete-archive-framer-tokens.css",
      },
    ],
    detail:
      "The full archive in every token format. Built for design system teams that want comprehensive, production-ready color infrastructure.",
  },
  {
    id: "dark-mode-ui-kit",
    title: "Dark Mode UI Kit",
    priceHint: "¥1,480",
    ctaLabel: "Dark mode",
    tierBadge: "Most practical",
    audience: "SaaS builders and product designers who need ready-made light/dark paired token sets.",
    checkoutProvider: checkoutConfig["dark-mode-ui-kit"].provider,
    checkoutStatus: checkoutConfig["dark-mode-ui-kit"].status,
    checkoutUrl: checkoutConfig["dark-mode-ui-kit"].url,
    checkoutNote: checkoutConfig["dark-mode-ui-kit"].note,
    previewCollections: ["Nocturne Tech", "Nordic Frost", "Monochrome Studio"],
    previewCollectionIds: ["nocturne-tech", "nordic-frost", "monochrome-studio"],
    formatList: ["Light/dark CSS pairs", "Tailwind dark mode tokens", "JSON paired data", "Contrast matrix", "WCAG reports", "Usage guide"],
    deliverables: [
      "Paired light and dark mode CSS variable sets",
      "Tailwind CSS 4 dark mode theme tokens",
      "JSON export with light/dark value pairs for every color",
      "WCAG contrast ratio matrix for all color pairs (JSON)",
      "AA/AAA compliance report with recommended text/background combos (Markdown)",
      "Usage guide with contrast ratio annotations",
    ],
    faqs: [
      {
        question: "How are the light/dark pairs structured?",
        answer:
          "Each color ships with a matched light-mode and dark-mode value. CSS variables use a data-theme attribute pattern for seamless switching.",
      },
      {
        question: "Does this work with Tailwind dark mode?",
        answer:
          "Yes. The Tailwind tokens include dark: variant mappings so you can use standard Tailwind dark mode utilities out of the box.",
      },
    ],
    fulfillment: {
      method: "Instant download via checkout provider",
      timeline: "Delivered immediately after payment confirmation",
      steps: [
        "Complete checkout on the provider page (Lemon Squeezy or Stripe).",
        "Receive a confirmation email with a secure download link.",
        "Download the ZIP bundle — no account required.",
        "Unzip to find paired light/dark token files, Tailwind config, and the usage guide.",
      ],
      fileNote:
        "The bundle includes: paired light/dark CSS variable files, Tailwind dark mode tokens, JSON paired data export, and a usage guide with contrast ratio notes.",
    },
    launchAssets: ["Dark mode demos", "Light/dark comparison previews", "Token format samples"],
    proofPoints: [
      "Every palette is pre-paired for light and dark contexts.",
      "Contrast ratios are pre-checked for accessibility compliance.",
      "Drop-in Tailwind dark mode support with no manual mapping.",
    ],
    reviewNote:
      "Mid-tier product that solves a specific pain point — dark mode implementation. Strong appeal for SaaS and product teams.",
    sampleDownloads: [
      {
        label: "Preview dark mode tokens",
        format: "CSS",
        href: "/downloads/dark-mode-ui-kit-preview.css",
      },
      {
        label: "Preview paired JSON",
        format: "JSON",
        href: "/downloads/dark-mode-ui-kit-preview.json",
      },
    ],
    detail:
      "Pre-paired light and dark token sets for product teams that need dark mode without the manual mapping work.",
  },
  {
    id: "seasonal-spring-2026",
    title: "Seasonal: Spring 2026",
    priceHint: "¥480",
    ctaLabel: "Spring edition",
    tierBadge: "Limited edition",
    seasonEnds: "2026-06-21",
    audience: "Designers and creators looking for fresh, seasonal color inspiration.",
    checkoutProvider: checkoutConfig["seasonal-spring-2026"].provider,
    checkoutStatus: checkoutConfig["seasonal-spring-2026"].status,
    checkoutUrl: checkoutConfig["seasonal-spring-2026"].url,
    checkoutNote: checkoutConfig["seasonal-spring-2026"].note,
    previewCollections: ["Orchid Bloom", "Matcha & Linen", "Sunset Boulevard"],
    previewCollectionIds: ["orchid-bloom", "matcha-linen", "sunset-boulevard"],
    formatList: ["CSS variables", "Tailwind tokens", "JSON data", "Mood board notes"],
    deliverables: [
      "Spring-curated palette sets in CSS variable format",
      "Tailwind CSS 4 seasonal theme tokens",
      "JSON export with spring palette metadata",
      "Mood board notes with seasonal application guidance",
    ],
    faqs: [
      {
        question: "What makes this seasonal?",
        answer:
          "The palettes are curated specifically for spring 2026 trends — fresh greens, warm florals, and light naturals that reflect the season.",
      },
      {
        question: "Will there be other seasonal editions?",
        answer:
          "Yes. Seasonal packs are released quarterly with palettes curated for each season's trends and moods.",
      },
    ],
    fulfillment: {
      method: "Instant download via checkout provider",
      timeline: "Delivered immediately after payment confirmation",
      steps: [
        "Complete checkout on the provider page (Lemon Squeezy or Stripe).",
        "Receive a confirmation email with a secure download link.",
        "Download the ZIP bundle — no account required.",
        "Unzip to find seasonal palette tokens, JSON data, and mood board notes.",
      ],
      fileNote:
        "The bundle includes: spring-curated CSS variables, Tailwind theme tokens, JSON data with palette metadata, and mood board notes for seasonal design direction.",
    },
    launchAssets: ["Seasonal collection previews", "Mood board samples", "Spring trend notes"],
    proofPoints: [
      "Curated from the most relevant archive palettes for the current season.",
      "Low price point makes it an easy impulse purchase.",
      "Seasonal releases create recurring engagement with the archive.",
    ],
    reviewNote:
      "Entry-level seasonal product — low friction, high shareability, builds habit of returning for new editions.",
    sampleDownloads: [
      {
        label: "Preview spring tokens",
        format: "CSS",
        href: "/downloads/seasonal-spring-2026-preview.css",
      },
      {
        label: "Preview spring JSON",
        format: "JSON",
        href: "/downloads/seasonal-spring-2026-preview.json",
      },
    ],
    detail:
      "A lightweight seasonal drop with curated spring palettes. Low price, high shareability, and a reason to come back each quarter.",
  },
  {
    id: "all-access-bundle",
    title: "All Access Bundle",
    priceHint: "¥5,980",
    ctaLabel: "Best value",
    tierBadge: "Save 40%",
    audience: "Designers and developers who want everything — all 6 packs in one download at a significant discount.",
    checkoutProvider: checkoutConfig["all-access-bundle"].provider,
    checkoutStatus: checkoutConfig["all-access-bundle"].status,
    checkoutUrl: checkoutConfig["all-access-bundle"].url,
    checkoutNote: checkoutConfig["all-access-bundle"].note,
    previewCollections: ["Quiet Luxury", "Nocturne Tech", "Sunset Boulevard", "Matcha & Linen"],
    previewCollectionIds: ["quiet-luxury", "nocturne-tech", "sunset-boulevard", "matcha-linen"],
    formatList: ["CSS variables", "Tailwind tokens", "Figma tokens", "SCSS maps", "JSON data", "Dark mode pairs", "Seasonal tokens", "SVG boards", "Mobile tokens", "Contrast reports", "AI prompts"],
    deliverables: [
      "Everything from all 6 individual packs combined",
      "All 3,000+ colors in CSS, Tailwind, Figma, SCSS, and JSON formats",
      "Light/dark mode paired token sets",
      "Seasonal spring palettes with mood board notes",
      "SVG palette boards and gradient wallpapers for every collection",
      "SwiftUI, Android XML, Flutter Dart, and CSS-in-JS token exports",
      "WCAG contrast reports for all collections (JSON + Markdown)",
      "AI prompt templates and color psychology notes per collection",
      "Brand usage guides with role assignments and application rules",
    ],
    faqs: [
      {
        question: "What's included compared to buying packs separately?",
        answer:
          "You get every file from all 6 packs in a single download. Buying individually costs {INDIVIDUAL_TOTAL} — the bundle saves you {SAVINGS_PCT}%.",
      },
      {
        question: "Will future seasonal packs be included?",
        answer:
          "The bundle includes the current Spring 2026 seasonal pack. Future seasonal editions will be available as separate purchases or future bundle updates.",
      },
    ],
    fulfillment: {
      method: "Instant download via checkout provider",
      timeline: "Delivered immediately after payment confirmation",
      steps: [
        "Complete checkout on the provider page (Lemon Squeezy).",
        "Receive a confirmation email with a secure download link.",
        "Download the mega ZIP bundle — no account required.",
        "Unzip to find organized folders for each pack with all formats included.",
      ],
      fileNote:
        "The bundle includes every file from all 6 packs: CSS variables, Tailwind tokens, Figma tokens, SCSS maps, JSON data, dark mode pairs, seasonal tokens, social palette boards, brand system guides, and usage notes. All organized by pack in labeled folders.",
    },
    launchAssets: ["Full catalog", "All collection previews", "Complete format coverage"],
    proofPoints: [
      "Every single file from every pack — nothing held back.",
      "40% savings compared to buying all 6 packs individually.",
      "One download, one price, complete color infrastructure.",
    ],
    reviewNote:
      "The highest-value offer in the catalog. Targets users who see the full range and want everything without choosing.",
    sampleDownloads: [
      {
        label: "Preview CSS tokens (full archive)",
        format: "CSS",
        href: "/downloads/complete-archive-preview.css",
      },
      {
        label: "Preview dark mode pairs",
        format: "CSS",
        href: "/downloads/dark-mode-ui-kit-preview.css",
      },
      {
        label: "Preview spring tokens",
        format: "CSS",
        href: "/downloads/seasonal-spring-2026-preview.css",
      },
    ],
    detail:
      "All 6 packs in one bundle at 40% off. The simplest way to get everything ColorArchive offers.",
  },
];

export function parsePrice(priceHint: string): number {
  return Number(priceHint.replace(/[^\d.]/g, ""));
}

/** @deprecated Use parsePrice instead */
export const parsePriceYen = parsePrice;

export function computeBundleSavings(): {
  individualTotal: number;
  bundlePrice: number;
  savings: number;
  savingsPct: number;
} {
  const bundle = palettePacks.find((p) => p.id === "all-access-bundle")!;
  const individuals = palettePacks.filter((p) => p.id !== "all-access-bundle");
  const individualTotal = individuals.reduce((sum, p) => sum + parsePrice(p.priceHint), 0);
  const bundlePrice = parsePrice(bundle.priceHint);
  const savings = individualTotal - bundlePrice;
  const savingsPct = Math.round((savings / individualTotal) * 100);
  return { individualTotal, bundlePrice, savings, savingsPct };
}
