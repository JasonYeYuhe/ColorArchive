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

const colorMap = new Map(colors.map((c) => [c.id, c]));

function getColorById(id: string): ColorRecord {
  const color = colorMap.get(id);

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
  createCollection(
    "sunset-boulevard",
    "Sunset Boulevard",
    "Warm oranges, pink-golds, and sunset gradient tones for lifestyle, travel, and campaign work.",
    "A gradient palette that moves from coral glow through amber warmth to rose-tinged dusk. Built for travel, lifestyle brands, and any surface that needs golden-hour energy.",
    ["Warm", "Lifestyle", "Campaign"],
    [
      "coral-bloom-clear",
      "amber-silk-clear",
      "ruby-radiant-soft",
      "rose-pearl-soft",
      "garnet-tone-clear",
    ],
    {
      editorialNote:
        "Use this when the page needs golden-hour warmth. It works best on lifestyle, travel, and editorial surfaces that should feel aspirational and sun-touched.",
      promptWords: ["golden hour", "sunset glow", "warm gradient", "travel warmth", "amber light"],
      useCases: ["Travel campaigns", "Lifestyle brands", "Editorial hero sections"],
    },
  ),
  createCollection(
    "monochrome-studio",
    "Monochrome Studio",
    "Pure grayscale with micro-warm and micro-cool shifts for editorial, typography, and minimal UI.",
    "A near-neutral palette spanning pale mist to deep ink with subtle warm and cool undertones. Ideal for typography-first layouts and restrained editorial work.",
    ["Minimal", "Editorial", "Monochrome"],
    [
      "honey-whisper-muted",
      "azure-mist-muted",
      "olive-silk-muted",
      "cobalt-dusk-muted",
      "merlot-ink-muted",
    ],
    {
      editorialNote:
        "A studio-grade grayscale set with just enough temperature to avoid feeling dead. Good for type-heavy layouts and minimal UI where pure gray feels lifeless.",
      promptWords: ["concrete", "studio light", "newsprint", "pencil sketch", "quiet contrast"],
      useCases: ["Typography layouts", "Minimal UI systems", "Editorial design"],
    },
  ),
  createCollection(
    "neon-after-dark",
    "Neon After Dark",
    "Cyber neon colors on deep dark bases for gaming, nightlife, and bold tech products.",
    "Electric contrast between deep nocturne bases and vivid neon accents. Built for gaming interfaces, nightlife branding, and any product that needs to glow in the dark.",
    ["Neon", "Dark", "Gaming"],
    [
      "fuchsia-radiant-vivid",
      "aqua-bloom-vivid",
      "lime-bloom-clear",
      "violet-nocturne-clear",
      "cobalt-ink-soft",
    ],
    {
      editorialNote:
        "High-voltage contrast for dark interfaces. Use the vivid accents sparingly against the deep bases to create neon glow effects without becoming garish.",
      promptWords: ["neon sign", "arcade glow", "cyber night", "electric pulse", "dark interface"],
      useCases: ["Gaming interfaces", "Nightlife branding", "Bold tech products"],
    },
  ),
  createCollection(
    "matcha-linen",
    "Matcha & Linen",
    "Japanese-inspired matcha greens with warm linen and paper whites for wellness, tea, and artisan brands.",
    "A calm, crafted palette pairing soft matcha greens with warm paper tones. Designed for wellness products, tea packaging, and artisan brand surfaces that need organic warmth.",
    ["Japanese", "Wellness", "Organic"],
    [
      "moss-silk-soft",
      "leaf-bloom-muted",
      "olive-pearl-muted",
      "apricot-veil-muted",
      "honey-whisper-soft",
    ],
    {
      editorialNote:
        "A restrained, craft-forward palette inspired by Japanese tea aesthetics. Works when the surface needs to feel handmade, organic, and quietly considered.",
      promptWords: ["matcha foam", "washi paper", "ceramic glaze", "zen garden", "linen texture"],
      useCases: ["Wellness brands", "Tea and food packaging", "Artisan product pages"],
    },
  ),
  createCollection(
    "terracotta-loft",
    "Terracotta Loft",
    "Warm clay, rust, and fired earth tones for interior design, architecture, and artisan lifestyle brands.",
    "A palette drawn from kiln-fired materials — terracotta, warm stucco, dried rust, and bleached linen. It works when the brand needs to feel architectural, handcrafted, and grounded in physical material.",
    ["Warm", "Architecture", "Artisan"],
    [
      "coral-velvet-soft",
      "ember-dusk-muted",
      "ruby-shadow-muted",
      "amber-tone-soft",
      "honey-silk-muted",
    ],
    {
      editorialNote:
        "A material-forward palette for surfaces that should feel fired, aged, and handmade. Works best for interior design, architecture portfolios, home goods, and artisan food brands.",
      promptWords: ["fired clay", "warm stucco", "rust patina", "adobe wall", "kiln earth"],
      useCases: ["Interior design", "Architecture portfolios", "Home goods and artisan brands"],
    },
  ),
  createCollection(
    "ocean-abyss",
    "Ocean Abyss",
    "Deep-sea blues, teal depths, and bioluminescent accents for fintech, data, and technical product work.",
    "A palette built around the pressure and light of deep water — dark teal bases, cobalt mid-tones, and vivid aqua accents that feel electric against the depth. Designed for technical products that need to communicate sophistication and scale.",
    ["Dark", "Fintech", "Data"],
    [
      "teal-shadow-clear",
      "aqua-dusk-soft",
      "cerulean-nocturne-soft",
      "lagoon-silk-vivid",
      "cobalt-velvet-clear",
    ],
    {
      editorialNote:
        "Use this when the product needs to feel deep, technical, and precise — not just dark. The vivid aqua accent creates bioluminescent contrast against the deep bases without tipping into generic neon.",
      promptWords: ["deep ocean", "submarine light", "pressure blue", "bioluminescent", "abyssal depth"],
      useCases: ["Fintech dashboards", "Data visualization", "Sci-fi and technical products"],
    },
  ),
  createCollection(
    "concrete-modernism",
    "Concrete Modernism",
    "Cool blue-grays and deep slates for architectural, brutalist, and minimal design systems.",
    "A palette built around the tones of poured concrete, brushed steel, and overcast daylight. From pale mist at the top to near-black charcoal at the base, each step is cool and restrained — ideal for architecture portfolios, minimal SaaS products, and editorial systems where color should support structure rather than compete with it.",
    ["Minimal", "Architecture", "Neutral"],
    [
      "cerulean-whisper-muted",
      "sapphire-pearl-muted",
      "azure-tone-muted",
      "cobalt-dusk-muted",
      "indigo-shadow-muted",
    ],
    {
      editorialNote:
        "Use this when the product needs to feel structural and serious without the warmth of beige neutrals. The cool undertone reads as architectural rather than corporate.",
      promptWords: ["poured concrete", "brushed steel", "overcast daylight", "brutalist loft", "raw mineral"],
      useCases: ["Architecture portfolios", "Minimal SaaS products", "Editorial design systems"],
    },
  ),
  createCollection(
    "blossom-season",
    "Blossom Season",
    "Soft pinks, pale orchids, and warm creams for spring campaigns, beauty brands, and wedding design.",
    "A palette that moves from the palest petal whisper through warm rose silk to a grounding muted mauve. The tones share enough warmth to feel cohesive while spanning enough range to build full interfaces. Built for beauty, weddings, seasonal campaigns, and any product that should feel alive, soft, and celebratory.",
    ["Spring", "Floral", "Beauty"],
    [
      "rose-whisper-soft",
      "blush-pearl-soft",
      "orchid-bloom-clear",
      "peony-silk-soft",
      "plum-tone-muted",
    ],
    {
      editorialNote:
        "Use this when the brief calls for feminine warmth without tipping into saccharine. The muted mauve anchor grounds the lighter pinks and gives the palette editorial weight.",
      promptWords: ["cherry blossom", "morning petal", "bridal suite", "dried rose", "spring warmth"],
      useCases: ["Wedding and event design", "Beauty and skincare brands", "Spring seasonal campaigns"],
    },
  ),
  createCollection(
    "golden-hour",
    "Golden Hour",
    "Warm amber, honey, and citrine tones for photography, editorial, and brand systems that should feel luminous and alive.",
    "This collection captures the quality of late-afternoon light: a warm, slightly desaturated amber at the top, opening to clear honey and citrine as the palette moves toward mid-tones, then settling into deep ember and rich sienna for grounding. The tones work together across editorial surfaces, photography site wrappers, and warm-brand product pages.",
    ["Warm", "Editorial", "Photography"],
    [
      "amber-whisper-soft",
      "honey-bloom-clear",
      "citrine-silk-soft",
      "amber-velvet-muted",
      "ember-shadow-muted",
    ],
    {
      editorialNote:
        "Use when the brief calls for warmth that reads as luminous rather than earthy. The clear honey and citrine mid-tones keep the palette from feeling muddy — they carry enough saturation to feel alive without tipping into yellow.",
      promptWords: ["late afternoon light", "warm honey glass", "golden film", "amber hour", "warm editorial"],
      useCases: ["Photography portfolio sites", "Food and hospitality brands", "Warm editorial landing pages"],
    },
  ),
  createCollection(
    "twilight-bloom",
    "Twilight Bloom",
    "Orchid, violet, and plum tones for beauty, creative, and editorial design that needs a romantic, distinctive palette.",
    "A palette that moves from the palest whispered orchid through clear violet and iris mid-tones to a rich, muted plum base. The range covers enough lightness to support real interfaces while maintaining a consistent purple-violet character throughout. Works for beauty brands, independent creative work, wedding editorial, and any project where distinctiveness matters more than safety.",
    ["Floral", "Creative", "Beauty"],
    [
      "orchid-whisper-soft",
      "violet-pearl-clear",
      "iris-bloom-clear",
      "plum-silk-soft",
      "mulberry-nocturne-muted",
    ],
    {
      editorialNote:
        "Use this when the palette needs to feel romantic and distinctive without tipping into the candy-pink territory. The violet and iris mid-tones read as creative and independent; the muted mulberry anchor gives editorial weight.",
      promptWords: ["twilight garden", "violet silk", "orchid window", "iris field at dusk", "bloom and shadow"],
      useCases: ["Beauty and fragrance brands", "Wedding editorial", "Independent creative portfolios"],
    },
  ),
  createCollection(
    "desert-canyon",
    "Desert Canyon",
    "Warm terracotta, sandstone, and dusty sage tones for Southwest-inspired and earthy brand work.",
    "A sun-baked palette that moves from pale sand and whispered coral through rich terracotta and ember clay to deep muted garnet anchors. The palette has enough range to support editorial and UI work, and the warm neutrals give it versatility across print and screen. Best for brands that want grounded, authentic warmth without resorting to trend-chasing.",
    ["Earthy", "Warm", "Southwestern"],
    [
      "apricot-whisper-soft",
      "ember-pearl-soft",
      "coral-bloom-muted",
      "ember-tone-muted",
      "garnet-ink-muted",
    ],
    {
      editorialNote:
        "Use this when the brand needs warmth that reads as natural and material — clay pots, desert rock, dry grass at golden hour. The terracotta mid-tones are the palette's core identity; the garnet anchor gives it weight.",
      promptWords: ["canyon wall", "terracotta roof", "dry riverbed", "mesa at noon", "sandstone arch"],
      useCases: ["Southwestern and artisan brands", "Food and hospitality", "Real estate and interior design"],
    },
  ),
  createCollection(
    "midnight-forest",
    "Midnight Forest",
    "Deep emerald, mossy greens, and shadow teals for atmospheric brand work that needs depth and quiet intensity.",
    "A palette that begins in the pale, airy register of soft jade and seafoam, descends through rich emerald and teal mid-tones, and grounds in shadowed moss and deep nocturne tones. It has the range to support both light and dark design contexts. Best for brands where nature, depth, and a sense of serious calm are the primary signals — wellness retreats, sustainable brands, architectural practices.",
    ["Forest", "Deep", "Nature"],
    [
      "seafoam-whisper-soft",
      "jade-bloom-clear",
      "emerald-silk-soft",
      "teal-tone-muted",
      "moss-nocturne-muted",
    ],
    {
      editorialNote:
        "Use this when green needs to feel like a forest at night, not a meadow in afternoon sun. The emerald and teal mid-tones are the character; the muted moss anchor gives it depth without darkness.",
      promptWords: ["forest floor", "still water", "canopy shadow", "mossy stone", "midnight pine"],
      useCases: ["Sustainable and eco brands", "Wellness and retreat design", "Architectural and studio work"],
    },
  ),
  createCollection(
    "arctic-dawn",
    "Arctic Dawn",
    "Pale icy blues, cool lavenders, and whispered frost tones for clean, atmospheric, and premium interface work.",
    "A palette built from the first light of a polar morning — the soft iris and whisper-blue that appear just before full daylight arrives. The colors are quiet and luminous: pale lavenders give way to cool misted cobalt and faintly blue-tinted neutral grounds. The palette is extremely versatile across both light and dark design contexts, and the cool temperature gives it an inherent sense of precision and calm. Best for tech products, wellness apps, and premium editorial brands where sophistication is signaled through restraint.",
    ["Cool", "Minimalist", "Atmospheric"],
    [
      "iris-whisper-soft",
      "azure-veil-muted",
      "cobalt-mist-soft",
      "sapphire-bloom-soft",
      "indigo-dusk-muted",
    ],
    {
      editorialNote:
        "Use this when the brand needs to feel like the very edge of daylight — calm, precise, slightly otherworldly. The iris and azure mid-tones are the palette's character; the indigo anchor gives it depth without becoming heavy.",
      promptWords: ["polar dawn", "ice field", "frosted glass", "clear winter sky", "glacier melt"],
      useCases: ["Technology and SaaS products", "Wellness and meditation apps", "Premium editorial and editorial luxury"],
    },
  ),
  createCollection(
    "harvest-glow",
    "Harvest Glow",
    "Warm amber, honey, and coral tones capturing the last hour of afternoon light — for brands that want warmth, optimism, and energy.",
    "A palette built from the most saturated and emotionally resonant light of the day. The colors move from pale citrine and soft honey through vivid amber and clear coral to warm ember tones that suggest fire, sunset, and harvest. The palette has strong emotional associations with warmth, abundance, and movement — it is inherently energetic but can be made sophisticated by using the muted and soft variants as the primary field with vivid accents sparingly. Best for food and beverage brands, creative agencies, and consumer products where warmth and appetite appeal are primary signals.",
    ["Warm", "Energetic", "Harvest"],
    [
      "citrine-pearl-soft",
      "honey-bloom-clear",
      "amber-bloom-vivid",
      "coral-silk-clear",
      "ember-tone-soft",
    ],
    {
      editorialNote:
        "Use this when warmth needs to feel golden and abundant, not just orange. The amber-vivid and coral-clear are the palette's heart; the citrine and honey entries keep it from tipping into heaviness.",
      promptWords: ["late afternoon", "honey jar", "harvest field", "warm studio light", "amber glass"],
      useCases: ["Food and beverage brands", "Creative agencies and studios", "Consumer lifestyle products"],
    },
  ),

  createCollection(
    "sunset-terrace",
    "Sunset Terrace",
    "Warm rose, coral, and amber tones capturing the golden hour between afternoon and dusk — for brands that feel inviting, romantic, and energized.",
    "A palette assembled from the warmest, most luminous part of the day: the 45-minute window when daylight turns golden and surfaces glow with reflected rose and amber. The colors move from pale peach and soft apricot through vivid coral and clear rose to warm amber. The palette is inherently romantic and social — it carries associations with outdoor dining, warmth, celebration, and human connection. It works for hospitality, food and beverage, lifestyle apps, and any brand that wants to feel welcoming and alive without tipping into urgency or aggression. The vivid coral is the palette's heart; the pale apricot and soft rose keep it from becoming heavy.",
    ["Warm", "Romantic", "Sunset"],
    [
      "apricot-pearl-soft",
      "rose-bloom-vivid",
      "coral-silk-vivid",
      "ember-tone-clear",
      "amber-bloom-clear",
    ],
    {
      editorialNote:
        "Use this when warmth should feel social and alive rather than golden and abundant. The coral-vivid and rose-bloom are the character; apricot-pearl grounds it in softness. Avoid using all three vivid entries simultaneously — let one lead.",
      promptWords: ["terrace at dusk", "pink champagne", "warm concrete", "candlelight", "open-air restaurant"],
      useCases: ["Hospitality and restaurant brands", "Lifestyle and social apps", "Food and beverage campaigns"],
    },
  ),
  createCollection(
    "deep-tide",
    "Deep Tide",
    "Dark cerulean, deep teal, and shadowed sapphire tones for brands that need depth, authority, and quiet power without darkness.",
    "A palette built from the mid-depth ocean — not the surface shimmer, not the abyssal dark, but the zone of rich, saturated blue-green that holds light without releasing it. The colors are deeply saturated at mid-low lightness, giving them weight and authority without becoming oppressive. The teal entry provides the palette's warmth and life; the cerulean and sapphire entries anchor it in cool authority. This palette is unusually versatile for a dark-leaning scheme: it works on both light and dark UI surfaces, reads as premium in editorial contexts, and carries marine-tech, fintech, and luxury brand associations. Best for products where gravitas and sophistication matter more than approachability.",
    ["Deep", "Ocean", "Authoritative"],
    [
      "cerulean-dusk-clear",
      "teal-velvet-soft",
      "azure-shadow-soft",
      "sapphire-dusk-clear",
      "cobalt-nocturne-muted",
    ],
    {
      editorialNote:
        "Use this when blue needs weight and depth rather than clarity and openness. The teal-velvet brings warmth so the palette does not read as cold. Pair with near-white (#f8fafb) on light surfaces or deep charcoal (#111827) on dark ones.",
      promptWords: ["deep water", "midnight research vessel", "pressure gauge", "sonar screen", "tide before storm"],
      useCases: ["Fintech and data products", "Marine and environmental organizations", "Premium technology brands"],
    },
  ),
];
export function getCollectionById(id: string) {
  return collections.find((collection) => collection.id === id);
}

// Collections appended by autopilot

collections.push(
  createCollection(
    "morning-ceramic",
    "Morning Ceramic",
    "Warm off-whites and barely-there naturals inspired by unglazed ceramics, linen, and early light — for minimal, Japandi-influenced, and artisan brands.",
    "A palette assembled from the quietest corner of the warm spectrum: the zone where color is present but subordinate, where warmth is felt rather than seen. The colors move from a barely-warm white through soft apricot veil and honey mist to a grounded olive whisper that anchors the palette without weight. The mood is handmade, morning, restrained — evocative of ceramic studio walls, natural linen, unbleached cotton, and warm stone. It works for artisan brands, Japandi-aesthetic e-commerce, wellness and spa identities, and any editorial system where the design must feel quiet, physical, and considered. No color in this palette announces itself; together they create an atmosphere of careful, warm stillness.",
    ["Warm", "Minimal", "Artisan"],
    [
      "apricot-whisper-soft",
      "honey-veil-muted",
      "amber-pearl-muted",
      "olive-whisper-muted",
      "coral-pearl-muted",
    ],
    {
      editorialNote:
        "Use this when warmth should be ambient rather than expressive. None of these colors should dominate — the effect comes from their combined warmth. Pair with warm dark typography (L:12-18%, hue 40-50°) rather than pure black for full palette coherence.",
      promptWords: ["unglazed ceramic", "warm linen", "morning window", "wabi-sabi studio", "handmade"],
      useCases: ["Artisan and craft brands", "Japandi and minimal e-commerce", "Wellness and spa identities"],
    },
  ),
  createCollection(
    "forest-depths",
    "Forest Depths",
    "Deep botanical greens at the threshold of shadow — emerald, jade, and moss at low lightness for premium wellness, biophilic design, and herbal brand identities.",
    "A palette built from the densest, most light-absorbing part of the green spectrum: the zone where green meets shadow and becomes something almost mineral. These are not fresh spring greens — they are old-growth greens, the color of moss on north-facing stone, deep jade water, ancient emerald in low light. The colors hold saturation even at reduced lightness, giving the palette weight and depth without darkness for its own sake. The jade and emerald entries carry cool undertones that keep the palette from reading as earthy or autumnal; the moss entry provides the warmth and groundedness. This palette works for premium herbal brands, biophilic architecture, luxury wellness identities, and any brand where the green needs to feel aged, authoritative, and deep rather than fresh, light, and springlike.",
    ["Deep", "Botanical", "Premium"],
    [
      "emerald-shadow-clear",
      "jade-velvet-soft",
      "moss-shadow-clear",
      "leaf-shadow-soft",
      "teal-shadow-muted",
    ],
    {
      editorialNote:
        "Use this when green needs gravitas rather than vitality. These colors are too dark for large light-mode surfaces but excellent as primary brand colors, hero elements, dark mode surfaces, and product photography backgrounds. Pair with warm gold or soft apricot accents for editorial richness.",
      promptWords: ["old-growth canopy", "deep moss stone", "herbal apothecary", "ancient jade", "forest floor"],
      useCases: ["Premium herbal and botanical brands", "Biophilic architecture and interior design", "Luxury wellness and spa identities"],
    },
  ),
);

collections.push(
  createCollection(
    "electric-mint",
    "Electric Mint",
    "Vivid mint, seafoam, and teal tones at full chroma for tech brands, fintech dashboards, and startup launch pages that need clean, energetic green.",
    "A palette built from the most saturated zone of the cyan-green spectrum: pure mint, seafoam, and teal at vivid and clear chroma, with lighter bloom variants for breathing room. The colors are unmistakably digital — they live in the part of the spectrum that screens render at their most luminous, where green becomes almost electric. The palette communicates freshness, innovation, and technical precision simultaneously. The mint-core-vivid is the focal point — a medium-lightness vivid mint that reads as energetic without becoming neon. The seafoam adds warmth and life; the jade grounds the palette into something more considered than a simple color pop. This palette works well for: fintech interfaces using green as a positive indicator, startup brands that want energy without the clichéd tech blue, sustainability dashboards, and any context where clean, vivid green needs to feel designed rather than accidental.",
    ["Tech", "Fresh", "Vivid"],
    [
      "mint-core-vivid",
      "seafoam-core-vivid",
      "jade-radiant-clear",
      "teal-tone-vivid",
      "lagoon-bloom-clear",
    ],
    {
      editorialNote:
        "Use when green needs to feel technological and intentional rather than natural or organic. The vivid saturation is the point — don't mute these colors. Pair with very dark typography (#0d1117) or near-white (#f0faf6) for maximum legibility against the mint tones.",
      promptWords: ["circuit board refresh", "positive delta", "growth metric", "clean energy terminal", "startup launch"],
      useCases: ["Fintech and trading dashboards", "Clean energy and sustainability brands", "Tech startup branding"],
    },
  ),
  createCollection(
    "rose-quartz",
    "Rose Quartz",
    "Soft peony, rose, and blush tones at restrained saturation for beauty brands, wellness platforms, and feminine editorial systems.",
    "A palette assembled from the warmest, most interior-facing corner of the pink spectrum: the zone between blush and dusty rose where color is present but subdued, where warmth communicates care rather than excitement. The colors are not vivid — they sit at soft and muted chroma, which gives them the quality of something worn smooth by time, like the inside of a shell or the color of skin in warm light. The rose-pearl-soft is the palette center, a mid-lightness rose that could serve as a primary card surface. The blush-mist-muted provides a near-neutral with a pink cast for large surfaces. The peony-bloom-soft is the only accent-capable entry — warm enough to direct attention while remaining part of the same tonal family. This palette works for: beauty and skincare brands that want warmth without the saturated pink of conventional beauty marketing, wellness platforms, spa and retreat identities, and any editorial context where the pink must feel sophisticated rather than playful.",
    ["Soft", "Feminine", "Editorial"],
    [
      "rose-pearl-soft",
      "blush-mist-muted",
      "peony-bloom-soft",
      "magenta-tone-muted",
      "rose-silk-muted",
    ],
    {
      editorialNote:
        "Use when pink needs to feel editorial and considered rather than playful or loud. The low saturation is the essential character of this palette — higher-chroma variants of these hues would produce a completely different register. Pair with warm off-white typography (#3d2b2b or similar warm dark) rather than pure black.",
      promptWords: ["rose petal at dusk", "blush paper", "warm spa stone", "shell interior", "cream silk"],
      useCases: ["Beauty and skincare brands", "Wellness and spa identities", "Feminine editorial layouts"],
    },
  ),
);

collections.push(
  createCollection(
    "spiced-amber",
    "Spiced Amber",
    "Warm amber, ember, and honey tones at rich mid-depth for autumn campaigns, artisan food brands, and harvest-season editorial.",
    "A palette assembled from the warmest, most saturated corner of the amber-to-ember spectrum — the zone that evokes toasted grain, aged spirits, warm autumn light, and hand-thrown ceramics. The amber-velvet-clear sits at the core: vivid enough to anchor the palette but deep enough to feel grown rather than bright. The ember-tone-soft provides a softer, more russet note in the mid-lightness range. The honey-silk-soft adds the golden register — warm, luminous, carrying the same quality as late afternoon light through amber glass. These five tones build a cohesive warm-spectrum range from deep terracotta to light honey. This palette works for: autumn campaign identities, artisanal food and beverage brands (honey, spice, small-batch spirits), warm editorial layouts, harvest and seasonal promotions, and any brand that wants to communicate craft and warmth through its color system.",
    ["Warm", "Autumnal", "Artisan"],
    [
      "amber-velvet-clear",
      "ember-tone-soft",
      "honey-silk-soft",
      "coral-dusk-muted",
      "apricot-velvet-muted",
    ],
    {
      editorialNote:
        "Use when warmth needs to feel earned and aged rather than cheerful and bright. The vivid amber-velvet-clear is the most saturated entry — use it for accents and interactive states. The muted tones (coral-dusk-muted, apricot-velvet-muted) carry large surfaces and backgrounds. Pair with dark walnut or near-black type rather than a cold ink for temperature consistency.",
      promptWords: ["aged bourbon bottle", "toasted spice jar", "harvest moon light", "amber jam jar", "autumn orchard"],
      useCases: ["Artisan food and beverage brands", "Autumn campaign identities", "Warm editorial layouts"],
    },
  ),
);

collections.push(
  createCollection(
    "cerulean-depth",
    "Cerulean Depth",
    "Deep cerulean, sapphire, and cobalt tones at shadow and velvet lightness — for enterprise tech, analytics, and corporate digital products.",
    "A palette drawn from the deep register of the blue-to-teal spectrum: the zone below the midpoint where blues become authoritative rather than playful, and where the color communicates stability, precision, and considered intelligence. The cobalt-dusk-clear is the palette's most saturated entry — a vivid deep cobalt that reads as active and capable without the aggression of a pure electric blue. The cerulean-shadow-clear provides a darker, more receded tone for large surfaces and backgrounds in dark-mode contexts. The azure-velvet-soft bridges the gap to a slightly warmer register, preventing the palette from reading as cold. The sapphire-nocturne-muted is the deepest entry: near-navy, capable of serving as a near-black alternative in contexts where pure black feels too harsh. The teal-shadow-soft adds a slight green note as a secondary accent, preventing full monochromatism. This palette works for: enterprise software, analytics dashboards, financial data platforms, corporate digital products that need authority without the warmth of consumer brand palettes.",
    ["Deep", "Corporate", "Authoritative"],
    [
      "cobalt-dusk-clear",
      "cerulean-shadow-clear",
      "azure-velvet-soft",
      "sapphire-nocturne-muted",
      "teal-shadow-soft",
    ],
    {
      editorialNote:
        "Use when blue needs to communicate authority and intelligence rather than friendliness or energy. The depth in this palette comes from low lightness, not high saturation — a restraint that distinguishes it from the vivid tech palettes of consumer apps. Pair with pure white or very light off-white type rather than warm or tinted whites. Works equally well in light and dark interface contexts.",
      promptWords: ["depth sonar display", "late-night research station", "pressure-resistant instrument casing", "deep ocean chart", "enterprise data terminal"],
      useCases: ["Enterprise software and analytics", "Financial data platforms", "Corporate digital products"],
    },
  ),
);

collections.push(
  createCollection(
    "sage-terrarium",
    "Sage Terrarium",
    "Soft sage, moss, and stone greens at muted and soft lightness — for wellness, botanical, and slow-living brands.",
    "A palette built from the green spectrum's quietest register: desaturated, light-touched, and atmospheric. Sage greens and moss tones at low chroma suggest living plants behind glass, a morning walk through a damp garden, or a ceramic planter on a white shelf. The moss-mist-soft is the palette's lightest entry — an almost-grey green suitable for large background surfaces and calm UI backgrounds. The moss-tone-muted provides an earthy, grounded midtone. The fern-velvet-soft is the richest entry, with enough chroma to serve as an accent or primary brand color. The stone-green-muted bridges green to neutral, useful for typographic elements that should feel botanical without being vivid. The eucalyptus-bloom-soft adds a slightly cooler note that prevents the palette from reading as too yellow or too warm. This palette works for: wellness and mindfulness brands, botanical and plant retail, slow-living and sustainable lifestyle brands, spa and aromatherapy packaging.",
    ["Calm", "Botanical", "Wellness"],
    [
      "moss-mist-muted",
      "moss-pearl-muted",
      "moss-bloom-muted",
      "moss-silk-muted",
      "moss-tone-muted",
    ],
    {
      editorialNote:
        "The restraint of this palette is its strength — avoid the impulse to add a vivid accent. The palette is designed to breathe and recede. Use the fern-velvet-soft sparingly as the highest-chroma element. Pair with warm off-white backgrounds (#F8F6F1 range) and natural texture photography. Typefaces in warm charcoal or near-black (not pure black) maintain the organic temperature.",
      promptWords: ["misty greenhouse morning", "ceramic herb planter", "linen apothecary label", "terrarium glass fog", "botanical field notebook"],
      useCases: ["Wellness and spa brands", "Botanical and plant retail", "Sustainable lifestyle and packaging"],
    },
  ),
);

collections.push(
  createCollection(
    "dusk-coral",
    "Dusk Coral",
    "Warm coral, blush, and terracotta tones at soft and muted lightness — for editorial, beauty, and warm contemporary branding.",
    "A palette centred on the coral-to-terracotta arc: the warm register where orange meets pink, touching the territory of sunsets, clay pots, and warm skin. The coral-glow-soft is the palette's warmest and most vivid entry — a saturated soft coral that carries energy without the abrasiveness of pure orange. The blush-mist-soft provides a lighter, more receded counterpoint, useful for background surfaces and secondary text containers. The terracotta-tone-muted grounds the palette with an earthy, clay-like midtone that anchors the lighter corals with material weight. The peach-silk-soft is the palette's most neutral entry — a barely-tinted warm near-white suitable for large-area fills. The rose-copper-muted adds a slightly metallic warmth at the palette's darkest end, suggesting burnished copper or dried rose petals rather than pure pink. This palette works for: editorial beauty and cosmetics, women's lifestyle brands, warm contemporary direct-to-consumer brands, event design and wedding identities.",
    ["Warm", "Editorial", "Feminine"],
    [
      "coral-tone-soft",
      "blush-mist-soft",
      "coral-silk-soft",
      "blush-bloom-soft",
      "rose-tone-soft",
    ],
    {
      editorialNote:
        "The palette's warmth is consistent — there is no cool entry to create contrast. This is deliberate: the palette creates a temperature envelope that should be broken only by type and photography. Use near-black or deep warm brown for text rather than a cool neutral, which would create temperature conflict. Photography with warm natural light, natural materials, and skin tones performs best within this system.",
      promptWords: ["terracotta sunset horizon", "dried flower arrangement", "warm clay studio morning", "rose petal ceramic bowl", "Mediterranean dusk light"],
      useCases: ["Beauty and cosmetics brands", "Women's editorial and lifestyle", "Wedding and event design"],
    },
  ),
);

collections.push(
  createCollection(
    "arctic-minimal",
    "Arctic Minimal",
    "Icy whites, cool grays, and restrained arctic blues — for clinical precision, Scandinavian design, and ultra-clean UI systems.",
    "A palette built on the coldest end of the visible spectrum: the territory of glaciers, surgical precision, and premium technology. The frost-veil-soft anchors the palette at its lightest — a barely-there off-white with a cold undertone that reads as pure without being sterile. The azure-mist-soft provides a faint blue tint at near-white lightness, suggesting sky or ice-refracted light rather than blue pigment. The cobalt-veil-soft pushes further into the blue register while remaining light enough for backgrounds. The cerulean-tone-muted is the palette's structural midtone — a desaturated arctic blue that reads as sophisticated and technical. The slate-tone-muted closes the palette at a cool medium-dark neutral, providing the contrast anchor for text and borders without the warmth of charcoal. This palette is optimized for: premium technology product UIs, medical and healthcare brands, Scandinavian minimalist editorial and product design, and architectural photography.",
    ["Cool", "Minimal", "Technical"],
    [
      "cerulean-veil-soft",
      "azure-mist-soft",
      "cerulean-mist-soft",
      "cerulean-tone-muted",
      "cobalt-tone-muted",
    ],
    {
      editorialNote:
        "Temperature consistency is everything in this palette — avoid any warm neutrals. Every element including type should carry a cool or neutral temperature. Body type in slate-tone-muted or a near-black with cool undertone maintains the system's coherence. This palette pairs especially well with geometric sans-serif typefaces (Neue Haas Grotesk, Suisse Int'l, Inter) which carry the same temperature as the colors.",
      promptWords: ["surgical steel surface", "frozen lake at dawn", "arctic research station interior", "clean room laboratory", "premium tech product launch"],
      useCases: ["Healthcare and medtech brands", "Premium technology products", "Scandinavian minimalist branding"],
    },
  ),
);

collections.push(
  createCollection(
    "amber-manuscript",
    "Amber Manuscript",
    "Warm ambers, honey tones, and aged parchment neutrals — evoking aged paper, handwritten maps, and artisanal craft.",
    "A palette drawn from the warmth of aged materials: amber glass, beeswax candles, old book pages, and sun-warmed honey. The honey-silk-soft opens the palette at its lightest — a warm, near-ivory with unmistakable amber warmth that reads as parchment or aged paper. The amber-tone-soft provides a more decisively amber midpoint, useful for tints and surface washes that need to read as warm without feeling orange. The citrine-tone-muted introduces a slightly more yellow-gold temperature, suggesting aged manuscripts or candlelight rather than fresh amber. The ember-tone-soft deepens the warmth toward the copper-bronze end of the spectrum, grounding the lighter entries with material weight. The sienna-tone-muted closes the palette with a deeper amber-brown that suggests oxidized leather, aged wood, or dark amber glass. This palette works for: craft food and beverage brands (honey, whisky, specialty tea), artisan goods, editorial design with heritage voice, and warm luxury hospitality.",
    ["Warm", "Artisan", "Heritage"],
    [
      "honey-silk-soft",
      "amber-tone-soft",
      "amber-tone-muted",
      "ember-tone-soft",
      "ember-tone-muted",
    ],
    {
      editorialNote:
        "The palette's monochromatic warmth creates a sense of material richness that works best with photography of actual warm materials: wood, leather, ceramic, paper, food. Avoid cool photography within this system — a single cool image will break the temperature envelope. Type in deep warm brown (near-black at warm temperature) maintains system coherence better than neutral black.",
      promptWords: ["old letterpress shop", "beeswax candle workshop", "aged whisky barrel", "handwritten cartography", "harvest morning apiary"],
      useCases: ["Craft food and beverage brands", "Artisan goods and packaging", "Heritage editorial and publishing"],
    },
  ),
);

collections.push(
  createCollection(
    "aurora-veil",
    "Aurora Veil",
    "Indigo, violet, and teal blues at soft lightness — for tech, creative, and premium digital brands.",
    "A palette built around the blue-to-violet arc at restrained saturation and varied depth. The indigo-velvet-soft anchors the palette with a deep blue-indigo that communicates intelligence and premium quality — dark enough to function as a near-neutral base in UI contexts, but distinctly blue rather than black. The violet-tone-soft provides a mid-register purple-blue that bridges the indigo depth and the lighter cerulean, giving the palette range across the full value scale. The teal-bloom-soft introduces a cool green-blue at medium lightness — the palette's most air-like entry, suggesting sky on the horizon. The cerulean-mist-soft is the lightest and most receded entry: a pale, barely-tinted near-white that works for large background surfaces and subtle pattern work. The sapphire-dusk-soft grounds the palette at the dark end with a deep pure blue — the most saturated entry and the one that carries the most directional color energy. This palette works for: technology companies, premium digital products, creative agencies, data visualization, fintech and enterprise software.",
    ["Blue", "Tech", "Premium"],
    [
      "indigo-velvet-soft",
      "violet-tone-soft",
      "teal-bloom-soft",
      "cerulean-mist-soft",
      "sapphire-dusk-soft",
    ],
    {
      editorialNote:
        "This palette reads as intelligent, precise, and premium — qualities driven by the blue-violet temperature and the controlled saturation. The teal-bloom-soft prevents the palette from reading as too corporate or cold by introducing a slight green note that suggests growth and possibility. Avoid using all five colors at equal weight: treat the sapphire and indigo as primary colors, the violet as a secondary accent, and the teal and cerulean as background and atmospheric fills. Works exceptionally well in dark-mode UI contexts where the indigo and sapphire entries can serve as panel backgrounds.",
      promptWords: ["deep ocean sonar", "northern lights over fjord", "space observatory dome", "glass hologram display", "crystalline ice formation"],
      useCases: ["Technology and software products", "Premium fintech and data platforms", "Creative studio identities", "Dark-mode UI systems"],
    },
  ),
);

collections.push(
  createCollection(
    "desert-amber",
    "Desert Amber",
    "Warm amber, ember, and honey tones at muted saturation — for earthy, artisan, and warm contemporary brands.",
    "A palette drawn from the warm-yellow-to-orange register at low chroma and varied depth. The amber-tone-muted is the palette's center of gravity: a warm mid-value amber that reads as honey, aged wood, or late afternoon light depending on context. The honey-velvet-muted provides a darker, richer entry — less orange than the amber, more brown-honey, suitable for shadow tones and grounding elements. The ember-silk-muted bridges the warm oranges toward the red end of the spectrum: a muted orange-red that suggests warm terra cotta without the saturated energy of a vivid rust. The coral-dusk-muted is the palette's deepest entry — a dark, earthy muted coral that functions as the palette's near-neutral dark, providing depth without reaching for pure brown or black. The olive-bloom-muted offers a cooler, slightly greener entry at medium lightness that prevents the palette from reading as too uniformly orange-warm. This palette works for: artisan food and beverage brands, pottery and ceramics, sustainable and organic lifestyle products, warm minimalist interior brands.",
    ["Warm", "Earthy", "Artisan"],
    [
      "amber-tone-muted",
      "honey-velvet-muted",
      "ember-silk-muted",
      "coral-dusk-muted",
      "olive-bloom-muted",
    ],
    {
      editorialNote:
        "The warmth of this palette is subtle rather than vivid — the muted saturation prevents it from reading as bold or energetic. It suggests material warmth (wood, clay, wax) rather than fire or citrus. Use amber-tone-muted as the dominant background or brand color, with coral-dusk-muted for depth and olive-bloom-muted as a grounding neutral accent. Pair with natural material photography (wood grain, ceramic surfaces, linen) and warm-weight serif typefaces. Avoid cool-toned type or high-contrast white, which would introduce a temperature conflict that undercuts the palette's warmth.",
      promptWords: ["clay wheel thrown bowl", "beeswax candle workshop", "amber glass honey jar", "desert sandstone afternoon", "artisan sourdough crust"],
      useCases: ["Artisan food and ceramics brands", "Sustainable and natural lifestyle", "Warm minimalist interiors", "Craft beverage packaging"],
    },
  ),
);

collections.push(
  createCollection(
    "cobalt-morning",
    "Cobalt Morning",
    "Cool cobalt and sapphire blues in a range from pale mist to deep velvet — for productivity tools, SaaS dashboards, and focus-oriented product UI.",
    "A blue-dominant palette spanning from near-white cool blues to a deep cobalt velvet, with enough tonal variation to build a complete interface hierarchy from a single hue family. The cobalt-mist-muted is the palette entry point: an airy, barely-blue surface color that reads as a refreshed white alternative for application backgrounds. The azure-pearl-soft provides the next step down — visible but still light, appropriate for card surfaces, sidebar fills, or secondary containers. The cerulean-tone-soft is the palette's mid-value workhorse: saturated enough to read as deliberate blue without being heavy, suited to navigation elements, selected states, and section headings. The cobalt-velvet-clear is the concentrated payload of the palette — a rich, mid-dark blue with enough chroma to function as a primary action color or brand identifier without requiring the full saturation of a vivid. The sapphire-shadow-soft anchors the dark end: deep, slightly desaturated, useful for text, dark headers, or near-neutral dark fills. This palette avoids the cold, corporate feeling of a generic blue system by ranging from warm-white entry tones to blue-dominant but not harsh midpoints. Use it for productivity software, professional service dashboards, or technology products where calm focus and quiet authority are the primary emotional goals.",
    ["Productivity", "SaaS", "Focus"],
    [
      "cobalt-mist-muted",
      "azure-pearl-soft",
      "cerulean-tone-soft",
      "cobalt-velvet-clear",
      "sapphire-shadow-soft",
    ],
    {
      editorialNote:
        "This palette works because it builds a complete tonal range from a single blue-cobalt region of the spectrum rather than mixing multiple hue families. The result is cohesive without being monotonous — each entry is distinguishable by lightness while the family relationship is always evident. Assign roles clearly: cobalt-mist-muted for backgrounds, azure-pearl-soft for cards, cerulean-tone-soft for interactive elements, cobalt-velvet-clear for primary CTAs, sapphire-shadow-soft for body text and deep fills. In dark mode, reverse the weight: sapphire-shadow-soft becomes the background, cobalt-velvet-clear the elevated surface, and cerulean-tone-soft the interactive accent.",
      promptWords: ["early morning desk light", "open browser at 7am", "cobalt ceramic coffee mug", "clear blue morning sky", "focused work session"],
      useCases: ["SaaS product dashboards", "Productivity and focus apps", "Professional services web presence", "Technical documentation sites"],
    },
  ),
);

collections.push(
  createCollection(
    "sage-fog",
    "Sage Fog",
    "Soft sage greens, muted moss, and quiet jade for wellness, editorial, and calm digital experiences.",
    "A green-dominant palette positioned in the grey-green sage territory — not the vivid mint of nature palettes nor the deep emerald of luxury collections, but the quieter mid-green range that designers reach for when they want calm, breath, and organic warmth without natural drama. The moss-whisper-muted is the palette's lightest entry: a green so desaturated it reads as a warm off-white with a subtle green cast — the exact background tone that photography-heavy layouts and reading-optimized interfaces benefit from. The leaf-silk-soft provides the palette's clearest expression of the sage-green identity at mid-lightness — a tone that reads unmistakably as plant matter but without any brightness or shout. The olive-mist-muted shifts the palette toward the yellow-green territory at a very pale lightness — a whisper olive that works as a differentiated secondary surface or subtle highlight. The jade-bloom-soft is the palette's mid-dark and most verdant entry — a soft jade that introduces depth and a slightly cooler green temperature. The seafoam-tone-muted is the neutralizing entry: a sage-adjacent tone that bridges green and blue-green, preventing the palette from reading as too warm or too botanical while maintaining the family coherence. Together, these five entries provide enough range for a complete design system built on the sage-green register.",
    ["Wellness", "Editorial", "Calm"],
    [
      "moss-whisper-muted",
      "leaf-silk-soft",
      "olive-mist-muted",
      "jade-bloom-soft",
      "seafoam-tone-muted",
    ],
    {
      editorialNote:
        "Sage-green palettes succeed when they resist the temptation toward brightness. Every entry here is below the saturation threshold where green starts reading as energetic, natural, or verdant, which allows the palette to read instead as calm, minimal, and considered. The moss-whisper-muted background creates the effect of slightly warm paper — a better reading surface than pure white for long-form content. Use jade-bloom-soft for primary interactive elements and seafoam-tone-muted for secondary actions to maintain the palette's visual quietness even at the action layer. Pairs well with warm grey type rather than cool dark grey or black, and with botanical photography styled at muted, ambient light rather than high-contrast natural lighting.",
      promptWords: ["morning steam over still water", "sage bundle drying", "grey-green linen curtain", "moss covered stone garden", "quiet botanical library"],
      useCases: ["Wellness and mindfulness apps", "Plant-based food and supplement brands", "Editorial and long-form reading interfaces", "Natural beauty and skincare"],
    },
  ),
);

collections.push(
  createCollection(
    "terracotta-fired",
    "Terracotta Fired",
    "Warm ember, coral, and amber tones reminiscent of kiln-fired clay — for artisan goods, handmade ceramics, boutique hospitality, and earthy lifestyle brands.",
    "A palette drawn from the warmest corner of the midrange hue spectrum: the zone where orange meets amber, coral deepens to ember, and the warmth of fired clay is expressed without straying into red or yellow territory. The colors carry the specific warmth of unpainted studio pottery — not the terracotta of unfinished plant pots, but the richer, more saturated warmth of glazed stoneware and artisan ceramics. The ember-tone-soft entry provides the dominant clay warmth; coral-silk-soft and apricot-bloom-soft supply the lighter, more translucent registers that keep the palette from feeling heavy. Amber-tone-muted grounds the warm spectrum without introducing green; crimson-velvet-soft provides the deep anchor that stops the palette from reading as pure orange. Designed for environments where warmth should feel handmade and organic rather than synthetic or tropical.",
    ["Warm", "Artisan", "Earthy"],
    [
      "ember-tone-soft",
      "coral-silk-soft",
      "apricot-bloom-soft",
      "amber-tone-muted",
      "crimson-velvet-soft",
    ],
    {
      editorialNote:
        "Use this when earthy warmth should read as artisan and considered rather than rustic or casual. The crimson-velvet-soft anchor is deep enough to prevent the palette from feeling washed out, while apricot-bloom-soft keeps the top register warm-light rather than neutral. Works best with warm dark type (hue 20-30°, L:12-18%) and uncoated paper textures in photography.",
      promptWords: ["kiln-fired stoneware", "ceramic studio window", "terracotta roof at noon", "warm clay under hands", "artisan market morning"],
      useCases: ["Artisan and ceramic brands", "Boutique hospitality and restaurants", "Earthy lifestyle and wellness brands", "Handmade goods e-commerce"],
    },
  ),
  createCollection(
    "nordic-morning",
    "Nordic Morning",
    "Pale blue mists, cool whisper whites, and soft cerulean tones inspired by Scandinavian coastal light — for minimal, calm, and hygge-influenced brands.",
    "A palette assembled from the palest, most luminous end of the cool spectrum: the colors that exist in the hour after sunrise on a cloudless Northern European morning, when the sky is more silver than blue and the light has a particular clarity without harsh warmth. The colors are distinguished from a generic 'light blue' palette by their precision — each is positioned at the convergence of high lightness and controlled saturation, so they read as full colors rather than washed-out tints. Azure-mist-soft provides the clear, identifiable blue that anchors the palette's cool identity; cerulean-whisper-muted establishes the lighter, hazier register; cobalt-pearl-soft adds the slightly richer mid-register; iris-mist-muted introduces a subtle lavender quality that prevents the palette from reading as purely technological; teal-mist-soft connects the blues to the green spectrum, suggesting sea-adjacent rather than purely sky-adjacent. This is the color language of hygge, Scandinavian design, and calm-focused digital products.",
    ["Cool", "Minimal", "Scandinavian"],
    [
      "azure-mist-soft",
      "cerulean-whisper-muted",
      "cobalt-pearl-soft",
      "iris-mist-muted",
      "teal-mist-soft",
    ],
    {
      editorialNote:
        "Use this when cool should feel serene and considered rather than technological or corporate. The iris-mist-muted entry is the differentiating color — it prevents the palette from reading as standard enterprise blue by introducing a subtle violet quality. Pairs well with warm off-white surfaces (#F9F8F6 or similar) and natural wood tones in photography. Avoid pure black type — use a cool-tinted dark grey (L:15%, H:210°) to maintain palette coherence.",
      promptWords: ["Baltic sea at dawn", "Scandinavian sauna steam", "frosted glass morning", "quiet fjord mist", "hygge reading nook"],
      useCases: ["Scandinavian-influenced consumer brands", "Wellness and meditation apps", "Clean beauty and personal care", "Minimalist SaaS and productivity tools"],
    },
  ),
);

collections.push(
  createCollection(
    "midnight-garden",
    "Midnight Garden",
    "Deep jewel tones — moody violet, plum, garnet, and teal — at low lightness for luxury editorial, dark-mode UI, and nocturnal brand identities.",
    "A palette that lives in the darkest, most saturated zone of the spectrum: colors that retain visible chromatic identity at low lightness levels, where lesser palettes collapse into undifferentiated near-black. Violet-nocturne-soft provides the deep, moody anchor that reads unmistakably purple even at 20% lightness; plum-shadow-clear introduces a slightly warmer, more magenta-adjacent deep tone; garnet-nocturne-muted brings a dark, desaturated red-brown that grounds the palette's warmth; teal-shadow-soft supplies the cool counterweight that keeps the collection from reading as all-warm; mulberry-ink-soft delivers the deepest near-black with enough residual violet chroma to feel intentional rather than default. This is the palette for interfaces that need weight and atmosphere without losing color identity — premium dark-mode products, night-mode editorial layouts, and luxury branding that earns its darkness through chromatic depth rather than simple black-on-black.",
    ["Dark", "Jewel", "Luxury"],
    [
      "violet-nocturne-soft",
      "plum-shadow-clear",
      "garnet-nocturne-muted",
      "teal-shadow-soft",
      "mulberry-ink-soft",
    ],
    {
      editorialNote:
        "These colors succeed when used with a very light, high-contrast foreground — try warm ivory (#FAF7F4) or pale lavender (#F0EEF8) for text rather than pure white, which can feel too stark against these dark tones. The teal-shadow-soft is the most versatile entry — it works as a dark-mode interactive highlight and as a data visualization accent against the deep violet and plum tones.",
      promptWords: ["velvet theatre curtain", "deep forest at dusk", "stained glass at midnight", "jewel in dark shadow", "moonlit garden path"],
      useCases: ["Premium dark-mode UI products", "Luxury editorial and magazine layouts", "Nocturnal brand identities", "Music and entertainment platforms"],
    },
  ),
  createCollection(
    "powder-room",
    "Powder Room",
    "The softest register of warm pink, rose, peony, and iris — barely-there pastels for beauty, wellness, and elevated feminine brand aesthetics.",
    "A collection assembled at the intersection of high lightness and deliberately low saturation, producing colors that exist on the threshold between tinted white and clearly recognizable hue. The palette is built around the warmest quarter of the pink-to-violet arc, where blush, rose, peony, and iris all coexist as close tonal neighbors. Blush-whisper-soft provides the warmest and most recognizably pink entry, anchoring the palette in warmth; peony-pearl-soft steps down in lightness while retaining a soft pink identity; rose-whisper-muted introduces a slightly cooler, more neutral near-white; iris-mist-muted bridges the transition from pink to lavender; orchid-pearl-muted brings the subtlest cool-purple quality that widens the palette's versatility for beauty and wellness brands that want softness without being restricted to pink alone.",
    ["Soft", "Beauty", "Feminine"],
    [
      "blush-whisper-soft",
      "peony-pearl-soft",
      "rose-whisper-muted",
      "iris-mist-muted",
      "orchid-pearl-muted",
    ],
    {
      editorialNote:
        "The palette reads as cohesive only when all five colors are used with high-lightness surfaces (white or near-white backgrounds). On grey or dark surfaces, the subtle hue differences collapse and the palette reads as a collection of near-whites. For typography, use a warm near-black (hue 330°, L:10-14%, S:12%) rather than pure black — it coordinates with the warmth of the palette entries and prevents the page from feeling like tinted white on cold black.",
      promptWords: ["cotton candy at dusk", "powder compact at 10am", "rose water in clear glass", "botanical watercolor wash", "peony petal on white marble"],
      useCases: ["Beauty and cosmetics brands", "Wellness and self-care products", "Wedding and celebration platforms", "Feminine editorial and lifestyle content"],
    },
  ),
);

collections.push(
  createCollection(
    "copper-patina",
    "Copper Patina",
    "Warm copper tones shifting through oxidized green-bronze — for artisan products, premium hardware, and material-forward brand identities.",
    "This collection traces the color story of copper across its lifecycle: from the warm amber-red of freshly polished metal to the blue-green oxidation of aged bronze. Amber-tone-soft provides the warm anchoring copper note; terracotta-silk-muted steps into the reddish-brown territory of aged copper surfaces; moss-bloom-muted introduces the pale teal-green of incipient patina; teal-mist-soft brings the cleaner, bluer aqua of fully developed patina; and honey-bloom-muted bridges the warm and oxidized zones with a golden amber that reads as mineral and natural. Together the palette evokes material history — the sense of objects that have been made with care and used over time.",
    ["Warm", "Artisan", "Material"],
    [
      "amber-tone-soft",
      "ember-silk-muted",
      "moss-bloom-muted",
      "teal-mist-soft",
      "honey-bloom-muted",
    ],
    {
      editorialNote:
        "The palette requires warm typography — use amber-tinted near-black rather than cool or neutral grays. The teal-mist-soft entry is the palette's surprise: it reads as patina rather than tech, which makes it usable in artisan and craft contexts where a standard teal would feel out of place. The full palette reads best on natural-texture backgrounds (warm white, linen, uncoated paper) rather than cool white or pure white surfaces.",
      promptWords: ["aged bronze door handle", "copper pot kitchen", "mineral vein in stone", "antique patina surface", "artisan foundry morning"],
      useCases: ["Artisan goods and craft brands", "Premium kitchen and hardware products", "Metalwork and material-forward branding", "Architectural and interior design studios"],
    },
  ),
  createCollection(
    "coastal-haze",
    "Coastal Haze",
    "Soft maritime blues and weathered grays with a warm undertone — for travel, hospitality, and calm-first digital products.",
    "The palette of foggy coastal mornings: a range that sits between the slate of overcast sea and the pale aqua of shallow water at the horizon. Cerulean-whisper-muted provides the palest, most atmospheric blue-gray entry — the color of coastal sky through sea mist; azure-mist-soft steps toward a clearer, more definitively blue note; cobalt-pearl-soft introduces the slightly deeper, more saturated blue of deeper coastal water; slate-mist-soft (or its nearest equivalent teal-mist-soft) provides the blue-gray ground tone; and seafoam-whisper-soft contributes the warm aqua-green of shallow water over sand. The collection is deliberately understated — these are colors that work in large fields as backgrounds and surface tones rather than as accent colors.",
    ["Coastal", "Calm", "Hospitality"],
    [
      "cerulean-whisper-muted",
      "azure-mist-soft",
      "cobalt-pearl-soft",
      "teal-mist-soft",
      "seafoam-whisper-soft",
    ],
    {
      editorialNote:
        "These colors are background and surface colors, not accent colors. They work best paired with a warm cream or off-white for page backgrounds and a warm near-black or dark slate for typography. A single warm accent (amber, terracotta, or soft gold) creates effective contrast against the cool-neutral haze palette without fighting it. Avoid pure white, pure black, or bright saturated accents — they break the atmospheric quality the palette creates.",
      promptWords: ["morning harbor fog", "linen sail in haze", "Atlantic morning from the shore", "weathered coastal grey", "sea glass on wet sand"],
      useCases: ["Travel and hospitality brands", "Coastal real estate", "Wellness retreats and spas", "Calm-first productivity and journaling tools"],
    },
  ),
);

collections.push(
  createCollection(
    "desert-terrain",
    "Desert Terrain",
    "Warm terracotta, rust, sand, and bleached sage — for southwestern aesthetics, earthy editorial, and sun-weathered brand identities.",
    "The color palette of high desert landscapes: the warm spectrum that runs from bleached sand through fired terracotta to rust and iron-red, with the sage-green of desert scrub as a cool counterweight. Ember-tone-muted provides the warmest, most actively orange entry — the color of terracotta tile in direct sunlight; coral-bloom-muted steps toward a softer, more peachy warmth; honey-mist-soft contributes the pale, sun-bleached quality of desert sand and dried grasses; olive-tone-muted introduces the muted green of desert sage and scrub; merlot-dusk-muted anchors the palette with the dark warm-red of iron-rich desert stone. The collection traces the specific heat of a high-desert afternoon: sun-baked earth, warm wind, and the surprising life that grows in dry places.",
    ["Warm", "Earthy", "Editorial"],
    [
      "ember-tone-muted",
      "coral-bloom-muted",
      "honey-mist-soft",
      "olive-tone-muted",
      "merlot-dusk-muted",
    ],
    {
      editorialNote:
        "This palette's warmth is most readable when used with generous whitespace and a near-white background with a slight warm tint (add 3-5% yellow-orange hue to the background). The olive-tone-muted is the most versatile entry — it reads as sage, clay, or linen depending on its neighbors, making it useful as a neutral or a distinctive accent depending on the context. Pair with a warm serif or humanist sans for typography to reinforce the earthy, handcrafted character.",
      promptWords: ["terracotta roof tile", "desert trail at noon", "dried sage and clay", "Southwest stucco wall", "iron-red canyon stone"],
      useCases: ["Southwestern and regional brand identities", "Earthy editorial and lifestyle content", "Interior design and architecture studios", "Artisan ceramics and handmade goods"],
    },
  ),
  createCollection(
    "winter-botanical",
    "Winter Botanical",
    "Deep forest greens, berry, warm cream, and dark earth for seasonal editorial, luxury packaging, and nature-forward brand identities.",
    "The palette of botanical illustration in the dormant season: the dark, saturated greens of evergreen foliage, the warm red of winter berries, the cold cream of snow-covered stems, and the deep brown of bare winter branches. Emerald-dusk-soft provides the richest, most saturated dark-green entry — dense and weighted like conifer needles; jade-velvet-muted introduces a slightly bluer, cooler forest green that reads as the color of shade rather than sunlight; leaf-shadow-soft adds a deep, nearly black-green that functions as a dark accent and near-neutral; garnet-radiant-clear contributes the vivid warm red of holly berries and winter rose hips; blush-pearl-muted provides the pale, barely-there pink of winter sky or dried rose-hip flesh. Together they evoke the specific color register of botanical illustration books, winter garden prints, and premium seasonal packaging.",
    ["Dark", "Botanical", "Seasonal"],
    [
      "emerald-dusk-soft",
      "jade-velvet-muted",
      "leaf-shadow-soft",
      "garnet-radiant-clear",
      "blush-pearl-muted",
    ],
    {
      editorialNote:
        "The palette reads as 'botanical' only when the two greens and the deep leaf-shadow are used together as a group — separating them produces a different effect. The garnet-radiant-clear is the palette's accent: use it sparingly (one element per composition) to create the focal point. For backgrounds, use blush-pearl-muted at maximum lightness (85-95% opacity on white) or pure warm white — the pale pink contributes warmth without adding color noise. Typography should be very dark: leaf-shadow-soft works as a text color and integrates with the palette rather than introducing a separate neutral.",
      promptWords: ["winter holly branch", "botanical print on cream paper", "evergreen forest after frost", "pressed dried flowers", "vintage seed catalog"],
      useCases: ["Seasonal editorial and magazine design", "Luxury holiday packaging and cards", "Garden and plant brand identities", "Premium food and botanical product brands"],
    },
  ),
);

// Additional collections appended by autopilot 2026-03-23

export const extraCollections9: ColorCollection[] = [
  createCollection(
    "aurora-borealis",
    "Aurora Borealis",
    "Vivid celestial blues, teals, and violets inspired by the northern lights — for premium tech products, atmospheric editorial, and dark-background digital experiences.",
    "A palette drawn from the vivid, high-chroma end of the blue-green-violet arc: the colors that appear in long-exposure photographs of the northern lights, where saturation is compressed and amplified simultaneously. Cobalt-core-vivid provides the deepest, most intense blue anchor — the color of deep sky at zenith; teal-tone-vivid brings the electric cyan-teal of the aurora's most active bands; mint-core-vivid is the pale, almost-white-green of the aurora's outer glow; violet-nocturne-clear introduces the deep purple-violet of atmospheric depth at the horizon; plum-radiant-clear adds the warm-violet note that appears when the aurora's reds and blues overlap. Together, these five create a palette of extraordinary chromatic intensity that functions best on dark backgrounds — each color carries maximum luminosity against near-black, and the palette loses its celestial character on white.",
    ["Dark", "Vivid", "Celestial"],
    [
      "cobalt-core-vivid",
      "teal-tone-vivid",
      "mint-core-vivid",
      "violet-nocturne-clear",
      "plum-radiant-clear",
    ],
    {
      editorialNote:
        "This palette is designed for dark-background use only — on white or light backgrounds the vivid chroma reads as harsh rather than luminous. Use cobalt-core-vivid and teal-tone-vivid as the dominant hues; reserve plum-radiant-clear and violet-nocturne-clear as accent colors appearing in small quantities. Mint-core-vivid is the palette's lightest and most ethereal entry — it works as a text highlight or glow effect against dark surfaces. For typography, use pure white or the lightest palette entry (mint-core-vivid) for body text, never dark text colors. The palette pairs well with linear gradients between adjacent hues (cobalt to teal, violet to plum) to suggest the sweep and movement of the aurora itself.",
      promptWords: ["northern lights over snow field", "long-exposure aurora photograph", "deep space nebula", "bioluminescent ocean at night", "electric sky before a storm"],
      useCases: ["Premium technology and SaaS dark-mode products", "Gaming and entertainment branding", "Atmospheric editorial and music visual identity", "Science and astronomy-adjacent digital products"],
    },
  ),
  createCollection(
    "berry-harvest",
    "Berry Harvest",
    "Deep plum, mulberry, vivid rose, and warm red — a rich autumnal fruit palette for seasonal editorial, luxury food brands, and warm-toned product photography.",
    "A palette assembled at the intersection of red and violet: the warm, saturated spectrum of ripe autumn berries — blackberries at full ripeness, wine-dark plums, the vivid crimson of wild strawberries, the deep rose of rose hips. Ruby-radiant-soft provides the palette's most active and warm entry — a vivid red-pink that reads as fresh berry against the darker tones; plum-silk-soft introduces the mid-register of ripe plum at softer saturation; rose-bloom-vivid contributes the vivid warm-pink at high chroma; peony-bloom-vivid is the palette's most expressive entry — a vivid warm rose that reads simultaneously as floral and fruit; mulberry-nocturne-muted provides the deep, almost-black anchor — the color of dried berry or deeply shadowed plum skin. The five colors span from deep-dark to vivid-light within a tight hue arc, creating a palette with strong chromatic coherence and natural depth.",
    ["Warm", "Berry", "Seasonal"],
    [
      "ruby-radiant-soft",
      "plum-silk-soft",
      "rose-bloom-vivid",
      "peony-bloom-vivid",
      "mulberry-nocturne-muted",
    ],
    {
      editorialNote:
        "The palette's richness is most readable with generous use of near-white or cream as a surface color — a warm white (HSL 30 20% 97%) gives the berry tones their maximum luminosity. Mulberry-nocturne-muted works effectively as a dark background color in small quantities (header bands, footer areas) rather than as a full-page background. The vivid entries (rose-bloom-vivid and peony-bloom-vivid) should be used as accent colors, not dominant surfaces. Typography: the palette supports both dark (mulberry-nocturne-muted) and medium (plum-silk-soft) text on light backgrounds; avoid mixing both in the same text hierarchy. Particularly effective for harvest season campaigns, wine and spirits brands, artisan jam and confectionery, and premium autumn editorial.",
      promptWords: ["bowl of late-summer berries", "wine-dark plum on the branch", "blackberry jam in a jar", "autumn fruit market stall", "mulberry-stained fingers in harvest season"],
      useCases: ["Seasonal and harvest-themed editorial", "Wine, spirits, and artisan food brands", "Luxury confectionery and preserve packaging", "Autumn fashion and lifestyle content"],
    },
  ),
];

collections.push(...extraCollections9);

// Additional collections appended by autopilot 2026-03-23 (big run)

export const extraCollections10: ColorCollection[] = [
  createCollection(
    "desert-minerals",
    "Desert Minerals",
    "Terracotta, rust, burnished sand, warm amber, and dusty sage — a palette drawn from the mineral palette of arid landscapes for earthy brand identities and warm-toned editorial.",
    "The color of mineral-rich desert terrain: iron-oxide red in exposed canyon walls, the warm tan of sandstone plateaus, the amber of dry grasses, the dusty sage of desert scrub, and the pale cream of sun-bleached stone. Terracotta-tone-muted provides the foundational warm red-brown — a deeply earthy hue that reads as both geological and handcrafted; rust-bloom-muted introduces the more intense iron-oxide red-orange of exposed rock surfaces; honey-bloom-muted provides the warm amber-gold of desert light at the golden hour; moss-mist-soft brings the cool, dusty green that appears in desert vegetation — a color that reads as neutral when surrounded by warm tones, adding chromatic relief without introducing a jarring contrast; sand-pearl-soft provides the lightest entry — the pale buff of desert sand or sun-bleached sandstone, which works as both a light-toned accent and a warm off-white surface color. Together the five colors create a palette of mineral warmth and geological authority.",
    ["Earthy", "Desert", "Warm"],
    [
      "ember-tone-muted",
      "ember-bloom-muted",
      "honey-bloom-muted",
      "moss-mist-soft",
      "apricot-pearl-soft",
    ],
    {
      editorialNote:
        "This palette reads as 'desert' rather than 'rustic' when moss-mist-soft is included — the cool sage against warm terracotta and rust creates the specific temperature contrast of desert landscape photography. Without the sage, it becomes a purely warm earthy palette that could read as autumnal or Mediterranean. Use sand-pearl-soft as the background surface color (on white paper or in UI background roles) rather than pure white — the slight warm buff tone ties the other colors together. Typography: use a dark version of the terracotta or rust hue for headings, and neutral near-black for body text. Avoid pure black — it creates temperature contrast that fights the palette.",
      promptWords: ["red rock canyon at midday", "desert mineral specimens on white paper", "dried earth and sage after summer rain", "rust-veined sandstone cliff face", "Navajo textiles and pottery"],
      useCases: ["Regional brand identities in the American Southwest", "Artisan ceramics, natural materials, and handcrafted goods", "Architecture and interior design for desert climates", "Earthy wellness and skincare brands"],
    },
  ),
  createCollection(
    "moonlit-garden",
    "Moonlit Garden",
    "Deep navy, forest shadow, dusty rose, warm cream, and soft charcoal — a sophisticated palette for luxury fashion, dark editorial, and premium evening-oriented products.",
    "A palette assembled around the specific visual register of a garden at night under a clear sky: the deep, slightly warm navy of the sky above, the nearly-black green of dense foliage in shadow, the soft dusty rose of night-blooming flowers barely visible in low light, the warm cream of stone paths and moonlit surfaces, and the soft charcoal of bark and branch. Midnight-blue-nocturne (navy-nocturne-muted in the archive) provides the deep blue anchor — not pure navy but a slightly warm, deep blue-black that reads as 'night sky rather than ocean'; forest-shadow-soft contributes the dark, desaturated green of foliage without light — a color that functions equally as an accent and a near-neutral; rose-whisper-muted introduces the pale, dusty rose note — a highly desaturated pink that reads as muted rather than sweet and provides chromatic warmth; cream-pearl-soft provides the warmest and lightest entry, suggesting moonlit stone and aged paper surfaces; charcoal-soft provides the most neutral and darkest entry — a warm charcoal that functions as a dark neutral without the coldness of pure black.",
    ["Dark", "Botanical", "Luxury"],
    [
      "cobalt-nocturne-muted",
      "emerald-shadow-soft",
      "rose-whisper-muted",
      "amber-pearl-soft",
      "cobalt-ink-soft",
    ],
    {
      editorialNote:
        "The palette's sophistication depends on the muted quality of all five entries — no color in this palette should be vivid or high-saturation. If your execution requires more chromatic presence, introduce it through texture and finish (matte vs. gloss, foil, embossing) rather than by increasing color saturation. Navy-nocturne-muted is the dominant color and should appear in the largest quantities; forest-shadow-soft is the secondary — these two set the overall dark, cool-warm temperature contrast. Rose-whisper-muted is the palette's feminine note and should be used sparingly — one element per composition — to prevent it from dominating. Cream-pearl-soft is the primary light surface: use it for backgrounds, light panels, or white-paper equivalents rather than pure white. Typography: charcoal-bloom-soft works as a text color that integrates with the palette; navy-nocturne-muted can be used for heading color.",
      promptWords: ["moonlit garden path at midnight", "dark perfume bottle on marble", "pressed botanicals on cream paper", "evening gown on shadowed terrace", "luxury packaging with foil stamp"],
      useCases: ["Luxury fashion and evening wear brands", "Dark editorial and cultural institutions", "Premium perfume and cosmetics packaging", "Luxury hotel and evening dining identities"],
    },
  ),
];

collections.push(...extraCollections10);

export const extraCollections11: ColorCollection[] = [
  createCollection(
    "copper-verdigris",
    "Copper Verdigris",
    "Warm amber-copper tones with oxidized teal-green accents — a palette of aged metal and artisanal material surfaces.",
    "This collection is built from the color language of copper at different stages of oxidation: the warm orange-red of freshly polished copper, the amber of slightly aged metal, the olive-tan of early patination, the cool dusty sage of partially oxidized surfaces, and the deep blue-green of fully patinated verdigris. Ember-tone-muted provides the foundational warm copper-brown — not a vivid orange but the muted, dark version that reads as aged metal or polished stone; apricot-bloom-soft brings the lighter, warmer amber tone of fresh copper or warm metal leaf; olive-tone-muted introduces the olive-tan of early oxidation, sitting between the warm copper and the green patina; jade-mist-soft provides the dusty, desaturated green of developing verdigris — soft enough not to read as a primary green but clearly cooler than the warm copper tones; teal-shadow-muted contributes the deep, dark blue-green of fully oxidized patina — the darkest and coolest entry, providing the grounding contrast that anchors the palette. The palette is inherently dual-temperature: warm coppers in tension with cool patina greens.",
    ["Metallic", "Artisanal", "Warm-Cool"],
    [
      "ember-tone-muted",
      "apricot-bloom-soft",
      "olive-tone-muted",
      "jade-mist-soft",
      "teal-shadow-muted",
    ],
    {
      editorialNote:
        "The dual-temperature structure of this palette is its defining characteristic and its most fragile quality. If the warm coppers and cool patina greens are used in equal proportions, the palette reads as incoherent — two separate palettes fighting for dominance. The intended proportion: warm copper tones (ember, apricot, olive) should occupy 70-80% of the composition; the patina greens (jade, teal) should appear as accents, details, or structural elements. This reflects how actual patina works: copper surfaces are predominantly warm, with verdigris appearing in recesses, edges, and areas of concentrated moisture. Photography direction: aged bronze or copper artifacts on neutral stone or linen surfaces; architectural details of oxidized metal on masonry; artisan metalwork, jewelry casting, or craft objects. Typography: ember-tone-muted works as a dark heading color; teal-shadow-muted works for structural elements or borders.",
      promptWords: ["aged copper vessel on stone", "verdigris architectural detail", "artisan bronze jewelry on linen", "oxidized copper roof tiles", "patinated metalwork close-up"],
      useCases: ["Artisan jewelry and metalwork brands", "Architecture and materials-focused editorial", "Luxury home goods and interior design", "Craft brewery, distillery, or ceramics branding"],
    },
  ),
  createCollection(
    "tropical-resort",
    "Tropical Resort",
    "Vivid turquoise, warm coral, clear aqua, sandy peach, and soft blush — an optimistic palette for travel, lifestyle, and warm-weather product work.",
    "The color language of premium tropical environments: the clear, vivid turquoise of shallow water over white sand, the saturated aqua of deeper lagoon water, the warm coral of tropical flowers and sunset light, the sandy peach of beach stone and warm-toned surfaces, and the palest blush of washed-out tropical sky at dawn. Lagoon-bloom-clear provides the mid-tone turquoise — clear and vivid but not garish, reading as the color of transparent shallow water; aqua-silk-vivid introduces the more intense, saturated aqua of deeper water with direct sunlight, the most chromatic entry in the palette; coral-pearl-soft brings the warm, light coral tone of tropical hibiscus or papaya skin — saturated enough to read as distinctly warm but soft enough to work alongside the light neutrals; apricot-pearl-soft provides the sandy, peachy tone of warm sand and warm-toned stone — the palette's neutral bridge between the coral and the pale blush; blush-whisper-muted contributes the palest entry — the nearly-white, faintly rose tone of a tropical sky at dawn or of bleached linen in strong sunlight. Together the five colors create an atmosphere of warmth, clarity, and optimism without reading as juvenile.",
    ["Tropical", "Coastal", "Vivid"],
    [
      "lagoon-bloom-clear",
      "aqua-silk-vivid",
      "coral-pearl-soft",
      "apricot-pearl-soft",
      "blush-whisper-muted",
    ],
    {
      editorialNote:
        "This palette's mood depends on the vivid quality of the two aqua entries — lagoon-bloom-clear and aqua-silk-vivid are the chromatic core. Desaturate either and the palette loses its tropical register, reading instead as 'coastal' or 'seafoam.' Use the vivid aquas for the primary surface colors (backgrounds, hero panels, large fills); bring in coral and apricot as warm accent counterpoints (CTAs, highlights, illustration elements); use blush-whisper-muted for light surfaces, cards, and body text backgrounds. The palette supports a high-energy, aspirational tone rather than a calm wellness tone — it is closer to a luxury resort campaign than to a meditation app. Photography direction: strong direct sunlight, clear water, white sand, tropical foliage; avoid moody or overcast lighting which will fight the palette's energy. Typography: use a dark, warm neutral (charcoal or dark amber) for body text rather than pure black, which introduces too much temperature contrast.",
      promptWords: ["aerial view of turquoise lagoon", "tropical resort pool at noon", "coral reef snorkeling", "overwater bungalow on aqua water", "fresh tropical fruit on white marble"],
      useCases: ["Travel brands and resort marketing", "Warm-weather lifestyle and activewear", "Tropical food and beverage branding", "Summer product launches and seasonal campaigns"],
    },
  ),
];

collections.push(...extraCollections11);

const extraCollections12: ColorCollection[] = [
  createCollection(
    "studio-neutral",
    "Studio Neutral",
    "Warm white, warm pearl, pale coral mist, cool gray whisper, and pale cerulean — a photographer's studio palette for product catalogues, editorial, and minimal UI work.",
    "These are the colors of a working photographer's studio: the near-white warmth of a seamless backdrop in diffused daylight, the slightly cooler pearl tone of light bouncing off a linen surface, the faintest warm blush of a softbox-lit paper surface, the pale cool gray of a shadow in a white corner, and the near-white cool of an ambient fill light on the ceiling. Amber-veil-muted provides the primary warm-white backdrop color — just warm enough to read as intentional rather than default; coral-whisper-muted contributes the very faint blush of warm photographic light on white surfaces; ember-pearl-muted adds a slightly deeper warm pearl for text backgrounds and card fills; cerulean-mist-muted provides the pale cool gray of ambient light in shadow areas; cobalt-whisper-muted supplies the very faint cool tone of a window-light fill — the palette's cooler neutral anchor. Together these five near-neutrals form a complete warm-cool neutral system built from studio observation rather than arbitrary gray selection.",
    ["Neutral", "Photography", "Minimal"],
    [
      "amber-veil-muted",
      "coral-whisper-muted",
      "ember-pearl-muted",
      "cerulean-mist-muted",
      "cobalt-whisper-muted",
    ],
    {
      editorialNote:
        "This palette requires intentional proportion to avoid reading as an undifferentiated neutral mass. Warm entries (amber-veil-muted, coral-whisper-muted, ember-pearl-muted) function as surface colors — backgrounds, card fills, large body areas. Cool entries (cerulean-mist-muted, cobalt-whisper-muted) function as structural elements — borders, dividers, disabled states, placeholder text backgrounds. The temperature contrast between warm surfaces and cool structure creates the minimal layering that distinguishes a designed neutral system from an undesigned one. Photography direction: product on warm-white seamless paper, diffused natural or softbox light, minimal cast shadows, props in raw wood, unbleached linen, or aged ceramic. Typography: use a dark warm amber-gray (not pure black) for body text — pure black on warm-white creates a temperature conflict. The palette pairs well with a single accent color for CTAs.",
      promptWords: ["white seamless backdrop in photography studio", "product on warm paper surface in diffused light", "linen and ceramic tabletop styling", "editorial flatlay on warm white", "natural light product photography neutral background"],
      useCases: ["Product catalogue and e-commerce photography", "Minimal brand identity and editorial", "Portfolio and agency websites", "Clean UI systems for consumer products"],
    },
  ),
  createCollection(
    "northern-lights",
    "Northern Lights",
    "Electric lagoon aqua, aurora teal, deep violet, midnight cobalt, and ice cerulean — the palette of the aurora borealis for night-sky, Nordic, and atmospheric brand work.",
    "The aurora borealis creates vivid, saturated color in darkness — and it does so in a very specific hue range: electric aqua-green (the dominant oxygen emission line), occasional violet-purple (nitrogen), and the deep indigo of the polar night sky. This palette reconstructs those relationships: lagoon-bloom-vivid provides the primary aurora aqua at near-maximum saturation — the color of the aurora at its most intense, reading as electric against deep night; teal-silk-vivid contributes the adjacent aurora green, slightly deeper in lightness, representing the broader curtain of aurora where the oxygen emission fades toward the horizon; violet-shadow-soft carries the deep aurora purple that appears at higher latitudes and in the most active displays — dark and saturated, bridging the gap between the aqua and the night; cobalt-ink-muted provides the near-black of the polar night sky at its deepest, the ground against which the aurora is visible; cerulean-veil-muted supplies the icy pale near-white that appears as the faintest aurora glow fades into sky, and as the cold white light of polar moonlight on snow. The palette is simultaneously natural and otherworldly.",
    ["Vivid", "Night", "Atmospheric"],
    [
      "lagoon-bloom-vivid",
      "teal-silk-vivid",
      "violet-shadow-soft",
      "cobalt-ink-muted",
      "cerulean-veil-muted",
    ],
    {
      editorialNote:
        "This palette requires a dark background to function correctly. On white, the vivid aqua loses its electric quality and the near-black cobalt becomes a generic dark blue. The intended use: cobalt-ink-muted as the primary background — the darkest entry, the sky itself; lagoon-bloom-vivid as the hero aurora accent for primary interactive elements and brand marks; teal-silk-vivid for secondary content and glows; violet-shadow-soft for atmospheric gradients and layered depth; cerulean-veil-muted for body text and high-contrast light elements against the dark background. Gradient technique: blend cobalt-ink-muted to violet-shadow-soft for background variation that mimics how aurora colors transition across the sky. Photography direction: long-exposure polar night photography, Nordic architecture at night, abstract ice and crystal macro photography with backlighting. The palette positions brands as visionary, technically sophisticated, or premium in an understated way.",
      promptWords: ["aurora borealis over arctic landscape", "northern lights reflected in frozen lake", "long exposure night sky aurora", "ice cave illuminated by teal aurora", "polar night sky with violet aurora bands"],
      useCases: ["Nordic and Scandinavian brands", "Technology and innovation product launches", "Games and entertainment platforms", "Premium night-sky experiences and observatories"],
    },
  ),
];

collections.push(...extraCollections12);

const extraCollections13: ColorCollection[] = [
  createCollection(
    "desert-dusk",
    "Desert Dusk",
    "Warm terracotta, sun-bleached clay, dusty sage, pale sand, and deep sienna — the golden hour palette of arid landscapes and Southwest aesthetics.",
    "The desert at dusk compresses an extraordinary color range into a few minutes: clay-warm terracottas shift to deep sienna as shadows lengthen; sun-bleached surfaces cool from pale amber to dusty sage; the sky transitions from saturated amber through blush to the first violet of evening. This palette reconstructs that sequence — ember-tone-soft anchors the warm terracotta mid-ground, the primary surface color of adobe, clay tile, and desert rock in late-afternoon light; apricot-bloom-soft provides the lighter sun-bleached warm surface, the color of pale sand and drying clay; olive-tone-muted introduces the desert plant life — dusty sagebrush and low scrub that adds a muted cool note against the warmth; amber-shadow-soft deepens the palette toward the sienna and rust that dominates sheltered canyon walls and terracotta pottery; cobalt-mist-soft contributes the desert sky at the moment before dusk — still blue but beginning to grey at the horizon. The palette reads simultaneously as earthy and refined — appropriate for Southwest lifestyle brands, artisan craft, and premium hospitality.",
    ["Earthy", "Warm", "Artisan"],
    [
      "ember-tone-soft",
      "apricot-bloom-soft",
      "olive-tone-muted",
      "amber-shadow-soft",
      "cobalt-mist-soft",
    ],
    {
      editorialNote:
        "This palette requires a light, warm background to activate correctly — pair with apricot-veil-muted or amber-whisper-muted as the page background. ember-tone-soft as the primary brand anchor; apricot-bloom-soft for surface variations; olive-tone-muted as the single cool-leaning accent. Photography direction: terracotta pottery and ceramic objects in diffused window light, Southwest architecture in early morning or late afternoon light, natural dried botanicals and linen textiles.",
      promptWords: ["adobe building at golden hour", "terracotta pots in desert garden", "dried sagebrush on warm sand", "Southwest pottery on linen background", "canyon walls in late afternoon sun"],
      useCases: ["Southwest and desert lifestyle brands", "Artisan ceramics and handcraft e-commerce", "Premium hospitality and ranch resort brands", "Organic skincare and natural wellness products"],
    },
  ),
  createCollection(
    "dark-botanical",
    "Dark Botanical",
    "Deep forest green, noir violet, shadow plum, pewter sage, and faint blush — a moody botanical palette for editorial, luxury, and dark-mode brand work.",
    "The midnight garden is a specific aesthetic register: dark, lush, romantic, and slightly gothic — the visual language of luxury botanicals, dark academia, and high-end editorial photography. It works because it occupies hue territory (deep green-violet) that most brands avoid as too niche, giving it immediate differentiation value. Emerald-shadow-soft anchors the palette in the dark, saturated forest green that defines the aesthetic — the color of dense foliage at night, or of aged velvet in a dim interior; violet-shadow-muted provides the moody near-black purple that accompanies deep greens in this palette register — it serves as the darkest surface and background in dark-mode applications; plum-velvet-muted contributes depth without brightness — a shadow color that bridges green and purple in the mid-dark range, appropriate for overlays and secondary surfaces; jade-tone-muted adds a slightly lighter botanical green, the color of aged botanical prints and pressed specimens; blush-whisper-muted provides the single light accent, a deliberately spare pale warm note that creates a moment of air in an otherwise deep palette.",
    ["Moody", "Botanical", "Dark Mode"],
    [
      "emerald-shadow-soft",
      "violet-shadow-muted",
      "plum-velvet-muted",
      "jade-tone-muted",
      "blush-whisper-muted",
    ],
    {
      editorialNote:
        "This palette requires a dark background to function — use violet-shadow-muted or a near-black custom value (#0f0d12) as the primary page background. emerald-shadow-soft as the primary brand accent and interactive element color; jade-tone-muted for secondary content and botanical graphic elements; blush-whisper-muted for body text and sparingly as a warmth accent. The key discipline: resist adding brightness. This palette's power is in restraint — keep light values rare and purposeful. Photography direction: dark botanical still life with single light source, luxury product photography on dark velvet or marble surfaces, overexposed flora against deep shadow backgrounds.",
      promptWords: ["dark botanical still life with candlelight", "luxury fragrance on dark marble", "overexposed orchid against black velvet", "pressed botanical specimens on dark paper", "dark academic library with botanical prints"],
      useCases: ["Luxury fragrance and beauty brands", "Dark mode editorial and portfolio websites", "Premium botanical skincare and apothecary", "Gothic and dark academia lifestyle content"],
    },
  ),
];

collections.push(...extraCollections13);

const extraCollections14: ColorCollection[] = [
  createCollection(
    "data-dashboard",
    "Data Dashboard",
    "Cobalt signal, teal confirmation, amber warning, crimson alert, and slate neutral — a perceptually balanced palette designed for analytics dashboards and data visualization interfaces.",
    "Data visualization demands a different color discipline than brand or editorial work. Colors must communicate data structure — category membership, sequential magnitude, divergence from a norm — without evoking false emotional associations. This palette builds a minimal but complete categorical foundation for dashboard design: cobalt-tone-vivid as the primary data series anchor, providing clear legibility against both light and dark dashboard backgrounds; teal-ink-muted as the secondary series color, maximally distinguishable from cobalt in both hue and temperature; amber-bloom-soft as the warning state, warm and attention-drawing without the false urgency of red; crimson-tone-soft as the alert state, clearly negative but not alarming; cobalt-tone-muted as the neutral baseline, appropriate for inactive series, disabled states, and zero-value bars. The palette was designed to maintain categorical distinguishability through common forms of color vision deficiency — lightness variation between any two colors exceeds 18 OKLCH L units.",
    ["Data Visualization", "Dashboard", "Functional"],
    [
      "cobalt-tone-vivid",
      "teal-ink-muted",
      "amber-bloom-soft",
      "crimson-tone-soft",
      "cobalt-tone-muted",
    ],
    {
      editorialNote:
        "Use cobalt-tone-vivid for the primary data series only — do not use it for UI chrome in the same interface, as mixing data-encoding and UI-encoding roles for the same color is a leading source of user confusion. amber-bloom-soft is the warning token, not a decorative accent. Test this palette in grayscale before finalizing: each color should remain distinguishable by lightness alone. Recommended pairing: use a very light warm white (#f8f7f5) as the chart background with these colors; on dark dashboards, increase all lightness values by 10-15 OKLCH L units.",
      promptWords: ["analytics dashboard with colored chart lines", "data visualization with categorical bars", "business intelligence interface with metrics", "dark mode dashboard with glowing chart lines", "monitoring dashboard with status indicators"],
      useCases: ["Product analytics dashboards", "Business intelligence and reporting tools", "Monitoring and observability interfaces", "Financial data visualization", "Health and wellness metric displays"],
    },
  ),
  createCollection(
    "film-neutral",
    "Film Neutral",
    "Warm parchment, exposed film beige, shadow gray-brown, dark slate, and off-black — the color palette of analog photography and cinema post-production.",
    "Analog film has a characteristic color signature that is distinct from digital neutral palettes. Film neutrals are warm-leaning — the silver halide chemistry of black-and-white film, the color masking of color negative film, and the warm-base optical printing process all introduced a slight warmth to shadows and a creamy quality to highlights. This palette reconstructs that register: amber-veil-muted provides the warm parchment quality of highlights in well-exposed color negative film, the tone of aged photographic paper; blush-pearl-soft contributes the mid-tone warmth of exposed but undeveloped silver — a quality often described as 'analog warmth'; cobalt-veil-muted adds the shadow register — not pure neutral gray but a slightly cool dark value appropriate for shadow detail in film-grade work; cobalt-shadow-muted deepens the palette toward the cool-blue shadow quality that color negative film produces in deep shadows; cobalt-ink-soft provides the near-black that analog printing achieves — slightly desaturated and warm compared to digital pure black.",
    ["Film", "Analog", "Neutral"],
    [
      "amber-veil-muted",
      "blush-pearl-soft",
      "cobalt-veil-muted",
      "cobalt-shadow-muted",
      "cobalt-ink-soft",
    ],
    {
      editorialNote:
        "This palette works best in contexts where the warmth reads as intentional craft rather than technical limitation — photography portfolios, film production, editorial design, premium print. amber-veil-muted as the primary background or paper surface; blush-pearl-soft for secondary surfaces and card backgrounds; cobalt-veil-muted for subtle dividers and inactive elements; cobalt-shadow-muted and cobalt-ink-soft for text and dark surfaces. The warmth is calibrated to read as 'analog' on screen — avoid pairing with pure-white or pure-black, which will make the warmth look like a calibration error rather than a deliberate aesthetic choice.",
      promptWords: ["35mm film photograph with warm grain", "darkroom developing tray with photographic paper", "vintage cinema still with warm shadows", "analog photography workspace with film rolls", "black and white print with warm tone on fiber paper"],
      useCases: ["Photography portfolio websites and print labs", "Film production and post-production brands", "Analog/film photography equipment brands", "Darkroom-aesthetic editorial and print design", "Vintage and heritage brand identities"],
    },
  ),
];

collections.push(...extraCollections14);

const extraCollections15: ColorCollection[] = [
  createCollection(
    "velvet-dusk",
    "Velvet Dusk",
    "Deep plum, shadow violet, rose noir, dark orchid, and muted charcoal — a rich evening palette for luxury cosmetics, premium beauty, and dark editorial work.",
    "Velvet dusk is a specific register in the luxury color vocabulary: the deep, warm-dark purples and plums of evening beauty photography — the colors of velvet packaging, premium fragrances, and high-end editorial cosmetics. The palette lives at the intersection of warm and cool in the dark value range, where purple-pinks and blue-purples coexist without conflict. Plum-shadow-clear anchors the palette in a deep, warm-leaning plum that serves as the dominant brand surface — rich without being candy-like; mulberry-ink-soft provides the darkest, most neutral-dark entry, a near-black with enough purple residue to read as intentional; violet-mist-muted introduces a lighter, slightly cooler purple-gray that works for secondary surfaces and typography in light-mode applications; rose-nocturne-muted brings the warm pink-dark note that prevents the palette from reading as cold; orchid-shadow-muted completes the set with a mid-dark orchid that bridges the cool violet and warm rose entries. The palette is simultaneously evening, premium, and feminine without being pastel or juvenile.",
    ["Luxury", "Beauty", "Evening"],
    [
      "plum-shadow-clear",
      "mulberry-ink-soft",
      "violet-mist-muted",
      "rose-nocturne-muted",
      "orchid-shadow-muted",
    ],
    {
      editorialNote:
        "This palette requires careful proportion management: mulberry-ink-soft as the background at maximum depth; plum-shadow-clear as the primary brand accent; violet-mist-muted for light text and secondary surfaces in dark-mode applications. In light-mode: reverse the palette's role — use violet-mist-muted as the primary surface, plum-shadow-clear as the brand anchor, and pair with near-white for body areas. The rose-nocturne-muted note should be used for a single accent element per composition — it reads as distinctly warm against the cooler purples and draws the eye.",
      promptWords: ["velvet cosmetics packaging in studio light", "luxury perfume bottle on dark marble", "beauty editorial with plum editorial background", "dark-mode skincare brand interface", "premium evening fragrance campaign"],
      useCases: ["Luxury cosmetics and fragrance brands", "Premium beauty editorial and campaign", "Dark-mode fashion and lifestyle platforms", "High-end event and hospitality branding"],
    },
  ),
  createCollection(
    "coastal-fog",
    "Coastal Fog",
    "Pale slate, misty sage, silver white, pewter gray, and deep marine — the muted, cool-neutral palette of overcast coastal environments and maritime aesthetics.",
    "The coastal fog palette occupies a different register than the bright coastal palettes (clear aquas and vivid blues) — it represents the cooler, more atmospheric quality of foggy coastal mornings, overcast seascapes, and the specific desaturated blue-grays of maritime environments. This is the palette of weathered boat paint, salt-bleached driftwood, fog-softened horizon lines, and the silver-white light of a cloudy coastal day. Slate-veil-muted provides the foundational warm-cool gray of fog and bleached surfaces — not a design-neutral gray but a color with a slight blue-leaning identity; cerulean-mist-muted contributes the pale, desaturated near-blue that reads as sky-and-sea under overcast light; moss-mist-muted introduces the cool, slightly desaturated sage of coastal vegetation — muted beach grass and salt-weathered plant life; cobalt-shadow-muted provides the deep marine reference — a dark, desaturated blue that anchors the palette in the depth of seawater rather than sky; pearl-blush-soft supplies the palest, warmest entry — the faint warm-white of sea foam and salt-crystallized surfaces. Together the five colors create a palette that reads as simultaneously coastal and sophisticated, appropriate for maritime brands, technology companies, and any identity that requires restraint and cool-neutral authority.",
    ["Coastal", "Cool-Neutral", "Atmospheric"],
    [
      "cobalt-veil-muted",
      "cerulean-mist-muted",
      "moss-mist-muted",
      "cobalt-shadow-muted",
      "blush-pearl-soft",
    ],
    {
      editorialNote:
        "This palette's mood depends entirely on application — on white or near-white backgrounds, it reads as minimalist coastal; on dark backgrounds, it reads as atmospheric and moody. For brand applications: cobalt-shadow-muted as the primary dark anchor; cerulean-mist-muted as the secondary surface color; pearl-blush-soft for light surface areas and body text backgrounds. Typography: use cobalt-shadow-muted for headings and primary navigation — it functions as the palette's 'almost black' without introducing a temperature conflict. Photography direction: overcast coastal scenes, fog over water, weathered maritime surfaces, silver-white diffused natural light.",
      promptWords: ["foggy coastal morning on rocky shore", "weathered boat hull in gray harbor", "overcast beach with pale sand and sea foam", "maritime warehouse in silver morning light", "salt-weathered coastal architecture in fog"],
      useCases: ["Maritime and coastal lifestyle brands", "Technology and SaaS companies with minimal aesthetic", "Premium hospitality in coastal or Nordic environments", "Architecture and interior design with cool-neutral palette"],
    },
  ),
];

collections.push(...extraCollections15);

const extraCollections16: ColorCollection[] = [
  createCollection(
    "golden-hour",
    "Golden Hour",
    "Warm amber, apricot glow, honey silk, ember core, and amber velvet — the concentrated warmth of late-afternoon light for lifestyle, photography, and editorial brands.",
    "Golden hour is the 45-minute window before sunset when sunlight travels through more atmosphere, scattering blue wavelengths and concentrating warm amber and orange frequencies. The resulting light quality — saturated warmth at medium-high lightness, with deep amber shadows — is one of the most recognizable and commercially desirable color registers in photography, film, food, and lifestyle branding. The palette captures this light in its full range: amber-bloom-clear provides the luminous, slightly saturated amber of direct golden-hour sun — the color of light striking a glass of honey; apricot-silk-soft delivers the warm, peachy-amber of skin and light fabric illuminated from behind; honey-bloom-muted introduces the slightly softer, more golden version of the same warmth — amber where the direct light has diffused; ember-core-soft supplies the deeper, more saturated anchor — the color of direct sunlight on warm stone or the concentrated warmth of backlit leaves; amber-velvet-soft completes the palette with the deep warm-amber shadow value — the color of late shadow in golden light, where warmth persists into the darker values. Together these five colors recreate the luminosity gradient of golden-hour light from highlight to deep warm shadow.",
    ["Warm", "Lifestyle", "Photography"],
    [
      "amber-bloom-clear",
      "apricot-silk-soft",
      "honey-bloom-muted",
      "ember-core-soft",
      "amber-velvet-soft",
    ],
    {
      editorialNote:
        "Use amber-bloom-clear as the dominant color only in small doses — as an accent, button, or single hero element — since its saturation at mid-lightness becomes dominant quickly. For layouts: honey-bloom-muted as the primary warm surface; apricot-silk-soft for secondary backgrounds and gradient bases; amber-velvet-soft for text, deep containers, and anchor elements. The palette pairs well with off-white or warm cream for neutrals — avoid pure white, which introduces a cold note that breaks the temperature coherence. For photography: warm, golden-hour lifestyle scenes; food photography; lifestyle brands positioned around warmth, hospitality, and natural light.",
      promptWords: ["golden-hour light on rustic linen table setting", "food photography in warm late afternoon light", "lifestyle brand with amber and honey palette", "editorial sunset portrait with golden backlight", "warm artisan product photography in natural light"],
      useCases: ["Food and beverage lifestyle brands", "Photography studios and editors", "Hospitality and travel brands", "Natural and artisan product lines"],
    },
  ),
  createCollection(
    "digital-night",
    "Digital Night",
    "Cobalt ink, indigo shadow, violet nocturne, electric iris, and deep sapphire — the high-contrast, cool-dark palette of developer tools, AI interfaces, and night-mode technical products.",
    "The digital night palette operates in the register of premium technical dark interfaces: not the generic near-black of mainstream dark mode, but the specific blue-violet-indigo darkness of sophisticated developer tools, terminal emulators, code editors, and AI product interfaces. This darkness has hue — it is not neutral gray but a deliberate cool-blue-to-violet spectrum that implies depth, intelligence, and precision. Cobalt-ink-muted provides the foundational dark background — a deep, near-black cobalt that reads as dark without being simply gray, establishing the palette's cool directional identity; indigo-shadow-soft delivers the secondary surface value — slightly lighter and warmer than cobalt-ink, appropriate for cards, panels, and elevated surfaces in dark layouts; violet-nocturne-muted introduces the darkest purple-adjacent entry — for the deepest container backgrounds and gradient bases; iris-core-vivid is the palette's electric accent — a high-saturation, mid-lightness blue-violet that functions as the primary interactive color and the point of maximum visual energy in the system; sapphire-ink-soft closes the palette with a deep, cool blue-black anchor that provides contrast against the lighter accent and functions as the palette's primary text-background pairing surface.",
    ["Dark", "Tech", "Developer"],
    [
      "cobalt-ink-muted",
      "indigo-shadow-soft",
      "violet-nocturne-muted",
      "iris-core-vivid",
      "sapphire-ink-soft",
    ],
    {
      editorialNote:
        "This palette requires a single high-energy accent (iris-core-vivid) against a field of dark, cool neutrals. The common mistake is using too many saturated elements — the electric iris accent only works because it is surrounded by the muted, near-neutral dark of cobalt-ink, indigo-shadow, and sapphire-ink. Proportion guideline: dark backgrounds 70%; muted surface colors 20%; electric accent 10% maximum. For developer tool interfaces: use cobalt-ink-muted as the primary editor background; indigo-shadow-soft for the sidebar; iris-core-vivid for syntax highlighting of keywords and interactive elements; off-white or pale blue for primary text. Avoid red accents — they introduce a temperature conflict that reads as warning/error rather than feature. Reserve red for genuine error states only.",
      promptWords: ["dark developer IDE with blue-violet syntax highlighting", "AI chat interface at night with electric accent", "terminal emulator with cool dark theme", "SaaS analytics dashboard in deep blue-dark mode", "technical product launch page with electric iris accent"],
      useCases: ["Developer tools and IDE themes", "AI and machine learning product interfaces", "Technical SaaS dark-mode dashboards", "Night-mode lifestyle and gaming applications"],
    },
  ),
];

collections.push(...extraCollections16);

const extraCollections17: ColorCollection[] = [
  createCollection(
    "terracotta-workshop",
    "Terracotta Workshop",
    "Warm ember, coral, apricot, and honey tones — the earthy, handmade palette for craft brands, ceramics, and artisan product design.",
    "The terracotta workshop palette captures the warm mineral spectrum of hand-thrown pottery, artisan ceramics, and craft studio aesthetics. Built around muted ember and coral tones with honey and apricot accents, it conveys warmth through restraint — these are not bright oranges but oxidized, clay-fired earthy tones that feel material and tactile. Ember-tone-muted anchors the palette as a warm, mid-dark clay note — a color that reads as terracotta without the fluorescent intensity of pure orange; coral-silk-muted provides the secondary warm surface — lighter and slightly more pink-leaning than ember, appropriate for backgrounds and secondary containers in craft editorial; apricot-pearl-soft introduces the most delicate entry — a pale, creamy apricot that functions as the near-white neutral for headers and light surfaces; honey-velvet-soft closes the warm range with a richer, deeper honey amber that works as the dark text anchor and grounding element.",
    ["Craft", "Warm", "Artisan"],
    [
      "ember-tone-muted",
      "coral-silk-muted",
      "apricot-pearl-soft",
      "honey-velvet-soft",
      "amber-bloom-clear",
    ],
    {
      editorialNote:
        "Terracotta workshop works best on surfaces that reference material texture — rough linen, uncoated paper, raw wood grain. In digital contexts, use an off-white or warm paper background (not pure white) to maintain the material warmth; pure white surfaces introduce a sterile note that disconnects from the craft positioning. Pair with a serif typeface with editorial warmth (Freight Text, Canela, Playfair Display) rather than geometric sans-serifs, which create a temperature conflict. Photography direction: natural light only, imperfect surfaces welcome — handprints, glaze drips, throwing marks. The palette pairs poorly with cooler accent colors like aqua, mint, or cobalt; if a cool contrast is needed, use a very pale blush whisper as the lightest neutral to bridge temperatures.",
      promptWords: ["hand-thrown ceramic bowls in terracotta clay tones", "artisan pottery studio with warm earthy palette", "craft packaging design with organic warm surfaces", "ceramics brand product photography in natural light", "workshop with clay, wood, and warm material textures"],
      useCases: ["Ceramics and pottery brands", "Artisan food and beverage brands", "Craft studio branding and packaging", "Home goods and material product lines"],
    },
  ),
  createCollection(
    "fresh-herb",
    "Fresh Herb",
    "Mint whisper, seafoam mist, jade silk, moss bloom, and leaf tone — a clean, living-green palette for health, wellness, and botanical brands.",
    "The fresh herb palette draws from the botanical spectrum of growing things: the pale aqua-green of young mint leaves, the deeper seafoam of fresh basil, the rich jade of mature herb garden growth, and the warm olive-moss of dried herbs. Unlike the cooler teal/aqua collections, fresh herb stays in the warm-green register — these are plant colors, not mineral or water colors. Mint-whisper-soft opens the palette at maximum lightness — a barely-there pale green that works as the primary white substitute, maintaining the botanical direction while avoiding the clinical sterility of pure white; seafoam-mist-soft provides the secondary light surface — slightly more saturated and visible than mint whisper, appropriate for cards and gentle section differentiation; jade-silk-clear introduces the palette's first clearly saturated entry — a mid-green with enough chroma to read as a brand color and function as an interactive accent; moss-bloom-muted grounds the palette with a softer, more olive-leaning mid-green that pairs well with the brighter jade accent; leaf-tone-clear adds the deeper, vegetation-green anchor that works as the text color in all-green layouts.",
    ["Botanical", "Fresh", "Wellness"],
    [
      "mint-whisper-soft",
      "seafoam-mist-soft",
      "jade-silk-clear",
      "moss-bloom-muted",
      "leaf-tone-clear",
    ],
    {
      editorialNote:
        "Fresh herb is a palette that performs well in light-mode digital contexts for health, food, and wellness brands but requires careful contrast management. Jade-silk-clear (the primary interactive color) should be tested at 4.5:1 contrast minimum against the light backgrounds — jade-silk-clear on mint-whisper-soft may be too low-contrast for accessible text; use leaf-tone-clear or moss-bloom-muted for body text instead. For CTAs and interactive elements, jade-silk-clear on white or mint-whisper-soft backgrounds typically passes AA for large text and UI components (3:1), but verify with the WCAG Auditor before finalizing. Photography: macro herb and botanical photography with natural light, shallow depth of field. Pair with a humanist sans-serif (Nunito, Inter, Source Sans) for contemporary wellness positioning, or a geometric sans for clinical/supplement brand positioning.",
      promptWords: ["fresh herb garden photography with botanical greens", "wellness brand palette with mint and jade tones", "organic food brand packaging with living green colors", "supplement brand with clean botanical green system", "health app with fresh mint and jade design palette"],
      useCases: ["Health and wellness brands", "Organic food and beverage packaging", "Supplement and nutraceutical brands", "Botanical beauty and skincare brands"],
    },
  ),
];

collections.push(...extraCollections17);

const extraCollections18: ColorCollection[] = [
  createCollection(
    "cobalt-spectrum",
    "Cobalt Spectrum",
    "A five-step monochromatic cobalt scale — from whisper pale through deep ink — the complete system blue for professional digital products.",
    "The cobalt spectrum is a functional monochromatic system palette built for serious digital products. Rather than curating hue variety, it commits fully to cobalt blue across five perceptually spaced lightness levels: a near-white pale for backgrounds, a soft mid for surfaces and containers, the saturated core for interactive elements and brand moments, a deep velvet for text and secondary actions, and ink for maximum contrast. This palette architecture reflects how professional design systems actually work — most colors in a UI are the same hue at different intensities, with rare accent interventions from the broader palette. Cobalt-whisper-muted functions as the warm white substitute for surfaces and backgrounds, light enough to feel clean without reading as stark; cobalt-silk-soft provides the medium-light card and container surface, visually anchored in the hue family without competing with the interactive tier; cobalt-core-clear is the system's action color — saturated enough to attract attention, light enough to carry white text at AA compliance; cobalt-dusk-soft enters the darker register for secondary UI elements, navigation items, and supporting text; cobalt-ink-muted provides maximum contrast for primary typographic elements and the darkest surface in a dark-mode configuration.",
    ["Monochromatic", "System", "Professional"],
    [
      "cobalt-whisper-muted",
      "cobalt-silk-soft",
      "cobalt-core-clear",
      "cobalt-dusk-soft",
      "cobalt-ink-muted",
    ],
    {
      editorialNote:
        "Cobalt spectrum is a design system architect's palette, not an editorial or brand palette. It assumes that most layout decisions — color management, hierarchy, attention direction — will be made within the cobalt hue family, with external colors (error red, success green, warning amber) appearing as exception states only. Before implementing this as a full system, audit your product for color use: if your UI needs more than 4-5 distinct hue families to function, a monochromatic system will feel constraining. But for products that currently use 15+ ad-hoc colors, reducing to a disciplined cobalt spectrum often dramatically improves visual coherence. Photography and illustration direction should lean toward complementary warmth (amber, terracotta, cream tones) as the cobalt system's natural environmental contrast partner.",
      promptWords: ["professional web application dashboard in cobalt blue", "SaaS product interface with monochromatic navy system", "fintech app design in deep cobalt with light blue backgrounds", "design system documentation in blue monochromatic palette", "corporate intranet in professional cobalt blue scale"],
      useCases: ["Enterprise SaaS products", "Fintech and banking applications", "Design system documentation", "Corporate digital products", "Professional web applications"],
    },
  ),
  createCollection(
    "stone-and-teal",
    "Stone & Teal",
    "Warm greige neutrals grounded by a single precise teal accent — the architect's palette for interiors, services, and professional digital work.",
    "Stone and teal is the restraint palette — built on the principle that most visual space should be as neutral as possible to give the accent color maximum force. The neutral range runs through warm olive-shifted grays that feel material rather than digital: they have enough warmth to feel like stone, plaster, or unbleached linen rather than monitor gray. Against this warm neutral ground, the teal accent reads with exceptional clarity — cool, precise, and purposeful. Olive-veil-muted provides the near-white background, slightly warm enough to prevent the clinical sterility of pure white; olive-whisper-muted is the secondary surface for cards and raised elements — the difference between it and the veil tone is enough to create visual depth without introducing contrast that competes with the teal; olive-mist-muted acts as the divider and secondary text color, maintaining the warm neutral character at medium lightness; olive-tone-muted provides the darker neutral for secondary actions, labels, and supporting interface elements; teal-core-clear is the single vivid element — the interactive color, the brand moment, the signature. Used at approximately 10% of total color area.",
    ["Minimal", "Neutral+Accent", "Professional"],
    [
      "olive-veil-muted",
      "olive-whisper-muted",
      "olive-mist-muted",
      "olive-tone-muted",
      "teal-core-clear",
    ],
    {
      editorialNote:
        "Stone and teal's discipline is its strength and its constraint: it requires restraint in execution. Every addition of a second vivid color breaks the palette's logic — the architect's one-accent rule is non-negotiable here. This makes it ideal for experienced design teams who understand that limiting the palette simplifies future decisions, but difficult for organizations where multiple stakeholders add 'just one more color' to communications over time. The warm neutral family (olive-shifted) pairs best with photography that includes natural materials: stone, wood, concrete, linen, ceramic. Avoid photography with strong saturated backgrounds (which compete with the teal) or strong cool tones (which conflict with the warm neutral base). Typography should be minimal — ideally a geometric sans-serif that doesn't introduce its own personality competing with the palette's restraint.",
      promptWords: ["architectural office interior in warm stone and teal accents", "professional services firm website with minimal warm-neutral design", "interior design studio with warm concrete and teal brand color", "consulting firm digital identity in stone and teal", "premium real estate brand in warm neutral with teal accents"],
      useCases: ["Architecture and interior design firms", "Premium real estate and property", "Professional services and consulting", "Minimal digital products and SaaS", "Corporate brand identity"],
    },
  ),
  createCollection(
    "rose-scale",
    "Rose Scale",
    "Five steps from pale blush whisper to deep rose shadow — the complete feminine monochromatic system for beauty, bridal, and editorial brands.",
    "The rose scale is a feminine monochromatic brand system built around the full lightness range of a single rose hue. Unlike collections that blend hue families for variety, rose scale commits to the monochromatic discipline — all hierarchy, depth, and nuance comes from lightness variation within a single pink-rose register. This approach works particularly well for beauty, bridal, and editorial brands that want immediate hue recognition (this is a pink brand) while demonstrating sophisticated design thinking through the control of scale rather than variety. Rose-whisper-muted opens the palette at maximum delicacy — a barely-visible rose tint for backgrounds and light surfaces, warm enough to distinguish itself from white but light enough to serve as the canvas for text and photography; rose-bloom-soft provides the mid-light surface for cards and containers, with enough visibility to create subtle depth between background tiers; rose-core-clear is the palette's saturated action color — the pink that reads unmistakably as rose, used for primary CTAs, key interactive elements, and brand accent moments; rose-velvet-soft descends into the darker rose range, appropriate for secondary text, navigation elements, and dark-mode surfaces; rose-shadow-muted approaches near-black within the rose family, providing the anchor for primary text and the deepest contrast the palette generates.",
    ["Monochromatic", "System", "Elegant"],
    [
      "rose-whisper-muted",
      "rose-bloom-soft",
      "rose-core-clear",
      "rose-velvet-soft",
      "rose-shadow-muted",
    ],
    {
      editorialNote:
        "Rose scale succeeds as a system palette only with strict application discipline. The temptation to introduce complementary colors — a green accent, a cream neutral, a black text — should be resisted in favor of using the darkest rose step (shadow) as the 'black' and the whisper step as the 'white.' This constraint produces the strongest brand coherence. Accessibility testing is essential before finalizing: rose hues in the mid-range (bloom through core) may not achieve 4.5:1 contrast against the pale background steps for text-size applications. In those cases, use rose-shadow-muted for body text and reserve the saturated core for large-type elements and interactive components only. Photography direction: warm natural light, skin tones, soft fabrics (silk, cotton, linen), florals in pale or deep rose registers. Avoid strong blue or green photography color casts, which create temperature dissonance against the warm rose palette.",
      promptWords: ["bridal brand editorial in pale and deep rose tones", "luxury skincare brand photography in monochromatic rose palette", "wedding invitation design in blush to deep rose scale", "beauty brand website in pink monochromatic system", "fashion editorial in rose whisper to rose shadow"],
      useCases: ["Bridal and wedding brands", "Luxury beauty and skincare", "Fashion editorial and publishing", "Feminine personal care brands", "Romantic event and hospitality brands"],
    },
  ),
];

collections.push(...extraCollections18);

export const extraCollections19: ColorCollection[] = [
  createCollection(
    "ink-and-gold",
    "Ink and Gold",
    "Deep indigo ink tones anchored by warm amber-gold accents — the premium editorial palette for luxury publishing, fintech, and dark-mode brand identities.",
    "Ink and gold is the classic luxury contrast palette, built here on a cool-shifting deep indigo-ink base with warm amber accents that read as genuine gold rather than cheap yellow. The palette works because the indigo dark and the amber light are both slightly chromatic — neither is a neutral — creating a tension that feels expensive and deliberate. The indigo-ink base provides the near-black that grounds premium dark interfaces; cobalt-nocturne supplies the secondary dark surface for cards and layered elements; amber-velvet adds a warm midtone that bridges the temperature gap between cool dark and warm accent; amber-bloom-clear is the signature gold — saturated and warm, used for key interactive elements, gold-rule details, and brand accent moments; amber-pearl-soft provides the near-white that completes the scale, warm enough to harmonize with the amber accent without competing with it.",
    ["Dark", "Luxury", "Editorial"],
    [
      "indigo-ink-muted",
      "cobalt-nocturne-muted",
      "amber-velvet-muted",
      "amber-bloom-clear",
      "amber-pearl-soft",
    ],
    {
      editorialNote:
        "Ink and gold succeeds through deliberate temperature contrast: the cool-shifting dark (indigo) against the warm accent (amber). Avoid the temptation to warm the dark base — the coolness is what makes the gold read as rich rather than muddy. In interface applications, use the indigo-ink as the true background, cobalt-nocturne for elevated surfaces (cards, modals), and reserve amber-bloom-clear strictly for primary actions and brand moments. Overusing the gold — making it appear in headers, borders, and multiple UI states simultaneously — dilutes its premium signal. Typography direction: use a high-contrast serif for display type to complement the editorial character; set body text in amber-pearl-soft (the light end of the palette) against the dark base. Photography: architectural photography, editorial portraits, still-life product shots. Avoid colorful lifestyle photography that competes with the palette's restraint.",
      promptWords: [
        "luxury financial app in dark indigo and gold",
        "premium publishing brand in ink and amber editorial palette",
        "fintech dark mode interface in deep navy and warm gold",
        "premium whiskey brand identity in dark and gold",
        "architecture magazine editorial in dark ink and gold accent",
      ],
      useCases: [
        "Luxury fintech and wealth management apps",
        "Premium publishing and editorial brands",
        "High-end spirits and luxury goods",
        "Architecture and design publications",
        "Dark-mode SaaS for enterprise clients",
      ],
    },
  ),
  createCollection(
    "moss-linen",
    "Moss and Linen",
    "Pale linen whites and muted olive grounds layered with soft moss greens — the organic naturalist palette for wellness, sustainability, and botanical brands.",
    "Moss and linen is the palette of considered natural living — built on warm pale grounds that evoke unbleached linen and aged paper, layered upward through the muted greens of ground moss and forest understory. Every color in the range has its chroma kept deliberately low: this is not a vibrant palette but an organic one, where the restraint of saturation communicates that the brand is careful, unhurried, and rooted in natural processes rather than manufactured urgency. Olive-veil-muted is the palest ground — slightly warm and barely visible as a color, functioning as the near-white background; olive-whisper-muted steps up as the secondary surface with just enough warmth to distinguish itself; moss-pearl-muted introduces the first legible green — delicate, barely-green, like the first growth of lichen on stone; moss-silk-muted deepens the green register to a readable mid-value that works for secondary text and subtle borders; moss-tone-muted anchors the palette as the darkest value in regular use, providing contrast for text while remaining firmly within the green-muted family.",
    ["Organic", "Minimal", "Wellness"],
    [
      "olive-veil-muted",
      "olive-whisper-muted",
      "moss-pearl-muted",
      "moss-silk-muted",
      "moss-tone-muted",
    ],
    {
      editorialNote:
        "Moss and linen works best when photography and typography reinforce the restrained natural character. Photography direction: natural light, textures (linen, ceramic, wood, stone), herbs and botanicals, minimal props. Avoid high-saturation photography or images with strong non-green color elements — they create jarring contrast against the muted ground. Typography: a humanist serif or a slightly rounded sans-serif complements the organic sensibility; avoid geometric or brutalist typefaces that feel industrial against the palette's natural warmth. Accessibility note: the muted palette has limited contrast range — moss-tone-muted on olive-veil-muted may not achieve the 4.5:1 ratio required for body text. Supplement with a near-black text color (outside the palette's five-color range) or a darker moss value for body copy, reserving the five palette colors for interface structure and branding.",
      promptWords: [
        "organic skincare brand photography in moss and linen palette",
        "wellness app interface in muted olive and soft green",
        "sustainable fashion brand website in natural linen and moss tones",
        "botanical illustration brand in pale olive and moss green",
        "herbal apothecary brand identity in muted greens and warm neutrals",
      ],
      useCases: [
        "Wellness and natural health brands",
        "Sustainable and organic product brands",
        "Botanical and garden-related brands",
        "Eco-conscious food and beverage",
        "Minimalist lifestyle and home decor",
      ],
    },
  ),
];

collections.push(...extraCollections19);

const extraCollections20: ColorCollection[] = [
  createCollection(
    "twilight-lavender",
    "Twilight Lavender",
    "Soft violets and muted purples deepening toward evening dusk — a meditative palette for wellness, beauty, and premium digital experiences that require calm authority.",
    "Twilight lavender is built on the color register that appears in the sky just before full dark — when blue has warmed toward violet and the light source is diffuse and fading. The palette moves through five deliberate steps: iris-veil-muted opens as the palest near-white with just enough violet to register as intentional color rather than untreated white; iris-pearl-muted steps the chroma up slightly while remaining firmly in the delicate register used for premium background surfaces; violet-silk-clear introduces the first clearly violet tone — mid-value, clean chroma, the workhorse accent color that handles links, highlights, and interactive emphasis; violet-tone-muted deepens toward the rich mid-dark that creates text contrast and structural depth; and plum-ink-muted closes the palette as the darkest anchor — deep enough for full-contrast body text in dark mode or deep surface backgrounds.",
    ["Wellness", "Beauty", "Premium"],
    [
      "iris-veil-muted",
      "iris-pearl-muted",
      "violet-silk-clear",
      "violet-tone-muted",
      "plum-ink-muted",
    ],
    {
      editorialNote:
        "Twilight lavender works best in interfaces where calm and authority coexist — meditation apps, premium skincare, holistic health practices, and night-mode digital experiences. Photography direction: low ambient light, soft diffuse sources, botanical close-ups in violet and purple tones (lavender fields, orchids, wisteria), evening sky tones. Avoid harsh shadows and bright direct light — the palette communicates a late-day, reflective quality that clashes with midday sun photography. Typography: a refined serif or a light-weight geometric sans complements the meditative quality; avoid heavy, aggressive typefaces.",
      promptWords: [
        "premium wellness app in soft lavender and deep violet",
        "luxury skincare brand in twilight purple and muted lavender",
        "meditation and mindfulness platform in calm violet tones",
        "holistic health brand identity in lavender and plum",
        "evening-mode digital experience in violet and near-black",
      ],
      useCases: [
        "Wellness apps and meditation platforms",
        "Premium skincare and beauty brands",
        "Holistic health and therapy services",
        "Premium nighttime digital products",
        "Luxury fragrance and candle brands",
      ],
    },
  ),
  createCollection(
    "chalk-and-coral",
    "Chalk and Coral",
    "Chalky off-whites and warm bone tones paired with soft coral — an approachable warmth palette for creative studios, lifestyle brands, and editorial content.",
    "Chalk and coral is a palette built around the warmth of sun-bleached surfaces and the soft warmth of coral at low chroma. Ember-veil-muted establishes the palette's base — a near-white with just enough warm undertone to prevent clinical coldness, functioning as the primary background for content-heavy layouts. Apricot-veil-muted steps up as a secondary surface with more warmth — slightly apricot-tinted, functioning as the alternative background for cards, callouts, and contained surfaces. Coral-silk-muted introduces the palette's defining color — a soft coral at mid-value and restrained chroma, warm without being saturated, suitable for both accent text and background use in smaller areas. Coral-tone-muted deepens the coral register to a value that handles secondary headings and structural elements without becoming heavy. Ember-shadow-muted anchors the dark end — a warm, earthy near-dark that feels far more human than cold gray or pure black.",
    ["Warm", "Editorial", "Lifestyle"],
    [
      "ember-veil-muted",
      "apricot-veil-muted",
      "coral-silk-muted",
      "coral-tone-muted",
      "ember-shadow-muted",
    ],
    {
      editorialNote:
        "Chalk and coral suits brands that want warmth without energy — approachable and human, but not playful or loud. It works well for creative studios, interior design brands, lifestyle blogs, and food and wellness editorial content. Photography direction: natural light, warm shadows, textured surfaces (linen, ceramic, wood), fresh flowers in pink and peach tones, morning light. Avoid cool-toned photography — blue-hour shots, overcast grey days, or cool studio lighting will clash with the palette's warm base.",
      promptWords: [
        "creative studio branding in warm chalk white and soft coral",
        "lifestyle blog visual identity in warm off-white and terracotta",
        "interior design brand in chalk and muted coral palette",
        "artisan food brand photography in warm cream and coral tones",
        "editorial content layout in chalk white and warm terracotta",
      ],
      useCases: [
        "Creative and design studios",
        "Lifestyle and food editorial brands",
        "Interior design and home decor",
        "Artisan and craft product brands",
        "Warm-aesthetic digital magazines",
      ],
    },
  ),
  createCollection(
    "slate-and-sage",
    "Slate and Sage",
    "Cool blue-gray slates and muted sage greens — a composed, professional palette for architecture, real estate, and premium B2B brands that signal considered restraint.",
    "Slate and sage is built on the color relationship between cool architectural surfaces (concrete, stone, aged metal) and the understated green of sage and rosemary in dry gardens. These colors are associated with permanence, skill, and environmental awareness — qualities that premium professional services brands seek to communicate. Cobalt-veil-muted opens as the palest blue-gray, barely warm enough to be distinguished from pure white, functioning as the clean neutral background for text-heavy layouts. Cobalt-pearl-muted deepens to a readable secondary surface tone used for panels, cards, and contained areas. Moss-silk-muted introduces the palette's green register — muted enough to read as a sophisticated neutral rather than a decorative color. Cobalt-tone-muted moves into the darker blue-gray that handles subheadings and secondary structure. Cobalt-ink-muted closes as the near-dark anchor, cool-toned enough to feel architectural and authoritative.",
    ["Professional", "Architecture", "Minimal"],
    [
      "cobalt-veil-muted",
      "cobalt-pearl-muted",
      "moss-silk-muted",
      "cobalt-tone-muted",
      "cobalt-ink-muted",
    ],
    {
      editorialNote:
        "Slate and sage works best for brands in architecture, engineering, real estate, professional services, and premium B2B. The palette communicates competence, permanence, and environmental sensitivity without warm-industry friendliness. Photography direction: architectural photography (clean geometry, natural materials, open space), landscape photography with green-gray tones (sage, olive, stone), black and white photography with green tint. Avoid saturated photography — vivid colors in editorial context clash with the palette's composed restraint.",
      promptWords: [
        "architecture firm branding in cool slate and muted sage",
        "real estate developer brand identity in slate gray and sage green",
        "professional services firm in slate and sage palette",
        "sustainable building brand in cool gray and muted green",
        "premium B2B SaaS interface in slate and sage tones",
      ],
      useCases: [
        "Architecture and engineering firms",
        "Real estate developers and brokers",
        "Premium professional services",
        "Sustainable building and environmental consultancies",
        "B2B enterprise software with premium positioning",
      ],
    },
  ),
];

collections.push(...extraCollections20);

const extraCollections21: ColorCollection[] = [
  createCollection(
    "glacier-melt",
    "Glacier Melt",
    "Pale arctic blues and icy celadon whites — a cold clarity palette for technology, premium water brands, and Scandinavian-aesthetic interfaces.",
    "Glacier melt is built on the colors of Arctic ice at different thicknesses and densities: the near-white of deep pack ice, the pale blue of compressed glacial ice, the clear blue-green of meltwater channels. Azure-veil-faint opens as the barely-tinted white base — cold, clean, and airy. Azure-whisper-faint steps up as the secondary surface, adding just enough blue to register intentionally. Aqua-mist-soft introduces the first clearly green-shifted blue — the signature celadon of glacial meltwater, modern and distinctive. Azure-tone-muted deepens to a readable mid-value for structural elements and secondary headings. Cerulean-ink-muted anchors the palette as the darkest value — deep enough for full text contrast while maintaining the cold, Arctic register throughout.",
    ["Cold", "Minimal", "Technology"],
    [
      "azure-veil-faint",
      "azure-whisper-faint",
      "aqua-mist-soft",
      "azure-tone-muted",
      "cerulean-ink-muted",
    ],
    {
      editorialNote:
        "Glacier melt works for brands that want to communicate pristine, cold precision — premium water brands, Scandinavian-aesthetic design systems, clean technology products, and air purification or environmental technology companies. Photography direction: frozen landscapes, clean ice textures, minimal white space, pale northern light. Avoid warm photography entirely — golden hour, amber sunsets, and warm interior shots will clash with the cold palette register. Typography: a geometric sans at light or regular weight; avoid decorative or serif typefaces.",
      promptWords: [
        "premium water brand in glacier blue and Arctic white",
        "Scandinavian design system in cold white and pale blue",
        "clean technology brand in icy azure and pale celadon",
        "air purification product in frost white and glacier blue",
        "minimal productivity app in cold pale blue tones",
      ],
      useCases: [
        "Premium water and beverage brands",
        "Scandinavian-aesthetic product design",
        "Clean technology and environmental products",
        "Minimal productivity and focus applications",
        "Healthcare and pharmaceutical digital products",
      ],
    },
  ),
  createCollection(
    "amber-library",
    "Amber Library",
    "Deep amber and warm cognac tones with leather-brown anchors — an intellectual warmth palette for publishing, education, and knowledge-product brands.",
    "Amber library is built around the colors of a well-used private library: aged paper, polished wood surfaces, leather binding, the amber glow of incandescent reading lights. Honey-whisper-muted opens as the palest aged-paper white — barely yellowed, warm but not obviously orange. Amber-pearl-muted deepens as the secondary surface tone, adding warmth that calls to mind old linen or aged ivory. Honey-silk-muted introduces the amber register at mid-value — the color of old honey, warm and rich without being sweet. Amber-shadow-muted moves into the deeper cognac-brown territory that handles structural elements, secondary headings, and contained surface areas with depth. Honey-ink-muted closes as the near-dark anchor — a warm, brown-shifted near-black that is far more intimate than cold neutral-gray.",
    ["Warm", "Editorial", "Knowledge"],
    [
      "honey-whisper-muted",
      "amber-pearl-muted",
      "honey-silk-muted",
      "amber-shadow-muted",
      "honey-ink-muted",
    ],
    {
      editorialNote:
        "Amber library suits brands in publishing, education, knowledge management, and intellectual product spaces. It reads as warm, serious, and deep — the palette of learning rather than entertainment. Photography direction: aged paper textures, wood surfaces, leather, warm lamp light, architectural interiors with rich wood tones. Avoid cold or clinical photography — chrome, cool lighting, and modern minimalist spaces conflict with the palette's warmth. Typography: a serif typeface strongly enhances the editorial quality; a sturdy old-style serif (Garamond family) is ideal.",
      promptWords: [
        "educational platform in warm amber and aged ivory",
        "publishing brand identity in cognac brown and warm paper white",
        "knowledge management app in amber and warm near-black",
        "library system interface in honey and deep brown tones",
        "bookstore brand in warm amber and leather brown palette",
      ],
      useCases: [
        "Educational platforms and e-learning",
        "Publishing and media brands",
        "Knowledge management and note-taking applications",
        "Bookstores and literary brands",
        "Premium newsletter and subscription journalism",
      ],
    },
  ),
  createCollection(
    "concrete-bloom",
    "Concrete & Bloom",
    "Cool concrete gray surfaces with single soft blossom accents — an urban naturalist palette for architecture, property, and brands at the intersection of the built and natural environment.",
    "Concrete and bloom juxtaposes the precision and coolness of architectural gray with the soft vulnerability of a single flowering accent — representing the wildflowers that grow through cracks in city concrete. True-gray-whisper-faint establishes the cool neutral base — genuinely neutral, neither warm nor cold, a foundation for maximum content flexibility. Cool-gray-pearl-faint adds a slightly cooler secondary surface, leaning into the architectural register. Rose-bloom-soft introduces the palette's accent — a mid-value blush-rose at low chroma, functioning as the human warmth in an otherwise monolithic gray world. True-gray-tone-muted deepens to a structural mid-gray for secondary text and dividers. True-gray-ink-faint closes as the anchoring near-dark — still cooler than warm near-blacks, precise and architectural.",
    ["Architecture", "Urban", "Contrast"],
    [
      "true-gray-whisper",
      "cool-gray-pearl",
      "rose-bloom-soft",
      "true-gray-tone",
      "true-gray-ink",
    ],
    {
      editorialNote:
        "Concrete and bloom is ideal for architecture firms, real estate developers, property brands, and urban lifestyle companies. The gray communicates built precision; the blossom accent communicates human scale and warmth. The contrast between the two is the entire point — a gray-only palette is sterile, but the single warm accent humanizes without softening. Photography direction: architectural photography with unexpected botanical intrusions (moss, flowers, vines on concrete), urban landscape with natural elements, structural forms with soft natural accents. Typography: a refined grotesque sans is ideal; avoid decorative or script typefaces.",
      promptWords: [
        "architecture firm branding in cool gray and soft rose accent",
        "real estate developer brand in concrete gray and blush",
        "urban property platform in structural gray with botanical accent",
        "city lifestyle brand in concrete and single bloom palette",
        "design studio in cool neutral gray and warm rose accent",
      ],
      useCases: [
        "Architecture and design firms",
        "Real estate developers and property platforms",
        "Urban lifestyle and city-living brands",
        "Interior design with minimal color",
        "Premium co-working space brands",
      ],
    },
  ),
  createCollection(
    "verdigris-copper",
    "Verdigris & Copper",
    "Aged green patina and warm copper — the palette of oxidized metal and industrial heritage for craft brands, spirits, and premium artisan goods.",
    "Verdigris and copper is built on the color pair that appears when copper ages in the open air — the warm orange-brown of polished copper transitions over years into the cool blue-green of verdigris patina. Teal-whisper-soft establishes the palette's cool patina note — a pale, slightly muted blue-green that reads as aged rather than fresh. Jade-pearl-soft deepens the patina toward a more saturated jade-green mid-tone, the color of the transition zone between copper and verdigris. Ember-silk-soft introduces the copper register — a warm amber-orange mid-tone that sits in contrast to the cool patina tones. Teal-tone-muted darkens toward the deeper blue-green that characterizes aged bronze surfaces. Ember-shadow-soft closes as the warm dark anchor — a deep amber-brown that reads as aged copper or weathered metal.",
    ["Artisan", "Heritage", "Craft"],
    [
      "teal-whisper-soft",
      "jade-pearl-soft",
      "ember-silk-soft",
      "teal-tone-muted",
      "ember-shadow-soft",
    ],
    {
      editorialNote:
        "Verdigris and copper works for craft spirits (whiskey, rum, gin), artisan goods, hardware and tool brands, vintage industrial aesthetics, and premium heritage products. The palette communicates age, quality, and craft — things made with hands and improved by time. Photography direction: aged metal surfaces, copper pots and tools, craft distillery environments, aged wood and metal industrial spaces, warm incandescent lighting. Avoid modern minimalist photography — cold white studio shots, clean digital renders, or contemporary architectural spaces will break the palette's heritage register.",
      promptWords: [
        "craft distillery brand in verdigris and warm copper palette",
        "artisan hardware brand in aged copper and patina green",
        "heritage spirits label in teal patina and amber copper tones",
        "premium brewery in verdigris green and copper brown",
        "industrial craft brand in aged metal palette",
      ],
      useCases: [
        "Craft spirits and distilleries",
        "Artisan food and beverage brands",
        "Heritage and vintage product brands",
        "Craft tool and hardware brands",
        "Premium heritage goods and leather goods",
      ],
    },
  ),
  createCollection(
    "dusk-violet",
    "Dusk Violet",
    "Deep indigo evening tones with soft mauve accents — a premium twilight palette for beauty, wellness, and sophisticated nightlife brands.",
    "Dusk violet is built on the colors of late twilight — not the sunset warmth that precedes it, but the cool, deepening violet that follows once the sun has set and before true dark falls. Orchid-veil-faint opens as the palest barely-violet white — the color of a sky that has just lost its last warmth, cool and quiet. Violet-pearl-muted deepens as the secondary surface tone — distinctly violet but still light enough for background application in text-heavy layouts. Orchid-silk-soft introduces the palette's defining mid-value — a soft, warm mauve that sits between pink and purple, the color of a fading peony at dusk. Indigo-tone-muted darkens to the structural anchor for secondary text and contained areas, a deep blue-violet with authority. Plum-ink-muted closes as the near-dark — a deep plum that functions as the darkest value, rich and dark without becoming unpleasant to read against.",
    ["Evening", "Luxury", "Premium"],
    [
      "orchid-veil-faint",
      "violet-pearl-muted",
      "orchid-silk-soft",
      "indigo-tone-muted",
      "plum-ink-muted",
    ],
    {
      editorialNote:
        "Dusk violet suits premium beauty and fragrance brands, evening cocktail bars and nightlife venues, luxury wellness retreat brands, and sophisticated subscription or membership services that want to feel exclusive and evening-appropriate. It occupies the space between the meditation-calm of twilight lavender and the energetic confidence of neon-after-dark — composed, luxurious, and distinctly nighttime. Photography direction: evening light, candles, deep violet and indigo ambient lighting, botanical close-ups in mauve and purple tones, low-key studio photography with purple gels. Avoid daylight photography — the palette's register is nocturnal.",
      promptWords: [
        "premium fragrance brand in dusk violet and deep plum",
        "luxury cocktail bar in indigo and mauve evening palette",
        "high-end wellness retreat in soft orchid and plum tones",
        "exclusive membership platform in deep violet and mauve",
        "premium beauty brand in dusk orchid and plum palette",
      ],
      useCases: [
        "Premium fragrance and beauty brands",
        "Luxury cocktail bars and evening venues",
        "Wellness retreats and meditation centers",
        "Exclusive membership and subscription services",
        "Sophisticated evening event brands",
      ],
    },
  ),
];

collections.push(...extraCollections21);

const extraCollections22: ColorCollection[] = [
  createCollection(
    "sand-dune",
    "Sand Dune",
    "Warm apricot and honey dune tones — a Mediterranean sun palette for hospitality, wellness, and organic lifestyle brands.",
    "Sand dune is built on the layered colors of sun-warmed desert sand from pale late-afternoon light to the deep amber of shadow in a dune's fold. Apricot-veil-faint opens as the barely-warm base — the color of bleached sand in bright noon sun, almost white but with enough warmth to register. Honey-whisper-muted steps up as the secondary surface, introducing the characteristic honey warmth of sandstone without becoming obviously orange. Apricot-pearl-soft deepens to the mid-value sand tone — warm, gentle, and round — that works for contained surface areas and secondary UI elements. Honey-silk-soft moves into the richer amber-honey that appears in the shadowed sides of dunes, the most distinctive tone in the set. Amber-shadow-muted anchors the palette as the structural dark — a warm, deep amber-brown that functions as near-black while remaining unmistakably warm throughout.",
    ["Warm", "Hospitality", "Organic"],
    [
      "apricot-veil-faint",
      "honey-whisper-muted",
      "apricot-pearl-soft",
      "honey-silk-soft",
      "amber-shadow-muted",
    ],
    {
      editorialNote:
        "Sand dune is ideal for Mediterranean hospitality, organic skincare and beauty, wellness retreats, artisan food brands, and sustainable lifestyle companies. It carries immediate associations with warmth, natural materials, and unhurried ease. Photography direction: sun-warmed surfaces, linen and natural cotton textiles, terracotta and raw clay ceramics, warm afternoon light, beaches and arid landscape details. Avoid cool photography — gray skies, cold architectural white, and blue-shifted environments will break the palette's warmth. Typography: a humanist or old-style typeface adds warmth; geometric sans at medium weight provides modern contrast.",
      promptWords: [
        "Mediterranean wellness retreat in warm sand and honey tones",
        "organic skincare brand in apricot and natural amber palette",
        "boutique hospitality brand in sand dune and warm amber",
        "artisan food company in honey and warm sand tones",
        "sustainable lifestyle brand in pale apricot and earthy amber",
      ],
      useCases: [
        "Mediterranean hospitality and resort brands",
        "Organic skincare and natural beauty",
        "Wellness retreat and spa identity",
        "Artisan food and beverage brands",
        "Sustainable and slow-living lifestyle brands",
      ],
    },
  ),
  createCollection(
    "nordic-morning",
    "Nordic Morning",
    "Ice-pale blues and cool bone whites — a cold-light clarity palette for Scandinavian-aesthetic brands, productivity tools, and premium cold-climate design.",
    "Nordic morning captures the quality of light in northern latitudes in early morning: the pale, slightly blue-shifted light that precedes sunrise, where everything is visible but nothing is warm. Azure-veil-faint opens as the barely-blue base — nearly white, with just enough cool blue presence to read as intentional rather than warm-neutral. Cool-gray-whisper provides the secondary surface in near-perfect neutral gray, slightly cooler than warm-gray, adding structural separation without temperature shift. Cerulean-bloom-muted introduces the first clearly defined blue mid-tone — a muted cerulean at medium lightness, the color of a clear northern sky at depth. Azure-tone-soft darkens toward a readable structural blue-gray for secondary text and contained areas, still firmly light and cool. Cobalt-ink-muted closes as the near-dark anchor — a deep muted cobalt that provides full text contrast while maintaining the cool Nordic register.",
    ["Cold", "Scandinavian", "Precision"],
    [
      "azure-veil-faint",
      "cool-gray-whisper",
      "cerulean-bloom-muted",
      "azure-tone-soft",
      "cobalt-ink-muted",
    ],
    {
      editorialNote:
        "Nordic morning is the colder sibling of Glacier Melt — where Glacier Melt is purely arctic and aqua-tinged, Nordic morning is true cold-sky blue with a neutral gray grounding. It suits Scandinavian-aesthetic lifestyle brands, productivity and focus applications, minimal architecture, and healthcare technology. Photography direction: overcast northern light, white and gray interiors with wooden accents, frosted glass, winter landscape, crisp architectural photography with gray skies. Avoid warm photography entirely — golden light and amber surfaces will fight the palette's cold register. Typography: a geometric or neo-grotesque sans in light or regular weight; the more refined and precise the better.",
      promptWords: [
        "Scandinavian productivity app in pale blue and cool gray",
        "minimal architecture firm in Nordic blue and bone white",
        "premium cold-climate outdoor brand in azure and cobalt",
        "healthcare technology in cool cerulean and precise gray",
        "design studio in Nordic morning blue and off-white palette",
      ],
      useCases: [
        "Scandinavian-aesthetic product and brand design",
        "Productivity, focus, and minimal digital tools",
        "Architecture and interior design firms",
        "Healthcare technology and medical devices",
        "Cold-climate outdoor and lifestyle brands",
      ],
    },
  ),
  createCollection(
    "ember-hearth",
    "Ember Hearth",
    "Warm amber glows and deep ruby embers — a firelit warmth palette for home, hospitality, and brands that evoke comfort and gathered heat.",
    "Ember hearth is built on the colors of a dying fire: the pale warmth of amber-lit room air, the golden mid-glow of a bed of coals, the deeper orange-red of active embers, and the near-black of ash-edged charcoal. Amber-whisper-faint opens as the barely-warm base — the color of a room illuminated only by firelight at its most subtle, a warm cast on an otherwise white surface. Coral-pearl-muted deepens as the secondary surface tone, adding the soft coral warmth of firelight on skin or paper. Ember-silk-soft introduces the true ember register at mid-value — a warm orange-amber that is the visual heart of the palette, alive and present. Ruby-shadow-muted darkens toward the deep ruby-ember territory of a coal's glowing core. Ember-ink-muted closes as the anchoring near-dark — a warm, dark near-black with enough ember-red shift to feel intimate and firelit rather than cold.",
    ["Warm", "Cozy", "Hearth"],
    [
      "amber-whisper-faint",
      "coral-pearl-muted",
      "ember-silk-soft",
      "ruby-shadow-muted",
      "ember-ink-muted",
    ],
    {
      editorialNote:
        "Ember hearth suits home goods, hospitality, cozy food and beverage brands, premium candle and fragrance brands, and any product that sells comfort and warmth as its primary proposition. It is warmer and more physically present than Amber Library (which is intellectual and editorial) — this palette is about physical, sensory heat and comfort. Photography direction: firelight and candle-lit interiors, warm incandescent rooms, ceramics and textiles by fire, warm close-up food photography, evening light through warm window glass. Avoid cool or daylight photography. Typography: a slightly rounded humanist or slab serif reinforces warmth; sharp geometric sans will fight the palette's intimacy.",
      promptWords: [
        "premium candle brand in amber and ember tones",
        "cozy home goods in firelit warm palette",
        "boutique hospitality in ember and deep ruby",
        "artisan food brand in hearth-warm amber and coral",
        "luxury hot beverage brand in ember-glow palette",
      ],
      useCases: [
        "Candle, home fragrance, and aromatherapy brands",
        "Premium hot beverage and comfort food brands",
        "Cozy hospitality and boutique accommodation",
        "Home goods and warm interior brands",
        "Premium spirits with warmth and heritage positioning",
      ],
    },
  ),
  createCollection(
    "mint-laboratory",
    "Mint Laboratory",
    "Clean mint and precise seafoam greens on clinical white — a fresh precision palette for health tech, clean beauty, and science-backed wellness brands.",
    "Mint laboratory is built on the colors of a well-equipped research facility with unexpected plant life: the clinical whites and cool-neutral grays of precision environments, interrupted by the fresh, alive green of a mint plant growing in a window. Mint-veil-faint opens as the barely-green base — nearly white with a clean, fresh green tint that reads as hygienic and alive rather than sterile. Mint-bloom-muted deepens as the secondary surface, adding more visible mint presence at medium lightness without moving into vivid territory. Seafoam-silk-soft introduces the complementary seafoam note — where mint leans slightly cool-green, seafoam adds a slight aqua dimension that broadens the palette's freshness. Mint-tone-muted darkens toward a readable structural green-gray for secondary text and contained elements. Emerald-ink-muted closes as the deep anchor — a muted dark emerald-green that provides full contrast while maintaining the fresh, living-green register.",
    ["Fresh", "Clinical", "Health"],
    [
      "mint-veil-faint",
      "mint-bloom-muted",
      "seafoam-silk-soft",
      "mint-tone-muted",
      "emerald-ink-muted",
    ],
    {
      editorialNote:
        "Mint laboratory is designed for health technology, clean beauty and skincare, science-backed wellness supplements, functional food and beverage, and any brand that wants to communicate efficacy, cleanliness, and natural freshness simultaneously. It occupies the space between clinical white (too cold, too hospital-like) and lush botanical green (too untamed, too spa-like) — precise, fresh, and alive. Photography direction: clean laboratory aesthetics, fresh herbs and leaves in clinical environments, transparent ingredients against white, product photography on clean white with mint botanical accents. Typography: a geometric or neo-grotesque sans communicates precision; avoid decorative typefaces.",
      promptWords: [
        "health technology platform in clean mint and white palette",
        "science-backed skincare brand in mint and clinical white",
        "wellness supplement brand in fresh mint and precision green",
        "functional beverage brand in mint laboratory palette",
        "clean beauty brand in fresh seafoam and mint tones",
      ],
      useCases: [
        "Health technology platforms and medical interfaces",
        "Clean beauty, skincare, and cosmetics",
        "Science-backed wellness and supplement brands",
        "Functional food, beverage, and nutrition brands",
        "Telehealth and digital health products",
      ],
    },
  ),
];

collections.push(...extraCollections22);

const extraCollections23: ColorCollection[] = [
  createCollection(
    "solar-terracotta",
    "Solar Terracotta",
    "Sun-warmed terracotta and amber tones — a palette that captures the heat and depth of fired clay, sun-bleached stone, and desert warmth. For brands rooted in natural materials, craft, and artisan production.",
    "Solar terracotta is built on the color register of a Mediterranean sun at midday filtered through fired clay and warm stone. Apricot-whisper-soft opens as the barely-warm base — a clean light peach that reads as warm air rather than color. Coral-bloom-soft deepens toward the first visible terracotta pink-orange, the color of unglazed ceramic in diffuse light. Amber-silk-soft moves into the medium warm amber register — rich and sun-saturated without approaching orange. Amber-velvet-muted provides structure as a darkened, burnished amber-tone for secondary text and boundary elements. Ember-shadow-muted closes as the depth anchor — a dark fired-earth tone that completes the palette's warmth range from bleached pale to kiln-dark.",
    ["Warm", "Earthy", "Craft"],
    [
      "apricot-whisper-soft",
      "coral-bloom-soft",
      "amber-silk-soft",
      "amber-velvet-muted",
      "ember-shadow-muted",
    ],
    {
      editorialNote:
        "Solar terracotta is the palette for makers, craft brands, and products that reference natural materials and artisan process. It suits ceramics, handmade goods, natural skincare, heritage food and beverage, and travel brands focused on warm-climate destinations. Photography direction: fired clay, sun-bleached linen, natural terracotta pots, warm stone surfaces in afternoon light, craft workshop imagery with natural textures. Typography: a humanist or old-style serif communicates warmth and craft heritage; contemporary grotesques work in a clean-craft hybrid context.",
      promptWords: [
        "artisan ceramics brand in terracotta and warm amber palette",
        "natural skincare brand in sun-warmed earthy tones",
        "heritage food brand in craft terracotta palette",
        "warm-climate travel brand in terracotta and amber",
        "handmade goods brand in fired-clay and warm stone tones",
      ],
      useCases: [
        "Ceramics, pottery, and artisan craft brands",
        "Natural and organic skincare and beauty",
        "Heritage food, olive oil, and Mediterranean grocery brands",
        "Warm-climate hospitality and travel",
        "Handmade goods marketplaces and artisan platforms",
      ],
    },
  ),
  createCollection(
    "deep-ocean",
    "Deep Ocean",
    "From pale horizon cerulean to abyssal cobalt navy — a full-depth ocean palette anchored in the blues of open water, coastal mist, and deep-sea dark. For maritime, oceanic, and premium technical brands.",
    "Deep ocean moves through the full chromatic depth of open water, from the pale blue of a hazy coastal horizon to the near-black of an oceanic trench. Cerulean-whisper-muted opens as the pale coastal tone — barely blue, like early morning sea mist. Cerulean-mist-soft extends into the visible light-blue of shallow coastal water in clear conditions. Azure-silk-soft enters mid-palette as the classic open-ocean midpoint — clear, confident blue with the luminosity of deep water in full sun. Cobalt-dusk-clear deepens toward the darker, richer blue of the open Atlantic or Pacific at depth. Cobalt-shadow-muted anchors at near-black navy — the color of deep water at night or from maximum depth, the ultimate dark end of the ocean palette.",
    ["Cool", "Depth", "Maritime"],
    [
      "cerulean-whisper-muted",
      "cerulean-mist-soft",
      "azure-silk-soft",
      "cobalt-dusk-clear",
      "cobalt-shadow-muted",
    ],
    {
      editorialNote:
        "Deep ocean is a natural fit for maritime brands, sailing and water sports, ocean conservation, premium water products, and technical brands in navy-blue territory. It also works for financial, insurance, and professional services seeking a trustworthy blue that does not read as standard corporate. Photography direction: open water at various depths and times of day, coastal mist, underwater photography with light refracting through water, traditional marine navigation instruments. Typography: a clean, geometric or neo-grotesque sans communicates technical precision at sea; a transitional serif can add maritime heritage.",
      promptWords: [
        "sailing and maritime brand in deep ocean navy palette",
        "premium water and hydration brand in oceanic blues",
        "ocean conservation platform in coastal to deep-sea tones",
        "technical outdoor apparel brand in navy and cerulean",
        "professional services firm in deep trustworthy navy",
      ],
      useCases: [
        "Sailing, maritime, and water sports brands",
        "Premium water, hydration, and beverage brands",
        "Ocean conservation and environmental NGOs",
        "Technical outdoor and performance apparel",
        "Financial, legal, and professional services",
      ],
    },
  ),
  createCollection(
    "pearl-cloud",
    "Pearl Cloud",
    "Soft cloud-white through silvery pearl to cool stone gray — a palette of refined neutrals with just enough blue-violet presence to read as sophisticated rather than sterile. For premium technology, luxury retail, and editorial design.",
    "Pearl cloud is an achromatic palette with a breath of cool hue — the faintest violet-blue tint that prevents the whites from reading as blank and lifts the grays from corporate beige. Azure-veil-faint opens as the barely-blue white — a white with the subtlest sky reflection, appropriate as the dominant background. Iris-whisper-soft introduces the pearl tone proper — a soft, pearl-white with a gentle violet presence. Cerulean-pearl-muted deepens toward a recognizable cool pearl gray, the color of brushed aluminum or high-grade paper stock. Azure-tone-muted provides structural weight as a cool blue-gray for secondary text, dividers, and contained elements. Sapphire-shadow-soft anchors the palette as a dark cool-blue gray — deep enough for primary text while maintaining the cool refined register of the palette throughout.",
    ["Neutral", "Refined", "Cool"],
    [
      "azure-veil-faint",
      "iris-whisper-soft",
      "cerulean-pearl-muted",
      "azure-tone-muted",
      "sapphire-shadow-soft",
    ],
    {
      editorialNote:
        "Pearl cloud is designed for premium tech products, luxury retail, high-end editorial, and any brand that wants the sophistication of a neutral palette without the warmth of off-white or the coldness of pure gray. It occupies the nuanced space of a high-spec material surface — anodized aluminum, frosted glass, high-grade matte coated paper. Photography direction: product photography on pearl and stone surfaces, brushed metal textures, frosted glass, clean architectural photography in overcast or soft-diffuse light. Typography: a geometric or rational sans (Helvetica Neue, Aktiv Grotesk, Inter) in this palette reads as premium tech; a refined transitional serif reads as luxury retail.",
      promptWords: [
        "premium technology brand in pearl and cool gray palette",
        "luxury retail in refined cool-neutral tones",
        "high-end editorial design in pearl cloud palette",
        "architecture or real estate brand in sophisticated pearl gray",
        "professional services in refined neutral blue-gray",
      ],
      useCases: [
        "Premium consumer technology and hardware brands",
        "Luxury retail and e-commerce",
        "High-end editorial and publishing",
        "Architecture, real estate, and interior design",
        "Professional consulting and advisory firms",
      ],
    },
  ),
  createCollection(
    "golden-harvest",
    "Golden Harvest",
    "Warm ochre, honey, and burnished gold tones — the palette of late-summer harvest light, dried grasses, golden-hour fields, and aged beeswax. For food, agriculture, nature, and warm premium lifestyle brands.",
    "Golden harvest is assembled from the chromatic range of late-summer agricultural abundance: bleached wheat, dried grass, liquid honey, aged beeswax, and the warmest moment of golden-hour light before it tips into orange. Citrine-whisper-soft opens as the palest harvest tone — warm off-white with a gentle yellow presence, the color of bleached linen left in summer sun. Honey-whisper-soft deepens to the first perceptible honey tone — delicate, warm, and naturally lit. Citrine-silk-soft moves into the vibrant midrange of golden wheat — warm, luminous, and richly saturated without tipping toward amber. Honey-velvet-muted provides warm depth as a burnished honey-gold — the color of aged beeswax or pressed olive oil. Amber-shadow-muted anchors as the depth value — a dark warm amber-gold that completes the palette from pale harvest to rich dark warmth.",
    ["Warm", "Harvest", "Natural"],
    [
      "citrine-whisper-soft",
      "honey-whisper-soft",
      "citrine-silk-soft",
      "honey-velvet-muted",
      "amber-shadow-muted",
    ],
    {
      editorialNote:
        "Golden harvest suits food and agriculture brands, natural honey and bee-product companies, sustainable farming, artisan food production, and premium lifestyle brands in the warm-organic space. It also works for financial products wanting warmth over traditional navy-blue trustworthiness, and wellness brands that want warmth without terracotta. Photography direction: golden-hour agricultural fields, liquid honey and beeswax, dried wheat and grasses, warm stone with afternoon light, artisan food preparation with natural lighting. Typography: a humanist serif or a well-considered display typeface in this palette reads as premium natural; geometric sans at lighter weights communicates contemporary clean.",
      promptWords: [
        "artisan honey and bee product brand in golden harvest palette",
        "sustainable farm-to-table food brand in warm ochre and honey",
        "premium grain and natural food brand in harvest gold tones",
        "organic lifestyle brand in golden-hour warmth palette",
        "premium agricultural brand in sun-dried wheat and amber",
      ],
      useCases: [
        "Honey, beeswax, and apiary products",
        "Sustainable agriculture and farm-to-table brands",
        "Premium artisan food and grocery",
        "Organic wellness and natural lifestyle brands",
        "Warm-premium financial and advisory brands",
      ],
    },
  ),
];

collections.push(...extraCollections23);

const extraCollections24: ColorCollection[] = [
  createCollection(
    "storm-silver",
    "Storm Silver",
    "Cool graphite, silver-gray, and storm-cloud tones — precise, technical, and quietly sophisticated. For professional tools, enterprise software, and premium industrial design.",
    "Storm silver draws from the chromatic range of storm-lit skies, brushed aluminum, polished concrete, and anodized titanium surfaces. Cobalt-pearl-faint opens at near-white with the faintest cool presence — the color of overcast daylight on white concrete. Cerulean-whisper-muted deepens to the first distinct cool-gray tone — the color of polished industrial stone or matte aluminum. Azure-silk-faint moves into a confident mid-gray that reads as technical and refined simultaneously. Cobalt-shadow-soft contributes a barely-perceptible cool-blue shadow depth — the hue that natural metal surfaces show when lit from above. Cobalt-shadow-muted anchors as the deep storm-silver — near-dark neutral with a precise, metallic character.",
    ["Cool", "Technical", "Sophisticated"],
    [
      "cobalt-pearl-faint",
      "cerulean-whisper-muted",
      "azure-silk-faint",
      "cobalt-shadow-soft",
      "cobalt-shadow-muted",
    ],
    {
      editorialNote:
        "Storm silver suits enterprise software, professional SaaS tools, advanced consumer technology, industrial design, and any brand that wants to communicate precision and technical credibility without warmth. It is the palette of high-quality German engineering, precision optical instruments, premium industrial hardware, and high-specification manufacturing. Photography direction: brushed aluminum and titanium surfaces, architectural concrete, precision machined metal parts, overcast industrial environments, technical product photography on gray and white backgrounds. Typography: a geometric or industrial sans (Helvetica, Inter, Aktiv Grotesk) in storm silver reads as precision-engineered; a compressed condensed grotesque reads as technical and performance-focused.",
      promptWords: [
        "enterprise software or SaaS brand in storm silver palette",
        "precision technology brand in brushed aluminum and cool gray",
        "industrial design or engineering brand in graphite palette",
        "premium consumer electronics in storm silver tones",
        "professional tools brand in technical cool-gray palette",
      ],
      useCases: [
        "Enterprise software and B2B SaaS platforms",
        "Precision manufacturing and industrial brands",
        "Advanced consumer technology and hardware",
        "Professional tools and high-specification equipment",
        "Architecture, engineering, and technical consulting",
      ],
    },
  ),
  createCollection(
    "blush-garden",
    "Blush Garden",
    "Warm rose, peach, and dusty blush tones — soft, romantic, and quietly luxurious. For beauty, wellness, bridal, and feminine lifestyle brands at any market level.",
    "Blush garden is assembled from the warm-pink range of early garden blooms: tea rose petals, pale peach blossom, dusty carnation, and the warm flush of cherry at first light. Rose-pearl-faint opens at near-white with the softest rose warmth — the color of fresh cream with a single drop of rose water. Rose-whisper-soft deepens to the first distinct blush tone — gentle, warm, and unmistakably feminine without being cloying. Coral-whisper-soft introduces the peach-blossom note — slightly warmer and more apricot-adjacent, like the inner petals of a garden peony. Rose-silk-soft moves into a confident medium blush — saturated but still delicate, a dusty tea rose or faded carnation. Rose-velvet-muted anchors with depth — a dusky rose-mauve that carries the romantic weight of old garden varieties.",
    ["Soft", "Romantic", "Feminine"],
    [
      "rose-pearl-faint",
      "rose-whisper-soft",
      "coral-whisper-soft",
      "rose-silk-soft",
      "rose-velvet-muted",
    ],
    {
      editorialNote:
        "Blush garden suits beauty and cosmetics brands at all price points, bridal and wedding industry, women's wellness and self-care, feminine lifestyle and fashion, and floral-adjacent product categories. It avoids the saturated hot-pink of mass-market beauty, instead occupying the more refined space of editorial beauty and premium skincare. Photography direction: fresh roses and garden blooms, natural light through linen, warm-lit close-up skin and texture photography, marble with soft pink veining, raw silk and cashmere in blush tones. Typography: a refined transitional serif or delicate thin-weight display type reads as luxury beauty in this palette; a humanist sans at light weights reads as clean contemporary wellness.",
      promptWords: [
        "luxury skincare or beauty brand in blush garden palette",
        "bridal and wedding brand in soft rose and blush tones",
        "women's wellness and self-care brand in dusty rose palette",
        "feminine lifestyle brand in garden blush and peach",
        "premium floral or gifting brand in rose garden tones",
      ],
      useCases: [
        "Luxury skincare and prestige beauty brands",
        "Bridal, wedding, and celebration design",
        "Women's wellness, self-care, and personal care",
        "Premium gifting, florist, and artisan product brands",
        "Feminine lifestyle, fashion, and editorial content",
      ],
    },
  ),
  createCollection(
    "dark-academia",
    "Dark Academia",
    "Deep tobacco, worn leather, aged paper, and forest-shadow greens — the palette of old libraries, candlelit study rooms, and scholarly melancholy.",
    "Dark academia draws from the chromatic universe of old-world learning: the warm amber of aged vellum, the deep brown of worn leather bindings, the gray-green of lichen on stone, and the dark forest shadows of overgrown university courtyards. Amber-shadow-soft opens with a warm, aged-paper tone — not bright or fresh, but the warmer oxidized hue of a page handled many times. Ember-shadow-muted deepens into worn leather territory — rich, complex, and dark with warm undertones of old tan and tobacco. Moss-shadow-muted contributes the green note — a dark forest-shadow green, heavy with age and moisture, like the north face of old stone. Amber-shadow-muted anchors the amber range in deep burnished warmth. Slate-shadow-muted provides the cool-dark counterpoint — a shadow gray that reads as old stone, slate roofing, or the cool air of an underground library.",
    ["Dark", "Literary", "Melancholic"],
    [
      "amber-shadow-soft",
      "ember-shadow-muted",
      "moss-shadow-muted",
      "amber-shadow-muted",
      "cobalt-shadow-muted",
    ],
    {
      editorialNote:
        "Dark academia suits literary and publishing brands, academic institutions with traditional heritage, premium stationery and journaling products, book subscription services, sophisticated education platforms, and any brand in the intellectual-melancholy aesthetic space. It has significant appeal in the social media cultural aesthetic community, making it well-suited for products targeting audiences who identify with academic or literary identities. Photography direction: candlelit desks with open books, aged library interiors, weathered stone and ivy, leather-bound books and vintage paper, autumn forest paths and fog. Typography: a transitional or old-style serif (Garamond, Palatino, EB Garamond) reads as authentically scholarly in this palette; a carefully chosen italic or blackletter accent adds atmospheric weight.",
      promptWords: [
        "literary or publishing brand in dark academia palette",
        "premium stationery and journaling brand in aged leather and parchment tones",
        "academic institution or education platform in scholarly dark palette",
        "book subscription or reading community brand in dark academia aesthetic",
        "luxury pen, ink, or writing instrument brand in tobacco and leather tones",
      ],
      useCases: [
        "Literary, publishing, and book-adjacent brands",
        "Academic institutions and educational platforms",
        "Premium stationery, journaling, and writing instruments",
        "Book subscription boxes and reading communities",
        "Atmospheric lifestyle brands in the scholarly aesthetic",
      ],
    },
  ),
  createCollection(
    "coastal-sage",
    "Coastal Sage",
    "Muted seafoam, dry sage, bleached driftwood, and coastal stone tones — the palette of sun-bleached shore, Mediterranean herbs, and unhurried summer light.",
    "Coastal sage is assembled from the desaturated, sun-baked color range of a Mediterranean coastline: dry sage and oregano on stony hillsides, bleached driftwood at the shore, the muted seafoam of a calm sea viewed from distance, and the pale warm gray of coastal limestone. Seafoam-pearl-faint opens at near-white with the faintest coastal coolness — the color of breaking foam against white sand. Jade-whisper-soft introduces the dry sage note — pale, muted, and sun-dried, carrying the character of wild coastal herbs. Teal-whisper-soft moves into the distant-sea tone — muted aqua, slightly cool, and deeply calming. Jade-whisper-muted deepens the sage note into a more present, full-bodied dried herb gray-green. Seafoam-shadow-soft anchors with the darkest tone — a muted seafoam-teal that carries the depth of coastal shadow in early morning.",
    ["Coastal", "Serene", "Mediterranean"],
    [
      "seafoam-pearl-faint",
      "jade-whisper-soft",
      "teal-whisper-soft",
      "jade-whisper-muted",
      "seafoam-shadow-soft",
    ],
    {
      editorialNote:
        "Coastal sage suits wellness and meditation brands, Mediterranean hospitality and travel, organic skincare and clean beauty, sustainable lifestyle and home goods, yoga and mindful living, and any brand whose identity centers on unhurried summer calm. It is more desaturated and driftwood-adjacent than typical coastal palettes, which makes it feel refined and editorial rather than mass-market beach. Photography direction: Mediterranean hillside herbs in dry summer light, bleached driftwood and smooth coastal stone, distant sea views in hazy afternoon light, linen and natural fiber textures, ceramic and terracotta in warm coastal tones. Typography: a humanist sans or casual script in this palette reads as warm and approachable; a refined old-style serif reads as Mediterranean artisan heritage.",
      promptWords: [
        "wellness or meditation brand in coastal sage palette",
        "Mediterranean hospitality or travel brand in sun-bleached coastal tones",
        "organic skincare or clean beauty brand in dry sage and seafoam",
        "sustainable lifestyle or home goods brand in coastal sage and driftwood",
        "yoga or mindful living brand in calm Mediterranean sage tones",
      ],
      useCases: [
        "Wellness, meditation, and mindful living brands",
        "Mediterranean hospitality, villa rentals, and travel",
        "Organic skincare and clean beauty",
        "Sustainable home goods and lifestyle products",
        "Yoga studios, wellness retreats, and spa brands",
      ],
    },
  ),
];

collections.push(...extraCollections24);

const extraCollections25: ColorCollection[] = [
  createCollection(
    "midnight-forge",
    "Midnight Forge",
    "Deep charcoal, cool navy, and polished steel tones — the palette of precision engineering, developer tools, and industrial technology with a premium finish.",
    "Midnight forge is drawn from the chromatic universe of high-precision manufacturing at night: the near-black of forged steel in low light, the cool blue-gray of polished tooled aluminum, the deep navy of industrial powder coating, and the subtle silver of precision machined surfaces. Cobalt-shadow-deep opens at the darkest end — not pure black but the deep cool-dark of forged metal in shadow, with a trace of blue. Cobalt-shadow-muted rises into full dark navy territory — the color of a precision instrument under halogen light, where the cool undertone is clearly visible. Cobalt-shadow-soft brings the palette toward accessible dark — a dark steel blue that reads as professional and precise. Slate-shadow-soft introduces the neutral anchor — a dark gray-charcoal that pairs with the blue tones as a secondary dark surface. Cobalt-whisper-muted provides the accent — a mid-tone steel blue that functions as the palette's single energetic note, used for highlights, interactive states, and key data markers.",
    ["Dark", "Technical", "Precision"],
    [
      "cobalt-shadow-vivid",
      "cobalt-shadow-muted",
      "cobalt-shadow-soft",
      "cobalt-shadow-faint",
      "cobalt-whisper-muted",
    ],
    {
      editorialNote:
        "Midnight forge is ideally positioned for developer tools, CLI products, terminal interfaces, infrastructure software, industrial technology brands, and precision manufacturing companies. It communicates engineering rigor, technical depth, and quiet confidence without the corporate neutrality of a standard dark-mode palette. Photography direction: precision-machined metal parts, server rack ambient glow, industrial equipment under task lighting, welding sparks against dark backgrounds, circuit board macro photography with selective focus. Typography: a geometric monospace or technical sans-serif (JetBrains Mono, IBM Plex, Geist Mono) reads as authentically developer-oriented in this palette; a bold industrial sans at heavy weight adds structural authority for headlines.",
      promptWords: [
        "developer tools brand in midnight forge dark palette",
        "industrial technology company in dark charcoal and steel tones",
        "infrastructure software product in deep navy and precision steel",
        "precision manufacturing brand in dark forge palette",
        "terminal or CLI product in dark steel and cobalt tones",
      ],
      useCases: [
        "Developer tools, CLI products, and terminal interfaces",
        "Infrastructure software and DevOps platforms",
        "Industrial technology and manufacturing equipment brands",
        "Precision instrument and hardware brands",
        "Dark-mode-first SaaS products in technical domains",
      ],
    },
  ),
  createCollection(
    "spring-herb",
    "Spring Herb",
    "Fresh sage, soft chartreuse, and light mint — the palette of new growth, clean ingredient lists, and wellness brands that want energy without loudness.",
    "Spring herb is assembled from the fresh, slightly yellow-green range of early spring: new herb growth, unfurling sage leaves, the light lime of young mint tips, and the barely-there green of glass filtered water. Chartreuse-pearl-faint opens at near-white — a barely visible warmth of new green, like sunlight through a single layer of fresh sage leaves. Lime-whisper-soft deepens to the first clear herb note — a soft, slightly warm mint-green that reads as 'fresh ingredients' without being aggressive. Sage-whisper-soft introduces the dry herb character — cooler, more gray-green, the color of mature sage before harvest. Lime-whisper-muted moves into a more confident spring green — present and energetic but still quiet, like a perfectly fresh celery note. Sage-whisper-muted anchors with depth — a mature sage that grounds the lighter tones with herbal complexity.",
    ["Fresh", "Natural", "Energetic"],
    [
      "lime-pearl-faint",
      "lime-whisper-soft",
      "moss-whisper-soft",
      "lime-whisper-muted",
      "moss-whisper-muted",
    ],
    {
      editorialNote:
        "Spring herb works for functional wellness and supplement brands, clean-ingredient food and beverage products, farm-to-table restaurants and food tech, natural personal care and clean beauty, and any brand that wants the freshness signal of green without the cold clinical associations of a pure emerald or bright lime. It is distinct from 'sustainability green' (which tends to be darker and more earthy) — spring herb is lighter, more vital, and more ingredient-forward. Photography direction: fresh herbs in natural light, clean kitchen preparation surfaces, close-up plant texture on white, farmers market produce, glass vessels with green liquid. Typography: a clean grotesque or humanist sans at regular or medium weight reads as modern wellness; a handcrafted serif can add artisanal warmth for food and farm contexts.",
      promptWords: [
        "wellness supplement brand in fresh sage and mint palette",
        "clean-ingredient food brand in spring herb tones",
        "farm-to-table restaurant brand in fresh green and herb palette",
        "natural personal care brand in light sage and chartreuse",
        "functional beverage or nutrition brand in fresh spring green",
      ],
      useCases: [
        "Functional wellness, supplement, and nutrition brands",
        "Clean-ingredient food and beverage products",
        "Farm-to-table restaurants and food technology",
        "Natural personal care and clean beauty brands",
        "Sustainable lifestyle and eco-friendly household products",
      ],
    },
  ),
  createCollection(
    "burnt-clay",
    "Burnt Clay",
    "Terra cotta, adobe, and sun-dried brick — warm earth tones fired by heat and shaped by hand. For artisan makers, interior design, and handmade goods with authentic heritage.",
    "Burnt clay is drawn from the warmest end of the earth-tone spectrum: the orange-red of fired terra cotta, the warm tan of sun-dried adobe brick, the dusty ochre of dry clay soil in summer heat, and the deep rust of kiln-fired pottery in reduction. Coral-silk-soft opens with a warm, pinkish-terra cotta tone — fresh from the kiln, still carrying a blush of rose in the orange warmth. Ember-whisper-muted deepens into the classic terra cotta note — warm orange-brown, the color of an unglazed pot on a Mediterranean windowsill. Amber-whisper-muted introduces the ochre note — a warm golden-tan that sits at the clay/earth boundary, dry and sun-heated. Ember-whisper-soft brings the palette's most orange note — a fired-earth tone with clear orange character, like autumn gourds or a ceramic bowl just removed from the kiln. Ember-shadow-soft anchors with depth — the deep rust-brown of high-fired clay in a reduction atmosphere, where oxygen restriction pulls reds toward deep rust and warm umber.",
    ["Warm", "Artisan", "Earthy"],
    [
      "coral-silk-soft",
      "ember-whisper-muted",
      "amber-whisper-muted",
      "ember-whisper-soft",
      "ember-shadow-soft",
    ],
    {
      editorialNote:
        "Burnt clay suits ceramic studios and pottery brands, artisan food and kitchen goods, interior design and home décor brands with a handmade or wabi-sabi aesthetic, natural skincare and body care in earth-toned packaging, and Southwestern or Mediterranean lifestyle brands. It occupies a distinct niche from standard warm earth tones — more fired and mineral than soft terracotta, more artisan than mass-market 'warm neutral'. Photography direction: thrown-clay pottery in natural light, kiln interiors with warm glow, raw clay texture and hand-forming shots, wooden cutting boards with warm-toned foods, sun-lit adobe architecture and textured plaster walls. Typography: a slightly rough or handcrafted serif adds authentic artisan character; a bold condensed sans in a strong weight can communicate craft confidence in shorter text.",
      promptWords: [
        "ceramic studio and pottery brand in terra cotta and burnt clay palette",
        "artisan kitchen and food goods brand in warm earth tones",
        "interior design brand in terra cotta and adobe palette",
        "natural skincare brand in warm clay and earth tones",
        "Southwestern or Mediterranean lifestyle brand in burnt clay palette",
      ],
      useCases: [
        "Ceramic studios, pottery makers, and kiln art brands",
        "Artisan food, kitchen, and tableware brands",
        "Interior design and home décor with handmade aesthetic",
        "Natural body care and skincare in earth-toned positioning",
        "Southwestern, Mediterranean, and warm-climate lifestyle brands",
      ],
    },
  ),
  createCollection(
    "arctic-white",
    "Arctic White",
    "Ice-silver, cold white, and near-zero gray — the palette of extreme minimalism, premium precision technology, and Scandinavian product design without ornamentation.",
    "Arctic white is assembled from the coldest, most minimal end of the white-gray spectrum: the ice-silver of a polished titanium surface, the near-zero white of fresh snow on a gray-sky day, the subtle cool of a Scandinavian interior in winter light, and the refined pale gray of high-end tech product surfaces. White-pearl-faint opens at absolute near-white — the color of cloud cover at noon, with the faintest suggestion of cool silvery undertone. Slate-pearl-faint introduces the first cool gray movement — a barely-there gray that on a pure white background reads as the palest possible step away from white. Slate-whisper-soft deepens to the first clearly gray tone — refined, cool, and very light, like brushed aluminum or raw concrete in indirect light. Slate-whisper-muted adds substance — a mid-light cool gray that functions as a text color, divider, or secondary surface in minimal design systems. Slate-shadow-soft provides the darkest anchor — a deep cool charcoal that maintains the cold temperature of the palette while providing usable contrast for headlines and primary navigation.",
    ["Minimal", "Cold", "Premium"],
    [
      "true-gray-veil",
      "cobalt-pearl-faint",
      "cool-gray-whisper",
      "cool-gray-whisper",
      "cobalt-shadow-faint",
    ],
    {
      editorialNote:
        "Arctic white suits premium consumer electronics and tech hardware brands, Scandinavian furniture and home design products, luxury minimal fashion and accessories, clinical health and medical technology, and any brand whose aesthetic proposition is radical simplicity and cold precision. It is the inverse of warm minimalism — where warm minimal palettes feel inviting and human, arctic white feels exact, refined, and slightly aloof. Photography direction: white studio product photography with cold shadows, industrial minimal architecture, polished white ceramic and titanium hardware, winter landscape abstractions, raw concrete with natural cold north light. Typography: a geometric or neo-grotesque sans at thin or light weight (Helvetica Neue Thin, Geist Light, PP Neue Machina) reads as authentically minimal in this palette; generous tracking and tight line-height complete the cold precision feel.",
      promptWords: [
        "premium consumer electronics brand in arctic white and cold gray palette",
        "Scandinavian furniture or home design in minimal cool tones",
        "luxury minimal fashion brand in ice-silver and white",
        "medical technology or health brand in clinical cold minimal palette",
        "ultra-minimal SaaS product in arctic white and cool gray system",
      ],
      useCases: [
        "Premium consumer electronics and technology hardware",
        "Scandinavian furniture, home, and lifestyle design",
        "Luxury minimal fashion and accessories",
        "Medical technology, health, and clinical products",
        "Ultra-minimal SaaS and software product brands",
      ],
    },
  ),
];

collections.push(...extraCollections25);


const extraCollections26: ColorCollection[] = [
  createCollection(
    "desert-gold",
    "Desert Gold",
    "Warm amber, sand, and ochre tones drawn from arid landscape light — the palette of artisan goods, natural beauty, and heritage craft.",
    "Desert gold captures the chromatic range of high-desert light at its most generous: the warm amber of sandstone cliffs at noon, the golden ochre of dried grass in late summer, the soft camel of weathered adobe, and the dusty terracotta of exposed canyon rock. Amber-sunrise-soft opens the palette at its warmest — a golden yellow-amber that reads as sunlit and generous. Amber-noon-muted shifts into ochre territory — the warm yellow-orange of natural pigment, beeswax, and raw linen. Amber-dusk-soft deepens toward camel and warm tan, carrying the palette's neutral anchor. Amber-earth-muted introduces the deeper ochre note — the color of clay soil and unglazed ceramic before firing. Amber-shadow-muted closes at a deep warm brown that grounds the palette and prevents it from reading as uniformly bright.",
    ["Warm", "Natural", "Artisan"],
    [
      "amber-mist-soft",
      "amber-silk-muted",
      "amber-dusk-soft",
      "amber-dusk-muted",
      "amber-shadow-muted",
    ],
    {
      editorialNote:
        "Desert gold is the natural palette for artisan goods brands, natural beauty and skincare, heritage craft and leather goods, boutique food and beverage, and interior design studios with a warm material aesthetic. Photography direction: raw linen texture in direct sunlight, ceramic vessels on natural wood, dried botanicals and seed pods, weathered terracotta tiles, beeswax candles on stone surfaces. Typography: a humanist serif (Cormorant, Freight Display) or a soft geometric sans (Brandon Grotesque, Proxima Nova) pairs with the warmth of this palette; heavy-weight typography at a deep warm brown creates authoritative hierarchy.",
      promptWords: [
        "artisan goods brand in warm amber and desert gold palette",
        "natural skincare brand in ochre and sand tones",
        "heritage craft studio in warm amber and camel palette",
      ],
      useCases: ["Artisan goods brands", "Natural beauty and skincare", "Heritage craft and leather goods"],
    }
  ),
  createCollection(
    "electric-violet",
    "Electric Violet",
    "Deep indigo and electric purple tones for creative tech, gaming, and entertainment brands that need presence without defaulting to primary red or blue.",
    "Electric violet draws from the indigo-to-violet spectrum at its most saturated and contemporary — the palette of creative technology, gaming hardware, generative AI products, and entertainment brands that want distinctiveness without corporate primary-color defaults. Violet-electric-muted leads at a vivid mid-value purple — enough saturation to read as energetic but not neon-crude. Violet-electric-soft lightens toward lavender-adjacent — accessible and approachable while maintaining the purple identity. Indigo-electric-muted provides the blue anchor — a deep electric indigo that reads as technical precision and depth. Violet-shadow-deep brings the darkest near-black — a deep purple-black that works as a dark surface with personality rather than generic black. Violet-whisper-soft provides the neutral — a very light lavender that serves as the palette's breathing room on white-adjacent surfaces.",
    ["Electric", "Creative", "Tech"],
    [
      "violet-core-clear",
      "violet-bloom-soft",
      "indigo-core-clear",
      "violet-shadow-vivid",
      "violet-whisper-soft",
    ],
    {
      editorialNote:
        "Electric violet suits creative technology platforms, AI products and startups, gaming hardware and software, entertainment streaming services, and digital-native brands competing in crowded spaces where differentiation from blue and red is strategically valuable. Photography direction: holographic foil textures, neon-lit urban environments at dusk, iridescent material surfaces, generative art with purple-indigo palette, dark studio photography with violet gel lighting. Typography: geometric sans-serifs (Neue Haas Grotesk, GT Walsheim) or variable display fonts read as tech-contemporary in this palette.",
      promptWords: [
        "AI startup brand in electric violet and deep indigo palette",
        "gaming hardware brand in vibrant purple and electric violet tones",
        "creative technology platform in indigo and purple identity",
      ],
      useCases: ["Creative tech and AI startups", "Gaming hardware and software", "Entertainment and streaming brands"],
    }
  ),
  createCollection(
    "forest-floor",
    "Forest Floor",
    "Deep moss, earthy umber, and warm bark tones — the palette for brands rooted in nature, sustainability, and the material world.",
    "Forest floor is drawn from the chromatic complexity of a temperate forest at ground level: the deep warm green of wet moss, the rich umber of exposed root systems, the cool shadow-green of lichen on stone, the warm brown of composting leaf matter, and the ochre tones of dried pine needles. Green-moss-muted leads with the palette's hero tone — a deep, warm-leaning green with enough complexity to read as genuinely botanical rather than generic. Green-shadow-muted deepens into forest-floor shadow territory — the near-black of soil and decomposing organic matter with a green undertone. Amber-earth-muted contributes the warm umber note — the color of exposed clay, bark, and dried botanical material. Green-whisper-soft provides the light tertiary — a muted sage that creates breathing room and pairs with the dark tones. Slate-earth-muted closes as a neutral gray-brown that grounds the palette without pulling toward either pure green or pure brown.",
    ["Natural", "Earthy", "Organic"],
    [
      "moss-tone-muted",
      "emerald-shadow-muted",
      "amber-dusk-muted",
      "emerald-whisper-soft",
      "cobalt-dusk-faint",
    ],
    {
      editorialNote:
        "Forest floor is the palette for sustainability-led brands, outdoor equipment and apparel, organic food and agriculture, environmental organizations, botanical wellness and herbalism, and heritage outdoor brands with deep roots in the natural world. Photography direction: macro forest floor details (moss texture, root systems, lichen), morning light in dense forest canopy, earthy material textures (unglazed ceramic, raw wood, stone), dried botanical and herbal product arrangements. Typography: humanist serifs with ink-trap details (Freight Text, Tiempos) or craft-forward slab serifs (Sentinel, Archer) reinforce the artisan-natural register of this palette.",
      promptWords: [
        "sustainability brand in deep moss and forest floor earthy palette",
        "outdoor equipment brand in warm botanical green and umber tones",
        "organic food brand in forest floor green and amber earth palette",
      ],
      useCases: ["Sustainability and environmental brands", "Outdoor and wilderness equipment", "Organic food and botanical wellness"],
    }
  ),
  createCollection(
    "pearl-oyster",
    "Pearl Oyster",
    "Soft cream, warm white, and luminous gray — the palette of quiet luxury, editorial fashion, and refined hospitality.",
    "Pearl oyster captures the narrow but richly varied chromatic range of luxury neutral surfaces: the warm cream of natural pearl, the cool luminous white of bleached linen, the warm gray of polished oyster shell, the soft beige of raw silk, and the slightly cooler gray of matte stone. The palette works precisely because its tones are never pure: there is always a trace of warmth or coolness that prevents the neutrals from reading as generic. Slate-whisper-soft leads with the coolest tone — a very light gray with a trace of blue-gray that reads as cool, precise, and editorial. Amber-whisper-soft provides the warm near-white — cream-adjacent with warmth that reads as organic and luxurious rather than clinical. Slate-morning-soft serves as the mid-value neutral — a warm gray that functions as secondary surface color. Slate-afternoon-muted introduces the darker gray — a medium-tone warm gray for text and secondary accents. Slate-dusk-soft closes with a deep warm gray that functions as the palette's anchor dark.",
    ["Luxury", "Editorial", "Neutral"],
    [
      "cool-gray-whisper",
      "amber-whisper-soft",
      "cobalt-mist-faint",
      "cobalt-tone-faint",
      "cobalt-dusk-faint",
    ],
    {
      editorialNote:
        "Pearl oyster is the palette for quiet luxury fashion and accessories, premium hospitality and hotel brands, high-end real estate and interior design, editorial publications, luxury skincare and beauty with minimal-luxury positioning, and any brand where the premium signal must come from restraint and material quality rather than color boldness. Photography direction: natural linen fabric texture in diffused light, white ceramic and natural stone still life, editorial fashion photography with neutral backdrops, luxury hotel room details (bedding, marble, polished metal). Typography: a refined serif (Canela, Freight Display, Cardinal) or an elegant high-contrast display face paired with a light geometric sans for body text creates the right editorial hierarchy in this palette.",
      promptWords: [
        "luxury fashion brand in pearl and warm neutral editorial palette",
        "premium hotel brand in cream and cool gray sophisticated palette",
        "high-end skincare brand in quiet luxury neutral and pearl tones",
      ],
      useCases: ["Quiet luxury fashion and accessories", "Premium hospitality and hotel brands", "High-end editorial publications"],
    }
  ),
];

collections.push(...extraCollections26);

const extraCollections27: ColorCollection[] = [
  createCollection(
    "platinum-edge",
    "Platinum Edge",
    "Cool blue-gray and near-neutral silver tones for precision technology, luxury hardware, and automotive brands.",
    "Platinum edge is drawn from the cool-gray end of the chromatic spectrum — not the warm neutral of Scandinavian minimalism, but the colder, more technical register of precision manufacturing and luxury hardware. The palette lives in the space between pure neutral gray and a trace of blue or indigo, giving every tone a sense of engineered specificity. Slate-whisper-muted opens the palette at its lightest — a barely-tinted cool gray that functions as a premium near-white surface. Slate-pearl-faint is the palette's bright neutral anchor — very light, with just enough cool character to prevent warmth from diluting the technical register. Slate-shadow-soft moves into medium-value territory — a warm-tinged mid-gray that provides the tonal center of the palette. Cobalt-shadow-muted deepens toward the blue end — a cool, desaturated blue-gray for secondary surfaces and structural color. Slate-dusk-soft closes as the darkest entry — a deep warm-gray that grounds the palette and provides contrast range for typography and UI applications.",
    ["Technical", "Precision", "Neutral"],
    [
      "cool-gray-whisper",
      "cobalt-pearl-faint",
      "cobalt-shadow-faint",
      "cobalt-shadow-muted",
      "cobalt-dusk-faint",
    ],
    {
      editorialNote:
        "Platinum edge is built for precision technology brands, luxury automotive and hardware, professional-grade tools and equipment, scientific instrumentation, and any brand whose premium signal is technical precision and engineered quality rather than warmth or accessibility. The palette conveys expertise and rigor rather than approachability. Photography direction: closeup industrial machining details, polished metal and matte carbon fiber textures, architectural photography of glass curtain wall and steel structures, studio product photography with cold gray background and precision lighting, luxury vehicle detail photography. Typography: a geometric sans at narrow tracking (Akzidenz-Grotesk, Helvetica Neue, Suisse Int) reads as technically precise in this palette; generous whitespace and conservative type hierarchy reinforce the precision aesthetic.",
      promptWords: [
        "precision technology brand in cool gray and platinum palette",
        "luxury automotive brand in silver and cold gray identity",
        "professional tools brand in muted blue-gray and slate palette",
      ],
      useCases: ["Precision technology and instrumentation", "Luxury automotive and hardware", "Professional-grade tools and equipment"],
    }
  ),
  createCollection(
    "tuscan-clay",
    "Tuscan Clay",
    "Warm terracotta, muted coral, and olive-tinged earth tones inspired by Mediterranean architecture and artisan ceramics.",
    "Tuscan clay draws from the specific chromatic range of Italian and Iberian vernacular architecture: the warm terracotta of fired roof tiles, the muted coral-pink of lime-washed plaster, the olive-gray of aged stone, the warm camel of dried grass and straw, and the deep amber-brown of exposed clay soil. This is not the generic earth palette of sustainability marketing but the specific, saturated-yet-muted range of materials that have been baked, weathered, and aged by decades of Mediterranean sun. Amber-earth-muted leads with the palette's signature terracotta register — a warm, slightly orange-brown that reads as fired clay and mineral pigment. Amber-dusk-soft shifts toward camel and warm tan — the color of dried grasses and plastered wall in soft afternoon light. Coral-velvet-soft introduces the muted coral note — a restrained warm pink that reads as blush plaster and faded fresco rather than cosmetic pink. Olive-pearl-muted provides the cool counterbalance — an olive-gray that reads as aged stone and lichen and prevents the palette from becoming uniformly warm. Amber-shadow-muted closes as the deep anchor — a rich warm brown that functions as the palette's grounding dark.",
    ["Mediterranean", "Earthy", "Artisan"],
    [
      "amber-dusk-muted",
      "amber-dusk-soft",
      "coral-velvet-soft",
      "olive-pearl-muted",
      "amber-shadow-muted",
    ],
    {
      editorialNote:
        "Tuscan clay is the palette for Italian and Mediterranean food and beverage brands, artisan ceramics and pottery studios, boutique hospitality and agritourism, interior design studios with a warm material Mediterranean aesthetic, natural cosmetics and skincare with an artisan positioning, and travel and lifestyle content set in southern Europe. Photography direction: fired clay pottery and ceramic textures in direct sunlight, lime-washed plaster walls with iron window hardware, dried botanical arrangements on terracotta surfaces, produce and food photography on warm stone or wood backgrounds, architectural detail of terracotta rooflines and stone stairs. Typography: a humanist italic serif (Cormorant Italic, Freight Text Italic) or a calligraphic display face reads as authentically artisan-Mediterranean; warm amber-brown type against plaster-pale background creates the right printed-ephemera character.",
      promptWords: [
        "Mediterranean food brand in warm terracotta and clay palette",
        "artisan ceramics studio in fired clay and olive tones",
        "Italian hospitality brand in tuscan earth and coral plaster palette",
      ],
      useCases: ["Mediterranean food and beverage brands", "Artisan ceramics and pottery studios", "Boutique hospitality and agritourism"],
    }
  ),
  createCollection(
    "dusk-lavender",
    "Dusk Lavender",
    "Muted violet, soft iris, and warm purple-gray tones for mindfulness, meditation, and mental wellness brands.",
    "Dusk lavender occupies the narrow, carefully calibrated register of violet that reads as calm, inward-focused, and restorative without crossing into either corporate purple or psychedelic intensity. This is the color of the sky 20 minutes after sunset — still warm from the residual light but cooling into violet-gray, with a quietness that is perceptual rather than purely associative. Iris-whisper-soft opens the palette at its lightest — a barely-perceptible lavender that functions as a warm near-white surface with personality. Iris-pearl-muted is the pale lavender anchor — a soft, muted purple that reads as gentle and considered rather than assertive. Iris-mist-muted shifts into medium-value territory — a desaturated iris with a gray quality that reads as contemplative and precise. Violet-tone-soft introduces a slightly deeper and warmer purple midtone — the palette's most distinctly violet entry, with enough saturation to serve as accent or hero color. Iris-veil-muted closes as the dark anchor — a deep, desaturated purple-gray that provides contrast range and grounding.",
    ["Calm", "Wellness", "Mindful"],
    [
      "iris-whisper-soft",
      "iris-pearl-muted",
      "iris-mist-muted",
      "violet-tone-soft",
      "iris-veil-muted",
    ],
    {
      editorialNote:
        "Dusk lavender is the palette for mental wellness and mindfulness apps, meditation and yoga studios, sleep and rest health products, calming consumer wellness brands, therapeutic spaces and counseling services, and any product where the emotional register is restoration, inwardness, and quiet. The palette is explicitly not generic lavender: the desaturation and gray-violet character prevent it from reading as cosmetic or floral, and the tonal range gives it enough depth for functional UI application. Photography direction: soft-focus morning light through gauze curtains, water surfaces at dusk, minimal wellness product arrangements on linen, meditation or yoga environment details in diffused light, close-up botanical photography with shallow depth of field. Typography: a humanist rounded sans (Plus Jakarta Sans, Nunito) or a clean geometric at light weight pairs naturally with this palette; soft type weight hierarchy reinforces the palette's non-assertive character.",
      promptWords: [
        "mindfulness app in muted lavender and soft iris palette",
        "meditation studio in dusk violet and calm purple-gray identity",
        "mental wellness brand in soft iris and warm lavender tones",
      ],
      useCases: ["Mental wellness and mindfulness apps", "Meditation studios and yoga spaces", "Sleep and rest health products"],
    }
  ),
  createCollection(
    "bamboo-grove",
    "Bamboo Grove",
    "Warm jade, muted olive, and soft teal-green tones for spa, organic beauty, and botanical wellness brands.",
    "Bamboo grove draws from the specific green register of living botanical environments — not the deep forest darkness of mossy woodland but the lighter, warmer, more luminous green of bamboo, eucalyptus, and tropical garden spaces where light filters through canopy at midday. The palette is unified by a warm yellow-green undertone that prevents it from reading as cold or clinical, and by consistent muting that reads as organic and natural rather than synthetic or vivid. Jade-whisper-soft opens at the palest end — a very light, almost white jade that creates the palette's breathing room and its most expansive surface tone. Olive-whisper-muted is the warm neutral entry — a muted warm green with enough olive character to read as living botanical material. Jade-whisper-muted deepens slightly toward the true jade register — a soft mid-light green that bridges the olive warmth and the cooler teal notes. Teal-whisper-soft introduces a trace of blue-green — the palette's cool counterpoint that prevents complete warmth saturation and adds the freshness note associated with water and clean botanical scents. Olive-veil-muted closes as the deepest and most saturated entry — a medium-depth olive that functions as the palette's structural anchor and hero color.",
    ["Organic", "Botanical", "Wellness"],
    [
      "jade-whisper-soft",
      "olive-whisper-muted",
      "jade-whisper-muted",
      "teal-whisper-soft",
      "olive-veil-muted",
    ],
    {
      editorialNote:
        "Bamboo grove is the palette for spa and wellness hospitality, organic and botanical beauty brands, natural skincare and personal care, herbal supplement and functional food brands, yoga and movement studios, and any brand whose proposition is connected to living plant material and natural wellness ritual. The palette reads as aspirationally clean, organic, and restorative without the over-muted heaviness of dark earth palettes. Photography direction: bamboo and eucalyptus botanical details in warm light, product photography on warm white stone with fresh plant material, spa environment details (linen towels, wooden accessories, water surfaces), close-up botanical texture photography in diffused natural light, minimal flat-lay arrangements with green botanicals on pale surface. Typography: a clean geometric sans (Montserrat, DM Sans) at regular or medium weight reads as contemporary wellness-brand in this palette; generous leading and whitespace reinforce the open, clean character of the green tones.",
      promptWords: [
        "spa brand in warm jade and bamboo botanical palette",
        "organic beauty brand in muted olive and soft teal-green identity",
        "botanical wellness brand in bamboo grove green and natural tones",
      ],
      useCases: ["Spa and wellness hospitality", "Organic and botanical beauty brands", "Herbal supplements and functional food"],
    }
  ),
];

collections.push(...extraCollections27);

const extraCollections28: ColorCollection[] = [
  createCollection(
    "arctic-aurora",
    "Arctic Aurora",
    "Ice blue, pale cyan, and cool mint tones inspired by polar light phenomena and nordic glacial environments.",
    "Arctic aurora draws from the specific chromatic register of high-latitude light: the cool blue-white of polar ice, the pale cyan of glacial water in shallow depths, the soft green-teal of the aurora borealis at its quietest hour, and the blue-gray of the sky above the treeline in winter. This is the chromatic vocabulary of clarity, low temperatures, and the particular brightness of sunlight reflected from snow at low angles. Unlike standard cool blue palettes, arctic aurora has a distinctly luminous quality — each tone feels lit from within rather than simply cool. Cyan-whisper-soft opens the palette at its lightest — a pale, barely-perceptible cyan that reads as breathable polar air and provides the palette's most expansive surface tone. Cyan-pearl-muted is the pale ice anchor — a soft cyan with enough color to read as glacial water or northern sky without feeling clinical. Teal-whisper-soft shifts slightly toward blue-green — the palette's aurora register, evoking the trace of natural green-cyan in polar light phenomena. Cobalt-whisper-muted introduces a cool blue-gray — a tone that reads as the deep winter sky above the arctic circle. Cyan-mist-soft closes as the medium-depth accent — a richer cyan-teal that provides the palette's most saturated point and functions as a hero color for accents and interactive states.",
    ["Arctic", "Nordic", "Clean"],
    [
      "aqua-whisper-soft",
      "aqua-pearl-muted",
      "teal-whisper-soft",
      "cobalt-whisper-muted",
      "aqua-mist-soft",
    ],
    {
      editorialNote:
        "Arctic aurora is the palette for nordic tech and software brands, climate and environmental organizations focused on polar ecosystems, cold-water outdoor and adventure brands, premium mineral water and functional beverage, high-end skincare with a clinical or science-driven positioning, and any brand whose visual register is purity, clarity, and precision. The palette communicates performance and cleanliness without warmth, making it appropriate for brands where the premium signal is rigor and precision rather than approachability. Photography direction: aerial photography of arctic or glacial landscapes, extreme close-up of ice crystal and frost textures, clean water photography with depth, studio product photography with cool blue-gray backgrounds and directional cold lighting, architectural photography of glass and steel structures in winter light. Typography: a clean geometric sans at tight tracking (Helvetica Neue, Neue Haas Grotesk, GT America) reads as technically precise in this palette; ample negative space and high line density reinforce the performance-brand character.",
      promptWords: [
        "nordic tech brand in cool ice blue and pale cyan palette",
        "polar environmental organization in arctic blue-teal identity",
        "premium mineral water brand in glacial cyan and cool mint tones",
      ],
      useCases: ["Nordic and cold-climate tech brands", "Premium water and functional beverage", "Climate and environmental organizations"],
    }
  ),
  createCollection(
    "scorched-earth",
    "Scorched Earth",
    "Deep ochre, raw sienna, and weathered rust tones inspired by arid landscapes, exposed mineral sediment, and fired industrial materials.",
    "Scorched earth draws from the specific chromatic range of high-temperature and high-UV environments: the deep orange-brown of iron-rich sedimentary rock, the warm red of oxidized metal, the yellow-ochre of baked clay and dry desert soil, the muted amber of weathered sandstone, and the near-black of volcanic rock and charred wood. This is not the refined earth palette of boutique wellness and Mediterranean hospitality but the more aggressive, saturated, and rugged register of exposed geology, industrial process, and extreme climate. The palette has natural credibility and material weight without warmth or softness. Amber-earth-strong opens with the palette's core ochre — a deep, warm orange-brown that reads as raw mineral pigment and sunbaked clay. Amber-fire-muted shifts toward the rust and red-oxide register — a burnt sienna tone that reads as oxidized iron and heat-processed clay. Amber-depth-strong deepens toward rich warm brown — the palette's anchor and structurally darkest entry, suggesting deep earth and shadow. Rust-velvet-muted is the palette's most distinctly reddish entry — a warm, slightly orange-red that reads as raw rust and ferrous oxide without the vividity of commercial red. Amber-gold-soft provides a lighter, warm accent — the reflective warmth of desert light on pale ochre rock that prevents the palette from becoming uniformly dark.",
    ["Raw", "Industrial", "Earthy"],
    [
      "amber-dusk-vivid",
      "amber-core-clear",
      "amber-nocturne-vivid",
      "ember-velvet-muted",
      "amber-bloom-soft",
    ],
    {
      editorialNote:
        "Scorched earth is the palette for rugged outdoor and adventure brands, independent craft spirits and whiskey distilleries, industrial and materials manufacturing brands, geological and mining sector communications, editorial content with an arid landscape or extreme environment theme, and any brand whose premium signal is raw material authenticity, physical durability, and earned character rather than refined elegance. The palette is intentionally aggressive in its saturation and warmth relative to most earth palettes, giving it more visual impact at large scale. Photography direction: extreme close-up of rust and oxidized metal textures, desert and badlands aerial and ground photography, kiln and foundry process photography, ceramic and fired clay product photography on raw stone surfaces, geological cross-section and mineral specimen photography. Typography: a condensed or display serif with strong weight contrast (Canela Condensed, Freight Display) or an industrial grotesque (Franklin Gothic, Trade Gothic) carries the material weight of this palette; black or deep amber-brown type on pale ochre reads as label and stamp printing from industrial history.",
      promptWords: [
        "rugged outdoor brand in deep ochre and raw sienna palette",
        "craft spirits distillery in scorched earth and rust-brown identity",
        "industrial materials brand in burnt ochre and oxidized red tones",
      ],
      useCases: ["Rugged outdoor and adventure brands", "Craft spirits and distilleries", "Industrial and materials sector"],
    }
  ),
  createCollection(
    "deep-ocean",
    "Deep Ocean",
    "Dark navy, teal-black, and deep blue tones inspired by the visual register of oceanic depth, marine technology, and high-pressure aquatic environments.",
    "Deep ocean draws from the color register of ocean depth rather than ocean surface: not the vivid turquoise of shallow tropical water but the progressively darkening blue-teal of descending depth, the near-black of bathypelagic zones, and the cold, pressure-heavy quality of abyssal environments. The palette is unified by high value depth and cool temperature — each tone sits in the dark-to-very-dark range, with distinctiveness expressed through subtle shifts between blue, teal, and near-neutral gray-blue. Navy-depth-strong opens as the palette's primary deep navy — a rich, cool dark blue that provides the palette's most recognizable and versatile foundation tone. Teal-depth-strong introduces the blue-green register — a very dark teal that reads as oceanic depth with a trace of green-cyan distinguishing it from pure navy. Cobalt-depth-strong deepens toward pure cool dark blue — a tone with slightly more purple-blue character that reads as deepwater at night. Navy-shadow-muted provides a near-neutral dark blue-gray — the palette's most neutral and versatile dark, functioning as the primary text and background color in dark-mode applications. Teal-shadow-muted closes at the deepest point — a very dark teal-gray that approaches black while retaining just enough chromatic identity to maintain the oceanic register.",
    ["Ocean", "Deep", "Technical"],
    [
      "cobalt-nocturne-vivid",
      "teal-nocturne-vivid",
      "cobalt-nocturne-vivid",
      "cobalt-shadow-muted",
      "teal-shadow-muted",
    ],
    {
      editorialNote:
        "Deep ocean is the palette for marine technology and ocean science organizations, deep-sea exploration and research programs, premium naval and maritime brands, cybersecurity and enterprise security products where depth and gravity are the emotional register, and editorial and documentary content covering ocean ecosystems and climate. The palette functions exceptionally well in dark-mode interface design where the tonal range provides depth hierarchy without requiring pure black. Photography direction: underwater photography at depth (blue-shifted, low-contrast, diffused light), ocean surface photography under overcast sky at dusk, deep-sea research vessel and ROV equipment photography, atmospheric coastal photography with storm-light conditions, macro photography of water surface abstraction with directional blue lighting. Typography: a clean technical sans (IBM Plex Mono, Roboto Mono, or similar monospace for data contexts; DIN, Aktiv Grotesk for body text) works well in this palette; light-weight type on very dark backgrounds creates strong contrast and a technical precision character.",
      promptWords: [
        "marine technology brand in deep navy and teal-black palette",
        "ocean science organization in dark blue and deepwater teal identity",
        "enterprise security product in deep ocean blue and dark navy tones",
      ],
      useCases: ["Marine technology and ocean science", "Enterprise security and deep tech", "Naval and maritime brands"],
    }
  ),
  createCollection(
    "desert-rose",
    "Desert Rose",
    "Warm blush, dusty peach, and sand-pink tones drawn from the arid desert at sunrise — a palette for contemporary beauty and lifestyle brands with an elevated, minimal aesthetic.",
    "Desert rose draws from the chromatic range of desert light in the early morning: the warm blush of sand illuminated by low-angled sunrise, the dusty pink of sandstone formations, the pale peach-gold of flat desert light on pale rock, and the muted mauve-rose of shadows in that same early light. Unlike typical blush palettes that read as feminine or cosmetic, desert rose has an architectural quality from the warm muting and slight dryness of its tones — the colors are warm but not sweet, pink-adjacent but not floral. Rose-whisper-soft opens at the palest end — a barely-perceptible warm blush that functions as the palette's premium near-white surface. Peach-pearl-muted provides the pale warm neutral — a sandy peach with more warmth than a cool off-white but less saturation than a vivid peach, reading as warm desert light on pale stone. Rose-pearl-muted introduces the palette's clearest blush — a soft muted pink-rose that reads as desert sand in direct morning light. Peach-tone-soft deepens toward the warm sand register — a medium peach with enough saturation to anchor the palette as an accent color without reading as vivid. Rose-veil-muted closes as the palette's deepest and most saturated entry — a warm, slightly dusty rose-mauve that grounds the palette and provides the contrast range for typography.",
    ["Blush", "Minimal", "Beauty"],
    [
      "rose-whisper-soft",
      "apricot-pearl-muted",
      "rose-pearl-muted",
      "apricot-tone-soft",
      "rose-veil-muted",
    ],
    {
      editorialNote:
        "Desert rose is the palette for contemporary beauty and skincare brands with an architectural, elevated aesthetic, minimal luxury lifestyle editorial, fine jewelry and accessories with a desert or stone-mineral positioning, wellness and retreat hospitality in arid landscape settings, contemporary fashion editorial with a sun-bleached or minimalist visual direction, and any brand whose combination of warmth and restraint communicates elevated simplicity rather than maximalist luxury. The palette reads as warm without being sweet, and feminine without relying on conventional pink tropes. Photography direction: bleached desert landscape photography with low-angle warm light, architectural photography of adobe and plaster surfaces in direct sun, skincare and beauty product photography on warm stone or bleached wood surfaces, fashion editorial in arid landscape settings, close-up photography of mineral and gemstone textures in warm light. Typography: a contemporary elegant serif (Canela, Freight Display Italic, Playfair Display) at light weight creates the right combination of refinement and warmth; generous leading and restrained type hierarchy reinforce the elevated minimal character.",
      promptWords: [
        "contemporary beauty brand in warm blush and desert rose palette",
        "minimal luxury lifestyle brand in dusty peach and rose-sand tones",
        "fine jewelry brand in desert rose and warm stone palette",
      ],
      useCases: ["Contemporary beauty and skincare brands", "Minimal luxury lifestyle editorial", "Wellness retreats in arid settings"],
    }
  ),
];

collections.push(...extraCollections28);

const extraCollections29: ColorCollection[] = [
  createCollection(
    "golden-ratio",
    "Golden Ratio",
    "Rich amber, warm honey, and burnished gold tones that capture the warmth of precious metal and handcrafted luxury — a palette for premium editorial, artisan brands, and architectural materials.",
    "Golden ratio draws from the chromatic vocabulary of precious metals and handcrafted materials: the warm glow of polished gold, the amber depth of aged honey, the burnished warmth of hammered brass, and the cool gleam of fine champagne. These are not the garish metallics of costume jewelry but the measured, deep warmth of material quality — the palette of a master goldsmith's workbench or an architectural interior where brass fixtures age into character. Amber-gold-soft opens at the pale end — a warm, barely-saturated gold-cream that reads as natural light on pale stone or warm parchment. Amber-silk-soft provides the palette's central warm tone — a desaturated golden amber that reads as aged textile or warm wood grain. Amber-noon-muted deepens toward the copper register — a medium amber with enough saturation to read as genuine warmth without becoming orange. Amber-velvet-muted provides the mid-dark anchor — a rich, complex amber-brown that reads as aged leather or seasoned wood. Amber-depth-strong closes at a deep, near-umber warmth that grounds the palette with genuine depth.",
    ["Gold", "Luxury", "Editorial"],
    [
      "amber-bloom-soft",
      "amber-silk-soft",
      "amber-silk-muted",
      "amber-velvet-muted",
      "amber-nocturne-vivid",
    ],
    {
      editorialNote:
        "Golden ratio is the palette for premium artisan brands and handcrafted product design, architectural material editorial (brass, bronze, warm stone), fine whisky, cognac, and aged spirits brands, luxury hotel and hospitality with warm material character, premium stationery and publishing with a heritage register, and fashion editorial with a warm materiality focus. The palette reads as warm and precious without the ostentation of loud gold. Photography direction: close-up material photography of brass, gold leaf, amber glass, aged leather, and warm wood in directional warm light; architectural interior photography emphasizing material warmth and natural patina; product photography of glass, ceramic, or metal objects on warm stone or wood surfaces; abstract texture photography of precious metal surfaces. Typography: a classical serif at light or regular weight (Freight Text, Garamond, Playfair Display) reinforces the heritage warmth character; avoid pure white for type — use a very light warm amber or cream.",
      promptWords: [
        "artisan luxury brand in warm amber and burnished gold palette",
        "premium spirits editorial in aged amber and deep honey tones",
        "architectural interior brand in brass and warm metal materials",
      ],
      useCases: ["Premium artisan and handcrafted brands", "Luxury spirits and hospitality", "Architectural material editorial"],
    }
  ),
  createCollection(
    "stone-garden",
    "Stone Garden",
    "Weathered limestone, dry sage, and quiet warm gray tones drawn from Japanese rock garden aesthetics — a palette for meditation, mindfulness, and understated craft brands.",
    "Stone garden draws from the austere, meditative palette of the karesansui (dry rock garden): the pale neutral of raked gravel, the muted sage of lichen on stone, the warm gray of weathered granite, and the subtle warmth of aged wood. This is a palette of deliberate quietness — colors that recede, that do not insist, that create space for the viewer rather than filling it. Slate-whisper-soft anchors the pale end — a near-white warm gray that reads as pale stone in diffused light, with almost no color identity of its own. Slate-pearl-faint introduces the first suggestion of tone — a very pale, barely-warm neutral that reads as unbleached natural material. Lime-whisper-muted provides the palette's organic note — a muted, very slightly warm olive that reads as dried lichen or old sage rather than green. Slate-shadow-soft serves as the structural midtone — a medium warm gray with slight desaturated warmth, the color of smooth river stone. Slate-earth-muted closes at a grounded, medium-dark warm gray that provides typographic contrast without blackness.",
    ["Minimal", "Zen", "Wellness"],
    [
      "cool-gray-whisper",
      "cobalt-pearl-faint",
      "lime-whisper-muted",
      "cobalt-shadow-faint",
      "cobalt-dusk-faint",
    ],
    {
      editorialNote:
        "Stone garden is the palette for mindfulness apps and meditation platforms, Japanese-influenced minimalist lifestyle brands, premium ceramics and handcraft product design, architectural and interior photography with a quiet material focus, wellness retreat brands with a nature-grounded aesthetic, and editorial design for contemplative or philosophical content. The palette creates quietness through restraint -- there is almost no color, only tone. Photography direction: close-up photography of natural stone, ceramic, raw linen, and weathered wood in soft natural light; Japanese garden and architectural photography emphasizing stone, moss, and aged material; abstract texture photography of neutral natural surfaces; product photography of ceramics and handcraft objects on stone or linen backgrounds. Typography: a light-weight geometric sans (Inter, Helvetica Neue, Suisse Int'l) at generous scale with restrained hierarchy reinforces the quiet character; body text in slate-earth-muted maintains the palette's neutrality.",
      promptWords: [
        "mindfulness app in quiet stone and sage gray palette",
        "premium ceramics brand in weathered limestone and warm gray tones",
        "Japanese-influenced wellness brand in muted stone and lichen sage",
      ],
      useCases: ["Mindfulness and meditation platforms", "Premium handcraft and ceramics brands", "Wellness retreat and spa brands"],
    }
  ),
  createCollection(
    "citrus-grove",
    "Citrus Grove",
    "Vivid lemon, warm tangerine, and fresh lime tones drawn from Mediterranean citrus groves — a palette for food brands, summer editorial, and vibrant lifestyle content.",
    "Citrus grove draws from the sensory richness of a Mediterranean citrus grove in full season: the vivid yellow of ripe lemons in direct sun, the warm orange-amber of blood orange peel, the electric green of lime leaf, and the soft gold of dried citrus rind. This is a palette of direct, uncomplicated pleasure -- warm, vivid, and immediately appetizing without the visual complexity of more sophisticated editorial color. Citrine-bloom-vivid opens at the vivid yellow anchor -- a bright, fully saturated lemon yellow that reads as direct sunlight on ripe citrus. Citrine-silk-soft provides a softer mid-tone -- a warm, desaturated golden yellow that reads as dried citrus or warm sun-bleached peel. Honey-bloom-clear steps toward the amber register -- a vivid warm amber that bridges the yellow and orange tones. Apricot-bloom-soft provides the palette's warmth depth -- a medium soft apricot-coral that reads as warm flesh-toned citrus. Lime-bloom-vivid provides the contrasting note -- a vivid electric lime that cuts through the warm tones and reads as fresh cut lime or green leaf.",
    ["Vivid", "Food", "Summer"],
    [
      "citrine-bloom-vivid",
      "citrine-silk-soft",
      "honey-bloom-clear",
      "apricot-bloom-soft",
      "lime-bloom-vivid",
    ],
    {
      editorialNote:
        "Citrus grove is the palette for food and beverage brands with a Mediterranean or artisan identity, summer lifestyle editorial and campaign imagery, fresh produce and organic food market branding, citrus-flavored products and packaging, vibrant juice, smoothie, and wellness drink brands, and summer fashion editorial with a warm Southern European mood. The palette reads as appetizing, warm, and immediately pleasurable. Photography direction: direct Mediterranean sunlight photography of citrus fruit in natural settings; close-up citrus texture photography (cut lemon cross-sections, orange peel texture, lime zest) with strong directional light; food photography on warm stone or terracotta tile backgrounds; lifestyle photography in warm Mediterranean outdoor environments. Typography: a confident, warm rounded sans (Nunito, Gilroy, or a geometric with warm optical adjustments) reinforces the accessible, appetizing character; avoid cold or corporate typefaces which contradict the palette's warmth.",
      promptWords: [
        "Mediterranean food brand in vivid lemon yellow and warm tangerine palette",
        "summer lifestyle editorial in citrus yellow and electric lime tones",
        "fresh juice brand in bright citrine and warm apricot palette",
      ],
      useCases: ["Food and beverage brands", "Summer lifestyle editorial", "Fresh produce and organic food brands"],
    }
  ),
  createCollection(
    "navy-signal",
    "Navy Signal",
    "Deep navy, crisp white, and bold signal red — the classic nautical and maritime color combination that communicates authority, precision, and enduring institutional quality.",
    "Navy signal draws from the timeless chromatic vocabulary of maritime tradition: the deep authority of navy blue, the crisp clarity of signal white, the bold precision of buoy red, and the structural neutrality of nautical brass. This is not the decorative nautical of coastal lifestyle brands but the working palette of maritime institutions, precision instrument makers, and brands that inherit the authority of nautical tradition. Cobalt-shadow-strong anchors the palette at the deepest end -- a rich, saturated navy that reads as deep water or a precision instrument case. Cobalt-tone-muted provides a slightly lighter navy -- a desaturated blue-navy that reads as aged uniform cloth or institutional blue. Cobalt-veil-soft opens the blue range -- a light, muted blue-gray that provides the palette's aerial note. Crimson-tone-soft provides the signal accent -- a clean, slightly muted red that reads as nautical signal or precision mark rather than alarm. Slate-whisper-soft provides the white anchor -- a clean near-white with minimal warmth.",
    ["Navy", "Maritime", "Authority"],
    [
      "cobalt-nocturne-vivid",
      "cobalt-tone-muted",
      "cobalt-veil-soft",
      "crimson-tone-soft",
      "cool-gray-whisper",
    ],
    {
      editorialNote:
        "Navy signal is the palette for nautical and maritime brands, precision instrument and technology companies, institutional and professional services firms seeking authority and precision, classic menswear and tailoring brands, editorial content covering naval history, ocean racing, and maritime culture, and any brand seeking to inherit the authority and precision of seafaring tradition without the decorative softness of coastal lifestyle aesthetics. The palette reads as authoritative, precise, and enduring. Photography direction: clean product photography of precision instruments and devices on dark navy or white backgrounds; nautical architecture and rigging photography in high contrast natural light; classic tailoring and uniform photography with controlled lighting; ocean racing photography emphasizing precision and speed; editorial photography of navigational instruments in working contexts. Typography: a clean, authoritative serif (Freight Text, Caslon) or a geometric sans (Futura, DIN) both work well in this palette; the authority of the palette supports either direction.",
      promptWords: [
        "maritime precision brand in deep navy and signal red palette",
        "institutional authority brand in navy blue and crisp white tones",
        "classic menswear brand in navy and crimson nautical palette",
      ],
      useCases: ["Nautical and maritime brands", "Precision instruments and technology", "Institutional authority and professional services"],
    }
  ),
];

collections.push(...extraCollections29);

const extraCollections30: ColorCollection[] = [
  createCollection(
    "morning-light",
    "Morning Light",
    "Soft peach, warm cream, and pale gold tones that capture the warm, diffused quality of early morning light — a palette for hospitality, bakery brands, skincare, and residential interiors with a welcoming warmth.",
    "Morning light draws from the narrow chromatic window of the first hours of daylight, when the sun is low and warm and the air is diffused: the soft peach of warm sky on thin cloud, the pale honey of early sun on white walls, the warm cream of unbleached linen in natural light, the faint apricot of terracotta in diffused morning warmth. These are not the vivid oranges of direct noon sun but the subtle, washed warmth of indirect early light — colors that are easy to live with, that invite rather than demand attention, and that read as comfortable and genuine. Apricot-whisper-soft anchors the pale end — a very light, barely-peach tone that reads as warm white, the palest natural wall in morning light. Amber-mist-soft provides the warm cream note — a soft, yellowed neutral that reads as aged linen or warm parchment. Citrine-pearl-soft introduces the pale honey register — a very light warm gold that reads as early morning sun filtered through gauze. Apricot-bloom-soft provides the palette's central warmer tone — a soft, genuinely peachy mid-tone that reads as warm terracotta in pale form. Coral-silk-soft closes the warm arc — a medium-light warm coral-pink that provides depth without loudness.",
    ["Warm", "Soft", "Hospitality"],
    [
      "apricot-whisper-soft",
      "amber-mist-soft",
      "citrine-pearl-soft",
      "apricot-bloom-soft",
      "coral-silk-soft",
    ],
    {
      editorialNote:
        "Morning light is the palette for bakery and café brands with a handcrafted, warm character, skincare and beauty brands with a natural, gentle positioning, boutique hotel and hospitality with a residential warmth, children's lifestyle brands at the more understated, quality-focused end, residential interior design photography with soft natural light, and brand systems for food brands with a home-cooking authenticity. The palette communicates warmth, comfort, and genuine material quality without the sentimentality of louder warm palettes. Photography direction: close-up still life photography of baked goods, ceramics, and natural materials on warm linen or plaster backgrounds; interior photography with soft window light falling on natural materials; product photography of skincare or food products with warm, diffused natural light. Typography: a humanist serif at regular or medium weight (Freight Text, Cormorant, Lora) reinforces the warm, handmade character; avoid pure white for type — a warm off-white or light apricot maintains the palette's warmth.",
      promptWords: [
        "artisan bakery brand in warm peach and cream palette",
        "skincare brand in soft morning light and natural warmth tones",
        "boutique hotel brand in warm cream and pale gold palette",
      ],
      useCases: ["Artisan bakery and café brands", "Natural skincare and beauty", "Boutique hospitality and residential interiors"],
    }
  ),
  createCollection(
    "midnight-library",
    "Midnight Library",
    "Deep indigo, dark violet, and rich near-black tones that evoke the atmosphere of late-night reading, private scholarship, and premium editorial — a palette for luxury publishing, premium tech, and brands with an intellectual depth.",
    "Midnight library draws from the deep, saturated palette of a well-appointed private library at night: the dark indigo of book cloth binding, the deep violet of shadow between shelves, the rich near-black of aged leather, the cool dark blue of a lit screen in a darkened room. These are not the flat black neutrals of generic dark aesthetics but colors with genuine chromatic depth — each one contains a distinct chromatic temperature that contributes to the palette's layered richness. Cobalt-shadow-faint provides the near-black anchor — a very dark blue that reads as black with a cool undertone, adding depth without pure blackness. Indigo-nocturne-muted deepens into the characteristic dark indigo register — a very dark, muted indigo that reads as the color of deep-dye book cloth or aged velvet. Violet-shadow-muted provides the dark violet accent — a deep, muted violet that reads as the shadow color of a luxury brand system. Indigo-dusk-soft moves slightly lighter — a dark indigo with enough saturation to read as intentionally chromatic rather than neutral-dark. Violet-dusk-soft closes at a mid-dark violet that provides just enough lightness to create structural contrast within the palette's compressed dark range.",
    ["Dark", "Editorial", "Luxury"],
    [
      "cobalt-shadow-faint",
      "indigo-nocturne-muted",
      "violet-shadow-muted",
      "indigo-dusk-soft",
      "violet-dusk-soft",
    ],
    {
      editorialNote:
        "Midnight library is the palette for premium publishing and editorial brands, luxury technology products with a design-forward, intellectual positioning, financial services brands targeting high-net-worth individuals who identify with intellectual distinction, premium subscription products (legal research, academic databases, knowledge management), brand systems for educational technology platforms at the premium end, and fashion editorial with a darkly sophisticated register. The palette works best when used at full depth — attempting to lighten it or add bright accents undermines its atmospheric quality. Photography direction: close-up photography of books, fine binding, paper texture, and leather in low, directional light; architectural photography of libraries, studies, and private collections in candlelight or warm artificial light; product photography of premium tech or luxury objects on dark cloth or dark wood surfaces. Typography: a refined serif at light or regular weight (Freight Display, Canela, Editorial New) in off-white creates the clearest legibility contrast; a fine-stroke sans-serif also works well at large scale.",
      promptWords: [
        "premium publishing brand in deep indigo and midnight violet palette",
        "luxury knowledge platform in dark indigo and deep violet tones",
        "intellectual technology brand in midnight library palette",
      ],
      useCases: ["Premium publishing and editorial brands", "Luxury knowledge and research platforms", "Premium technology with intellectual positioning"],
    }
  ),
  createCollection(
    "lavender-fields",
    "Lavender Fields",
    "Soft lavender, pale lilac, and quiet violet tones drawn from the gentle color palette of lavender in bloom — a palette for wellness brands, premium beauty, spa environments, and lifestyle brands with a calm, elevated femininity.",
    "Lavender fields draws from the specific, narrow palette of actual lavender plants seen in diffused natural light: the very pale, slightly muted violet of lavender in bloom, the soft gray-lavender of dried stalks, the warm white of sunlit stone between flower rows, the deeper blue-violet of shadow within the plant mass. These are not the vivid purples of cosmetic branding but the subtle, washed tones of a natural material — colors that have genuine complexity and a quiet sophistication that vivid purples lack. Iris-whisper-soft provides the pale anchor — a barely-lavender near-white that reads as the palest possible tint of the hue, a lavender white with gentle warmth. Orchid-mist-soft deepens slightly — a soft, warm pale lilac that reads as the lightest possible purple in natural light. Iris-pearl-muted provides the palette's central muted lavender — a soft, slightly grayed pale violet that reads as genuine dried lavender color. Violet-bloom-soft lightens into a clearer, slightly more saturated lavender that reads as fresh bloom in open sunlight. Plum-silk-muted closes as the deeper accent — a medium-light, muted mauve-violet that provides structural contrast without loudness.",
    ["Soft", "Wellness", "Beauty"],
    [
      "iris-whisper-soft",
      "orchid-mist-soft",
      "iris-pearl-muted",
      "violet-bloom-soft",
      "plum-silk-muted",
    ],
    {
      editorialNote:
        "Lavender fields is the palette for wellness and mindfulness brands at the premium end, natural and clean beauty brands with a botanical positioning, spa and retreat environments with a calm luxury character, premium lifestyle brands targeting women in the 25-45 demographic, home fragrance and aromatherapy product brands, and brand systems for sleep, relaxation, or mental wellness technology. The palette communicates calm, gentle luxury, and natural quality without the artificiality of louder purple and pink palettes. Photography direction: close-up photography of lavender, soft botanicals, and natural dried flowers in diffused natural light; spa and wellness photography with soft, directional natural light and linen or stone backgrounds; product photography of glass bottles, ceramic vessels, or premium packaged goods on pale stone or white fabric backgrounds. Typography: a refined, slightly condensed serif (Cormorant Garamond, EB Garamond, Freight Text) at light weight reinforces the delicate character; body text in the iris-pearl-muted or violet-bloom-soft range maintains the palette's color identity.",
      promptWords: [
        "natural wellness brand in soft lavender and pale lilac palette",
        "premium spa brand in lavender fields and muted violet tones",
        "clean beauty brand in botanical lavender and gentle bloom palette",
      ],
      useCases: ["Natural wellness and mindfulness brands", "Clean beauty and botanical skincare", "Spa, retreat, and aromatherapy brands"],
    }
  ),
  createCollection(
    "deep-forest",
    "Deep Forest",
    "Dark emerald, deep moss, and rich shadow-green tones drawn from old-growth forest in low light — a palette for premium outdoor brands, craft spirits, environmental organizations, and brands built around depth, substance, and natural authority.",
    "Deep forest draws from the specific, compressed palette of a temperate forest interior under overcast light: the very dark, saturated green of mossy bark in shadow, the deep olive-brown of forest floor in rain, the dark emerald of canopy viewed from below, the cool dark of deep undergrowth where direct light never reaches. These are not the bright greens of open meadow or the muted tans of dry savanna but the dark, rich, layered greens of a mature forest — colors that carry authority and depth through their compression into the dark range. Emerald-nocturne-muted provides the deepest anchor — a near-black dark green that reads as forest floor shadow or the interior of a tree hollow, providing the palette's most dramatic depth. Moss-shadow-muted establishes the dark moss-brown register — a deep, muted brownish-green that reads as bark, decomposing matter, and the organic forest floor. Leaf-dusk-soft provides the deep shadowed green of mid-level foliage — a dark, slightly cooler green with enough clarity to read as leaf rather than earth. Emerald-shadow-muted deepens into the characteristic color of old-growth canopy seen in shadow — a very dark, muted emerald with genuine chromatic depth. Jade-velvet-soft provides the slightly lighter, cleaner dark teal-green that reads as wet, living forest.",
    ["Dark", "Nature", "Premium Outdoor"],
    [
      "emerald-nocturne-muted",
      "moss-shadow-muted",
      "leaf-dusk-soft",
      "emerald-shadow-muted",
      "jade-velvet-soft",
    ],
    {
      editorialNote:
        "Deep forest is the palette for premium outdoor and adventure brands with a quality-over-spectacle positioning, craft spirits brands with a nature-sourced, dark character (whisky, gin, craft beer), environmental organizations and land conservation brands at the credibility-first end, premium hotel and hospitality brands in forested or wilderness locations, hunting and field sports brands with a heritage-quality positioning, and leather goods, luggage, or carry brands with an outdoor heritage. The palette reads as substantive, earned, and genuine — not the bright outdoor retail palette but the considered outdoor quality palette. Photography direction: close-up photography of forest floor, bark, moss, lichen, and leaf texture in overcast natural light; architectural photography of timber-framed or stone structures in forested settings; product photography of leather goods, dark spirits, or precision instruments on dark wood or stone surfaces in low, directional natural light. Typography: a structured serif or geometric slab (Canela Text, Freight Display, Tiempos Text) provides the right authority level; body type in moss-shadow-muted or leaf-dusk-soft maintains the palette's deep character.",
      promptWords: [
        "premium outdoor brand in deep forest and dark emerald palette",
        "craft whisky brand in old-growth forest and dark moss tones",
        "environmental conservation brand in deep green and shadow forest palette",
      ],
      useCases: ["Premium outdoor and wilderness brands", "Craft spirits with nature-sourced positioning", "Environmental and conservation organizations"],
    }
  ),
];

collections.push(...extraCollections30);

const extraCollections31: ColorCollection[] = [
  createCollection(
    "vintage-americana",
    "Vintage Americana",
    "Deep navy, barn red, and warm cream tones drawn from classic American visual culture — flags, painted barns, weathered wood, and heritage advertising. A palette for brands with genuine historical depth or an American craft-and-quality positioning.",
    "Vintage Americana is the palette vocabulary of the American landscape at its most distilled: the deep, slightly grayed navy of a flag in flat light, the specific saturated red of a painted barn or classic vehicle, the warm cream of aged canvas, cotton shirting, and hand-lettered signage. These are not nostalgic-cutesy colors but genuinely weighted ones — colors that carry the specific gravity of things built to last. Cobalt-shadow-muted provides the foundational deep navy — not bright and fresh but aged, substantial, with a slight warmth that reads as heritage rather than corporate. Crimson-velvet-soft provides the barn red register — a saturated but somewhat darkened red that reads as painted wood and classic Americana rather than emergency or urgency. Amber-bloom-soft provides the warm cream of aged linen, natural canvas, and heritage paper — a background that grounds the palette in handmade and time-worn. Honey-whisper-faint extends to the palest warm cream register for fine detail and near-white contexts. Cobalt-dusk-clear provides a medium-dark navy with enough clarity to carry typography at small sizes.",
    ["Heritage", "American", "Classic"],
    [
      "cobalt-shadow-muted",
      "crimson-velvet-soft",
      "amber-bloom-soft",
      "honey-whisper-faint",
      "cobalt-dusk-clear",
    ],
    {
      editorialNote:
        "Vintage Americana works for brands with genuine American heritage or craft positioning: workwear, denim, boots, and accessories brands with American manufacturing; food and beverage brands — craft beer, whiskey, hot sauce, condiments — built on regional American identity; heritage outdoor and sporting goods; publishing and media with an independent American voice; interior brands with a farmhouse or classic American aesthetic. The palette should be executed with enough restraint to avoid tipping into kitsch — the navy and cream do most of the work, with red as an accent rather than a dominant. Photography direction: natural light on worn wood, painted surfaces showing age, raw materials like leather, canvas, and denim; product on stone, reclaimed wood, or worn workbench surfaces; exterior American architecture in natural light. Typography: the palette pairs best with condensed Gothic or slab-serif typefaces with American wood-type heritage (Knockout, Tungsten, Sentinel), or classic geometric sans with confident weight.",
      promptWords: [
        "heritage American workwear brand in deep navy and barn red",
        "craft American whiskey brand in vintage navy and warm cream",
        "independent American food brand in classic americana palette",
      ],
      useCases: ["American heritage workwear and clothing brands", "Craft food and beverage with American regional identity", "Heritage outdoor and sporting goods brands"],
    }
  ),
  createCollection(
    "tea-ceremony",
    "Tea Ceremony",
    "Warm cream, aged brown, and quiet sage tones drawn from the Japanese tea ceremony — tatami, ceramic glazes, the color of matcha and aged oak, and the particular quality of diffused light through shoji screens.",
    "The tea ceremony palette is defined by its restraint and its warmth: colors that have been steeped in use and time rather than freshly applied. The reference is the chashitsu — the tea house — with its natural materials, aged finishes, and carefully considered light. Amber-pearl-muted provides the foundational warm cream of aged washi paper, hemp rope, and undyed linen — a background that reads as natural and considered, not clinical or cold. Warm-gray-whisper gives the cool pale register of the shoji screen — light diffused through translucent paper, neither warm nor cold but perfectly balanced. Honey-dusk-muted provides the deep, warm brown of oiled cedar, aged bamboo, and the darker ceramic glazes — a color that grounds the palette in organic material. Moss-tone-muted gives the specific muted gray-green of matcha as a color field — not the vivid green of fresh vegetation but the composed, slightly gray tone of dried, powdered tea and aged jade. Jade-whisper-faint extends to a very pale, barely-there green-gray for fine detail and the softest presence of the botanical register.",
    ["Japanese", "Zen", "Serene"],
    [
      "amber-pearl-muted",
      "warm-gray-whisper",
      "honey-dusk-muted",
      "moss-tone-muted",
      "jade-whisper-faint",
    ],
    {
      editorialNote:
        "Tea ceremony works for premium Japanese wellness and hospitality brands, specialty tea and matcha brands positioning above commercial green tea, Japanese ceramics and craft goods, premium skincare and beauty with a Japanese botanical or minimalist positioning, wellness and meditation apps, and high-end Japanese-inspired interiors and home goods. The palette demands execution discipline: every surface and proportion must be considered, because the palette's power comes from the precision of restraint. Photography direction: close-up of ceramic glazes and raw clay surfaces; natural light through translucent screens; macro photography of matcha, dried herbs, and botanical materials; product on natural wood, stone, or washi paper with diffused natural light. Typography: a fine-weight Japanese-compatible serif or humanist sans at generous tracking (Noto Serif, Hiragino Mincho Pro, Minion Pro) reads as the correct register; avoid bold or condensed type that introduces energy the palette does not support.",
      promptWords: [
        "Japanese matcha brand in warm cream and muted sage tea ceremony palette",
        "premium Japanese wellness brand in washi and aged ceramic tones",
        "minimalist Japanese ceramics brand in tea ceremony earthy palette",
      ],
      useCases: ["Specialty matcha and Japanese tea brands", "Premium Japanese wellness and spa brands", "Japanese-inspired ceramics and craft goods"],
    }
  ),
  createCollection(
    "electric-dreams",
    "Electric Dreams",
    "Vivid violet, electric cobalt, iris, and teal at maximum saturation — a palette for digital-native brands, technology experiences, and creative work where energy, imagination, and forward momentum are the primary signals.",
    "Electric dreams is built at the most charged end of the spectrum: the high-saturation blues, purples, and greens that read as digital-native, generative, and kinetically alive. These are the colors of screens at their most vivid, of generative AI interfaces, of music visualizers and digital art — colors that feel like potential energy held in visual form. Violet-core-vivid provides the palette's primary charge — a full-saturation violet at medium lightness that reads as creative, imaginative, and slightly otherworldly. Cobalt-core-vivid gives the electric blue register — the specific blue of creative software, digital interfaces, and technology brands that want to read as bold and forward. Iris-core-vivid bridges the two with an electric blue-violet that reads as simultaneously technological and creative. Teal-core-vivid provides the palette's cool complement — an electric teal that balances the warm end of the violet-cobalt range and adds visual complexity. Fuchsia-radiant-vivid extends to the hot pink register for maximum energy and the pop of contemporary digital aesthetics.",
    ["Digital", "Vibrant", "Creative"],
    [
      "violet-core-vivid",
      "cobalt-core-vivid",
      "iris-core-vivid",
      "teal-core-vivid",
      "fuchsia-radiant-vivid",
    ],
    {
      editorialNote:
        "Electric dreams works for digital-native creative tools and platforms, music production software and streaming brands, generative AI creative applications, gaming and entertainment brands, digital art and NFT platforms, creative agencies and studios with an avant-garde positioning, and any brand targeting a young, digital-first audience where energy and creativity are the primary brand attributes. The palette requires restraint in execution: at this saturation level, using all five colors simultaneously creates visual fatigue. Best practice is to select one or two as dominant, use a third as accent, and reserve the remaining colors for specific emphasis or interaction states. Photography and visual direction: digital rendering, 3D illustration, motion graphics, and synthetic imagery work best — analog photography is rarely the right treatment. Typography: geometric sans at all weights and sizes works with this palette's energy.",
      promptWords: [
        "creative AI platform in electric violet and cobalt palette",
        "digital music brand in vivid electric dreams spectrum",
        "generative art tool in neon violet and electric blue",
      ],
      useCases: ["Digital creative tools and AI platforms", "Music production and streaming brands", "Gaming and digital entertainment brands"],
    }
  ),
  createCollection(
    "copper-verdigris",
    "Copper & Verdigris",
    "Warm copper tones, deep ember, and oxidized jade-green — the specific palette of aged copper and bronze: the warm metal underneath, the darkened shadow register, and the blue-green patina that builds over decades of exposure.",
    "Copper and verdigris is the palette of aged metal — specifically the three-register color story of copper: the warm orange-red of new copper, the darkened ember of oxidized copper without patina, and the characteristic blue-green of mature verdigris. These colors appear together on copper rooftops, bronze sculpture, architectural details, and aged vessels, and the combination reads as simultaneously warm and sophisticated — the warmth of the copper contrasted against the cool, chemical quality of the patina. Ember-core-soft provides the palette's foundational warm copper — a slightly desaturated ember that reads as burnished metal rather than raw fire. Ember-shadow-muted gives the deep, darkened copper register — the color of copper that has oxidized to brown without yet developing patina, the specific warm dark of aged metal in shadow. Jade-tone-muted provides the characteristic patina register — the specific muted gray-green of copper verdigris, which reads as simultaneously aged, sophisticated, and slightly mysterious. Teal-tone-muted extends the patina into the slightly more chromatic range — the greener, more vivid verdigris seen in areas of more active oxidation. Amber-bloom-soft provides a warm mid-range that bridges the copper and patina registers, reading as burnished highlight and connecting the warm and cool poles of the palette.",
    ["Artisan", "Metallic", "Heritage"],
    [
      "ember-core-soft",
      "ember-shadow-muted",
      "jade-tone-muted",
      "teal-tone-muted",
      "amber-bloom-soft",
    ],
    {
      editorialNote:
        "Copper verdigris works for premium spirits and wine brands with a craft and heritage character, architectural metalwork and decorative hardware brands, luxury home goods and interior brands with an art object sensibility, jewelry and craft metalsmithing brands, premium coffee roasters and specialty food brands with an artisan positioning, and environmental and architectural design projects incorporating aged metal as a material reference. The palette has a natural affinity with premium printing and embossing: a foil-stamped logo in copper on a card stock matching ember-shadow-muted is a classic execution. Photography direction: close-up of aged copper, bronze, and patina surfaces in natural light; product on stone, concrete, or weathered wood; architectural photography of copper-clad buildings and aged bronze fixtures; interior photography where aged metal is a primary material. Typography: a refined serif or refined italic (Caslon, Cormorant, or EB Garamond) aligns well with the palette's aged-quality character.",
      promptWords: [
        "premium craft spirits brand in aged copper and verdigris palette",
        "luxury metalwork brand in warm copper and patina green",
        "artisan coffee brand in burnished copper and oxidized teal tones",
      ],
      useCases: ["Premium craft spirits and specialty beverage brands", "Architectural metalwork and luxury hardware brands", "Artisan food, jewelry, and craft goods brands"],
    }
  ),
];

collections.push(...extraCollections31);

const extraCollections32: ColorCollection[] = [
  createCollection(
    "solar-flare",
    "Solar Flare",
    "Maximum-saturation amber, ember, and vivid coral — the palette of solar energy, peak summer intensity, and bold consumer brands that want to register as hot, energetic, and unstoppable.",
    "Solar flare is built at the highest-energy end of the warm spectrum — colors that read as heat, light, and kinetic energy rather than warmth and comfort. These are not the relaxed ambers of harvest season or the soft corals of skincare; they are the near-neon registers of concentrated sunlight, liquid amber at its most vivid, and the orange-red of flame at its most energetic. Amber-bloom-vivid anchors the palette at maximum amber saturation — a vivid warm orange that reads as molten, electric, and intensely energetic. Amber-dusk-vivid provides a deeper, more bronzed vivid register — the color of concentrated amber at low sun angle, dark enough to have weight and authority but vivid enough to vibrate. Ember-tone-clear gives the cooler, more orange-red register — the specific color of an ember at peak heat, between amber and coral in hue. Citrine-bloom-vivid extends toward the yellow-warm end — a vivid citrine that reads as electric lemon and solar energy, providing the palette's lightest and most energetic point. Coral-radiant-vivid adds the warm pink-orange extension — the vivid coral of heated neon, providing the palette's most saturated warm-pink register.",
    ["Vivid", "Warm", "Energy"],
    [
      "amber-bloom-vivid",
      "amber-dusk-vivid",
      "ember-tone-clear",
      "citrine-bloom-vivid",
      "coral-radiant-vivid",
    ],
    {
      editorialNote:
        "Solar flare works for energy drink and functional beverage brands, summer campaigns and seasonal activations, sports nutrition and performance brands, bold consumer technology and gaming brands, and any creative work where visual intensity and energy are primary brand attributes. At this saturation level, the palette requires restraint in deployment — using all five colors simultaneously creates visual fatigue. Best practice: select one or two as dominant, use a third as accent, and deploy the remaining as exception or interaction states. Photography direction: high-key sunlit environments, reflective surfaces, glass and liquid in direct light, motion blur with warm color cast. Typography: bold geometric sans at large scale reads well against these saturated backgrounds.",
      promptWords: [
        "energy brand in maximum amber and vivid coral solar palette",
        "summer campaign in electric amber and vivid ember tones",
        "bold consumer brand in high-saturation solar flare palette",
      ],
      useCases: ["Energy and functional beverage brands", "Sports and performance brands", "Summer seasonal campaigns and activations"],
    }
  ),
  createCollection(
    "cloud-nine",
    "Cloud Nine",
    "The very palest blues, near-whites, and clean cerulean whispers — a palette for minimal digital products, clean interfaces, and brands that want to feel airy, open, and effortlessly light.",
    "Cloud nine occupies the extreme pale end of the blue-white spectrum — colors so desaturated and light that they read as white until examined closely, with the just-perceptible quality of sky and cloud rather than the visual weight of blue. These are not the vivid blues of ocean or sky at noon; they are the barely-there blues of high overcast, of clean frosted glass, of pale morning sky before the sun has fully risen. Cerulean-whisper-soft provides the palette's foundational tone — a very pale cerulean with just enough blue presence to be perceptible against white, reading as the specific color of clean winter sky in diffused light. Azure-silk-faint extends to an even paler, slightly greener whisper — the color of high-altitude ice haze, barely distinguishable from white but perceptibly distinct. Cerulean-veil-muted gives a slightly more present pale — a whisper of cerulean with a slightly more saturated character that provides definition against the two fainter tones. Cobalt-mist-faint adds a slightly darker, cooler note — a very pale cobalt whisper that provides the palette's deepest tone and allows for subtle hierarchy without visual weight. Cerulean-whisper-muted completes the range with a slightly warmer, more present cerulean that bridges the faintest and most saturated registers.",
    ["Minimal", "Airy", "Clean"],
    [
      "cerulean-whisper-soft",
      "azure-silk-faint",
      "cerulean-veil-muted",
      "cobalt-mist-faint",
      "cerulean-whisper-muted",
    ],
    {
      editorialNote:
        "Cloud nine works for minimal SaaS and productivity tools positioning on clarity and focus, cloud computing and infrastructure brands, premium healthcare and wellness digital products, clean consumer technology brands, and any interface or brand system where the surface should feel open, uncluttered, and breathing. The palette requires careful color management in production: very pale blues can shift significantly between screen profiles and print, and the distinctions between tones are subtle enough to collapse under poor display conditions. Design with explicit surface hierarchy in mind — the five tones provide a complete pale surface stack, from near-white to a pale blue that can carry text in the right context. Photography direction: high-key natural light, clean white and glass surfaces, overcast sky environments, minimal product photography on white or very pale backgrounds.",
      promptWords: [
        "minimal SaaS dashboard in pale cerulean and clean blue palette",
        "cloud technology brand in airy whisper blues",
        "clean healthcare interface in pale azure and frost palette",
      ],
      useCases: ["Minimal SaaS and productivity tools", "Cloud computing and infrastructure brands", "Premium healthcare and wellness digital products"],
    }
  ),
  createCollection(
    "autumn-harvest",
    "Autumn Harvest",
    "Deep amber, burnt rust, olive, and garnet — the specific palette of late harvest season: aged oak barrels, the color of dried corn and turning leaves, the particular richness of October afternoons.",
    "Autumn harvest is built on the deep, saturated warmth of late-season organic materials — colors that have dried, aged, and concentrated over the growing season into their richest and most intense expression. These are not the early autumn colors of fresh orange leaves and bright yellow; they are the late harvest palette of dried grasses, aged wood, preserved fruits, the specific brown-red of turning oak, and the deep olive of spent foliage. Amber-velvet-muted provides the palette's foundational warm amber — a desaturated, muted amber that reads as aged rather than vivid, like amber seen in indirect autumn light through dusty glass. Ember-veil-muted gives the deep rust-copper register — the specific warm brown of dried ember and aged copper, a color that reads as spent and preserved rather than hot and active. Garnet-velvet-soft provides the palette's deepest tone — a soft, muted garnet that reads as concentrated fruit and aged wood, the color of late autumn vineyards and dark harvest produce. Olive-dusk-muted extends to the characteristic muted yellow-green of late-season foliage — dried grass, preserved herb, the specific olive of late-autumn sage after the first frost. Amber-whisper-muted completes the range with a very pale, desaturated amber that reads as dried parchment and aged paper — the palette's lightest and most restrained tone.",
    ["Autumn", "Harvest", "Warm"],
    [
      "amber-velvet-muted",
      "ember-veil-muted",
      "garnet-velvet-soft",
      "olive-dusk-muted",
      "amber-whisper-muted",
    ],
    {
      editorialNote:
        "Autumn harvest works for seasonal campaigns (Q4 retail, harvest-season food and beverage), premium food and agricultural brands with a terroir and provenance positioning, heritage craft spirits and wine brands, premium home goods and interior brands with a seasonal warmth character, editorial photography campaigns, and autumn fashion editorial. The palette has natural affinity with premium print and tactile materials — an embossed, letterpress, or foil-stamped execution in these tones on uncoated paper stock aligns with the palette's aged, organic quality. Photography direction: natural autumn light (warm, raking low-angle light), aged materials (wood, stone, paper, ceramic), close-up textures of harvest produce and dried organic materials, interior photography with warm tungsten light in aged wood environments.",
      promptWords: [
        "autumn seasonal campaign in deep amber and harvest palette",
        "premium wine brand in aged amber, garnet and olive autumn tones",
        "heritage craft spirits brand in autumn harvest palette",
      ],
      useCases: ["Seasonal Q4 retail and food campaigns", "Premium wine and craft spirits with harvest character", "Heritage home goods and interior brands with autumn warmth"],
    }
  ),
  createCollection(
    "northern-winter",
    "Northern Winter",
    "Ice blue, pale cerulean, deep indigo, and near-white — the precise color palette of northern latitude winters: the color of ice, frozen water, clear winter sky, and the particular blue-black of a winter night.",
    "Northern winter is built on the specific color registers of cold-climate winter environments — colors that read as cold, clear, and expansive rather than warm or enclosed. These are not the generic blues of generic 'winter' palettes; they are the precise colors of particular winter experiences: the pale blue of ice at shallow depth, the near-white of fresh snow under overcast sky, the particular dark blue-gray of frozen lake ice, and the deep indigo of northern sky in the hour after sunset when the last warm light has faded and only the cold blue remains. Cerulean-mist-soft anchors the palette at the pale ice-blue register — a very pale, desaturated cerulean that reads as the specific color of thin ice over still water, simultaneously cold and luminous. Cerulean-nocturne-soft provides the deeper, more present blue — the color of clear northern winter sky in the afternoon, saturated enough to read as definitively cold but not so dark as to lose the open, expansive quality. Indigo-dusk-muted gives the palette's deepest, darkest tone — a muted indigo that reads as the specific blue-black of winter night sky just before full dark, heavy and cold but with retained color character rather than neutral darkness. Cerulean-pearl-muted extends to a near-white pale blue — the color of fresh snow in diffused winter light, reading as clean and cold with just-perceptible color. Cobalt-dusk-faint completes the range with a pale, slightly more saturated blue that bridges the very pale and the mid-blue registers.",
    ["Winter", "Nordic", "Cold"],
    [
      "cerulean-mist-soft",
      "cerulean-nocturne-soft",
      "indigo-dusk-muted",
      "cerulean-pearl-muted",
      "cobalt-dusk-faint",
    ],
    {
      editorialNote:
        "Northern winter works for Nordic and Scandinavian lifestyle and fashion brands, winter sports and outdoor equipment brands with a cold-climate character, premium skincare and beauty brands positioning on winter, ice, and clean cold environments, winter seasonal campaigns, and any brand or editorial work that wants to evoke the specific quality of northern latitude winters — not generic festive winter but the real cold, clear, austere beauty of high-latitude environments in the dark season. Photography direction: natural winter light (low angle, blue-toned, diffused), ice and snow textures, winter landscapes with emphasis on the specific blues of frozen water and winter sky, interior photography with cool, clean north light. Typography: clean geometric sans at generous weight reads as the correct register — avoid warm serif faces that work against the palette's cold character.",
      promptWords: [
        "Nordic winter lifestyle brand in pale cerulean and ice blue palette",
        "winter sports brand in cold northern winter blue tones",
        "Scandinavian premium brand in ice blue and deep indigo winter palette",
      ],
      useCases: ["Nordic and Scandinavian lifestyle and fashion brands", "Winter sports and cold-climate outdoor brands", "Premium winter skincare and beauty brands"],
    }
  ),
];

collections.push(...extraCollections32);

const extraCollections33: ColorCollection[] = [
  createCollection(
    "digital-primary",
    "Digital Primary",
    "Pure cobalt, vivid emerald, and bright citrine — the clean, maximally-saturated primary triad for digital brands that want to signal clarity, precision, and optimistic energy.",
    "Digital primary draws from the tradition of the Bauhaus and De Stijl primary color philosophies, reinterpreted for contemporary digital interfaces. Where Mondrian's primaries were printed inks and Bauhaus pigments, these are calibrated for screen luminosity — colors that maximize legibility, contrast, and visual clarity on digital surfaces. Cobalt-core-vivid anchors the palette with the definitive saturated digital blue — the blue of interactive elements, primary CTAs, and brand anchors in technology brands. Emerald-bloom-vivid provides the vivid green — the specific quality of a success state, an active status indicator, or a brand green in the tradition of Spotify or Robinhood. Citrine-bloom-vivid extends to vivid yellow — the alert color, the highlight, the energy accent. These three together create the classic primary energy of multi-color tech brand systems, while the composition can also deploy one color at a time for focused, single-accent brand systems.",
    ["Vivid", "Digital", "Primary"],
    [
      "cobalt-core-vivid",
      "emerald-bloom-vivid",
      "citrine-bloom-vivid",
      "cobalt-whisper-soft",
      "true-gray-mist",
    ],
    {
      editorialNote:
        "Digital primary works for technology brands that want to signal openness, clarity, and optimism without the corporate restraint of single-blue systems. Best deployed as one dominant primary with two accents rather than three simultaneous equals — the three-equal-weight deployment risks reading as generic.",
      promptWords: [
        "tech brand in vivid cobalt, emerald, and citrine digital primary",
        "SaaS product in clean multi-color primary system",
        "digital brand in Bauhaus-inspired vivid primary palette",
      ],
      useCases: ["Multi-product technology brands", "Developer tools and platforms", "EdTech and educational technology"],
    }
  ),
  createCollection(
    "film-noir",
    "Film Noir",
    "Deep cool black, ash gray, and cold blue-gray shadows — the palette of 1940s black-and-white cinema translated to modern UI and editorial design seeking dramatic atmosphere and noir mystery.",
    "Film noir was a cinematic movement defined by extreme tonal contrast, deep shadows, and moral ambiguity — visually expressed through hard, high-contrast light sources (venetian blinds, street lamps, match flares) that created absolute black-and-white with no comfortable midtones. The palette for contemporary noir aesthetic draws from the specific grays of silver-gelatin film stock — not neutral grays but slightly cool, slightly blue-tinged shadow tones that communicate cinematic depth rather than mere darkness. True-gray-nocturne provides the near-black that reads as shadow rather than digital void — the specific dark of printed film noir rather than screen black. Cool-gray-tone gives the characteristic silver of mid-tone shadows — the gray of a villain's pinstripe suit, the tone of a wet rain-slicked street under a lamp. Cool-gray-mist extends to the lighter film gray — the specific tone of blown-out window light in a high-contrast interior, or the pale skin tone of film stock. The result is a dramatically atmospheric dark palette with none of the pure-black flatness of contemporary dark UI.",
    ["Dark", "Dramatic", "Cinematic"],
    [
      "true-gray-nocturne",
      "cool-gray-shadow",
      "cool-gray-tone",
      "cool-gray-mist",
      "cobalt-whisper-muted",
    ],
    {
      editorialNote:
        "Film noir palette is ideal for premium dark interfaces, luxury brand materials where glossy black feels cheap, editorial photography with a cinematic treatment, and any design that requires dramatic atmosphere without resorting to pure black. The slight cool cast differentiates from generic dark UI.",
      promptWords: [
        "dark editorial design in film noir silver and shadow palette",
        "luxury dark interface in cinematic gray and black tones",
        "dramatic brand identity in noir shadow and cool gray palette",
      ],
      useCases: ["Premium dark mode digital products", "Luxury brand materials and packaging", "Cinematic editorial photography direction"],
    }
  ),
  createCollection(
    "impressionist-garden",
    "Impressionist Garden",
    "Soft sky blue, garden green, warm floral pink, and luminous afternoon light — the palette of Monet's Giverny and the Impressionist movement's study of natural light.",
    "The Impressionist color palette emerges from the movement's radical methodological innovation: painting en plein air, studying light rather than local color, and using broken, unmixed brushstrokes to capture the visual sensation of a moment rather than the documented facts of a scene. The result is a palette of atmospheric softness — no pure, unmixed hues, but a collection of colors that have been influenced by adjacent light, shadow, and reflection. Sky and water blues carry warmth from surrounding sunlight; garden greens are modified by golden afternoon light and purple shadow; pinks and roses are simultaneously warm in light and cool in shadow. Cerulean-bloom-soft anchors the palette with the characteristic sky-water blue of the Impressionist outdoor scene — not a pure cobalt but a soft, light-modified blue with warmth from ambient light. Jade-tone-soft provides the garden green — a sage-jade tone that reads as natural botanical rather than saturated green, suggesting leaves under dappled light. Rose-whisper-soft extends to the floral register — the soft pink of water lily flowers, roses, and reflected sunset light on water surfaces. Honey-silk-soft adds the warm golden afternoon light quality — the specific amber-warm tone of late afternoon sun.",
    ["Soft", "Natural", "Garden"],
    [
      "cerulean-bloom-soft",
      "jade-tone-soft",
      "rose-whisper-soft",
      "honey-silk-soft",
      "violet-whisper-muted",
    ],
    {
      editorialNote:
        "Impressionist garden is ideal for wellness, spa, and botanical brands; fine art-adjacent editorial and publishing; organic and natural food brands; and any design that wants to communicate sensory pleasure and natural beauty without the rawness of vivid color or the staleness of predictable pastels.",
      promptWords: [
        "botanical wellness brand in Impressionist soft garden palette",
        "fine art-inspired editorial in soft blue, green, and rose tones",
        "luxury natural beauty brand in Impressionist garden palette",
      ],
      useCases: ["Botanical wellness and spa brands", "Fine art-adjacent publishing and editorial", "Luxury natural and organic beauty brands"],
    }
  ),
  createCollection(
    "brand-trust",
    "Brand Trust",
    "Deep navy, warm gray, and reliable white — the archetypal palette of institutional authority, financial services, and legacy brands that have traded heavily in trust for decades.",
    "Trust has a color, and it is institutionalized navy blue. The specific quality of this blue — deep, slightly warm, not the pure cool of cerulean or the near-purple of indigo — is the color that has anchored financial services, healthcare, legal, and government brands for over a century. It exists because these institutions must communicate reliability and permanence above all other qualities, and deep navy is the most culturally legible signal of those values in Western contexts. The palette builds outward from this anchor in the warm direction rather than the cool, using warm grays and off-whites rather than cool grays and pure whites. This creates a system that reads as authoritative but not cold, institutional but not clinical. Indigo-core-muted provides the foundational institutional navy — the specific blue of a banking logo or a law firm letterhead, with enough depth to read as serious and enough warmth to remain approachable. Warm-gray-tone gives the supporting secondary tone — the gray of corporate stationery, the tone of professional documents, present but never dominant. Warm-gray-mist extends to the near-white that reads as premium rather than cold.",
    ["Classic", "Trust", "Institutional"],
    [
      "indigo-core-muted",
      "indigo-whisper-soft",
      "warm-gray-tone",
      "warm-gray-mist",
      "amber-silk-faint",
    ],
    {
      editorialNote:
        "Brand trust is the foundational palette for any brand that competes on reliability, permanence, and institutional credibility. Works for financial services, legal, healthcare, insurance, government, and any brand whose primary value proposition is 'we will still be here in 20 years.' The amber-silk-faint accent adds humanity to what could otherwise be too institutional.",
      promptWords: [
        "financial services brand in institutional navy and warm gray palette",
        "law firm identity in deep navy and professional warm gray",
        "healthcare brand in trustworthy navy and soft warm white",
      ],
      useCases: ["Financial services and banking", "Healthcare and insurance", "Legal and professional services"],
    }
  ),
];

collections.push(...extraCollections33);

const extraCollections34: ColorCollection[] = [
  createCollection(
    "forest-bathing",
    "Forest Bathing",
    "A deep woodland palette for wellness brands, botanical illustration, and nature-immersive interfaces.",
    "Inspired by the Japanese practice of shinrin-yoku, this collection draws from forest undergrowth, canopy light, and mossy shade. The palette spans from sun-dappled lime to the deepest emerald shadow, with warm amber as a late-afternoon accent.",
    ["Nature", "Wellness", "Green"],
    [
      "moss-bloom-soft",
      "leaf-tone-soft",
      "emerald-core-soft",
      "lime-silk-clear",
      "olive-shadow-muted",
      "amber-bloom-soft",
    ],
    {
      editorialNote:
        "Forest Bathing evokes the sensory richness of time spent in woodland: the layered greens from undergrowth to canopy, the filtered warmth of light through leaves, the deep shadows under old growth. This palette works for wellness brands, outdoor gear, botanical products, and any interface that should feel grounded and alive rather than sterile.",
      promptWords: [
        "wellness brand in deep woodland greens with warm amber accent",
        "botanical illustration palette with layered forest greens",
        "outdoor gear brand in nature-immersive green and moss",
      ],
      useCases: ["Wellness and mindfulness brands", "Outdoor and nature brands", "Botanical illustration and editorial"],
    },
  ),
  createCollection(
    "y2k-digital",
    "Y2K Digital",
    "A millennium-era revival palette of electric blues, chrome silvers, and vivid accents for digital nostalgia projects.",
    "Early internet optimism rendered in the colors of the 2000s: electric cobalt, chrome gray, lime green, and vivid magenta. This palette captures the era of translucent plastics, neon desktop themes, and unironic digital maximalism.",
    ["Digital", "Nostalgia", "Bold"],
    [
      "cobalt-bloom-vivid",
      "iris-tone-vivid",
      "lime-core-vivid",
      "magenta-silk-vivid",
      "cool-gray-tone",
      "azure-pearl-clear",
    ],
    {
      editorialNote:
        "Y2K Digital is unabashedly bold: this is the palette of translucent iMacs, MSN Messenger skins, and early Flash websites. It belongs in music, gaming, streetwear, and any brand that wants to claim the early-internet aesthetic without being ironic about it. Use sparingly in UI contexts — this palette can overwhelm — but lean into its energy for editorial and campaign work.",
      promptWords: [
        "music brand in early 2000s electric blue and vivid chrome palette",
        "streetwear brand with Y2K era bold colors and digital energy",
        "gaming interface in millennium-era cobalt and lime palette",
      ],
      useCases: ["Music and entertainment branding", "Streetwear and fashion", "Gaming and digital nostalgia"],
    },
  ),
  createCollection(
    "haute-couture",
    "Haute Couture",
    "The restrained neutrals of fashion week runways — ivory, bone, nude, and the considered use of a single dark ground.",
    "Fashion houses at the highest level use almost no color in their core system: ivory, cream, warm bone, and a single dark anchor. This collection captures the palette of runway presentation: editorial restraint, maximum quality signal, zero unnecessary saturation.",
    ["Fashion", "Luxury", "Neutral"],
    [
      "apricot-whisper-faint",
      "apricot-pearl-muted",
      "honey-mist-faint",
      "warm-gray-pearl",
      "warm-gray-dusk",
      "merlot-ink-muted",
    ],
    {
      editorialNote:
        "Haute Couture is the palette of restraint at its most intentional. Fashion at this level communicates through what it does not do: no saturated accent, no decorative color, no visual noise. The dark merlot-ink anchor provides depth without introducing hue competition. This palette works for luxury fashion, high-end beauty, jewelry, and any brand that competes on quality of craft rather than breadth of color expression.",
      promptWords: [
        "luxury fashion brand in runway neutral ivory and warm bone palette",
        "high-end jewelry brand in restrained cream and warm gray",
        "editorial fashion photography palette in nude, bone, and dark ink",
      ],
      useCases: ["Luxury fashion and beauty", "High-end jewelry and accessories", "Editorial fashion photography"],
    },
  ),
  createCollection(
    "transit-authority",
    "Transit Authority",
    "High-contrast navigation colors drawn from the world's great metro systems — for signage, maps, and wayfinding design.",
    "The palette of public transit: cerulean line colors, amber warnings, emergency red, and the cool grays of concrete and infrastructure. Designed for maximum legibility at distance and under varied lighting conditions.",
    ["Navigation", "Signage", "UI"],
    [
      "cerulean-core-vivid",
      "amber-core-vivid",
      "ember-core-vivid",
      "emerald-core-vivid",
      "cool-gray-core",
      "cool-gray-ink",
    ],
    {
      editorialNote:
        "Transit Authority draws from a century of public navigation design: the high saturation colors used by metro systems worldwide to ensure unambiguous line identification at a glance. These colors were not chosen for beauty but for maximum discrimination under fluorescent lighting, at distance, and in peripheral vision. As a design palette, they bring an authoritative, utility-forward energy to interface, wayfinding, and technical communication work.",
      promptWords: [
        "transit map design in high-contrast metro line colors",
        "wayfinding system in municipal blue, amber, and red",
        "technical interface palette in high-saturation navigation colors",
      ],
      useCases: ["Wayfinding and signage design", "Maps and navigation interfaces", "Technical and utility-focused UI"],
    },
  ),
];

collections.push(...extraCollections34);

const extraCollections35: ColorCollection[] = [
  createCollection(
    "dusk-garden",
    "Dusk Garden",
    "Evening florals in lavender, rose, and muted violet — a romantic palette for editorial, beauty, and atmospheric design.",
    "The palette of a garden at golden hour: dusty lavender, warm rose, muted violet, and the soft amber glow of fading light. Cool florals grounded by warm neutrals create a sense of melancholy beauty.",
    ["Floral", "Evening", "Romantic"],
    [
      "violet-pearl-soft",
      "rose-silk-soft",
      "orchid-bloom-muted",
      "plum-tone-muted",
      "amber-whisper-muted",
      "rose-pearl-soft",
    ],
    {
      editorialNote:
        "Dusk Garden captures the transitional light of late afternoon when floral colors shift from their daytime clarity toward more muted, atmospheric tones. The palette is most effective in editorial and beauty contexts where mood and poetry matter more than clarity. The warm amber anchor prevents the palette from becoming cold or melancholy.",
      promptWords: [
        "editorial beauty campaign in dusty lavender and warm rose",
        "evening garden scene in muted violet and amber glow",
        "romantic atmospheric palette in twilight florals",
      ],
      useCases: ["Beauty editorial", "Wedding and events", "Atmospheric product photography"],
    },
  ),
  createCollection(
    "raw-concrete",
    "Raw Concrete",
    "Brutalist grays from warm to cool — the palette of exposed concrete, modernist architecture, and industrial materials.",
    "The spectrum of unfinished concrete: cool stone, warm aggregate, dark formwork shadows, and the chalk-pale of freshly cured surfaces. A grounding, structural palette for architecture, interior, and design-forward brands.",
    ["Architecture", "Brutalist", "Industrial"],
    [
      "cool-gray-whisper",
      "warm-gray-silk",
      "cool-gray-tone",
      "warm-gray-velvet",
      "cool-gray-shadow",
      "warm-gray-nocturne",
    ],
    {
      editorialNote:
        "Raw Concrete takes its palette from the material character of exposed concrete surfaces, which are never truly neutral — they shift between warm aggregate tones and cool blue-gray stone, with deep formwork shadows and pale cured highlights. This palette works particularly well in architecture, interior, and product contexts where material authenticity and structural weight are the intended mood.",
      promptWords: [
        "brutalist architecture editorial in concrete gray tones",
        "industrial interior palette in warm and cool gray",
        "minimal design system in exposed concrete surface palette",
      ],
      useCases: ["Architecture and interior design", "Industrial brand identity", "Minimal design system backgrounds"],
    },
  ),
  createCollection(
    "boreal-forest",
    "Boreal Forest",
    "The deep greens, bark grays, and frost accents of northern boreal landscapes — for outdoor, wellness, and earthy editorial.",
    "A palette from the world's great northern forest biome: deep spruce, pine shadow, lichen gray, birch bark, and the pale frost of a winter sky. Cold, ancient, and clean.",
    ["Nordic", "Forest", "Outdoor"],
    [
      "emerald-shadow-soft",
      "moss-velvet-soft",
      "jade-dusk-muted",
      "cool-gray-bloom",
      "leaf-core-muted",
      "cool-gray-whisper",
    ],
    {
      editorialNote:
        "The boreal forest palette differs from temperate forest palettes in its coldness and blue-gray undertones. The spruce and pine greens lean toward blue rather than yellow, the grays carry the cool tone of granite and permafrost, and the accents come from frost and pale winter sky rather than warm autumn light. This makes it distinctly different from, say, Autumn Harvest or Forest Floor — it reads as more severe, more northern, and more minimal.",
      promptWords: [
        "nordic wilderness editorial in spruce and frost tones",
        "boreal forest branding in deep green and cool gray",
        "northern outdoor campaign in pine shadow and birch light",
      ],
      useCases: ["Outdoor and adventure brands", "Nordic wellness", "Environmental editorial"],
    },
  ),
  createCollection(
    "carnival-lights",
    "Carnival Lights",
    "The vivid nostalgia of a traveling fair — scarlet, cobalt, citrine, and warm ivory for bold editorial and festive campaigns.",
    "The palette of a carnival at night: blazing scarlet, electric cobalt, citrine yellow, and the warm ivory of painted wood. Bold, festive, and slightly nostalgic.",
    ["Festive", "Nostalgia", "Bold"],
    [
      "crimson-core-vivid",
      "cobalt-core-vivid",
      "citrine-core-vivid",
      "amber-silk-clear",
      "warm-gray-whisper",
    ],
    {
      editorialNote:
        "Carnival Lights draws from the primary color exuberance of traveling fairs and amusement parks — the painted wood, the bare bulb strings, the vivid canvas banners. The palette is unapologetically bold and slightly nostalgic, working best in campaigns that want festive energy without becoming saccharine. The warm gray anchor keeps the palette from becoming purely childlike.",
      promptWords: [
        "festive fair campaign in vivid scarlet, cobalt, and citrine",
        "carnival nostalgia palette in bold primary colors",
        "bold editorial palette in traveling fair colors",
      ],
      useCases: ["Festive campaign design", "Event branding", "Bold editorial packaging"],
    },
  ),
  createCollection(
    "bleached-denim",
    "Bleached Denim",
    "Washed indigo, powder blue, chalk, and faded amber — the lived-in palette of vintage denim and sun-faded textiles.",
    "The palette of denim that has been through a thousand washes: faded indigo, powder blue, off-white chalk, warm ecru, and the pale amber of sun-bleached thread. Effortless, lived-in, and warm.",
    ["Denim", "Vintage", "Casual"],
    [
      "indigo-silk-muted",
      "cobalt-bloom-muted",
      "azure-pearl-soft",
      "cool-gray-bloom",
      "amber-whisper-soft",
      "warm-gray-veil",
    ],
    {
      editorialNote:
        "Bleached Denim is a palette about material aging and wear history. Each color represents a stage in the fading process: the dark indigo of new denim, the mid-blue of frequent wear, the powder blue of vintage pieces, and the chalk and ecru of near-total bleaching. The palette works in fashion, lifestyle, and casual brand contexts where authenticity and ease are the intended character.",
      promptWords: [
        "vintage denim editorial in faded indigo and powder blue",
        "lived-in casual palette in washed blue and off-white",
        "sun-bleached textile palette for lifestyle brand",
      ],
      useCases: ["Fashion and lifestyle brands", "Casual editorial", "Vintage-inspired product photography"],
    },
  ),
];

collections.push(...extraCollections35);

const extraCollections36: ColorCollection[] = [
  createCollection(
    "jazz-club",
    "Jazz Club",
    "Deep amber, warm shadow, and rich ivory — the palette of low-lit venues, brass instruments, and late-night music.",
    "The visual atmosphere of a classic jazz club: warm amber spill-light over polished wood, the warm shadow of velvet curtains, ivory keys and brass fittings. A deeply warm, richly tonal palette for environments that feel both intimate and sophisticated.",
    ["Evening", "Warm", "Sophisticated"],
    [
      "amber-shadow-clear",
      "ember-tone-muted",
      "honey-tone-muted",
      "warm-gray-shadow",
      "coral-veil-faint",
      "ember-core-clear",
    ],
    {
      editorialNote:
        "Jazz Club captures the specific quality of warm tungsten light on warm surfaces — wood, brass, velvet, skin. The palette is intensely warm but avoids being garish through the use of muted and tonal variants rather than vivid hues. The shadow anchor prevents it from looking simply bright. Most effective for hospitality, nightlife, and premium entertainment brands.",
      promptWords: [
        "jazz club interior in warm amber and deep shadow",
        "late-night music venue in honey and warm ivory",
        "brass instrument still life in amber and warm dark tones",
      ],
      useCases: ["Hospitality branding", "Music venue identity", "Premium entertainment"],
    },
  ),
  createCollection(
    "polar-expedition",
    "Polar Expedition",
    "Ice blue, expedition orange, deep navy, and frost white — the palette of Arctic research vessels and high-latitude adventure.",
    "The functional color language of polar expeditions: ice-blue glacial water, the high-visibility orange of expedition gear and survival equipment, deep navy of polar sky, and the pure white of compacted ice. A palette of stark natural beauty and purposeful contrast.",
    ["Arctic", "Adventure", "Contrast"],
    [
      "azure-whisper-soft",
      "cobalt-shadow-muted",
      "sapphire-shadow-clear",
      "apricot-core-vivid",
      "azure-veil-soft",
      "cool-gray-bloom",
    ],
    {
      editorialNote:
        "Polar Expedition uses the natural contrast of Arctic environments — the cold blue-white of ice against the safety orange of human presence. The orange accent works at small quantities as a signal color; the palette reads as purposeful and technical rather than recreational. Effective for outdoor gear brands, expedition equipment, and adventure travel.",
      promptWords: [
        "arctic expedition gear in orange and ice blue",
        "polar research vessel palette in navy and frost",
        "high-latitude adventure branding in cobalt and apricot",
      ],
      useCases: ["Outdoor gear brands", "Adventure travel", "Scientific and research contexts"],
    },
  ),
  createCollection(
    "glazed-ceramic",
    "Glazed Ceramic",
    "Warm ivory, soft celadon, dusty rose, and warm gray — the palette of hand-thrown studio pottery and artisan ceramics.",
    "The colors of studio pottery: warm ivory clay bodies, pale celadon glazes with their quiet green-gray cool, dusty rose slip decoration, and the neutral warmth of unglazed stoneware. A gentle, handmade palette that signals craft, warmth, and quiet intention.",
    ["Artisan", "Neutral", "Warm"],
    [
      "coral-veil-faint",
      "seafoam-whisper-soft",
      "rose-whisper-soft",
      "warm-gray-bloom",
      "apricot-pearl-soft",
      "moss-whisper-muted",
    ],
    {
      editorialNote:
        "Glazed Ceramic draws from the specific color register of craft ceramics — warm, slightly imperfect, and quiet. The palette resists digital sharpness; it works best in contexts where slight texture and warmth are part of the brand story. The celadon-adjacent tones (seafoam whisper, sage whisper) provide the characteristic cool green-gray of wood-fired or reduction glazes.",
      promptWords: [
        "studio pottery still life in warm ivory and pale celadon",
        "artisan ceramics brand in dusty rose and warm gray",
        "hand-thrown vessel photography in soft ivory and seafoam",
      ],
      useCases: ["Craft and artisan brands", "Home goods and lifestyle", "Slow living editorial"],
    },
  ),
  createCollection(
    // ASCII slug on purpose. The accented id round-tripped through the URL as
    // percent-encoded UTF-8, which getCollectionById never matched, so the page
    // returned HTTP 200 with the not-found body — a soft 404 that the sitemap
    // was actively advertising. The displayed title keeps its accents.
    "cinema-verite",
    "Cinéma Vérité",
    "Desaturated cool tones, warm skin, muted teal, and gray shadow — the palette of documentary film and handheld realism.",
    "The visual grammar of documentary and observational cinema: the slight desaturation of handheld footage, warm skin tones against cool ambient light, the muted teal of fluorescent-lit interiors, and the compressed shadow of available-light shooting. A palette of restrained realism and human warmth.",
    ["Film", "Documentary", "Realism"],
    [
      "teal-tone-muted",
      "apricot-bloom-muted",
      "cool-gray-bloom",
      "warm-gray-nocturne",
      "amber-whisper-faint",
      "cobalt-tone-muted",
    ],
    {
      editorialNote:
        "Cinéma Vérité captures the specific desaturated realism of documentary and naturalistic cinema — skin warmth against ambient cool, compressed dynamic range, fluorescent interiors. The palette is deliberately restrained rather than stylized; its power comes from the contrast between warm skin tones and cool ambient. Most effective for documentary, journalism, social impact, and humanist brand contexts.",
      promptWords: [
        "documentary photography palette in desaturated teal and warm skin",
        "observational cinema color grade in muted cool and amber",
        "humanist editorial palette in cool gray and apricot",
      ],
      useCases: ["Documentary and journalism", "Social impact brands", "Humanist editorial"],
    },
  ),
  createCollection(
    "monsoon-season",
    "Monsoon Season",
    "Deep jade, warm gray rain, amber soil, and vivid yellow-green — the palette of tropical rainfall and lush post-storm vegetation.",
    "The color world of monsoon: deep jade canopy saturated by rainfall, the warm gray of heavy cloud cover, amber earth after the first rains, and the brief vivid lime of new growth pushing through. A palette of moisture, abundance, and natural intensity.",
    ["Tropical", "Nature", "Intense"],
    [
      "jade-shadow-clear",
      "emerald-tone-muted",
      "warm-gray-shadow",
      "amber-bloom-muted",
      "lime-core-vivid",
      "moss-tone-muted",
    ],
    {
      editorialNote:
        "Monsoon Season captures the saturation of tropical environments during and after heavy rainfall — the deepened greens, the warm gray overcast, the brief lime flash of new growth against wet amber soil. The palette works best with the lime used sparingly as an accent against the deeper greens and warm gray. Effective for tropical travel, sustainability brands, and agricultural contexts.",
      promptWords: [
        "tropical monsoon palette in deep jade and warm gray",
        "post-storm vegetation in emerald and lime green",
        "rainy season color story in green and amber earth",
      ],
      useCases: ["Tropical travel brands", "Sustainability and environmental", "Agricultural and food"],
    },
  ),
];

collections.push(...extraCollections36);

const extraCollections37: ColorCollection[] = [
  createCollection(
    "art-deco-gold",
    "Art Deco Gold",
    "Rich gold, jet black, ivory cream, and deep jewel tones — the opulent geometric palette of the Jazz Age.",
    "The color vocabulary of Art Deco in its purest form: the warm antique gold of gilt frames and embossed metalwork, jet black for contrast and drama, ivory cream for background warmth, and deep jewel accents (emerald, garnet, violet) arranged in precise geometric fields. The palette of 1920s luxury, cinema palaces, and the confidence of the modern world discovering itself.",
    ["Art Deco", "Luxury", "Historical", "Gold"],
    [
      "honey-shadow-clear",
      "true-gray-shadow",
      "honey-whisper-soft",
      "emerald-shadow-vivid",
      "garnet-shadow-clear",
      "violet-shadow-muted",
    ],
    {
      editorialNote:
        "Art Deco Gold draws from the three historical sources of Art Deco chromatics: Egyptian Revival gold and black, East Asian lacquerware jewel tones, and machine-age metallic contrast. The palette requires bold geometric application to read as Art Deco rather than generic luxury — the colors are not sufficient alone, the geometric precision of their application is equally important. Effective for luxury packaging, hotel and hospitality branding, jewelry and fashion.",
      promptWords: [
        "Art Deco luxury brand in gold and jet black geometric",
        "1920s jazz age palette in antique gold and emerald",
        "hotel lobby design in gold black and deep jewel tones",
      ],
      useCases: ["Luxury brand identity", "Hotel and hospitality design", "Jewelry and fashion packaging"],
    },
  ),
  createCollection(
    "atomic-pastels",
    "Atomic Pastels",
    "Mint green, coral pink, butter yellow, powder blue — the mid-century American pastel palette of 1950s atomic age optimism.",
    "The color world of the 1950s suburban ideal: mint green appliances, coral pink dinette sets, butter yellow kitchens, powder blue automobiles. The postwar American consumer palette that performed optimism through soft color, made possible by new synthetic dyes and mass consumer prosperity. A palette that carries both genuine warmth and its era's specific atomic-age tension.",
    ["Mid-Century", "1950s", "Pastels", "Retro"],
    [
      "mint-bloom-muted",
      "coral-bloom-soft",
      "honey-whisper-muted",
      "cerulean-bloom-soft",
      "true-gray-tone",
      "amber-veil-soft",
    ],
    {
      editorialNote:
        "Atomic Pastels captures the specific 1950s American palette — distinct from generic pastels by its particular combination of colors and their medium-soft saturation (not faded, not vivid). The palette works as a complete system: using individual colors without the full set loses the mid-century specificity. Most effective in retro-themed applications, diner branding, packaging with vintage nostalgia, and editorial contexts that knowingly reference the era's complex optimism.",
      promptWords: [
        "1950s American diner branding in mint and coral pastel",
        "mid-century modern palette in butter yellow and powder blue",
        "atomic age design in pastel mint coral and charcoal",
      ],
      useCases: ["Retro branding and packaging", "Diner and food service", "Vintage-inspired product design"],
    },
  ),
  createCollection(
    "harvest-earth",
    "Harvest Earth",
    "Harvest gold, avocado green, burnt orange, chocolate brown — the warm earth tone palette of 1970s organic design.",
    "The color world of the 1970s: harvest gold catching afternoon light, avocado green of kitchen tile, burnt orange of macramé and sunset, chocolate brown of wood paneling and leather. The decade's most distinctive aesthetic — simultaneously the product of environmental consciousness, synthetic dye availability, and a cultural retreat from 1960s chromatic intensity into natural warmth.",
    ["Earth Tones", "1970s", "Warm", "Organic"],
    [
      "amber-tone-vivid",
      "olive-tone-clear",
      "ember-tone-vivid",
      "ember-shadow-muted",
      "honey-tone-muted",
      "moss-tone-clear",
    ],
    {
      editorialNote:
        "Harvest Earth is a historically specific palette — these colors together immediately evoke the 1970s. Used knowingly, they carry warmth, organic quality, and a specific retro character. Used without awareness, they risk reading as dated. The contemporary update (desaturate by 15-20%, increase lightness slightly) produces the 'warm minimalist' version that dominated 2020s interiors without the decade-specificity. Both approaches are valid for different applications.",
      promptWords: [
        "1970s earth tone palette in harvest gold and avocado green",
        "warm organic design in burnt orange and chocolate brown",
        "retro autumn palette in amber olive and rust",
      ],
      useCases: ["Retro and vintage branding", "Warm interior and lifestyle brands", "Autumn and harvest seasonal design"],
    },
  ),
  createCollection(
    "y2k-chrome",
    "Y2K Chrome",
    "Baby pink, ice blue, chrome silver, digital lime, Y2K orange — the translucent, candy-colored palette of early 2000s optimism.",
    "The color world of Y2K: baby pink velour and bubblegum, ice blue translucent plastic, chrome silver and reflective surfaces, digital lime green of early screens, Y2K orange energy. The hyperoptimistic palette of the early 2000s — smooth surfaces, candy translucency, the visual language of a world that hadn't yet developed aesthetic complexity about technology.",
    ["Y2K", "2000s", "Retro", "Digital"],
    [
      "blush-bloom-soft",
      "cerulean-whisper-soft",
      "true-gray-bloom",
      "lime-core-vivid",
      "coral-tone-vivid",
      "blush-veil-soft",
    ],
    {
      editorialNote:
        "Y2K Chrome captures the specific early-2000s aesthetic that revived strongly in 2020-2023 — baby pink and ice blue with chrome silver accents, the translucent candy color of consumer technology design. The palette works for Y2K-themed fashion and music visuals, nostalgia-driven brand campaigns, and any application that wants to signal early-digital-era optimism. Use the chrome silver (light gray) as a metallic analogue rather than a neutral.",
      promptWords: [
        "Y2K aesthetic palette in baby pink ice blue and chrome",
        "early 2000s digital design in candy colors and silver",
        "millennial nostalgia brand in pink lime and Y2K orange",
      ],
      useCases: ["Y2K-themed fashion and music", "Nostalgia campaigns", "Pop culture and entertainment design"],
    },
  ),
  createCollection(
    "biophilic-calm",
    "Biophilic Calm",
    "Very peri blue-violet, sage green, terracotta, warm sand, storm blue — the introspective nature-grounded palette of the 2020s.",
    "The color world of the 2020s: Very Peri's blue-violet (Pantone 2022), the sage green of every kitchen renovation, warm terracotta and dusty rose, soft sand and cream neutrals, the storm blue of interior uncertainty. The decade's longing for the natural, the grounded, the calm — a palette formed during lockdown and still evolving as the decade processes its particular combination of anxiety and renewal.",
    ["Biophilic", "2020s", "Contemporary", "Calm"],
    [
      "iris-tone-muted",
      "leaf-bloom-muted",
      "coral-tone-muted",
      "apricot-whisper-muted",
      "cobalt-tone-muted",
      "amber-whisper-muted",
    ],
    {
      editorialNote:
        "Biophilic Calm is a contemporary palette in the process of becoming historical — we are still within the decade that formed it. The blue-violet (approximating Very Peri) paired with sage green, terracotta, and warm neutrals represents the 2020s' characteristic emotional register: seeking groundedness and natural connection after disruption. Most effective for wellness, interior design, botanical products, and any brand that wants to signal contemporary but not trend-chasing design awareness.",
      promptWords: [
        "2020s biophilic design in sage green and terracotta",
        "contemporary calm palette in periwinkle and warm sand",
        "modern organic brand in blue-violet and natural tones",
      ],
      useCases: ["Wellness and mindfulness brands", "Contemporary interior and home design", "Botanical and natural products"],
    },
  ),
];

collections.push(...extraCollections37);

const extraCollections38: ColorCollection[] = [
  createCollection(
    "restaurant-warmth",
    "Restaurant Warmth",
    "Deep reds, terracotta, and amber — the appetite-stimulating palette of successful dining spaces.",
    "A palette built on the colors that food research consistently associates with warmth, appetite, and social dining energy. Ember orange, garnet red, and amber gold create the visual heat that signals good food and convivial atmosphere.",
    ["Warm", "Food", "Interior"],
    [
      "ember-core-vivid",
      "garnet-velvet-soft",
      "amber-core-vivid",
      "coral-tone-soft",
      "merlot-dusk-muted",
    ],
    {
      editorialNote:
        "Use this when the brief calls for appetite, warmth, and social energy. Works for restaurant brands, food-adjacent products, and any context where warmth and invitation are the primary emotional goals.",
      promptWords: [
        "candle-lit dining room in deep red and amber",
        "restaurant warmth in terracotta and ember",
        "Italian trattoria palette in garnet and gold",
      ],
      useCases: ["Restaurant branding and interiors", "Food and beverage packaging", "Hospitality design"],
    },
  ),
  createCollection(
    "dark-mode-foundation",
    "Dark Mode Foundation",
    "A layered dark surface system in deep cobalt-gray — built for interfaces, not decoration.",
    "Dark mode requires surface layering (not just black) and carefully desaturated accent colors. This palette provides the base layer system: near-black backgrounds, dark mid-surfaces, and a single structured blue for hierarchy and interactive states.",
    ["Dark", "UI", "Tech"],
    [
      "cobalt-ink-muted",
      "cobalt-nocturne-muted",
      "cobalt-shadow-muted",
      "cobalt-dusk-muted",
      "cobalt-core-vivid",
    ],
    {
      editorialNote:
        "A dark interface foundation palette that moves from near-black ink through structured dark layers to an active cobalt. Avoids true black in favor of dark blue-gray surfaces with depth.",
      promptWords: [
        "dark mode interface in deep cobalt and near-black",
        "engineering tool dark theme in slate and cobalt",
        "night mode dashboard in structured dark blue-gray",
      ],
      useCases: ["Developer tools and IDEs", "Data dashboards in dark theme", "Technical product launch pages"],
    },
  ),
  createCollection(
    "institutional-trust",
    "Institutional Trust",
    "The navy, cobalt, and cool-gray system that powers financial, healthcare, and government branding.",
    "This palette distills the color logic of institutional credibility: deep navy anchor, structured cobalt, and calibrated cool grays. Use it when the product's primary value proposition is reliability, stability, and competence rather than excitement or novelty.",
    ["Corporate", "Blue", "Neutral"],
    [
      "cobalt-ink-muted",
      "cobalt-dusk-muted",
      "cobalt-core-vivid",
      "cool-gray-tone",
      "cool-gray-pearl",
    ],
    {
      editorialNote:
        "The color system of institutions that have to be trusted. Not exciting, not warm — stable, clear, and competent. A strong choice when the brief is 'our clients need to trust us with serious things.'",
      promptWords: [
        "financial institution branding in navy and cobalt",
        "healthcare system brand in cobalt and cool gray",
        "government agency identity in deep blue and structured gray",
      ],
      useCases: ["Financial services branding", "Healthcare and insurance systems", "Government and civic design"],
    },
  ),
  createCollection(
    "appetite-vivid",
    "Appetite Vivid",
    "Red, orange, citrine — the high-saturation palette of fast food, snack brands, and food energy.",
    "The appetite palette in its full-saturation form: bright crimson, vivid ember orange, sharp amber, fresh coral. These are the colors that food packaging research consistently links to impulse purchase, appetite stimulation, and fast consumption — energetic, immediate, and hard to ignore.",
    ["Vivid", "Food", "Energy"],
    [
      "crimson-core-vivid",
      "ember-tone-vivid",
      "amber-tone-vivid",
      "coral-core-vivid",
      "citrine-tone-vivid",
    ],
    {
      editorialNote:
        "Maximum appetite energy. For fast food, snacks, beverage brands, food apps, and any product where the goal is immediate craving rather than considered appreciation.",
      promptWords: [
        "fast food brand palette in red and orange",
        "snack packaging in vivid ember and crimson",
        "food app UI in bright coral and amber",
      ],
      useCases: ["Fast food and quick service restaurants", "Snack food packaging", "Food delivery and ordering apps"],
    },
  ),
  createCollection(
    "editorial-monochrome",
    "Editorial Monochrome",
    "Near-black ink, structured grays, and a single warm-white — for typography-first design.",
    "A true monochrome editorial palette for design where typography is the primary visual element. Deep ink black, three structured gray steps, and a warm near-white provide all the hierarchy needed for publishing, writing tools, and editorial layouts without reaching for color.",
    ["Editorial", "Neutral", "Typography"],
    [
      "cool-gray-ink",
      "cool-gray-shadow",
      "cool-gray-tone",
      "cool-gray-tone",
      "cool-gray-whisper",
    ],
    {
      editorialNote:
        "For interfaces and editorial layouts where color is a distraction. Typography, whitespace, and weight carry all the hierarchy. A deliberate choice that signals seriousness and restraint.",
      promptWords: [
        "editorial magazine layout in ink and warm white",
        "writing tool interface in structured gray",
        "publishing brand in near-black and cool white",
      ],
      useCases: ["Writing and publishing tools", "Editorial and magazine layouts", "Typography-first brand systems"],
    },
  ),
];

collections.push(...extraCollections38);

const extraCollections39: ColorCollection[] = [
  createCollection(
    "runway-neutrals",
    "Runway Neutrals",
    "The understated palette that anchors every fashion season — camel, ivory, charcoal, and warm taupe.",
    "Fashion neutrals are not colorless — each one has a precise undertone that determines what it can and cannot work with. This palette collects the warm neutrals that recur in editorial fashion: camel, ivory, warm taupe, and the soft white that works against warm skin tones.",
    ["Warm", "Neutral", "Fashion"],
    [
      "amber-whisper-soft",
      "apricot-whisper-soft",
      "amber-silk-soft",
      "amber-tone-soft",
      "amber-velvet-soft",
    ],
    {
      editorialNote:
        "Warm fashion neutrals that share undertone and combine easily. This palette works for editorial fashion photography, luxury brand identities, and lifestyle products positioned at a fashion-forward audience.",
      promptWords: [
        "fashion editorial in warm camel and ivory",
        "luxury fashion lookbook in warm neutrals",
        "autumn wardrobe in camel and taupe",
      ],
      useCases: ["Fashion brand identity", "Editorial photography styling", "Luxury lifestyle product branding"],
    },
  ),
  createCollection(
    "spring-editorial",
    "Spring Editorial",
    "Fresh pastels with warm undertones — the editorial palette for spring launches and seasonal design.",
    "Spring editorial color is not candy-bright — it is soft, slightly warm, and precisely balanced. Blush, peach, warm sage, and butter yellow create a fresh palette that avoids the infantile quality of full-saturation pastels.",
    ["Pastel", "Warm", "Spring"],
    [
      "blush-whisper-muted",
      "apricot-pearl-soft",
      "leaf-bloom-muted",
      "citrine-tone-muted",
      "coral-bloom-muted",
    ],
    {
      editorialNote:
        "Warm-toned spring pastels with editorial restraint. Works for beauty brand spring launches, lifestyle product photography, and any creative direction that needs freshness without childlike energy.",
      promptWords: [
        "spring beauty editorial in blush and peach",
        "warm pastel product photography for spring launch",
        "spring capsule wardrobe in soft pastels",
      ],
      useCases: ["Spring product launches", "Beauty brand seasonal campaigns", "Fashion editorial"],
    },
  ),
  createCollection(
    "scandi-winter",
    "Scandi Winter",
    "The Nordic minimalist palette of ice blue, birch gray, and warm white that defines Scandinavian winter design.",
    "Scandinavian winter design is not cold — it is specifically about the warmth found inside cool surroundings. Warm birch white, cool ice blue, and structured gray with a single amber accent create the hygge palette that defines Nordic interiors and design.",
    ["Cool", "Minimal", "Nordic"],
    [
      "cobalt-whisper-soft",
      "azure-mist-muted",
      "cerulean-whisper-muted",
      "cool-gray-whisper",
      "amber-tone-soft",
    ],
    {
      editorialNote:
        "A Scandinavian winter palette with the precise coolness and quiet warmth of Nordic design. Useful for home goods, winter lifestyle brands, and design system projects with a clean, minimal visual voice.",
      promptWords: [
        "Scandinavian interior design in birch and ice blue",
        "Nordic winter home goods in cool gray and white",
        "hygge lifestyle in warm white and cool neutrals",
      ],
      useCases: ["Scandinavian-inspired home goods brands", "Winter lifestyle product photography", "Minimal design system UI"],
    },
  ),
  createCollection(
    "capsule-cool",
    "Capsule Cool",
    "Navy, cool white, and slate — the cool-toned capsule wardrobe system for design and fashion.",
    "Cool-toned wardrobes anchor in navy and cool white rather than black and ivory. This palette collects the cool neutrals that combine naturally: navy, slate, cool-white, soft dove, and a single cool accent in sage-teal.",
    ["Cool", "Neutral", "Fashion"],
    [
      "cobalt-ink-muted",
      "cobalt-shadow-muted",
      "cool-gray-whisper",
      "cobalt-whisper-soft",
      "teal-tone-muted",
    ],
    {
      editorialNote:
        "Cool-toned neutrals anchored by navy ink and punctuated by a single teal accent. Designed for contexts that need sophisticated restraint — fashion editorials, professional branding, and minimal product photography.",
      promptWords: [
        "cool minimal wardrobe in navy and white",
        "professional editorial in slate and cool gray",
        "capsule collection in structured cool neutrals",
      ],
      useCases: ["Professional brand identity", "Cool-toned fashion editorial", "Minimal product design"],
    },
  ),
  createCollection(
    "nostalgia-amber",
    "Nostalgia Amber",
    "The warm, slightly faded palette of memory — amber, sepia, warm gray, and dusty rose.",
    "Nostalgic palettes work because they are slightly desaturated and warm — they look like they've been in the light for years. Amber, soft gold, dusty rose, and warm gray create the tonal quality of old photographs and analog media without resorting to literal sepia filters.",
    ["Warm", "Vintage", "Nostalgic"],
    [
      "amber-silk-soft",
      "amber-velvet-soft",
      "blush-pearl-soft",
      "apricot-whisper-soft",
      "warm-gray-tone",
    ],
    {
      editorialNote:
        "A warm, slightly faded palette that reads as nostalgic without being literal about it. Use when the creative brief asks for memory, analog, warmth, or the particular emotional quality of things that have aged.",
      promptWords: [
        "nostalgic warm palette in amber and dusty rose",
        "vintage memory in sepia and warm gray",
        "analog aesthetic in soft gold and faded warmth",
      ],
      useCases: ["Vintage brand positioning", "Memory and storytelling campaigns", "Warm-toned editorial photography"],
    },
  ),
];
collections.push(...extraCollections39);

const extraCollections40: ColorCollection[] = [
  createCollection(
    "hotel-lobby-warmth",
    "Hotel Lobby Warmth",
    "The palette of approachable hotel lobbies — amber, honey, warm ivory, and soft coral that welcomes without intimidating.",
    "Approachable luxury hospitality color is built on amber, honey, and warm ivory — colors that photograph beautifully and read as generous rather than exclusive. This palette works for hospitality brands, lifestyle product photography, and any environment where warmth and welcome are the primary emotional goals.",
    ["Warm", "Hospitality", "Interior"],
    [
      "amber-tone-soft",
      "honey-silk-soft",
      "amber-whisper-soft",
      "coral-bloom-muted",
      "coral-veil-faint",
    ],
    {
      editorialNote:
        "Warm hospitality palette anchored in amber and honey. Works for hotel brand identities, lifestyle photography, restaurant interiors positioned at accessible luxury, and any design context where warmth is the primary signal.",
      promptWords: [
        "hotel lobby interior in warm amber and ivory",
        "luxury hospitality brand in honey and coral",
        "welcoming interior palette for boutique hotel",
      ],
      useCases: ["Hotel brand identity", "Restaurant interior color scheme", "Hospitality product photography"],
    },
  ),
  createCollection(
    "heritage-navy-anchor",
    "Heritage Navy",
    "The deep navy palette of heritage brands — navy core, deep cobalt, and slate anchored by ivory and warm neutral.",
    "Heritage brand color is built on navy as anchor. Deep, slightly complex navy paired with ivory, warm neutral, and a restrained accent creates the palette of institutions, legacy fashion brands, and family businesses with multigenerational presence.",
    ["Cool", "Heritage", "Classic"],
    [
      "cobalt-ink-muted",
      "cobalt-shadow-muted",
      "cobalt-dusk-muted",
      "cool-gray-whisper",
      "coral-veil-faint",
    ],
    {
      editorialNote:
        "Heritage brand navy palette with institutional authority. Works for financial services, heritage fashion, family businesses, and any brand identity that needs to signal longevity and trust.",
      promptWords: [
        "heritage brand identity in deep navy and ivory",
        "institutional design system in cobalt and cream",
        "classic brand palette anchored by navy",
      ],
      useCases: ["Heritage brand identity", "Financial services design", "Classic menswear brand system"],
    },
  ),
  createCollection(
    "spa-stone-calm",
    "Spa Stone",
    "The cool stone palette of wellness interiors — warm gray, pale sage, soft mist, and clean ivory that signals rest.",
    "Wellness and spa interiors use color to communicate safety, cleanliness, and calm. The palette is built on warm-leaning neutrals, pale sage, and clean ivory — saturated enough to feel alive but not energetic enough to disturb the rest state these environments are trying to create.",
    ["Neutral", "Wellness", "Calm"],
    [
      "warm-gray-whisper",
      "moss-bloom-muted",
      "cool-gray-whisper",
      "mint-veil-soft",
      "coral-veil-faint",
    ],
    {
      editorialNote:
        "Wellness and spa neutral palette with calming undertones. Works for spa brand identities, wellness product packaging, healthcare interior direction, and any context where rest and restoration are the primary emotional goals.",
      promptWords: [
        "spa interior in warm stone and sage",
        "wellness brand palette in pale neutral and mint",
        "rest-focused interior design in soft gray and ivory",
      ],
      useCases: ["Spa brand identity", "Wellness product packaging", "Healthcare interior color scheme"],
    },
  ),
  createCollection(
    "dark-editorial-night",
    "Dark Editorial",
    "Midnight editorial palette — deep ink, dark violet, shadow navy, and restrained neutral for high-fashion dark aesthetics.",
    "Dark editorial is not all-black — it is a composed system of deep values with subtle hue variation. Ink navy, deep violet, muted shadow, and a single restrained neutral create the palette of fashion editorial, luxury night environments, and premium dark brand identities.",
    ["Dark", "Editorial", "Fashion"],
    [
      "cobalt-ink-muted",
      "violet-nocturne-muted",
      "plum-shadow-muted",
      "cool-gray-ink",
      "coral-veil-faint",
    ],
    {
      editorialNote:
        "Dark editorial palette with depth and hue variation. Works for fashion editorial photography, luxury nightclub or bar brand identities, high-end cosmetics dark packaging, and any creative direction that needs darkness with sophistication rather than just black.",
      promptWords: [
        "fashion editorial in deep navy and violet",
        "luxury dark brand identity with depth and variation",
        "midnight editorial photography palette",
      ],
      useCases: ["Fashion editorial direction", "Luxury dark brand identity", "Premium nightlife venue branding"],
    },
  ),
  createCollection(
    "alpine-clarity",
    "Alpine Clarity",
    "High-altitude color — cerulean sky, clean frost white, slate gray, and a single warm accent like amber lichen.",
    "Alpine environments have a distinctive color quality: the clarity of thin air produces unusually saturated blue sky against clean white snow and gray-blue stone. This palette captures that quality — cool, high-contrast, clean — with a single warm accent that references lichen, aged wood, and golden afternoon light.",
    ["Cool", "Nature", "Clean"],
    [
      "cerulean-core-clear",
      "cerulean-whisper-muted",
      "cool-gray-tone",
      "azure-veil-soft",
      "amber-tone-soft",
    ],
    {
      editorialNote:
        "Alpine high-altitude palette with clean cool contrast. Works for outdoor brand identities, premium ski resort brands, adventure lifestyle photography, and any design context that needs clarity and altitude without aggressiveness.",
      promptWords: [
        "alpine landscape palette in cerulean and frost",
        "mountain resort brand in cool blue and clean white",
        "high-altitude outdoor lifestyle palette",
      ],
      useCases: ["Outdoor brand identity", "Ski resort visual design", "Alpine lifestyle product photography"],
    },
  ),
];

collections.push(...extraCollections40);

const extraCollections41: ColorCollection[] = [
  createCollection(
    "motion-brand-vivid",
    "Motion Brand Vivid",
    "High-energy palette for brand animation — cobalt, cyan, and electric accent on near-black, calibrated for screen motion.",
    "Animation brand palettes need colors that hold visual weight in motion without vibrating. This collection pairs cobalt and cyan with a near-black base and a warm amber accent — high contrast, low noise, designed to move. Use for brand idents, UI micro-interactions, and product launch animations.",
    ["Cool", "Motion", "Brand"],
    [
      "cobalt-tone-vivid",
      "azure-shadow-vivid",
      "teal-ink-vivid",
      "amber-core-vivid",
      "cool-gray-shadow",
    ],
    {
      editorialNote:
        "Designed for brand animation and motion graphic contexts. Cobalt and cyan create energy; amber accent provides warmth and rhythm punctuation; charcoal base prevents vibration artifacts in fast transitions.",
      promptWords: [
        "tech brand animation in cobalt and electric blue",
        "product launch motion graphic in vivid teal and amber",
        "UI animation system in high-contrast cobalt palette",
      ],
      useCases: ["Brand animation and idents", "UI micro-interaction color system", "Product launch video palette"],
    },
  ),
  createCollection(
    "natural-earth-packaging",
    "Natural Earth Packaging",
    "The earthy, unbleached palette of natural product packaging — kraft, warm neutral, sage, and muted terracotta.",
    "Natural product packaging has converged on a recognizable palette: unbleached kraft, warm gray, sage, and muted clay or terracotta. This collection captures that aesthetic honestly — these colors signal natural, thoughtful, and small-batch without irony. Works for food, cosmetics, wellness, and any brand positioning around authenticity.",
    ["Warm", "Natural", "Packaging"],
    [
      "warm-gray-tone",
      "moss-mist-muted",
      "ember-dusk-muted",
      "coral-veil-soft",
      "honey-silk-muted",
    ],
    {
      editorialNote:
        "Natural product packaging palette. Kraft neutral, sage, and muted terracotta together signal artisan, unprocessed, and authentically made — without the cliché of pure white minimalism.",
      promptWords: [
        "natural product packaging in kraft and sage",
        "artisan food brand in earthy neutral and terracotta",
        "wellness product palette in unbleached and sage",
      ],
      useCases: ["Natural food packaging", "Organic cosmetics brand identity", "Artisan product photography backgrounds"],
    },
  ),
  createCollection(
    "pediatric-calm-bright",
    "Pediatric Calm Bright",
    "Evidence-based color for children's environments — soft sky, warm green, gentle coral, and natural neutral, without institutional dullness.",
    "Healthcare and educational environments for children benefit from palettes that feel safe and natural without being institutional. This collection draws on the research consensus: soft blue-greens and warm neutrals reduce anxiety; clean, warm accents maintain visual engagement without overstimulation. The result is a palette that feels genuinely child-appropriate rather than forced-cheerful.",
    ["Warm", "Soft", "Natural"],
    [
      "azure-mist-soft",
      "moss-whisper-muted",
      "coral-bloom-soft",
      "coral-veil-faint",
      "leaf-tone-muted",
    ],
    {
      editorialNote:
        "Calibrated for children's healthcare and educational environments. Natural-associative colors reduce patient anxiety (research-supported). Also works for children's brand identity, toy packaging, and family product photography.",
      promptWords: [
        "children's healthcare interior in soft sky and sage",
        "pediatric clinic palette in natural blues and greens",
        "children's brand identity in soft coral and sky blue",
      ],
      useCases: ["Pediatric clinic interior", "Children's educational environment", "Family brand identity and packaging"],
    },
  ),
  createCollection(
    "kodachrome-memory",
    "Kodachrome Memory",
    "The warm, saturated palette of film photography nostalgia — amber-shifted reds, warm greens, and the signature golden midtones of Kodachrome stock.",
    "Kodachrome film created a characteristic palette: warm-shifted reds, golden midtones, and slightly cool, slightly blue-green shadows. This collection approximates those qualities with contemporary color values. Use for brands wanting that specific late-twentieth-century warmth without full retro pastiche.",
    ["Warm", "Vintage", "Nostalgic"],
    [
      "amber-radiant-vivid",
      "coral-core-vivid",
      "moss-tone-muted",
      "amber-core-muted",
      "ember-shadow-muted",
    ],
    {
      editorialNote:
        "Film-photography nostalgia palette calibrated on Kodachrome color characteristics. Warm reds, golden midtones, cool-leaning shadows. Works for food photography, lifestyle brands targeting 30-45 age cohort, and editorial design wanting period warmth.",
      promptWords: [
        "Kodachrome film photography color palette",
        "vintage film color grading warm and saturated",
        "nostalgic lifestyle brand in warm amber and coral",
      ],
      useCases: ["Lifestyle brand identity", "Food and recipe photography", "Editorial design with nostalgic register"],
    },
  ),
  createCollection(
    "global-celebration-red",
    "Global Celebration Red",
    "Red as celebration — the palette of Chinese New Year, South Asian weddings, and global festivity — deep vermilion, gold, and rich accent.",
    "Red as prosperity and celebration is one of the most widely shared color associations across East Asia, South Asia, and beyond. This collection pairs deep vermilion and celebration red with gold, warm accent, and a deep anchor — the palette of festivity, launch events, and brand moments that want to communicate energy and joy without Western danger associations.",
    ["Warm", "Festive", "Cultural"],
    [
      "crimson-shadow-vivid",
      "ruby-tone-vivid",
      "amber-core-vivid",
      "amber-veil-faint",
      "crimson-shadow-muted",
    ],
    {
      editorialNote:
        "Celebration red palette calibrated for positive cultural associations — prosperity, festivity, and joy. Works for brands launching into East and South Asian markets, cultural event design, and any brand identity wanting red's energy without danger association.",
      promptWords: [
        "Chinese New Year brand palette in red and gold",
        "celebration event design in crimson and amber",
        "festive brand identity in deep red and warm gold",
      ],
      useCases: ["Cultural celebration event design", "Brand identity for East/South Asian markets", "Product launch visual identity"],
    },
  ),
];

collections.push(...extraCollections41);

const extraCollections42: ColorCollection[] = [
  createCollection(
    "spring-blossom-fresh",
    "Spring Blossom Fresh",
    "Soft spring pastels — cherry blossom pink, tender mint, morning sky blue, and delicate orchid for seasonal campaigns.",
    "A high-lightness spring palette built from the season's most distinctive natural references: cherry blossom, new leaf mint, forsythia yellow, morning sky blue, and wisteria orchid. Every color shares the slightly milky, diffuse quality of spring light — moderate saturation, high lightness, never strident. Ideal for spring campaigns, beauty launches, and any brand content that needs to feel fresh, optimistic, and seasonally current.",
    ["Spring", "Pastel", "Seasonal", "Fresh"],
    [
      "blush-bloom-soft",
      "mint-bloom-soft",
      "azure-bloom-soft",
      "orchid-pearl-soft",
      "blush-whisper-muted",
    ],
    {
      editorialNote:
        "High-lightness spring palette anchored in blossom pink and tender mint. Works for seasonal beauty campaigns, spring fashion editorials, children's product launches, and wellness brands positioning around renewal.",
      promptWords: [
        "spring campaign visuals in blossom pink and mint",
        "cherry blossom brand identity",
        "seasonal beauty launch in pastel spring palette",
      ],
      useCases: ["Spring marketing campaigns", "Seasonal beauty packaging", "Children's brand seasonal content"],
    },
  ),
  createCollection(
    "summer-coastal-vivid",
    "Summer Coastal Vivid",
    "Bold summer energy — sunset coral, sea-glass teal, sol yellow, and deep sapphire for travel and lifestyle brands.",
    "Full-saturation summer coastal palette anchored in sunset coral and sea-glass teal — the colors of warm water, ripe fruit, and directional sun. The deep sapphire grounds the palette and prevents the vivid hues from reading as noise. Works at maximum visual energy for summer campaigns, festival events, travel brands, and any context where confident, joyful color is the goal.",
    ["Summer", "Coastal", "Vivid", "Tropical"],
    [
      "coral-bloom-vivid",
      "teal-tone-vivid",
      "amber-bloom-vivid",
      "sapphire-shadow-clear",
      "coral-mist-soft",
    ],
    {
      editorialNote:
        "Maximum-energy summer palette. Works for travel and tourism brands, summer beverage campaigns, festival event identity, sportswear seasonal drops, and youth lifestyle content.",
      promptWords: [
        "summer coastal brand in coral and teal",
        "tropical travel campaign palette",
        "outdoor summer event in vivid warm colors",
      ],
      useCases: ["Summer travel campaigns", "Festival event branding", "Outdoor lifestyle product photography"],
    },
  ),
  createCollection(
    "autumn-harvest-deep",
    "Autumn Harvest Deep",
    "Rich autumn earth tones — harvest garnet, burnt ember, amber canopy, and forest jade for premium seasonal work.",
    "Deep, warm autumn palette built from the season's richest organic references: harvest garnet, burnt ember orange, amber maple canopy, October jade forest, and amber dusk bark. The cool jade anchor prevents the palette from reading as monochromatic warm, adding the depth contrast that distinguishes professional autumn color work. Works across premium food, artisan packaging, fashion editorial, and luxury brand seasonal campaigns.",
    ["Autumn", "Earthy", "Rich", "Harvest"],
    [
      "garnet-core-vivid",
      "ember-core-vivid",
      "amber-silk-vivid",
      "jade-dusk-clear",
      "amber-dusk-muted",
    ],
    {
      editorialNote:
        "Professional autumn palette anchored in garnet and jade green. Works for luxury food and beverage brands, fall fashion editorial, artisan product packaging, home goods seasonal campaigns, and hospitality autumn menus.",
      promptWords: [
        "autumn harvest campaign in garnet and amber",
        "fall luxury food brand in earth tones",
        "artisan packaging in warm seasonal palette",
      ],
      useCases: ["Autumn food and beverage campaigns", "Fall fashion editorial", "Artisan product packaging"],
    },
  ),
  createCollection(
    "winter-jewel-nocturnal",
    "Winter Jewel Nocturnal",
    "Deep winter jewels — midnight indigo, crimson ember, evergreen jade, and candlelight amber on a dark base.",
    "High-contrast winter jewel palette for holiday, premium, and nocturnal design contexts. Midnight indigo and deep jade anchor the palette in depth; crimson and candlelight amber provide the festive warm accents that lift against the dark base. This is the color of candlelit evenings, frost windows, and premium holiday packaging — maximum value contrast with saturated jewel accents that read as rich rather than harsh.",
    ["Winter", "Jewel", "Holiday", "Deep"],
    [
      "indigo-shadow-vivid",
      "crimson-core-vivid",
      "jade-dusk-clear",
      "amber-silk-vivid",
      "blush-whisper-muted",
    ],
    {
      editorialNote:
        "Premium winter and holiday palette. Works for holiday gift packaging, luxury retail seasonal campaigns, festive event identity, premium spirits and gifting brands, and dark-mode product interfaces.",
      promptWords: [
        "holiday luxury packaging in indigo and crimson",
        "winter brand campaign in deep jewel tones",
        "festive premium identity in amber and forest green",
      ],
      useCases: ["Holiday gift packaging", "Luxury seasonal campaigns", "Festive event identity"],
    },
  ),
  createCollection(
    "winter-ice-minimal",
    "Winter Ice Minimal",
    "Crisp winter ice palette — pale azure, frost cerulean, cobalt depth, and whisper sapphire for precision and Nordic brands.",
    "The cool, crystalline register of winter — pale azure blue, frost cerulean, deep cobalt, and whisper sapphire. This is not the festive register of winter color but the austere clarity register: the palette of precision instruments, Nordic design, premium skincare, and technology brands seeking authority through restraint. Every color has high lightness and low-to-moderate saturation with a cool shift that reads as cold, exact, and uncompromising.",
    ["Winter", "Ice", "Minimal", "Nordic"],
    [
      "azure-bloom-soft",
      "cerulean-bloom-soft",
      "cobalt-mist-soft",
      "sapphire-pearl-soft",
      "azure-whisper-soft",
    ],
    {
      editorialNote:
        "Cool, minimal winter palette. Works for technology product launches, premium skincare and fragrance, Nordic lifestyle brands, medical and precision equipment, and high-end digital product interfaces targeting premium audiences.",
      promptWords: [
        "Nordic winter brand identity in ice blue and frost",
        "premium technology palette in cool minimal tones",
        "luxury skincare in azure and cerulean palette",
      ],
      useCases: ["Technology brand identity", "Nordic lifestyle product photography", "Premium skincare and fragrance"],
    },
  ),
];

collections.push(...extraCollections42);

const extraCollections43: ColorCollection[] = [
  createCollection(
    "logo-brand-primary-bold",
    "Logo Brand Primary Bold",
    "High-distinctiveness single-anchor brand palettes for logo and primary identity use — cobalt, garnet, and deep emerald with neutral counterparts.",
    "Three single-anchor brand palettes designed for logo and primary identity work. Each pairs a distinctive, highly saturated anchor color with neutral counterparts that support it at every scale and reproduction context. These palettes prioritize cross-media reproduction fidelity and distinctiveness over complexity — a single dominant hue that can function as a proprietary color with sustained use. Chosen for maximum gamut compatibility between RGB, CMYK, and Pantone production contexts.",
    ["Brand Identity", "Logo Design", "Bold", "Proprietary Color"],
    [
      "cobalt-core-vivid",
      "cobalt-shadow-clear",
      "indigo-nocturne-vivid",
      "amber-whisper-faint",
      "garnet-core-vivid",
    ],
    {
      editorialNote:
        "Bold single-anchor palettes for logo and brand identity work. Each anchor color is chosen for high cross-media reproduction fidelity and category distinctiveness. Suitable for startups and established brands establishing or refreshing a proprietary brand color.",
      promptWords: [
        "bold brand identity with cobalt anchor color",
        "distinctive logo color palette for technology brand",
        "garnet brand identity for premium services",
      ],
      useCases: ["Brand identity design", "Logo color system", "Brand guidelines"],
    },
  ),
  createCollection(
    "warm-photo-grade",
    "Warm Photo Grade",
    "Cinematic warm color grading palette — amber-gold highlights, warm ivory midtones, and teal-shifted shadow for split-tone photography.",
    "The classic warm cinematic grade palette used in food, lifestyle, and portrait photography. Amber and honey in the highlights, warm ivory for midtones, and a subtle cool-teal in deep shadows to create the split-tone warmth-coolness opposition that gives images depth and dimension. This is the palette of artisan food photography, lifestyle brand content, and editorial portrait work — not the desaturated amber-and-teal of action cinema, but the softer, richer version optimized for still photography and brand imagery.",
    ["Photography", "Warm Grade", "Cinematic", "Color Grading"],
    [
      "amber-tone-soft",
      "honey-bloom-soft",
      "apricot-bloom-soft",
      "amber-whisper-faint",
      "teal-mist-soft",
    ],
    {
      editorialNote:
        "Warm photography grade palette for food, lifestyle, and portrait work. Amber-gold highlights, warm ivory midtones, and subtle teal in shadows. Essential reference for photo retouchers and art directors working in warm brand registers.",
      promptWords: [
        "warm cinematic grade food photography palette",
        "golden hour lifestyle photography color palette",
        "artisan food photography warm amber tones",
      ],
      useCases: ["Food photography", "Lifestyle brand content", "Portrait photography grade reference"],
    },
  ),
  createCollection(
    "social-content-vivid-feed",
    "Social Content Vivid Feed",
    "High-saturation, high-contrast palette for social media content — coral, vivid cobalt, citrine, and strong emerald optimized for feed scroll-stop performance.",
    "Deliberately vivid palette engineered for performance in algorithmic social media feeds where each post competes independently for attention. High saturation, high contrast, strong color identity. Coral and vivid cobalt are the anchor pair — a warm-cool opposition that creates maximum visual energy. Citrine and emerald provide secondary contrast. Designed for acquisition content and wide-reach posts where initial scroll-stop rate matters more than ambient mood. Not a sustained-use palette — rotate with a moderated variant for retention content.",
    ["Social Media", "Content Design", "Vivid", "High Contrast"],
    [
      "coral-core-vivid",
      "cobalt-core-vivid",
      "citrine-core-vivid",
      "emerald-core-vivid",
      "fuchsia-core-vivid",
    ],
    {
      editorialNote:
        "High-saturation social media feed palette for scroll-stop performance. Coral, cobalt, citrine, and emerald — the maximum-contrast palette for acquisition and reach content. Pair with a moderated variant for retention content targeting existing audiences.",
      promptWords: [
        "vivid social media content palette for Instagram feed",
        "high contrast social media brand colors",
        "bold content creator palette for feed performance",
      ],
      useCases: ["Social media content design", "Paid social creative", "Content creator branding"],
    },
  ),
  createCollection(
    "information-hierarchy-clear",
    "Information Hierarchy Clear",
    "Three-level information design palette — vivid cobalt primary, teal secondary, soft azure tertiary, with near-neutral for labels and ink for text.",
    "Purpose-built for information design and data visualization contexts where color must signal reading hierarchy rather than just identify categories. Vivid cobalt as the primary attention anchor (key findings, alerts, callouts), teal as secondary (supporting data, comparison series), azure whisper as tertiary (labels, reference lines, background structure), and ink for all text. A clear three-step hierarchy that gives dense data displays a legible visual structure and makes the most important information immediately findable.",
    ["Information Design", "Data Visualization", "Hierarchy", "Dashboard"],
    [
      "cobalt-core-vivid",
      "teal-core-vivid",
      "azure-bloom-soft",
      "azure-whisper-soft",
      "indigo-nocturne-vivid",
    ],
    {
      editorialNote:
        "Three-level hierarchy palette for dashboards, reports, and data visualizations. Cobalt primary (key findings), teal secondary (supporting data), azure tertiary (labels/gridlines), ink for text. Designed for functional visual hierarchy rather than aesthetic cohesion.",
      promptWords: [
        "data visualization palette with clear hierarchy levels",
        "dashboard color system for three-tier hierarchy",
        "information design palette for reports and charts",
      ],
      useCases: ["Dashboard design", "Data visualization", "Annual report design"],
    },
  ),
  createCollection(
    "botanical-apothecary-dark",
    "Botanical Apothecary Dark",
    "Dark botanical identity palette — deep emerald, moss, jade, violet plum, and warm ivory for herbalist, apothecary, and botanical luxury brands.",
    "The dark botanical register — deep, saturated greens with enough depth to feel medicinal and earthy, paired with violet-plum for drama and warm ivory as the single light counterpoint. This is not the light, airy botanical palette of wellness startups; it is the darker, more serious register of apothecaries, herbal medicine brands, botanical perfumers, and luxury plant-based brands that want to communicate expertise and depth over approachability. Emerald and jade carry the botanical identity; violet and plum add the alchemical, mysterious register; ivory anchors it without lightening it.",
    ["Botanical", "Apothecary", "Dark", "Luxury"],
    [
      "emerald-shadow-clear",
      "moss-shadow-soft",
      "jade-shadow-clear",
      "violet-shadow-clear",
      "amber-whisper-faint",
    ],
    {
      editorialNote:
        "Dark botanical apothecary palette. Deep emerald, moss, jade, violet, and ivory. For herbalist, botanical perfume, luxury plant-based, and apothecary brands that want depth and expertise over lightness.",
      promptWords: [
        "dark botanical apothecary brand palette",
        "herbalist luxury brand in deep emerald and violet",
        "botanical perfume identity in dark green and plum",
      ],
      useCases: ["Apothecary brand identity", "Botanical luxury packaging", "Herbalist product design"],
    },
  ),
];

collections.push(...extraCollections43);

const extraCollections44: ColorCollection[] = [
  createCollection(
    "dark-mode-ui-surfaces",
    "Dark Mode UI Surfaces",
    "A systematic dark mode surface palette — near-black, dark gray, elevated surface, and accent tones for building complete dark UI color systems.",
    "Dark mode surface palette designed around the layered elevation system used by iOS, Android Material, and premium web applications. Near-black base, progressively lighter gray surfaces for elevation, with a restrained accent blue and high-legibility text tones. Built around the principle that true black backgrounds amplify saturation — all surfaces use dark gray to keep foreground colors perceptually controlled. Suitable for design system dark mode token definitions.",
    ["Dark Mode", "UI Design", "Design Systems", "Night Mode"],
    [
      "indigo-nocturne-vivid",
      "indigo-shadow-soft",
      "indigo-mist-soft",
      "cool-gray-core",
      "cobalt-bloom-soft",
    ],
    {
      editorialNote:
        "Layered dark mode surface palette following iOS and Material Design elevation principles. Near-black to dark-gray range for surface hierarchy, with cobalt accent. Useful for design token documentation and dark UI component design.",
      promptWords: [
        "dark mode UI surface color system",
        "dark theme design system palette",
        "night mode app interface colors",
      ],
      useCases: ["Dark mode design systems", "UI component design", "Night mode interfaces"],
    },
  ),
  createCollection(
    "aurora-borealis-vivid",
    "Aurora Borealis Vivid",
    "Vivid aurora palette — electric teal, arctic violet, ice blue, and deep night sky for high-energy brand identities and digital art.",
    "Inspired by the natural light display of the aurora borealis — vivid teal and electric cyan against deep violet-black, with ice blue as a highlight and mint as an accent. High-saturation and high-contrast by design: this palette is for brands and campaigns that want to communicate natural wonder, energy, and premium digital sophistication. Effective for gaming, tech, and experiential brand identities.",
    ["Nature", "Vivid", "Electric", "Night"],
    [
      "teal-core-vivid",
      "mint-core-vivid",
      "azure-core-vivid",
      "violet-core-vivid",
      "indigo-nocturne-vivid",
    ],
    {
      editorialNote:
        "High-saturation aurora palette for brand identities that want vivid natural energy. Teal and violet anchored in deep night. Strong for gaming, tech, and premium digital brand applications.",
      promptWords: [
        "aurora borealis color palette vivid",
        "northern lights electric teal violet palette",
        "arctic night vivid brand palette",
      ],
      useCases: ["Gaming brand identity", "Tech brand design", "Digital art and illustration"],
    },
  ),
  createCollection(
    "warm-architectural-interior",
    "Warm Architectural Interior",
    "A residential interior palette — warm ivory walls, honey wood tones, amber accents, and warm gray for a cohesive living space.",
    "Residential interior palette built around the warm neutrals that define comfortable, livable spaces: warm ivory walls that shift toward cream in morning light, honey and amber tones that evoke warm wood and natural materials, with a warm gray counterbalance that reads as sophisticated without coldness. This is the palette of Japandi-influenced interiors, Nordic-warm aesthetics, and crafted residential spaces. Equally at home in home decor lookbooks, interior architecture presentations, and furniture brand imagery.",
    ["Interior Design", "Architecture", "Warm Neutrals", "Residential"],
    [
      "amber-whisper-faint",
      "honey-bloom-soft",
      "amber-tone-soft",
      "amber-mist-soft",
      "cool-gray-mist",
    ],
    {
      editorialNote:
        "Warm residential interior palette. Ivory-to-amber range with warm gray balance. Ideal for interior design presentations, home decor brands, and architectural photography art direction.",
      promptWords: [
        "warm interior design color palette",
        "residential home decor warm neutral palette",
        "Japandi interior color scheme warm",
      ],
      useCases: ["Interior design presentations", "Home decor brand design", "Residential architecture"],
    },
  ),
  createCollection(
    "data-viz-sequential-teal",
    "Data Viz: Sequential Teal",
    "A perceptually sequential teal palette for data visualization — from near-white through medium teal to deep navy, designed for quantitative color encoding.",
    "Sequential color palette for quantitative data visualization using the teal-to-navy range. Designed with perceptual uniformity in mind: each step reads as a clear increase in value from the lightest end to the darkest. The teal-to-navy range works well for both light-background and dark-background chart contexts, and the hue range is distinguishable by most types of color vision deficiency. Suitable for choropleth maps, heatmaps, and single-variable quantitative charts.",
    ["Data Visualization", "Information Design", "Sequential", "Charts"],
    [
      "teal-veil-soft",
      "teal-mist-soft",
      "teal-bloom-soft",
      "teal-core-muted",
      "teal-shadow-clear",
    ],
    {
      editorialNote:
        "Sequential teal palette for quantitative data visualization. Each step is a clear perceptual increase in value. Works on light and dark chart backgrounds. Distinguishable under common color vision deficiency types.",
      promptWords: [
        "sequential color scale data visualization teal",
        "choropleth map color palette teal",
        "data viz quantitative color encoding teal navy",
      ],
      useCases: ["Choropleth maps", "Heatmaps", "Quantitative chart color scales"],
    },
  ),
  createCollection(
    "cultural-celebration-east-asia",
    "East Asian Celebration",
    "A celebratory palette rooted in East Asian cultural color — crimson, vermilion, amber, and gold for Lunar New Year, weddings, and festive brand campaigns.",
    "Celebration palette built around the colors of East Asian festive culture: crimson red as the primary lucky color, vermilion as a warmer companion, amber and honey as gold equivalents in accessible form. These are the colors of Lunar New Year red envelopes, Chinese wedding decor, and traditional festival imagery across China, Vietnam, Korea, and the broader East Asian diaspora. Suitable for culturally relevant brand campaigns, packaging for gift products, and event design for Asian-facing markets.",
    ["Cultural", "Celebration", "Festive", "East Asian"],
    [
      "crimson-core-vivid",
      "ember-core-vivid",
      "amber-core-vivid",
      "honey-core-vivid",
      "amber-whisper-faint",
    ],
    {
      editorialNote:
        "East Asian celebration palette centered on crimson and amber. Suitable for Lunar New Year, wedding, and festive campaign design. Culturally relevant for Chinese, Vietnamese, Korean, and broader East Asian audiences.",
      promptWords: [
        "Chinese New Year color palette red gold",
        "East Asian celebration festive color palette",
        "Lunar New Year brand campaign colors",
      ],
      useCases: ["Lunar New Year campaigns", "East Asian wedding design", "Festive packaging design"],
    },
  ),
];

collections.push(...extraCollections44);

const extraCollections45: ColorCollection[] = [
  createCollection(
    "tech-brand-navy-blue",
    "Tech Brand Navy",
    "Trust-first technology palette anchored in deep cobalt with indigo depth. For SaaS, enterprise software, and developer tools.",
    "Deep navy technology palette for enterprise and SaaS brand identities. The cobalt-to-indigo progression signals institutional trust while dark neutral tones ground the composition in professional authority. Suitable for brand identity systems, product UI design, and developer tool branding where competence and reliability are the primary signals.",
    ["Technology", "SaaS", "Enterprise", "Blue", "Trust"],
    [
      "cobalt-shadow-vivid",
      "cobalt-dusk-vivid",
      "indigo-shadow-clear",
      "indigo-nocturne-soft",
      "true-gray-shadow",
      "true-gray-nocturne",
    ],
    {
      editorialNote: "Deep navy technology palette for enterprise and SaaS brand identities. The navy-to-cobalt progression signals institutional trust while the dark neutral grounds the composition in professional authority.",
      promptWords: [
        "technology brand navy blue palette",
        "SaaS enterprise color palette",
        "trust signal blue brand identity",
      ],
      useCases: ["SaaS brand identity", "Enterprise software UI", "Developer tool branding"],
    },
  ),
  createCollection(
    "ai-intelligence-violet",
    "AI Intelligence Violet",
    "Electric violet and indigo palette signaling AI capability and generative technology — differentiating from legacy technology blue.",
    "Violet-forward palette for AI and generative technology brands. Sits close enough to blue to carry trust-adjacent associations while signaling something genuinely new. The violet-to-indigo axis references imagination and advanced intelligence — the current market signal for AI products. Ideal for dark-mode-first product design systems and brand identities built around intelligent automation.",
    ["AI", "Technology", "Violet", "Indigo", "Innovation"],
    [
      "violet-shadow-vivid",
      "indigo-shadow-clear",
      "iris-dusk-vivid",
      "cobalt-shadow-clear",
      "iris-nocturne-soft",
      "true-gray-ink",
    ],
    {
      editorialNote: "Violet-forward palette for AI and generative technology brands. Differentiates from legacy technology blue while maintaining trust-adjacent associations. Ideal for dark-mode-first product design.",
      promptWords: [
        "AI brand color palette violet",
        "artificial intelligence purple indigo",
        "generative technology brand identity",
      ],
      useCases: ["AI product identity", "Machine learning platform branding", "Generative tool UI"],
    },
  ),
  createCollection(
    "healthcare-clinical-teal",
    "Healthcare Clinical Teal",
    "Clinical teal and wellness sage for healthcare, telehealth, and medical brands — the clinical warmth register.",
    "Clinical teal palette bridging medical precision and wellness warmth. The teal-to-sage-to-mint progression creates psychological safety without sacrificing clinical authority — the 'clinical warmth' register that modern digital health products need. Communicates cleanliness, competence, and calm simultaneously. Ideal for telehealth, mental health, and wellness-positioned medical products.",
    ["Healthcare", "Medical", "Teal", "Clinical", "Wellness"],
    [
      "teal-shadow-clear",
      "teal-tone-soft",
      "emerald-bloom-soft",
      "aqua-mist-soft",
      "teal-pearl-faint",
      "cool-gray-whisper",
    ],
    {
      editorialNote: "Clinical teal palette for digital health and telehealth products. The teal-to-sage progression creates psychological safety without sacrificing clinical authority.",
      promptWords: [
        "healthcare brand teal palette",
        "medical app color palette",
        "clinical wellness teal green palette",
      ],
      useCases: ["Telehealth product UI", "Medical brand identity", "Wellness app design"],
    },
  ),
  createCollection(
    "luxury-restrained-neutral",
    "Luxury Restrained Neutral",
    "Near-black, warm ivory, and muted amber — the three-color restraint palette of heritage luxury brands.",
    "The restraint-based luxury palette drawn from near-black, warm ivory, and muted champagne gold. Represents the minimum viable palette that heritage luxury brands maintain across all applications — print, digital, and packaging. Works as the foundational layer beneath a brand's signature accent color. The neutral range photographs consistently under all lighting conditions and ages without dating.",
    ["Luxury", "Fashion", "Neutral", "Restrained", "Heritage"],
    [
      "true-gray-ink",
      "warm-gray-veil",
      "amber-pearl-muted",
      "warm-gray-whisper",
      "true-gray-nocturne",
      "amber-bloom-faint",
    ],
    {
      editorialNote: "The restraint-based luxury palette: near-black, warm ivory, and muted champagne gold. For heritage luxury brands maintaining a stable, minimal palette across all applications.",
      promptWords: [
        "luxury brand black ivory gold palette",
        "premium fashion color palette",
        "heritage brand restrained palette",
      ],
      useCases: ["Luxury fashion brand identity", "Premium product packaging", "High-end hospitality design"],
    },
  ),
  createCollection(
    "outdoor-earth-forest",
    "Outdoor Earth + Forest",
    "Forest green and earth sienna palette for outdoor brands and sustainability-signaling design.",
    "Deep forest and earth palette for outdoor brands and sustainability-signaling identities. The earthy sienna grounds the forest greens in materiality, referencing bark, soil, and terrain rather than digital greens. The muted, natural character of the palette signals environmental honesty — these are colors that belong in the physical world, not invented by a brand team. Works across gear, packaging, and digital product design.",
    ["Outdoor", "Nature", "Forest", "Earth", "Sustainable"],
    [
      "emerald-shadow-clear",
      "olive-dusk-clear",
      "amber-dusk-muted",
      "moss-shadow-soft",
      "emerald-nocturne-soft",
      "warm-gray-mist",
    ],
    {
      editorialNote: "Deep forest and earth palette for outdoor brands and sustainability-signaling design. The earthy sienna grounds the forest greens in materiality, referencing bark, soil, and terrain.",
      promptWords: [
        "outdoor brand forest earth palette",
        "nature green earth color palette",
        "sustainability brand earthy palette",
      ],
      useCases: ["Outdoor gear brand identity", "Sustainability brand design", "Nature-adjacent product packaging"],
    },
  ),
  createCollection(
    "finance-authority-navy",
    "Finance Authority Navy",
    "Institutional navy and wealth forest for financial brands — conservative, authoritative, and capital-signaling.",
    "Conservative financial authority palette drawing on deep cobalt navy and emerald forest green. Colors of longevity, stability, and capital preservation — the 19th century banking aesthetic in digital form. The deep navy-to-forest green pairing references institutional banking environments (dark wood, marble, brass, green banker's lamps). Suitable for wealth management, investment platforms, and professional financial services.",
    ["Finance", "Banking", "Navy", "Authority", "Wealth"],
    [
      "cobalt-nocturne-soft",
      "cobalt-ink-faint",
      "emerald-nocturne-soft",
      "garnet-nocturne-soft",
      "amber-shadow-muted",
      "cool-gray-ink",
    ],
    {
      editorialNote: "Conservative financial authority palette: deep navy and wealth forest. Colors of longevity, stability, and capital preservation — the 19th century banking aesthetic in digital form.",
      promptWords: [
        "finance brand navy authority palette",
        "banking institution color palette",
        "investment brand conservative colors",
      ],
      useCases: ["Wealth management brand identity", "Banking product design", "Investment firm brand"],
    },
  ),
  createCollection(
    "beauty-rose-plum",
    "Beauty Rose + Plum",
    "Velvet rose and deep plum palette for cosmetics, beauty brands, and luxury skincare.",
    "Pigment-rich beauty palette from velvet rose to deep plum. The depth progression simulates the color range in color cosmetics — from sheer blush to opaque pigment — while the rose-plum axis creates a sophisticated, feminine identity with enough depth to signal premium. Works effectively in both light and dark brand contexts, and photographs beautifully in product imagery.",
    ["Beauty", "Cosmetics", "Rose", "Plum", "Feminine"],
    [
      "rose-shadow-vivid",
      "plum-dusk-clear",
      "orchid-shadow-soft",
      "rose-tone-soft",
      "plum-nocturne-soft",
      "rose-whisper-faint",
    ],
    {
      editorialNote: "Pigment-rich beauty palette from velvet rose to deep plum. The rose-plum axis creates sophisticated feminine identity with enough depth to signal premium.",
      promptWords: [
        "beauty brand rose plum palette",
        "cosmetics color palette feminine",
        "luxury skincare rose mauve palette",
      ],
      useCases: ["Beauty brand identity", "Cosmetics packaging design", "Luxury skincare product design"],
    },
  ),
  createCollection(
    "architecture-terracotta-sage",
    "Architecture Terracotta + Sage",
    "Terracotta clay and garden sage for interior design, architecture, and home brands.",
    "Material-reference interior design palette centered on terracotta and sage. References Mediterranean plaster, clay tile, and botanical greens — the dominant contemporary residential aesthetic following the retreat from all-white minimalism. These colors belong to surfaces you would want to touch: textured plaster, rough clay, aged timber, growing plants. Ideal for interior design, home furnishing, and architecture brands.",
    ["Architecture", "Interior Design", "Terracotta", "Sage", "Natural"],
    [
      "coral-dusk-soft",
      "amber-dusk-muted",
      "moss-tone-soft",
      "coral-shadow-soft",
      "olive-tone-muted",
      "warm-gray-pearl",
    ],
    {
      editorialNote: "Material-reference interior design palette centered on terracotta and sage. References Mediterranean plaster, clay tile, and botanical greens — the dominant contemporary residential aesthetic.",
      promptWords: [
        "interior design terracotta sage palette",
        "architecture earth tone palette",
        "residential color palette natural material",
      ],
      useCases: ["Interior design brand identity", "Home furnishing design", "Architectural material palette"],
    },
  ),
];

collections.push(...extraCollections45);

const extraCollections46: ColorCollection[] = [
  createCollection(
    "midnight-cobalt-violet",
    "Midnight Cobalt + Violet",
    "Deep cobalt and electric violet — the night-mode palette for AI interfaces, developer tools, and next-generation tech brands.",
    "The palette that defines contemporary AI and developer tool aesthetics: deep cobalt night, electric violet intelligence, and ink ground. This combination emerged from the intersection of dark mode design standards and the violet-as-AI-color convention that has been building since 2020. The darkness creates depth and focus; the violet signals intelligence and forward motion; the cobalt provides the familiar tech trust signal in its most refined, nocturnal form. Ideal for AI products, developer dashboards, and technology brands competing on sophistication rather than approachability.",
    ["Technology", "AI", "Dark Mode", "Violet", "Cobalt"],
    [
      "cobalt-nocturne-soft",
      "violet-nocturne-clear",
      "indigo-ink-muted",
      "iris-dusk-clear",
      "cobalt-shadow-vivid",
      "violet-shadow-soft",
    ],
    {
      editorialNote: "The AI-and-developer-tool night palette: deep cobalt, electric violet, and ink. Emerged from the convergence of dark mode standards and violet-as-AI conventions. Sophistication over approachability.",
      promptWords: [
        "AI interface dark mode palette",
        "developer tool dark color scheme",
        "technology brand cobalt violet palette",
      ],
      useCases: ["AI product interface design", "Developer tool brand identity", "Technology SaaS dark mode"],
    },
  ),
  createCollection(
    "spring-mint-blush",
    "Spring Mint + Blush",
    "Fresh mint and delicate blush for spring campaigns, beauty launches, and seasonal brand refreshes.",
    "The canonical spring palette: fresh mint, soft blush, and whisper white. These three color families define the visual grammar of spring across fashion, beauty, hospitality, and consumer brand campaigns. The mint provides the freshness signal — new growth, morning air, opened windows — while the blush delivers warmth and softness that prevents the palette from reading as clinical. The balance between cool freshness and warm softness is the technical challenge and the achievement of every successful spring campaign palette.",
    ["Spring", "Seasonal", "Mint", "Blush", "Campaign"],
    [
      "mint-whisper-soft",
      "blush-pearl-faint",
      "mint-bloom-clear",
      "rose-veil-faint",
      "seafoam-whisper-soft",
      "peony-pearl-soft",
    ],
    {
      editorialNote: "The canonical spring campaign palette: fresh mint, soft blush, and whisper white. Cool freshness balanced against warm softness — the technical and aesthetic challenge every spring campaign solves.",
      promptWords: [
        "spring color palette mint blush",
        "seasonal campaign spring colors",
        "beauty spring launch palette",
      ],
      useCases: ["Spring campaign design", "Beauty product launch", "Seasonal retail refresh"],
    },
  ),
  createCollection(
    "desert-amber-rust",
    "Desert Amber + Rust",
    "Scorched amber, terracotta rust, and sun-bleached ivory — the arid landscape palette for western brands and outdoor design.",
    "The palette of arid landscapes: amber sand, terracotta rust, and bleached ivory, with just enough sage and slate to reference desert plant life and shadow. This is not a generic earth tone palette — it is specifically structured around the light and color experience of desert environments: the golden quality of late-afternoon sun, the deep rust of sandstone cliffs, the washed-out warmth of pale caliche soil. Brands rooted in southwestern, western, or desert-influenced aesthetics — outdoor gear, artisan crafts, hospitality, and regional identity work — use this palette to signal authenticity rather than aesthetic trend.",
    ["Desert", "Southwest", "Earth Tones", "Rust", "Outdoor"],
    [
      "amber-tone-muted",
      "coral-shadow-soft",
      "ember-dusk-soft",
      "amber-silk-soft",
      "olive-dusk-muted",
      "warm-gray-pearl",
    ],
    {
      editorialNote: "Arid landscape palette: amber sand, terracotta rust, bleached ivory. Structured around desert light and color — golden afternoon, sandstone rust, pale caliche. Authentic rather than trend-driven.",
      promptWords: [
        "desert color palette amber rust",
        "southwestern earth tone palette",
        "outdoor brand western palette",
      ],
      useCases: ["Southwestern brand identity", "Outdoor gear design", "Artisan craft brand packaging"],
    },
  ),
  createCollection(
    "jewel-tones-deep",
    "Deep Jewel Tones",
    "Ruby, sapphire, and emerald at full chromatic depth — the maximalist celebration palette for festive, luxury, and editorial contexts.",
    "Jewel tones at maximum saturation and depth: ruby red, sapphire cobalt, emerald jade, and amethyst violet. These are the colors of stained glass, illuminated manuscripts, and the gemstone collections that gave them their names. As a palette they are inherently maximalist — rich, layered, and unapologetically celebratory. The challenge of working with jewel tones is maintaining harmony across hues that each carry their own strong personality. The key is consistent depth: keeping all colors in the same luminosity range prevents any single hue from dominating the palette and allows the whole to read as a coherent system.",
    ["Jewel Tones", "Luxury", "Rich Colors", "Festive", "Maximalist"],
    [
      "ruby-shadow-vivid",
      "sapphire-shadow-vivid",
      "emerald-shadow-clear",
      "violet-velvet-clear",
      "garnet-shadow-vivid",
      "teal-dusk-clear",
    ],
    {
      editorialNote: "Jewel tones at maximum depth: ruby, sapphire, emerald, amethyst. The stained-glass, illuminated-manuscript palette. Inherently maximalist — the key is maintaining consistent luminosity across all hues.",
      promptWords: [
        "jewel tones deep color palette",
        "luxury rich saturated palette",
        "festive maximalist color scheme",
      ],
      useCases: ["Festive campaign design", "Luxury editorial", "Holiday brand activation"],
    },
  ),
  createCollection(
    "nordic-minimal-frost",
    "Nordic Minimal Frost",
    "White frost, pale cerulean, and cool warm-gray for Scandinavian-influenced design systems and minimalist brands.",
    "The Nordic minimal palette: frost white, pale cerulean, and cool gray — with the specific temperature of Scandinavian winter light. This is not mere minimalism but minimalism with a climatic reference: the muted, diffuse quality of northern light filtering through cloud cover, the pale blue of midwinter sky, the warm gray of weathered birch. Nordic aesthetics in design have proven exceptionally durable because they are rooted in a specific environmental experience rather than a trend — they age as environments age, not as fashions age. Appropriate for Scandinavian brands, architectural firms, wellness contexts, and any brand identity that needs to signal restraint without sacrificing warmth.",
    ["Nordic", "Scandinavian", "Minimal", "Frost", "Cool"],
    [
      "cool-gray-whisper",
      "cerulean-veil-faint",
      "azure-pearl-faint",
      "warm-gray-veil",
      "cool-gray-mist",
      "cerulean-whisper-soft",
    ],
    {
      editorialNote: "Nordic minimal: frost white, pale cerulean, and cool gray with Scandinavian winter light. Rooted in environmental experience rather than trend — ages as environments age, not as fashions age.",
      promptWords: [
        "nordic minimal color palette",
        "scandinavian frost palette",
        "minimalist cool gray blue palette",
      ],
      useCases: ["Scandinavian brand identity", "Architectural firm branding", "Wellness brand minimalist palette"],
    },
  ),
  createCollection(
    "citrus-vivid-burst",
    "Citrus Vivid Burst",
    "Electric lime, vivid citrine, and bright coral — the maximum-energy palette for food brands, sports, and summer campaigns.",
    "Maximum energy through saturated citrus: electric lime, vivid citrine, coral, and aqua. This is the palette of summer heat, fresh produce, and high-performance product design. The citrus family shares a biological basis — these are the colors of foods at peak ripeness and energy, which gives them an inherent vitality that is difficult to achieve through any other palette strategy. In brand contexts, citrus palettes signal speed, freshness, and optimism. They are inherently high-stop-power at shelf and high-engagement in digital feed environments. The risk is oversaturation — too much citrus becomes aggressive. The solution is to anchor the palette with a single dark value (ink or deep teal) that provides contrast and prevents eye fatigue.",
    ["Citrus", "Vivid", "Summer", "Energy", "Food & Beverage"],
    [
      "lime-bloom-vivid",
      "citrine-radiant-vivid",
      "coral-radiant-vivid",
      "aqua-bloom-vivid",
      "citrine-bloom-clear",
      "lime-tone-clear",
    ],
    {
      editorialNote: "Maximum-energy citrus palette: electric lime, vivid citrine, coral, aqua. Colors of peak-ripeness produce — inherent vitality that is biologically based. Anchor with dark value to prevent eye fatigue.",
      promptWords: [
        "citrus color palette vivid bright",
        "summer energy brand palette",
        "food brand vivid citrus colors",
      ],
      useCases: ["Food brand packaging design", "Summer campaign design", "Sports nutrition brand identity"],
    },
  ),
];

collections.push(...extraCollections46);

const extraCollections47: ColorCollection[] = [
  createCollection(
    "coastal-morning-mist",
    "Coastal Morning Mist",
    "Soft coastal palette of early-morning beach light — pale azure sky, quiet teal water, seafoam on sand.",
    "Colors at their most peaceful before the day intensifies. Azure mist provides the sky tone — barely-blue, almost white. Teal pearl and seafoam pearl capture the quiet shallow water and wet sand at low tide. Cerulean whisper offers the faintest directional blue. Lagoon bloom soft is the most saturated entry, the deep-water accent. Cool gray whisper completes the palette as its neutral anchor — the color of bleached driftwood and sea-worn stone.",
    ["Coastal", "Blue", "Teal", "Serene", "Hospitality"],
    [
      "azure-mist-faint",
      "teal-pearl-soft",
      "seafoam-pearl-faint",
      "cerulean-whisper-muted",
      "lagoon-bloom-soft",
      "cool-gray-whisper",
    ],
    {
      editorialNote: "Soft coastal palette of early-morning beach light — pale azure sky, quiet teal water, seafoam on sand. Colors at their most peaceful before the day intensifies. Works for spa, coastal hospitality, and serene lifestyle branding.",
      promptWords: [
        "coastal color palette soft blue",
        "beach morning light palette",
        "spa brand muted teal blue colors",
      ],
      useCases: ["Coastal hospitality branding", "Spa and wellness design", "Lifestyle brand identity"],
    },
  ),
  createCollection(
    "autumn-harvest-warmth",
    "Autumn Harvest Warmth",
    "Rich harvest season warmth: vivid amber, ember rust, soft coral, honey gold. Colors of ripe grain and turning leaves.",
    "The palette of October agricultural abundance: amber core vivid is ripe wheat at peak light, warm and luminous; ember dusk clear is the rust of dried corn husks and autumn berries; coral tone soft provides a muted warmth between orange and pink — the color of spent pumpkin flowers; honey radiant clear adds the mid-value golden warmth of dried grasses; citrine shadow muted is the deep, grounded yellow-green of autumn's shadow side. Warm gray tone grounds everything as the palette neutral — the color of weathered barn wood.",
    ["Autumn", "Seasonal", "Warm", "Amber", "Harvest"],
    [
      "amber-core-vivid",
      "ember-dusk-clear",
      "coral-tone-soft",
      "honey-radiant-clear",
      "citrine-shadow-muted",
      "warm-gray-tone",
    ],
    {
      editorialNote: "Rich harvest season warmth: vivid amber, ember rust, soft coral, honey gold. Colors of ripe grain, turning leaves, and late-afternoon light in October. Grounded by warm gray. Seasonal without being kitsch.",
      promptWords: [
        "autumn color palette warm harvest",
        "fall brand design amber rust",
        "seasonal warm color palette October",
      ],
      useCases: ["Autumn campaign design", "Food and harvest branding", "Seasonal retail merchandising"],
    },
  ),
  createCollection(
    "pure-monochrome-system",
    "Pure Monochrome System",
    "Clean monochromatic system using the full tonal range of neutral grays with a single muted cobalt accent.",
    "The complete neutral gray system spanning from whisper-light to shadow-deep, with a single muted cobalt accent that provides just enough chromatic direction to prevent the palette from reading as uncommitted. True gray whisper and cool gray mist provide the lightest surface entries — background and card colors for high-clarity layouts. Warm gray pearl offers a barely-perceptible warmth at the pearl lightness level for natural-light interfaces. True gray tone provides the structural mid-gray. Cool gray shadow completes the depth range. Cobalt tone muted is the disciplined accent: clearly a color without being demanding.",
    ["Minimal", "Monochrome", "Gray", "Architecture", "Neutral"],
    [
      "true-gray-whisper",
      "cool-gray-mist",
      "warm-gray-pearl",
      "true-gray-tone",
      "cool-gray-shadow",
      "cobalt-tone-muted",
    ],
    {
      editorialNote: "Clean monochromatic system using the full tonal range of neutral grays with a single muted cobalt accent. Maximum typographic clarity. Architecture, luxury, and editorial brands use this palette for its confident restraint.",
      promptWords: [
        "monochrome gray palette minimal",
        "neutral palette with blue accent",
        "architectural minimal color system",
      ],
      useCases: ["Architecture firm branding", "Luxury product design", "Editorial typography system"],
    },
  ),
  createCollection(
    "botanical-foliage-study",
    "Botanical Foliage Study",
    "A naturalist's palette of botanical greens: moss and lichen through emergent leaf and emerald canopy.",
    "Built for brands and projects rooted in the natural world, this palette tracks the full spectrum of green as it appears in actual botanical observation rather than design convention. Moss bloom soft is ground-level lichen and shaded moss — the oldest, most rooted green. Leaf tone clear is mid-canopy photosynthesis green in full daylight. Olive radiant muted brings the warm, slightly golden cast of leaves seen against sun. Emerald bloom soft provides the clean, pure green of new growth. Jade dusk soft adds cooler, deeper shadow-green. Honey pearl faint completes the palette as the warm soil undertone — the color of dried straw and light-saturated earth.",
    ["Botanical", "Green", "Nature", "Sustainable", "Plant-Based"],
    [
      "moss-bloom-soft",
      "leaf-tone-clear",
      "olive-radiant-muted",
      "emerald-bloom-soft",
      "jade-dusk-soft",
      "honey-pearl-faint",
    ],
    {
      editorialNote: "A naturalist's palette of green study: moss and lichen through emergent leaf and emerald canopy. No artificial or enhanced green — all grounded in actual botanical observation. Honey pearl adds warm soil undertone. Ideal for sustainable, plant-forward brands.",
      promptWords: [
        "botanical green palette natural",
        "plant brand green color palette",
        "foliage nature color design",
      ],
      useCases: ["Sustainable brand identity", "Botanical illustration projects", "Plant-based food and product branding"],
    },
  ),
  createCollection(
    "urban-bold-contrast",
    "Urban Bold Contrast",
    "High-contrast urban palette: deep ink cobalt, vivid crimson, electric citrine — colors of city signage and street art.",
    "Built for brands that need to dominate visually in competitive environments. Cobalt ink pure is the deepest, most saturated blue possible in the archive — the color of transit authority signage and high-performance technical equipment. Crimson nocturne vivid is vivid red at its most dramatic depth — energy without aggression. Citrine bloom vivid is the electric yellow of safety systems and street art — maximum stop power. Cool gray shadow and cool gray veil provide the structural gray scale that gives the saturated colors room to breathe and assert hierarchy. The palette of urban environments at their most decisive.",
    ["Urban", "Bold", "High Contrast", "Street", "Vivid"],
    [
      "cobalt-ink-pure",
      "crimson-nocturne-vivid",
      "citrine-bloom-vivid",
      "cool-gray-shadow",
      "cool-gray-veil",
    ],
    {
      editorialNote: "High-contrast urban palette: deep ink cobalt, vivid crimson, electric citrine yellow — colors of city signage, street art, and transit systems. Clean gray scale provides the structure. Maximum stop power for brands that need to dominate visually.",
      promptWords: [
        "bold contrast color palette urban",
        "city brand color palette vivid",
        "high contrast design color system",
      ],
      useCases: ["Urban brand identity", "Street culture and streetwear", "Bold event and festival design"],
    },
  ),
  createCollection(
    "nordic-wool-warmth",
    "Nordic Wool Warmth",
    "Cozy Scandinavian hygge palette: warm wool grays, faint amber candlelight, barely-there blush and teal.",
    "The palette of interior warmth during long Nordic winters — designed for sustained exposure and maximum comfort. Warm gray pearl is the lead color: the exact tone of undyed wool, aged linen, and birch wood in low light. Amber pearl faint provides the candlelight warmth — barely there, just enough to tip the palette from cool to cozy. Blush mist faint and teal veil faint are the palette's chromatic whispers — each providing a direction without insisting. Honey mist muted adds the warm mid-tone of beeswax and dried heather. True gray whisper completes the palette as its lightest entry — the color of snow light through frosted glass.",
    ["Nordic", "Hygge", "Cozy", "Neutral", "Warm Gray"],
    [
      "warm-gray-pearl",
      "amber-pearl-faint",
      "blush-mist-faint",
      "teal-veil-faint",
      "honey-mist-muted",
      "true-gray-whisper",
    ],
    {
      editorialNote: "Cozy Scandinavian hygge palette: warm wool grays, faint amber candlelight, barely-there blush and teal. Colors of interior warmth during long dark winters — the palette of knits, wooden furniture, and natural textiles. Extremely livable and sustained over long-form exposure.",
      promptWords: [
        "nordic color palette cozy warm",
        "scandinavian hygge color design",
        "cozy home interior color palette",
      ],
      useCases: ["Home goods and textiles brand", "Interior design moodboards", "Cozy lifestyle brand identity"],
    },
  ),
];

collections.push(...extraCollections47);

const extraCollections48: ColorCollection[] = [
  createCollection(
    "editorial-black-white-red",
    "Editorial Black, White & Red",
    "Classic editorial triad: near-black ink, crisp white, and a bold primary red accent for maximum graphic impact.",
    "The most powerful graphic color system in editorial design — the three-color palette that has anchored magazine covers, fashion campaigns, and newspaper design for over a century. Cool gray nocturne provides the near-black ink anchor: rich and dark enough to read as black across media, without the flatness of pure black. True gray whisper delivers the crisp white surface. Crimson core vivid is the red — a pure, fully saturated true red at the midpoint of lightness, neither too bright nor too deep, made to dominate the palette when deployed at full saturation. Garnet shadow provides an optional deeper red for depth. Cool gray mist adds a midtone surface for panels and backgrounds.",
    ["Editorial", "Bold", "Graphic", "Magazine", "High Contrast"],
    [
      "cool-gray-nocturne",
      "true-gray-whisper",
      "crimson-core-vivid",
      "garnet-shadow-vivid",
      "cool-gray-mist",
    ],
    {
      editorialNote: "Classic editorial triad: near-black ink, crisp white, bold primary red accent. The graphic standard of fashion editorial, newspaper design, and bold brand identity for 100+ years.",
      promptWords: [
        "editorial black white red palette",
        "bold graphic design color scheme",
        "fashion magazine color palette",
      ],
      useCases: ["Fashion magazine layout", "Bold brand identity", "Newspaper and editorial design"],
    },
  ),
  createCollection(
    "mediterranean-tile-blues",
    "Mediterranean Tile Blues",
    "Ceramic blues of the Mediterranean coast: hand-painted tile indigo, sky cerulean, sea teal, and sun-bleached white.",
    "The color palette of Portuguese azulejos, Moroccan zellige tile, and Greek island ceramics — blues assembled from centuries of coastal craft tradition. Cobalt shadow vivid anchors the palette with the deep blue of hand-fired ceramic glazes, the color of traditional Portuguese tile. Cerulean bloom clear provides the mid-range sky blue of summer coastal light. Azure silk clear adds a lighter, more luminous blue for gradient variety. Teal bloom soft brings the faint green edge of shallow Mediterranean water. True gray whisper and ivory-adjacent warm gray veil complete the palette as the sun-bleached white of plastered walls.",
    ["Mediterranean", "Ceramic", "Coastal", "Blue", "Artisan"],
    [
      "cobalt-shadow-vivid",
      "cerulean-bloom-clear",
      "azure-silk-clear",
      "teal-bloom-soft",
      "warm-gray-veil",
      "true-gray-whisper",
    ],
    {
      editorialNote: "Ceramic blues of the Mediterranean — hand-painted tile indigo, sky cerulean, sea teal, bleached white. Colors of Portuguese azulejos, Moroccan zellige, Greek island ceramics.",
      promptWords: [
        "mediterranean blue palette design",
        "ceramic tile color palette",
        "coastal artisan blue color scheme",
      ],
      useCases: ["Mediterranean restaurant and hospitality", "Artisan ceramic and craft brand", "Travel and tourism identity"],
    },
  ),
  createCollection(
    "forest-dusk-palette",
    "Forest at Dusk",
    "The precise moment twilight enters a forest: deep shadow green, indigo-tinted canopy, amber last-light, and the gray of forest floor.",
    "The color of temperate forest in the thirty minutes after sunset — when color is still present but shadow is reclaiming the space. Moss nocturne provides the deep shadow green of forest canopy at the lowest light: nearly black, with just enough green to read as living rather than mineral. Indigo velvet clear adds the indigo-tinted depth of a darkening sky seen through tree cover. Emerald dusk soft delivers the mid-range forest green where some daylight still filters. Amber dusk muted is the last warm light, the color of horizontal light on tree trunks. True gray shadow carries the forest floor in dim conditions.",
    ["Forest", "Moody", "Twilight", "Dark", "Nature"],
    [
      "moss-nocturne-muted",
      "indigo-velvet-clear",
      "emerald-dusk-soft",
      "amber-dusk-muted",
      "true-gray-shadow",
    ],
    {
      editorialNote: "The precise moment twilight enters a forest: deep shadow green, indigo-tinted canopy, amber last-light, gray forest floor. For moody natural environments and dark brand identities.",
      promptWords: [
        "forest dusk dark color palette",
        "moody nature dark green palette",
        "twilight forest color scheme",
      ],
      useCases: ["Outdoor brand with dark aesthetic", "Forest and nature photography brand", "Gaming and entertainment dark UI"],
    },
  ),
  createCollection(
    "candy-pop-pastel",
    "Candy Pop Pastel",
    "High-energy candy-bright pastels: bubblegum pink, lemon yellow, sky blue, mint green, and lavender for playful brand identity.",
    "The palette of confectionery packaging, children's brand identity, and the brighter end of Y2K nostalgia — pastels at maximum cheerfulness. Blush mist soft provides the bubblegum pink: a true pastel pink with enough saturation to read as actively candy rather than merely blush. Citrine mist soft delivers lemon yellow at the boundary between pastel and vivid. Azure mist soft contributes sky blue — light, clear, and effortlessly summery. Mint mist soft adds the classic candy mint green. Iris mist soft brings lavender into the mix. True gray whisper provides the clean white between candy elements.",
    ["Candy", "Pastel", "Playful", "Y2K", "Cheerful"],
    [
      "blush-mist-soft",
      "citrine-mist-soft",
      "azure-mist-soft",
      "mint-mist-soft",
      "iris-mist-soft",
      "true-gray-whisper",
    ],
    {
      editorialNote: "High-energy candy-bright pastels: bubblegum pink, lemon, sky blue, mint, lavender. Maximum cheerfulness — for confectionery, children's brands, and Y2K nostalgia aesthetics.",
      promptWords: [
        "candy pastel color palette",
        "playful bright pastel palette",
        "y2k pastel color scheme",
      ],
      useCases: ["Confectionery and candy brand", "Children's products and entertainment", "Playful digital product and app UI"],
    },
  ),
  createCollection(
    "retro-americana-palette",
    "Retro Americana",
    "Mid-century American diner and roadside culture: cherry red, chrome silver, turquoise teal, mustard yellow, and cream.",
    "The color palette of 1950s American roadside culture — the colors of chrome diners, drive-ins, roadside motels, and the optimistic mass consumer culture of postwar America. Crimson core vivid provides the cherry red of vinyl booth seating and neon signage. Teal bloom clear delivers the turquoise of period appliances and motel signage. Amber tone muted gives the mustard yellow of mid-century tile and signage backgrounds. Warm gray pearl is the cream of Formica countertops and menu cards. Cool gray whisper delivers the chrome silver of diner surfaces and chrome trim. These five colors, assembled, reconstruct the visual language of American diner culture with documentary accuracy.",
    ["Retro", "Americana", "Vintage", "Diner", "Mid-Century"],
    [
      "crimson-core-vivid",
      "teal-bloom-clear",
      "amber-tone-muted",
      "warm-gray-pearl",
      "cool-gray-whisper",
    ],
    {
      editorialNote: "Mid-century American diner and roadside culture: cherry red, chrome silver, turquoise teal, mustard yellow, cream. 1950s roadside optimism — diners, drive-ins, vinyl booths.",
      promptWords: [
        "retro americana color palette",
        "1950s diner color scheme",
        "mid century american vintage palette",
      ],
      useCases: ["Retro restaurant and diner branding", "Americana apparel and merchandise", "Nostalgic CPG packaging"],
    },
  ),
  createCollection(
    "minimalist-gray-study",
    "Minimalist Gray Study",
    "A refined value study in gray: from warm white through cool mid-grays to near-black, with a single blue-gray accent.",
    "The palette of deliberate material minimalism — the gray scale as a design language rather than a default. True gray whisper is the near-white beginning of the scale: the color of plaster, uncoated paper, natural linen. True gray pearl advances to light gray. True gray tone reaches the mid-value — the gray of concrete in diffuse light, of brushed aluminum, of matte ceramic. True gray shadow delivers the dark value for borders, labels, and structural elements. True gray nocturne closes the scale at near-black. Cool gray tone provides the single chromatic accent: a blue-gray that brings the cool direction of the palette without committing to a chromatic color, perfect for a primary action color in a near-monochrome system.",
    ["Minimalist", "Gray", "Monochrome", "Refined", "Neutral"],
    [
      "true-gray-whisper",
      "true-gray-pearl",
      "true-gray-tone",
      "true-gray-shadow",
      "true-gray-nocturne",
      "cool-gray-tone",
    ],
    {
      editorialNote: "A refined value study in gray: from warm white through cool mid-grays to near-black with a single blue-gray accent. Deliberate material minimalism — concrete, plaster, brushed aluminum.",
      promptWords: [
        "minimalist gray color palette",
        "monochrome gray design palette",
        "neutral gray color system",
      ],
      useCases: ["Luxury minimal brand identity", "Architecture and design studio", "Minimal UI design system"],
    },
  ),
  createCollection(
    "sunbaked-clay-terracotta",
    "Sunbaked Clay & Terracotta",
    "Earth and sun: fired clay orange, dusty adobe red, warm sand, sun-bleached bone, and the shadow brown of dried earth.",
    "The palette of sun-baked earth materials — adobe, fired clay, dried grasses, and the warm mineral colors of desert cultures. Coral core vivid provides the warm, fired clay orange that anchors the palette: the exact color of unglazed terracotta at peak sun. Ember tone muted delivers a dusty adobe red — the color of dried mud brick and desert earth. Amber pearl muted provides warm sand and sun-bleached stone. Warm gray bloom provides the bone-white of dry limestone and bleached mineral. Merlot shadow muted adds the deep dried-earth brown for depth and shadow. These five colors together reconstruct the thermal, material warmth of adobe architecture and earthen craft.",
    ["Terracotta", "Earth", "Desert", "Clay", "Adobe"],
    [
      "coral-core-vivid",
      "ember-tone-muted",
      "amber-pearl-muted",
      "warm-gray-bloom",
      "merlot-shadow-muted",
    ],
    {
      editorialNote: "Earth and sun: fired clay orange, dusty adobe red, warm sand, sun-bleached bone, dried earth brown. The thermal palette of adobe architecture, earthen craft, and desert cultures.",
      promptWords: [
        "terracotta clay color palette",
        "earth tones adobe palette",
        "desert clay color scheme",
      ],
      useCases: ["Artisan ceramics and home goods", "Desert architecture and interiors", "Wellness and natural beauty brand"],
    },
  ),
  createCollection(
    "deep-ocean-trench",
    "Deep Ocean Trench",
    "The colors of deep ocean: abyssal navy, bioluminescent aqua, midnight indigo, seafoam glow, and the black of the deep trench.",
    "A palette built from the deep ocean as a scientific and aesthetic space — the specific blues and blacks of depth, the bioluminescent colors of abyssal life, and the subtle phosphorescence of moving water in complete darkness. Cobalt nocturne provides the near-black navy of deep water at depth. Indigo shadow vivid adds the intense deep indigo of the middle water column. Aqua velvet clear delivers the bioluminescent aqua of deep-sea organisms — cold, clear, vivid at this depth. Seafoam bloom clear brings the lighter teal of shallower water for contrast. True gray nocturne provides the pure abyssal black.",
    ["Ocean", "Deep Sea", "Dark", "Navy", "Bioluminescent"],
    [
      "cobalt-nocturne-muted",
      "indigo-shadow-vivid",
      "aqua-velvet-clear",
      "seafoam-bloom-clear",
      "true-gray-nocturne",
    ],
    {
      editorialNote: "The colors of deep ocean: abyssal navy, bioluminescent aqua, midnight indigo, seafoam glow, abyssal black. Scientific and aesthetic — from the deep trench to the surface shimmer.",
      promptWords: [
        "deep ocean color palette",
        "dark blue bioluminescent palette",
        "abyssal sea color scheme",
      ],
      useCases: ["Marine science and ocean research brand", "Dark tech and gaming product", "Luxury navy and indigo product line"],
    },
  ),
];

collections.push(...extraCollections48);

const extraCollections49: ColorCollection[] = [
  createCollection(
    "golden-hour-warmth",
    "Golden Hour Warmth",
    "The warm amber and peach palette of late afternoon sun — honey gold, soft apricot, blush rose, warm sand.",
    "Golden hour light at its most luminous — the thirty minutes before sunset when sunlight turns amber and every surface glows peach and gold. Amber radiant clear is the primary color: a pure golden amber at full mid-lightness, the color of sunlight through honey. Apricot silk soft brings the soft, flushed warmth of lit skin and warm stone. Rose bloom muted provides the blush wash of sky at the horizon. Honey tone soft grounds the palette with a deeper, amber-based warm neutral. Coral pearl faint adds the lightest echo of warm pink — a barely-there warmth for surfaces and backgrounds.",
    ["Warm", "Golden", "Sunset", "Romantic", "Lifestyle"],
    [
      "amber-radiant-clear",
      "apricot-silk-soft",
      "rose-bloom-muted",
      "honey-tone-soft",
      "coral-pearl-faint",
    ],
    {
      editorialNote: "Golden hour light at its warmest — the hour before sunset when everything glows amber and shadow turns peach. The light that every photographer chases.",
      promptWords: [
        "golden hour color palette",
        "sunset warm tones palette",
        "amber peach color scheme",
      ],
      useCases: ["Beauty and skincare brand", "Lifestyle photography editorial", "Wedding and celebration palette"],
    },
  ),
  createCollection(
    "japandi-neutral-study",
    "Japandi Neutral Study",
    "The restrained, warm neutrals of Japandi design — warm gray, stone, linen, pale sage, natural ash.",
    "Japandi — the synthesis of Japanese wabi-sabi and Scandinavian hygge — in its most essential color language. The palette finds beauty in restraint, in natural material finishes, and in the quiet that comes from removing everything superfluous. Warm gray tone provides the primary warm neutral: the color of unfinished plaster, Japanese shoji paper, and Scandinavian birch left unfinished. True gray pearl adds a cooler, lighter surface — the gray of limestone, concrete, and Nordic summer light. Olive veil faint is the barely-there sage, the color of dried botanicals and natural linen with the faintest green cast. Moss mist faint deepens the green slightly — the color of lichen on stone. Warm gray whisper closes the palette with the lightest possible warm surface.",
    ["Japandi", "Neutral", "Minimalist", "Natural", "Wabi-sabi"],
    [
      "warm-gray-tone",
      "true-gray-pearl",
      "olive-veil-faint",
      "moss-mist-faint",
      "warm-gray-whisper",
    ],
    {
      editorialNote: "Japandi — Japanese wabi-sabi meets Scandinavian hygge — in its most essential color language: quiet, warm, and organic. Restraint as aesthetic.",
      promptWords: [
        "japandi color palette",
        "wabi sabi neutral palette",
        "warm minimalist color scheme",
      ],
      useCases: ["Interior design moodboard", "Minimalist furniture and homeware brand", "Wellness and slow-living editorial"],
    },
  ),
  createCollection(
    "electric-neon-accent",
    "Electric Neon",
    "High-voltage neon palette for bold digital-first brands — electric lime, hot magenta, bright cyan, vivid violet.",
    "The palette of LED signage, rave culture, and the digital-native aesthetic of Gen-Z creative work. These are not colors chosen for subtlety — they are colors designed to demand attention, to glow, to read at maximum saturation on screens designed for exactly this. Lime core pure provides the electric green-yellow — the color of safety vests, neon signage, and gaming peripherals. Fuchsia tone vivid brings the hot pink of club lighting and festival branding. Aqua radiant vivid adds the bright cyan of digital lighting effects. Violet core vivid completes the cool side of the spectrum with vivid purple. Citrine core pure adds electric yellow for maximum light-field energy.",
    ["Neon", "Bold", "Digital", "Vivid", "Youth"],
    [
      "lime-core-pure",
      "fuchsia-tone-vivid",
      "aqua-radiant-vivid",
      "violet-core-vivid",
      "citrine-core-pure",
    ],
    {
      editorialNote: "The palette of LED signage, rave culture, and Gen-Z digital aesthetics — uncompromisingly vivid, energy-first. Not colors for the faint of heart.",
      promptWords: [
        "neon color palette",
        "electric bright colors design",
        "bold digital palette",
      ],
      useCases: ["Gaming brand or esports team", "Youth fashion and streetwear label", "Club, rave, or event brand"],
    },
  ),
  createCollection(
    "french-countryside-palette",
    "French Countryside",
    "The sun-faded, chalky palette of Provence — lavender, aged limestone, wheat gold, dusty sage, faded rose.",
    "Southern France in summer, seen in the particular bleached quality that intense Mediterranean sun gives to color after years of exposure. The lavender fields outside Valensole, the limestone farmhouses of Les Baux, the terracotta roof tiles of Aix — all faded, chalked, worn by sun and wind into something more beautiful for having been used. Iris pearl muted is the key color: not vivid lavender but the softer, dustier purple of dried lavender bundles and aged paint. True gray bloom provides the aged limestone neutral. Honey bloom soft captures the wheat fields and warm stone surfaces. Moss whisper faint adds the faint green of herb gardens and old shutters. Rose mist faint provides the blushed warmth of sunset on pale stone.",
    ["French", "Provençal", "Soft", "Romantic", "European"],
    [
      "iris-pearl-muted",
      "true-gray-bloom",
      "honey-bloom-soft",
      "moss-whisper-faint",
      "rose-mist-faint",
    ],
    {
      editorialNote: "Southern France in summer: lavender fields, limestone farmhouses, bleached by sun and wind into something gorgeous. The palette of Provence at its quietest and most beautiful.",
      promptWords: [
        "french countryside color palette",
        "provence color palette design",
        "french farmhouse colors",
      ],
      useCases: ["Home decor and lifestyle brand", "Food, wine, and hospitality packaging", "Travel and editorial photography"],
    },
  ),
  createCollection(
    "midnight-jewel-tones",
    "Midnight Jewel Tones",
    "Rich, saturated jewel tones against near-black — deep sapphire, forest emerald, amethyst, garnet.",
    "The color language of precious stones, velvet upholstery, candlelight, and the luxury that exists most naturally in darkness. These are colors that need a dark background to reach their full intensity — on white they look heavy, but against near-black they glow like lit gems. Sapphire nocturne vivid provides the deep midnight blue of a faceted sapphire — saturated blue at its darkest, still reading as blue rather than black. Emerald shadow clear adds the forest depth of a fine emerald: rich, dark green with full chromatic presence. Violet dusk vivid brings the purple of amethyst and court velvet. Garnet shadow vivid is the deep red of garnets and ruby glass. Cool gray nocturne provides the near-black field.",
    ["Jewel Tones", "Dark", "Luxury", "Rich", "Opulent"],
    [
      "sapphire-nocturne-vivid",
      "emerald-shadow-clear",
      "violet-dusk-vivid",
      "garnet-shadow-vivid",
      "cool-gray-nocturne",
    ],
    {
      editorialNote: "The color language of velvet, candlelight, and precious stones — luxury that lives in the dark. Jewel tones need darkness to reach their full saturation and depth.",
      promptWords: [
        "jewel tone color palette",
        "dark jewel color scheme",
        "midnight luxury color palette",
      ],
      useCases: ["Luxury goods or fashion brand", "Evening event, gala, or awards", "Jewelry and fine goods brand"],
    },
  ),
  createCollection(
    "sage-and-terracotta",
    "Sage and Terracotta",
    "The timeless pairing of warm clay earth and cool dusty sage — grounded, organic, and unmistakably contemporary.",
    "Few color pairings have proven as durable in contemporary design as sage green and terracotta — the cool plant and the warm earth, the living and the mineral. The pairing works because it is essentially nature: the color of clay soil next to growing herbs, of sunbaked earthenware next to dried botanicals. Moss silk soft provides the dusty, mid-range sage: green enough to read clearly as a plant color, muted enough to feel natural rather than synthetic. Coral tone muted is the terracotta anchor: warm orange-red at medium lightness, the color of fired clay and canyon soil. Olive bloom soft adds a lighter, more yellow-green for depth on the botanical side. Amber silk muted brings a warm honey-ochre to ground the earth side. Warm gray bloom provides a shared neutral.",
    ["Sage", "Terracotta", "Earth Tones", "Organic", "Contemporary"],
    [
      "moss-silk-soft",
      "coral-tone-muted",
      "olive-bloom-soft",
      "amber-silk-muted",
      "warm-gray-bloom",
    ],
    {
      editorialNote: "One of the most enduring color pairings in contemporary interior and lifestyle design — the earth and the plant, warm and cool, grounded and growing.",
      promptWords: [
        "sage and terracotta color palette",
        "earth tone palette design",
        "organic boho color scheme",
      ],
      useCases: ["Interior moodboard and home decor", "Ceramics and homeware brand", "Plant, garden, and botanical brand"],
    },
  ),
  createCollection(
    "holographic-iridescent",
    "Holographic Iridescent",
    "The opalescent, shifting palette of holograms and iridescent surfaces — prismatic violet, aqua, soft pink, pearl.",
    "Holographic surfaces shift as you move — the same material reads violet from one angle, aqua from another, pink from a third. This palette captures the static version of that shift: the palette of opal, abalone shell, oil-slick on water, and the iridescent finishes that have become one of the defining surface aesthetics of contemporary beauty and tech product design. Iris bloom soft is the primary prismatic color: the lavender-violet of holographic film at its most neutral angle. Aqua bloom muted brings the teal-cyan shift. Rose bloom soft adds the pink-peach angle. Violet mist faint creates the near-white violet end of the spectrum. True gray whisper provides the near-white neutral base — the paper or surface color beneath the iridescent finish.",
    ["Holographic", "Iridescent", "Prismatic", "Beauty", "Opalescent"],
    [
      "iris-bloom-soft",
      "aqua-bloom-muted",
      "rose-bloom-soft",
      "violet-mist-faint",
      "true-gray-whisper",
    ],
    {
      editorialNote: "The color language of holograms, oil slicks, abalone shell, and iridescent finishes — colors that shift as you move, captured in static form.",
      promptWords: [
        "holographic color palette",
        "iridescent color scheme",
        "opal prismatic palette",
      ],
      useCases: ["Beauty and cosmetics brand or packaging", "Tech product launch campaign", "Fashion, accessories, and foil print"],
    },
  ),
  createCollection(
    "desert-sunrise-palette",
    "Desert Sunrise",
    "The brief, vivid palette of desert dawn — pink sky, amber sand, coral mesa, pale gold, and long blue shadow.",
    "Desert light at sunrise has a precision and brevity that other sunrises do not — because there is no moisture or cloud to diffuse it, the transition from dark to golden is fast and dramatic, and the colors are exact: pink fading to apricot, sand catching the first horizontal amber light, long shadows of brilliant blue across red rock. Rose radiant soft provides the primary dawn sky color: a vivid, warm pink that occupies the sky for only minutes before turning golden. Amber bloom muted is the sand — warm, golden-brown, the color of desert rock in the first direct light. Coral silk soft adds the mesa and canyon wall color. Azure pearl faint brings the long cool shadow — the crisp blue that fills shadow in dry, high-altitude desert light. Honey whisper faint completes the palette with the faint warm gold of pre-dawn sky.",
    ["Desert", "Sunrise", "Southwest", "Warm", "Nature"],
    [
      "rose-radiant-soft",
      "amber-bloom-muted",
      "coral-silk-soft",
      "azure-pearl-faint",
      "honey-whisper-faint",
    ],
    {
      editorialNote: "Desert light at sunrise — pink sky fading to gold, long blue shadows across red rock, sand catching the first horizontal amber light. The light that lasts twenty minutes.",
      promptWords: [
        "desert sunrise color palette",
        "desert color scheme design",
        "southwest sunrise palette",
      ],
      useCases: ["Travel and adventure brand", "Outdoor lifestyle and activewear", "Southwest-inspired home and interior"],
    },
  ),
];

collections.push(...extraCollections49);
const extraCollections50: ColorCollection[] = [
  createCollection(
    "2026-warm-earth-trend",
    "2026 Warm Earth Trend",
    "The defining earth palette of 2026: fired clay, warm sienna, raw sand, and dusty adobe.",
    "Terracotta and warm earth tones define 2026's design language across fashion, interior, and branding. This palette captures the refined, contemporary version of the trend — not the flat orange-brown of previous cycles, but layered, specific, and material-feeling.",
    ["Trend", "Earth", "Terracotta", "2026", "Warm"],
    [
      "coral-tone-soft",
      "coral-radiant-muted",
      "amber-silk-soft",
      "amber-bloom-faint",
      "coral-veil-faint",
      "warm-gray-bloom",
    ],
    {
      editorialNote: "Fired clay cooling in evening light — the specific orange-brown of handmade ceramic, not the cheerful orange of mass production. Honest material color.",
      promptWords: [
        "2026 color trend earth tones",
        "terracotta color palette 2026",
        "warm earth color scheme",
        "clay color palette design",
      ],
      useCases: ["Trend-aware brand design", "Interior design and home goods", "Fashion and lifestyle photography"],
    },
  ),
  createCollection(
    "2026-digital-sage-trend",
    "2026 Digital Sage Trend",
    "Tech-forward sage and muted greens for brands at the sustainability-intelligence intersection.",
    "Digital Sage is the defining tech and branding color of 2026: muted, considered, and warm enough to avoid clinical coldness. This palette captures the range from deep anchor green to pale mint used in tech brand identities navigating sustainability claims.",
    ["Trend", "Green", "Tech", "Sage", "2026"],
    [
      "moss-tone-soft",
      "moss-silk-muted",
      "olive-bloom-faint",
      "moss-mist-faint",
      "leaf-shadow-muted",
      "cool-gray-pearl",
    ],
    {
      editorialNote: "The green of a considered brand deck — intelligent, not naive. Sage rather than emerald, muted rather than vivid. Technology with a conscience.",
      promptWords: [
        "digital sage color 2026",
        "tech brand green color palette",
        "sustainable brand color scheme",
        "sage green brand identity",
      ],
      useCases: ["Tech and AI brand identity", "Sustainable product packaging", "B2B SaaS design systems"],
    },
  ),
  createCollection(
    "2026-quiet-luxury-trend",
    "2026 Quiet Luxury Neutrals",
    "Cashmere oat, greige, warm alabaster, and stone for the evolved quiet luxury palette.",
    "Quiet luxury matures in 2026 beyond simple beige into a sophisticated warm neutral system — cashmere oat, aged bone, warm alabaster, and stone tones that communicate quality through restraint. The anti-statement statement palette.",
    ["Trend", "Neutral", "Luxury", "Quiet", "2026"],
    [
      "warm-gray-veil",
      "blush-veil-faint",
      "amber-veil-faint",
      "true-gray-whisper",
      "warm-gray-mist",
      "cool-gray-whisper",
    ],
    {
      editorialNote: "The cashmere sweater without a logo. Warmth and refinement without declaration. The color of very good things that don't need to announce themselves.",
      promptWords: [
        "quiet luxury color palette 2026",
        "neutral luxury color scheme",
        "warm neutral palette design",
        "cashmere color palette",
      ],
      useCases: ["Luxury brand identity", "High-end fashion photography", "Premium hospitality and hotel design"],
    },
  ),
  createCollection(
    "2026-cobalt-confidence-trend",
    "2026 Cobalt Confidence",
    "Bold, saturated cobalt for challenger brands claiming presence and authority.",
    "Cobalt Confidence is 2026's bold blue trend: not the desaturated 'accessible' blue of the previous decade, but a saturated, authoritative cobalt that commands digital screens and print media. For brands that want to be seen.",
    ["Trend", "Blue", "Cobalt", "Bold", "2026"],
    [
      "cobalt-radiant-vivid",
      "cobalt-core-clear",
      "cobalt-bloom-soft",
      "azure-silk-clear",
      "cobalt-pearl-faint",
      "cobalt-nocturne-soft",
    ],
    {
      editorialNote: "Blue that holds its ground. Not polite, not corporate-cautious — the specific blue of something that knows it deserves your attention and has the credentials to back it up.",
      promptWords: [
        "cobalt color palette 2026",
        "bold blue brand palette",
        "saturated blue color scheme",
        "cobalt brand identity",
      ],
      useCases: ["Challenger brand identity", "Fintech and financial services", "Tech startup branding"],
    },
  ),
  createCollection(
    "2026-midnight-plum-trend",
    "2026 Midnight Plum",
    "Deep purple-burgundy for premium brands reclaiming depth, mystery, and aged luxury.",
    "Midnight Plum offers an alternative to overused black-and-gold luxury systems for 2026. This deep purple-burgundy range communicates aged wine, old velvet, and genuine depth — for wine, spirits, beauty, and fashion brands pursuing premium positioning through complexity rather than convention.",
    ["Trend", "Purple", "Luxury", "Plum", "2026"],
    [
      "plum-nocturne-soft",
      "mulberry-shadow-soft",
      "violet-dusk-muted",
      "orchid-silk-muted",
      "plum-bloom-faint",
      "cool-gray-nocturne",
    ],
    {
      editorialNote: "The color of a wine cellar in candlelight — depth without drama, complexity without effort. The purple that luxury reaches for when gold would be too easy.",
      promptWords: [
        "midnight plum color palette 2026",
        "dark purple luxury palette",
        "wine color scheme design",
        "deep plum brand identity",
      ],
      useCases: ["Wine and spirits brand identity", "Luxury beauty and cosmetics", "Premium fashion editorial"],
    },
  ),
  createCollection(
    "photography-film-emulation",
    "Film Emulation Palette",
    "Colors that evoke the warmth, grain, and tonal character of analog film photography.",
    "Before digital processing, color was defined by the photochemistry of film stocks — each with its own spectral sensitivity, saturation curve, and characteristic cast. This palette evokes the warm highlights, muted shadows, and faded midtones of iconic analog film.",
    ["Photography", "Film", "Analog", "Warm", "Nostalgic"],
    [
      "amber-silk-muted",
      "coral-bloom-faint",
      "honey-mist-faint",
      "warm-gray-tone",
      "amber-veil-faint",
      "warm-gray-shadow",
    ],
    {
      editorialNote: "The grain of a 35mm print — warm highlights bleeding into cream, shadows going greenish rather than pure black, the slight haze that digital perfection can't replicate.",
      promptWords: [
        "film emulation color palette",
        "analog photography colors",
        "vintage film color scheme",
        "kodachrome color palette",
      ],
      useCases: ["Photography and editorial design", "Vintage and nostalgia brand identity", "Music album art and packaging"],
    },
  ),
  createCollection(
    "synesthetic-sound-palette",
    "Synesthetic Sound",
    "Colors that correspond to specific auditory registers — bass warmth, mid-tone clarity, treble brightness.",
    "For those with chromesthesia, sounds have inherent colors. This palette maps the auditory spectrum: the warm deep amber of bass frequencies, the clear mid-tone coral of vocals, the sharp aqua brightness of high registers — a visual translation of a full musical range.",
    ["Music", "Synesthesia", "Audio", "Chromesthesia", "Creative"],
    [
      "amber-nocturne-soft",
      "coral-radiant-clear",
      "citrine-tone-clear",
      "aqua-radiant-vivid",
      "cobalt-silk-soft",
      "violet-radiant-soft",
    ],
    {
      editorialNote: "What you hear, if you could see it — bass in deep amber, vocals in warm coral, the bright overtones in aqua and cobalt, the highest frequencies going violet.",
      promptWords: [
        "synesthetic color palette",
        "sound to color",
        "music visualization colors",
        "chromesthesia palette",
      ],
      useCases: ["Music brand identity and album art", "Audio application UI design", "Creative studio and music production branding"],
    },
  ),
  createCollection(
    "luxury-perfume-editorial",
    "Luxury Perfume Editorial",
    "The color language of high perfumery — amber bottle glass, ivory silk, deep sandalwood, and aged vetiver.",
    "Haute parfumerie has a specific visual vocabulary: warm glass amber catching light, cream and ivory as the canvas of luxury, near-black woods for depth, and a single vivid accent — often the actual color of a key ingredient. This palette captures that register.",
    ["Luxury", "Fragrance", "Editorial", "Premium", "Amber"],
    [
      "amber-bloom-soft",
      "honey-silk-muted",
      "blush-whisper-faint",
      "amber-nocturne-muted",
      "warm-gray-bloom",
      "rose-pearl-faint",
    ],
    {
      editorialNote: "The inside of a perfume counter in morning light — amber glass catching warm rays, cream silk lining the cases, shadows going deep wood-brown. The smell of something expensive.",
      promptWords: [
        "luxury perfume color palette",
        "fragrance brand color scheme",
        "amber editorial palette",
        "high perfumery visual identity",
      ],
      useCases: ["Fragrance and perfume brand identity", "Luxury beauty editorial", "Premium packaging and retail design"],
    },
  ),
];

collections.push(...extraCollections50);

const extraCollections51: ColorCollection[] = [
  createCollection(
    "coastal-fog-palette",
    "Coastal Fog Palette",
    "The muted, diffuse palette of a marine layer morning — seafoam, silver, pale aqua, and washed-out sand.",
    "Coastal fog has its own color logic: not the vivid blues of clear ocean days, but the soft silver-greens and pale grays of a marine layer diffusing all light. This palette captures that quiet, washed-out quality — used in coastal architecture, Scandinavian beach houses, and minimal spa environments.",
    ["Coastal", "Fog", "Neutral", "Muted", "Calm"],
    [
      "aqua-mist-faint",
      "seafoam-pearl-faint",
      "cool-gray-bloom",
      "teal-whisper-faint",
      "blush-veil-faint",
      "cool-gray-whisper",
    ],
    {
      editorialNote: "A morning at the beach before the fog burns off. Everything is soft-edged and quiet. The water is barely distinguishable from the sky.",
      promptWords: [
        "coastal fog color palette",
        "marine layer color scheme",
        "beach morning muted palette",
        "Scandinavian coastal colors",
      ],
      useCases: ["Coastal hospitality and resort branding", "Spa and wellness UI design", "Minimal architectural visualization"],
    },
  ),
  createCollection(
    "high-fashion-monochrome",
    "High Fashion Monochrome",
    "An editorial monochrome palette across a complete warm gray spectrum — from near-white whisper to near-black shadow.",
    "High fashion editorial photography often runs in strict monochrome: a single gray temperature across a full value range, with no color accent breaking the purity. This palette builds exactly that — warm gray from whisper to shadow, with enough tonal separation to construct a complete hierarchy.",
    ["Fashion", "Editorial", "Monochrome", "Warm Gray", "Minimal"],
    [
      "warm-gray-whisper",
      "warm-gray-mist",
      "warm-gray-bloom",
      "warm-gray-tone",
      "warm-gray-dusk",
      "warm-gray-shadow",
    ],
    {
      editorialNote: "A fashion editorial in warm gray — the model, the background, the clothes all operating in the same tonal register. A study in value.",
      promptWords: [
        "monochrome fashion palette",
        "editorial gray color scheme",
        "warm gray tonal palette",
        "high fashion color palette",
      ],
      useCases: ["Fashion editorial and lookbook design", "Luxury brand identity", "Premium product photography backdrop"],
    },
  ),
  createCollection(
    "art-deco-gold-black",
    "Art Deco Gold & Black",
    "The opulent color language of Art Deco — deep black, burnished gold amber, ivory cream, and emerald accent.",
    "Art Deco's color code is precise: pure geometry in maximum contrast between deep black and warm gold, softened by ivory and punctuated by one vivid jewel-tone accent — usually emerald, sapphire, or garnet. This palette renders the decade's signature opulence.",
    ["Art Deco", "Gold", "Luxury", "Geometric", "Historical"],
    [
      "amber-core-vivid",
      "amber-shadow-muted",
      "warm-gray-ink",
      "blush-veil-faint",
      "emerald-core-clear",
      "honey-bloom-soft",
    ],
    {
      editorialNote: "A hotel lobby in 1925. Black marble, gold leaf, geometry everywhere. The emerald in the chandelier glass.",
      promptWords: [
        "art deco color palette",
        "art deco gold black color scheme",
        "1920s design palette",
        "deco luxury colors",
      ],
      useCases: ["Art Deco themed brand identity", "Luxury event and hospitality design", "Historical editorial and publication design"],
    },
  ),
  createCollection(
    "wabi-sabi-earth",
    "Wabi-Sabi Earth",
    "The imperfect beauty palette of wabi-sabi aesthetics — warm bone, weathered clay, faded moss, and aged wood.",
    "Wabi-sabi, the Japanese aesthetic of finding beauty in imperfection and transience, has a specific color language: muted naturals that suggest aging, wear, and organic irregularity. No vivid colors. No pure whites. Tones that look like they've been here for decades.",
    ["Wabi-Sabi", "Japanese", "Earth", "Muted", "Organic"],
    [
      "warm-gray-pearl",
      "coral-bloom-muted",
      "olive-tone-muted",
      "amber-tone-muted",
      "warm-gray-tone",
      "moss-dusk-muted",
    ],
    {
      editorialNote: "A raku bowl, still warm from the kiln. The glaze cracked exactly right. Everything around it has been here for a while.",
      promptWords: [
        "wabi-sabi color palette",
        "Japanese aesthetic colors",
        "imperfect beauty color scheme",
        "muted earth palette",
      ],
      useCases: ["Japanese-inspired interior and product design", "Artisan and craft brand identity", "Wellness and mindfulness app design"],
    },
  ),
  createCollection(
    "tropical-modernist",
    "Tropical Modernist",
    "Bold tropical color meets modernist restraint — vivid fuchsia and emerald against clean white and warm neutral.",
    "Tropical modernism as a design movement pairs the high saturation of tropical color (vivid botanical greens, hot pinks, deep ocean blues) with clean modernist geometry and white space. The rule: two vivid colors maximum, against a pure background.",
    ["Tropical", "Modernist", "Vivid", "Botanical", "Bold"],
    [
      "fuchsia-core-vivid",
      "emerald-tone-clear",
      "true-gray-whisper",
      "aqua-bloom-soft",
      "warm-gray-mist",
      "lime-bloom-muted",
    ],
    {
      editorialNote: "A hotel in São Paulo with giant monstera leaves against a white concrete wall. The furniture is Danish teak. The accent is impossible pink.",
      promptWords: [
        "tropical modernist color palette",
        "tropical design colors",
        "bold botanical color scheme",
        "resort branding colors",
      ],
      useCases: ["Tropical resort and hospitality brand identity", "Botanical product and packaging design", "Bold editorial and poster design"],
    },
  ),
  createCollection(
    "gallery-white-study",
    "Gallery White Study",
    "A refined study of gallery whites and near-whites — warm, cool, and true-neutral — used in art and museum spaces.",
    "Gallery and museum spaces don't use a single white — they use a family of whites calibrated to the art within. This palette explores the subtle differences between warm white, cool white, and true white, with near-white surface variants used as elevation levels.",
    ["Gallery", "White", "Minimal", "Neutral", "Architectural"],
    [
      "warm-gray-veil",
      "true-gray-veil",
      "cool-gray-veil",
      "warm-gray-whisper",
      "cool-gray-whisper",
      "true-gray-whisper",
    ],
    {
      editorialNote: "Three adjacent galleries. One hangs warm canvases on warm white. One hangs photography on cool white. One hangs sculpture on true neutral. They only work in their rooms.",
      promptWords: [
        "gallery white palette",
        "museum color scheme",
        "art gallery white colors",
        "architectural white palette",
      ],
      useCases: ["Art gallery and museum environmental design", "Gallery portfolio and exhibition design", "Minimal architectural visualization and staging"],
    },
  ),
  createCollection(
    "botanical-ink-palette",
    "Botanical Ink",
    "The antique palette of hand-rendered botanical illustration — sage ink, parchment, rust, and aged manuscript black.",
    "18th and 19th century botanical illustration developed a specific color vocabulary: earthy sage and moss greens for leaves, terracotta and rust for earth tones, cream parchment for paper, and the distinctive warm black of iron gall ink. This palette recreates that register.",
    ["Botanical", "Illustration", "Antique", "Natural", "Historical"],
    [
      "moss-tone-muted",
      "olive-silk-soft",
      "coral-tone-soft",
      "amber-bloom-muted",
      "warm-gray-pearl",
      "warm-gray-nocturne",
    ],
    {
      editorialNote: "A page from a hand-colored Linnaean folio. The sage still vivid, the parchment foxed at the edges, the iron gall ink brown with age.",
      promptWords: [
        "botanical illustration color palette",
        "antique botanical colors",
        "naturalist illustration palette",
        "vintage botanical color scheme",
      ],
      useCases: ["Botanical brand identity and packaging", "Natural and organic product design", "Editorial and publishing design with natural theme"],
    },
  ),
  createCollection(
    "cinematic-neon-noir",
    "Cinematic Neon Noir",
    "The color language of neo-noir cinema — electric violet and cyan against deep shadow, with amber streetlight warmth.",
    "Neo-noir cinema (Blade Runner, Drive, Collateral) uses neon color strategically: vivid violet, electric blue, and amber appear as pools of colored light against very deep, desaturated shadow backgrounds. The contrast is extreme and intentional.",
    ["Noir", "Neon", "Cinematic", "Night", "Vivid"],
    [
      "violet-shadow-vivid",
      "aqua-core-vivid",
      "amber-tone-clear",
      "cobalt-nocturne-soft",
      "cool-gray-nocturne",
      "indigo-ink-faint",
    ],
    {
      editorialNote: "A rain-slicked alley in a future city. Three light sources: violet neon from the left, aqua from the right, amber sodium lamp overhead. Everything else is shadow.",
      promptWords: [
        "neo-noir color palette",
        "neon noir color scheme",
        "cyberpunk color palette",
        "cinematic night colors",
      ],
      useCases: ["Dark UI and gaming interface design", "Film and entertainment brand identity", "Dramatic editorial and poster design"],
    },
  ),
];

collections.push(...extraCollections51);

const extraCollections52: ColorCollection[] = [
  createCollection(
    "terracotta-studio",
    "Terracotta Studio",
    "Warm terracotta, dusty clay, and sun-baked earth — the palette of Mediterranean studios and artisan workshops.",
    "Mediterranean terracotta has a specific color character: not bright orange, but the dull, complex red-orange of fired clay — warm, earthy, and complex from the mineral impurities in the raw material. This palette pairs that terracotta core with dusty companions: pale sand, grey olive, and a deep warm brown as anchor.",
    ["Terracotta", "Mediterranean", "Artisan", "Warm", "Studio"],
    [
      "coral-tone-muted",
      "apricot-silk-soft",
      "amber-bloom-muted",
      "olive-tone-faint",
      "warm-gray-pearl",
      "warm-gray-shadow",
    ],
    {
      editorialNote: "A ceramics studio in Oaxaca. Unfired pots stacked against a white plaster wall catching afternoon light. The clay is red-orange where dry, deeper where still damp at the base.",
      promptWords: [
        "terracotta color palette",
        "mediterranean earth tones",
        "clay color scheme",
        "artisan studio colors",
      ],
      useCases: ["Artisan and craft brand identity", "Mediterranean-inspired restaurant and hospitality design", "Ceramics and homeware product photography"],
    },
  ),
  createCollection(
    "northern-forest",
    "Northern Forest",
    "The deep, quiet palette of boreal forest — spruce shadow, birch bark, amber resin, and ice-blue winter sky.",
    "Northern boreal forests have a distinctive color palette different from tropical or temperate green: the blue-green of spruce and fir, the pale silver-white of birch bark, the golden amber of resin and autumn needles, and the cold clear blue of winter sky above the canopy. This palette is quieter and cooler than typical 'forest' palettes.",
    ["Forest", "Nordic", "Nature", "Quiet", "Cool"],
    [
      "teal-shadow-soft",
      "leaf-dusk-muted",
      "amber-bloom-soft",
      "cool-gray-whisper",
      "cool-gray-shadow",
      "aqua-whisper-faint",
    ],
    {
      editorialNote: "February in a Finnish forest. The spruce trees are almost black against the snow. One shaft of afternoon light hits a birch trunk. The sky above is the blue that only exists in winter at latitude 63.",
      promptWords: [
        "boreal forest color palette",
        "nordic forest colors",
        "northern nature palette",
        "scandinavian forest color scheme",
      ],
      useCases: ["Outdoor and adventure brand identity", "Nordic and Scandinavian lifestyle branding", "Natural and organic product packaging"],
    },
  ),
  createCollection(
    "parisian-salon",
    "Parisian Salon",
    "The refined, faded palette of a 19th century Parisian salon — dusty rose, aged gilt, pale grey, and dark velvet.",
    "The Parisian salon aesthetic is characterized by colors that have aged gracefully: the dusty rose of faded silk, the muted gold of tarnished gilding, the blue-grey of aged Haussmann plaster, and the deep velvet of upholstery that has absorbed decades of cigar smoke and candlelight. The key is that nothing should look new.",
    ["Parisian", "Vintage", "Elegant", "Faded", "Salon"],
    [
      "rose-bloom-muted",
      "blush-silk-soft",
      "amber-tone-muted",
      "cool-gray-bloom",
      "cool-gray-dusk",
      "plum-velvet-muted",
    ],
    {
      editorialNote: "A drawing room in the 7th arrondissement. The wallpaper is faded rose, the curtains deeper. Afternoon light through tall windows makes everything look like it has been here for a hundred years. Because it has.",
      promptWords: [
        "parisian color palette",
        "french salon colors",
        "vintage paris color scheme",
        "haussmann apartment palette",
      ],
      useCases: ["French luxury and beauty brand identity", "Vintage and heritage fashion brand design", "Upscale hospitality and boutique hotel design"],
    },
  ),
  createCollection(
    "desert-dusk",
    "Desert Dusk",
    "The brief, vivid window of Southwestern desert at dusk — mauve mesa shadows, amber last light, and cooling violet sky.",
    "Desert color is primarily a story of light. During the day, the bleached intensity flattens everything. But in the thirty minutes after the sun sets below the mesa, the light does something extraordinary: warm amber and gold on lit surfaces, violet and mauve in the shadows, a sky that moves from orange to rose to violet to deep blue in minutes. This palette captures that window.",
    ["Desert", "Southwest", "Dusk", "Warm", "Atmospheric"],
    [
      "amber-radiant-clear",
      "apricot-bloom-soft",
      "violet-dusk-soft",
      "iris-shadow-muted",
      "warm-gray-mist",
      "rose-bloom-soft",
    ],
    {
      editorialNote: "Monument Valley, 20 minutes after sunset. The sky is turning from orange to rose to violet while the sandstone still holds the last warmth. A photographer would shoot the same spot every evening for a week to catch this exact light.",
      promptWords: [
        "desert sunset color palette",
        "southwestern sunset colors",
        "desert dusk color scheme",
        "mesa sunset palette",
      ],
      useCases: ["Southwestern lifestyle and travel brand design", "Atmospheric editorial and photography", "Artisan and ceramics brand identity inspired by the Southwest"],
    },
  ),
  createCollection(
    "minimal-japanese",
    "Minimal Japanese",
    "The palette of Japanese minimalism — warm white, natural wood, ink black, and a single restrained accent.",
    "Japanese minimalist design — wabi-sabi, Muji, and the broader aesthetic influenced by Zen philosophy — uses color as restraint rather than expression. The foundation is warm white or very light grey (not pure white), natural material tones (wood, bamboo, stone), deep black or near-black for contrast, and very rarely a single muted accent color. Saturation is actively suppressed. Even accents are muted.",
    ["Japanese", "Minimal", "Zen", "Calm", "Neutral"],
    [
      "warm-gray-whisper",
      "amber-whisper-faint",
      "warm-gray-pearl",
      "warm-gray-ink",
      "moss-tone-faint",
      "warm-gray-tone",
    ],
    {
      editorialNote: "A Kyoto machiya in early morning. White shoji screens diffuse the light to pure grey-white. The only color in the room is the green of a single ikebana stem in a pale ceramic vase.",
      promptWords: [
        "japanese minimal color palette",
        "wabi-sabi color scheme",
        "zen color palette",
        "muji color palette",
        "japanese interior design colors",
      ],
      useCases: ["Japanese-inspired product and packaging design", "Minimal brand identity with clean aesthetic", "Interior design with Japanese or Zen influences"],
    },
  ),
  createCollection(
    "eighties-miami",
    "Eighties Miami",
    "The vivid, sun-saturated palette of 1980s Miami — hot pink, aqua, warm white, and gold — as seen through the lens of Miami Vice and Art Deco revival.",
    "The Miami color palette of the 1980s was simultaneously Art Deco revival and neon-saturated contemporary: the pastel-toned Ocean Drive facades combined with the electric pink and aqua of pool parties and nightlife. Miami Vice made the color combination of pink, aqua, and white globally recognizable as a specific place and era.",
    ["Miami", "Retro", "Vivid", "80s", "Pastel"],
    [
      "fuchsia-bloom-vivid",
      "aqua-bloom-clear",
      "amber-bloom-soft",
      "warm-gray-whisper",
      "rose-bloom-vivid",
      "teal-tone-clear",
    ],
    {
      editorialNote: "South Beach at 10 PM in 1987. The Art Deco hotels are lit in pink and aqua against the night sky. A white Ferrari is parked on Ocean Drive. The whole scene is simultaneously glamorous and completely absurd.",
      promptWords: [
        "miami vice color palette",
        "80s miami colors",
        "art deco miami color scheme",
        "retro miami palette",
        "south beach color palette",
      ],
      useCases: ["Retro and nostalgia-themed brand and product design", "Event and nightlife visual design", "Fashion and apparel inspired by 80s aesthetics"],
    },
  ),
  createCollection(
    "soft-romantic",
    "Soft Romantic",
    "A gentle, romantic palette of blush, lavender, cream, and soft gold — for weddings, beauty, and tender editorial.",
    "The soft romantic palette lives in the high-lightness, low-saturation zone: blush that barely registers as pink, lavender that is almost gray-white, cream rather than white, and gold that leans pale rather than vivid. The effect is warmth without intensity — approachable luxury rather than high drama.",
    ["Romantic", "Wedding", "Soft", "Feminine", "Blush"],
    [
      "blush-whisper-soft",
      "blush-bloom-muted",
      "iris-whisper-faint",
      "amber-whisper-soft",
      "rose-veil-faint",
      "warm-gray-whisper",
    ],
    {
      editorialNote: "A wedding in Tuscany, late June. Table settings in raw linen, flowers in blush garden roses and dusty miller. Everything washed in the warm light of late afternoon that makes pale colors glow.",
      promptWords: [
        "romantic color palette",
        "wedding color palette",
        "blush and lavender palette",
        "soft feminine color scheme",
        "bridal color palette",
      ],
      useCases: ["Wedding brand and invitation design", "Beauty and skincare brand identity", "Feminine fashion and lifestyle editorial"],
    },
  ),
  createCollection(
    "deep-ocean",
    "Deep Ocean",
    "The palette of deep-water marine environments — abyssal navy, bioluminescent aqua, pearl, and deep shadow.",
    "The ocean's color range varies dramatically with depth. Surface waters are bright aqua and cerulean. Below the photic zone — where photosynthesis stops and light becomes rare — the palette shifts to deep navy, black, and the occasional vivid blue-green of bioluminescence. This palette captures the deeper, darker register of marine environments.",
    ["Ocean", "Marine", "Deep", "Dark", "Aqua"],
    [
      "aqua-shadow-vivid",
      "teal-nocturne-clear",
      "cobalt-nocturne-soft",
      "aqua-tone-soft",
      "cool-gray-whisper",
      "cobalt-ink-faint",
    ],
    {
      editorialNote: "200 meters down, a submersible's lights catch a bioluminescent jellyfish. The water outside the porthole is the deepest blue-black — not empty but dense, full of pressure and dark life.",
      promptWords: [
        "deep ocean color palette",
        "marine color scheme",
        "abyssal blue palette",
        "ocean depth colors",
        "underwater color palette",
      ],
      useCases: ["Marine science and ocean conservation brand design", "Luxury and premium brand with deep blue aesthetic", "Technology and innovation brands using depth as metaphor"],
    },
  ),
];

collections.push(...extraCollections52);

const extraCollections53: ColorCollection[] = [
  createCollection(
    "bauhaus-primary",
    "Bauhaus Primary",
    "The pure primary color theory of the Bauhaus school — red, yellow, blue, and black — expressed in the clean geometric palette of 1920s German modernism.",
    "The Bauhaus school's color curriculum, led by Johannes Itten and later Josef Albers, treated color as a formal system rather than a decorative element. Primary colors held special status as the fundamental building blocks of visual language. The Bauhaus palette of red, yellow, and blue against black and white was not aesthetic preference but theoretical conviction.",
    ["Bauhaus", "Primary", "Modernist", "Geometric", "Design History"],
    [
      "crimson-core-vivid",
      "citrine-core-pure",
      "cobalt-core-vivid",
      "true-gray-ink",
      "true-gray-whisper",
      "amber-silk-clear",
    ],
    {
      editorialNote: "Kandinsky's studio at the Dessau Bauhaus, 1928. The wall is white. The geometric compositions on the easel divide space with primary hue. There is no decoration here — only color as a structural force.",
      promptWords: [
        "bauhaus color palette",
        "primary color palette",
        "german modernist palette",
        "geometric color scheme",
        "itten color theory",
      ],
      useCases: ["Modernist-inspired brand and identity design", "Design education and theory illustration", "Bold geometric poster and publication design"],
    },
  ),
  createCollection(
    "cyberpunk-neon",
    "Cyberpunk Neon",
    "The electrified night palette of cyberpunk aesthetics — electric magenta, cyan, violet, and deep urban shadow.",
    "Cyberpunk visual design draws from the neon-saturated nightscapes of dense urban environments imagined through a techno-dystopian lens. The palette is defined by contrast: vivid, saturated neon colors against nearly-black backgrounds that represent the dark urban substrate. The effect is simultaneously beautiful and ominous.",
    ["Cyberpunk", "Neon", "Dark", "Tech", "Urban"],
    [
      "violet-shadow-vivid",
      "aqua-core-vivid",
      "fuchsia-tone-vivid",
      "cobalt-nocturne-clear",
      "iris-shadow-clear",
      "true-gray-nocturne",
    ],
    {
      editorialNote: "3 AM in a rain-soaked alley. A holographic advertisement cycles through magenta and electric blue. The puddles reflect everything, inverted. Someone is running. The neon never turns off.",
      promptWords: [
        "cyberpunk color palette",
        "neon noir palette",
        "electric dark palette",
        "futuristic neon color scheme",
        "blade runner color palette",
      ],
      useCases: ["Gaming and entertainment brand design", "Nightlife and event visual identity", "Speculative fiction and sci-fi editorial design"],
    },
  ),
  createCollection(
    "stone-and-sage",
    "Stone and Sage",
    "Natural stone grays paired with quiet sage green — a palette of mineral restraint for interiors, packaging, and wellness brands.",
    "The pairing of stone gray with sage green draws from the natural proximity of these materials: limestone outcroppings with moss and lichen, granite with fern, concrete with planted sedum. Both colors occupy the same restrained, low-saturation register, making them naturally compatible rather than contrasted.",
    ["Stone", "Sage", "Natural", "Mineral", "Wellness"],
    [
      "cool-gray-pearl",
      "cool-gray-bloom",
      "moss-silk-muted",
      "moss-bloom-soft",
      "cool-gray-tone",
      "leaf-mist-faint",
    ],
    {
      editorialNote: "A concrete countertop in a Japanese-influenced kitchen. A small clay pot with a sage sprig. The morning light through frosted glass. Everything in this space breathes.",
      promptWords: [
        "stone and sage color palette",
        "mineral palette design",
        "sage green and gray palette",
        "natural stone color scheme",
        "wellness brand color palette",
      ],
      useCases: ["Wellness and spa brand identity", "Interior design for modern minimal spaces", "Natural beauty and personal care packaging"],
    },
  ),
  createCollection(
    "autumn-harvest",
    "Autumn Harvest",
    "The full richness of autumn — deep amber, warm russet, harvest gold, and the last greens before winter.",
    "Autumn harvest palettes draw from the peak of fall foliage before the browns take over: the orange-red of sugar maples, amber of aspen groves, gold of cornfields, and the residual green that makes the warm colors pop by contrast. This is the palette of abundance — rich, full, warm, celebratory.",
    ["Autumn", "Harvest", "Seasonal", "Warm", "Earth"],
    [
      "amber-velvet-clear",
      "ember-core-vivid",
      "citrine-silk-clear",
      "olive-velvet-muted",
      "coral-dusk-soft",
      "warm-gray-pearl",
    ],
    {
      editorialNote: "An October afternoon in Vermont. The hillside is on fire with red and amber. The roadside stands have pumpkins and dried corn. Everything is at peak saturation before the long gray begins.",
      promptWords: [
        "autumn color palette",
        "harvest color scheme",
        "fall color palette",
        "seasonal autumn design",
        "orange and amber palette",
      ],
      useCases: ["Seasonal food and beverage brand design", "Autumn marketing campaigns and editorial", "Home goods and décor for fall collections"],
    },
  ),
  createCollection(
    "rose-quartz-mauve",
    "Rose Quartz & Mauve",
    "The dusty, mineral-toned palette of rose quartz — translucent pink, powdery mauve, soft blush — for wellness, beauty, and gentle luxury.",
    "Rose quartz as a mineral has a specific optical quality: the pink is translucent, softened by internal scattering, more cloud than flower. This palette draws from that mineral register — pinks and mauves that feel aged and quiet rather than vivid and fresh. The Pantone Color of the Year for 2016 was Rose Quartz, which brought this quiet pink register into mass consciousness.",
    ["Rose Quartz", "Mauve", "Blush", "Mineral", "Wellness"],
    [
      "rose-pearl-muted",
      "blush-silk-soft",
      "iris-bloom-muted",
      "rose-bloom-soft",
      "blush-mist-faint",
      "warm-gray-pearl",
    ],
    {
      editorialNote: "A crystal shop in Santa Fe. Rose quartz clusters catch afternoon light and scatter it warm and pink across the wooden shelves. The air smells like palo santo. Nothing here is urgent.",
      promptWords: [
        "rose quartz color palette",
        "mauve color scheme",
        "dusty rose palette",
        "blush and mauve design",
        "crystal color palette",
      ],
      useCases: ["Wellness and crystal healing brand design", "Beauty and skincare premium packaging", "Feminine luxury brand identity"],
    },
  ),
  createCollection(
    "midnight-garden",
    "Midnight Garden",
    "Dark botanicals at night — deep forest green, midnight plum, shadow navy, and the palest gold of a lantern.",
    "The midnight garden is a romantic design register: lush and deep, with botanical richness that glows against the dark background. Inspired by Victorian botanical illustration's combination of scientific accuracy and romantic darkness, this palette works for premium beauty, dark-themed hospitality, and editorial contexts where drama is the goal.",
    ["Midnight", "Garden", "Botanical", "Dark", "Romantic"],
    [
      "leaf-nocturne-soft",
      "plum-nocturne-muted",
      "cobalt-shadow-soft",
      "moss-shadow-clear",
      "amber-whisper-soft",
      "emerald-dusk-clear",
    ],
    {
      editorialNote: "A walled garden at midnight, lit by a single lantern. The dark green of box hedges. A deep plum clematis on the stone wall. The amber light catches everything just at its edge.",
      promptWords: [
        "midnight garden color palette",
        "dark botanical palette",
        "dark green and plum design",
        "gothic garden palette",
        "dark floral color scheme",
      ],
      useCases: ["Premium beauty and fragrance brand design", "Dark-themed hospitality and restaurant identity", "Gothic or dark botanical editorial design"],
    },
  ),
  createCollection(
    "vintage-paper",
    "Vintage Paper",
    "The palette of aged documents and antique books — cream, sepia, warm gray, and faded rust — for heritage brands and editorial design.",
    "Paper and document aging follows a predictable chemical process: the warm cream of fresh paper yellows and deepens; iron gall inks fade toward warm brown; photographs shift toward sepia. This palette draws from the late stages of that process — aged enough to feel historical but not so far as to feel deteriorated. The effect is warm, trustworthy, and layered with time.",
    ["Vintage", "Sepia", "Paper", "Heritage", "Editorial"],
    [
      "amber-veil-faint",
      "warm-gray-pearl",
      "ember-mist-muted",
      "amber-bloom-muted",
      "warm-gray-bloom",
      "coral-whisper-faint",
    ],
    {
      editorialNote: "An antiquarian bookshop in Edinburgh. The shelves go to the ceiling. The paper smell is dense and warm. A letter dated 1887 lies open on the desk, the ink faded to a warm brown-gray.",
      promptWords: [
        "vintage paper color palette",
        "sepia color scheme",
        "antique document palette",
        "aged paper color design",
        "heritage brand colors",
      ],
      useCases: ["Heritage and archival brand identity", "Historical editorial and book design", "Vintage-inspired packaging and stationery"],
    },
  ),
  createCollection(
    "citrus-burst",
    "Citrus Burst",
    "The vivid, vitamin-saturated palette of peak citrus — lemon yellow, tangerine, blood orange, and lime — for food, beverage, and energetic brand design.",
    "Citrus colors are among the most immediately appetizing in the color spectrum — the vivid yellow of a lemon cross-section, the saturated orange of a ripe tangerine, the surprising crimson interior of a blood orange, the electric green of lime. These are colors that signal freshness, acidity, and energy. They work at high saturation in ways that many colors cannot because food context gives the vividness a natural referent.",
    ["Citrus", "Vivid", "Yellow", "Orange", "Fresh"],
    [
      "citrine-core-vivid",
      "amber-core-pure",
      "ember-core-vivid",
      "lime-bloom-vivid",
      "apricot-core-clear",
      "true-gray-whisper",
    ],
    {
      editorialNote: "A farmers market at 9 AM. Crates of blood oranges, Meyer lemons, and finger limes. Someone has cut a grapefruit and left it on the table, dripping. The smell is extraordinary.",
      promptWords: [
        "citrus color palette",
        "lemon and orange palette",
        "bright food color scheme",
        "vitamin c color design",
        "fresh citrus branding",
      ],
      useCases: ["Food and beverage brand identity and packaging", "Health and wellness product design", "Summer seasonal campaigns and editorial"],
    },
  ),
];

collections.push(...extraCollections53);

const extraCollections54: ColorCollection[] = [
  createCollection(
    "scandinavian-winter",
    "Scandinavian Winter",
    "Nordic winter light palette — ice blue, snow white, cool gray, and birch bark — for clean, restrained design inspired by Scandinavian winter landscapes.",
    "Scandinavian winter has a particular quality of light that is unlike any other season: low-angle sunlight diffusing through cloud cover and snowfields creates an even, almost shadowless illumination where subtle value differences between near-whites and cool grays become the primary visual vocabulary. The birch forest in January is this palette — pale trunks against cool gray-white snow, with distant blue shadows the only saturated element in the scene.",
    ["Scandinavian", "Winter", "Nordic", "Cool", "Minimal"],
    [
      "cool-gray-whisper",
      "cerulean-veil-faint",
      "cool-gray-mist",
      "cobalt-veil-faint",
      "cool-gray-pearl",
      "true-gray-whisper",
    ],
    {
      editorialNote: "Kiruna, Sweden. January. The sun barely crests the horizon at noon and the light lasts four hours. Everything is blue-white. The birch trees are black vertical lines against a white ground. It is the most beautiful place.",
      promptWords: [
        "scandinavian winter palette",
        "nordic color scheme",
        "winter white palette",
        "snow and ice colors",
        "nordic design palette",
      ],
      useCases: ["Scandinavian-inspired interior and product design", "Minimalist brand identity in cool tones", "Winter editorial and photography direction"],
    },
  ),
  createCollection(
    "golden-hour",
    "Golden Hour",
    "The palette of the magic hour — warm amber, rose gold, pale coral, and soft peach — for photography-inspired design with a warmth and glow that stops the scroll.",
    "The hour after sunrise and before sunset produces light with qualities that professional photographers have chased since the first cameras: low angle, warm color temperature (2000-4000K), long shadows, and a quality of diffused warmth that flatters surfaces and subjects alike. The palette of golden hour is not vivid — it is soft, luminous, and suffused with amber and rose. Nothing in the scene is fully saturated; everything is warm.",
    ["Golden Hour", "Warm", "Photography", "Amber", "Rose Gold"],
    [
      "amber-bloom-muted",
      "apricot-bloom-soft",
      "coral-bloom-soft",
      "rose-pearl-muted",
      "amber-pearl-faint",
      "warm-gray-whisper",
    ],
    {
      editorialNote: "A hotel rooftop in Lisbon at 7:45 PM in June. The sun is an orange disk above the Tejo. Everything — the white walls, the terra cotta, the faces — is the same warm amber. You do not want it to end.",
      promptWords: [
        "golden hour color palette",
        "magic hour palette",
        "warm golden palette",
        "sunset photography colors",
        "rose gold and amber palette",
      ],
      useCases: ["Photography brand identity and editorial direction", "Wedding and event design", "Lifestyle and beauty brand campaigns"],
    },
  ),
  createCollection(
    "forest-bathing",
    "Forest Bathing",
    "The restorative palette of shinrin-yoku — deep forest green, dappled moss, earthy brown, and filtered light — for wellness, biophilic, and nature-immersion design.",
    "Shinrin-yoku — forest bathing, the Japanese practice of restorative immersion in forest environments — produces measurable physiological effects: reduced cortisol, lowered blood pressure, improved mood. The palette of the forest is not bright: it is layered, muted, and deeply varied in green. Sunlight filters through canopy and becomes something else — dappled, indirect, green-shifted. The palette of forest bathing is green at every scale, with earthy brown anchors and the occasional filtered warm light.",
    ["Forest", "Green", "Nature", "Wellness", "Biophilic"],
    [
      "leaf-velvet-soft",
      "moss-shadow-muted",
      "emerald-dusk-soft",
      "olive-tone-muted",
      "amber-bloom-muted",
      "warm-gray-mist",
    ],
    {
      editorialNote: "A beech forest in Kyoto Prefecture, October. The light comes through the canopy in pieces and arrives at the forest floor green and muted. The only sound is footsteps on damp leaf matter. Time passes differently here.",
      promptWords: [
        "forest bathing palette",
        "shinrin yoku colors",
        "biophilic design palette",
        "nature wellness colors",
        "forest green color scheme",
      ],
      useCases: ["Wellness and spa brand identity", "Biophilic interior and product design", "Nature-inspired editorial and lifestyle photography"],
    },
  ),
  createCollection(
    "industrial-loft",
    "Industrial Loft",
    "The palette of reclaimed urban space — concrete gray, charcoal, warm rust, aged copper, and raw steel — for industrial-modern design with authentic material heritage.",
    "The conversion of nineteenth-century industrial buildings into contemporary living and working spaces produced a new aesthetic that values raw material presence: exposed brick, bare concrete, steel columns, copper plumbing, and dark steel beam grids. This palette draws from the material reality of those spaces — the cool gray of poured concrete, the warm rust of oxidized metal, the near-black of steel in low light, and the warm amber-brown of aged copper fittings.",
    ["Industrial", "Concrete", "Urban", "Modern", "Loft"],
    [
      "warm-gray-shadow",
      "ember-dusk-muted",
      "true-gray-velvet",
      "amber-velvet-soft",
      "cool-gray-nocturne",
      "warm-gray-tone",
    ],
    {
      editorialNote: "A converted textile factory in East London. The ceiling is 6 meters of exposed steel beam and brick. The concrete floors have been polished but not prettified. Someone left a coffee ring on the table. It is exactly right.",
      promptWords: [
        "industrial loft color palette",
        "concrete and steel colors",
        "urban industrial palette",
        "loft design color scheme",
        "raw material palette",
      ],
      useCases: ["Industrial-chic interior and architectural design", "Urban lifestyle brand identity", "Contemporary furniture and home goods product design"],
    },
  ),
  createCollection(
    "tropical-garden",
    "Tropical Garden",
    "The vivid, dense palette of tropical botanical environments — fuchsia, vivid lime, teal, coral, and deep green — for editorial design with lush, maximalist energy.",
    "Tropical gardens operate at a different saturation level than temperate ones: the combination of intense sunlight, heat, and humidity produces plant pigmentation that seems almost artificially vivid to eyes accustomed to northern European or North American natural color. Bougainvillea fuchsia. Heliconia red and yellow. Bird of paradise orange. Traveler's palm green against a sky that is a specific vivid cerulean. The palette of the tropical garden is not harmonious in any conventional sense — it is vivid, competitive, and alive.",
    ["Tropical", "Vivid", "Botanical", "Lush", "Fuchsia"],
    [
      "fuchsia-bloom-vivid",
      "lime-bloom-clear",
      "teal-tone-vivid",
      "ember-core-vivid",
      "emerald-velvet-clear",
      "cerulean-bloom-vivid",
    ],
    {
      editorialNote: "The Singapore Botanic Gardens at 10 AM. The light is already tropical-fierce. A bougainvillea the size of a large tree is entirely fuchsia. Next to it, a traveler's palm the same height is entirely green. The contrast is almost too much.",
      promptWords: [
        "tropical garden color palette",
        "tropical botanical palette",
        "vivid tropical colors",
        "lush botanical color scheme",
        "maximalist tropical design",
      ],
      useCases: ["Tropical and resort brand identity", "Maximalist editorial and fashion design", "Bold botanical packaging and product design"],
    },
  ),
  createCollection(
    "art-nouveau-revival",
    "Art Nouveau Revival",
    "The ornamental palette of the Art Nouveau movement — peacock teal, iris violet, amber gold, and moss — reinterpreted for contemporary design with historical depth.",
    "Art Nouveau (1890-1910) was the first mass-market design movement to treat ornament as integral to function rather than decorative afterthought. Its palette drew from natural forms — the iridescent peacock feather, the iris bloom, the amber fossil, the forest moss — and applied them to architecture, furniture, glasswork, and printed matter with a flowing, organic vocabulary. The revival of this palette in contemporary design carries that historical weight: it signals craft, nature, complexity, and a rejection of minimalist sterility.",
    ["Art Nouveau", "Ornamental", "Peacock", "Iris", "Heritage"],
    [
      "teal-velvet-soft",
      "iris-bloom-soft",
      "amber-tone-muted",
      "moss-tone-soft",
      "plum-velvet-soft",
      "warm-gray-mist",
    ],
    {
      editorialNote: "The Paris Métro entrance at Abbesses, designed by Hector Guimard in 1912. The cast iron is painted in a specific dark olive-green. The glass panels are amber. The whole structure is a growing thing, a plant made of metal. Still perfect.",
      promptWords: [
        "art nouveau color palette",
        "art nouveau revival palette",
        "peacock and iris palette",
        "ornamental vintage palette",
        "belle epoque colors",
      ],
      useCases: ["Heritage brand identity and packaging", "Ornamental editorial and book design", "Interior design with historical and craft references"],
    },
  ),
  createCollection(
    "nordic-summer",
    "Nordic Summer",
    "Midsummer Scandinavia in pale blue, blush, soft yellow, and white — the brief, luminous summer of northern Europe when the sun barely sets and everything glows.",
    "Nordic summer is a compensation for the long winter darkness: the sun barely sets at midsummer, producing nearly 24 hours of light that cycles through gold, pink, and pale blue without ever reaching true night. The midsummer festival color palette is not the vivid palette of Mediterranean summer — it is pale, luminous, and delicate. Pale blue sky that doesn't quite darken. Blush and white of birch bark and wildflowers. Soft yellow-green of birch leaves against pale sky.",
    ["Nordic", "Summer", "Midsummer", "Pale", "Scandinavian"],
    [
      "cerulean-veil-faint",
      "rose-veil-faint",
      "citrine-veil-faint",
      "blush-whisper-faint",
      "cool-gray-whisper",
      "moss-whisper-faint",
    ],
    {
      editorialNote: "Midsommar at a Swedish lake house. At midnight the sky is still a pale apricot at the horizon. Someone has put wildflowers in a jar on the table. The wood smoke is faint. It feels like the year's longest exhale.",
      promptWords: [
        "nordic summer palette",
        "midsummer color scheme",
        "scandinavian summer colors",
        "pale summer palette",
        "midsommar aesthetic palette",
      ],
      useCases: ["Scandinavian lifestyle and food brand design", "Summer editorial with pale, atmospheric palette", "Wedding and event design in pale Nordic tones"],
    },
  ),
  createCollection(
    "canyon-dusk",
    "Canyon Dusk",
    "The American Southwest canyon at sunset — rust red, terracotta, warm violet, amber, and dusty rose — a palette of geological scale and cinematic color.",
    "The Colorado Plateau's canyon country undergoes its most dramatic color transformation in the hour after the sun drops toward the western mesa: the red Navajo sandstone shifts from its daylight orange-red toward a deeper, violet-tinged rust; the sky cycles through amber and coral toward violet and deep blue; the shadows in the canyon walls go from gray to a specific purple-blue. This palette captures that brief transition — the geological red, the sky colors, and the shadows — in proportions that translate to design contexts beyond the landscape.",
    ["Canyon", "Southwest", "Dusk", "Desert", "Rust"],
    [
      "ember-dusk-soft",
      "apricot-velvet-muted",
      "violet-dusk-soft",
      "amber-velvet-muted",
      "rose-tone-muted",
      "warm-gray-tone",
    ],
    {
      editorialNote: "Canyonlands at 6:30 PM in October. The canyon walls have gone from orange to rust to a color that has no name — part red, part violet, part shadow. The sky above is still pale amber. In 20 minutes it will be dark.",
      promptWords: [
        "canyon dusk palette",
        "southwest desert palette",
        "canyon sunset colors",
        "arizona desert color scheme",
        "red rock landscape palette",
      ],
      useCases: ["Southwest-inspired interior and home goods design", "Outdoor and adventure brand identity", "Desert landscape editorial and photography direction"],
    },
  ),
];

collections.push(...extraCollections54);

const extraCollections55: ColorCollection[] = [
  createCollection(
    "forest-rain",
    "Forest Rain",
    "Pacific Northwest rain forest after a downpour — deep moss, wet cedar, slate fog, and pale lichen.",
    "The temperate rain forests of the Pacific Northwest produce one of the most distinctive color environments on earth: saturated mosses and ferns against grey-green bark, the almost silver light through fog, the deep mahogany red of wet cedar, the unexpected pale lichen at the edges of stone. This palette captures the forest immediately after rain, when every surface is wet and color saturation is at its highest while the light remains uniformly diffuse. It works for brands in the Pacific Northwest context, outdoor and hiking visual systems, editorial work on sustainability and conservation, and any design context that needs depth and complexity within a cool, naturalistic palette.",
    ["Forest", "Pacific Northwest", "Rain", "Nature", "Earthy"],
    [
      "moss-dusk-soft",
      "leaf-shadow-muted",
      "jade-velvet-muted",
      "steel-tone-muted",
      "cool-gray-shadow",
      "teal-shadow-soft",
    ],
    {
      editorialNote: "The Olympic Peninsula, November. Everything is wet and the light is flat — not gray exactly, but the kind of saturated green-gray that only happens here. The ferns are almost fluorescent against the dark cedar. It smells like earth and cold water.",
      promptWords: [
        "pacific northwest forest palette",
        "rain forest color scheme",
        "wet forest green palette",
        "seattle nature colors",
        "temperate forest palette",
      ],
      useCases: ["Pacific Northwest brand identity and outdoor products", "Conservation and environmental organization design", "Editorial work on forests, hiking, and nature"],
    },
  ),
  createCollection(
    "harvest-amber",
    "Harvest Amber",
    "Autumn harvest palette — amber grain, warm wheat, burnt sienna soil, and the last green of late-season leaves.",
    "The agricultural harvest palette is one of the most universally resonant seasonal color sequences: the gold of ripe wheat, the amber of dried corn, the burnt sienna of turned earth, the warm brown of barn wood, and the occasional deep red of late-season fruit or foliage. This palette captures those colors in design-ready proportions — warm and grounded, with enough variation between the yellow-amber and the burnt-sienna range to support both primary and secondary palette roles. It works for food and agricultural brands, autumn editorial and campaign work, harvest festival and seasonal event design, and any context that needs warmth, abundance, and autumnal grounding.",
    ["Autumn", "Harvest", "Warm", "Earthy", "Seasonal"],
    [
      "amber-tone-soft",
      "honey-dusk-muted",
      "saffron-velvet-muted",
      "ember-shadow-soft",
      "olive-dusk-muted",
      "warm-gray-tone",
    ],
    {
      editorialNote: "A farm stand at the edge of a field in October. The light is low and golden — autumn afternoon — and everything in the stand is some version of amber, from the pale gold of winter squash to the deep burnt sienna of a dried corn husk. It smells like cold earth and apples.",
      promptWords: [
        "harvest autumn palette",
        "autumn amber color scheme",
        "fall harvest colors",
        "warm autumn palette",
        "agricultural seasonal palette",
      ],
      useCases: ["Food and agricultural brand design", "Autumn seasonal campaign and event materials", "Farm-to-table restaurant and packaging identity"],
    },
  ),
  createCollection(
    "night-bloom",
    "Night Bloom",
    "A garden at midnight — deep indigo sky, pale moon-white flowers, dusty sage, and the subtle warmth of candlelight.",
    "Night-blooming flowers — jasmine, moonflower, evening primrose — are adapted to attract pollinators in low light and tend toward white, pale cream, and very pale pink hues that are visible in moonlight when warm colors lose their saturation. This palette builds from that biological fact: the dominant tones are a deep indigo sky, pale and slightly luminous flower whites and creams, and the muted greens of leaves in low light. A small amount of warm amber provides the candlelight or lantern note that makes the composition feel inhabited rather than cold. It works for evening event design, luxury brand identity, perfume and beauty packaging, and any context that needs elegance, depth, and nocturnal romance.",
    ["Night", "Garden", "Floral", "Elegant", "Dark"],
    [
      "indigo-nocturne-soft",
      "violet-shadow-muted",
      "blush-veil-faint",
      "sage-gray-whisper",
      "amber-whisper-muted",
      "plum-velvet-soft",
    ],
    {
      editorialNote: "A walled garden in July at 11 PM. The moonflowers have opened — they are almost luminous against the dark stone — and the jasmine smell is overwhelming. The indigo sky is just barely lighter than the hedge. Somewhere behind the wall there is a candle.",
      promptWords: [
        "night garden palette",
        "midnight floral color scheme",
        "nocturnal palette dark indigo",
        "moonlight garden colors",
        "evening garden palette",
      ],
      useCases: ["Luxury fragrance and beauty brand packaging", "Evening event and wedding invitation design", "Dark editorial and night-themed campaign work"],
    },
  ),
];

collections.push(...extraCollections55);

const extraCollections56: ColorCollection[] = [
  createCollection(
    "arctic-frost",
    "Arctic Frost",
    "Ice-shelf blues, pale lavender mist, and cool silver whites — a palette of polar light and glacial clarity.",
    "The high Arctic in late spring produces a color environment found nowhere else on earth: the pale blue of sea ice underlit by refracted sky, the near-white of snow fields in diffuse overcast light, the faint lavender that appears at the horizon where ice meets atmosphere, and the cool silver-gray of frozen water surfaces. This palette translates that specific color logic — cold, luminous, high-key — into proportions that work for design systems. It is useful for technology brands that need to signal clarity and precision, for health and wellness products oriented toward cleanliness and calm, for editorial work on climate and environment, and for any interface that should feel expansive and unhurried.",
    ["Arctic", "Ice", "Cool", "Minimal", "Clean"],
    [
      "steel-veil-faint",
      "azure-whisper-muted",
      "cerulean-pearl-dust",
      "cool-gray-whisper",
      "iris-mist-faint",
      "aqua-pearl-dust",
    ],
    {
      editorialNote: "Svalbard in May, 2 AM with the sun still above the horizon. The ice is not white — it is blue, pale blue, blue-gray, and at the edges a color you could call lavender if you squinted. The light is absolutely flat. Nothing casts a shadow.",
      promptWords: [
        "arctic palette cool blue",
        "glacial ice color scheme",
        "polar light palette",
        "icy minimal palette",
        "nordic frost color palette",
      ],
      useCases: ["Technology brand identity requiring clarity and precision", "Health, wellness, and clean-beauty product packaging", "Environmental editorial and climate-focused campaign design"],
    },
  ),
  createCollection(
    "tokyo-neon-night",
    "Tokyo Neon Night",
    "Magenta, cyan, and amber neon against deep urban darkness — the visual language of Tokyo at 11 PM.",
    "The intersection of Shinjuku or Shibuya at night creates one of the most dense and specific color environments in the world: signage in magenta, cyan, and hot amber layered over deep gray-blue street-level shadow, the occasional violet or cobalt spill from a pachinko parlor or electronics store. The palette is not garish — in context, each neon reads as a precise signal against the dark — and it translates to design contexts that need energy, modernity, and a certain studied intensity. It works for technology and gaming brands, nightlife and entertainment visual systems, editorial work on urban Asia and city culture, and dark-mode interfaces that need chromatic punctuation rather than generic color.",
    ["Urban", "Neon", "Dark", "Japan", "Night"],
    [
      "magenta-radiant-vivid",
      "cyan-core-bright",
      "amber-silk-vivid",
      "cobalt-dusk-clear",
      "violet-nocturne-clear",
      "true-gray-nocturne",
    ],
    {
      editorialNote: "Kabukicho at midnight. The magenta sign is for a karaoke bar; the cyan is reflecting off wet pavement three stories below it. The amber is from a ramen shop that has been there since 1978. The dark between the signs is not black — it is a very deep gray-blue — and it makes the neon colors look like they are floating.",
      promptWords: [
        "tokyo neon palette",
        "japan night color scheme",
        "urban neon dark palette",
        "cyberpunk tokyo colors",
        "japanese city night palette",
      ],
      useCases: ["Gaming, entertainment, and nightlife brand visual systems", "Dark-mode UI with chromatic accent colors", "Urban culture editorial and Asia-focused campaign design"],
    },
  ),
  createCollection(
    "cafe-creme",
    "Café Crème",
    "Warm cream, honey, faded terracotta, and a dark espresso anchor — the color of a Parisian café at mid-morning.",
    "The classic Parisian café interior has a specific color logic: the warm cream of old marble table tops, the honey amber of cane chair seats, the faded terracotta of tiled floors that have been mopped ten thousand times, the dark deep brown of espresso in a white cup, and the particular soft coral-pink of a paper napkin. This palette captures those proportions — warm, slightly aged, intentionally imperfect — in a way that translates to brand and editorial contexts. It works for food and hospitality brands oriented toward warmth and European heritage, for publishing and writing products that want to feel reflective and unhurried, for lifestyle editorial and home goods design, and for any interface where the dominant feeling should be welcome and ease.",
    ["Café", "Warm", "French", "Hospitality", "Heritage"],
    [
      "amber-veil-muted",
      "honey-pearl-soft",
      "coral-whisper-muted",
      "taupe-gray-tone",
      "garnet-dusk-muted",
      "citrine-veil-faint",
    ],
    {
      editorialNote: "A corner table at Les Deux Magots, 10 AM on a Tuesday in October. The marble is warm and slightly yellowed. The coffee is perfect. The light through the window is the particular amber-gray of a Paris autumn morning and it makes everything look like a film still.",
      promptWords: [
        "parisian cafe palette",
        "french cafe color scheme",
        "warm cream espresso palette",
        "cafe aesthetic colors",
        "french bistro design palette",
      ],
      useCases: ["Food, hospitality, and café brand identity", "Publishing, writing, and editorial product design", "European lifestyle brand and home goods visual systems"],
    },
  ),
];

collections.push(...extraCollections56);

// ---------------------------------------------------------------------------
// De-duplicate by id — keep the FIRST occurrence of each id.
//
// Mirrors the slug dedupe in src/lib/guides.ts:12639 and exists for the same
// reason: getCollectionById() resolves with .find(), so a repeated id meant the
// later entries rendered at no URL at all. Measured 2026-08-08: 8 ids repeated
// across 18 entries — golden-hour ×3, deep-ocean ×3, and ×2 each of
// nordic-morning, midnight-garden, copper-verdigris, desert-dusk,
// autumn-harvest, forest-bathing — leaving 10 curated collections unreachable.
//
// They are NOT identical copies. Each shadowed entry has its own summary and
// palette, so this drops real editorial work. It is still the right call for
// now, because MOST of their titles are identical — minting ids would publish
// pages with duplicate <title> tags, an SEO problem this same audit flagged
// separately. The one exception is copper-verdigris, whose shadowed entry is
// titled "Copper & Verdigris" against the live "Copper Verdigris"; that one
// could be re-idded today without the duplicate-title objection.
// Re-titling is authoring, not a mechanical fix; the ten are listed in
// docs/human-todo.md for the owner to re-publish deliberately if wanted.
//
// The user-visible result is unchanged — these already rendered nowhere. What
// changes is that app/sitemap.ts stops emitting duplicate URLs for them, and
// generateStaticParams() stops emitting duplicate params.
//
// Deduped silently rather than thrown, matching guides.ts: the autopilot commits
// collections daily and an id collision must never break the production build.
// The dropped ids are logged so the collision stays visible in build output.
// ---------------------------------------------------------------------------
{
  const seenIds = new Set<string>();
  const dropped: string[] = [];
  const deduped = collections.filter((collection) => {
    if (seenIds.has(collection.id)) {
      dropped.push(collection.id);
      return false;
    }
    seenIds.add(collection.id);
    return true;
  });

  if (dropped.length > 0) {
    console.warn(
      `[collections] dropped ${dropped.length} duplicate-id collection(s): ${dropped.join(", ")}`,
    );
    collections.length = 0;
    collections.push(...deduped);
  }
}
