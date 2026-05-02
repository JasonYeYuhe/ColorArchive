/**
 * Brand color palettes — programmatic SEO landing pages.
 *
 * Each entry sources colors from a brand's public design system / brand
 * guidelines / official press kit. We do NOT claim affiliation; pages carry
 * an explicit disclaimer ("Unofficial reference, color values from public
 * brand guidelines as of [date].").
 *
 * Color values are facts (sRGB hex codes) and not subject to copyright;
 * we attribute names and link to the public source. If a brand owner
 * objects, the entry is removed within 24h via a public takedown form on
 * the index page.
 *
 * Pages target high-intent long-tail searches like:
 *   - "Apple color palette"
 *   - "Notion brand colors hex"
 *   - "Spotify green hex code"
 */

export type BrandCategory =
  | "tech"
  | "saas"
  | "design"
  | "dev"
  | "social"
  | "media"
  | "consumer"
  | "fintech"
  | "china";

export interface BrandColor {
  role: "primary" | "secondary" | "accent" | "neutral" | "background";
  name: string;
  hex: string;
  note?: string;
}

export interface BrandPalette {
  slug: string;
  name: string;
  category: BrandCategory;
  tagline: string;
  description: string;
  colors: BrandColor[];
  source: {
    url: string;
    asOf: string;
  };
}

export const BRAND_CATEGORY_LABELS: Record<BrandCategory, string> = {
  tech: "Tech & Hardware",
  saas: "SaaS & Productivity",
  design: "Design Tools",
  dev: "Developer Tools",
  social: "Social Platforms",
  media: "Media & Entertainment",
  consumer: "Consumer Brands",
  fintech: "Fintech",
  china: "China Internet",
};

