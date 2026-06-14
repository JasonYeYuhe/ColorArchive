/**
 * Seed words for the static /word-to-color/[word]/ pages.
 *
 * word-to-color is the site's #1 tool and #1 non-brand Google query family, but
 * it only ever existed as a single client-rendered page with a ?q= query param —
 * which search engines and AI answer engines treat as one URL, not hundreds of
 * answerable "what color is the word X" pages.
 *
 * These seeds get pre-rendered (dynamicParams = false) into static, server-rendered
 * pages with real per-word data (hex + 5 variants + nearest named color), so each
 * becomes an indexable, AI-citable answer for "<word> color" / "what color is <word>".
 *
 * Rules: lowercase, no hyphens or punctuation (slug round-trips on spaces only),
 * each entry unique after slugifying. Keep these evocative, high-search-intent
 * words/phrases — moods, nature, materials, brand concepts — not random nouns.
 */
const rawSeeds: string[] = [
  // moods & emotions
  "calm", "serenity", "joy", "nostalgia", "melancholy", "hope", "passion", "peace",
  "energy", "confidence", "trust", "comfort", "luxury", "elegance", "playful", "bold",
  "dreamy", "romantic", "mysterious", "fearless", "gentle", "fierce", "warmth", "clarity",
  "wonder", "courage", "freedom", "stillness", "euphoria", "wanderlust", "solitude", "bliss",
  // quiet-luxury / brand concepts
  "quiet luxury", "minimalism", "modern", "vintage", "futuristic", "organic", "premium",
  "innovation", "creativity", "focus", "balance", "harmony", "growth", "vitality", "ambition",
  "loyalty", "wisdom", "prestige", "craft", "heritage", "wellness", "momentum", "discovery",
  // nature & landscape
  "ocean", "forest", "desert", "mountain", "meadow", "valley", "canyon", "tundra",
  "savanna", "glacier", "lagoon", "reef", "tide", "horizon", "wildfire", "moss",
  "fern", "willow", "cedar", "bamboo", "driftwood", "seashell", "coral reef", "rainforest",
  // sky, water & weather
  "sky", "dawn", "dusk", "twilight", "midnight", "sunrise", "sunset", "aurora",
  "storm", "rain", "fog", "mist", "snow", "frost", "thunder", "lightning",
  "moonlight", "starlight", "nightfall", "daybreak", "overcast", "drizzle", "monsoon", "breeze",
  // water bodies
  "river", "lake", "waterfall", "deep sea", "shallow water", "arctic", "tropical", "tidal pool",
  // flora & flowers
  "rose", "lavender", "jasmine", "lotus", "orchid", "peony", "tulip", "sunflower",
  "marigold", "lilac", "poppy", "dahlia", "magnolia", "hibiscus", "wisteria", "camellia",
  "sage", "eucalyptus", "ivy", "clover", "thistle", "heather", "bluebell", "daffodil",
  // food & drink
  "espresso", "matcha", "honey", "caramel", "chocolate", "vanilla", "cinnamon", "saffron",
  "paprika", "mustard", "olive", "avocado", "pistachio", "blueberry", "raspberry", "blackberry",
  "peach", "apricot", "mango", "papaya", "watermelon", "pomegranate", "fig", "plum",
  "merlot", "champagne", "whiskey", "mulled wine", "iced tea", "lemonade", "mint tea", "cold brew",
  // gems, metals & materials
  "emerald", "sapphire", "ruby", "amber", "jade", "topaz", "opal", "amethyst",
  "obsidian", "marble", "granite", "slate", "copper", "bronze", "brass", "platinum",
  "gold", "silver", "rose gold", "gunmetal", "pearl", "ivory", "onyx", "quartz",
  // textures & abstract
  "velvet", "silk", "linen", "denim", "suede", "leather", "concrete", "porcelain",
  "parchment", "canvas", "charcoal", "ash", "smoke", "ember", "cinder", "soot",
  // seasons & time
  "spring", "summer", "autumn", "winter", "harvest", "equinox", "solstice", "indian summer",
  "early spring", "late autumn", "first frost", "high noon", "golden hour", "blue hour",
  // places & vibes
  "tokyo", "santorini", "tuscany", "provence", "marrakech", "kyoto", "havana", "reykjavik",
  "amalfi", "scandinavia", "mediterranean", "sahara", "patagonia", "bali", "morocco", "iceland",
  // cultural / aesthetic
  "cyberpunk", "cottagecore", "art deco", "bauhaus", "brutalist", "japandi", "y2k", "vaporwave",
  "dark academia", "coastal grandmother", "old money", "scandi", "boho", "retro", "noir", "pastel goth",
  // colors-of words people search
  "love", "money", "power", "magic", "dream", "ghost", "shadow", "neon",
  "galaxy", "cosmos", "nebula", "eclipse", "comet", "meteor", "stardust", "void",
  // names & identity (high search: "what color is my name")
  "luna", "aurora name", "sage name", "river name", "ivy name", "ruby name", "jade name", "hazel",
  // tech / startup brand words
  "startup", "fintech", "saas", "crypto", "cloud", "data", "ai", "robotics",
  // extra evocative singles
  "wild", "fresh", "vivid", "muted", "soft", "deep", "electric", "cosmic",
  "ethereal", "radiant", "luminous", "opaque", "translucent", "iridescent", "matte", "glossy",

  // ---- batch 2 additions (2026-06-14) — widen long-tail coverage ----
  // more moods / concepts
  "tranquil", "cozy", "vibrant", "optimism", "gratitude", "curiosity", "resilience",
  "empathy", "zen", "grit", "awe", "longing", "devotion", "serene", "poise", "allure",
  "mystique", "whimsy", "vigor", "reverie", "rapture", "yearning", "tenderness", "clarity zen",
  // more nature / landscape
  "prairie", "dune", "marsh", "cliff", "fjord", "geyser", "oasis", "grove", "orchard",
  "vineyard", "wetland", "highland", "estuary", "delta", "plateau", "ridge", "summit",
  "cavern", "glade", "canopy", "redwood", "cypress", "birch", "maple", "oak", "walnut",
  "mahogany", "teak", "ebony", "juniper",
  // more sky / weather / water
  "sleet", "sunshower", "heatwave", "zephyr", "gale", "hailstorm", "cloudburst",
  "whitecap", "undertow", "kelp", "brine", "abyss", "current", "ripple", "cascade",
  "spindrift", "seafoam", "night sky", "clear sky",
  // more flowers / plants
  "gardenia", "freesia", "ranunculus", "anemone", "foxglove", "snapdragon", "zinnia",
  "buttercup", "primrose", "periwinkle", "protea", "dogwood", "azalea", "oleander",
  // more food / drink
  "turmeric", "ginger", "nutmeg", "clove", "cardamom", "basil", "rosemary", "thyme",
  "wasabi", "miso", "cocoa", "mocha", "latte", "cappuccino", "sangria", "mojito",
  "negroni", "aperol", "cider", "kombucha", "persimmon", "lychee", "dragonfruit",
  "guava", "passionfruit", "clementine", "cranberry", "currant", "elderberry",
  // more gems / metals / materials
  "turquoise", "garnet", "peridot", "aquamarine", "moonstone", "lapis", "malachite",
  "jasper", "agate", "terracotta", "clay", "sandstone", "limestone", "alabaster",
  "pewter", "titanium", "chrome", "rust", "patina",
  // more places
  "lisbon", "seville", "capri", "positano", "oslo", "helsinki", "copenhagen", "vienna",
  "prague", "cairo", "jaipur", "seoul", "osaka", "hanoi", "lima", "oaxaca", "tulum",
  "sedona", "cape town", "zanzibar",
  // more aesthetic / abstract
  "gothic", "baroque", "rococo", "victorian", "midcentury", "industrial", "nautical",
  "maximalism", "grunge", "disco",
  // more names
  "nova", "sienna", "wren", "marlowe", "ophelia", "celeste", "esme", "juniper name",
];

/** Deduped, normalized seed list (lowercased — safe for slug round-trip). */
export const wordToColorSeeds: string[] = Array.from(
  new Set(rawSeeds.map((w) => w.trim().toLowerCase()).filter(Boolean)),
);

/** Slugify a seed word for the route param (spaces -> hyphens). */
export function slugifyWord(word: string): string {
  return word.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Reverse map: route slug -> original display word (curated seeds only). */
export const wordSeedBySlug: Record<string, string> = Object.fromEntries(
  wordToColorSeeds.map((word) => [slugifyWord(word), word]),
);

/** Title-case a word/phrase for headings ("quiet luxury" -> "Quiet Luxury"). */
export function titleCaseWord(word: string): string {
  return word
    .split(" ")
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}
