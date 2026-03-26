// Color palettes by decade — historically accurate color reference
// Each decade features 6 signature colors that defined the era's design aesthetic

export type DecadeId =
  | "1920s"
  | "1930s"
  | "1940s"
  | "1950s"
  | "1960s"
  | "1970s"
  | "1980s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020s";

export type DecadeMovement =
  | "Art Deco"
  | "Streamline Moderne"
  | "Mid-Century Modern"
  | "Pop Art"
  | "Psychedelic"
  | "Earth Tones"
  | "Postmodern"
  | "Grunge"
  | "Y2K"
  | "Flat Design"
  | "Biophilic";

export interface DecadeColor {
  hex: string;
  name: string;
  role: string;
}

export interface ColorDecade {
  id: DecadeId;
  decade: string;
  period: string;
  era: string;
  movement: DecadeMovement;
  description: string;
  context: string;
  influence: string;
  colors: DecadeColor[];
  tags: string[];
  browseHref: string;
}

export const colorDecades: ColorDecade[] = [
  {
    id: "1920s",
    decade: "1920s",
    period: "1920–1929",
    era: "The Jazz Age",
    movement: "Art Deco",
    description:
      "The Roaring Twenties expressed prosperity and modernity through the opulence of Art Deco — geometric forms in gleaming gold, jet black, and jewel tones that signaled the confidence of a postwar world discovering electricity, cinema, and jazz.",
    context:
      "Art Deco emerged from Paris's 1925 Exposition Internationale and spread through architecture, fashion, and graphic design. The palette drew from Egyptian Revival (gold, black, turquoise), the machine age (metallic silver and chrome), and the exoticism of imported silks and lacquerware.",
    influence:
      "The 1920s palette reappears in luxury brand identity design today — hotel lobbies, high-end packaging, and bridal fashion still draw on this vocabulary of confident opulence.",
    colors: [
      { hex: "#C5960F", name: "Art Deco Gold", role: "Dominant" },
      { hex: "#1A1A1A", name: "Jet Black", role: "Foundation" },
      { hex: "#F0EAD2", name: "Ivory Cream", role: "Background" },
      { hex: "#7A1B42", name: "Garnet Red", role: "Jewel Accent" },
      { hex: "#1B5B3E", name: "Deep Emerald", role: "Jewel Accent" },
      { hex: "#5B3380", name: "Art Deco Violet", role: "Luxury Accent" },
    ],
    tags: ["Art Deco", "Luxury", "Geometric", "Jazz Age", "Opulence"],
    browseHref: "/families/yellow/",
  },
  {
    id: "1930s",
    decade: "1930s",
    period: "1930–1939",
    era: "Depression-Era Elegance",
    movement: "Streamline Moderne",
    description:
      "During the Great Depression, American design responded with Streamline Moderne — aerodynamic curves in muted, affordable colors. Hollywood glamour provided escapist counterpoint: dusty rose, powder blue, and ivory for a world craving softness and grace under scarcity.",
    context:
      "The Depression constrained the rich palette of the 1920s. Dye costs and fabric rationing pushed fashion toward softer, desaturated versions of previous decade colors. Simultaneously, Hollywood's golden age in black-and-white film trained public taste in contrast and tonal harmony rather than chromatic saturation.",
    influence:
      "This decade's muted sophistication influences 'Depression-core' aesthetics in contemporary fashion and the warm neutrals of artisanal product design.",
    colors: [
      { hex: "#D4A5A0", name: "Dusty Rose", role: "Fashion Signature" },
      { hex: "#1C3557", name: "Midnight Navy", role: "Formal Accent" },
      { hex: "#8A1F1F", name: "Deep Crimson", role: "Drama Accent" },
      { hex: "#7A8E5E", name: "Sage Green", role: "Nature Influence" },
      { hex: "#C8B898", name: "Warm Putty", role: "Neutral" },
      { hex: "#E8E0D0", name: "Depression Ivory", role: "Background" },
    ],
    tags: ["Streamline", "Hollywood Glamour", "Muted", "Elegant", "Scarcity Aesthetic"],
    browseHref: "/families/red/",
  },
  {
    id: "1940s",
    decade: "1940s",
    period: "1940–1949",
    era: "The War Years & Victory",
    movement: "Mid-Century Modern",
    description:
      "World War II imposed its palette on civilian life: olive drab, naval blue, and khaki became the colors of sacrifice, service, and purpose. Post-1945, victory colors (red, white, and blue) gave way to the first expressions of mid-century optimism and consumer culture.",
    context:
      "Military necessity made utility colors dominant. The War Production Board restricted civilian fabric dyes, limiting the color range of everyday clothing. But the late 1940s saw the first wave of postwar color enthusiasm: designer Christian Dior's 1947 'New Look' collection used rich jewel tones as deliberate reaction against wartime austerity.",
    influence:
      "Military olive and khaki remain perennial fashion neutrals; the late-1940s jewel-tone reaction recurs whenever a period of austerity gives way to consumer liberation.",
    colors: [
      { hex: "#4D5925", name: "Olive Drab", role: "Military Dominant" },
      { hex: "#1D3560", name: "Naval Blue", role: "Service Color" },
      { hex: "#C4A660", name: "Khaki", role: "Utility Neutral" },
      { hex: "#B82020", name: "Victory Red", role: "Patriotic Accent" },
      { hex: "#7A6848", name: "Field Tan", role: "Earthy Neutral" },
      { hex: "#E8D8B4", name: "Canvas Cream", role: "Background" },
    ],
    tags: ["Military", "Wartime", "Victory Colors", "Utility", "Post-War"],
    browseHref: "/families/green/",
  },
  {
    id: "1950s",
    decade: "1950s",
    period: "1950–1959",
    era: "The Atomic Age",
    movement: "Mid-Century Modern",
    description:
      "Postwar prosperity and atomic-age optimism produced the most distinctive pastel palette in design history: mint green appliances, coral pink diners, butter yellow kitchens, baby blue automobiles. The American suburb became a color laboratory for mass consumer culture.",
    context:
      "Dupont and other chemical manufacturers introduced new synthetic dyes that made previously expensive colors affordable at mass scale. Home appliances became design objects; Frigidaire offered refrigerators in pink, yellow, turquoise, and green. The era's graphic design — drawn from Swiss International Style and American advertising — established grids and limited palettes still used today.",
    influence:
      "The 1950s pastel palette is permanently identified with mid-century nostalgia — it appears in retro diner branding, vintage-inspired illustration, and the color vocabulary of films like La La Land.",
    colors: [
      { hex: "#9FD4B2", name: "Mint Mist", role: "Appliance Color" },
      { hex: "#E8857A", name: "Coral Blush", role: "Diner Signature" },
      { hex: "#F0D070", name: "Butter Yellow", role: "Kitchen Color" },
      { hex: "#8ABCD1", name: "Powder Blue", role: "Automotive Color" },
      { hex: "#484848", name: "Charcoal", role: "Contrast Anchor" },
      { hex: "#F5EDD8", name: "Parchment White", role: "Background" },
    ],
    tags: ["Pastels", "Atomic Age", "Mid-Century", "Postwar Optimism", "American Suburbia"],
    browseHref: "/families/green/",
  },
  {
    id: "1960s",
    decade: "1960s",
    period: "1960–1969",
    era: "Pop Art & The Summer of Love",
    movement: "Pop Art",
    description:
      "The 1960s exploded chromatic convention. Pop Art (Warhol, Lichtenstein) pushed primary colors to billboard intensity. Psychedelic design pushed further — fluorescent and impossible hues that had no precedent in pre-synthetic dye culture. The Mod movement added geometric precision to chromatic boldness.",
    context:
      "New fluorescent and day-glo dye chemistry enabled colors that seemed to vibrate. The counterculture associated intense color with liberation, consciousness expansion, and political statement. Meanwhile, op art (Bridget Riley) explored how colors interact perceptually, laying groundwork for visual illusion design. Mary Quant's fashion and Carnaby Street made color intensity a generational identity marker.",
    influence:
      "This is the reference palette for psychedelic, counterculture, and 'retro pop' aesthetics. Contemporary streetwear, festival design, and editorial photography regularly reference 1960s chromatic intensity.",
    colors: [
      { hex: "#EFC200", name: "Pop Yellow", role: "Primary Statement" },
      { hex: "#E01870", name: "Hot Magenta", role: "Psychedelic Accent" },
      { hex: "#0058C8", name: "Electric Blue", role: "Pop Art Primary" },
      { hex: "#88CC38", name: "Lime Green", role: "Mod Accent" },
      { hex: "#E86820", name: "Op Art Orange", role: "Vibration Color" },
      { hex: "#8038B8", name: "Psychedelic Violet", role: "Counterculture" },
    ],
    tags: ["Pop Art", "Psychedelic", "Mod", "Fluorescent", "Counterculture", "Bold"],
    browseHref: "/families/yellow/",
  },
  {
    id: "1970s",
    decade: "1970s",
    period: "1970–1979",
    era: "Earth Tones & Disco",
    movement: "Earth Tones",
    description:
      "The 1970s divided between two irreconcilable palettes: the warm earth tones of the environmental movement, macramé culture, and organic design — harvest gold, avocado green, burnt orange — and the chrome-and-glitter excess of disco. Both were reactions to the 1960s, just opposite reactions.",
    context:
      "The 1970 Earth Day and the 1973 oil crisis prompted a cultural retreat into natural, earthy aesthetics. Harvest gold and avocado green became the era's most infamous appliance colors, surviving in kitchens until the 1980s. Simultaneously, disco culture (Studio 54, Donna Summer, Saturday Night Fever) used metallic reflective surfaces, black, and electric accents to create a nighttime counterpoint to the organic daytime palette.",
    influence:
      "Earth tones return cyclically in interior design — they appeared again strongly in the late 1990s, mid-2010s, and again in 2021-2023 as 'warm minimalism.' Harvest gold is now ironic vintage; burnt orange is permanent.",
    colors: [
      { hex: "#CC8C10", name: "Harvest Gold", role: "Era Signature" },
      { hex: "#5A7830", name: "Avocado Green", role: "Appliance Color" },
      { hex: "#C84820", name: "Burnt Orange", role: "Dominant Warm" },
      { hex: "#78482A", name: "Chocolate Brown", role: "Earth Neutral" },
      { hex: "#B03820", name: "Rust", role: "Fashion Accent" },
      { hex: "#C8A870", name: "Macramé Sand", role: "Craft Neutral" },
    ],
    tags: ["Earth Tones", "Organic", "Disco", "Harvest Gold", "Environmental", "Warm"],
    browseHref: "/families/orange/",
  },
  {
    id: "1980s",
    decade: "1980s",
    period: "1980–1989",
    era: "Neon & Power Dressing",
    movement: "Postmodern",
    description:
      "The 1980s embraced chromatic aggression: neon colors that activated under UV light, Miami Vice pastels against tropical darkness, Memphis Design's graphic pattern conflicts, and power dressing's authority shoulders in magenta and cobalt. Excess was the aesthetic.",
    context:
      "MTV (1981) and the expansion of color television into every home turned design into a broadcast medium. Memphis Group (1981, Ettore Sottsass) used color as disruption — clashing primaries on pattern fields that refused to harmonize. Miami Vice's production design used color temperature strategically: pastels at high exposure against blue-hour sky. The financial boom created a market for expensive conspicuous color in fashion, cars, and interiors.",
    influence:
      "The 1980s are the most referenced past decade in contemporary fashion and graphic design — 'retrowave,' 'vaporwave,' 'synthwave,' and 'Memphis revival' all draw directly from this palette. The era's neons appear in every decade.",
    colors: [
      { hex: "#FF18CC", name: "Neon Magenta", role: "Era Signature" },
      { hex: "#00CCFF", name: "Electric Cyan", role: "Miami Vice Blue" },
      { hex: "#28FF14", name: "Arcade Green", role: "Neon Accent" },
      { hex: "#FFE800", name: "Acid Yellow", role: "Memphis Color" },
      { hex: "#8000FF", name: "Electric Violet", role: "Synth Accent" },
      { hex: "#FF6400", name: "Neon Orange", role: "Power Color" },
    ],
    tags: ["Neon", "Memphis", "Miami Vice", "Synthwave", "Power Dressing", "MTV"],
    browseHref: "/families/magenta/",
  },
  {
    id: "1990s",
    decade: "1990s",
    period: "1990–1999",
    era: "Grunge & Digital Minimalism",
    movement: "Grunge",
    description:
      "The 1990s split between grunge's anti-fashion desaturation — flannel gray, olive, maroon, raw denim — and early digital design's constraints: the 216-color web-safe palette, Windows 95 teal, and the reductive minimalism that reacted against 1980s excess. Both aesthetics valued the drained, the stripped, the authentically rough.",
    context:
      "Grunge (Seattle, Nirvana, 1991) made anti-color a cultural statement: the deliberate rejection of 1980s neon excess in favor of unwashed, unmaintained, naturally faded colors. Simultaneously, the World Wide Web's emergence created a new design constraint: screens displayed limited colors reliably, making the web-safe palette (216 colors) and the Windows interface palette (teal, gray, maroon) canonical. The late 1990s saw a partial recovery of color in pop (Spice Girls, Clueless aesthetics).",
    influence:
      "Grunge colors return cyclically as 'normcore' and 'quiet luxury' aesthetics. Windows 95 teal is meme-indexed. The 1990s minimalism influenced the entire Swiss-influenced flat design wave of the 2010s.",
    colors: [
      { hex: "#585850", name: "Flannel Gray", role: "Grunge Neutral" },
      { hex: "#6A7840", name: "Grunge Olive", role: "Unwashed Green" },
      { hex: "#882040", name: "Maroon", role: "Era Accent" },
      { hex: "#308080", name: "Windows Teal", role: "Digital Signature" },
      { hex: "#C8A0B8", name: "Mauve", role: "Pop Accent" },
      { hex: "#282828", name: "Grunge Black", role: "Foundation" },
    ],
    tags: ["Grunge", "Minimalism", "Web-Safe", "Anti-Fashion", "Digital", "Normcore"],
    browseHref: "/families/blue/",
  },
  {
    id: "2000s",
    decade: "2000s",
    period: "2000–2009",
    era: "Y2K & Digital Optimism",
    movement: "Y2K",
    description:
      "The early 2000s brought Y2K's bubblegum optimism — ice blue, baby pink, chrome silver — expressed in a plastic aesthetic of everything from iPod packaging to Razr phones. By mid-decade, digital gradient design and the rise of social networking shifted the palette toward warmer, more personalized colors.",
    context:
      "Apple's iMac G3 (1998) introduced translucent candy colors and announced a new aesthetic for consumer technology: friendly, colorful, approachable. The iPod's white-and-chrome simplicity competed against this colorfulness. MySpace personalization democratized web color choices, while Von Dutch trucker hats and Juicy Couture introduced a specific shade of velour pink. The latter part of the decade saw earth tones return as a post-maximalism correction.",
    influence:
      "Y2K aesthetics had a major revival in 2020-2023, driven by nostalgia in fashion and music. Ice blue and baby pink remain signature 'Y2K' signals. Chrome silver is permanently associated with early-2000s tech.",
    colors: [
      { hex: "#FFB4C2", name: "Y2K Baby Pink", role: "Fashion Signature" },
      { hex: "#B8D8EC", name: "Ice Blue", role: "Tech Aesthetic" },
      { hex: "#C0C0C0", name: "Chrome Silver", role: "Y2K Metal" },
      { hex: "#A8D840", name: "Digital Lime", role: "Screen Green" },
      { hex: "#FF6C00", name: "Y2K Orange", role: "Energy Accent" },
      { hex: "#F0F0F0", name: "Digital White", role: "Apple Clean" },
    ],
    tags: ["Y2K", "Translucent", "Candy Color", "Chrome", "Baby Pink", "Apple"],
    browseHref: "/families/rose/",
  },
  {
    id: "2010s",
    decade: "2010s",
    period: "2010–2019",
    era: "Instagram & Flat Design",
    movement: "Flat Design",
    description:
      "The 2010s were shaped by two design revolutions: iOS 7's (2013) flat design abolished skeuomorphism and with it the textured, complex color palettes of the 2000s, replacing them with clean, saturated flat colors. Instagram's square filter aesthetic simultaneously made a specific pink-peach-gold palette synonymous with aspirational lifestyle.",
    context:
      "Millennial Pink — the specific desaturated rose-pink that appeared in everything from Glossier branding to rose gold iPhone cases — became the decade's unofficial color and a subject of cultural analysis. The annual Pantone Color of the Year gained unprecedented influence: Marsala (2015), Serenity/Rose Quartz (2016), Greenery (2017), Ultra Violet (2018) each drove design decisions at scale. Material Design (2014) standardized bold primary colors with white space and elevation shadows.",
    influence:
      "Millennial Pink remains readable as shorthand for 2010s aesthetics. Flat design's color principles — bold, accessible primary palettes against white — persist in every major tech interface.",
    colors: [
      { hex: "#F4A8B4", name: "Millennial Pink", role: "Era Signature" },
      { hex: "#C8D4E0", name: "Muted Blue Gray", role: "Flat Neutral" },
      { hex: "#F0A030", name: "Instagram Amber", role: "Social Warm" },
      { hex: "#3C3C4C", name: "Flat Charcoal", role: "Interface Dark" },
      { hex: "#34C45A", name: "Material Green", role: "Flat Primary" },
      { hex: "#C43020", name: "Material Red", role: "Action Color" },
    ],
    tags: ["Millennial Pink", "Flat Design", "Instagram", "Material", "Pantone", "Minimalism"],
    browseHref: "/families/rose/",
  },
  {
    id: "2020s",
    decade: "2020s",
    period: "2020–present",
    era: "Biophilic Calm & Periwinkle",
    movement: "Biophilic",
    description:
      "The pandemic decade turned inward. Sage green, terracotta, warm sand, and soft neutrals expressed a yearning for the natural and the grounded. Pantone's 2022 Color of the Year — Very Peri, a blue-violet periwinkle — announced a new emotional vocabulary: introspective, liminal, neither warm nor cool, expressing the decade's ambivalence.",
    context:
      "The 2020-2022 lockdown period compressed design trends into rapid cycles. Cottagecore's botanical greens and earthy terracottas appeared alongside the 'dark academia' aesthetic's brown-and-ivory. Soft minimalism replaced sharp flat design as screens became primary living environments. The late 2020s saw maximalist reaction — 'dopamine dressing' and bold character expression — coexisting with the quiet luxury palette of undyed cashmere, stone, and cream.",
    influence:
      "We are still within this decade. Sage green, terracotta, and biophilic natural tones show no sign of retreat. Very Peri's periwinkle-blue-violet is the period's most distinctive chromatic innovation.",
    colors: [
      { hex: "#6667AB", name: "Very Peri", role: "Era Signature" },
      { hex: "#9CAE86", name: "Sage Green", role: "Biophilic Dominant" },
      { hex: "#C4907A", name: "Terracotta", role: "Earthy Warm" },
      { hex: "#E8D4BC", name: "Warm Sand", role: "Quiet Neutral" },
      { hex: "#3C5878", name: "Storm Blue", role: "Pandemic Depth" },
      { hex: "#907060", name: "Warm Umber", role: "Wood Tone" },
    ],
    tags: ["Biophilic", "Sage", "Terracotta", "Very Peri", "Quiet Luxury", "Cottagecore"],
    browseHref: "/families/blue/",
  },
];

export const MOVEMENT_LABELS: Record<DecadeMovement, string> = {
  "Art Deco": "Art Deco",
  "Streamline Moderne": "Streamline Moderne",
  "Mid-Century Modern": "Mid-Century Modern",
  "Pop Art": "Pop Art",
  "Psychedelic": "Psychedelic",
  "Earth Tones": "Earth Tones",
  "Postmodern": "Postmodern",
  "Grunge": "Grunge",
  "Y2K": "Y2K",
  "Flat Design": "Flat Design",
  "Biophilic": "Biophilic",
};

export const MOVEMENT_LABELS_ZH: Record<DecadeMovement, string> = {
  "Art Deco": "装饰艺术",
  "Streamline Moderne": "流线型现代",
  "Mid-Century Modern": "世纪中期现代主义",
  "Pop Art": "波普艺术",
  "Psychedelic": "迷幻风格",
  "Earth Tones": "大地色调",
  "Postmodern": "后现代主义",
  "Grunge": "垃圾摇滚风",
  "Y2K": "千禧年风格",
  "Flat Design": "扁平化设计",
  "Biophilic": "亲生物设计",
};
