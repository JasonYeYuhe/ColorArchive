import type { ColorFamily, ColorRecord } from "@/src/types/color";

function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

// Semantic search aliases — maps common color words to name fragments in the archive
const SEARCH_ALIASES: Record<string, string[]> = {
  sunset: ["ember", "coral", "amber", "merlot", "ruby"],
  ocean: ["azure", "sapphire", "cobalt", "lagoon", "teal"],
  forest: ["moss", "leaf", "emerald", "pine", "fern"],
  sky: ["azure", "mist", "veil", "whisper", "powder"],
  night: ["ink", "shadow", "onyx", "coal", "deep"],
  pastel: ["veil", "whisper", "mist", "pearl", "silk"],
  earth: ["ember", "clay", "rust", "sienna", "umber"],
  neon: ["vivid", "clear", "bright"],
  warm: ["crimson", "ruby", "ember", "coral", "amber", "honey"],
  cool: ["azure", "sapphire", "cobalt", "teal", "mint"],
  rose: ["ruby", "crimson", "blush", "peony", "fuchsia"],
  gold: ["amber", "honey", "citrine", "marigold"],
  ice: ["frost", "veil", "whisper", "mist", "pearl"],
  vintage: ["muted", "soft", "dusty"],
  bold: ["vivid", "clear", "core"],
  muted: ["muted", "soft"],
  dark: ["ink", "shadow", "deep", "coal"],
  light: ["veil", "whisper", "mist", "pearl"],
  spring: ["mint", "peony", "rose", "blossom", "lavender"],
  autumn: ["ember", "amber", "rust", "sienna", "garnet"],
  fall: ["ember", "amber", "rust", "sienna", "garnet"],
  winter: ["frost", "cobalt", "mist", "slate", "azure"],
  summer: ["coral", "citrine", "aqua", "lime", "vivid"],
  tropical: ["aqua", "lime", "coral", "teal", "vivid"],
  desert: ["sand", "sienna", "amber", "rust", "clay"],
  nordic: ["frost", "veil", "cobalt", "mist", "azure"],
  japanese: ["moss", "ink", "plum", "muted", "ivory"],
  luxury: ["merlot", "pearl", "soft", "garnet", "onyx"],
  natural: ["moss", "amber", "leaf", "olive", "clay"],
  minimal: ["veil", "mist", "whisper", "pearl", "slate"],
  vibrant: ["vivid", "clear", "radiant", "bloom"],
  dreamy: ["lavender", "blush", "peony", "lilac", "veil"],
  retro: ["muted", "amber", "sienna", "garnet", "soft"],
  tech: ["cobalt", "azure", "violet", "ink", "vivid"],
  moody: ["shadow", "ink", "plum", "merlot", "slate"],
  soft: ["veil", "whisper", "mist", "pearl", "silk"],
  clean: ["frost", "veil", "whisper", "pearl", "ivory"],
  elegant: ["pearl", "ivory", "muted", "garnet", "onyx"],
  playful: ["coral", "mint", "vivid", "bloom", "citrine"],
  urban: ["ink", "slate", "cobalt", "carbon", "steel"],
  coastal: ["aqua", "teal", "fog", "azure", "mist"],
  botanical: ["moss", "fern", "leaf", "sage", "olive"],
  wedding: ["blush", "ivory", "peony", "pearl", "rose"],
  coffee: ["sienna", "amber", "clay", "umber", "ivory"],
  lavender: ["lavender", "lilac", "violet", "blush", "veil"],
  sage: ["sage", "olive", "moss", "muted", "leaf"],
  terracotta: ["clay", "rust", "sienna", "ember", "amber"],
  monochrome: ["ink", "slate", "ash", "fog", "stone"],
  halloween: ["ember", "rust", "amber", "onyx", "garnet"],
  christmas: ["crimson", "ruby", "pine", "forest", "gold"],
  // Basic color name aliases — users searching "blue", "green", etc.
  red: ["crimson", "ruby", "garnet", "merlot", "ember"],
  orange: ["ember", "coral", "amber", "rust", "marigold"],
  yellow: ["amber", "citrine", "honey", "marigold", "bloom"],
  green: ["moss", "leaf", "fern", "olive", "sage"],
  blue: ["azure", "cobalt", "sapphire", "teal", "cerulean"],
  purple: ["violet", "plum", "lavender", "lilac", "amethyst"],
  pink: ["blush", "rose", "peony", "fuchsia", "coral"],
  brown: ["sienna", "clay", "amber", "honey", "rust"],
  grey: ["slate", "fog", "mist", "ash", "coal"],
  gray: ["slate", "fog", "mist", "ash", "coal"],
  black: ["ink", "onyx", "coal", "shadow", "nocturne"],
  white: ["ivory", "pearl", "frost", "whisper", "veil"],
  // Style and context aliases
  studio: ["neutral", "slate", "ivory", "warm", "muted"],
  cinema: ["shadow", "teal", "amber", "cobalt", "dark"],
  editorial: ["muted", "ink", "ivory", "pearl", "warm"],
  industrial: ["slate", "coal", "ash", "fog", "steel"],
  bohemian: ["ember", "clay", "rust", "amber", "sienna"],
  gallery: ["ivory", "onyx", "pearl", "ink", "frost"],
  beach: ["aqua", "teal", "coral", "mint", "azure"],
  fire: ["ember", "crimson", "rust", "amber", "garnet"],
  midnight: ["ink", "cobalt", "shadow", "violet", "nocturne"],
  sunrise: ["coral", "amber", "rose", "citrine", "marigold"],
  // Architecture & material aliases
  cement: ["slate", "ash", "fog", "mist", "stone"],
  concrete: ["slate", "ash", "fog", "coal", "stone"],
  stone: ["ash", "fog", "slate", "sand", "ivory"],
  mineral: ["ash", "slate", "cobalt", "umber", "clay"],
  // Fashion & style aliases
  fashion: ["blush", "ivory", "peony", "onyx", "pearl"],
  chic: ["ivory", "onyx", "pearl", "muted", "slate"],
  couture: ["pearl", "ivory", "onyx", "garnet", "plum"],
  runway: ["onyx", "ivory", "crimson", "pearl", "garnet"],
  // Mood & aesthetic aliases
  cheerful: ["coral", "citrine", "mint", "bloom", "amber"],
  romantic: ["blush", "peony", "rose", "plum", "garnet"],
  mysterious: ["shadow", "ink", "plum", "violet", "nocturne"],
  serene: ["mist", "fog", "frost", "whisper", "veil"],
  // Industry & context aliases
  medical: ["azure", "frost", "whisper", "mint", "teal"],
  spa: ["mist", "whisper", "sage", "teal", "ivory"],
  food: ["ember", "amber", "coral", "honey", "citrine"],
  cafe: ["sienna", "amber", "clay", "ivory", "honey"],
  startup: ["cobalt", "violet", "azure", "vivid", "ink"],
  portfolio: ["ink", "ivory", "slate", "muted", "pearl"],
  // Food & beverage aliases
  chocolate: ["sienna", "umber", "clay", "honey", "shadow"],
  espresso: ["umber", "shadow", "ink", "sienna", "clay"],
  caramel: ["amber", "honey", "sienna", "warm", "citrine"],
  matcha: ["olive", "moss", "sage", "leaf", "muted"],
  blueberry: ["indigo", "violet", "plum", "cobalt", "shadow"],
  cherry: ["ruby", "crimson", "garnet", "merlot", "rose"],
  // Cosmic & space aliases
  space: ["ink", "cobalt", "violet", "indigo", "nocturne"],
  galaxy: ["violet", "indigo", "cobalt", "plum", "vivid"],
  cosmic: ["violet", "indigo", "nocturne", "cobalt", "plum"],
  nebula: ["violet", "fuchsia", "cobalt", "plum", "vivid"],
  // Nature & garden aliases
  meadow: ["leaf", "lime", "moss", "citrine", "bloom"],
  garden: ["moss", "leaf", "sage", "fern", "emerald"],
  floral: ["peony", "rose", "blush", "lavender", "bloom"],
  alpine: ["frost", "cobalt", "moss", "azure", "slate"],
  // Textile & material aliases
  linen: ["ivory", "veil", "sand", "whisper", "pearl"],
  canvas: ["ivory", "sand", "veil", "whisper", "muted"],
  denim: ["cobalt", "indigo", "azure", "slate", "shadow"],
  velvet: ["plum", "merlot", "garnet", "shadow", "nocturne"],
  // Weather & atmospheric aliases
  storm: ["slate", "shadow", "cobalt", "ink", "fog"],
  thunder: ["slate", "ink", "cobalt", "shadow", "onyx"],
  fog: ["mist", "veil", "ash", "slate", "whisper"],
  haze: ["mist", "veil", "fog", "whisper", "pearl"],
  // Gemstone & mineral aliases
  amethyst: ["violet", "plum", "lavender", "orchid", "soft"],
  emerald: ["emerald", "jade", "teal", "clear", "vivid"],
  sapphire: ["sapphire", "cobalt", "azure", "indigo", "clear"],
  ruby: ["ruby", "crimson", "garnet", "merlot", "clear"],
  topaz: ["amber", "honey", "citrine", "clear", "vivid"],
  // Interior design & material aliases
  marble: ["ivory", "pearl", "frost", "ash", "veil"],
  brass: ["amber", "honey", "citrine", "warm", "gold"],
  copper: ["ember", "rust", "amber", "sienna", "coral"],
  oak: ["amber", "honey", "sienna", "clay", "soft"],
  walnut: ["sienna", "umber", "shadow", "clay", "warm"],
  loft: ["slate", "ash", "ivory", "concrete", "warm"],
  // Seasonal & holiday aliases
  valentine: ["ruby", "crimson", "rose", "blush", "peony"],
  thanksgiving: ["ember", "amber", "rust", "sienna", "honey"],
  // Trend & aesthetic aliases
  cottagecore: ["sage", "blush", "ivory", "rose", "moss"],
  darkacademia: ["shadow", "sienna", "umber", "ink", "muted"],
  grandmillennial: ["peony", "ivory", "rose", "plum", "muted"],
  goblincore: ["moss", "olive", "fern", "clay", "amber"],
  // Design style aliases
  brutalist: ["ink", "onyx", "coal", "ash", "concrete"],
  glassmorphism: ["veil", "frost", "mist", "whisper", "azure"],
  neumorphism: ["fog", "veil", "ash", "whisper", "pearl"],
  // Wellness & nature aliases
  zen: ["mist", "whisper", "ivory", "sage", "veil"],
  meditation: ["mist", "lavender", "veil", "whisper", "sage"],
  tropical_forest: ["emerald", "teal", "moss", "lime", "vivid"],
  arctic: ["frost", "veil", "azure", "whisper", "mist"],
  // Beverage aliases
  wine: ["merlot", "garnet", "plum", "ruby", "shadow"],
  whiskey: ["amber", "sienna", "honey", "warm", "ember"],
  mint_tea: ["mint", "frost", "veil", "sage", "whisper"],
  // Digital design context aliases
  saas: ["cobalt", "azure", "violet", "ink", "vivid"],
  fintech: ["cobalt", "azure", "teal", "ink", "frost"],
  healthtech: ["teal", "azure", "mint", "frost", "emerald"],
  ecommerce: ["coral", "vivid", "cobalt", "amber", "bloom"],
  gaming: ["vivid", "violet", "cobalt", "neon", "ink"],
  // Healthcare and wellness
  healthcare: ["azure", "mint", "teal", "frost", "cerulean"],
  wellness: ["mint", "sage", "teal", "jade", "soft"],
  // Food and hospitality
  clay: ["ember", "coral", "apricot", "tone", "muted"],
  ceramic: ["apricot", "honey", "amber", "silk", "pearl"],
  latte: ["honey", "amber", "apricot", "pearl", "muted"],
  // Fashion and beauty
  mauve: ["blush", "orchid", "rose", "plum", "muted"],
  dusty_rose: ["blush", "peony", "rose", "whisper", "muted"],
  nude: ["blush", "apricot", "pearl", "whisper", "muted"],
  champagne: ["citrine", "honey", "amber", "pearl", "whisper"],
  taupe: ["olive", "honey", "apricot", "muted", "tone"],
  // Architecture and interior
  slate: ["cobalt", "azure", "indigo", "tone", "muted"],
  charcoal: ["ink", "shadow", "nocturne", "muted", "cobalt"],
  // Nature and landscape
  dusk: ["merlot", "violet", "indigo", "plum", "shadow"],
  dawn: ["rose", "apricot", "citrine", "whisper", "pearl"],
  // Packaging and material aliases
  packaging: ["ivory", "pearl", "amber", "muted", "soft"],
  artisan: ["clay", "amber", "ivory", "honey", "muted"],
  handmade: ["clay", "amber", "apricot", "honey", "olive"],
  // Aesthetic and lifestyle aliases
  japandi: ["ivory", "olive", "ash", "whisper", "muted"],
  wabi_sabi: ["ivory", "olive", "ash", "honey", "muted"],
  biophilic: ["moss", "leaf", "emerald", "sage", "teal"],
  // Brand and industry aliases
  herbalist: ["moss", "olive", "emerald", "jade", "shadow"],
  natural_beauty: ["blush", "ivory", "peony", "rose", "muted"],
  organic: ["olive", "moss", "amber", "ivory", "leaf"],
  apothecary: ["moss", "jade", "emerald", "shadow", "muted"],
  // Architecture & space aliases
  japandi_interior: ["ivory", "olive", "ash", "fog", "amber"],
  scandi: ["fog", "ash", "ivory", "frost", "veil"],
  // Color trend and aesthetic aliases
  electric: ["vivid", "clear", "neon", "mint", "cobalt"],
  neon_green: ["mint", "lime", "vivid", "clear", "bright"],
  mint_green: ["mint", "seafoam", "jade", "clear", "fresh"],
  powder_blue: ["cerulean", "azure", "mist", "veil", "whisper"],
  dusty_blue: ["cerulean", "azure", "cobalt", "muted", "soft"],
  // Fashion and beauty extended
  rose_gold: ["rose", "blush", "peony", "amber", "pearl"],
  cobalt_blue: ["cobalt", "azure", "sapphire", "clear", "vivid"],
  // Lifestyle and aesthetic
  dark_academia: ["shadow", "sienna", "umber", "ink", "muted"],
  // Industry and brand
  tech_startup: ["cobalt", "violet", "azure", "vivid", "mint"],
  premium: ["pearl", "ivory", "onyx", "garnet", "muted"],
  luxury_brand: ["pearl", "ivory", "garnet", "onyx", "shadow"],
  // Animation and motion design
  gradient: ["vivid", "clear", "bloom", "radiant", "vivid"],
  animation: ["vivid", "coral", "cobalt", "violet", "mint"],
  // Email and marketing
  email: ["ivory", "pearl", "cobalt", "crimson", "muted"],
  newsletter: ["ivory", "muted", "cobalt", "coral", "amber"],
  marketing: ["coral", "vivid", "cobalt", "amber", "crimson"],
  // Color system aliases
  token: ["muted", "soft", "clear", "vivid", "ink"],
  design_system: ["cobalt", "ink", "ivory", "muted", "vivid"],
  brand_color: ["vivid", "clear", "muted", "soft", "pearl"],
  // Photography and visual
  portrait: ["blush", "ivory", "peony", "amber", "pearl"],
  product_photo: ["ivory", "pearl", "frost", "veil", "muted"],
  // Seasonal extended
  // Real estate & property aliases
  real_estate: ["navy", "cream", "ivory", "forest", "muted"],
  property: ["ivory", "pearl", "forest", "navy", "slate"],
  luxury_home: ["ivory", "onyx", "garnet", "muted", "pearl"],
  coastal_home: ["azure", "cerulean", "mist", "pearl", "ivory"],
  farmhouse: ["ivory", "clay", "amber", "sage", "linen"],
  modern_home: ["ink", "ivory", "slate", "ash", "cobalt"],
  // Packaging & print aliases
  packaging_design: ["ivory", "pearl", "amber", "muted", "warm"],
  print_design: ["ivory", "pearl", "muted", "cobalt", "crimson"],
  pantone: ["coral", "cobalt", "vivid", "clear", "muted"],
  shelf: ["vivid", "clear", "coral", "citrine", "cobalt"],
  // Data visualization aliases
  data_viz: ["cobalt", "teal", "coral", "amber", "moss"],
  dashboard: ["cobalt", "azure", "ink", "frost", "vivid"],
  chart: ["cobalt", "coral", "amber", "moss", "violet"],
  analytics: ["cobalt", "azure", "teal", "ink", "vivid"],
  // Photography aliases
  photo_grade: ["amber", "coral", "teal", "ivory", "shadow"],
  film_look: ["amber", "teal", "shadow", "muted", "ivory"],
  split_tone: ["amber", "teal", "shadow", "ivory", "soft"],
  monsoon: ["teal", "cobalt", "slate", "jade", "muted"],
  harvest: ["amber", "ember", "rust", "sienna", "honey"],
  // Color mixing and interpolation
  mix: ["vivid", "clear", "bloom", "soft", "muted"],
  blend: ["vivid", "clear", "bloom", "soft", "muted"],
  oklch: ["vivid", "cobalt", "teal", "emerald", "violet"],
  perceptual: ["muted", "soft", "clear", "vivid", "tone"],
  // Cyberpunk and digital aesthetics
  cyber: ["vivid", "violet", "cobalt", "mint", "ink"],
  cyberpunk: ["vivid", "violet", "cobalt", "neon", "ink"],
  synthwave: ["violet", "fuchsia", "cobalt", "vivid", "nocturne"],
  vaporwave: ["fuchsia", "violet", "cobalt", "vivid", "orchid"],
  neon_blue: ["cobalt", "azure", "cerulean", "vivid", "clear"],
  neon_pink: ["fuchsia", "rose", "orchid", "vivid", "clear"],
  // Monochromatic and single-hue
  monochromatic: ["tone", "muted", "soft", "veil", "shadow"],
  single_hue: ["tone", "muted", "soft", "veil", "vivid"],
  tonal: ["tone", "muted", "soft", "shadow", "veil"],
  scale: ["tone", "muted", "soft", "veil", "vivid"],
  // Dark mode and night interfaces
  dark_mode: ["ink", "shadow", "nocturne", "muted", "cobalt"],
  night_mode: ["ink", "shadow", "nocturne", "teal", "cobalt"],
  dark_ui: ["ink", "shadow", "nocturne", "cobalt", "slate"],
  dark_theme: ["ink", "shadow", "nocturne", "muted", "cobalt"],
  // Data visualization
  sequential: ["teal", "cobalt", "azure", "frost", "vivid"],
  diverging: ["coral", "ivory", "cobalt", "ruby", "azure"],
  categorical: ["coral", "cobalt", "amber", "moss", "violet"],
  heatmap: ["crimson", "amber", "citrine", "frost", "cobalt"],
  // Sustainability and eco
  sustainable: ["moss", "olive", "sage", "teal", "jade"],
  eco: ["moss", "sage", "leaf", "olive", "emerald"],
  renewable: ["moss", "teal", "azure", "lime", "jade"],
  // Arctic and cool nature
  arctic_blue: ["azure", "cobalt", "cerulean", "frost", "veil"],
  ice_blue: ["frost", "veil", "azure", "whisper", "mist"],
  glacier: ["azure", "frost", "cobalt", "veil", "mist"],
  // Warm heritage and craft
  manuscript: ["amber", "honey", "sienna", "ivory", "muted"],
  parchment: ["ivory", "honey", "amber", "veil", "whisper"],
  heritage: ["amber", "sienna", "garnet", "ivory", "muted"],
  antique: ["amber", "ivory", "sienna", "honey", "muted"],
  heirloom: ["ivory", "amber", "rose", "honey", "muted"],
  // Animation and motion
  motion: ["vivid", "cobalt", "coral", "violet", "amber"],
  animated: ["vivid", "coral", "cobalt", "amber", "violet"],
  transition: ["vivid", "soft", "muted", "clear", "tone"],
  // Lifestyle and home decor
  nursery: ["blush", "mint", "lavender", "whisper", "pearl"],
  baby: ["blush", "mint", "lavender", "whisper", "veil"],
  kids: ["coral", "citrine", "mint", "vivid", "bloom"],
  playground: ["coral", "citrine", "vivid", "mint", "cobalt"],
  // Sports and fitness
  athletic: ["cobalt", "vivid", "crimson", "emerald", "amber"],
  sport: ["cobalt", "vivid", "crimson", "emerald", "amber"],
  fitness: ["cobalt", "vivid", "coral", "mint", "ink"],
  // Kitchen and food styling
  kitchen: ["ivory", "amber", "honey", "slate", "warm"],
  bakery: ["amber", "honey", "ivory", "warm", "sienna"],
  pastry: ["blush", "amber", "honey", "ivory", "rose"],
  sourdough: ["amber", "sienna", "honey", "ivory", "warm"],
  // Sci-fi and futuristic
  futuristic: ["cobalt", "violet", "vivid", "azure", "mint"],
  holographic: ["violet", "teal", "cobalt", "vivid", "iridescent"],
  ai_design: ["cobalt", "azure", "violet", "ink", "vivid"],
  // Fruit and plant-based food
  avocado: ["olive", "leaf", "moss", "muted", "tone"],
  mango: ["amber", "citrine", "honey", "vivid", "coral"],
  citrus: ["citrine", "amber", "lime", "vivid", "coral"],
  berry: ["plum", "garnet", "ruby", "violet", "merlot"],
  peach: ["blush", "apricot", "amber", "coral", "whisper"],
  // Music and entertainment
  music: ["violet", "cobalt", "amber", "ink", "vivid"],
  podcast: ["cobalt", "ink", "violet", "ivory", "azure"],
  concert: ["vivid", "amber", "cobalt", "ink", "coral"],
  // Social media and content
  instagram: ["blush", "coral", "amber", "vivid", "ivory"],
  tiktok: ["vivid", "cobalt", "ink", "coral", "mint"],
  content_creator: ["coral", "vivid", "amber", "cobalt", "ivory"],
  // Aurora and northern lights
  aurora: ["teal", "indigo", "violet", "cerulean", "sapphire"],
  northern_lights: ["teal", "indigo", "violet", "cerulean", "sapphire"],
  borealis: ["teal", "cobalt", "violet", "indigo", "azure"],
  // Warm earthy tones
  amber_warm: ["amber", "honey", "ember", "sienna", "warm"],
  earthy: ["sienna", "clay", "amber", "olive", "honey"],
  clay_earth: ["ember", "sienna", "clay", "amber", "rust"],
  // Architectural styles
  mid_century: ["amber", "olive", "rust", "ivory", "honey"],
  art_deco: ["amber", "onyx", "ivory", "garnet", "pearl"],
  bauhaus: ["crimson", "cobalt", "citrine", "onyx", "ivory"],
  // Water and marine
  marine: ["azure", "cobalt", "teal", "sapphire", "lagoon"],
  deep_sea: ["cobalt", "azure", "sapphire", "indigo", "nocturne"],
  lagoon: ["teal", "aqua", "azure", "cerulean", "mint"],
  // Stationery and paper
  stationery: ["ivory", "pearl", "cobalt", "muted", "warm"],
  letterpress: ["ivory", "ink", "pearl", "muted", "amber"],
  journal: ["ivory", "amber", "honey", "ink", "warm"],
  // Print and media aliases
  print: ["ivory", "pearl", "muted", "cobalt", "ink"],
  cmyk: ["crimson", "cobalt", "citrine", "ink", "clear"],
  offset: ["ivory", "muted", "pearl", "amber", "ink"],
  // Gradient and blend aliases
  gradient_mesh: ["vivid", "cobalt", "violet", "teal", "coral"],
  duotone: ["cobalt", "amber", "ink", "ivory", "vivid"],
  overlay: ["violet", "cobalt", "amber", "soft", "muted"],
  // Architectural glass and light
  stained_glass: ["crimson", "cobalt", "citrine", "emerald", "violet"],
  prism: ["coral", "citrine", "emerald", "cobalt", "violet"],
  iridescent: ["teal", "violet", "cobalt", "cerulean", "fuchsia"],
  // Specific material and surface aliases
  frosted_glass: ["frost", "veil", "whisper", "azure", "pearl"],
  brushed_metal: ["ash", "fog", "pearl", "slate", "frost"],
  anodized: ["cobalt", "azure", "violet", "teal", "vivid"],
  // Evening and dusk
  golden_hour: ["amber", "ember", "coral", "honey", "citrine"],
  twilight: ["violet", "indigo", "cobalt", "plum", "rose"],
  afterglow: ["rose", "peony", "amber", "coral", "blush"],
  // Specific brand and design contexts
  saas_dashboard: ["cobalt", "azure", "ink", "frost", "vivid"],
  landing_page: ["cobalt", "ivory", "vivid", "coral", "amber"],
  mobile_ui: ["cobalt", "azure", "vivid", "mint", "coral"],
  // Plant and botanical extended
  succulent: ["jade", "mint", "olive", "teal", "muted"],
  palm: ["lime", "emerald", "leaf", "teal", "vivid"],
  fern: ["moss", "fern", "leaf", "olive", "emerald"],
  // Precious and craft materials
  gold_leaf: ["amber", "honey", "citrine", "pearl", "warm"],
  silver: ["pearl", "frost", "ash", "fog", "veil"],
  platinum: ["pearl", "frost", "ash", "slate", "fog"],
  rose_quartz: ["blush", "pearl", "whisper", "rose", "muted"],
  // Specific color descriptor aliases
  neon_coral: ["coral", "vivid", "ember", "clear", "bloom"],
  electric_purple: ["violet", "orchid", "fuchsia", "vivid", "clear"],
  deep_teal: ["teal", "cobalt", "shadow", "dusk", "soft"],
  dusty_green: ["sage", "olive", "moss", "muted", "soft"],
  // Skin and beauty tones
  tan: ["apricot", "honey", "amber", "sienna", "warm"],
  bronze: ["amber", "sienna", "ember", "honey", "rust"],
  ivory_skin: ["ivory", "pearl", "blush", "whisper", "veil"],
  // Environmental and outdoor
  canyon: ["rust", "sienna", "ember", "clay", "amber"],
  prairie: ["amber", "honey", "olive", "leaf", "warm"],
  tundra: ["frost", "veil", "ash", "mist", "whisper"],
  // Digital-native aesthetics
  lofi: ["muted", "amber", "soft", "warm", "ivory"],
  y2k: ["vivid", "fuchsia", "cobalt", "coral", "citrine"],
  aura: ["violet", "lavender", "orchid", "veil", "blush"],
  cottagecore_green: ["moss", "sage", "fern", "leaf", "muted"],
  // Wayfinding and environmental design
  wayfinding: ["vivid", "clear", "cobalt", "crimson", "citrine"],
  signage: ["vivid", "clear", "cobalt", "crimson", "amber"],
  transit: ["cobalt", "crimson", "amber", "emerald", "violet"],
  navigation: ["cobalt", "azure", "teal", "vivid", "mint"],
  // Data visualization extended
  infographic: ["cobalt", "coral", "amber", "moss", "violet"],
  visualization: ["cobalt", "teal", "coral", "amber", "moss"],
  graph: ["cobalt", "coral", "amber", "emerald", "violet"],
  // Copper and metal patina
  patina: ["jade", "teal", "olive", "muted", "soft"],
  verdigris: ["teal", "jade", "emerald", "muted", "soft"],
  oxidized: ["jade", "teal", "olive", "amber", "muted"],
  aged_metal: ["ember", "olive", "jade", "teal", "muted"],
  // Tropical and resort
  resort: ["lagoon", "aqua", "coral", "blush", "apricot"],
  caribbean: ["lagoon", "aqua", "teal", "cobalt", "vivid"],
  beach_club: ["lagoon", "aqua", "coral", "ivory", "vivid"],
  // HDR and wide gamut
  vivid_brand: ["vivid", "clear", "bloom", "coral", "cobalt"],
  wide_gamut: ["vivid", "clear", "bloom", "radiant", "coral"],
  // Color naming and design system tokens
  primitive: ["tone", "muted", "soft", "clear", "vivid"],
  semantic: ["ink", "frost", "ivory", "cobalt", "crimson"],
  component: ["cobalt", "ivory", "frost", "ink", "vivid"],
  // Film grading and photography color (new)
  grading: ["cinnabar", "ember", "teal", "ivory", "amber"],
  film: ["cinnabar", "ember", "amber", "ivory", "teal"],
  cinematic: ["cinnabar", "rust", "ember", "teal", "ivory"],
  lut: ["ember", "teal", "amber", "rust", "vivid"],
  // Chromatic neutrals extended (new unique keys)
  warm_gray: ["stone", "ivory", "ember", "ash", "muted"],
  cool_gray: ["frost", "ash", "slate", "cobalt", "muted"],
  chromatic_neutral: ["stone", "ash", "frost", "ivory", "whisper"],
  // Brand strategy extended (new unique keys)
  corporate: ["cobalt", "slate", "frost", "ink", "navy"],
  // Packaging color extended (new unique keys)
  variant: ["coral", "cobalt", "amber", "emerald", "violet"],
  // Studio photography
  seamless: ["ivory", "stone", "frost", "ash", "whisper"],
  backdrop: ["ivory", "stone", "frost", "ash", "muted"],
  // Material and physical production
  gloss: ["pearl", "silk", "vivid", "clear", "radiant"],
  matte_finish: ["muted", "tone", "dusk", "shadow", "whisper"],
  velvet_texture: ["emerald", "violet", "plum", "shadow", "nocturne"],
  substrate: ["muted", "tone", "dusk", "whisper", "pearl"],
  metallic_sheen: ["amber", "honey", "citrine", "olive", "silk"],
  translucent: ["mist", "whisper", "veil", "pearl", "bloom"],

  // Desert and Southwest
  adobe: ["ember", "apricot", "amber", "coral", "tone"],
  southwest: ["ember", "apricot", "amber", "olive", "tone"],
  sagebrush: ["olive", "moss", "jade", "lime", "muted"],
  canyon_palette: ["ember", "amber", "ruby", "coral", "shadow"],
  arid: ["amber", "apricot", "ember", "olive", "muted"],
  high_desert: ["ember", "olive", "cobalt", "amber", "muted"],

  // Dark botanical and gothic
  gothic: ["violet", "plum", "mulberry", "shadow", "ink"],
  dark_botanical: ["emerald", "jade", "violet", "plum", "shadow"],
  apothecary_dark: ["violet", "plum", "mulberry", "jade", "emerald"],
  moody_palette: ["violet", "plum", "shadow", "emerald", "muted"],

  // Animation and UX color
  skeleton_screen: ["mist", "whisper", "veil", "pearl"],
  hover_state: ["silk", "bloom", "tone", "clear", "radiant"],
  cta_color: ["vivid", "coral", "amber", "crimson", "cobalt"],

  // Color psychology
  trust: ["cobalt", "cerulean", "azure", "sapphire", "teal"],
  urgency: ["crimson", "coral", "vivid", "ember", "ruby"],
  luxury_dark: ["muted", "shadow", "dusk", "velvet", "ink"],
  calm_palette: ["cerulean", "aqua", "mist", "bloom", "soft"],
  energy_palette: ["vivid", "coral", "amber", "citrine", "lime"],

};

