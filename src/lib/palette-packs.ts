export interface PalettePack {
  checkoutProvider: "Lemon Squeezy" | "Stripe Payment Link";
  checkoutUrl: string | null;
  ctaLabel: string;
  detail: string;
  formatList: string[];
  id: string;
  previewCollections: string[];
  priceHint: string;
  title: string;
}

export const palettePacks: PalettePack[] = [
  {
    id: "palette-pack-vol-1",
    title: "Palette Pack Vol. 1",
    priceHint: "$12–24",
    ctaLabel: "Launch first",
    checkoutProvider: "Lemon Squeezy",
    checkoutUrl: null,
    previewCollections: ["Quiet Luxury", "Modern Seaside", "Editorial Warmth"],
    formatList: ["CSS variables", "Tailwind tokens", "PNG boards", "Usage notes"],
    detail:
      "A first paid drop built from your strongest collections. Small enough to ship quickly, concrete enough to test demand.",
  },
  {
    id: "brand-starter-kit",
    title: "Brand Color Starter Kit",
    priceHint: "$29–59",
    ctaLabel: "Best next step",
    checkoutProvider: "Stripe Payment Link",
    checkoutUrl: null,
    previewCollections: ["Quiet Luxury", "Nocturne Tech", "Orchid Bloom"],
    formatList: ["Brand palette sets", "Light/dark pairings", "Landing-page presets", "Export tokens"],
    detail:
      "A more premium pack aimed at founders and designers who need a coherent starting point rather than one-off swatches.",
  },
  {
    id: "content-creator-bundle",
    title: "Creator Bundle",
    priceHint: "$19–39",
    ctaLabel: "Lead magnet option",
    checkoutProvider: "Lemon Squeezy",
    checkoutUrl: null,
    previewCollections: ["Modern Seaside", "Orchid Bloom"],
    formatList: ["Social palette cards", "Wallpaper assets", "Prompt-ready color sets", "Mini guide"],
    detail:
      "More visual and shareable. Good for creators, social designers, and as a list-building product.",
  },
];
