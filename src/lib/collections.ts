import { colors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";

export interface ColorCollection {
  editorialNote: string;
  description: string;
  id: string;
  palette: ColorRecord[];
  promptWords: string[];
  summary: string;
  tags: string[];
  title: string;
  useCases: string[];
}

function getColorById(id: string): ColorRecord {
  const color = colors.find((entry) => entry.id === id);

  if (!color) {
    throw new Error(`Unknown color id: ${id}`);
  }

  return color;
}

function createCollection(
  id: string,
  title: string,
  summary: string,
  description: string,
  tags: string[],
  paletteIds: string[],
  options: {
    editorialNote: string;
    promptWords: string[];
    useCases: string[];
  },
): ColorCollection {
  return {
    id,
    title,
    summary,
    description,
    tags,
    editorialNote: options.editorialNote,
    promptWords: options.promptWords,
    useCases: options.useCases,
    palette: paletteIds.map(getColorById),
  };
}

export const collections: ColorCollection[] = [
  createCollection(
    "quiet-luxury",
    "Quiet Luxury",
    "Soft neutrals and muted warm surfaces for editorial, beauty, and premium product work.",
    "A restrained palette built around pale blush, sand, oat, and deep grounding neutrals. Use it when the interface should feel expensive without becoming cold.",
    ["Editorial", "Neutral", "Luxury"],
    [
      "blush-whisper-muted",
      "apricot-pearl-soft",
      "honey-bloom-muted",
      "olive-tone-muted",
      "merlot-ink-muted",
    ],
    {
      editorialNote:
        "Use this when you need a product page or editorial surface to feel expensive, restrained, and warm rather than aggressively minimal.",
      promptWords: ["soft stone", "blush paper", "quiet hotel", "cashmere", "late daylight"],
      useCases: ["Editorial landing pages", "Beauty products", "Luxury product UI"],
    },
  ),
  createCollection(
    "modern-seaside",
    "Modern Seaside",
    "Clear coastal blues and seafoam accents with enough structure for UI and brand systems.",
    "This collection balances air, water, and contrast. It works for dashboards, travel, lifestyle products, and any surface that needs calm energy.",
    ["Coastal", "Fresh", "UI"],
    [
      "seafoam-whisper-soft",
      "lagoon-bloom-clear",
      "cerulean-silk-clear",
      "azure-core-vivid",
      "indigo-nocturne-soft",
    ],
    {
      editorialNote:
        "This set balances freshness and structure. It works when the product should feel open and coastal without becoming childish.",
      promptWords: ["salt air", "glass water", "seafoam", "clear horizon", "modern coastal"],
      useCases: ["Travel tools", "Wellness brands", "Dashboard refreshes"],
    },
  ),
  createCollection(
    "nocturne-tech",
    "Nocturne Tech",
    "Dark-spectrum product colors with enough neon contrast to feel modern, not generic.",
    "A near-black base with electric violet, cobalt, and magenta accents. Good for AI tools, music products, and technical launch pages.",
    ["Dark", "Tech", "Launch"],
    [
      "indigo-ink-muted",
      "violet-dusk-clear",
      "cobalt-core-vivid",
      "fuchsia-radiant-vivid",
      "aqua-bloom-soft",
    ],
    {
      editorialNote:
        "A dark-spectrum launch palette for technical products that need contrast and energy without falling back to generic neon-on-black styling.",
      promptWords: ["midnight glass", "signal violet", "cobalt beam", "deep interface", "tech launch"],
      useCases: ["AI tools", "Music products", "Dark-mode launches"],
    },
  ),
  createCollection(
    "editorial-warmth",
    "Editorial Warmth",
    "Paper-like warm colors for publishing, writing, storytelling, and thoughtful landing pages.",
    "The palette leans into apricot, amber, garnet, and muted olive so the page feels human and tactile rather than sterile.",
    ["Warm", "Publishing", "Storytelling"],
    [
      "apricot-whisper-soft",
      "amber-silk-soft",
      "citrine-tone-muted",
      "garnet-velvet-soft",
      "olive-dusk-muted",
    ],
    {
      editorialNote:
        "This palette introduces warmth and paper-like tactility. It is useful when the page should feel written, reflective, and human.",
      promptWords: ["paper grain", "warm margin", "publisher desk", "amber ink", "essay"],
      useCases: ["Publishing sites", "Blogs", "Narrative landing pages"],
    },
  ),
  createCollection(
    "orchid-bloom",
    "Orchid Bloom",
    "Blooming pinks and violets with a soft green counterpoint for beauty, culture, and campaign work.",
    "This set is intentionally expressive: floral, polished, and bright enough for social surfaces while still staying curated.",
    ["Campaign", "Beauty", "Expressive"],
    [
      "orchid-bloom-clear",
      "plum-radiant-clear",
      "peony-bloom-vivid",
      "rose-core-soft",
      "mint-whisper-muted",
    ],
    {
      editorialNote:
        "A brighter, campaign-ready palette with enough softness to stay curated. Good for beauty, culture, and expressive product storytelling.",
      promptWords: ["orchid light", "soft gloss", "cultural campaign", "floral neon", "beauty launch"],
      useCases: ["Campaign art direction", "Beauty brands", "Social launches"],
    },
  ),
  createCollection(
    "forest-terrain",
    "Forest Terrain",
    "Deep greens, moss, earthy browns, and stone for outdoor, editorial, and natural brand work.",
    "A palette rooted in organic outdoor materials — bark, moss, amber soil, and limestone. Use it when the brand needs to feel grounded, natural, and tactile.",
    ["Natural", "Organic", "Outdoor"],
    [
      "moss-tone-muted",
      "leaf-dusk-soft",
      "olive-silk-muted",
      "amber-velvet-soft",
      "honey-shadow-muted",
    ],
    {
      editorialNote:
        "A natural palette for outdoor gear, environmental brands, editorial spreads, and any project that needs to feel rooted in the physical world.",
      promptWords: ["forest floor", "bark texture", "mossy stone", "amber soil", "late autumn"],
      useCases: ["Outdoor brands", "Environmental campaigns", "Editorial layout"],
    },
  ),
  createCollection(
    "nordic-frost",
    "Nordic Frost",
    "Ice blue, pale grey, and soft lavender for minimal UI, SaaS products, and clean landing pages.",
    "A cool, restrained palette that feels precise and airy. Works for technical products, productivity tools, and any interface that needs to feel focused and uncluttered.",
    ["Minimal", "Clean", "UI"],
    [
      "azure-mist-muted",
      "cerulean-whisper-soft",
      "sapphire-pearl-muted",
      "iris-veil-muted",
      "cobalt-bloom-soft",
    ],
    {
      editorialNote:
        "Precision and restraint. A palette for interfaces that need to communicate clarity, focus, and intentional minimalism.",
      promptWords: ["ice fog", "pale horizon", "nordic glass", "silent white", "cool precision"],
      useCases: ["SaaS UI", "Tech landing pages", "Minimal dashboards"],
    },
  ),
  createCollection(
    "candy-pop",
    "Candy Pop",
    "Coral, lemon, mint, lavender, and sky — saturated accents for social, D2C, and campaign work.",
    "Bright, playful, and deliberately high-energy. Built for maximum visual impact on social media, e-commerce surfaces, and campaign landing pages.",
    ["Vibrant", "Playful", "Campaign"],
    [
      "coral-radiant-vivid",
      "citrine-tone-vivid",
      "mint-core-clear",
      "peony-core-vivid",
      "azure-bloom-clear",
    ],
    {
      editorialNote:
        "For when the work needs to pop. Use this palette on social surfaces, product launches, and anywhere that needs energy and immediacy.",
      promptWords: ["candy gloss", "pop art", "social launch", "neon highlight", "playful brand"],
      useCases: ["Social media", "D2C brands", "Campaign pages"],
    },
  ),
];

export function getCollectionById(id: string) {
  return collections.find((collection) => collection.id === id);
}