function fuzzyMatch(text: string, query: string): boolean {
  // Exact substring match
  if (text.includes(query)) return true;

  // Token-level: every query word must appear somewhere in the text
  const queryTokens = query.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => text.includes(token));
  }

  // Single-token: allow 1-char edit distance for queries >= 4 chars
  if (query.length >= 4) {
    const words = text.split(/[\s-]+/);
    for (const word of words) {
      if (Math.abs(word.length - query.length) > 1) continue;
      let edits = 0;
      let wi = 0;
      let qi = 0;
      while (wi < word.length && qi < query.length) {
        if (word[wi] !== query[qi]) {
          edits++;
          if (edits > 1) break;
          if (word.length > query.length) wi++;
          else if (query.length > word.length) qi++;
          else { wi++; qi++; }
        } else {
          wi++;
          qi++;
        }
      }
      edits += (word.length - wi) + (query.length - qi);
      if (edits <= 1) return true;
    }
  }

  return false;
}

export function filterColors(
  colors: readonly ColorRecord[],
  searchQuery: string,
  activeFamily: ColorFamily | "All",
): ColorRecord[] {
  const normalizedQuery = normalizeSearchValue(searchQuery);

  if (normalizedQuery.length === 0) {
    return activeFamily === "All"
      ? [...colors]
      : colors.filter((color) => color.family === activeFamily);
  }

  // Expand aliases for semantic search
  const aliasFragments = SEARCH_ALIASES[normalizedQuery] ?? [];

  return colors.filter((color) => {
    const matchesFamily = activeFamily === "All" || color.family === activeFamily;
    if (!matchesFamily) return false;

    const nameLower = color.name.toLowerCase();
    const hexLower = color.hex.toLowerCase();

    // Direct match (fuzzy)
    if (fuzzyMatch(nameLower, normalizedQuery) || hexLower.includes(normalizedQuery)) {
      return true;
    }

    // Alias match
    if (aliasFragments.length > 0) {
      return aliasFragments.some((frag) => nameLower.includes(frag));
    }

    return false;
  });
}
