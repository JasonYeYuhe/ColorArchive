import type { ColorFamily } from "@/src/types/color";

type LightnessZone = "light" | "mid" | "dark";

export interface ColorPsychology {
  mood: string[];
  industries: string[];
  pairsWith: string;
  culture: string;
  designTip: string;
}

const PSYCHOLOGY: Record<ColorFamily, Record<LightnessZone, ColorPsychology>> = {
  Red: {
    light: {
      mood: ["Tender", "Romantic", "Gentle"],
      industries: ["Beauty", "Wedding", "Healthcare"],
      pairsWith: "Soft neutrals (warm gray, cream) or muted greens for balance",
      culture: "In many cultures, light reds and pinks symbolize love, tenderness, and new beginnings. In Japan, sakura pink represents the ephemeral beauty of life.",
      designTip: "Use as a background for emotional storytelling or as an accent in healthcare and wellness brands to convey warmth without intensity.",
    },
    mid: {
      mood: ["Passionate", "Energetic", "Urgent"],
      industries: ["Food & Beverage", "Entertainment", "Retail"],
      pairsWith: "White for high contrast CTAs, dark navy for sophistication, or gold for luxury",
      culture: "Red is universally associated with energy and action. In China, it signifies luck and prosperity. In Western markets, it drives urgency in sales.",
      designTip: "Best for call-to-action buttons and sale banners. Use sparingly — red as a primary color can feel aggressive; as an accent, it commands attention.",
    },
    dark: {
      mood: ["Powerful", "Sophisticated", "Dramatic"],
      industries: ["Wine & Spirits", "Luxury Fashion", "Fine Dining"],
      pairsWith: "Gold accents, ivory backgrounds, or deep charcoal for editorial elegance",
      culture: "Deep reds like burgundy and maroon evoke maturity, wealth, and tradition. Common in academic institutions and heritage brands.",
      designTip: "Ideal for dark themes and premium product pages. Pair with generous whitespace to let the richness breathe.",
    },
  },
  Orange: {
    light: {
      mood: ["Cheerful", "Approachable", "Warm"],
      industries: ["Children's Products", "Wellness", "Social Apps"],
      pairsWith: "Soft teal for playful contrast, warm white for minimalism",
      culture: "Peach and apricot tones are associated with friendliness and optimism. In many Asian cultures, orange symbolizes happiness.",
      designTip: "Perfect for onboarding screens and friendly UI. Light oranges feel welcoming without the intensity of pure orange.",
    },
    mid: {
      mood: ["Creative", "Adventurous", "Confident"],
      industries: ["Technology", "Sports", "Travel"],
      pairsWith: "Deep blue for trust + energy balance, dark gray for modern tech aesthetics",
      culture: "Orange represents creativity and adventure. In the Netherlands, it's the national color. In Hinduism, it symbolizes purity.",
      designTip: "Use for creative tool brands and action-oriented interfaces. Orange buttons consistently outperform other colors in A/B tests for engagement.",
    },
    dark: {
      mood: ["Earthy", "Artisanal", "Grounded"],
      industries: ["Coffee & Bakery", "Craft & Handmade", "Outdoor Gear"],
      pairsWith: "Olive green, warm cream, or slate gray for organic, natural palettes",
      culture: "Burnt orange and terra cotta evoke earthiness, autumn, and craftsmanship. Popular in Southwestern and Mediterranean design.",
      designTip: "Great for artisanal brands and rustic interfaces. Combines well with textured backgrounds and serif typography.",
    },
  },
  Yellow: {
    light: {
      mood: ["Gentle", "Hopeful", "Fresh"],
      industries: ["Baby Products", "Organic Food", "Stationery"],
      pairsWith: "Lavender for whimsy, soft gray for sophistication, mint for freshness",
      culture: "Pale yellows suggest gentleness and new beginnings. Associated with spring, youth, and innocence in Western cultures.",
      designTip: "Excellent for backgrounds that need warmth without weight. Be cautious with text readability — always ensure sufficient contrast.",
    },
    mid: {
      mood: ["Optimistic", "Attention-Grabbing", "Energizing"],
      industries: ["Delivery Services", "Construction", "Education"],
      pairsWith: "Black for maximum visibility, deep purple for creative tension, navy for trust",
      culture: "Yellow is the most visible color in daylight. It signals caution (traffic signs) and joy (smiley faces) across cultures.",
      designTip: "Use for highlight elements, badges, and warning states. Yellow draws the eye instantly — perfect for notifications and wayfinding.",
    },
    dark: {
      mood: ["Warm", "Mature", "Luxurious"],
      industries: ["Jewelry", "Gourmet Food", "Architecture"],
      pairsWith: "Charcoal, deep emerald, or rich brown for elegant compositions",
      culture: "Gold and amber tones represent wealth, wisdom, and prestige. Central to Buddhist and Egyptian visual traditions.",
      designTip: "Dark yellows and golds work beautifully in premium interfaces. Use for headings, icons, and accent borders on dark backgrounds.",
    },
  },
  Lime: {
    light: {
      mood: ["Fresh", "Natural", "Invigorating"],
      industries: ["Juice & Smoothie Brands", "Eco Products", "Fitness"],
      pairsWith: "White for cleanliness, soft pink for playful contrast",
      culture: "Light lime represents freshness, vitality, and new growth. Common in spring-themed and health-focused design.",
      designTip: "Use for wellness and eco-friendly brands. Light lime as a background creates an airy, energizing feel.",
    },
    mid: {
      mood: ["Vibrant", "Youthful", "Dynamic"],
      industries: ["Gaming", "Streetwear", "Energy Drinks"],
      pairsWith: "Black or dark purple for high-contrast impact, white for clean energy",
      culture: "Electric lime signals youth culture, technology, and rebellion. Popular in gaming and urban fashion.",
      designTip: "Best for accent elements that need to pop. Use with dark backgrounds for maximum visibility in gaming and tech interfaces.",
    },
    dark: {
      mood: ["Organic", "Sustainable", "Grounded"],
      industries: ["Agriculture", "Sustainable Fashion", "Landscape Architecture"],
      pairsWith: "Earth tones (brown, tan), warm whites, or muted terracotta",
      culture: "Olive and dark lime connect to nature, military, and sustainability. Evokes resilience and growth.",
      designTip: "Ideal for brands emphasizing sustainability. Olive tones work well in navigation and secondary UI elements.",
    },
  },
  Green: {
    light: {
      mood: ["Calming", "Healing", "Open"],
      industries: ["Wellness", "Meditation Apps", "Healthcare"],
      pairsWith: "Soft lavender for serenity, warm cream for organic warmth",
      culture: "Mint and sage greens symbolize healing, tranquility, and renewal. Common in spa and wellness branding.",
      designTip: "Perfect for health and wellness interfaces. Light greens reduce visual stress — use for backgrounds in reading-heavy layouts.",
    },
    mid: {
      mood: ["Balanced", "Trustworthy", "Growing"],
      industries: ["Finance", "Insurance", "Environmental"],
      pairsWith: "White for clean professionalism, dark navy for authority, gold for premium",
      culture: "Green universally represents nature, growth, and money. In Islam, green is sacred. In Western finance, it signals profit.",
      designTip: "The go-to for financial dashboards and environmental brands. Green conveys stability — use for success states and positive metrics.",
    },
    dark: {
      mood: ["Prestigious", "Timeless", "Authoritative"],
      industries: ["Banking", "Law Firms", "Luxury Real Estate"],
      pairsWith: "Gold, ivory, or warm white for classic elegance",
      culture: "Deep greens like forest and hunter green evoke tradition, wealth, and the British countryside. Common in Ivy League branding.",
      designTip: "Excellent for dark mode themes and premium interfaces. Deep green with gold accents creates an instantly luxurious feel.",
    },
  },
  Teal: {
    light: {
      mood: ["Refreshing", "Modern", "Clear"],
      industries: ["SaaS", "Cloud Services", "Interior Design"],
      pairsWith: "Coral for playful energy, light gray for modern minimalism",
      culture: "Light teal blends the calm of blue with the renewal of green. Associated with clear water, clarity, and modern thinking.",
      designTip: "Ideal for tech product interfaces. Light teal works as a primary brand color that feels both professional and approachable.",
    },
    mid: {
      mood: ["Sophisticated", "Creative", "Balanced"],
      industries: ["Design Agencies", "Healthcare Tech", "Education"],
      pairsWith: "Warm orange for complementary energy, dark slate for depth",
      culture: "Teal balances emotional stability with mental clarity. It's associated with communication and healing in color therapy.",
      designTip: "A versatile primary color for brands seeking to appear both creative and reliable. Works across light and dark themes.",
    },
    dark: {
      mood: ["Deep", "Professional", "Stable"],
      industries: ["Corporate Software", "Consulting", "Marine"],
      pairsWith: "White for sharp contrast, light coral for warmth, silver for tech",
      culture: "Deep teal evokes deep ocean waters — stability, depth, and hidden knowledge. Common in corporate and maritime contexts.",
      designTip: "Use as a dark theme primary or sidebar background. Deep teal is less harsh than pure black while maintaining professionalism.",
    },
  },
  Blue: {
    light: {
      mood: ["Serene", "Trustworthy", "Clean"],
      industries: ["Social Media", "Cloud Storage", "Baby Products"],
      pairsWith: "Light gray for tech minimalism, peach for friendly warmth",
      culture: "Light blue represents peace, sky, and openness. It's the most universally liked color, making it safe for global brands.",
      designTip: "The default choice for tech and social platforms for good reason. Light blue backgrounds reduce anxiety and increase trust.",
    },
    mid: {
      mood: ["Professional", "Reliable", "Focused"],
      industries: ["Banking", "Insurance", "Enterprise Software"],
      pairsWith: "White for clean authority, light orange for warm contrast, dark navy for depth",
      culture: "Blue is the world's most popular color. It represents trust, competence, and stability across virtually all cultures.",
      designTip: "The backbone of business interfaces. Use for primary actions and navigation. Blue links are the web's universal convention.",
    },
    dark: {
      mood: ["Authoritative", "Intellectual", "Luxurious"],
      industries: ["Defense", "Aviation", "Higher Education"],
      pairsWith: "Gold for prestige, white for sharp readability, electric blue for energy",
      culture: "Navy and midnight blue symbolize authority, intelligence, and tradition. The color of uniforms, institutions, and power.",
      designTip: "Perfect for dark mode backgrounds and headers. Navy is softer than black and adds character. Pair with bright accents for contrast.",
    },
  },
  Purple: {
    light: {
      mood: ["Mystical", "Creative", "Gentle"],
      industries: ["Skincare", "Meditation", "Indie Music"],
      pairsWith: "Soft gold for elegance, mint for freshness, warm white for purity",
      culture: "Lavender and lilac represent spirituality, creativity, and gentleness. Associated with aromatherapy and mindfulness.",
      designTip: "Use for creative and wellness brands. Light purple backgrounds create a dreamy, contemplative atmosphere.",
    },
    mid: {
      mood: ["Royal", "Innovative", "Imaginative"],
      industries: ["Streaming Services", "Crypto & Web3", "Creative Tools"],
      pairsWith: "Electric green for futuristic energy, white for clarity, dark gray for sophistication",
      culture: "Purple historically represents royalty and rarity (Tyrian purple was more expensive than gold). Today it signals innovation and imagination.",
      designTip: "A bold primary choice for brands wanting to stand out. Purple differentiates — few major brands use it, making it memorable.",
    },
    dark: {
      mood: ["Mysterious", "Opulent", "Deep"],
      industries: ["Luxury Cosmetics", "Night Entertainment", "Premium Gaming"],
      pairsWith: "Gold, bright cyan, or warm amber for striking contrast",
      culture: "Deep purple evokes mystery, power, and the cosmos. Associated with wisdom, the occult, and premium experiences.",
      designTip: "Excellent for dark themes in entertainment and luxury. Deep purple as a background creates an immersive, premium feel.",
    },
  },
  Pink: {
    light: {
      mood: ["Sweet", "Nurturing", "Playful"],
      industries: ["Beauty", "Children's Fashion", "Dessert Brands"],
      pairsWith: "Mint green for freshness, soft gold for warmth, light gray for sophistication",
      culture: "Soft pink represents nurturing, innocence, and sweetness. Modern brands have reclaimed it as a gender-neutral color of kindness.",
      designTip: "Use for friendly, approachable interfaces. Millennial pink became a design movement — it still works for brands targeting warmth.",
    },
    mid: {
      mood: ["Bold", "Fun", "Confident"],
      industries: ["Fashion", "Music", "Social Platforms"],
      pairsWith: "Black for edge, deep navy for sophistication, bright yellow for energy",
      culture: "Hot pink represents confidence, fun, and breaking rules. Popularized by punk culture and pop icons as a statement color.",
      designTip: "A fearless accent color. Use for CTAs and brand moments that need personality. Hot pink buttons are impossible to miss.",
    },
    dark: {
      mood: ["Sensual", "Dramatic", "Sophisticated"],
      industries: ["Fine Wine", "Luxury Lingerie", "Event Design"],
      pairsWith: "Gold for opulence, charcoal for drama, deep emerald for richness",
      culture: "Deep pinks and magentas bridge passion and sophistication. Common in luxury branding and high-fashion editorials.",
      designTip: "Use sparingly as an accent in luxury interfaces. Deep pink against dark backgrounds creates an unforgettable visual signature.",
    },
  },
};

function getLightnessZone(lightness: number): LightnessZone {
  if (lightness >= 65) return "light";
  if (lightness >= 35) return "mid";
  return "dark";
}

export function getColorPsychology(
  family: ColorFamily,
  lightness: number,
): ColorPsychology {
  const zone = getLightnessZone(lightness);
  return PSYCHOLOGY[family][zone];
}
