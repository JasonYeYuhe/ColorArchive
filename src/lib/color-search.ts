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

  // Packaging and print production
  packaging_color: ["amber", "terracotta", "coral", "copper", "muted"],
  kraft_packaging: ["amber", "honey", "ember", "apricot", "tone"],
  spot_color: ["vivid", "crimson", "cobalt", "emerald", "violet"],
  print_production: ["amber", "terracotta", "ember", "cobalt", "muted"],

  // Velvet and evening aesthetics
  evening_palette: ["plum", "violet", "shadow", "nocturne", "mulberry"],
  beauty_palette: ["rose", "blush", "peony", "orchid", "plum"],
  cosmetics: ["rose", "blush", "mulberry", "plum", "violet"],
  fragrance: ["plum", "violet", "rose", "orchid", "shadow"],

  // Coastal fog and maritime
  coastal_fog: ["slate", "cerulean", "cobalt", "sage", "mist"],
  maritime: ["cobalt", "navy", "cerulean", "slate", "shadow"],
  overcast: ["slate", "cerulean", "silver", "mist", "whisper"],
  fog_palette: ["mist", "veil", "whisper", "slate", "cerulean"],
  nordic_coastal: ["cerulean", "cobalt", "slate", "pearl", "mist"],

  // Accessibility and contrast
  high_contrast: ["vivid", "ink", "shadow", "nocturne", "core"],
  accessible: ["vivid", "core", "ink", "shadow", "muted"],
  wcag: ["vivid", "ink", "cobalt", "crimson", "shadow"],

  // Typography color
  body_text: ["ink", "shadow", "slate", "muted", "soft"],
  heading_color: ["ink", "nocturne", "shadow", "core", "muted"],
  text_hierarchy: ["ink", "shadow", "muted", "soft", "whisper"],

  // Data visualization (extended)
  chart_color: ["vivid", "cobalt", "amber", "crimson", "teal"],

  // Mobile UI (OLED-specific)
  oled_dark: ["ink", "nocturne", "shadow", "cobalt", "indigo"],

  // Golden hour / warm photography (extended)
  warm_light: ["amber", "honey", "apricot", "coral", "ember"],
  photography: ["amber", "honey", "teal", "cobalt", "shadow"],

  // Developer / technical dark interfaces
  developer_tool: ["cobalt", "indigo", "violet", "iris", "sapphire"],
  terminal: ["cobalt", "ink", "shadow", "indigo", "violet"],
  ai_interface: ["cobalt", "iris", "violet", "indigo", "shadow"],

  // Marketing and conversion colors (new unique aliases)
  cta_button: ["crimson", "ember", "cobalt", "emerald", "iris"],
  conversion: ["crimson", "ruby", "ember", "cobalt", "emerald"],
  trust_color: ["cobalt", "sapphire", "azure", "teal", "cerulean"],

  // Wayfinding and signage (new unique aliases)
  navigation_color: ["cobalt", "teal", "emerald", "sapphire", "cerulean"],
  zone_color: ["cobalt", "crimson", "emerald", "amber", "teal"],

  // Craft and artisan palette (new unique aliases)
  craft: ["ember", "coral", "apricot", "honey", "amber"],
  pottery: ["ember", "coral", "honey", "amber", "merlot"],

  // Fresh herb and botanical palette (new unique aliases)
  herb: ["mint", "seafoam", "jade", "moss", "leaf"],
  supplement: ["mint", "jade", "teal", "cobalt", "seafoam"],
  fresh_green: ["mint", "seafoam", "jade", "moss", "leaf"],

  // Linen, natural textile, and organic material aliases
  linen_white: ["ivory", "veil", "whisper", "pearl", "warm"],
  raw_linen: ["ivory", "honey", "amber", "veil", "whisper"],
  natural_white: ["ivory", "whisper", "veil", "frost", "pearl"],
  unbleached: ["ivory", "honey", "amber", "warm", "pearl"],
  parchment_warm: ["ivory", "amber", "honey", "sienna", "veil"],

  // Mushroom and neutral earthy aliases
  mushroom: ["stone", "ivory", "ash", "warm", "muted"],
  putty: ["stone", "ivory", "ash", "olive", "muted"],
  greige: ["stone", "ivory", "olive", "honey", "muted"],
  warm_white: ["ivory", "whisper", "veil", "pearl", "warm"],
  off_white: ["ivory", "whisper", "veil", "pearl", "frost"],

  // Color temperature aliases
  warm_palette: ["amber", "ember", "coral", "honey", "citrine"],
  cool_palette: ["azure", "cobalt", "cerulean", "teal", "frost"],
  neutral_palette: ["ivory", "ash", "fog", "slate", "muted"],
  temperature_balanced: ["amber", "azure", "ivory", "teal", "coral"],

  // Ink and editorial aliases
  editorial_dark: ["ink", "shadow", "ivory", "amber", "muted"],
  luxury_editorial: ["ink", "ivory", "amber", "garnet", "pearl"],
  magazine: ["ivory", "ink", "amber", "coral", "cobalt"],
  newspaper: ["ivory", "ink", "ash", "shadow", "muted"],

  // Pastel extended
  pastel_pink: ["blush", "peony", "rose", "whisper", "veil"],
  pastel_blue: ["azure", "cerulean", "frost", "whisper", "veil"],
  pastel_green: ["mint", "seafoam", "jade", "whisper", "veil"],
  pastel_yellow: ["citrine", "honey", "amber", "whisper", "veil"],
  pastel_purple: ["lavender", "lilac", "orchid", "whisper", "veil"],
  candy_pastel: ["blush", "mint", "lavender", "citrine", "coral"],

  // Festival and celebration aliases
  festival: ["vivid", "coral", "citrine", "violet", "fuchsia"],
  celebration: ["vivid", "coral", "amber", "citrine", "crimson"],
  party: ["coral", "citrine", "vivid", "fuchsia", "cobalt"],
  wedding_palette: ["blush", "ivory", "peony", "pearl", "gold"],
  graduation: ["cobalt", "gold", "ivory", "amber", "garnet"],

  // Architecture style aliases
  organic_architecture: ["olive", "amber", "sienna", "moss", "ivory"],
  sustainable_design: ["moss", "olive", "sage", "teal", "ivory"],
  biophilic_design: ["moss", "fern", "leaf", "emerald", "ivory"],
  green_building: ["moss", "olive", "teal", "jade", "ivory"],

  // Specific UI context aliases
  onboarding: ["cobalt", "vivid", "ivory", "coral", "mint"],
  empty_state: ["mist", "whisper", "veil", "pearl", "soft"],
  success_state: ["emerald", "jade", "teal", "mint", "vivid"],
  warning_state: ["amber", "honey", "citrine", "ember", "warm"],
  error_state: ["crimson", "ruby", "ember", "garnet", "vivid"],
  info_state: ["cobalt", "azure", "cerulean", "teal", "vivid"],


  // Motion design and animation states
  motion_design: ["vivid", "cobalt", "coral", "violet", "amber"],
  temporal: ["vivid", "cobalt", "coral", "soft", "muted"],
  streaming: ["cobalt", "azure", "violet", "indigo", "teal"],
  generative: ["cobalt", "violet", "indigo", "azure", "vivid"],
  interactive: ["cobalt", "vivid", "coral", "amber", "emerald"],

  // Color management and print
  cross_media: ["ivory", "muted", "pearl", "cobalt", "amber"],
  color_management: ["ivory", "cobalt", "muted", "pearl", "amber"],
  pantone_color: ["coral", "cobalt", "vivid", "emerald", "amber"],
  brand_specification: ["cobalt", "ivory", "muted", "pearl", "vivid"],

  // Design token extended
  dark_mode_token: ["ink", "shadow", "nocturne", "cobalt", "slate"],
  light_mode_token: ["ivory", "frost", "pearl", "cobalt", "azure"],
  design_token: ["cobalt", "ink", "ivory", "muted", "vivid"],
  token_system: ["ink", "ivory", "cobalt", "frost", "vivid"],

  // E-commerce extended
  conversion_color: ["vivid", "crimson", "coral", "cobalt", "amber"],
  retail_color: ["coral", "vivid", "cobalt", "amber", "ivory"],
  checkout: ["cobalt", "emerald", "crimson", "amber", "ivory"],
  purchase: ["cobalt", "crimson", "coral", "emerald", "amber"],

  // AI and generative interfaces
  generating: ["cobalt", "azure", "violet", "indigo", "teal"],
  uncertainty: ["amber", "honey", "warm", "muted", "soft"],
  ai_product: ["cobalt", "violet", "indigo", "azure", "vivid"],
  chatbot: ["cobalt", "azure", "violet", "teal", "ink"],

  // New palette collection aliases
  desert_palette: ["amber", "sienna", "honey", "rust", "clay"],
  ochre: ["amber", "honey", "citrine", "sienna", "warm"],
  sandstone: ["amber", "honey", "sienna", "clay", "warm"],
  golden_sand: ["amber", "citrine", "honey", "sienna", "warm"],
  vibrant_purple: ["violet", "fuchsia", "orchid", "vivid", "plum"],
  indigo_palette: ["indigo", "violet", "cobalt", "azure", "sapphire"],
  forest_palette: ["moss", "emerald", "fern", "jade", "olive"],
  woodland: ["moss", "fern", "ember", "sienna", "leaf"],
  bark: ["sienna", "umber", "amber", "honey", "clay"],
  lichen: ["sage", "olive", "moss", "jade", "muted"],
  oyster: ["ivory", "pearl", "ash", "veil", "whisper"],
  mother_of_pearl: ["pearl", "ivory", "frost", "veil", "whisper"],
  raw_silk: ["ivory", "pearl", "blush", "whisper", "veil"],
  quiet_luxury: ["pearl", "ivory", "onyx", "garnet", "muted"],
  old_money: ["ivory", "pearl", "navy", "garnet", "onyx"],
  understated: ["muted", "soft", "ivory", "pearl", "slate"],

  // Wayfinding and environmental design (new terms)
  environmental: ["jade", "teal", "olive", "amber", "slate"],

  // Luxury brand color (new terms)
  prestige: ["garnet", "indigo", "ivory", "pearl", "onyx"],
  legacy: ["garnet", "navy", "ivory", "amber", "onyx"],
  refined: ["pearl", "ivory", "slate", "muted", "onyx"],

  // Data visualization (new terms)
  choropleth: ["cobalt", "teal", "jade", "amber", "slate"],

  // Packaging design (new terms)
  fmcg: ["amber", "cobalt", "jade", "red", "ivory"],
  organic_packaging: ["jade", "olive", "amber", "ivory", "whisper"],

  // Sustainability color (new terms)
  greenwashing: ["jade", "olive", "amber", "ivory", "moss"],
  eco_brand: ["jade", "moss", "olive", "amber", "teal"],
  regenerative: ["moss", "jade", "amber", "olive", "teal"],

  // New collection identities (new terms)
  chrome: ["slate", "cobalt", "ivory", "whisper", "muted"],
  metallic: ["slate", "amber", "cobalt", "ivory", "whisper"],
  tuscan: ["amber", "coral", "olive", "sienna", "clay"],
  mediterranean: ["amber", "coral", "olive", "teal", "sienna"],
  terracotta_palette: ["amber", "coral", "sienna", "clay", "rust"],
  lilac: ["iris", "violet", "soft", "whisper", "muted"],
  mindful: ["iris", "violet", "teal", "jade", "soft"],
  bamboo: ["jade", "olive", "teal", "whisper", "soft"],
  wellness_green: ["jade", "teal", "olive", "soft", "whisper"],

  // Fashion color forecasting (new terms)
  forecast: ["amber", "rose", "iris", "teal", "coral"],
  trend: ["coral", "iris", "amber", "teal", "rose"],
  coloroftheyear: ["coral", "iris", "amber", "rose", "teal"],
  trending_color: ["coral", "iris", "amber", "rose", "teal"],
  fashion_palette: ["rose", "ivory", "coral", "amber", "iris"],

  // Film and cinematography (new terms)
  film_grade: ["navy", "amber", "ivory", "teal", "rust"],
  cinematic_teal: ["teal", "cobalt", "navy", "jade", "shadow"],
  noir: ["black", "navy", "ivory", "shadow", "midnight"],
  colorgrade: ["navy", "amber", "teal", "ivory", "cobalt"],
  moody_film: ["navy", "amber", "shadow", "teal", "rust"],

  // Healthcare and clinical (new terms)
  clinical: ["cobalt", "ivory", "teal", "cyan", "whisper"],
  hospital: ["cobalt", "ivory", "teal", "cyan", "soft"],
  calming_blue: ["cobalt", "teal", "cyan", "soft", "whisper"],
  therapeutic: ["teal", "jade", "cobalt", "iris", "soft"],

  // Spatial and interior design (new terms)
  interior_color: ["amber", "ivory", "slate", "teal", "olive"],
  room_color: ["amber", "ivory", "slate", "olive", "rose"],
  architectural: ["slate", "ivory", "amber", "cobalt", "navy"],
  spatial: ["slate", "cobalt", "teal", "ivory", "amber"],
  wallpaint: ["ivory", "slate", "amber", "olive", "rose"],

  // Arctic and nordic (new terms)
  nordic_color: ["cyan", "cobalt", "slate", "ivory", "whisper"],
  glacial: ["cyan", "cobalt", "teal", "whisper", "soft"],
  polar: ["cyan", "cobalt", "slate", "ivory", "teal"],
  frost: ["cyan", "ivory", "cobalt", "whisper", "soft"],

  // Deep ocean (new terms)
  deep_blue: ["navy", "cobalt", "teal", "shadow", "depth"],
  ocean_depth: ["navy", "teal", "cobalt", "shadow", "depth"],
  submarine: ["navy", "teal", "cobalt", "shadow", "depth"],

  // Desert and arid (new terms)
  scorched: ["amber", "rust", "sienna", "clay", "shadow"],
  rust_palette: ["rust", "amber", "sienna", "clay", "shadow"],
  wildwest: ["amber", "rust", "sienna", "clay", "ivory"],

  // Beauty and lifestyle (new terms)
  blush_palette: ["rose", "peach", "pink", "soft", "whisper"],
  beauty_brand: ["rose", "peach", "ivory", "coral", "soft"],
  skincare: ["rose", "peach", "ivory", "soft", "whisper"],
  desert_rose: ["rose", "peach", "amber", "soft", "whisper"],
  sun_kissed: ["peach", "amber", "rose", "coral", "soft"],
  feminine_minimal: ["rose", "ivory", "peach", "soft", "whisper"],
  css_named: ["slate", "crimson", "cobalt", "amber", "jade"],
  css_color: ["slate", "cobalt", "azure", "amber", "rose"],
  cornflowerblue: ["cobalt", "azure", "cerulean", "soft", "clear"],
  rebeccapurple: ["violet", "iris", "indigo", "shadow", "vivid"],
  goldenrod: ["amber", "honey", "citrine", "soft", "muted"],
  chartreuse: ["lime", "citrine", "leaf", "vivid", "clear"],
  aquamarine: ["aqua", "teal", "jade", "mint", "soft"],
  periwinkle: ["iris", "cobalt", "violet", "soft", "muted"],
  celadon: ["jade", "seafoam", "mint", "soft", "whisper"],
  vermillion: ["crimson", "ember", "coral", "vivid", "strong"],
  prussian: ["cobalt", "indigo", "sapphire", "shadow", "deep"],
  phthalo: ["emerald", "jade", "teal", "vivid", "shadow"],
  titanium: ["slate", "silver", "cobalt", "tone", "muted"],
  tungsten: ["slate", "shadow", "ash", "stone", "dark"],
  animation_color: ["vivid", "azure", "amber", "rose", "emerald"],
  ui_animation: ["cobalt", "azure", "soft", "bloom", "clear"],
  navy_signal: ["cobalt", "crimson", "slate", "shadow", "navy"],
  nautical: ["cobalt", "navy", "crimson", "slate", "white"],
  lemon: ["citrine", "honey", "amber", "vivid", "bloom"],
  tangerine: ["amber", "coral", "apricot", "vivid", "bloom"],
  stone_garden: ["slate", "ash", "limestone", "warm", "muted"],
  karesansui: ["slate", "ash", "ivory", "whisper", "stone"],
  typography_color: ["ink", "slate", "shadow", "dark", "strong"],
  chromatic_type: ["crimson", "cobalt", "amber", "vivid", "ink"],
  material_color: ["slate", "amber", "copper", "ivory", "muted"],
  gold_palette: ["amber", "honey", "citrine", "vivid", "rich"],
  precious_metal: ["amber", "slate", "ivory", "shadow", "deep"],
  // Accessibility
  a11y: ["cobalt", "indigo", "shadow", "ink", "dark"],
  accessible_color: ["cobalt", "shadow", "ink", "core", "dusk"],
  color_blindness: ["cerulean", "cobalt", "azure", "muted", "shadow"],
  inclusive_design: ["azure", "cobalt", "seafoam", "shadow", "clear"],
  // Dark mode
  dark_palette: ["nocturne", "shadow", "dusk", "ink", "deep"],
  // Print and production
  offset_print: ["cobalt", "crimson", "ink", "shadow", "pure"],
  print_color: ["crimson", "cobalt", "citrine", "shadow", "vivid"],
  // Cultural colors
  chinese_color: ["crimson", "ruby", "amber", "vivid", "warm"],
  lunar_new_year: ["crimson", "ruby", "amber", "vivid", "bloom"],
  festive_red: ["crimson", "ruby", "coral", "vivid", "bloom"],
  japanese_aesthetics: ["whisper", "ink", "pearl", "muted", "shadow"],
  scandinavian_color: ["cobalt", "whisper", "pearl", "muted", "faint"],
  mediterranean_color: ["azure", "cobalt", "amber", "coral", "vivid"],
  // Morning and soft warmth
  morning_light: ["apricot", "amber", "coral", "bloom", "soft"],
  soft_warmth: ["apricot", "amber", "coral", "bloom", "whisper"],
  // Library and editorial dark
  midnight_palette: ["indigo", "cobalt", "violet", "nocturne", "ink"],
  // Lavender and wellness
  lavender_palette: ["iris", "orchid", "violet", "plum", "soft"],
  lilac_palette: ["iris", "orchid", "plum", "bloom", "muted"],
  wellness_color: ["iris", "orchid", "teal", "seafoam", "whisper"],
  spa_color: ["iris", "orchid", "teal", "aqua", "whisper"],
  // Forest and outdoor
  forest_green: ["emerald", "moss", "leaf", "jade", "shadow"],
  old_growth: ["emerald", "moss", "jade", "shadow", "dusk"],
  // AI and generative
  generative_palette: ["cobalt", "violet", "iris", "vivid", "bloom"],
  ai_palette: ["cobalt", "sapphire", "iris", "violet", "vivid"],
  algorithmic: ["cobalt", "azure", "cerulean", "vivid", "clear"],
  // Color theory education
  analogous: ["coral", "amber", "citrine", "honey", "olive"],
  complementary: ["cobalt", "amber", "coral", "citrine", "vivid"],
  triadic: ["crimson", "cobalt", "citrine", "vivid", "clear"],
  split_complementary: ["violet", "amber", "coral", "soft", "muted"],
  tetradic: ["cobalt", "crimson", "citrine", "violet", "vivid"],
  // Interior and home design styles
  hygge: ["amber", "ivory", "honey", "sienna", "warm"],
  maximalist: ["vivid", "coral", "violet", "amber", "cobalt"],
  mid_century_modern: ["amber", "olive", "rust", "ivory", "honey"],
  // Photography types
  street_photography: ["ink", "shadow", "slate", "ash", "ivory"],
  landscape_photo: ["amber", "teal", "cobalt", "moss", "azure"],
  food_photography: ["amber", "coral", "honey", "ivory", "warm"],
  // Cultural palettes
  indian_color: ["crimson", "amber", "citrine", "cobalt", "vivid"],
  african_palette: ["ember", "amber", "cobalt", "citrine", "rust"],
  latin_palette: ["coral", "amber", "cobalt", "vivid", "crimson"],
  middle_eastern: ["amber", "garnet", "cobalt", "ivory", "vivid"],
  // Workspace and focus
  home_office: ["cobalt", "ivory", "slate", "azure", "muted"],
  workspace: ["cobalt", "ivory", "slate", "teal", "muted"],
  focus_mode: ["cobalt", "azure", "ivory", "muted", "soft"],
  // Design movements
  constructivism: ["crimson", "cobalt", "citrine", "onyx", "ivory"],
  pop_art: ["crimson", "cobalt", "citrine", "vivid", "onyx"],
  art_nouveau: ["olive", "amber", "jade", "plum", "ivory"],
  impressionism: ["blush", "lavender", "amber", "soft", "muted"],
  // Americana and heritage
  vintage_americana: ["cobalt", "crimson", "amber", "honey", "ivory"],
  barnwood: ["sienna", "honey", "amber", "ivory", "shadow"],
  // Tea and ceremony
  tea_ceremony: ["amber", "honey", "moss", "jade", "whisper"],
  matcha_palette: ["moss", "jade", "olive", "whisper", "soft"],
  // Electric and neon
  electric_palette: ["violet", "cobalt", "iris", "teal", "fuchsia"],
  neon_spectrum: ["violet", "cobalt", "iris", "teal", "fuchsia"],
  // Metal and patina
  copper_palette: ["ember", "amber", "jade", "teal", "honey"],
  // Packaging and retail
  consumer_goods: ["amber", "coral", "cobalt", "ivory", "vivid"],
  shelf_impact: ["vivid", "coral", "amber", "cobalt", "citrine"],
  retail_display: ["vivid", "coral", "amber", "cobalt", "citrine"],
  // Adaptive and dark/light mode
  adaptive_ui: ["cobalt", "azure", "ink", "ivory", "frost"],
  dark_light: ["cobalt", "ink", "ivory", "azure", "frost"],
  mode_switching: ["cobalt", "ink", "ivory", "azure", "shadow"],
  semantic_token: ["cobalt", "azure", "ivory", "muted", "soft"],
  // Design tokens and systems
  variable_color: ["cobalt", "azure", "ivory", "soft", "muted"],
  component_library: ["cobalt", "azure", "ivory", "ink", "vivid"],
  // Color forecasting and trends
  fashion_forecast: ["blush", "coral", "amber", "vivid", "soft"],
  trend_color: ["vivid", "coral", "amber", "cobalt", "iris"],
  pantone_year: ["vivid", "coral", "amber", "cobalt", "iris"],
  color_cycle: ["vivid", "coral", "amber", "cobalt", "iris"],
  emerging_trend: ["vivid", "coral", "iris", "cobalt", "amber"],
  // Film and photography grading
  color_grade: ["amber", "teal", "ink", "shadow", "muted"],
  cinematic_color: ["amber", "teal", "ink", "shadow", "cobalt"],
  lut_preset: ["amber", "teal", "ink", "shadow", "cobalt"],
  split_toning: ["amber", "teal", "shadow", "ink", "cobalt"],
  // Solar and energy
  solar_energy: ["amber", "citrine", "vivid", "coral", "ember"],
  heat_wave: ["ember", "amber", "coral", "vivid", "citrine"],
  summer_vivid: ["coral", "amber", "vivid", "citrine", "ember"],
  // Cloud and minimal
  cloud_minimal: ["cerulean", "azure", "cobalt", "frost", "veil"],
  airy_space: ["cerulean", "azure", "cobalt", "frost", "whisper"],
  clean_digital: ["cobalt", "azure", "ivory", "frost", "veil"],
  // Autumn and harvest
  harvest_season: ["amber", "sienna", "garnet", "olive", "honey"],
  autumn_palette: ["amber", "rust", "garnet", "olive", "sienna"],
  fall_editorial: ["amber", "rust", "garnet", "olive", "sienna"],
  // Nordic winter
  nordic_winter: ["cerulean", "indigo", "cobalt", "frost", "azure"],
  ice_palette: ["cerulean", "azure", "cobalt", "frost", "whisper"],
  winter_palette: ["cerulean", "azure", "indigo", "cobalt", "frost"],
  arctic_palette: ["cerulean", "azure", "indigo", "cobalt", "veil"],
  // Data visualization
  data_color: ["cobalt", "teal", "amber", "coral", "emerald"],
  chart_palette: ["cobalt", "teal", "amber", "coral", "citrine"],
  graph_palette: ["cobalt", "teal", "amber", "jade", "citrine"],
  dataviz: ["cobalt", "teal", "amber", "coral", "emerald"],
  sequential_scale: ["cobalt", "cerulean", "azure", "frost", "veil"],
  categorical_palette: ["cobalt", "teal", "amber", "coral", "violet"],
  // Famous brands
  google_colors: ["cobalt", "ember", "citrine", "emerald"],
  spotify_green: ["emerald", "jade", "moss"],
  netflix_red: ["ember", "crimson", "coral"],
  apple_gray: ["cool-gray", "warm-gray", "neutral"],
  brand_blue: ["cobalt", "azure", "cerulean", "indigo"],
  // Design system colors
  success_color: ["emerald", "jade", "moss", "lime"],
  warning_color: ["amber", "citrine", "honey", "ember"],
  error_color: ["ember", "crimson", "coral", "rose"],
  info_color: ["cobalt", "azure", "cerulean", "teal"],
  neutral_system: ["cool-gray", "warm-gray", "true-gray", "ivory"],
  // Color system architecture
  token_color: ["cobalt", "azure", "teal", "indigo"],
  system_color: ["cobalt", "azure", "teal", "neutral"],
  design_tokens: ["cobalt", "azure", "teal", "neutral", "ivory"],
  // Historical and cultural
  renaissance_color: ["cobalt", "amber", "crimson", "ivory", "gold"],
  medieval_color: ["cobalt", "crimson", "amber", "jade", "ivory"],
  imperial_purple: ["violet", "indigo", "plum"],
  royal_blue_classic: ["cobalt", "indigo", "azure"],
  pigment_blue: ["cobalt", "indigo", "cerulean"],
  // Negative space and minimal
  breathing_room: ["ivory", "veil", "frost", "whisper"],
  empty_space: ["ivory", "veil", "frost", "neutral"],
  premium_neutral: ["warm-gray", "cool-gray", "ivory", "frost"],
  luxury_neutral: ["warm-gray", "ivory", "frost", "veil"],
  restraint_palette: ["warm-gray", "cool-gray", "ivory"],
  // E-commerce and conversion
  add_to_cart: ["cobalt", "emerald", "amber", "vivid"],
  shop_palette: ["cobalt", "coral", "amber", "ivory", "vivid"],
  storefront_color: ["cobalt", "amber", "coral", "ivory", "emerald"],
  // Wayfinding and transit
  wayfinding_color: ["cerulean", "amber", "ember", "emerald", "cobalt"],
  transit_color: ["cerulean", "cobalt", "amber", "ember", "emerald"],
  signage_color: ["cobalt", "cerulean", "amber", "ember", "vivid"],
  metro_palette: ["cerulean", "amber", "emerald", "ember", "cobalt"],
  // Synesthesia and cross-modal
  sound_color: ["cobalt", "violet", "indigo", "amber", "vivid"],
  music_palette: ["cobalt", "violet", "indigo", "crimson", "vivid"],
  sensory_color: ["cobalt", "violet", "coral", "teal", "vivid"],
  audio_visual: ["cobalt", "violet", "indigo", "amber"],
  // Fashion and runway
  runway_palette: ["ivory", "warm-gray", "apricot", "merlot", "shadow"],
  couture_color: ["ivory", "apricot", "warm-gray", "merlot"],
  fashion_neutral: ["apricot", "honey", "ivory", "warm-gray", "muted"],
  haute_couture: ["ivory", "apricot", "honey", "warm-gray"],
  // Forest and nature immersion
  forest_bath: ["moss", "leaf", "emerald", "olive", "lime"],
  shinrin_yoku: ["moss", "emerald", "leaf", "olive", "jade"],
  canopy_green: ["leaf", "lime", "emerald", "moss", "jade"],
  undergrowth: ["olive", "moss", "emerald", "jade", "shadow"],
  // Y2K and millennium nostalgia
  y2k_palette: ["cobalt", "iris", "lime", "magenta", "vivid"],
  millennium_color: ["cobalt", "azure", "lime", "vivid", "magenta"],
  retro_digital: ["cobalt", "iris", "lime", "vivid", "azure"],
  early_internet: ["cobalt", "iris", "lime", "fuchsia", "vivid"],
  // Memory and nostalgia
  memory_color: ["amber", "honey", "muted", "ivory", "sienna"],
  nostalgic_palette: ["amber", "sienna", "muted", "garnet", "soft"],
  retro_warmth: ["amber", "honey", "coral", "sienna", "muted"],
  faded_memory: ["muted", "soft", "amber", "warm-gray", "ivory"],
  childhood_palette: ["coral", "citrine", "mint", "peony", "sky"],
  // Packaging and product
  packaging_neutral: ["ivory", "warm-gray", "soft", "pearl", "muted"],
  product_color: ["amber", "coral", "teal", "indigo", "vivid"],
  shelf_color: ["crimson", "azure", "citrine", "emerald", "clear"],
  // Dark mode and dark UI
  oled_black: ["ink", "coal", "onyx", "deep", "shadow"],
  dark_background: ["ink", "shadow", "nocturne", "slate", "deep"],
  // Accessibility and contrast
  high_contrast_color: ["ink", "vivid", "clear", "crimson", "cobalt"],
  wcag_color: ["ink", "vivid", "cobalt", "emerald", "crimson"],
  colorblind_safe: ["cobalt", "amber", "teal", "ink", "honey"],
  // Neon and fluorescent
  fluorescent_color: ["vivid", "lime", "fuchsia", "citrine", "cobalt"],
  neon_sign: ["fuchsia", "lime", "cobalt", "citrine", "vivid"],
  blacklight_color: ["violet", "orchid", "indigo", "fuchsia", "vivid"],
  glow_color: ["teal", "fuchsia", "cobalt", "lime", "vivid"],
  // Architecture and materials
  concrete_gray: ["cool-gray", "warm-gray", "slate", "fog", "cement"],
  brutalist_color: ["cool-gray", "warm-gray", "concrete", "shadow", "ink"],
  architectural_neutral: ["warm-gray", "cool-gray", "slate", "fog", "ivory"],
  raw_material: ["warm-gray", "sienna", "amber", "slate", "coal"],
  // Nordic and boreal
  boreal_palette: ["emerald", "moss", "jade", "cool-gray", "frost"],
  nordic_forest: ["emerald", "moss", "leaf", "cool-gray", "shadow"],
  spruce_green: ["emerald", "jade", "moss", "shadow", "leaf"],
  birch_white: ["warm-gray", "ivory", "pearl", "veil", "cool-gray"],

  // Jazz and music venue
  jazz_palette: ["amber", "ember", "honey", "shadow", "ivory"],
  jazz_club: ["amber", "warm-gray", "ivory", "shadow", "sienna"],
  late_night: ["shadow", "amber", "ivory", "dark", "warm-gray"],
  brass_color: ["amber", "honey", "citrine", "warm-gray", "ivory"],
  velvet_curtain: ["merlot", "garnet", "plum", "shadow", "ivory"],
  // Polar and arctic expedition
  polar_palette: ["frost", "azure", "cobalt", "apricot", "navy"],
  expedition_color: ["azure", "cobalt", "apricot", "frost", "cool-gray"],
  arctic_explorer: ["frost", "azure", "navy", "apricot", "cool-gray"],
  high_latitude: ["cobalt", "frost", "azure", "navy", "cool-gray"],
  survival_orange: ["apricot", "coral", "amber", "vivid", "ember"],
  // Ceramics and craft
  celadon_glaze: ["seafoam", "sage", "jade", "whisper", "soft"],
  glazed_ceramic: ["ivory", "seafoam", "rose", "warm-gray", "apricot"],
  studio_pottery: ["ivory", "warm-gray", "amber", "sage", "apricot"],
  stoneware: ["warm-gray", "ivory", "slate", "amber", "muted"],
  kiln_color: ["amber", "sienna", "ember", "ivory", "warm-gray"],
  // Documentary and realism
  documentary: ["teal", "apricot", "cool-gray", "shadow", "ivory"],
  verité: ["teal", "cobalt", "apricot", "cool-gray", "shadow"],
  handheld_film: ["teal", "shadow", "amber", "cool-gray", "muted"],
  available_light: ["amber", "apricot", "cool-gray", "shadow", "ivory"],
  // Monsoon and tropical rain
  monsoon_season: ["jade", "emerald", "warm-gray", "amber", "lime"],
  tropical_rain: ["jade", "moss", "emerald", "lime", "warm-gray"],
  rainforest_floor: ["moss", "shadow", "jade", "amber", "olive"],
  humid: ["jade", "teal", "lime", "moss", "warm-gray"],
  // Decade color history
  "1920s": ["honey", "shadow", "ivory", "garnet", "emerald"],
  jazz_age: ["honey", "shadow", "ivory", "mulberry", "garnet"],
  "1950s": ["mint", "coral", "honey", "cerulean", "cool-gray"],
  atomic_age: ["mint", "coral", "cerulean", "honey", "warm-gray"],
  "1960s": ["honey", "fuchsia", "cobalt", "lime", "violet"],
  "1970s": ["amber", "olive", "ember", "honey", "moss"],
  earth_tone: ["amber", "olive", "ember", "honey", "moss"],
  harvest_gold: ["amber", "honey", "citrine", "warm-gray"],
  avocado_green: ["olive", "moss", "lime", "leaf"],
  burnt_orange: ["ember", "coral", "amber", "ruby"],
  "1980s": ["fuchsia", "cerulean", "lime", "citrine", "violet"],
  neon_palette: ["fuchsia", "cerulean", "lime", "citrine", "magenta"],
  miami_vice: ["cerulean", "rose", "blush", "teal", "shadow"],
  "1990s": ["cool-gray", "olive", "garnet", "teal", "blush"],
  grunge: ["cool-gray", "shadow", "olive", "garnet", "muted"],
  "2000s": ["blush", "cerulean", "lime", "coral", "cool-gray"],
  millennial_pink: ["blush", "rose", "apricot", "warm-gray"],
  "2020s": ["iris", "leaf", "coral", "apricot", "cobalt"],
  very_peri: ["iris", "violet", "cobalt", "periwinkle", "indigo"],
  sage_green: ["leaf", "mint", "moss", "olive", "jade"],

  // Restaurant, food, and appetite
  restaurant: ["ember", "amber", "garnet", "coral", "merlot"],
  dining: ["ember", "amber", "honey", "garnet", "ivory"],
  appetite: ["crimson", "ember", "coral", "amber", "citrine"],
  bistro: ["merlot", "amber", "ivory", "garnet", "olive"],

  // Interface and UX design
  ui_design: ["cobalt", "cerulean", "ink", "cool-gray", "azure"],
  ux: ["cobalt", "cerulean", "slate", "azure", "frost"],
  interface: ["cobalt", "cerulean", "cool-gray", "azure", "ink"],
  mobile_app: ["cobalt", "cerulean", "azure", "blush", "fuchsia"],

  // Monochrome and grayscale
  grayscale: ["cool-gray", "ink", "shadow", "pearl", "mist"],
  greyscale: ["cool-gray", "ink", "shadow", "pearl", "mist"],
  mono: ["ink", "cool-gray", "shadow", "pearl", "whisper"],
  black_and_white: ["ink", "cool-gray", "pearl", "whisper", "shadow"],

  // Business and branding
  business_card: ["ink", "cobalt", "ivory", "garnet", "cool-gray"],
  hospitality: ["amber", "ivory", "garnet", "ember", "sage"],
  interior_design: ["ivory", "amber", "sage", "terracotta", "olive"],
  branding: ["cobalt", "garnet", "amber", "ink", "ivory"],

  // Fashion and wardrobe
  wardrobe: ["caramel", "ivory", "cobalt", "cool-gray", "blush"],
  capsule: ["ivory", "caramel", "cobalt", "cool-gray", "teal"],
  lookbook: ["ivory", "blush", "caramel", "garnet", "olive"],

  // Nordic and Scandinavian
  scandinavian: ["cool-gray", "birch", "arctic", "pewter", "ivory"],
  minimalist: ["cool-gray", "ivory", "ink", "pewter", "arctic"],

  // Nostalgia and vintage memory
  nostalgia: ["amber", "caramel", "blush", "warm-gray", "ivory"],
  nostalgic: ["amber", "warm-gray", "blush", "caramel", "ivory"],
  memory: ["blush", "amber", "caramel", "warm-gray", "rose"],
  analog: ["amber", "caramel", "warm-gray", "blush", "olive"],
  // Print production and press
  press_ready: ["ivory", "muted", "pearl", "ink", "amber"],
  spot_printing: ["vivid", "crimson", "cobalt", "emerald", "amber"],
  substrate_neutral: ["ivory", "pearl", "muted", "warm-gray", "whisper"],

  // Hospitality color contexts
  hotel_lobby: ["amber", "honey", "ivory", "coral", "warm-gray"],
  hotel_room: ["ivory", "warm-gray", "amber", "muted", "whisper"],
  restaurant_interior: ["ember", "amber", "garnet", "ivory", "warm-gray"],
  fine_dining: ["ivory", "pearl", "onyx", "garnet", "muted"],
  bar_color: ["shadow", "amber", "garnet", "merlot", "ink"],

  // Data visualization specifics
  sequential_palette: ["cobalt", "cerulean", "azure", "mist", "whisper"],
  diverging_palette: ["cobalt", "frost", "crimson", "teal", "ivory"],
  chart_background: ["ivory", "frost", "whisper", "pearl", "veil"],

  // Lighting and environment
  warm_interior: ["amber", "honey", "ivory", "coral", "warm-gray"],
  cool_interior: ["frost", "cerulean", "azure", "cobalt", "cool-gray"],
  daylight_color: ["frost", "veil", "whisper", "cerulean", "ivory"],
  candlelight: ["amber", "ember", "honey", "apricot", "warm-gray"],

  // Motion and animation
  motion_brand: ["cobalt", "teal", "azure", "amber", "vivid"],
  brand_animation: ["cobalt", "teal", "electric", "amber", "charcoal"],
  ui_microinteraction: ["cobalt", "frost", "azure", "ivory", "slate"],

  // Retail and packaging
  retail_shelf: ["crimson", "amber", "vermilion", "coral", "vivid"],
  natural_packaging: ["sage", "terracotta", "ivory", "warm-gray", "kraft"],
  artisan_product: ["terracotta", "sage", "warm-brown", "ivory", "stone"],

  // Healthcare and children
  pediatric_color: ["sky", "sage", "coral", "ivory", "soft"],
  healthcare_interior: ["sky", "sage", "ivory", "warm-gray", "frost"],
  children_space: ["sky", "sage", "coral", "amber", "ivory"],

  // Cultural and festive
  celebration_color: ["crimson", "vermilion", "amber", "gold", "vivid"],
  chinese_red: ["crimson", "vermilion", "scarlet", "coral", "ember"],
  festive_palette: ["crimson", "amber", "gold", "ivory", "vivid"],
  global_red: ["crimson", "vermilion", "scarlet", "ember", "warm"],
  nostalgia_film: ["amber", "coral", "warm-green", "ivory", "warm-brown"],

  // Seasonal design
  spring_blossom: ["blush", "mint", "lavender", "soft", "pale"],
  spring_pastel: ["blush", "peach", "lavender", "mint", "sky"],
  spring_campaign: ["blossom", "mint", "ivory", "soft", "pale"],
  summer_coastal: ["coral", "teal", "aqua", "vivid", "amber"],
  summer_tropical: ["coral", "lime", "amber", "vivid", "citrine"],
  summer_festival: ["coral", "vivid", "amber", "sky", "teal"],
  autumn_harvest: ["burgundy", "rust", "amber", "olive", "brown"],
  autumn_earth: ["rust", "sienna", "amber", "garnet", "olive"],
  autumn_premium: ["burgundy", "amber", "rust", "olive", "cream"],
  winter_holiday: ["crimson", "pine", "amber", "gold", "navy"],
  winter_festive: ["crimson", "navy", "gold", "ivory", "deep"],
  winter_ice: ["pale", "frost", "azure", "silver", "cobalt"],
  winter_minimal: ["frost", "silver", "pale", "navy", "ice"],
  seasonal_palette: ["amber", "coral", "mint", "frost", "olive"],
  // Motion and animation
  morph: ["vivid", "cobalt", "teal", "violet", "bloom"],
  kinetic: ["vivid", "electric", "cobalt", "coral", "amber"],

  // Architecture and spatial
  architecture: ["ivory", "slate", "ash", "fog", "stone"],
  interior: ["ivory", "ash", "fog", "amber", "slate"],
  paint: ["ivory", "sage", "ash", "fog", "muted"],
  wall: ["ivory", "fog", "ash", "mist", "veil"],
  flooring: ["sienna", "honey", "amber", "ash", "ivory"],

  // Dark mode and UI themes
  surface: ["ivory", "frost", "veil", "ash", "fog"],
  glass: ["frost", "veil", "whisper", "mist", "azure"],
  frosted: ["frost", "veil", "whisper", "mist", "pearl"],
  elevation: ["ash", "fog", "slate", "ivory", "frost"],

  // Cultural colors
  chinese: ["crimson", "vermilion", "scarlet", "coral", "amber"],
  japanese_aesthetic: ["moss", "ink", "plum", "muted", "ivory"],
  indian: ["amber", "saffron", "crimson", "teal", "coral"],
  nordic_design: ["fog", "ash", "ivory", "cobalt", "frost"],

  // Functional UI states
  success: ["moss", "leaf", "jade", "emerald", "mint"],
  error: ["crimson", "ruby", "garnet", "ember", "coral"],
  warning: ["amber", "marigold", "honey", "citrine", "ember"],
  info: ["azure", "cobalt", "cerulean", "teal", "frost"],
  disabled: ["fog", "ash", "mist", "slate", "veil"],
  active: ["cobalt", "vivid", "azure", "coral", "amber"],
  hover: ["azure", "cobalt", "clear", "vivid", "bloom"],
  focus: ["cobalt", "azure", "vivid", "clear", "violet"],

  // Natural phenomena
  rainbow: ["coral", "amber", "citrine", "teal", "violet"],
  fog_weather: ["mist", "fog", "veil", "ash", "slate"],
  rain: ["slate", "cobalt", "mist", "fog", "azure"],

  // Material and texture
  silk: ["ivory", "pearl", "blush", "veil", "whisper"],
  wood: ["sienna", "honey", "amber", "clay", "rust"],
  metal: ["slate", "ash", "fog", "cobalt", "steel"],

  // Gemstone colors
  ruby_gem: ["ruby", "crimson", "garnet", "merlot", "coral"],
  sapphire_gem: ["sapphire", "cobalt", "azure", "vivid", "navy"],
  emerald_gem: ["emerald", "jade", "teal", "moss", "vivid"],
  amethyst_gem: ["amethyst", "violet", "plum", "lavender", "orchid"],
  opal: ["blush", "azure", "lavender", "frost", "veil"],

  // Photography and imaging
  blue_hour: ["cobalt", "azure", "shadow", "slate", "mist"],
  overexposed: ["ivory", "frost", "pearl", "veil", "whisper"],
  underexposed: ["shadow", "ink", "coal", "nocturne", "slate"],
  black_white: ["ink", "ash", "fog", "coal", "ivory"],
  sepia_tone: ["honey", "amber", "sienna", "ivory", "muted"],

  // Craft beer and beverage branding
  craft_beer: ["amber", "ember", "honey", "sienna", "garnet"],
  brewery: ["amber", "honey", "ember", "sienna", "ivory"],
  beer_label: ["amber", "garnet", "honey", "cobalt", "ivory"],
  lager: ["amber", "citrine", "honey", "vivid", "ivory"],
  stout: ["shadow", "amber", "ember", "garnet", "ivory"],
  ipa: ["amber", "citrine", "honey", "ember", "ivory"],

  // Wine and winery aesthetics
  wine_label: ["merlot", "garnet", "amber", "ivory", "shadow"],
  winery: ["merlot", "garnet", "amber", "ivory", "olive"],
  vineyard: ["merlot", "olive", "amber", "garnet", "shadow"],
  rose_wine: ["blush", "apricot", "rose", "muted", "whisper"],

  // Automotive and transportation
  automotive: ["ink", "slate", "cobalt", "amber", "crimson"],
  car_design: ["ink", "slate", "amber", "cobalt", "crimson"],
  electric_vehicle: ["cobalt", "azure", "mint", "vivid", "ivory"],
  ev_color: ["cobalt", "mint", "azure", "vivid", "teal"],
  racing_color: ["crimson", "vivid", "amber", "cobalt", "ink"],

  // Esports and gaming aesthetics
  esports: ["vivid", "cobalt", "violet", "lime", "ink"],
  gaming_brand: ["vivid", "cobalt", "violet", "lime", "ink"],
  pixel_art: ["cobalt", "crimson", "citrine", "emerald", "vivid"],
  arena_color: ["vivid", "cobalt", "ink", "violet", "crimson"],

  // Streetwear and skateboarding
  streetwear: ["ink", "cobalt", "crimson", "citrine", "ivory"],
  skateboard: ["vivid", "cobalt", "crimson", "lime", "ink"],
  surf_color: ["aqua", "cobalt", "coral", "citrine", "ivory"],
  sneaker: ["crimson", "cobalt", "citrine", "vivid", "ivory"],

  // Gender and identity expression
  menswear: ["cobalt", "ink", "olive", "garnet", "slate"],
  womenswear: ["blush", "rose", "ivory", "garnet", "plum"],
  gender_neutral: ["olive", "cobalt", "slate", "ivory", "muted"],
  unisex: ["olive", "slate", "cobalt", "ivory", "amber"],

  // Festive and cultural occasions
  diwali: ["amber", "citrine", "crimson", "vivid", "cobalt"],
  hanukkah: ["cobalt", "azure", "pearl", "ivory", "vivid"],
  eid_palette: ["teal", "jade", "amber", "ivory", "vivid"],
  carnival: ["vivid", "crimson", "citrine", "cobalt", "coral"],
  mardi_gras: ["violet", "citrine", "emerald", "vivid", "cobalt"],
  st_patricks: ["emerald", "lime", "leaf", "vivid", "ivory"],
  easter_palette: ["blush", "mint", "lavender", "citrine", "pearl"],

  // Luxury watches and timepieces
  timepiece: ["cobalt", "amber", "shadow", "ivory", "garnet"],
  watch_dial: ["cobalt", "shadow", "ivory", "amber", "teal"],
  horology: ["cobalt", "amber", "shadow", "garnet", "ivory"],
  dress_watch: ["cobalt", "ivory", "shadow", "amber", "slate"],

  // Environmental and biophilic design
  living_wall: ["emerald", "moss", "leaf", "jade", "lime"],
  plant_based: ["moss", "leaf", "jade", "olive", "ivory"],
  vegan_brand: ["moss", "jade", "olive", "ivory", "amber"],
  zero_waste: ["moss", "olive", "ivory", "amber", "teal"],

  // Poster and graphic design contexts
  poster_design: ["crimson", "cobalt", "citrine", "ink", "ivory"],
  screen_print: ["crimson", "cobalt", "citrine", "ink", "vivid"],
  risograph: ["coral", "cobalt", "citrine", "blush", "ivory"],
  zine: ["ink", "crimson", "citrine", "ivory", "coral"],
  editorial_poster: ["ink", "ivory", "cobalt", "garnet", "amber"],

  // Seasonal holiday campaigns
  black_friday: ["ink", "vivid", "cobalt", "crimson", "amber"],
  cyber_monday: ["cobalt", "vivid", "azure", "ink", "ivory"],
  back_to_school: ["cobalt", "citrine", "crimson", "emerald", "ivory"],
  mothers_day: ["blush", "rose", "peony", "ivory", "lavender"],
  fathers_day: ["cobalt", "slate", "amber", "ivory", "olive"],
  new_year_palette: ["amber", "ivory", "cobalt", "vivid", "shadow"],
  // Real estate and home staging
  real_estate_brand: ["warm-gray", "ivory", "amber", "teal", "cobalt"],
  home_staging: ["warm-gray", "ivory", "blush", "teal", "amber"],
  luxury_real_estate: ["cool-gray", "cobalt", "ivory", "gold", "shadow"],
  curb_appeal: ["olive", "amber", "ivory", "warm-gray", "emerald"],
  modern_home_design: ["cool-gray", "true-gray", "cobalt", "ivory", "teal"],

  // Wedding and events
  wedding_color_palette: ["blush", "ivory", "rose", "warm-gray", "gold"],
  bridal_color: ["blush", "ivory", "white", "rose", "peony"],
  garden_wedding: ["blush", "sage", "ivory", "mint", "moss"],
  romantic_palette: ["rose", "blush", "plum", "peony", "ivory"],
  wedding_flowers: ["blush", "ivory", "rose", "peony", "lavender"],
  wedding_photography: ["blush", "ivory", "warm-gray", "rose", "amber"],

  // Children and family
  childrens_brand: ["citrine", "coral", "aqua", "lime", "peony"],
  kids_design: ["citrine", "coral", "aqua", "lime", "vivid"],
  toy_brand: ["citrine", "cobalt", "crimson", "lime", "vivid"],
  baby_shower: ["blush", "mint", "lavender", "ivory", "aqua"],
  nursery_color: ["blush", "mint", "lavender", "ivory", "warm-gray"],
  family_brand: ["amber", "teal", "citrine", "ivory", "emerald"],

  // Medical and pharmaceutical
  pharma_brand: ["cobalt", "teal", "ivory", "azure", "cool-gray"],
  medical_brand: ["cobalt", "teal", "azure", "ivory", "cool-gray"],
  healthcare_marketing: ["teal", "cobalt", "aqua", "ivory", "emerald"],
  dental_brand: ["aqua", "mint", "ivory", "cobalt", "cool-gray"],
  pharmacy_color: ["cobalt", "ivory", "azure", "teal", "cool-gray"],
  mental_health_brand: ["lavender", "teal", "mint", "ivory", "iris"],

  // Government and civic
  government_brand: ["cobalt", "crimson", "ivory", "warm-gray", "shadow"],
  civic_design: ["cobalt", "ivory", "cool-gray", "teal", "emerald"],
  nonprofit_brand: ["teal", "cobalt", "amber", "ivory", "emerald"],
  public_service: ["cobalt", "cool-gray", "ivory", "teal", "emerald"],

  // Education and academia
  university_brand: ["cobalt", "crimson", "ivory", "shadow", "amber"],
  academic_color: ["cobalt", "ivory", "shadow", "emerald", "amber"],
  school_brand: ["cobalt", "citrine", "crimson", "ivory", "emerald"],
  e_learning: ["cobalt", "teal", "citrine", "ivory", "aqua"],
  edtech_brand: ["cobalt", "citrine", "teal", "ivory", "lime"],

  // Fine dining and restaurant
  fine_dining_brand: ["shadow", "amber", "ivory", "warm-gray", "garnet"],
  restaurant_brand: ["warm-gray", "amber", "ivory", "crimson", "shadow"],
  wine_pairing: ["garnet", "merlot", "plum", "ivory", "shadow"],
  cocktail_bar: ["amber", "shadow", "garnet", "ivory", "cobalt"],
  cafe_color: ["amber", "warm-gray", "ivory", "honey", "shadow"],

  // Travel and hospitality
  hotel_brand: ["warm-gray", "ivory", "amber", "teal", "cobalt"],
  resort_palette: ["teal", "aqua", "ivory", "amber", "cerulean"],
  travel_brand: ["cobalt", "teal", "amber", "ivory", "azure"],
  airline_brand: ["cobalt", "azure", "ivory", "cool-gray", "teal"],
  boutique_hotel: ["warm-gray", "ivory", "blush", "teal", "amber"],

  // Yoga and wellness studio
  yoga_studio: ["blush", "ivory", "mint", "lavender", "warm-gray"],
  wellness_brand: ["mint", "teal", "ivory", "blush", "lavender"],
  meditation_color: ["lavender", "iris", "blush", "ivory", "warm-gray"],
  pilates_brand: ["blush", "warm-gray", "ivory", "mint", "coral"],
  holistic_health: ["teal", "lavender", "mint", "ivory", "moss"],

  // UI and light/dark themes (new unique entries)
  light_mode: ["whisper", "mist", "veil", "pearl", "bloom"],

  // Editorial layout (unique entries only)
  magazine_layout: ["crimson", "cobalt", "cool-gray", "ivory"],
  newspaper_design: ["true-gray", "cool-gray", "cobalt", "crimson"],
  poster_color: ["crimson", "amber", "cobalt", "emerald", "violet"],

  // Material and craft
  ceramic_color: ["cobalt", "teal", "warm-gray", "ivory", "amber"],
  pottery_color: ["amber", "warm-gray", "coral", "teal", "cobalt"],
  terracotta_color: ["coral", "ember", "amber", "warm-gray", "merlot"],
  adobe_color: ["coral", "amber", "warm-gray", "ember", "honey"],
  clay_color: ["coral", "amber", "warm-gray", "ember"],
  wood_color: ["amber", "honey", "warm-gray", "merlot", "ember"],
  linen_color: ["warm-gray", "ivory", "honey", "amber"],
  wool_color: ["warm-gray", "ivory", "honey", "blush", "teal"],

  // Memory and psychology
  nostalgia_color: ["amber", "honey", "warm-gray", "rose", "blush"],
  retro_aesthetic: ["amber", "coral", "teal", "citrine", "crimson"],
  y2k_color: ["blush", "citrine", "azure", "mint", "iris"],
  candy_color: ["blush", "citrine", "azure", "mint", "iris"],
  pastel_pop: ["blush", "citrine", "azure", "mint", "iris"],

  // Science and nature
  bioluminescent: ["aqua", "seafoam", "teal", "cobalt", "indigo"],
  deep_sea_color: ["cobalt", "indigo", "aqua", "seafoam", "true-gray"],
  ocean_trench: ["cobalt", "indigo", "aqua", "true-gray"],
  forest_dusk: ["moss", "indigo", "emerald", "amber", "true-gray"],
  twilight_color: ["indigo", "violet", "cobalt", "blush", "amber"],
  dawn_color: ["blush", "rose", "amber", "cobalt", "lavender"],

  // Brand psychology
  trustworthy_brand: ["cobalt", "teal", "emerald", "cool-gray", "true-gray"],
  innovative_brand: ["violet", "cobalt", "indigo", "azure", "coral"],
  premium_brand: ["warm-gray", "cool-gray", "cobalt", "amber", "true-gray"],
  approachable_brand: ["teal", "mint", "aqua", "blush", "azure"],
  authoritative_brand: ["cobalt", "indigo", "cool-gray", "true-gray", "garnet"],
  playful_brand: ["coral", "citrine", "blush", "mint", "azure"],
  sustainable_brand: ["moss", "emerald", "teal", "olive", "warm-gray"],
  artisan_brand: ["amber", "warm-gray", "coral", "honey", "merlot"],

  // Architecture & spatial design
  architectural_color: ["warm-gray", "cool-gray", "stone", "amber", "true-gray"],
  urban_palette: ["cool-gray", "cobalt", "true-gray", "azure", "jade"],
  mediterranean_architecture: ["cobalt", "cerulean", "true-gray", "amber", "coral"],
  scandinavian_design: ["cool-gray", "true-gray", "cobalt", "birch", "pine"],
  industrial_aesthetic: ["cool-gray", "cobalt", "true-gray", "rust", "amber"],
  facade_color: ["warm-gray", "amber", "coral", "cool-gray", "stone"],
  concrete_palette: ["cool-gray", "true-gray", "warm-gray", "cobalt"],
  brutalist_palette: ["cool-gray", "true-gray", "cobalt", "warm-gray"],

  // Packaging design
  packaging_design_color: ["emerald", "cobalt", "amber", "coral", "warm-gray"],
  premium_packaging: ["true-gray", "cobalt", "warm-gray", "amber", "garnet"],
  organic_pack: ["moss", "olive", "warm-gray", "amber", "honey"],
  luxury_packaging: ["warm-gray", "cobalt", "true-gray", "amber", "merlot"],
  sustainable_packaging: ["moss", "olive", "warm-gray", "jade", "seafoam"],
  food_packaging: ["amber", "coral", "citrine", "honey", "emerald"],
  beauty_packaging: ["blush", "rose", "violet", "warm-gray", "gold"],
  kids_packaging: ["coral", "citrine", "mint", "azure", "orchid"],

  // Accessibility and UI system colors
  accessible_palette: ["cobalt", "emerald", "amber", "true-gray", "cool-gray"],
  high_contrast_palette: ["true-gray", "cool-gray", "cobalt", "amber", "warm-gray"],
  wcag_compliant: ["cobalt", "true-gray", "cool-gray", "emerald", "garnet"],
  dark_mode_palette: ["cool-gray", "cobalt", "indigo", "teal", "true-gray"],
  light_mode_palette: ["cobalt", "azure", "emerald", "warm-gray", "cool-gray"],
  ui_system: ["cobalt", "cool-gray", "true-gray", "emerald", "amber"],
  design_system_colors: ["cobalt", "cool-gray", "true-gray", "warm-gray", "azure"],

  // Logo and identity
  logo_color: ["cobalt", "emerald", "coral", "amber", "violet"],
  brand_identity: ["cobalt", "emerald", "amber", "coral", "warm-gray"],
  wordmark_color: ["cobalt", "true-gray", "emerald", "merlot", "amber"],
  monogram_palette: ["true-gray", "cobalt", "warm-gray", "amber", "garnet"],

  // Interior design
  living_room_colors: ["warm-gray", "amber", "teal", "cobalt", "true-gray"],
  bedroom_palette: ["cobalt", "lavender", "blush", "warm-gray", "sage"],
  kitchen_colors: ["cobalt", "sage", "warm-gray", "amber", "coral"],
  bathroom_palette: ["teal", "aqua", "cobalt", "true-gray", "blush"],
  home_office_colors: ["cobalt", "emerald", "warm-gray", "sage", "cool-gray"],
  nursery_palette: ["blush", "lavender", "mint", "warm-gray", "honey"],

  // Golden hour and light effects
  golden_hour_palette: ["amber", "honey", "coral", "apricot", "rose"],
  magic_hour: ["amber", "coral", "rose", "honey", "citrine"],
  sunrise_palette: ["rose", "apricot", "amber", "azure", "blush"],

  // Holographic and special effects
  holographic_palette: ["iris", "aqua", "rose", "violet", "true-gray"],
  iridescent_palette: ["iris", "aqua", "blush", "violet", "rose"],
  opalescent: ["blush", "iris", "aqua", "violet", "rose"],
  metallic_palette: ["warm-gray", "honey", "amber", "cool-gray", "true-gray"],
  chrome_colors: ["cool-gray", "true-gray", "cobalt", "azure", "warm-gray"],

  // Dark mode and UI systems
  dark_mode_ui: ["cobalt", "indigo", "violet", "cool-gray", "true-gray"],
  dark_mode_surface: ["cool-gray", "true-gray", "indigo", "cobalt"],
  dark_mode_alt: ["cobalt", "indigo", "cool-gray", "sapphire", "violet"],
  night_ui: ["cobalt", "indigo", "cool-gray", "violet"],
  dark_ui_accent: ["aqua", "violet", "fuchsia", "lime", "coral"],
  oled_screen: ["true-gray", "cool-gray", "cobalt", "indigo"],

  // Neo-noir and cinematic
  neo_noir: ["violet", "aqua", "amber", "cobalt", "indigo"],
  neon_noir: ["violet", "aqua", "fuchsia", "cobalt"],
  cyberpunk_neon: ["violet", "fuchsia", "aqua", "lime", "cobalt"],
  cinematic_night: ["cobalt", "indigo", "violet", "amber", "cool-gray"],
  blade_runner: ["violet", "aqua", "amber", "cobalt"],
  film_noir: ["cool-gray", "true-gray", "warm-gray", "cobalt", "indigo"],

  // Wabi-sabi and imperfect beauty
  wabi_sabi_earth: ["warm-gray", "coral", "olive", "amber", "moss"],
  imperfect_beauty: ["warm-gray", "coral", "olive", "amber"],
  japanese_earth: ["warm-gray", "olive", "moss", "coral", "true-gray"],
  zen_palette: ["warm-gray", "olive", "moss", "true-gray", "cool-gray"],
  pottery_glaze: ["warm-gray", "coral", "amber", "olive", "moss"],
  raku: ["warm-gray", "amber", "olive", "cool-gray"],

  // Art Deco
  art_deco_palette: ["amber", "honey", "warm-gray", "emerald", "garnet"],
  deco_gold: ["amber", "honey", "citrine", "warm-gray"],
  deco_jewel: ["emerald", "sapphire", "garnet", "violet", "amber"],
  gatsby_palette: ["amber", "honey", "warm-gray", "emerald", "rose"],
  twenties_palette: ["amber", "emerald", "warm-gray", "violet", "ruby"],

  // Fog and coastal
  coastal_fog_morning: ["aqua", "seafoam", "cool-gray", "teal", "blush"],
  marine_layer: ["cool-gray", "aqua", "seafoam", "teal"],
  foggy_morning: ["cool-gray", "true-gray", "aqua", "seafoam", "blush"],
  beach_mist: ["aqua", "seafoam", "blush", "cool-gray", "teal"],
  pacific_fog: ["cool-gray", "aqua", "teal", "blush", "seafoam"],

  // Botanical illustration
  botanical_ink: ["moss", "olive", "coral", "amber", "warm-gray"],
  naturalist_palette: ["moss", "olive", "lime", "amber", "coral"],
  field_guide: ["moss", "olive", "amber", "coral", "leaf"],
  victorian_botanical: ["moss", "olive", "amber", "coral", "warm-gray"],
  antique_botanical: ["olive", "moss", "amber", "coral", "warm-gray"],

  // Typography and readability
  reading_palette: ["warm-gray", "true-gray", "cool-gray", "amber"],
  editorial_text: ["warm-gray", "true-gray", "cobalt", "cool-gray"],
  print_palette: ["warm-gray", "true-gray", "cool-gray", "cobalt", "garnet"],
  book_design: ["warm-gray", "amber", "true-gray", "cobalt"],
  typographic: ["true-gray", "warm-gray", "cool-gray", "cobalt", "amber"],


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

// Curated discovery chips grouped by theme — shown in search UI
export const SEARCH_CHIPS: { group: string; terms: string[] }[] = [
  { group: "Nature", terms: ["forest", "ocean", "desert", "botanical", "coastal", "alpine", "meadow"] },
  { group: "Season", terms: ["spring", "summer", "autumn", "winter", "sunset", "sunrise", "dawn"] },
  { group: "Mood", terms: ["moody", "dreamy", "serene", "bold", "minimal", "elegant", "playful"] },
  { group: "Aesthetic", terms: ["cottagecore", "darkacademia", "vaporwave", "japandi", "brutalist", "scandi"] },
  { group: "Material", terms: ["velvet", "marble", "linen", "terracotta", "denim", "copper", "brass"] },
  { group: "Film & Art", terms: ["cinematic", "noir", "vintage", "bauhaus", "art_deco", "editorial"] },
  { group: "Craft", terms: ["ceramic", "pottery", "wabi_sabi", "artisan", "handmade", "studio"] },
  { group: "Industry", terms: ["tech", "medical", "hospitality", "financial", "retail", "sports"] },
];

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
