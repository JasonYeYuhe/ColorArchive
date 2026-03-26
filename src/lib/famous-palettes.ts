export type FamousPaletteCategory =
  | "brand"
  | "art"
  | "film"
  | "design"
  | "fashion";

export interface FamousPaletteColor {
  hex: string;
  name: string;
  role?: string;
}

export interface FamousPalette {
  id: string;
  name: string;
  category: FamousPaletteCategory;
  subcategory?: string;
  year?: number;
  description: string;
  context: string;
  colors: FamousPaletteColor[];
  tags: string[];
}

export const famousPalettes: FamousPalette[] = [
  // ── Tech Brands ──────────────────────────────────────────────────
  {
    id: "google",
    name: "Google",
    category: "brand",
    subcategory: "Tech",
    year: 1998,
    description:
      "Google's primary color system uses the four colors of the original logo — red, blue, yellow, and green — to express playfulness, optimism, and accessibility. The palette intentionally breaks color harmony rules, signaling that Google doesn't follow conventions.",
    context:
      "Used across Google's product family, logos, and Material Design system as brand anchors.",
    colors: [
      { hex: "#4285F4", name: "Google Blue", role: "Primary" },
      { hex: "#EA4335", name: "Google Red", role: "Secondary" },
      { hex: "#FBBC05", name: "Google Yellow", role: "Accent" },
      { hex: "#34A853", name: "Google Green", role: "Accent" },
      { hex: "#FFFFFF", name: "White", role: "Background" },
    ],
    tags: ["Tech", "Primary Colors", "Playful", "Brand Identity"],
  },
  {
    id: "apple",
    name: "Apple",
    category: "brand",
    subcategory: "Tech",
    year: 1976,
    description:
      "Apple's modern palette is defined by restraint — silver, space gray, and near-black — reflecting the brand's pursuit of simplicity and premium craftsmanship. The aluminum-inspired neutrals have become synonymous with premium technology design.",
    context:
      "Defines Apple's hardware and software aesthetic since the 2000s redesign under Jony Ive.",
    colors: [
      { hex: "#1D1D1F", name: "Apple Black", role: "Primary" },
      { hex: "#6E6E73", name: "Space Gray", role: "Secondary" },
      { hex: "#AFAFAF", name: "Silver", role: "Neutral" },
      { hex: "#F5F5F7", name: "Apple White", role: "Background" },
      { hex: "#0071E3", name: "Apple Blue", role: "Action" },
    ],
    tags: ["Tech", "Minimal", "Premium", "Neutral"],
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "brand",
    subcategory: "Tech",
    year: 2006,
    description:
      "Spotify's electric green on near-black creates one of the most recognizable two-color identities in tech. The Spotify Green (#1DB954) has become an industry landmark — bold enough to own in a crowded space, yet flexible enough to sit next to any album art.",
    context:
      "Core brand identity used across the app, marketing, and audio ad placements.",
    colors: [
      { hex: "#1DB954", name: "Spotify Green", role: "Primary" },
      { hex: "#191414", name: "Spotify Black", role: "Background" },
      { hex: "#FFFFFF", name: "White", role: "Text" },
      { hex: "#535353", name: "Dark Gray", role: "Secondary" },
      { hex: "#B3B3B3", name: "Light Gray", role: "Subtle" },
    ],
    tags: ["Tech", "Bold", "High Contrast", "Two-Color"],
  },
  {
    id: "netflix",
    name: "Netflix",
    category: "brand",
    subcategory: "Tech",
    year: 1997,
    description:
      "Netflix's signature red against deep black creates instant recognition and high shelf-impact. The Netflix Red (#E50914) is calibrated for maximum visibility on dark screens and in physical signage, making it one of the most powerful single-color brand plays in media.",
    context:
      "Global streaming brand used across 190+ countries, posters, UI, and advertising.",
    colors: [
      { hex: "#E50914", name: "Netflix Red", role: "Primary" },
      { hex: "#141414", name: "Netflix Black", role: "Background" },
      { hex: "#FFFFFF", name: "White", role: "Text" },
      { hex: "#564D4D", name: "Dark Warm Gray", role: "Secondary" },
    ],
    tags: ["Media", "Bold", "High Contrast", "Red-Dominant"],
  },
  {
    id: "meta",
    name: "Meta (Facebook)",
    category: "brand",
    subcategory: "Tech",
    year: 2004,
    description:
      "Facebook's original blue (#1877F2) was chosen partly because Mark Zuckerberg is red-green colorblind — blue was the color he could see most vividly. Now representing Meta, the palette has expanded but the blue remains the brand anchor for its 3 billion user family.",
    context:
      "Used across Facebook, Instagram, WhatsApp, and Meta corporate identity.",
    colors: [
      { hex: "#1877F2", name: "Facebook Blue", role: "Primary" },
      { hex: "#FFFFFF", name: "White", role: "Background" },
      { hex: "#F0F2F5", name: "Light Gray", role: "Surface" },
      { hex: "#050505", name: "Near Black", role: "Text" },
      { hex: "#42B72A", name: "Action Green", role: "CTA" },
    ],
    tags: ["Tech", "Social Media", "Blue", "Trust"],
  },
  {
    id: "airbnb",
    name: "Airbnb",
    category: "brand",
    subcategory: "Tech",
    year: 2008,
    description:
      "Airbnb's Rausch coral was named after the street in San Francisco where the company was founded. The warm coral communicates warmth, belonging, and human connection — deliberately different from the cold blues of tech giants. Paired with dark Babu, it creates an inviting yet trustworthy system.",
    context:
      "Used across the global Airbnb platform, Bélo logo, and host/guest communications.",
    colors: [
      { hex: "#FF5A5F", name: "Rausch", role: "Primary" },
      { hex: "#FF385C", name: "Deep Rausch", role: "Action" },
      { hex: "#484848", name: "Babu", role: "Text" },
      { hex: "#767676", name: "Arches", role: "Secondary" },
      { hex: "#F7F7F7", name: "Hof", role: "Background" },
    ],
    tags: ["Tech", "Warm", "Coral", "Hospitality"],
  },
  {
    id: "slack",
    name: "Slack",
    category: "brand",
    subcategory: "Tech",
    year: 2009,
    description:
      "Slack's aubergine purple creates distance from corporate blue — a deliberate choice to signal that work can feel less formal. The multi-color hashtag icon uses all four brand colors in harmony, expressing openness and collaboration. The rebrand in 2019 refined the hues but preserved the core intent.",
    context:
      "Used across the Slack workspace collaboration platform and B2B marketing.",
    colors: [
      { hex: "#4A154B", name: "Aubergine", role: "Primary" },
      { hex: "#36C5F0", name: "Blue", role: "Accent" },
      { hex: "#2EB67D", name: "Green", role: "Accent" },
      { hex: "#ECB22E", name: "Yellow", role: "Accent" },
      { hex: "#E01E5A", name: "Red", role: "Accent" },
    ],
    tags: ["Tech", "Purple", "Multi-Color", "B2B"],
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "brand",
    subcategory: "Tech",
    year: 2010,
    description:
      "Stripe's gradient-rich identity blends deep blues with purples and aquas, expressing sophisticated technology and trust. The brand uses gradient color boldly — eschewing the flat minimalism of the era to create visual richness that signals technical depth and premium positioning.",
    context:
      "Used across Stripe's payment infrastructure, developer tools, and financial services.",
    colors: [
      { hex: "#635BFF", name: "Stripe Purple", role: "Primary" },
      { hex: "#0A2540", name: "Stripe Dark Blue", role: "Deep" },
      { hex: "#00D4FF", name: "Cyan", role: "Accent" },
      { hex: "#80E9FF", name: "Light Cyan", role: "Light Accent" },
      { hex: "#FFFFFF", name: "White", role: "Background" },
    ],
    tags: ["Tech", "Fintech", "Gradient", "Purple"],
  },

  // ── Consumer Brands ───────────────────────────────────────────────
  {
    id: "tiffany",
    name: "Tiffany & Co.",
    category: "brand",
    subcategory: "Luxury",
    year: 1845,
    description:
      "Tiffany Blue is one of the most protected colors in luxury branding — a custom Pantone shade (1837) trademarked by Tiffany & Co. The robin's egg blue communicates exclusivity, romance, and craftsmanship, and the famous \"blue box\" has made the color synonymous with jewelry gifting worldwide.",
    context:
      "Used exclusively on packaging, branding, and marketing materials for Tiffany & Co.",
    colors: [
      { hex: "#81D8D0", name: "Tiffany Blue", role: "Primary" },
      { hex: "#FFFFFF", name: "White", role: "Background" },
      { hex: "#000000", name: "Black", role: "Text" },
      { hex: "#D4B896", name: "Warm Beige", role: "Accent" },
    ],
    tags: ["Luxury", "Jewelry", "Iconic", "Teal"],
  },
  {
    id: "hermes",
    name: "Hermès",
    category: "brand",
    subcategory: "Luxury",
    year: 1837,
    description:
      "Hermès orange is one of luxury's most recognizable single-color identities. Originally an accident — Hermès adopted orange from wartime scarcity of preferred cream and beige packaging materials — the color became so beloved it became the brand's signature. The specific shade communicates French craftsmanship, warmth, and irreverence.",
    context:
      "Used across the iconic Hermès orange box, bags, and all Hermès packaging worldwide.",
    colors: [
      { hex: "#E8722A", name: "Hermès Orange", role: "Primary" },
      { hex: "#FFFFFF", name: "White", role: "Background" },
      { hex: "#2C2C2C", name: "Near Black", role: "Text" },
      { hex: "#B5985A", name: "Gold", role: "Accent" },
    ],
    tags: ["Luxury", "Fashion", "Orange", "French"],
  },
  {
    id: "chanel",
    name: "Chanel",
    category: "brand",
    subcategory: "Luxury",
    year: 1910,
    description:
      "Coco Chanel popularized the power of black in fashion and branding. The stark black-and-white Chanel identity — used on packaging, the iconic No. 5 bottle, and the classic suit — became the definitive visual expression of Parisian elegance. Nothing says luxury sophistication like the absence of color.",
    context:
      "Core brand identity used across Chanel fashion, beauty, and fragrance globally.",
    colors: [
      { hex: "#000000", name: "Chanel Black", role: "Primary" },
      { hex: "#FFFFFF", name: "Chanel White", role: "Secondary" },
      { hex: "#C9A96E", name: "Chanel Gold", role: "Accent" },
      { hex: "#F5F0E8", name: "Cream", role: "Soft" },
    ],
    tags: ["Luxury", "Fashion", "Minimal", "Black & White"],
  },
  {
    id: "mcdonalds",
    name: "McDonald's",
    category: "brand",
    subcategory: "Food",
    year: 1940,
    description:
      "McDonald's yellow and red is a masterclass in appetite-stimulating color psychology. Red increases heart rate and creates urgency; yellow generates happiness and attracts attention. Together they maximize speed of decision-making — ideal for quick-service restaurants. The palette has remained remarkably consistent for over 70 years.",
    context:
      "Used globally across all McDonald's signage, packaging, marketing, and digital presence.",
    colors: [
      { hex: "#FFC72C", name: "Arches Gold", role: "Primary" },
      { hex: "#DA291C", name: "McDonald's Red", role: "Secondary" },
      { hex: "#27251F", name: "Near Black", role: "Text" },
      { hex: "#FFFFFF", name: "White", role: "Background" },
    ],
    tags: ["Food", "Fast Food", "Appetite", "High Energy"],
  },
  {
    id: "coca-cola",
    name: "Coca-Cola",
    category: "brand",
    subcategory: "Food",
    year: 1886,
    description:
      "Coca-Cola's red is one of the most recognized colors on earth. The specific red (#F40009) is said to have influenced how Santa Claus is depicted in Western culture — the Coke-inspired red suit replacing earlier green variants. The palette communicates happiness, energy, and refreshment, with Spencerian white script as the perfect contrast.",
    context:
      "The definitive consumer brand color — used across 200+ countries in beverages and advertising.",
    colors: [
      { hex: "#F40009", name: "Coca-Cola Red", role: "Primary" },
      { hex: "#FFFFFF", name: "White", role: "Script/Background" },
      { hex: "#000000", name: "Black", role: "Text" },
      { hex: "#C8102E", name: "Deep Red", role: "Dark Variant" },
    ],
    tags: ["Food", "Beverage", "Iconic", "Red"],
  },

  // ── Art Movements ─────────────────────────────────────────────────
  {
    id: "bauhaus",
    name: "Bauhaus",
    category: "art",
    subcategory: "Design Movement",
    year: 1919,
    description:
      "The Bauhaus school reduced design to its essential components — including color. Johannes Itten and Josef Albers developed color theory at Bauhaus that still underlies design education today. The school's palette emphasized pure primary and secondary colors used geometrically and purposefully, rejecting decoration for function.",
    context:
      "Developed at the Bauhaus school in Weimar, Germany (1919–1933) under masters including Paul Klee and Wassily Kandinsky.",
    colors: [
      { hex: "#E63329", name: "Bauhaus Red", role: "Primary" },
      { hex: "#1B4DAB", name: "Bauhaus Blue", role: "Primary" },
      { hex: "#F5C518", name: "Bauhaus Yellow", role: "Primary" },
      { hex: "#000000", name: "Black", role: "Ground" },
      { hex: "#FFFFFF", name: "White", role: "Ground" },
    ],
    tags: ["Art Movement", "Design History", "Primary Colors", "Geometric"],
  },
  {
    id: "mondrian",
    name: "De Stijl / Mondrian",
    category: "art",
    subcategory: "Fine Art",
    year: 1917,
    description:
      "Piet Mondrian's Neoplasticism reduced visual language to horizontal and vertical black lines and the three primary colors, plus black and white. His compositions were about universal harmony through reduction — stripping away the particular to reveal the universal. This palette has influenced everything from fashion (Yves Saint Laurent's 1965 Mondrian dress) to corporate logos.",
    context:
      "Developed by Piet Mondrian and Theo van Doesburg as part of the Dutch De Stijl art movement.",
    colors: [
      { hex: "#D62B2B", name: "Mondrian Red", role: "Primary" },
      { hex: "#2459A9", name: "Mondrian Blue", role: "Primary" },
      { hex: "#F5C518", name: "Mondrian Yellow", role: "Primary" },
      { hex: "#000000", name: "Black", role: "Line" },
      { hex: "#F5F5F2", name: "Off-White", role: "Ground" },
    ],
    tags: ["Fine Art", "Primary Colors", "Geometric", "Dutch"],
  },
  {
    id: "memphis-design",
    name: "Memphis Design",
    category: "art",
    subcategory: "Design Movement",
    year: 1981,
    description:
      "Memphis Design was a rebellion against 1970s minimalism — loud, colorful, pattern-heavy, and deliberately 'bad taste.' Founded by Ettore Sottsass in Milan in 1981, the movement's palette of pastel pink, cobalt, turquoise, and black-and-white graphic patterns became enormously influential and is seeing a major revival in contemporary digital design.",
    context:
      "Founded by Ettore Sottsass and the Memphis Group in Milan, 1981–1988.",
    colors: [
      { hex: "#F9A8B3", name: "Memphis Pink", role: "Dominant" },
      { hex: "#2E5BFF", name: "Memphis Blue", role: "Accent" },
      { hex: "#FFD700", name: "Memphis Yellow", role: "Accent" },
      { hex: "#50D8A4", name: "Memphis Turquoise", role: "Accent" },
      { hex: "#1A1A1A", name: "Graphic Black", role: "Pattern" },
    ],
    tags: ["Design Movement", "Maximalist", "Pastels", "Italian", "80s"],
  },
  {
    id: "art-deco",
    name: "Art Deco",
    category: "art",
    subcategory: "Design Movement",
    year: 1925,
    description:
      "Art Deco emerged from the 1925 Paris Exposition — a reaction against both Arts & Crafts naturalism and Art Nouveau's organic curves. The palette uses deep, saturated colors — Egyptian blue, crimson, forest green — accented with gold, bronze, and geometric black-and-white patterns. It communicates luxury, modernity, and the glamour of the machine age.",
    context:
      "Peaked in the 1920s–30s; visible in architecture (Chrysler Building), fashion, film, and graphic design.",
    colors: [
      { hex: "#B8860B", name: "Dark Gold", role: "Primary" },
      { hex: "#1C1C54", name: "Egyptian Blue", role: "Deep" },
      { hex: "#8B0000", name: "Deep Crimson", role: "Accent" },
      { hex: "#2D5A27", name: "Art Deco Green", role: "Accent" },
      { hex: "#F5F0E8", name: "Ivory", role: "Background" },
    ],
    tags: ["Art Movement", "Luxury", "Gold", "Geometric", "1920s"],
  },
  {
    id: "impressionism",
    name: "Impressionism",
    category: "art",
    subcategory: "Fine Art",
    year: 1874,
    description:
      "Impressionism was the first art movement to study the scientific nature of color and light. Monet, Renoir, and Sisley rejected fixed local color in favor of capturing the optical sensation of light — using broken, unmixed brushstrokes of complementary colors to create vibration and luminosity. The resulting palette is soft, light-filled, and atmospherically rich.",
    context:
      "Emerging from Paris in the 1870s, with key works by Monet, Renoir, Pissarro, and Sisley.",
    colors: [
      { hex: "#B8D4E8", name: "Sky Blue", role: "Air" },
      { hex: "#E8D5B0", name: "Warm Afternoon", role: "Light" },
      { hex: "#89B080", name: "Garden Green", role: "Nature" },
      { hex: "#D4A0A0", name: "Soft Rose", role: "Flesh/Flower" },
      { hex: "#7A6E9B", name: "Monet Violet", role: "Shadow" },
    ],
    tags: ["Fine Art", "Soft", "Light", "French", "Nature"],
  },
  {
    id: "pop-art",
    name: "Pop Art",
    category: "art",
    subcategory: "Fine Art",
    year: 1958,
    description:
      "Andy Warhol, Roy Lichtenstein, and the Pop Art movement elevated consumer culture and mass media imagery into fine art. The palette is defined by flat, unmodulated primaries and secondaries — the colors of cheap print reproduction, comic books, and supermarket packaging — used with maximum saturation and no tonal gradation.",
    context:
      "Developed in New York and London in the late 1950s–1960s, with Warhol's Factory as its epicenter.",
    colors: [
      { hex: "#FF0000", name: "Warhol Red", role: "Primary" },
      { hex: "#FFFF00", name: "Pop Yellow", role: "Primary" },
      { hex: "#0000FF", name: "Comic Blue", role: "Primary" },
      { hex: "#FF69B4", name: "Hot Pink", role: "Accent" },
      { hex: "#000000", name: "Outline Black", role: "Line" },
    ],
    tags: ["Fine Art", "Bold", "Saturated", "American", "60s"],
  },

  // ── Film & Cinema ─────────────────────────────────────────────────
  {
    id: "wes-anderson",
    name: "Wes Anderson Films",
    category: "film",
    subcategory: "Director",
    year: 1996,
    description:
      "Wes Anderson's films (Moonrise Kingdom, The Grand Budapest Hotel, Isle of Dogs) are defined by their fastidiously controlled color palettes — dusty pastels, muted pinks, and warm neutrals arranged with mathematical symmetry. Production designer Adam Stockhausen describes the process as starting with a single color and building a world from it.",
    context:
      "Across Wes Anderson's filmography from Bottle Rocket (1996) to Asteroid City (2023).",
    colors: [
      { hex: "#E8BEB8", name: "Dusty Rose", role: "Signature" },
      { hex: "#D4B896", name: "Warm Beige", role: "Ground" },
      { hex: "#7BA3B8", name: "Slate Blue", role: "Cool" },
      { hex: "#C9956C", name: "Terracotta", role: "Warm Accent" },
      { hex: "#8FAF8A", name: "Muted Sage", role: "Nature" },
    ],
    tags: ["Film", "Pastel", "Symmetrical", "Vintage", "Whimsical"],
  },
  {
    id: "blade-runner-2049",
    name: "Blade Runner 2049",
    category: "film",
    subcategory: "Cinematography",
    year: 2017,
    description:
      "Cinematographer Roger Deakins designed three distinct color worlds for Blade Runner 2049: warm amber and orange for the LA dystopia, cool grays and blues for the sterile indoor spaces, and the blinding white of the San Diego waste zone. The teal-and-orange opposition became one of cinema's most discussed color palettes, influencing design and photography globally.",
    context:
      "Directed by Denis Villeneuve, cinematography by Roger Deakins (Academy Award winner).",
    colors: [
      { hex: "#D4713A", name: "Dystopian Amber", role: "Exterior" },
      { hex: "#1E4A6B", name: "Neon Teal Blue", role: "Interior" },
      { hex: "#F5A623", name: "Hologram Orange", role: "Accent" },
      { hex: "#8CB8C8", name: "Pale Blue", role: "Clean Interior" },
      { hex: "#1A1A1A", name: "Deep Shadow", role: "Dark" },
    ],
    tags: ["Film", "Sci-Fi", "Teal-Orange", "Cinematic", "Deakins"],
  },
  {
    id: "grand-budapest-hotel",
    name: "The Grand Budapest Hotel",
    category: "film",
    subcategory: "Director",
    year: 2014,
    description:
      "Adam Stockhausen designed The Grand Budapest Hotel's visual world around Mendl's pink — a specific dusty rose that functions as the film's emotional anchor. Every frame uses a strict palette of mauve-pinks, creams, purples, and muted reds — a Central European confection that exists equally in nostalgia and farce.",
    context:
      "Directed by Wes Anderson; production design by Adam Stockhausen. Won Academy Award for Production Design.",
    colors: [
      { hex: "#E8829C", name: "Mendl's Pink", role: "Signature" },
      { hex: "#6B4E7D", name: "Hotel Purple", role: "Architecture" },
      { hex: "#D4C5A9", name: "Cream", role: "Background" },
      { hex: "#C23B2A", name: "Communist Red", role: "Tension" },
      { hex: "#5B7B6F", name: "Lobby Green", role: "Contrast" },
    ],
    tags: ["Film", "Pastel", "Pink", "Whimsical", "European"],
  },
  {
    id: "matrix",
    name: "The Matrix",
    category: "film",
    subcategory: "Cinematography",
    year: 1999,
    description:
      "The Wachowskis used color to distinguish reality from simulation in The Matrix — the real world bathed in cool blues, while the simulated Matrix world used sickly desaturated greens (inspired by the phosphor glow of CRT monitors). The falling green code became one of cinema's most iconic visual signatures.",
    context:
      "Directed by the Wachowskis; influenced by cyberpunk aesthetics and Japanese animation.",
    colors: [
      { hex: "#00FF41", name: "Matrix Green", role: "Code" },
      { hex: "#003B00", name: "Deep Matrix", role: "Deep Code" },
      { hex: "#1A2C3D", name: "Real World Blue", role: "Reality" },
      { hex: "#0D0D0D", name: "Near Black", role: "Background" },
      { hex: "#A8B8A8", name: "Desaturated Green-Gray", role: "Simulation" },
    ],
    tags: ["Film", "Sci-Fi", "Green", "Cyber", "Monochromatic"],
  },
  {
    id: "mad-max-fury-road",
    name: "Mad Max: Fury Road",
    category: "film",
    subcategory: "Cinematography",
    year: 2015,
    description:
      "George Miller's cinematographer John Seale created one of the most celebrated uses of complementary color opposition in cinema — the Namibian desert burnished to maximum orange, with every shadow and sky pushed to deep teal. The extreme split-complementary contrast maximizes visual energy and heat, matching the film's relentless kinetic pace.",
    context:
      "Directed by George Miller; cinematography by John Seale. Won 6 Academy Awards.",
    colors: [
      { hex: "#E8721A", name: "Desert Fire", role: "Dominant" },
      { hex: "#1A5C7A", name: "Teal Shadow", role: "Complementary" },
      { hex: "#C0390C", name: "Deep Rust", role: "Dark Warm" },
      { hex: "#D4A030", name: "Ochre Sand", role: "Midtone" },
      { hex: "#0D3040", name: "Deep Teal", role: "Deep Cool" },
    ],
    tags: ["Film", "Action", "Teal-Orange", "Desert", "High Contrast"],
  },

  // ── Design Systems ────────────────────────────────────────────────
  {
    id: "nord",
    name: "Nord",
    category: "design",
    subcategory: "Color Theme",
    year: 2016,
    description:
      "Nord is an Arctic-inspired color palette created by Sven Greb that became one of the most popular developer color themes. Its four color regions — Polar Night (dark grays), Snow Storm (light neutrals), Frost (Arctic blues), and Aurora (soft accents) — create a harmonious system that works for terminals, code editors, and UI design.",
    context:
      "Widely adopted across Vim, VS Code, iTerm, and other developer environments.",
    colors: [
      { hex: "#2E3440", name: "Polar Night 1", role: "Background" },
      { hex: "#3B4252", name: "Polar Night 2", role: "Surface" },
      { hex: "#88C0D0", name: "Frost Blue", role: "Primary" },
      { hex: "#81A1C1", name: "Frost Light", role: "Secondary" },
      { hex: "#ECEFF4", name: "Snow Storm", role: "Text" },
    ],
    tags: ["Design System", "Developer", "Arctic", "Dark Theme", "Minimal"],
  },
  {
    id: "solarized",
    name: "Solarized",
    category: "design",
    subcategory: "Color Theme",
    year: 2011,
    description:
      "Ethan Schoonover designed Solarized to reduce eye strain through precisely calibrated contrast ratios and a warm amber-toned background. He spent months developing the palette using the CIECAM02 color appearance model — the first widely-used color theme built on perceptual color science rather than aesthetics alone.",
    context:
      "Created by Ethan Schoonover in 2011; adopted by hundreds of developer tools worldwide.",
    colors: [
      { hex: "#FDF6E3", name: "Base 3 (Light BG)", role: "Light Background" },
      { hex: "#002B36", name: "Base 03 (Dark BG)", role: "Dark Background" },
      { hex: "#268BD2", name: "Blue", role: "Primary" },
      { hex: "#2AA198", name: "Cyan", role: "Syntax" },
      { hex: "#CB4B16", name: "Orange", role: "Keyword" },
    ],
    tags: ["Design System", "Developer", "Warm", "Perceptual", "Scientific"],
  },
  {
    id: "dracula",
    name: "Dracula",
    category: "design",
    subcategory: "Color Theme",
    year: 2013,
    description:
      "Dracula was created by Zeno Rocha as a Halloween project — a dark theme for code editors inspired by Gothic aesthetics. The unexpected pairing of deep purple-gray with neon pink, cyan, and green creates a theme that's simultaneously dramatic and readable, making it one of the most beloved dark themes in developer culture.",
    context:
      "Available for 200+ applications; one of the most starred color theme repositories on GitHub.",
    colors: [
      { hex: "#282A36", name: "Background", role: "Background" },
      { hex: "#FF79C6", name: "Pink", role: "Keyword" },
      { hex: "#BD93F9", name: "Purple", role: "Function" },
      { hex: "#50FA7B", name: "Green", role: "String" },
      { hex: "#F1FA8C", name: "Yellow", role: "Variable" },
    ],
    tags: ["Design System", "Developer", "Dark Theme", "Neon", "Gothic"],
  },
  {
    id: "ibm-design",
    name: "IBM Design Language",
    category: "design",
    subcategory: "Design System",
    year: 2014,
    description:
      "IBM's design language (Carbon) uses a sophisticated multi-step color scale anchored in IBM Blue — a refined, institutional blue that conveys trust, precision, and depth. The system was developed to unify IBM's vast product portfolio while maintaining accessibility standards throughout. The palette was deeply influenced by Paul Rand's original IBM visual identity work from the 1950s.",
    context:
      "Governs design across all IBM products and services; implemented as the open-source Carbon Design System.",
    colors: [
      { hex: "#0F62FE", name: "IBM Blue 60", role: "Interactive" },
      { hex: "#0043CE", name: "IBM Blue 70", role: "Hover" },
      { hex: "#161616", name: "Gray 100", role: "Text" },
      { hex: "#F4F4F4", name: "Gray 10", role: "Background" },
      { hex: "#24A148", name: "Green 50", role: "Success" },
    ],
    tags: ["Design System", "Enterprise", "Blue", "Accessible", "IBM"],
  },

  // ── Fashion & Trend ───────────────────────────────────────────────
  {
    id: "millennial-pink",
    name: "Millennial Pink",
    category: "fashion",
    subcategory: "Color Trend",
    year: 2016,
    description:
      "Millennial Pink dominated culture from approximately 2016–2019 — appearing in fashion, interiors, tech products, and social media aesthetics. It's not a single color but a family of dusty, desaturated pinks that signaled a certain ironic-but-earnest quality of the Instagram generation. The rose gold hardware era and Glossier's branding both typify the trend.",
    context:
      "Peaked around 2016–2019; associated with Instagram aesthetics, Glossier, and millennial consumer culture.",
    colors: [
      { hex: "#F4B8B0", name: "Classic Millennial Pink", role: "Primary" },
      { hex: "#E8A598", name: "Dusty Blush", role: "Variant" },
      { hex: "#D4856A", name: "Rose Tan", role: "Warm Variant" },
      { hex: "#F9E4DF", name: "Blush White", role: "Light" },
      { hex: "#B5856E", name: "Muted Terracotta", role: "Complement" },
    ],
    tags: ["Fashion", "Trend", "Pink", "Instagram", "Soft"],
  },
  {
    id: "pantone-2024",
    name: "Pantone Color of the Year 2024",
    category: "fashion",
    subcategory: "Color Trend",
    year: 2024,
    description:
      "Pantone 13-1023 Peach Fuzz was selected as 2024's Color of the Year to communicate nurturing, gentleness, and human connection in an age of digital overload. The soft, warm peach sits between pink and orange, evoking comfort and community. It appeared prominently in fashion, beauty, and interior design across 2024.",
    context:
      "Announced by the Pantone Color Institute in December 2023; appeared widely in fashion and interior design in 2024.",
    colors: [
      { hex: "#FFBE98", name: "Peach Fuzz", role: "Hero" },
      { hex: "#F5A882", name: "Deep Peach", role: "Shade" },
      { hex: "#FFD6C0", name: "Light Peach", role: "Tint" },
      { hex: "#E8C4A8", name: "Warm Sand", role: "Neutral Pairing" },
      { hex: "#8C6855", name: "Cinnamon", role: "Grounding" },
    ],
    tags: ["Fashion", "Pantone", "Trend", "Peach", "Warm", "2024"],
  },
  {
    id: "pantone-2023",
    name: "Pantone Color of the Year 2023",
    category: "fashion",
    subcategory: "Color Trend",
    year: 2023,
    description:
      "Pantone 18-1750 Viva Magenta was chosen for 2023 as an unconventional red — a cochineal-inspired crimson with no blue or black, rooted in nature. It was described as 'assertive but not aggressive,' a color for an era demanding boldness without aggression. Seen widely in fashion, packaging, and digital design through 2023.",
    context:
      "Announced by the Pantone Color Institute in December 2022; seen across fashion and media in 2023.",
    colors: [
      { hex: "#BB2649", name: "Viva Magenta", role: "Hero" },
      { hex: "#9B1E3C", name: "Deep Magenta", role: "Shade" },
      { hex: "#D94E6C", name: "Light Magenta", role: "Tint" },
      { hex: "#E8C4B8", name: "Blush Neutral", role: "Soft Pairing" },
      { hex: "#2C1515", name: "Deep Wine", role: "Grounding" },
    ],
    tags: ["Fashion", "Pantone", "Trend", "Red", "Magenta", "2023"],
  },
  {
    id: "pantone-2022",
    name: "Pantone Color of the Year 2022",
    category: "fashion",
    subcategory: "Color Trend",
    year: 2022,
    description:
      "Pantone 17-3938 Very Peri — a custom blue-purple invented specifically for 2022 — was notable as the first time Pantone created an entirely new color for the Color of the Year. It represents the blending of the digital and physical worlds, with its periwinkle hue evoking creativity, imagination, and the metaverse era.",
    context:
      "Announced December 2021. Controversial pick as a newly invented color rather than an existing Pantone swatch.",
    colors: [
      { hex: "#6769A8", name: "Very Peri", role: "Hero" },
      { hex: "#504F8C", name: "Deep Peri", role: "Shade" },
      { hex: "#9B9CC8", name: "Light Peri", role: "Tint" },
      { hex: "#E8E8F5", name: "Peri Mist", role: "Ultra Light" },
      { hex: "#2A2864", name: "Deep Indigo", role: "Grounding" },
    ],
    tags: ["Fashion", "Pantone", "Trend", "Periwinkle", "Blue-Purple", "2022"],
  },
  {
    id: "classic-navy",
    name: "Classic Navy & Cream",
    category: "fashion",
    subcategory: "Timeless",
    description:
      "Navy and cream is fashion's most enduring color pairing — found in nautical heritage (stripes, blazers), Ivy League prep wear, and a century of classic tailoring. The combination communicates reliability, understated authority, and quiet taste without the severity of black-and-white. It's the palette of permanence.",
    context:
      "Foundational to American sportswear, European tailoring, and nautical fashion traditions.",
    colors: [
      { hex: "#1B2A4A", name: "Deep Navy", role: "Primary" },
      { hex: "#F5F0E8", name: "Cream", role: "Secondary" },
      { hex: "#3D5A8A", name: "Bright Navy", role: "Accent" },
      { hex: "#C8B896", name: "Warm Khaki", role: "Earth Accent" },
      { hex: "#8B1A1A", name: "Accent Red", role: "Detail" },
    ],
    tags: ["Fashion", "Timeless", "Navy", "Heritage", "Classic"],
  },
];

export function getFamousPalettesByCategory(
  category: FamousPaletteCategory,
): FamousPalette[] {
  return famousPalettes.filter((p) => p.category === category);
}

export const CATEGORY_LABELS: Record<FamousPaletteCategory, string> = {
  brand: "Brands",
  art: "Art & Movements",
  film: "Film & Cinema",
  design: "Design Systems",
  fashion: "Fashion & Trends",
};

export const CATEGORY_LABELS_ZH: Record<FamousPaletteCategory, string> = {
  brand: "品牌",
  art: "艺术与流派",
  film: "电影与影视",
  design: "设计系统",
  fashion: "时尚与潮流",
};