export const brandPalettes: BrandPalette[] = [
  {
    slug: "apple",
    name: "Apple",
    category: "tech",
    tagline: "Stark monochrome, one iconic blue accent.",
    description:
      "Apple's identity is built on uncompromising contrast: pure white-on-black hardware imagery and generous negative space, with a single saturated blue (System Blue, #007AFF) reserved for interactive UI affordances across iOS, macOS, watchOS, and visionOS. The disciplined two-color palette is one of the most recognized in technology.",
    colors: [
      { role: "primary", name: "Apple Black", hex: "#000000", note: "Hardware finishes, packaging, dark-mode canvases." },
      { role: "neutral", name: "Apple White", hex: "#FFFFFF", note: "The default canvas; paired with generous whitespace." },
      { role: "accent", name: "System Blue", hex: "#007AFF", note: "Interactive blue across all Apple platforms." },
    ],
    source: { url: "https://developer.apple.com/design/human-interface-guidelines/color", asOf: "2026-05-02" },
  },
  {
    slug: "google",
    name: "Google",
    category: "tech",
    tagline: "Four primary hues, no shades — pure, optimistic, and global.",
    description:
      "The Google logo uses four primaries (blue, red, yellow, green) chosen for maximum recognizability across cultures and screen densities. Material Design extends these into full tonal scales, but the core brand mark stays at fully saturated, unshaded primaries — a deliberate signal of optimism and accessibility.",
    colors: [
      { role: "primary", name: "Google Blue", hex: "#4285F4" },
      { role: "primary", name: "Google Red", hex: "#EA4335" },
      { role: "primary", name: "Google Yellow", hex: "#FBBC04" },
      { role: "primary", name: "Google Green", hex: "#34A853" },
    ],
    source: { url: "https://about.google/brand-resource-center/", asOf: "2026-05-02" },
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    category: "tech",
    tagline: "Four product squares, four pillars of the Microsoft universe.",
    description:
      "Microsoft's logo squares — orange, green, blue, yellow — historically map to product divisions (Office orange, Xbox green, Windows blue, OneDrive yellow). The current brand system holds them at high saturation against a slate gray neutral, projecting both warmth and enterprise authority.",
    colors: [
      { role: "primary", name: "Office Orange", hex: "#F25022" },
      { role: "primary", name: "Xbox Green", hex: "#7FBA00" },
      { role: "primary", name: "Windows Blue", hex: "#00A4EF" },
      { role: "primary", name: "Yellow", hex: "#FFB900" },
      { role: "neutral", name: "Slate Gray", hex: "#737373" },
    ],
    source: { url: "https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks", asOf: "2026-05-02" },
  },
  {
    slug: "notion",
    name: "Notion",
    category: "saas",
    tagline: "A grayscale workspace where content provides the color.",
    description:
      "Notion's brand intentionally recedes into pure black-on-white so the user's documents, databases, and embedded media take center stage. The N mark is unornamented; accent colors only appear inside content blocks. The palette below names the small set of hues used inside the app's color picker.",
    colors: [
      { role: "primary", name: "Notion Black", hex: "#000000" },
      { role: "neutral", name: "Notion White", hex: "#FFFFFF" },
      { role: "neutral", name: "Notion Gray", hex: "#787774", note: "Body text and secondary UI." },
      { role: "accent", name: "Default Brown", hex: "#9F6B53", note: "From the in-app color picker." },
    ],
    source: { url: "https://www.notion.so/help/color-coded", asOf: "2026-05-02" },
  },
  {
    slug: "linear",
    name: "Linear",
    category: "saas",
    tagline: "Indigo on near-black — the color of focused, modern engineering tools.",
    description:
      "Linear's identity uses one signature indigo (#5E6AD2) against deep neutral grays, projecting precision and craft. The palette is intentionally narrow; the entire app surface uses ten or fewer named tokens, showing how restraint can read as quality.",
    colors: [
      { role: "primary", name: "Linear Indigo", hex: "#5E6AD2", note: "Brand hue and the primary action color." },
      { role: "neutral", name: "Linear Black", hex: "#000000" },
      { role: "neutral", name: "Linear Gray 1", hex: "#1C1D24", note: "The signature near-black surface." },
      { role: "neutral", name: "Linear White", hex: "#FFFFFF" },
    ],
    source: { url: "https://linear.app/brand", asOf: "2026-05-02" },
  },
  {
    slug: "figma",
    name: "Figma",
    category: "design",
    tagline: "The five-color logo is itself the brand system.",
    description:
      "Figma's identity literally is the five colored shapes that compose its F mark — purple, red, orange, blue, green. Each color carries equal weight, and Figma uses them as a vocabulary in marketing illustrations: never tinted, never shaded, always pure. The system rejects hierarchy in favor of plurality.",
    colors: [
      { role: "primary", name: "Figma Purple", hex: "#A259FF" },
      { role: "primary", name: "Figma Red", hex: "#F24E1E" },
      { role: "primary", name: "Figma Orange", hex: "#FF7262" },
      { role: "primary", name: "Figma Blue", hex: "#1ABCFE" },
      { role: "primary", name: "Figma Green", hex: "#0ACF83" },
    ],
    source: { url: "https://www.figma.com/community/file/1158407205937813895", asOf: "2026-05-02" },
  },
  {
    slug: "github",
    name: "GitHub",
    category: "dev",
    tagline: "The Octocat is grayscale; the system colors carry semantic meaning.",
    description:
      "GitHub's brand mark is intentionally monochrome, leaving the colorful semantic palette (success green, attention yellow, danger red, accent blue) to operate on top inside the product. This separation — neutral identity, vivid signal — is a useful pattern for any developer-facing tool.",
    colors: [
      { role: "primary", name: "GitHub Black", hex: "#181717" },
      { role: "accent", name: "Success Green", hex: "#2DA44E" },
      { role: "accent", name: "Danger Red", hex: "#CF222E" },
      { role: "accent", name: "Attention Yellow", hex: "#9A6700" },
      { role: "accent", name: "Accent Blue", hex: "#0969DA" },
    ],
    source: { url: "https://primer.style/foundations/color/overview", asOf: "2026-05-02" },
  },
  {
    slug: "stripe",
    name: "Stripe",
    category: "fintech",
    tagline: "Indigo over a near-black background — the new default for fintech.",
    description:
      "Stripe established a now-imitated visual language: a bright indigo-purple (#635BFF) against deep navy and white, with crisp gradients running through marketing surfaces. The choice signals technology rather than the trust-blue or wealth-green that older fintech defaulted to.",
    colors: [
      { role: "primary", name: "Stripe Indigo", hex: "#635BFF" },
      { role: "neutral", name: "Slate Navy", hex: "#0A2540" },
      { role: "accent", name: "Success Green", hex: "#00D924" },
      { role: "neutral", name: "Off White", hex: "#F6F9FC" },
    ],
    source: { url: "https://stripe.com/newsroom/brand-assets", asOf: "2026-05-02" },
  },
  {
    slug: "vercel",
    name: "Vercel",
    category: "dev",
    tagline: "Black, white, and the negative space between — a deployment platform aesthetic.",
    description:
      "Vercel's identity is one of the most disciplined in software: pure black on pure white, with the triangular wordmark doing all the work. Marketing uses high-fidelity gradients sparingly; product UI maintains the same restraint, leaving deployment status colors as the only chromatic accents.",
    colors: [
      { role: "primary", name: "Vercel Black", hex: "#000000" },
      { role: "neutral", name: "Vercel White", hex: "#FFFFFF" },
      { role: "neutral", name: "Gray 1", hex: "#FAFAFA" },
      { role: "accent", name: "Vercel Blue", hex: "#0070F3", note: "Used sparingly on links and CTAs." },
    ],
    source: { url: "https://vercel.com/design", asOf: "2026-05-02" },
  },
  {
    slug: "supabase",
    name: "Supabase",
    category: "dev",
    tagline: "A signature emerald that says 'open-source, technical, alive'.",
    description:
      "Supabase chose a distinctive bright green (#3ECF8E) as its brand color — a deliberate departure from the blue-purple sea of cloud database vendors. The green carries open-source association and pairs cleanly with deep neutral grays, signaling both technical precision and approachability.",
    colors: [
      { role: "primary", name: "Supabase Green", hex: "#3ECF8E" },
      { role: "neutral", name: "Background Black", hex: "#1F1F1F" },
      { role: "neutral", name: "Surface", hex: "#2A2A2A" },
    ],
    source: { url: "https://supabase.com/brand-assets", asOf: "2026-05-02" },
  },
  {
    slug: "spotify",
    name: "Spotify",
    category: "media",
    tagline: "One unmistakable green, used everywhere.",
    description:
      "Spotify's #1DB954 green is one of the most leveraged brand colors in software: it appears on the logo, the primary CTA, the playback indicator, and even ambient marketing surfaces. The supporting palette is intentionally neutral — black backgrounds let the green sing.",
    colors: [
      { role: "primary", name: "Spotify Green", hex: "#1DB954" },
      { role: "neutral", name: "Spotify Black", hex: "#191414" },
      { role: "neutral", name: "Spotify White", hex: "#FFFFFF" },
    ],
    source: { url: "https://newsroom.spotify.com/media-kit/", asOf: "2026-05-02" },
  },
  {
    slug: "netflix",
    name: "Netflix",
    category: "media",
    tagline: "One red against pure black — the color of cinema in the dark.",
    description:
      "Netflix's #E50914 red is calibrated to pop maximally against the platform's black background — a visual analogue to a movie marquee in a darkened theater. The minimalism is the point: only one accent, used decisively, on every surface.",
    colors: [
      { role: "primary", name: "Netflix Red", hex: "#E50914" },
      { role: "neutral", name: "Netflix Black", hex: "#221F1F" },
      { role: "neutral", name: "White", hex: "#FFFFFF" },
    ],
    source: { url: "https://brand.netflix.com/", asOf: "2026-05-02" },
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    category: "consumer",
    tagline: "Rausch — the Airbnb-only red that became a brand asset.",
    description:
      "Airbnb commissioned its signature color, dubbed 'Rausch' (#FF5A5F), to be specifically theirs — warmer than fire-engine red, more saturated than coral. The supporting palette includes a teal and a saturated orange that broaden the brand from hospitality into experience-driven commerce.",
    colors: [
      { role: "primary", name: "Rausch", hex: "#FF5A5F" },
      { role: "secondary", name: "Babu Teal", hex: "#00A699" },
      { role: "accent", name: "Arches Orange", hex: "#FC642D" },
      { role: "neutral", name: "Hof Gray", hex: "#484848" },
    ],
    source: { url: "https://airbnb.design/building-a-visual-language/", asOf: "2026-05-02" },
  },
  {
    slug: "discord",
    name: "Discord",
    category: "social",
    tagline: "Blurple, the color of online community.",
    description:
      "Discord's #5865F2 (called 'Blurple' internally) is a deliberately neutral hue between blue and purple — friendly enough for casual chat, technical enough for gamers and developers. The supporting status colors (online green, idle yellow, do-not-disturb red) are universally legible.",
    colors: [
      { role: "primary", name: "Blurple", hex: "#5865F2" },
      { role: "accent", name: "Online Green", hex: "#57F287" },
      { role: "accent", name: "Idle Yellow", hex: "#FEE75C" },
      { role: "accent", name: "DND Red", hex: "#ED4245" },
      { role: "accent", name: "Fuchsia", hex: "#EB459E" },
    ],
    source: { url: "https://discord.com/branding", asOf: "2026-05-02" },
  },
  {
    slug: "slack",
    name: "Slack",
    category: "saas",
    tagline: "An eight-color logo, distilled from a hashtag.",
    description:
      "Slack's iconic hashtag-derived logo distills four hues — aubergine purple, sky blue, sage green, peach — anchored on a deep aubergine. The system rejects monoculture: each color expresses a different facet of work conversation (focus, openness, growth, energy).",
    colors: [
      { role: "primary", name: "Aubergine", hex: "#4A154B" },
      { role: "accent", name: "Slack Yellow", hex: "#ECB22E" },
      { role: "accent", name: "Slack Blue", hex: "#36C5F0" },
      { role: "accent", name: "Slack Green", hex: "#2EB67D" },
      { role: "accent", name: "Slack Red", hex: "#E01E5A" },
    ],
    source: { url: "https://slack.com/media-kit", asOf: "2026-05-02" },
  },
  {
    slug: "twitter-x",
    name: "X (Twitter)",
    category: "social",
    tagline: "From sky blue to absolute black — a rebrand in pure contrast.",
    description:
      "X's 2023 rebrand jettisoned the iconic Twitter Blue (#1DA1F2) for a stark black-and-white system, betting that high contrast would read as authority. The legacy blue is still recognized worldwide; both palettes are documented below.",
    colors: [
      { role: "primary", name: "X Black", hex: "#000000", note: "Current X (post-2023) primary." },
      { role: "neutral", name: "White", hex: "#FFFFFF" },
      { role: "secondary", name: "Twitter Blue (legacy)", hex: "#1D9BF0", note: "Pre-2023 brand color, still widely recognized." },
    ],
    source: { url: "https://about.twitter.com/en/who-we-are/brand-toolkit", asOf: "2026-05-02" },
  },
  {
    slug: "instagram",
    name: "Instagram",
    category: "social",
    tagline: "A four-stop gradient is the brand — purple to magenta to orange to yellow.",
    description:
      "Instagram's 2016 redesign replaced its skeuomorphic camera with a continuous gradient logo. The four named gradient stops below define the brand's expression on every surface: a sunset compressed into a single icon, optimized for the mobile feed.",
    colors: [
      { role: "primary", name: "Sunset Yellow", hex: "#F58529" },
      { role: "primary", name: "Sunset Pink", hex: "#DD2A7B" },
      { role: "primary", name: "Sunset Purple", hex: "#8134AF" },
      { role: "primary", name: "Sunset Indigo", hex: "#515BD4" },
    ],
    source: { url: "https://about.meta.com/brand/resources/instagram/instagram-brand/", asOf: "2026-05-02" },
  },
  {
    slug: "tiktok",
    name: "TikTok",
    category: "social",
    tagline: "A black canvas with a chromatic-aberration flicker — cyan and magenta.",
    description:
      "TikTok's logo embeds optical chromatic aberration: a cyan and a magenta ghost offset around a white musical note on black. The two accent hues — #25F4EE cyan and #FE2C55 red-magenta — appear across the product as motion accents and call-to-action highlights.",
    colors: [
      { role: "primary", name: "TikTok Black", hex: "#000000" },
      { role: "accent", name: "TikTok Cyan", hex: "#25F4EE" },
      { role: "accent", name: "TikTok Red", hex: "#FE2C55" },
      { role: "neutral", name: "White", hex: "#FFFFFF" },
    ],
    source: { url: "https://www.tiktok.com/brand", asOf: "2026-05-02" },
  },
  {
    slug: "reddit",
    name: "Reddit",
    category: "social",
    tagline: "Reddit Orangered — a hue named after the brand itself.",
    description:
      "Reddit's #FF4500 — internally referred to as 'Orangered' — is one of the few brand colors so distinctive that the name predates the marketing. The color anchors the alien mascot, the upvote arrow, and every notification badge across web, iOS, and Android.",
    colors: [
      { role: "primary", name: "Orangered", hex: "#FF4500" },
      { role: "secondary", name: "Periwinkle", hex: "#7193FF", note: "Modern UI accent." },
      { role: "neutral", name: "Reddit White", hex: "#FFFFFF" },
    ],
    source: { url: "https://redditinc.com/brand", asOf: "2026-05-02" },
  },
  {
    slug: "pinterest",
    name: "Pinterest",
    category: "social",
    tagline: "A single saturated red that doubles as a verb.",
    description:
      "Pinterest's #E60023 red is among the most consistently applied brand colors in social: every Save button, every iOS badge, every campaign uses the exact same value. The supporting palette is intentionally minimal — white, near-black, and the red. The result reads as confident commerce.",
    colors: [
      { role: "primary", name: "Pinterest Red", hex: "#E60023" },
      { role: "neutral", name: "Pinterest White", hex: "#FFFFFF" },
      { role: "neutral", name: "Pinterest Black", hex: "#000000" },
    ],
    source: { url: "https://newsroom.pinterest.com/media-kit", asOf: "2026-05-02" },
  },
  {
    slug: "coca-cola",
    name: "Coca-Cola",
    category: "consumer",
    tagline: "The original heritage red.",
    description:
      "Coca-Cola's red has been the same since 1886 — a warm, slightly orange-shifted red (#F40009 in current Pantone-matched form) that reads as celebration and warmth across cultures. It is one of the few brand colors with global trademark recognition.",
    colors: [
      { role: "primary", name: "Coca-Cola Red", hex: "#F40009" },
      { role: "neutral", name: "Coca-Cola White", hex: "#FFFFFF" },
      { role: "neutral", name: "Pantone 484 (depth)", hex: "#9C2A2C" },
    ],
    source: { url: "https://www.coca-colacompany.com/about-us/our-story", asOf: "2026-05-02" },
  },
  {
    slug: "starbucks",
    name: "Starbucks",
    category: "consumer",
    tagline: "Siren Green — the color of premium coffee since 1971.",
    description:
      "Starbucks' #006241 is a deeply saturated emerald, calibrated dark enough to maintain identity at small sizes (think the cup wrap on a hot latte) and warm enough to read as inviting rather than corporate. The supporting palette uses cream and warm neutrals.",
    colors: [
      { role: "primary", name: "Starbucks Green", hex: "#006241" },
      { role: "neutral", name: "Starbucks White", hex: "#FFFFFF" },
      { role: "neutral", name: "Warm Neutral", hex: "#D4E9E2" },
    ],
    source: { url: "https://creative.starbucks.com/", asOf: "2026-05-02" },
  },
  {
    slug: "mcdonalds",
    name: "McDonald's",
    category: "consumer",
    tagline: "Yellow on red — appetite, energy, and the most-recognized arches in the world.",
    description:
      "McDonald's combination of #FFC72C 'Golden Yellow' and #DA291C 'Red' is engineered for instant recognition at highway speeds. Color psychology research consistently links the pair to appetite stimulation; whether or not that's deterministic, the global recognition is undisputed.",
    colors: [
      { role: "primary", name: "Golden Yellow", hex: "#FFC72C" },
      { role: "primary", name: "Mickey D Red", hex: "#DA291C" },
    ],
    source: { url: "https://corporate.mcdonalds.com/corpmcd/our-stories/our-brand-platform.html", asOf: "2026-05-02" },
  },
  {
    slug: "nike",
    name: "Nike",
    category: "consumer",
    tagline: "Black on white. The Swoosh does the rest.",
    description:
      "Nike's brand expression has never relied on a single brand color. The #000000 Swoosh on white is the canonical mark, but campaigns use product photography hues directly — every shoe drop becomes its own palette story. The brand's restraint at the identity level enables maximum chromatic freedom in marketing.",
    colors: [
      { role: "primary", name: "Nike Black", hex: "#000000" },
      { role: "neutral", name: "Nike White", hex: "#FFFFFF" },
    ],
    source: { url: "https://about.nike.com/", asOf: "2026-05-02" },
  },
  {
    slug: "wechat",
    name: "WeChat 微信",
    category: "china",
    tagline: "WeChat Green — China's most-used app, in one hue.",
    description:
      "WeChat's #07C160 green is among the most-seen brand colors on the planet — over a billion users see it daily as the app icon, the chat bubble, and the QR code button. Tencent's design team revised the green slightly brighter in 2020 for OLED legibility while keeping the same emotional weight.",
    colors: [
      { role: "primary", name: "WeChat Green", hex: "#07C160" },
      { role: "neutral", name: "WeChat White", hex: "#FFFFFF" },
      { role: "neutral", name: "WeChat Black", hex: "#181818" },
    ],
    source: { url: "https://wechat.com/en/", asOf: "2026-05-02" },
  },
];

// ---- Helpers ----

const bySlug = new Map(brandPalettes.map((b) => [b.slug, b]));

export function getBrandBySlug(slug: string): BrandPalette | undefined {
  return bySlug.get(slug);
}

export function brandsByCategory(): Map<BrandCategory, BrandPalette[]> {
  const map = new Map<BrandCategory, BrandPalette[]>();
  for (const b of brandPalettes) {
    if (!map.has(b.category)) map.set(b.category, []);
    map.get(b.category)!.push(b);
  }
  return map;
}
