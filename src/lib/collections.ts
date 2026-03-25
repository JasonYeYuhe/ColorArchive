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
    "This collection traces the color story of copper across its lifecycle: from the warm amber-red of freshly polished metal to the blue-green oxidation of aged bronze. Amber-tone-soft provides the warm anchoring copper note; terracotta-silk-muted steps into the reddish-brown territory of aged copper surfaces; sage-bloom-muted introduces the pale teal-green of incipient patina; teal-mist-soft brings the cleaner, bluer aqua of fully developed patina; and honey-bloom-muted bridges the warm and oxidized zones with a golden amber that reads as mineral and natural. Together the palette evokes material history — the sense of objects that have been made with care and used over time.",
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
    "The color of mineral-rich desert terrain: iron-oxide red in exposed canyon walls, the warm tan of sandstone plateaus, the amber of dry grasses, the dusty sage of desert scrub, and the pale cream of sun-bleached stone. Terracotta-tone-muted provides the foundational warm red-brown — a deeply earthy hue that reads as both geological and handcrafted; rust-bloom-muted introduces the more intense iron-oxide red-orange of exposed rock surfaces; honey-bloom-muted provides the warm amber-gold of desert light at the golden hour; sage-mist-soft brings the cool, dusty green that appears in desert vegetation — a color that reads as neutral when surrounded by warm tones, adding chromatic relief without introducing a jarring contrast; sand-pearl-soft provides the lightest entry — the pale buff of desert sand or sun-bleached sandstone, which works as both a light-toned accent and a warm off-white surface color. Together the five colors create a palette of mineral warmth and geological authority.",
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
        "This palette reads as 'desert' rather than 'rustic' when sage-mist-soft is included — the cool sage against warm terracotta and rust creates the specific temperature contrast of desert landscape photography. Without the sage, it becomes a purely warm earthy palette that could read as autumnal or Mediterranean. Use sand-pearl-soft as the background surface color (on white paper or in UI background roles) rather than pure white — the slight warm buff tone ties the other colors together. Typography: use a dark version of the terracotta or rust hue for headings, and neutral near-black for body text. Avoid pure black — it creates temperature contrast that fights the palette.",
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
    "Data visualization demands a different color discipline than brand or editorial work. Colors must communicate data structure — category membership, sequential magnitude, divergence from a norm — without evoking false emotional associations. This palette builds a minimal but complete categorical foundation for dashboard design: cobalt-tone-vivid as the primary data series anchor, providing clear legibility against both light and dark dashboard backgrounds; teal-ink-muted as the secondary series color, maximally distinguishable from cobalt in both hue and temperature; amber-glow-soft as the warning state, warm and attention-drawing without the false urgency of red; crimson-tone-soft as the alert state, clearly negative but not alarming; slate-tone-muted as the neutral baseline, appropriate for inactive series, disabled states, and zero-value bars. The palette was designed to maintain categorical distinguishability through common forms of color vision deficiency — lightness variation between any two colors exceeds 18 OKLCH L units.",
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
        "Use cobalt-tone-vivid for the primary data series only — do not use it for UI chrome in the same interface, as mixing data-encoding and UI-encoding roles for the same color is a leading source of user confusion. amber-glow-soft is the warning token, not a decorative accent. Test this palette in grayscale before finalizing: each color should remain distinguishable by lightness alone. Recommended pairing: use a very light warm white (#f8f7f5) as the chart background with these colors; on dark dashboards, increase all lightness values by 10-15 OKLCH L units.",
      promptWords: ["analytics dashboard with colored chart lines", "data visualization with categorical bars", "business intelligence interface with metrics", "dark mode dashboard with glowing chart lines", "monitoring dashboard with status indicators"],
      useCases: ["Product analytics dashboards", "Business intelligence and reporting tools", "Monitoring and observability interfaces", "Financial data visualization", "Health and wellness metric displays"],
    },
  ),
  createCollection(
    "film-neutral",
    "Film Neutral",
    "Warm parchment, exposed film beige, shadow gray-brown, dark slate, and off-black — the color palette of analog photography and cinema post-production.",
    "Analog film has a characteristic color signature that is distinct from digital neutral palettes. Film neutrals are warm-leaning — the silver halide chemistry of black-and-white film, the color masking of color negative film, and the warm-base optical printing process all introduced a slight warmth to shadows and a creamy quality to highlights. This palette reconstructs that register: amber-veil-muted provides the warm parchment quality of highlights in well-exposed color negative film, the tone of aged photographic paper; pearl-blush-soft contributes the mid-tone warmth of exposed but undeveloped silver — a quality often described as 'analog warmth'; slate-veil-muted adds the shadow register — not pure neutral gray but a slightly warm dark value appropriate for shadow detail in film-grade work; cobalt-shadow-muted deepens the palette toward the cool-blue shadow quality that color negative film produces in deep shadows; obsidian-tone-soft provides the near-black that analog printing achieves — slightly desaturated and warm compared to digital pure black.",
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
        "This palette works best in contexts where the warmth reads as intentional craft rather than technical limitation — photography portfolios, film production, editorial design, premium print. amber-veil-muted as the primary background or paper surface; pearl-blush-soft for secondary surfaces and card backgrounds; slate-veil-muted for subtle dividers and inactive elements; cobalt-shadow-muted and obsidian-tone-soft for text and dark surfaces. The warmth is calibrated to read as 'analog' on screen — avoid pairing with pure-white or pure-black, which will make the warmth look like a calibration error rather than a deliberate aesthetic choice.",
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
    "The coastal fog palette occupies a different register than the bright coastal palettes (clear aquas and vivid blues) — it represents the cooler, more atmospheric quality of foggy coastal mornings, overcast seascapes, and the specific desaturated blue-grays of maritime environments. This is the palette of weathered boat paint, salt-bleached driftwood, fog-softened horizon lines, and the silver-white light of a cloudy coastal day. Slate-veil-muted provides the foundational warm-cool gray of fog and bleached surfaces — not a design-neutral gray but a color with a slight blue-leaning identity; cerulean-mist-muted contributes the pale, desaturated near-blue that reads as sky-and-sea under overcast light; sage-mist-muted introduces the cool, slightly desaturated sage of coastal vegetation — muted beach grass and salt-weathered plant life; cobalt-shadow-muted provides the deep marine reference — a dark, desaturated blue that anchors the palette in the depth of seawater rather than sky; pearl-blush-soft supplies the palest, warmest entry — the faint warm-white of sea foam and salt-crystallized surfaces. Together the five colors create a palette that reads as simultaneously coastal and sophisticated, appropriate for maritime brands, technology companies, and any identity that requires restraint and cool-neutral authority.",
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
