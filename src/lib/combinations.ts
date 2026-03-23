import { colors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";

export type HarmonyType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "neutral-accent"
  | "monochromatic"
  | "custom";

export interface ColorCombination {
  id: string;
  name: string;
  description: string;
  useCase: string;
  harmonyType: HarmonyType;
  tags: string[];
  colorIds: string[];
  colors: ColorRecord[];
}

function getColorById(id: string): ColorRecord {
  const color = colors.find((c) => c.id === id);
  if (!color) throw new Error(`Unknown color id: ${id}`);
  return color;
}

function createCombination(
  id: string,
  name: string,
  description: string,
  useCase: string,
  harmonyType: HarmonyType,
  tags: string[],
  colorIds: string[],
): ColorCombination {
  return {
    id,
    name,
    description,
    useCase,
    harmonyType,
    tags,
    colorIds,
    colors: colorIds.map(getColorById),
  };
}

export const combinations: ColorCombination[] = [
  // ── Complementary ──────────────────────────────────────────────
  createCombination(
    "cobalt-and-amber",
    "Cobalt & Amber",
    "A bold complementary contrast between deep blue and warm amber — the classic authority-plus-energy pairing found in finance, sports, and legacy brands.",
    "Financial services, sports branding, packaging with bold shelf impact",
    "complementary",
    ["Bold", "Complementary", "Brand"],
    ["cobalt-core-clear", "amber-tone-soft", "cobalt-whisper-muted"],
  ),
  createCombination(
    "teal-and-coral",
    "Teal & Coral",
    "Teal's cool precision meets coral's warmth for a balanced complementary pair that feels modern, approachable, and vibrant without aggression.",
    "Consumer apps, wellness brands, social media design, editorial",
    "complementary",
    ["Vibrant", "Complementary", "Modern"],
    ["teal-core-clear", "coral-bloom-soft", "teal-whisper-muted"],
  ),
  createCombination(
    "indigo-and-citrine",
    "Indigo & Citrine",
    "Deep indigo anchors a palette brightened by citrine yellow — an intellectual, optimistic complementary pair with strong visual energy.",
    "EdTech, creative agencies, youth-oriented brands, premium stationery",
    "complementary",
    ["Bold", "Complementary", "Creative"],
    ["indigo-core-soft", "citrine-bloom-clear", "indigo-whisper-muted"],
  ),
  createCombination(
    "violet-and-lime",
    "Violet & Lime",
    "Electric and unconventional — violet and lime create maximum visual tension that signals disruption, creativity, and a bold brand personality.",
    "Tech startups, gaming, youth fashion, music brands",
    "complementary",
    ["Vibrant", "Complementary", "Bold"],
    ["violet-core-vivid", "lime-bloom-vivid", "violet-whisper-soft"],
  ),
  createCombination(
    "rose-and-jade",
    "Rose & Jade",
    "Soft rose meets botanical jade for a palette that balances feminine warmth with grounded naturalism — refined without being precious.",
    "Beauty, skincare, wellness retreats, wedding design, lifestyle brands",
    "complementary",
    ["Soft", "Complementary", "Botanical"],
    ["rose-bloom-soft", "jade-tone-clear", "rose-whisper-muted"],
  ),

  // ── Analogous ──────────────────────────────────────────────────
  createCombination(
    "ocean-gradient",
    "Ocean Gradient",
    "Three cool-spectrum blues from azure through teal and into jade — a seamless analogous flow evoking open water, clarity, and calm confidence.",
    "Fintech, SaaS dashboards, healthcare, travel brands",
    "analogous",
    ["Cool", "Analogous", "Calm"],
    ["azure-silk-clear", "teal-silk-clear", "jade-silk-muted"],
  ),
  createCombination(
    "sunset-palette",
    "Sunset Palette",
    "Warm coral, apricot, and amber tones blend seamlessly in this analogous trio — the burnished spectrum of late-afternoon light.",
    "Food photography, lifestyle brands, artisan products, hospitality",
    "analogous",
    ["Warm", "Analogous", "Lifestyle"],
    ["coral-bloom-soft", "apricot-bloom-soft", "amber-bloom-soft"],
  ),
  createCombination(
    "forest-floor",
    "Forest Floor",
    "Emerald, moss, and leaf create a deep botanical green sequence — layered, complex, and grounded in natural authority.",
    "Sustainability brands, outdoor products, botanical beauty, eco packaging",
    "analogous",
    ["Botanical", "Analogous", "Earthy"],
    ["emerald-tone-muted", "moss-tone-muted", "leaf-tone-soft"],
  ),
  createCombination(
    "twilight-sequence",
    "Twilight Sequence",
    "Cobalt, indigo, and violet at low lightness — the deep cool progression of dusk rendered as a moody, premium palette.",
    "Luxury tech, nightlife, cosmetics, meditation apps, creative portfolios",
    "analogous",
    ["Dark", "Analogous", "Moody"],
    ["cobalt-dusk-soft", "indigo-shadow-soft", "violet-shadow-muted"],
  ),
  createCombination(
    "ember-to-crimson",
    "Ember to Crimson",
    "A fiery analogous sequence through warm reds — ember orange bleeding into ruby and crimson for heat, energy, and urgency.",
    "Food & beverage, restaurant branding, fitness, sports, sale events",
    "analogous",
    ["Bold", "Analogous", "Warm"],
    ["ember-tone-soft", "ruby-core-clear", "crimson-core-vivid"],
  ),

  // ── Triadic ────────────────────────────────────────────────────
  createCombination(
    "primary-soft",
    "Primary Soft",
    "Red, blue, and yellow in softened form — the classic triad rendered gentle and editorial rather than primary-school primary.",
    "Children's products, creative tools, playful branding, education platforms",
    "triadic",
    ["Playful", "Triadic", "Classic"],
    ["coral-tone-soft", "cobalt-tone-soft", "citrine-tone-soft"],
  ),
  createCombination(
    "vivid-triad",
    "Vivid Triad",
    "Maximum-chroma rose, cobalt, and lime in perfect triadic balance — bold, contemporary, and impossible to ignore.",
    "Sports, gaming, youth brands, festival graphics, bold editorial",
    "triadic",
    ["Vibrant", "Triadic", "Bold"],
    ["rose-bloom-vivid", "cobalt-core-vivid", "lime-bloom-vivid"],
  ),
  createCombination(
    "muted-triad",
    "Muted Triad",
    "The same triadic geometry applied with restraint — dusty coral, slate blue, and sage green for a sophisticated, lived-in palette.",
    "Artisan brands, editorial print, premium home goods, craft packaging",
    "triadic",
    ["Muted", "Triadic", "Artisan"],
    ["coral-tone-muted", "cobalt-tone-muted", "lime-tone-muted"],
  ),

  // ── Split Complementary ─────────────────────────────────────────
  createCombination(
    "sage-and-warm",
    "Sage & Warm",
    "Teal anchors a split pair with coral and amber — the cool anchor provides stability while warm splits add approachability and energy.",
    "Wellness brands, organic food, health apps, yoga studios",
    "split-complementary",
    ["Balanced", "Split-Complementary", "Fresh"],
    ["teal-tone-muted", "coral-bloom-soft", "amber-bloom-muted"],
  ),
  createCombination(
    "indigo-split",
    "Indigo Split",
    "Deep indigo splits to citrine-yellow and apricot — a sophisticated three-way balance with intellectual depth and warm vibrancy.",
    "Creative agencies, premium publishing, luxury tech, cultural institutions",
    "split-complementary",
    ["Sophisticated", "Split-Complementary", "Premium"],
    ["indigo-dusk-soft", "citrine-bloom-clear", "apricot-tone-soft"],
  ),

  // ── Neutral + Accent ────────────────────────────────────────────
  createCombination(
    "stone-and-teal",
    "Stone & Teal",
    "A warm greige neutral ground elevated by a precise teal accent — the architect's palette: restrained, spatial, and quietly confident.",
    "Architecture, interior design, premium real estate, professional services",
    "neutral-accent",
    ["Minimal", "Neutral+Accent", "Professional"],
    ["olive-mist-muted", "olive-whisper-muted", "teal-core-clear"],
  ),
  createCombination(
    "navy-and-gold",
    "Navy & Gold",
    "Classic navy paired with warm amber-gold — the enduring institutional palette that signals trust, history, and authority.",
    "Banking, law firms, universities, government, luxury hospitality",
    "neutral-accent",
    ["Classic", "Neutral+Accent", "Trust"],
    ["cobalt-shadow-muted", "cobalt-whisper-muted", "amber-tone-soft"],
  ),
  createCombination(
    "blush-and-charcoal",
    "Blush & Charcoal",
    "Pale blush neutral ground with deep charcoal text — editorial warmth through contrast, the magazine palette brought to digital.",
    "Editorial, fashion, beauty, lifestyle publishing, premium blogs",
    "neutral-accent",
    ["Editorial", "Neutral+Accent", "Elegant"],
    ["blush-whisper-muted", "blush-mist-muted", "garnet-ink-soft"],
  ),
  createCombination(
    "warm-white-and-cobalt",
    "Warm White & Cobalt",
    "An almost-white warm background with a single cobalt action color — the SaaS product palette that feels clean, trustworthy, and modern.",
    "SaaS products, productivity tools, fintech apps, professional web UI",
    "neutral-accent",
    ["Minimal", "Neutral+Accent", "Digital"],
    ["blush-veil-muted", "blush-whisper-muted", "cobalt-core-clear"],
  ),
  createCombination(
    "sand-and-terracotta",
    "Sand & Terracotta",
    "Warm sandy neutral with a terracotta accent — the palette of Mediterranean sun and hand-formed clay, material and elemental.",
    "Ceramics, artisan food, travel brands, desert aesthetics",
    "neutral-accent",
    ["Warm", "Neutral+Accent", "Earthy"],
    ["apricot-whisper-muted", "apricot-mist-muted", "ember-tone-soft"],
  ),

  // ── Monochromatic ───────────────────────────────────────────────
  createCombination(
    "cobalt-spectrum",
    "Cobalt Spectrum",
    "A five-step cobalt scale from near-white through dark ink — the monochromatic toolkit for a blue brand from background to body text.",
    "Corporate branding, design systems, professional web UI, SaaS products",
    "monochromatic",
    ["Monochromatic", "System", "Professional"],
    ["cobalt-whisper-muted", "cobalt-silk-soft", "cobalt-core-clear", "cobalt-dusk-soft", "cobalt-ink-muted"],
  ),
  createCombination(
    "rose-scale",
    "Rose Scale",
    "Rose from delicate blush whisper to deep garnet shadow — a five-step monochromatic scale for a warm feminine brand system.",
    "Beauty, bridal, luxury fashion, cosmetics brand systems",
    "monochromatic",
    ["Monochromatic", "System", "Elegant"],
    ["rose-whisper-muted", "rose-bloom-soft", "rose-core-clear", "rose-velvet-soft", "rose-shadow-muted"],
  ),
  createCombination(
    "green-depths",
    "Green Depths",
    "Emerald from pale celery whisper through to ink depth — a botanical monochromatic scale for brands built on nature and sustainability.",
    "Sustainability, outdoor brands, botanical cosmetics, eco design systems",
    "monochromatic",
    ["Monochromatic", "Botanical", "System"],
    ["emerald-whisper-muted", "emerald-silk-soft", "emerald-core-clear", "emerald-dusk-muted", "emerald-ink-muted"],
  ),

  // ── Dark / Moody ────────────────────────────────────────────────
  createCombination(
    "midnight-studio",
    "Midnight Studio",
    "Deep blue-violet at maximum depth with a rare violet accent — the dark-mode palette for developer tools, AI products, and premium software.",
    "Developer tools, AI products, dark-mode web apps, technical SaaS",
    "analogous",
    ["Dark", "Moody", "Tech"],
    ["cobalt-nocturne-muted", "indigo-shadow-soft", "iris-dusk-soft"],
  ),
  createCombination(
    "noir-and-blush",
    "Noir & Blush",
    "Near-black garnet and merlot depths with a single pale blush highlight — theatrical contrast for editorial fashion, luxury, and film.",
    "Luxury fashion, editorial photography, film & entertainment, premium events",
    "neutral-accent",
    ["Dark", "Moody", "Luxury"],
    ["garnet-ink-soft", "merlot-shadow-muted", "blush-whisper-muted"],
  ),
  createCombination(
    "forest-noir",
    "Forest Noir",
    "The darkest greens — emerald and moss at near-black depth — for a palette that feels ancient, forested, and dramatically natural.",
    "Whisky brands, premium food, dark-mode nature apps, luxury outdoor",
    "analogous",
    ["Dark", "Botanical", "Premium"],
    ["emerald-ink-muted", "moss-nocturne-muted", "leaf-shadow-muted"],
  ),

  // ── Pastel / Soft ───────────────────────────────────────────────
  createCombination(
    "spring-pastels",
    "Spring Pastels",
    "Peony, blush, and rose at whisper softness — the palette of spring florals, tissue paper, and gentle celebration.",
    "Bridal, baby brands, spring events, greeting cards, beauty launches",
    "analogous",
    ["Soft", "Pastel", "Celebratory"],
    ["peony-whisper-soft", "rose-mist-soft", "blush-whisper-soft"],
  ),
  createCombination(
    "cotton-sky",
    "Cotton Sky",
    "Pale cerulean and azure at whisper lightness — open, airy, and optically weightless, for products that need to feel effortlessly light.",
    "Airlines, cloud services, baby products, minimalist apps, spa brands",
    "analogous",
    ["Soft", "Pastel", "Airy"],
    ["cerulean-whisper-soft", "azure-mist-soft", "sapphire-whisper-muted"],
  ),
  createCombination(
    "herb-garden",
    "Herb Garden",
    "Mint, lime, and moss at soft lightness — the gentle botanical green palette for health, organic, and fresh-food brands.",
    "Health food, supplements, organic brands, botanical skincare, wellness apps",
    "analogous",
    ["Soft", "Pastel", "Botanical"],
    ["mint-whisper-soft", "lime-mist-soft", "moss-bloom-muted"],
  ),
  createCombination(
    "mauve-and-sage",
    "Mauve & Sage",
    "Orchid-mauve and sage-green in soft tones — the contemporary wellness palette blending feminine and botanical energy.",
    "Wellness brands, yoga studios, female-founded brands, premium skincare",
    "complementary",
    ["Soft", "Wellness", "Contemporary"],
    ["orchid-mist-soft", "orchid-whisper-muted", "moss-silk-muted"],
  ),
];
