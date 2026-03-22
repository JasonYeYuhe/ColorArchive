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
