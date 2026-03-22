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
    "A palette built from the green spectrum's quietest register: desaturated, light-touched, and atmospheric. Sage greens and moss tones at low chroma suggest living plants behind glass, a morning walk through a damp garden, or a ceramic planter on a white shelf. The sage-mist-soft is the palette's lightest entry — an almost-grey green suitable for large background surfaces and calm UI backgrounds. The moss-tone-muted provides an earthy, grounded midtone. The fern-velvet-soft is the richest entry, with enough chroma to serve as an accent or primary brand color. The stone-green-muted bridges green to neutral, useful for typographic elements that should feel botanical without being vivid. The eucalyptus-bloom-soft adds a slightly cooler note that prevents the palette from reading as too yellow or too warm. This palette works for: wellness and mindfulness brands, botanical and plant retail, slow-living and sustainable lifestyle brands, spa and aromatherapy packaging.",
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
      "frost-veil-soft",
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
      "sienna-tone-muted",
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
    "This collection traces the color story of copper across its lifecycle: from the warm amber-red of freshly polished metal to the blue-green oxidation of aged bronze. Amber-tone-soft provides the warm anchoring copper note; terracotta-silk-muted steps into the reddish-brown territory of aged copper surfaces; sage-bloom-muted introduces the pale teal-green of incipient patina; teal-mist-soft brings the cleaner, bluer aqua of fully developed patina; and honey-bloom-muted bridges the warm and oxidized zones with a golden amber that reads as mineral and natural. Together the palette evokes material history — the sense of objects that have been made with care and used over time.",
    ["Warm", "Artisan", "Material"],
    [
      "amber-tone-soft",
      "terracotta-silk-muted",
      "sage-bloom-muted",
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
