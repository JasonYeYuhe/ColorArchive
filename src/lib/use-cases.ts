/**
 * Color Use Cases — industry/context-specific palette guidance
 * Maps common design industries to recommended color strategies
 */

export interface UseCase {
  id: string;
  title: string;
  tagline: string;
  description: string;
  primaryColor: string; // hex for display
  collectionIds: string[];
  guideSlugKeywords: string[];
  colorFamilies: string[];
  avoidFamilies: string[];
  keyPrinciples: string[];
  toneSummary: string;
  icon: string; // emoji
}

export const useCases: UseCase[] = [
  {
    id: "saas-tech",
    title: "SaaS & Tech",
    tagline: "Trust, clarity, and confident action",
    description:
      "Tech products live inside complex workflows. The palette must reduce cognitive load, create clear hierarchy for data-dense screens, and build enough brand differentiation to stand out in crowded categories. Blue families dominate because of their trust associations, but differentiation comes from chroma control and secondary accent choices.",
    primaryColor: "#3B7BE8",
    collectionIds: ["cerulean-depth", "arctic-dawn", "slate-and-sage"],
    guideSlugKeywords: ["saas", "tech", "startup", "dashboard"],
    colorFamilies: ["Blue", "Teal", "Indigo", "Neutral"],
    avoidFamilies: ["Red (primary)", "High-chroma Yellow"],
    keyPrinciples: [
      "Keep backgrounds neutral — let the data carry color meaning",
      "Use a single accent hue for all interactive elements",
      "Semantic colors (success green, error red) must be consistent system-wide",
      "Dark mode is often expected — build both from the start",
    ],
    toneSummary: "Precise, trustworthy, efficient — minimal decoration",
    icon: "⚡",
  },
  {
    id: "healthcare",
    title: "Healthcare & Wellness",
    tagline: "Calm, clean, and reassuring",
    description:
      "Healthcare color design serves two competing needs: clinical trust (cleanliness, competence, precision) and human warmth (empathy, approachability, comfort). Teal and soft blue signal cleanliness without the sterility of pure white or cold gray. Warm accents — soft blush, sage, terracotta — introduce the human dimension. Saturated primaries feel alarming in healthcare contexts.",
    primaryColor: "#2BA8A0",
    collectionIds: ["sage-terrarium", "modern-seaside", "twilight-lavender"],
    guideSlugKeywords: ["healthcare", "wellness", "medical", "calm"],
    colorFamilies: ["Teal", "Seafoam", "Sage", "Soft Blue"],
    avoidFamilies: ["Aggressive Red", "Electric Yellow", "Neon"],
    keyPrinciples: [
      "Avoid pure white — it reads as stark and clinical; use warm whites and light grays",
      "Teal and seafoam communicate cleanliness without coldness",
      "Reserve red strictly for emergency or alert states — never for decoration",
      "Use muted saturation across the board — vivid colors feel alarming in health contexts",
    ],
    toneSummary: "Calm, trustworthy, human — reassuring without being sterile",
    icon: "🏥",
  },
  {
    id: "luxury-premium",
    title: "Luxury & Premium",
    tagline: "Restraint, richness, and authority",
    description:
      "Luxury palettes earn their status through restraint and quality of execution, not decoration. The defining characteristic of premium color design is knowing what to leave out. Low saturation warm neutrals — cream, champagne, stone — signal refinement. Black, deep navy, and forest green signal authority. Gold and warm bronze enter as accent only, never as the primary palette.",
    primaryColor: "#C8A96E",
    collectionIds: ["quiet-luxury", "ink-and-gold", "studio-neutral"],
    guideSlugKeywords: ["luxury", "premium", "brand"],
    colorFamilies: ["Warm Neutral", "Navy", "Forest", "Gold Accent"],
    avoidFamilies: ["Neon", "Vivid Primary", "Cold Gray"],
    keyPrinciples: [
      "Less color communicates more luxury — reduce your palette to 3 core colors maximum",
      "Cream and warm white outperform pure white in premium product contexts",
      "Gold and bronze work as accent only — never as the dominant palette color",
      "Typography and spacing carry more of the premium signal than color alone",
    ],
    toneSummary: "Understated, precise, and authoritative — never loud",
    icon: "✦",
  },
  {
    id: "food-beverage",
    title: "Food & Beverage",
    tagline: "Appetite, warmth, and freshness",
    description:
      "Food color design triggers appetite at multiple levels. Warm reds and oranges are the dominant appetite stimulants — not by accident. Fresh greens communicate ingredient quality and health. Earthy neutrals and terracottas communicate artisan, farm-to-table warmth. Cold blues and grays suppress appetite and work only in premium minimalist or alcoholic-beverage contexts where restraint signals sophistication.",
    primaryColor: "#D4502A",
    collectionIds: ["terracotta-loft", "golden-hour", "fresh-herb"],
    guideSlugKeywords: ["food", "restaurant", "packaging"],
    colorFamilies: ["Warm Red", "Orange", "Terracotta", "Fresh Green"],
    avoidFamilies: ["Cold Blue", "Gray (primary)", "Purple (food)"],
    keyPrinciples: [
      "Warm reds and oranges stimulate appetite — lean into them for primary food brands",
      "Green signals freshness and health — essential for ingredient-forward brands",
      "Photography color grading matters as much as palette: warm highlights and appetizing shadows",
      "Beverage brands often invert food norms — premium spirits frequently use cool, dark palettes",
    ],
    toneSummary: "Warm, appetizing, and inviting — earthy or vibrant, never cold",
    icon: "🍽",
  },
  {
    id: "finance-fintech",
    title: "Finance & Fintech",
    tagline: "Stability, confidence, and momentum",
    description:
      "Financial color design walks the line between trust (traditional dark navy and conservative palettes) and momentum (the modern fintech preference for confident primary blues and violet accents). Legacy institutions favor restraint; challengers favor confidence. Both are valid strategies for different market positions. Green represents growth and gains; red represents loss — these semantic assignments are non-negotiable in financial interfaces.",
    primaryColor: "#1E3A6E",
    collectionIds: ["ocean-abyss", "midnight-garden", "nordic-morning"],
    guideSlugKeywords: ["finance", "fintech", "banking"],
    colorFamilies: ["Navy", "Deep Blue", "Forest Green", "Confident Blue"],
    avoidFamilies: ["Casual Orange", "Playful Palette", "Pastel"],
    keyPrinciples: [
      "Green = positive/gains, Red = negative/loss — never use these for decoration",
      "Dark navy communicates institutional trust for legacy audiences",
      "Bright blue with violet accents positions as modern fintech challenger",
      "Avoid yellow and orange in primary roles — they read as casual in financial contexts",
    ],
    toneSummary: "Stable, confident, and precise — serious without being cold",
    icon: "📈",
  },
  {
    id: "education",
    title: "Education & E-Learning",
    tagline: "Focus, encouragement, and curiosity",
    description:
      "Educational environments need to maintain attention without inducing stress. The palette must support long reading sessions, create clear navigation for complex content structures, and use color as a wayfinding and feedback system. Encouraging warm yellows and ambers signal curiosity and reward. Blues support focus and extended learning. Green signals correct answers and progress. Red must be used carefully — failure feedback in learning contexts has significant emotional impact.",
    primaryColor: "#4A90D9",
    collectionIds: ["golden-hour", "arctic-dawn", "studio-neutral"],
    guideSlugKeywords: ["education", "learning", "elearning"],
    colorFamilies: ["Friendly Blue", "Warm Yellow", "Encouraging Green", "Warm Neutral"],
    avoidFamilies: ["Aggressive Red", "Corporate Cold", "Heavy Black"],
    keyPrinciples: [
      "High contrast for extended reading — body text must pass WCAG AA at minimum",
      "Warm background tints (very light warm white/yellow) reduce eye strain in long sessions",
      "Use color consistently as a wayfinding system — each section or subject can own a hue",
      "Celebration colors (confetti, achievement states) can use vivid saturation briefly",
    ],
    toneSummary: "Warm, encouraging, and clear — never intimidating",
    icon: "📚",
  },
  {
    id: "creative-design",
    title: "Creative & Design Studios",
    tagline: "Personality, craft, and intentional boldness",
    description:
      "Creative studios and agencies have the most latitude of any industry — the color palette is itself a portfolio statement. But that freedom demands more precision, not less. The best creative studio palettes are bold and distinctive, with a clear point of view. They often use colors that would be inappropriate in conservative industries: vivid accents, unexpected combinations, deliberate asymmetry between background restraint and accent confidence.",
    primaryColor: "#E8455A",
    collectionIds: ["chalk-and-coral", "aurora-borealis", "dark-botanical"],
    guideSlugKeywords: ["creative", "studio", "design", "agency", "portfolio"],
    colorFamilies: ["Distinctive Accent", "Warm Neutral Base", "Bold Highlight"],
    avoidFamilies: ["Corporate Cliché", "Generic Blue"],
    keyPrinciples: [
      "Your palette should have a point of view — if it works for every studio, it works for none",
      "A neutral base + single vivid accent creates more impact than multiple saturated colors",
      "Print and screen reproduction planning matters — test your accent in CMYK before committing",
      "Allow the work itself to be the hero — your brand palette should support, not compete",
    ],
    toneSummary: "Distinctive, intentional, and confident — craft visible in every detail",
    icon: "✏️",
  },
  {
    id: "sustainability-environment",
    title: "Sustainability & Environment",
    tagline: "Nature, responsibility, and considered optimism",
    description:
      "Environmental brands face a challenging color brief: green is both their most relevant color and their most overused. The differentiating move is to treat green with the same precision applied to any other color — specifying the exact hue, saturation, and lightness that communicates the brand's specific environmental positioning. Earthy terracottas, warm neutrals, and deep forest greens often work better than obvious fresh greens for premium sustainability brands.",
    primaryColor: "#4A7C59",
    collectionIds: ["forest-depths", "sage-terrarium", "moss-linen"],
    guideSlugKeywords: ["sustainability", "environment", "green", "eco"],
    colorFamilies: ["Forest Green", "Earthy Neutral", "Sage", "Warm Brown"],
    avoidFamilies: ["Generic Bright Green", "Cold Blue-Gray", "Aggressive Red"],
    keyPrinciples: [
      "Specificity beats cliché — a deep forest green says more than a generic #00FF00",
      "Earthy neutrals (warm beige, terracotta, clay) support environmental positioning effectively",
      "Earth tones build credibility; neon greens undermine it",
      "Photography direction matters: natural materials, real textures, honest daylight",
    ],
    toneSummary: "Grounded, honest, and quietly optimistic — earthy without being retro",
    icon: "🌿",
  },
  {
    id: "beauty-fashion",
    title: "Beauty & Fashion",
    tagline: "Mood, identity, and tactile quality",
    description:
      "Beauty and fashion palettes are the most context-dependent of any industry. The 'right' palette depends entirely on the brand positioning — mass market vs. prestige, editorial vs. commercial, seasonal vs. timeless. Prestige beauty favors restraint and texture: cream, blush, gold, and deep neutrals. Mass market accepts more saturated and trend-driven choices. Fashion has the broadest latitude — the palette is part of the seasonal language.",
    primaryColor: "#D4A8B0",
    collectionIds: ["quiet-luxury", "rose-quartz", "twilight-lavender"],
    guideSlugKeywords: ["beauty", "fashion", "cosmetics", "skincare"],
    colorFamilies: ["Blush", "Warm Neutral", "Deep Neutral", "Gold Accent"],
    avoidFamilies: ["Clinical White", "Aggressive Neon (prestige)", "Cold Gray (beauty)"],
    keyPrinciples: [
      "Product photography color grading defines the brand as much as the palette itself",
      "Premium beauty brands use skin-tone awareness in palette choices — colors that make skin look beautiful",
      "Cream and warm whites outperform cold white in beauty and skincare",
      "Fashion can reference season and trend — beauty benefits from more timeless anchors",
    ],
    toneSummary: "Tactile, aspirational, and mood-specific — always in service of the product",
    icon: "💄",
  },
  {
    id: "nonprofit-social",
    title: "Nonprofit & Social Impact",
    tagline: "Purpose, urgency, and human warmth",
    description:
      "Social impact organizations face a unique color challenge: conveying urgency and seriousness without inducing helplessness, and projecting warmth without undermining credibility. The most effective nonprofit palettes combine a trustworthy anchor (deep blue, forest green, or dark teal) with a warm accent (amber, coral, soft red) that humanizes and creates the emotional connection that drives action. Avoid the trap of generic 'charity blue' — distinctive palettes build donor recognition.",
    primaryColor: "#E85D35",
    collectionIds: ["sage-terrarium", "chalk-and-coral", "nordic-morning"],
    guideSlugKeywords: ["nonprofit", "charity", "social", "impact"],
    colorFamilies: ["Trustworthy Blue/Green", "Warm Accent", "Honest Neutral"],
    avoidFamilies: ["Slick Premium", "Cold Corporate", "Overly Cheerful Pastels"],
    keyPrinciples: [
      "Avoid looking like every other nonprofit — distinctive color builds donor recognition",
      "Warm accents (amber, coral) generate more donation response than cool tones in appeal materials",
      "Use impact photography that owns its colors — brief palettes from key photos",
      "Dark anchors communicate seriousness; light accents communicate hope",
    ],
    toneSummary: "Purposeful, human, and honest — urgency without alarm",
    icon: "🤝",
  },
];

export function getUseCaseById(id: string): UseCase | undefined {
  return useCases.find((uc) => uc.id === id);
}
