/**
 * generate-downloads.mjs
 * Generates download files in public/downloads/ from collection data.
 * Run via: node scripts/generate-downloads.mjs
 * Called automatically before npm run build via "prebuild" script.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://colorarchive.org";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@colorarchive.org";
const OUT_DIR = join(ROOT, "public", "downloads");
const GENERATED_DIR = join(ROOT, "public", "generated");
const OG_DIR = join(GENERATED_DIR, "og");

// Minimal HSL→RGB→Hex implementation (mirrors src/lib/color-utils.ts)
function hslToHex(h, s, l) {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;
  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const hue2rgb = (p2, q2, t) => {
    let t2 = t;
    if (t2 < 0) t2 += 1;
    if (t2 > 1) t2 -= 1;
    if (t2 < 1 / 6) return p2 + (q2 - p2) * 6 * t2;
    if (t2 < 1 / 2) return q2;
    if (t2 < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t2) * 6;
    return p2;
  };
  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

// Color catalog (mirrors src/data/colors.ts)
const HUE_CATALOG = [
  { name: "Crimson", hue: 0 }, { name: "Ruby", hue: 10 }, { name: "Ember", hue: 20 },
  { name: "Coral", hue: 30 }, { name: "Apricot", hue: 40 }, { name: "Amber", hue: 50 },
  { name: "Citrine", hue: 60 }, { name: "Honey", hue: 70 }, { name: "Olive", hue: 80 },
  { name: "Lime", hue: 90 }, { name: "Moss", hue: 100 }, { name: "Leaf", hue: 110 },
  { name: "Emerald", hue: 120 }, { name: "Mint", hue: 130 }, { name: "Seafoam", hue: 140 },
  { name: "Jade", hue: 150 }, { name: "Teal", hue: 160 }, { name: "Lagoon", hue: 170 },
  { name: "Aqua", hue: 180 }, { name: "Cerulean", hue: 190 }, { name: "Azure", hue: 200 },
  { name: "Sapphire", hue: 210 }, { name: "Cobalt", hue: 220 }, { name: "Indigo", hue: 230 },
  { name: "Iris", hue: 240 }, { name: "Violet", hue: 250 }, { name: "Orchid", hue: 260 },
  { name: "Plum", hue: 270 }, { name: "Mulberry", hue: 280 }, { name: "Magenta", hue: 290 },
  { name: "Fuchsia", hue: 300 }, { name: "Peony", hue: 310 }, { name: "Rose", hue: 320 },
  { name: "Blush", hue: 330 }, { name: "Garnet", hue: 340 }, { name: "Merlot", hue: 350 },
];
const LIGHTNESS_CATALOG = [
  { name: "Veil", l: 98 }, { name: "Whisper", l: 94 }, { name: "Mist", l: 90 },
  { name: "Pearl", l: 84 }, { name: "Bloom", l: 76 }, { name: "Silk", l: 68 },
  { name: "Tone", l: 60 }, { name: "Radiant", l: 54 }, { name: "Core", l: 48 },
  { name: "Velvet", l: 42 }, { name: "Dusk", l: 34 }, { name: "Shadow", l: 28 },
  { name: "Nocturne", l: 20 }, { name: "Ink", l: 14 },
];
const CHROMA_CATALOG = [
  { name: "Muted", s: 18 }, { name: "Soft", s: 34 }, { name: "Clear", s: 54 }, { name: "Vivid", s: 74 },
];

function createId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

// Build color lookup map
const colorMap = new Map();
for (const { name: hueName, hue } of HUE_CATALOG) {
  for (const { name: lName, l } of LIGHTNESS_CATALOG) {
    for (const { name: cName, s } of CHROMA_CATALOG) {
      const colorName = `${hueName} ${lName} ${cName}`;
      const id = createId(colorName);
      colorMap.set(id, { name: colorName, hex: hslToHex(hue, s, l), hsl: `hsl(${hue}, ${s}%, ${l}%)`, hue, saturation: s, lightness: l });
    }
  }
}

// Collection definitions (mirrors src/lib/collections.ts)
const COLLECTIONS = [
  {
    id: "quiet-luxury", title: "Quiet Luxury",
    summary: "Soft neutrals and muted warm surfaces for editorial, beauty, and premium product work.",
    description: "A restrained palette built around pale blush, sand, oat, and deep grounding neutrals. Use it when the interface should feel expensive without becoming cold.",
    tags: ["Editorial", "Neutral", "Luxury"],
    paletteIds: ["blush-whisper-muted", "apricot-pearl-soft", "honey-bloom-muted", "olive-tone-muted", "merlot-ink-muted"],
    editorialNote: "Use this when you need a product page or editorial surface to feel expensive, restrained, and warm rather than aggressively minimal.",
    promptWords: ["soft stone", "blush paper", "quiet hotel", "cashmere", "late daylight"],
    useCases: ["Editorial landing pages", "Beauty products", "Luxury product UI"],
  },
  {
    id: "modern-seaside", title: "Modern Seaside",
    summary: "Clear coastal blues and seafoam accents with enough structure for UI and brand systems.",
    description: "This collection balances air, water, and contrast. It works for dashboards, travel, lifestyle products, and any surface that needs calm energy.",
    tags: ["Coastal", "Fresh", "UI"],
    paletteIds: ["seafoam-whisper-soft", "lagoon-bloom-clear", "cerulean-silk-clear", "azure-core-vivid", "indigo-nocturne-soft"],
    editorialNote: "This set balances freshness and structure. It works when the product should feel open and coastal without becoming childish.",
    promptWords: ["salt air", "glass water", "seafoam", "clear horizon", "modern coastal"],
    useCases: ["Travel tools", "Wellness brands", "Dashboard refreshes"],
  },
  {
    id: "nocturne-tech", title: "Nocturne Tech",
    summary: "Dark-spectrum product colors with enough neon contrast to feel modern, not generic.",
    description: "A near-black base with electric violet, cobalt, and magenta accents. Good for AI tools, music products, and technical launch pages.",
    tags: ["Dark", "Tech", "Launch"],
    paletteIds: ["indigo-ink-muted", "violet-dusk-clear", "cobalt-core-vivid", "fuchsia-radiant-vivid", "aqua-bloom-soft"],
    editorialNote: "A dark-spectrum launch palette for technical products that need contrast and energy without falling back to generic neon-on-black styling.",
    promptWords: ["midnight glass", "signal violet", "cobalt beam", "deep interface", "tech launch"],
    useCases: ["AI tools", "Music products", "Dark-mode launches"],
  },
  {
    id: "editorial-warmth", title: "Editorial Warmth",
    summary: "Paper-like warm colors for publishing, writing, storytelling, and thoughtful landing pages.",
    description: "The palette leans into apricot, amber, garnet, and muted olive so the page feels human and tactile rather than sterile.",
    tags: ["Warm", "Publishing", "Storytelling"],
    paletteIds: ["apricot-whisper-soft", "amber-silk-soft", "citrine-tone-muted", "garnet-velvet-soft", "olive-dusk-muted"],
    editorialNote: "This palette introduces warmth and paper-like tactility. It is useful when the page should feel written, reflective, and human.",
    promptWords: ["paper grain", "warm margin", "publisher desk", "amber ink", "essay"],
    useCases: ["Publishing sites", "Blogs", "Narrative landing pages"],
  },
  {
    id: "orchid-bloom", title: "Orchid Bloom",
    summary: "Blooming pinks and violets with a soft green counterpoint for beauty, culture, and campaign work.",
    description: "This set is intentionally expressive: floral, polished, and bright enough for social surfaces while still staying curated.",
    tags: ["Campaign", "Beauty", "Expressive"],
    paletteIds: ["orchid-bloom-clear", "plum-radiant-clear", "peony-bloom-vivid", "rose-core-soft", "mint-whisper-muted"],
    editorialNote: "A brighter, campaign-ready palette with enough softness to stay curated. Good for beauty, culture, and expressive product storytelling.",
    promptWords: ["orchid light", "soft gloss", "cultural campaign", "floral neon", "beauty launch"],
    useCases: ["Campaign art direction", "Beauty brands", "Social launches"],
  },
  {
    id: "forest-terrain", title: "Forest Terrain",
    summary: "Deep greens, moss, earthy browns, and stone for outdoor, editorial, and natural brand work.",
    description: "A palette rooted in organic outdoor materials — bark, moss, amber soil, and limestone. Use it when the brand needs to feel grounded, natural, and tactile.",
    tags: ["Natural", "Organic", "Outdoor"],
    paletteIds: ["moss-tone-muted", "leaf-dusk-soft", "olive-silk-muted", "amber-velvet-soft", "honey-shadow-muted"],
    editorialNote: "A natural palette for outdoor gear, environmental brands, editorial spreads, and any project that needs to feel rooted in the physical world.",
    promptWords: ["forest floor", "bark texture", "mossy stone", "amber soil", "late autumn"],
    useCases: ["Outdoor brands", "Environmental campaigns", "Editorial layout"],
  },
  {
    id: "nordic-frost", title: "Nordic Frost",
    summary: "Ice blue, pale grey, and soft lavender for minimal UI, SaaS products, and clean landing pages.",
    description: "A cool, restrained palette that feels precise and airy. Works for technical products, productivity tools, and any interface that needs to feel focused and uncluttered.",
    tags: ["Minimal", "Clean", "UI"],
    paletteIds: ["azure-mist-muted", "cerulean-whisper-soft", "sapphire-pearl-muted", "iris-veil-muted", "cobalt-bloom-soft"],
    editorialNote: "Precision and restraint. A palette for interfaces that need to communicate clarity, focus, and intentional minimalism.",
    promptWords: ["ice fog", "pale horizon", "nordic glass", "silent white", "cool precision"],
    useCases: ["SaaS UI", "Tech landing pages", "Minimal dashboards"],
  },
  {
    id: "candy-pop", title: "Candy Pop",
    summary: "Coral, lemon, mint, lavender, and sky — saturated accents for social, D2C, and campaign work.",
    description: "Bright, playful, and deliberately high-energy. Built for maximum visual impact on social media, e-commerce surfaces, and campaign landing pages.",
    tags: ["Vibrant", "Playful", "Campaign"],
    paletteIds: ["coral-radiant-vivid", "citrine-tone-vivid", "mint-core-clear", "peony-core-vivid", "azure-bloom-clear"],
    editorialNote: "For when the work needs to pop. Use this palette on social surfaces, product launches, and anywhere that needs energy and immediacy.",
    promptWords: ["candy gloss", "pop art", "social launch", "neon highlight", "playful brand"],
    useCases: ["Social media", "D2C brands", "Campaign pages"],
  },
  {
    id: "sunset-boulevard", title: "Sunset Boulevard",
    summary: "Warm oranges, pink-golds, and sunset gradient tones for lifestyle, travel, and campaign work.",
    description: "A gradient palette that moves from coral glow through amber warmth to rose-tinged dusk. Built for travel, lifestyle brands, and any surface that needs golden-hour energy.",
    tags: ["Warm", "Lifestyle", "Campaign"],
    paletteIds: ["coral-bloom-clear", "amber-silk-clear", "ruby-radiant-soft", "rose-pearl-soft", "garnet-tone-clear"],
    editorialNote: "Use this when the page needs golden-hour warmth. It works best on lifestyle, travel, and editorial surfaces that should feel aspirational and sun-touched.",
    promptWords: ["golden hour", "sunset glow", "warm gradient", "travel warmth", "amber light"],
    useCases: ["Travel campaigns", "Lifestyle brands", "Editorial hero sections"],
  },
  {
    id: "monochrome-studio", title: "Monochrome Studio",
    summary: "Pure grayscale with micro-warm and micro-cool shifts for editorial, typography, and minimal UI.",
    description: "A near-neutral palette spanning pale mist to deep ink with subtle warm and cool undertones. Ideal for typography-first layouts and restrained editorial work.",
    tags: ["Minimal", "Editorial", "Monochrome"],
    paletteIds: ["honey-whisper-muted", "azure-mist-muted", "olive-silk-muted", "cobalt-dusk-muted", "merlot-ink-muted"],
    editorialNote: "A studio-grade grayscale set with just enough temperature to avoid feeling dead. Good for type-heavy layouts and minimal UI where pure gray feels lifeless.",
    promptWords: ["concrete", "studio light", "newsprint", "pencil sketch", "quiet contrast"],
    useCases: ["Typography layouts", "Minimal UI systems", "Editorial design"],
  },
  {
    id: "neon-after-dark", title: "Neon After Dark",
    summary: "Cyber neon colors on deep dark bases for gaming, nightlife, and bold tech products.",
    description: "Electric contrast between deep nocturne bases and vivid neon accents. Built for gaming interfaces, nightlife branding, and any product that needs to glow in the dark.",
    tags: ["Neon", "Dark", "Gaming"],
    paletteIds: ["fuchsia-radiant-vivid", "aqua-bloom-vivid", "lime-bloom-clear", "violet-nocturne-clear", "cobalt-ink-soft"],
    editorialNote: "High-voltage contrast for dark interfaces. Use the vivid accents sparingly against the deep bases to create neon glow effects without becoming garish.",
    promptWords: ["neon sign", "arcade glow", "cyber night", "electric pulse", "dark interface"],
    useCases: ["Gaming interfaces", "Nightlife branding", "Bold tech products"],
  },
  {
    id: "matcha-linen", title: "Matcha & Linen",
    summary: "Japanese-inspired matcha greens with warm linen and paper whites for wellness, tea, and artisan brands.",
    description: "A calm, crafted palette pairing soft matcha greens with warm paper tones. Designed for wellness products, tea packaging, and artisan brand surfaces that need organic warmth.",
    tags: ["Japanese", "Wellness", "Organic"],
    paletteIds: ["moss-silk-soft", "leaf-bloom-muted", "olive-pearl-muted", "apricot-veil-muted", "honey-whisper-soft"],
    editorialNote: "A restrained, craft-forward palette inspired by Japanese tea aesthetics. Works when the surface needs to feel handmade, organic, and quietly considered.",
    promptWords: ["matcha foam", "washi paper", "ceramic glaze", "zen garden", "linen texture"],
    useCases: ["Wellness brands", "Tea and food packaging", "Artisan product pages"],
  },
  {
    id: "terracotta-loft", title: "Terracotta Loft",
    summary: "Warm clay, rust, and fired earth tones for interior design, architecture, and artisan lifestyle brands.",
    description: "A palette drawn from kiln-fired materials — terracotta, warm stucco, dried rust, and bleached linen.",
    tags: ["Warm", "Architecture", "Artisan"],
    paletteIds: ["coral-velvet-soft", "ember-dusk-muted", "ruby-shadow-muted", "amber-tone-soft", "honey-silk-muted"],
    editorialNote: "A material-forward palette for surfaces that should feel fired, aged, and handmade. Works best for interior design, architecture portfolios, home goods, and artisan food brands.",
    promptWords: ["fired clay", "warm stucco", "rust patina", "adobe wall", "kiln earth"],
    useCases: ["Interior design", "Architecture portfolios", "Home goods and artisan brands"],
  },
  {
    id: "ocean-abyss", title: "Ocean Abyss",
    summary: "Deep-sea blues, teal depths, and bioluminescent accents for fintech, data, and technical product work.",
    description: "A palette built around the pressure and light of deep water — dark teal bases, cobalt mid-tones, and vivid aqua accents.",
    tags: ["Dark", "Fintech", "Data"],
    paletteIds: ["teal-shadow-clear", "aqua-dusk-soft", "cerulean-nocturne-soft", "lagoon-silk-vivid", "cobalt-velvet-clear"],
    editorialNote: "Use this when the product needs to feel deep, technical, and precise. The vivid aqua accent creates bioluminescent contrast against the deep bases.",
    promptWords: ["deep ocean", "submarine light", "pressure blue", "bioluminescent", "abyssal depth"],
    useCases: ["Fintech dashboards", "Data visualization", "Sci-fi and technical products"],
  },
];

const FAMILY_PAGES = [
  { family: "Red", slug: "red", title: "Red Family", summary: "Crimson, ruby, and merlot shades for editorial warmth and bold contrast." },
  { family: "Orange", slug: "orange", title: "Orange Family", summary: "Coral, apricot, and ember tones for warmth, hospitality, and sunlit surfaces." },
  { family: "Yellow", slug: "yellow", title: "Yellow Family", summary: "Amber, citrine, and honey tones for optimistic highlights and soft contrast." },
  { family: "Lime", slug: "lime", title: "Lime Family", summary: "Olive and lime tones for freshness, energy, and curated organic accents." },
  { family: "Green", slug: "green", title: "Green Family", summary: "Moss, leaf, emerald, and mint tones for grounded, natural systems." },
  { family: "Teal", slug: "teal", title: "Teal Family", summary: "Seafoam, jade, lagoon, and teal shades for calm clarity and coastal products." },
  { family: "Blue", slug: "blue", title: "Blue Family", summary: "Azure, sapphire, cobalt, and indigo shades for trust, systems, and technical products." },
  { family: "Purple", slug: "purple", title: "Purple Family", summary: "Iris, violet, orchid, and plum tones for creative and atmospheric palettes." },
  { family: "Pink", slug: "pink", title: "Pink Family", summary: "Magenta, fuchsia, peony, rose, and blush tones for campaign energy and expressive surfaces." },
];

function resolvePalette(paletteIds) {
  return paletteIds.map((id) => {
    const color = colorMap.get(id);
    if (!color) throw new Error(`Unknown color id: ${id}`);
    return { ...color, id };
  });
}

function generateCss(collections) {
  const lines = [":root {"];
  for (const col of collections) {
    const palette = resolvePalette(col.paletteIds);
    lines.push(`\n  /* ${col.title} */`);
    palette.forEach((c, i) => {
      lines.push(`  --${col.id}-${i + 1}: ${c.hex}; /* ${c.name} */`);
    });
  }
  lines.push("}");
  return lines.join("\n");
}

function generateTailwindSnippet(collections) {
  const lines = [
    "/* Tailwind CSS v4 — add to your @theme block */",
    "@theme {",
  ];
  for (const col of collections) {
    const palette = resolvePalette(col.paletteIds);
    lines.push(`\n  /* ${col.title} */`);
    palette.forEach((c, i) => {
      lines.push(`  --color-${col.id}-${i + 1}: ${c.hex};`);
    });
  }
  lines.push("}");
  return lines.join("\n");
}

function generateJson(collections) {
  const data = collections.map((col) => ({
    id: col.id,
    title: col.title,
    summary: col.summary,
    tags: col.tags,
    palette: resolvePalette(col.paletteIds).map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
      hsl: c.hsl,
    })),
  }));
  return JSON.stringify(data, null, 2);
}

// Pack preview files (one CSS per pack, using the pack's previewCollectionIds)
const PACK_PREVIEWS = [
  { id: "palette-pack-vol-1", title: "Palette Pack Vol. 1", collectionIds: ["quiet-luxury", "modern-seaside", "editorial-warmth"] },
  { id: "brand-starter-kit", title: "Brand Color Starter Kit", collectionIds: ["quiet-luxury", "nocturne-tech", "orchid-bloom"] },
  { id: "content-creator-bundle", title: "Creator Bundle", collectionIds: ["modern-seaside", "orchid-bloom"] },
  { id: "complete-archive", title: "Complete Archive Token Set", collectionIds: ["quiet-luxury", "nocturne-tech", "sunset-boulevard", "neon-after-dark"] },
  { id: "dark-mode-ui-kit", title: "Dark Mode UI Kit", collectionIds: ["nocturne-tech", "nordic-frost", "monochrome-studio"] },
  { id: "seasonal-spring-2026", title: "Seasonal: Spring 2026", collectionIds: ["orchid-bloom", "matcha-linen", "sunset-boulevard"] },
];

function generatePackCss(collectionIds) {
  const cols = collectionIds.map((id) => COLLECTIONS.find((c) => c.id === id)).filter(Boolean);
  return generateCss(cols);
}

function generatePackJson(collectionIds) {
  const cols = collectionIds.map((id) => COLLECTIONS.find((c) => c.id === id)).filter(Boolean);
  return generateJson(cols);
}

function buildStyleDictionaryTokens(colors) {
  return {
    color: Object.fromEntries(
      colors.map((color) => [
        color.id,
        {
          value: color.hex,
          type: "color",
          attributes: {
            family:
              color.hue < 15 || color.hue >= 345 ? "red"
              : color.hue < 45 ? "orange"
              : color.hue < 70 ? "yellow"
              : color.hue < 95 ? "lime"
              : color.hue < 150 ? "green"
              : color.hue < 185 ? "teal"
              : color.hue < 250 ? "blue"
              : color.hue < 290 ? "purple"
              : "pink",
            hue: color.hue,
            saturation: color.saturation,
            lightness: color.lightness,
          },
        },
      ]),
    ),
  };
}

function buildFigmaTokens(colors) {
  return Object.fromEntries(
    colors.map((color) => [
      color.id,
      {
        $type: "color",
        $value: color.hex,
        $description: `${color.name} · ${color.hsl}`,
      },
    ]),
  );
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function buildGplPalette(colors, name) {
  const lines = [
    "GIMP Palette",
    `Name: ${name}`,
    "Columns: 4",
    "#",
  ];

  colors.forEach((color) => {
    const { r, g, b } = hexToRgb(color.hex);
    lines.push(`${String(r).padStart(3, " ")} ${String(g).padStart(3, " ")} ${String(b).padStart(3, " ")}\t${color.name}`);
  });

  return lines.join("\n");
}

function buildSketchpalette(colors) {
  return {
    compatibleVersion: "2.0",
    pluginVersion: "2.14",
    colors: colors.map((color) => {
      const { r, g, b } = hexToRgb(color.hex);
      return {
        red: r / 255,
        green: g / 255,
        blue: b / 255,
        alpha: 1,
      };
    }),
  };
}

function encodeUtf16beString(value) {
  const buffer = Buffer.alloc(value.length * 2);
  for (let index = 0; index < value.length; index += 1) {
    buffer.writeUInt16BE(value.charCodeAt(index), index * 2);
  }
  return buffer;
}

function createAseColorBlock(color) {
  const nameWithNull = `${color.name}\0`;
  const nameBuffer = encodeUtf16beString(nameWithNull);
  const content = Buffer.alloc(2 + nameBuffer.length + 4 + 12 + 2);
  let offset = 0;
  content.writeUInt16BE(nameWithNull.length, offset);
  offset += 2;
  nameBuffer.copy(content, offset);
  offset += nameBuffer.length;
  content.write("RGB ", offset, "ascii");
  offset += 4;

  const { r, g, b } = hexToRgb(color.hex);
  content.writeFloatBE(r / 255, offset);
  offset += 4;
  content.writeFloatBE(g / 255, offset);
  offset += 4;
  content.writeFloatBE(b / 255, offset);
  offset += 4;
  content.writeUInt16BE(0, offset);

  const header = Buffer.alloc(6);
  header.writeUInt16BE(0x0001, 0);
  header.writeUInt32BE(content.length, 2);

  return Buffer.concat([header, content]);
}

function buildAsePalette(colors) {
  const header = Buffer.alloc(12);
  header.write("ASEF", 0, "ascii");
  header.writeUInt16BE(1, 4);
  header.writeUInt16BE(0, 6);
  header.writeUInt32BE(colors.length, 8);

  return Buffer.concat([header, ...colors.map((color) => createAseColorBlock(color))]);
}

// ACO (Adobe Color / Photoshop) — v1 + v2 sections
function buildAcoPalette(colors) {
  const v1Header = Buffer.alloc(4);
  v1Header.writeUInt16BE(1, 0);
  v1Header.writeUInt16BE(colors.length, 2);

  const v1Entries = colors.map((color) => {
    const { r, g, b } = hexToRgb(color.hex);
    const buf = Buffer.alloc(10);
    buf.writeUInt16BE(0, 0); // RGB colorspace
    buf.writeUInt16BE(r * 257, 2);
    buf.writeUInt16BE(g * 257, 4);
    buf.writeUInt16BE(b * 257, 6);
    buf.writeUInt16BE(0, 8);
    return buf;
  });

  const v2Header = Buffer.alloc(4);
  v2Header.writeUInt16BE(2, 0);
  v2Header.writeUInt16BE(colors.length, 2);

  const v2Entries = colors.map((color) => {
    const { r, g, b } = hexToRgb(color.hex);
    const name = color.name;
    const nameLen = name.length + 1; // include null terminator
    const nameBuf = Buffer.alloc(nameLen * 2, 0); // zeroed (null terminator included)
    for (let i = 0; i < name.length; i++) {
      nameBuf.writeUInt16BE(name.charCodeAt(i), i * 2);
    }
    const buf = Buffer.alloc(10 + 4 + nameLen * 2);
    let off = 0;
    buf.writeUInt16BE(0, off); off += 2; // RGB
    buf.writeUInt16BE(r * 257, off); off += 2;
    buf.writeUInt16BE(g * 257, off); off += 2;
    buf.writeUInt16BE(b * 257, off); off += 2;
    buf.writeUInt16BE(0, off); off += 2;
    buf.writeUInt16BE(0, off); off += 2; // color type padding
    buf.writeUInt16BE(nameLen, off); off += 2;
    nameBuf.copy(buf, off);
    return buf;
  });

  return Buffer.concat([v1Header, ...v1Entries, v2Header, ...v2Entries]);
}

// Procreate .swatches — creates ZIP file containing Swatches.json
function createProcreateSwatches(outputName, colors, paletteName) {
  const json = JSON.stringify({
    name: paletteName,
    swatches: colors.map((color) => {
      const { r, g, b } = hexToRgb(color.hex);
      return {
        name: color.name,
        color: { colorSpace: 0, red: r / 255, green: g / 255, blue: b / 255, alpha: 1 },
      };
    }),
  }, null, 2);
  const tmpPath = join(OUT_DIR, "Swatches.json");
  const outputPath = join(OUT_DIR, outputName);
  writeFileSync(tmpPath, json, "utf8");
  try { execSync(`rm -f "${outputPath}"`); } catch {}
  execSync(`cd "${OUT_DIR}" && zip -j "${outputPath}" "Swatches.json"`, { stdio: "pipe" });
  execSync(`rm -f "${tmpPath}"`);
  console.log(`✓ Created ${outputName}`);
}

// Framer design tokens — CSS variables for use in Framer Code components
function buildFramerTokens(colors) {
  const lines = [
    "/* Framer Design Tokens — ColorArchive */",
    "/* Paste into Settings → General → Custom Code → <head> section */",
    "/* Then reference via var(--ca-color-name) in Code components */",
    ":root {",
  ];
  for (const color of colors) {
    lines.push(`  --ca-${color.id}: ${color.hex};`);
  }
  lines.push("}");
  return lines.join("\n");
}

// Figma tokens — nested by color family (better Figma Variables panel organization)
function buildFigmaTokensNested(colors) {
  const families = {};
  for (const color of colors) {
    const family =
      color.hue < 15 || color.hue >= 345 ? "red"
      : color.hue < 45 ? "orange"
      : color.hue < 70 ? "yellow"
      : color.hue < 95 ? "lime"
      : color.hue < 150 ? "green"
      : color.hue < 185 ? "teal"
      : color.hue < 250 ? "blue"
      : color.hue < 290 ? "purple"
      : "pink";
    if (!families[family]) families[family] = {};
    families[family][color.id] = {
      $type: "color",
      $value: color.hex,
      $description: `${color.name} · ${color.hsl}`,
    };
  }
  return families;
}

function createOgSvg({ eyebrow, title, summary, swatches, accent = "#171717" }) {
  const swatchRects = swatches
    .slice(0, 6)
    .map(
      (hex, index) => `<rect x="${68 + index * 176}" y="474" width="148" height="74" rx="22" fill="${hex}" />`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" rx="0" fill="#F6F4EF"/>
  <circle cx="150" cy="110" r="180" fill="${accent}" fill-opacity="0.12"/>
  <circle cx="1080" cy="70" r="220" fill="#7DD3FC" fill-opacity="0.12"/>
  <circle cx="1030" cy="550" r="180" fill="#FCA5A5" fill-opacity="0.10"/>
  <rect x="54" y="42" width="1092" height="546" rx="36" fill="white" fill-opacity="0.74" stroke="#171717" stroke-opacity="0.08"/>
  <text x="86" y="104" fill="#6B7280" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3">${escapeXml(eyebrow.toUpperCase())}</text>
  <text x="86" y="196" fill="#111827" font-family="Inter, Arial, sans-serif" font-size="62" font-weight="700">${escapeXml(title)}</text>
  <foreignObject x="86" y="228" width="840" height="170">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:28px;line-height:1.45;color:#4B5563;">
      ${escapeXml(summary)}
    </div>
  </foreignObject>
  <rect x="86" y="428" width="214" height="44" rx="22" fill="#111827"/>
  <text x="123" y="457" fill="white" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700">colorarchive.org</text>
  ${swatchRects}
</svg>`;
}

// Write outputs
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(join(OG_DIR, "packs"), { recursive: true });
mkdirSync(join(OG_DIR, "collections"), { recursive: true });
mkdirSync(join(OG_DIR, "families"), { recursive: true });
mkdirSync(join(OG_DIR, "colors"), { recursive: true });
mkdirSync(join(OG_DIR, "notes"), { recursive: true });
mkdirSync(join(OG_DIR, "guides"), { recursive: true });

// Full archive exports
const ALL_ARCHIVE_COLORS = [...colorMap.entries()].map(([id, color]) => ({ ...color, id }));

writeFileSync(join(OUT_DIR, "colorarchive-all-collections.css"), generateCss(COLLECTIONS), "utf8");
writeFileSync(join(OUT_DIR, "colorarchive-all-collections.json"), generateJson(COLLECTIONS), "utf8");
writeFileSync(join(OUT_DIR, "colorarchive-tailwind-tokens.css"), generateTailwindSnippet(COLLECTIONS), "utf8");
writeFileSync(
  join(OUT_DIR, "colorarchive-style-dictionary.json"),
  JSON.stringify(buildStyleDictionaryTokens(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(
  join(OUT_DIR, "colorarchive-figma-tokens.json"),
  JSON.stringify(buildFigmaTokensNested(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(join(OUT_DIR, "colorarchive.gpl"), buildGplPalette(ALL_ARCHIVE_COLORS, "ColorArchive Full Library"), "utf8");
writeFileSync(
  join(OUT_DIR, "colorarchive-sketchpalette.json"),
  JSON.stringify(buildSketchpalette(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(join(OUT_DIR, "colorarchive.ase"), buildAsePalette(ALL_ARCHIVE_COLORS));
writeFileSync(join(OUT_DIR, "colorarchive.aco"), buildAcoPalette(ALL_ARCHIVE_COLORS));
writeFileSync(join(OUT_DIR, "colorarchive-framer-tokens.css"), buildFramerTokens(ALL_ARCHIVE_COLORS), "utf8");

// Pack preview files
for (const pack of PACK_PREVIEWS) {
  writeFileSync(join(OUT_DIR, `${pack.id}-preview.css`), generatePackCss(pack.collectionIds), "utf8");
  writeFileSync(join(OUT_DIR, `${pack.id}-preview.json`), generatePackJson(pack.collectionIds), "utf8");
}

// Additional token exports for design-tool workflows
writeFileSync(
  join(OUT_DIR, "complete-archive-style-dictionary.json"),
  JSON.stringify(buildStyleDictionaryTokens(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(
  join(OUT_DIR, "complete-archive-figma-tokens.json"),
  JSON.stringify(buildFigmaTokensNested(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(join(OUT_DIR, "complete-archive.gpl"), buildGplPalette(ALL_ARCHIVE_COLORS, "Complete Archive Token Set"), "utf8");
writeFileSync(
  join(OUT_DIR, "complete-archive-sketchpalette.json"),
  JSON.stringify(buildSketchpalette(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(join(OUT_DIR, "complete-archive.ase"), buildAsePalette(ALL_ARCHIVE_COLORS));
writeFileSync(join(OUT_DIR, "complete-archive.aco"), buildAcoPalette(ALL_ARCHIVE_COLORS));
writeFileSync(join(OUT_DIR, "complete-archive-framer-tokens.css"), buildFramerTokens(ALL_ARCHIVE_COLORS), "utf8");

// Route-specific OG assets
for (const collection of COLLECTIONS) {
  const palette = resolvePalette(collection.paletteIds);
  writeFileSync(
    join(OG_DIR, "collections", `${collection.id}.svg`),
    createOgSvg({
      eyebrow: "Collection",
      title: collection.title,
      summary: collection.summary,
      swatches: palette.map((color) => color.hex),
      accent: palette[0]?.hex ?? "#171717",
    }),
    "utf8",
  );
}

for (const pack of PACK_PREVIEWS) {
  const swatches = pack.collectionIds
    .flatMap((collectionId) => resolvePalette(COLLECTIONS.find((entry) => entry.id === collectionId)?.paletteIds ?? []).slice(0, 2))
    .slice(0, 6)
    .map((color) => color.hex);
  writeFileSync(
    join(OG_DIR, "packs", `${pack.id}.svg`),
    createOgSvg({
      eyebrow: "Palette pack",
      title: pack.title,
      summary: "Live ColorArchive digital pack with previewable source collections, token exports, and downloadable assets.",
      swatches,
      accent: swatches[0] ?? "#171717",
    }),
    "utf8",
  );
}

for (const family of FAMILY_PAGES) {
  const swatches = [...colorMap.entries()]
    .map(([id, color]) => ({ ...color, id, family:
      color.hue < 15 || color.hue >= 345 ? "Red"
      : color.hue < 45 ? "Orange"
      : color.hue < 70 ? "Yellow"
      : color.hue < 95 ? "Lime"
      : color.hue < 150 ? "Green"
      : color.hue < 185 ? "Teal"
      : color.hue < 250 ? "Blue"
      : color.hue < 290 ? "Purple"
      : "Pink",
    }))
    .filter((color) => color.family === family.family && color.lightness >= 42 && color.lightness <= 84)
    .sort((left, right) => left.hue - right.hue)
    .slice(0, 6)
    .map((color) => color.hex);

  writeFileSync(
    join(OG_DIR, "families", `${family.slug}.svg`),
    createOgSvg({
      eyebrow: "Family",
      title: family.title,
      summary: family.summary,
      swatches,
      accent: swatches[0] ?? "#171717",
    }),
    "utf8",
  );
}

writeFileSync(
  join(OG_DIR, "families", "index.svg"),
  createOgSvg({
    eyebrow: "Families",
    title: "ColorArchive Families",
    summary: "Browse the archive by hue family, from red and orange through blue, purple, and pink.",
    swatches: ["#E8A4A4", "#F5C882", "#E3D86B", "#A2D66A", "#73C68C", "#7AB9E5"],
    accent: "#111827",
  }),
  "utf8",
);

for (const [id, color] of colorMap.entries()) {
  writeFileSync(
    join(OG_DIR, "colors", `${id}.svg`),
    createOgSvg({
      eyebrow: "Color detail",
      title: color.name,
      summary: `${color.hex} · ${color.hsl} · Explore complementary colors, tonal companions, and export-ready tokens at ColorArchive.`,
      swatches: [color.hex, color.hex, color.hex, "#F6F4EF", "#111827"],
      accent: color.hex,
    }),
    "utf8",
  );
}

// Newsletter notes OG images
const newsletterIssues = JSON.parse(readFileSync(join(ROOT, "src", "data", "newsletter-issues.json"), "utf8"));
const NOTE_ACCENT_COLORS = ["#E8A4A4", "#7AB9E5", "#A2D66A", "#F5C882", "#B8A9E5", "#73C68C", "#E3D86B", "#E89FA4"];
for (let i = 0; i < newsletterIssues.length; i++) {
  const issue = newsletterIssues[i];
  const accent = NOTE_ACCENT_COLORS[i % NOTE_ACCENT_COLORS.length];
  writeFileSync(
    join(OG_DIR, "notes", `${issue.slug}.svg`),
    createOgSvg({
      eyebrow: issue.eyebrow || `Issue ${String(i + 1).padStart(3, "0")}`,
      title: issue.title.length > 50 ? issue.title.slice(0, 47) + "..." : issue.title,
      summary: issue.summary,
      swatches: [accent, "#F6F4EF", "#111827", accent, "#F6F4EF", "#111827"],
      accent,
    }),
    "utf8",
  );
}

// Text usage notes (brand-starter-kit and content-creator-bundle)
writeFileSync(
  join(OUT_DIR, "brand-starter-kit-preview.txt"),
  `ColorArchive — Brand Color Starter Kit

USAGE NOTES

Each palette is structured for brand application:
  -1 colors = Primary (backgrounds, hero surfaces)
  -2 colors = Secondary (UI panels, borders)
  -3 colors = Tertiary (supporting neutrals)
  -4 colors = Accent (buttons, CTAs, highlights)
  -5 colors = Deep base (text, strong contrast)

Apply CSS variables via the included .css file.
For Tailwind 4, use the @theme token snippet.

Collections included: Quiet Luxury, Nocturne Tech, Orchid Bloom
Formats: CSS variables, JSON data
`,
  "utf8"
);

writeFileSync(
  join(OUT_DIR, "content-creator-bundle-preview.txt"),
  `ColorArchive — Creator Bundle

USAGE NOTES

These palettes are optimized for visual content:
- Social media graphics and story cards
- Background and wallpaper color sets
- Prompt-friendly color descriptions for AI tools

Each color includes hex, HSL, and RGB values.
Use the JSON export in design tools or automation scripts.

Collections included: Modern Seaside, Orchid Bloom
Formats: JSON data, text notes
`,
  "utf8"
);

console.log(`✓ Generated ${COLLECTIONS.length} collections → public/downloads/`);
console.log(`✓ ${PACK_PREVIEWS.length} pack preview files updated`);
console.log(`✓ Generated route-specific OG SVGs → public/generated/og/`);
console.log(`✓ Generated Figma (nested) + Style Dictionary + ACO + Framer token exports`);

// ============================================================
// NEW CONTENT CATEGORIES
// ============================================================

// --- Category 1: Visual Assets (SVG palette boards + gradient wallpapers) ---

function generatePaletteBoardSvg(collection) {
  const palette = resolvePalette(collection.paletteIds);
  const w = 1200, h = 400, swatchW = w / 5;
  const rects = palette.map((c, i) => {
    const x = i * swatchW;
    const textColor = c.lightness > 55 ? "#1a1a1a" : "#ffffff";
    return `<rect x="${x}" y="0" width="${swatchW}" height="${h - 60}" fill="${c.hex}"/>
<text x="${x + swatchW / 2}" y="${h - 35}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="#1a1a1a">${escapeXml(c.name)}</text>
<text x="${x + swatchW / 2}" y="${h - 15}" text-anchor="middle" font-family="monospace" font-size="12" fill="#666">${c.hex}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect width="${w}" height="${h}" fill="#fafaf9"/>
${rects}
<text x="${w / 2}" y="${h - 2}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#aaa">${escapeXml(collection.title)} — ColorArchive</text>
</svg>`;
}

function generateGradientWallpaperSvg(collection, diagonal = false) {
  const palette = resolvePalette(collection.paletteIds);
  const w = 1920, h = 1080;
  const gradId = `g-${collection.id}`;
  const stops = palette.map((c, i) => {
    const offset = Math.round((i / (palette.length - 1)) * 100);
    return `<stop offset="${offset}%" stop-color="${c.hex}"/>`;
  }).join("\n");
  const coords = diagonal
    ? `x1="0%" y1="0%" x2="100%" y2="100%"`
    : `x1="0%" y1="50%" x2="100%" y2="50%"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs><linearGradient id="${gradId}" ${coords}>${stops}</linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${gradId})"/>
</svg>`;
}

for (const col of COLLECTIONS) {
  writeFileSync(join(OUT_DIR, `${col.id}-palette-board.svg`), generatePaletteBoardSvg(col), "utf8");
  writeFileSync(join(OUT_DIR, `${col.id}-gradient-wallpaper.svg`), generateGradientWallpaperSvg(col, false), "utf8");
  writeFileSync(join(OUT_DIR, `${col.id}-gradient-wallpaper-diagonal.svg`), generateGradientWallpaperSvg(col, true), "utf8");
}
console.log(`✓ Generated ${COLLECTIONS.length * 3} SVG visual assets (boards + wallpapers)`);

// --- Category 2: Export Formats (SwiftUI, Android XML, Flutter Dart, CSS-in-JS) ---

function toSwiftName(id) {
  return "ca" + id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function toDartName(id) {
  return "ca" + id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function generateSwiftUI(colors, name) {
  const lines = [
    "// ColorArchive — SwiftUI Color Extension",
    `// ${name}`,
    "// Auto-generated — do not edit",
    "",
    "import SwiftUI",
    "",
    "extension Color {",
  ];
  for (const c of colors) {
    const { r, g, b } = hexToRgb(c.hex);
    lines.push(`    /// ${c.name} (${c.hex})`);
    lines.push(`    static var ${toSwiftName(c.id)}: Color { Color(red: ${(r / 255).toFixed(4)}, green: ${(g / 255).toFixed(4)}, blue: ${(b / 255).toFixed(4)}) }`);
  }
  lines.push("}");
  return lines.join("\n");
}

function generateAndroidXml(colors, name) {
  const lines = [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<!-- ColorArchive — ${name} -->`,
    `<!-- Auto-generated — do not edit -->`,
    `<resources>`,
  ];
  for (const c of colors) {
    const xmlName = "ca_" + c.id.replace(/-/g, "_");
    lines.push(`    <color name="${xmlName}">${c.hex}</color> <!-- ${c.name} -->`);
  }
  lines.push(`</resources>`);
  return lines.join("\n");
}

function generateFlutterDart(colors, name) {
  const lines = [
    "// ColorArchive — Flutter Color Constants",
    `// ${name}`,
    "// Auto-generated — do not edit",
    "",
    "import 'package:flutter/material.dart';",
    "",
    "class CAColors {",
  ];
  for (const c of colors) {
    const hex8 = "0xFF" + c.hex.slice(1);
    lines.push(`  /// ${c.name} (${c.hex})`);
    lines.push(`  static const Color ${toDartName(c.id)} = Color(${hex8});`);
  }
  lines.push("}");
  return lines.join("\n");
}

function generateCssInJs(colors, name) {
  const entries = colors.map((c) => `  "${c.id}": "${c.hex}"`).join(",\n");
  return `// ColorArchive — CSS-in-JS Theme Object
// ${name}
// Auto-generated — do not edit
// Usage: import { caTheme } from './colorarchive-theme';

export const caTheme = {
  colors: {
${entries}
  }
};
`;
}

// Full archive platform exports
const allColors = [...colorMap.entries()].map(([id, c]) => ({ id, ...c }));
writeFileSync(join(OUT_DIR, "complete-archive-swiftui.swift"), generateSwiftUI(allColors, "Complete Archive — All 2016 Colors"), "utf8");
writeFileSync(join(OUT_DIR, "complete-archive-colors.xml"), generateAndroidXml(allColors, "Complete Archive — All 2016 Colors"), "utf8");
writeFileSync(join(OUT_DIR, "complete-archive-colors.dart"), generateFlutterDart(allColors, "Complete Archive — All 2016 Colors"), "utf8");
writeFileSync(join(OUT_DIR, "complete-archive-theme.js"), generateCssInJs(allColors, "Complete Archive — All 2016 Colors"), "utf8");

// Per-collection platform exports
for (const col of COLLECTIONS) {
  const palette = resolvePalette(col.paletteIds);
  const colors = palette.map((c) => ({ id: c.id, ...c }));
  writeFileSync(join(OUT_DIR, `${col.id}-swiftui.swift`), generateSwiftUI(colors, col.title), "utf8");
  writeFileSync(join(OUT_DIR, `${col.id}-colors.xml`), generateAndroidXml(colors, col.title), "utf8");
  writeFileSync(join(OUT_DIR, `${col.id}-colors.dart`), generateFlutterDart(colors, col.title), "utf8");
  writeFileSync(join(OUT_DIR, `${col.id}-theme.js`), generateCssInJs(colors, col.title), "utf8");
}
console.log(`✓ Generated platform exports: SwiftUI, Android XML, Flutter Dart, CSS-in-JS`);

// --- Category 3: Accessibility / Contrast Data ---

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function generateContrastData(collection) {
  const palette = resolvePalette(collection.paletteIds);
  const pairs = [];
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const ratio = contrastRatio(palette[i].hex, palette[j].hex);
      pairs.push({
        color1: { name: palette[i].name, hex: palette[i].hex },
        color2: { name: palette[j].name, hex: palette[j].hex },
        ratio: Math.round(ratio * 100) / 100,
        passAA: ratio >= 4.5,
        passAAA: ratio >= 7,
        passAALarge: ratio >= 3,
      });
    }
  }
  const vsWhite = palette.map((c) => {
    const ratio = contrastRatio(c.hex, "#FFFFFF");
    return { name: c.name, hex: c.hex, ratio: Math.round(ratio * 100) / 100, passAA: ratio >= 4.5, passAAA: ratio >= 7, passAALarge: ratio >= 3 };
  });
  const vsBlack = palette.map((c) => {
    const ratio = contrastRatio(c.hex, "#000000");
    return { name: c.name, hex: c.hex, ratio: Math.round(ratio * 100) / 100, passAA: ratio >= 4.5, passAAA: ratio >= 7, passAALarge: ratio >= 3 };
  });
  return { collection: collection.title, id: collection.id, pairs, vsWhite, vsBlack };
}

function formatContrastReport(data) {
  const flag = (v) => v ? "PASS" : "FAIL";
  const lines = [
    `# Contrast Report: ${data.collection}`,
    "",
    "## Color Pairs",
    "",
    "| Pair | Ratio | AA (4.5:1) | AAA (7:1) | AA Large (3:1) |",
    "|------|-------|------------|-----------|----------------|",
  ];
  for (const p of data.pairs) {
    lines.push(`| ${p.color1.name} × ${p.color2.name} | ${p.ratio}:1 | ${flag(p.passAA)} | ${flag(p.passAAA)} | ${flag(p.passAALarge)} |`);
  }
  lines.push("", "## Against White (#FFFFFF)", "", "| Color | Ratio | AA | AAA | AA Large |", "|-------|-------|-----|------|----------|");
  for (const c of data.vsWhite) {
    lines.push(`| ${c.name} (${c.hex}) | ${c.ratio}:1 | ${flag(c.passAA)} | ${flag(c.passAAA)} | ${flag(c.passAALarge)} |`);
  }
  lines.push("", "## Against Black (#000000)", "", "| Color | Ratio | AA | AAA | AA Large |", "|-------|-------|-----|------|----------|");
  for (const c of data.vsBlack) {
    lines.push(`| ${c.name} (${c.hex}) | ${c.ratio}:1 | ${flag(c.passAA)} | ${flag(c.passAAA)} | ${flag(c.passAALarge)} |`);
  }
  lines.push("", `— ColorArchive · `);
  return lines.join("\n");
}

for (const col of COLLECTIONS) {
  const data = generateContrastData(col);
  writeFileSync(join(OUT_DIR, `${col.id}-contrast-matrix.json`), JSON.stringify(data, null, 2), "utf8");
  writeFileSync(join(OUT_DIR, `${col.id}-contrast-report.md`), formatContrastReport(data), "utf8");
}
console.log(`✓ Generated ${COLLECTIONS.length * 2} contrast/accessibility files`);

// --- Category 4: AI / Creator Copy ---

const COLOR_PSYCHOLOGY = {
  red: { mood: "Energy, urgency, passion", associations: "Power, love, danger, excitement. Red draws attention and creates a sense of immediacy.", avoid: "Overuse can feel aggressive or alarming." },
  orange: { mood: "Warmth, enthusiasm, creativity", associations: "Friendliness, confidence, adventure. Orange balances energy with approachability.", avoid: "Can feel cheap or overly casual without supporting neutrals." },
  yellow: { mood: "Optimism, clarity, warmth", associations: "Happiness, intellect, caution. Yellow is the most visible color and suggests openness.", avoid: "Too much yellow can strain eyes; use sparingly as accents." },
  lime: { mood: "Freshness, growth, vitality", associations: "Nature, renewal, youth. Lime bridges the energy of yellow with the calm of green.", avoid: "Can feel acidic or jarring in large areas." },
  green: { mood: "Balance, harmony, growth", associations: "Nature, health, prosperity, stability. Green is the easiest color for eyes to process.", avoid: "Murky greens can suggest decay; keep saturation intentional." },
  teal: { mood: "Calm, sophistication, clarity", associations: "Trust, serenity, emotional balance. Teal combines blue's stability with green's freshness.", avoid: "Very dark teals can feel heavy without light counterpoints." },
  blue: { mood: "Trust, depth, intelligence", associations: "Professionalism, security, calm. Blue is the most universally preferred color.", avoid: "Overuse creates coldness; warm it with complementary tones." },
  purple: { mood: "Creativity, luxury, mystery", associations: "Royalty, wisdom, imagination. Purple suggests premium quality and artistic sensibility.", avoid: "Dark purples can feel heavy; balance with lighter values." },
  pink: { mood: "Expression, beauty, tenderness", associations: "Playfulness, romance, softness. Modern pinks range from bold fuchsia to quiet blush.", avoid: "Stereotypical use feels dated; pair with unexpected neutrals." },
};

function getColorFamily(hue) {
  if (hue < 15 || hue >= 345) return "red";
  if (hue < 45) return "orange";
  if (hue < 70) return "yellow";
  if (hue < 95) return "lime";
  if (hue < 150) return "green";
  if (hue < 185) return "teal";
  if (hue < 250) return "blue";
  if (hue < 290) return "purple";
  return "pink";
}

function generateAiPromptTemplates(collection) {
  const palette = resolvePalette(collection.paletteIds);
  const colorNames = palette.map((c) => `${c.name} (${c.hex})`).join(", ");
  const promptWords = (collection.promptWords || []).join(", ");
  const useCases = (collection.useCases || []).join(", ");

  return `# AI Prompt Templates: ${collection.title}

## Palette
${palette.map((c) => `- ${c.name}: ${c.hex}`).join("\n")}

## Mood Keywords
${promptWords}

## Suggested Use Cases
${useCases}

---

## Prompt 1: Visual Design
Design a landing page using the "${collection.title}" color palette. The colors are: ${colorNames}. The mood should evoke ${promptWords}. Keep the layout clean and modern with generous white space.

## Prompt 2: Brand Identity
Create a brand identity system using these five colors: ${colorNames}. The first color is the primary brand color, the second is secondary, the third is a supporting neutral, the fourth is an accent for CTAs and highlights, and the fifth provides deep contrast for text and anchoring elements. The brand mood is: ${promptWords}.

## Prompt 3: Social Media
Design a set of Instagram story templates using the "${collection.title}" palette (${colorNames}). The feel should be ${promptWords}. Include text overlays, product frames, and quote cards that work as a cohesive series.

---

## Editorial Note
${collection.editorialNote || ""}

— ColorArchive · 
`;
}

function generateColorPsychologyNotes(collection) {
  const palette = resolvePalette(collection.paletteIds);
  const lines = [
    `# Color Psychology: ${collection.title}`,
    "",
    collection.description || collection.summary,
    "",
    "---",
    "",
  ];
  for (const c of palette) {
    const family = getColorFamily(c.hue);
    const psych = COLOR_PSYCHOLOGY[family] || { mood: "Neutral", associations: "Balance and versatility.", avoid: "Can feel bland without contrast." };
    lines.push(`## ${c.name} (${c.hex})`);
    lines.push(`**Family:** ${family.charAt(0).toUpperCase() + family.slice(1)} · **Lightness:** ${c.lightness}% · **Saturation:** ${c.saturation}%`);
    lines.push(`**Mood:** ${psych.mood}`);
    lines.push(`**Associations:** ${psych.associations}`);
    lines.push(`**Caution:** ${psych.avoid}`);
    lines.push("");
  }
  lines.push("— ColorArchive · ");
  return lines.join("\n");
}

function generateBrandUsageGuide(collection) {
  const palette = resolvePalette(collection.paletteIds);
  const roles = ["Primary (backgrounds, hero surfaces)", "Secondary (UI panels, borders)", "Supporting neutral (body text areas)", "Accent (CTAs, buttons, highlights)", "Deep contrast (headings, anchoring elements)"];

  const lines = [
    `# Brand Usage Guide: ${collection.title}`,
    "",
    collection.description || collection.summary,
    "",
    "---",
    "",
    "## Color Roles",
    "",
  ];

  palette.forEach((c, i) => {
    lines.push(`### Slot ${i + 1}: ${roles[i] || "Extra"}`);
    lines.push(`**${c.name}** · ${c.hex}`);
    lines.push("");
  });

  lines.push("## Application Guidelines", "");
  lines.push("### Do");
  lines.push(`- Use **${palette[0].name}** as the dominant surface color (60% of the layout)`);
  lines.push(`- Use **${palette[1].name}** for secondary panels and content areas (30%)`);
  lines.push(`- Reserve **${palette[3].name}** for interactive elements and calls to action (10%)`);
  lines.push(`- Pair **${palette[4].name}** with light backgrounds for readable body text`);
  lines.push("");
  lines.push("### Don't");
  lines.push(`- Don't use the accent color (**${palette[3].name}**) for large background areas`);
  lines.push(`- Don't combine more than 2 saturated colors in the same section`);
  lines.push(`- Don't use light palette colors for body text on white backgrounds — check contrast first`);
  lines.push("");
  lines.push("## Suggested Pairings");
  lines.push(`- **Hero section:** ${palette[0].name} background + ${palette[4].name} text + ${palette[3].name} CTA button`);
  lines.push(`- **Card layout:** ${palette[1].name} card background + ${palette[4].name} heading + ${palette[2].name} border`);
  lines.push(`- **Dark mode:** Invert ${palette[4].name} as background, ${palette[0].name} as text`);
  lines.push("");
  lines.push("— ColorArchive · ");
  return lines.join("\n");
}

for (const col of COLLECTIONS) {
  writeFileSync(join(OUT_DIR, `${col.id}-ai-prompts.md`), generateAiPromptTemplates(col), "utf8");
  writeFileSync(join(OUT_DIR, `${col.id}-color-psychology.md`), generateColorPsychologyNotes(col), "utf8");
  writeFileSync(join(OUT_DIR, `${col.id}-brand-guide.md`), generateBrandUsageGuide(col), "utf8");
}
console.log(`✓ Generated ${COLLECTIONS.length * 3} AI/creator copy files`);

// --- ZIP bundle generation ---
import { execSync } from "child_process";

function createZip(zipName, files) {
  const zipPath = join(OUT_DIR, zipName);
  // Remove existing zip if present
  try { execSync(`rm -f "${zipPath}"`); } catch {}
  // Create zip with the specified files (use relative paths inside zip)
  const fileArgs = files.map((f) => `"${f}"`).join(" ");
  execSync(`cd "${OUT_DIR}" && zip -j "${zipPath}" ${fileArgs}`, { stdio: "pipe" });
  console.log(`✓ Created ${zipName}`);
}

// Procreate swatches
createProcreateSwatches("colorarchive.swatches", ALL_ARCHIVE_COLORS, "ColorArchive Full Library");
createProcreateSwatches("complete-archive.swatches", ALL_ARCHIVE_COLORS, "ColorArchive — Complete Archive");

// Free palette pack ZIP (preview files from Vol.1 + usage guide)
const freePackReadme = `═══════════════════════════════════════════
  ColorArchive — Free Palette Pack
═══════════════════════════════════════════

QUICK START
───────────
1. Open palette-pack-vol-1-preview.css — copy the :root { ... } block into your stylesheet
2. For Tailwind: paste colorarchive-tailwind-tokens.css into your @theme block
3. For Figma/Sketch: import palette-pack-vol-1-preview.json as a color token set

FILE GUIDE
──────────
palette-pack-vol-1-preview.css     — CSS custom properties for 3 sample collections
palette-pack-vol-1-preview.json    — JSON data with hex, HSL, and color metadata
colorarchive-tailwind-tokens.css   — Tailwind CSS v4 theme tokens
README-free-pack.txt               — This file

PALETTES INCLUDED
─────────────────
Quiet Luxury
  Soft neutrals and muted warm surfaces for editorial, beauty, and premium product work.
  Suggested use: Editorial landing pages, beauty products, luxury product UI

Modern Seaside
  Clear coastal blues and seafoam accents with enough structure for UI and brand systems.
  Suggested use: Travel tools, wellness brands, dashboard refreshes

Editorial Warmth
  Paper-like warm colors for publishing, writing, storytelling, and thoughtful landing pages.
  Suggested use: Publishing sites, blogs, narrative landing pages

COLOR NUMBERING
───────────────
Each palette has 5 colors numbered 1-5:
  1 = Primary surface / background
  2 = Secondary panel / card
  3 = Supporting neutral / text
  4 = Accent / call-to-action
  5 = Contrast / deep accent

UPGRADE
───────
This is a free sample. For the full system with SVG boards, gradient
wallpapers, brand guides, AI prompts, and multi-platform tokens, visit:
/packs

NEED HELP?
──────────

/packs

© ColorArchive · 
`;
writeFileSync(join(OUT_DIR, "README-free-pack.txt"), freePackReadme, "utf8");
createZip("free-palette-pack.zip", [
  "palette-pack-vol-1-preview.css",
  "palette-pack-vol-1-preview.json",
  "colorarchive-tailwind-tokens.css",
  "README-free-pack.txt",
]);

// Palette Pack Vol. 1 ZIP (full)
const vol1Readme = `═══════════════════════════════════════════
  ColorArchive — Palette Pack Vol. 1
═══════════════════════════════════════════

QUICK START
───────────
1. Open colorarchive-all-collections.css — copy the :root { ... } block into your stylesheet
2. For Tailwind: paste colorarchive-tailwind-tokens.css into your @theme block
3. For Figma/Sketch: import colorarchive-all-collections.json as a color token set
4. Browse the SVG palette boards for a visual overview of each collection

FILE GUIDE
──────────
colorarchive-all-collections.css          — CSS custom properties for all collections
colorarchive-all-collections.json         — JSON data with hex, HSL, and color metadata
colorarchive-tailwind-tokens.css          — Tailwind CSS v4 theme tokens
{collection}-palette-board.svg            — Visual color swatch board (per collection)
{collection}-gradient-wallpaper.svg       — Horizontal gradient wallpaper (per collection)
{collection}-gradient-wallpaper-diagonal.svg — Diagonal gradient wallpaper (per collection)
{collection}-swiftui.swift                — SwiftUI Color extension (per collection)
{collection}-colors.xml                   — Android colors.xml resource (per collection)
{collection}-colors.dart                  — Flutter Dart color constants (per collection)
{collection}-theme.js                     — CSS-in-JS theme object (per collection)
README-palette-pack-vol-1.txt             — This file

PALETTES INCLUDED
─────────────────
Quiet Luxury
  Soft neutrals and muted warm surfaces for editorial, beauty, and premium product work.
  Suggested use: Editorial landing pages, beauty products, luxury product UI

Modern Seaside
  Clear coastal blues and seafoam accents with enough structure for UI and brand systems.
  Suggested use: Travel tools, wellness brands, dashboard refreshes

Editorial Warmth
  Paper-like warm colors for publishing, writing, storytelling, and thoughtful landing pages.
  Suggested use: Publishing sites, blogs, narrative landing pages

Forest Terrain
  Deep greens, moss, earthy browns, and stone for outdoor, editorial, and natural brand work.
  Suggested use: Outdoor brands, environmental campaigns, editorial layout

COLOR NUMBERING
───────────────
Each palette has 5 colors numbered 1-5:
  1 = Primary surface / background
  2 = Secondary panel / card
  3 = Supporting neutral / text
  4 = Accent / call-to-action
  5 = Contrast / deep accent

NEED HELP?
──────────

/packs

© ColorArchive · 
`;
writeFileSync(join(OUT_DIR, "README-palette-pack-vol-1.txt"), vol1Readme, "utf8");
const vol1CollIds = ["quiet-luxury", "modern-seaside", "editorial-warmth", "forest-terrain"];
createZip("palette-pack-vol-1.zip", [
  "colorarchive-all-collections.css",
  "colorarchive-all-collections.json",
  "colorarchive-tailwind-tokens.css",
  ...vol1CollIds.flatMap((id) => [
    `${id}-palette-board.svg`, `${id}-gradient-wallpaper.svg`, `${id}-gradient-wallpaper-diagonal.svg`,
    `${id}-swiftui.swift`, `${id}-colors.xml`, `${id}-colors.dart`, `${id}-theme.js`,
  ]),
  "README-palette-pack-vol-1.txt",
]);

// Brand Color Starter Kit ZIP
const brandReadme = `═══════════════════════════════════════════
  ColorArchive — Brand Color Starter Kit
═══════════════════════════════════════════

QUICK START
───────────
1. Open colorarchive-all-collections.css — copy the :root { ... } block into your stylesheet
2. For Tailwind: paste colorarchive-tailwind-tokens.css into your @theme block
3. For Figma/Sketch: import colorarchive-all-collections.json as a color token set
4. Read the brand-guide.md files for application guidance per collection

FILE GUIDE
──────────
colorarchive-all-collections.css          — CSS custom properties for all collections
colorarchive-all-collections.json         — JSON data with hex, HSL, and color metadata
colorarchive-tailwind-tokens.css          — Tailwind CSS v4 theme tokens
brand-starter-kit-preview.txt             — Plain-text color preview with hex values
{collection}-brand-guide.md               — Brand usage guide (per collection)
{collection}-color-psychology.md          — Color psychology notes (per collection)
{collection}-swiftui.swift                — SwiftUI Color extension (per collection)
{collection}-colors.xml                   — Android colors.xml resource (per collection)
{collection}-colors.dart                  — Flutter Dart color constants (per collection)
{collection}-theme.js                     — CSS-in-JS theme object (per collection)
README-brand-starter-kit.txt              — This file

PALETTES INCLUDED
─────────────────
Quiet Luxury
  Soft neutrals and muted warm surfaces for editorial, beauty, and premium product work.
  Suggested use: Premium brand surfaces, editorial landing pages, luxury product UI

Nocturne Tech
  Dark-spectrum product colors with enough neon contrast to feel modern, not generic.
  Suggested use: AI tools, music products, dark-mode launches

Orchid Bloom
  Blooming pinks and violets with a soft green counterpoint for beauty, culture, and campaign work.
  Suggested use: Campaign art direction, beauty brands, social launches

COLOR NUMBERING
───────────────
Each palette has 5 colors numbered 1-5:
  1 = Primary surface / background
  2 = Secondary panel / card
  3 = Supporting neutral / text
  4 = Accent / call-to-action
  5 = Contrast / deep accent

NEED HELP?
──────────

/packs

© ColorArchive · 
`;
writeFileSync(join(OUT_DIR, "README-brand-starter-kit.txt"), brandReadme, "utf8");
const brandCollIds = ["quiet-luxury", "nocturne-tech", "orchid-bloom"];
createZip("brand-starter-kit.zip", [
  "brand-starter-kit-preview.txt",
  "colorarchive-all-collections.css",
  "colorarchive-all-collections.json",
  "colorarchive-tailwind-tokens.css",
  ...brandCollIds.flatMap((id) => [
    `${id}-brand-guide.md`, `${id}-color-psychology.md`,
    `${id}-swiftui.swift`, `${id}-colors.xml`, `${id}-colors.dart`, `${id}-theme.js`,
  ]),
  "README-brand-starter-kit.txt",
]);

// Creator Bundle ZIP
const creatorReadme = `═══════════════════════════════════════════
  ColorArchive — Content Creator Bundle
═══════════════════════════════════════════

QUICK START
───────────
1. Open colorarchive-all-collections.css — copy the :root { ... } block into your stylesheet
2. For Tailwind: paste colorarchive-tailwind-tokens.css into your @theme block
3. For Figma/Sketch: import colorarchive-all-collections.json as a color token set
4. Read the ai-prompts.md files for AI-ready color descriptions

FILE GUIDE
──────────
colorarchive-all-collections.css          — CSS custom properties for all collections
colorarchive-all-collections.json         — JSON data with hex, HSL, and color metadata
colorarchive-tailwind-tokens.css          — Tailwind CSS v4 theme tokens
content-creator-bundle-preview.txt        — Plain-text color preview with hex values
{collection}-palette-board.svg            — Visual color swatch board (per collection)
{collection}-gradient-wallpaper.svg       — Horizontal gradient wallpaper (per collection)
{collection}-gradient-wallpaper-diagonal.svg — Diagonal gradient wallpaper (per collection)
{collection}-ai-prompts.md               — AI prompt templates with color descriptions (per collection)
{collection}-color-psychology.md          — Color psychology notes (per collection)
{collection}-brand-guide.md              — Brand usage guide (per collection)
README-creator-bundle.txt                — This file

PALETTES INCLUDED
─────────────────
Modern Seaside
  Clear coastal blues and seafoam accents with enough structure for UI and brand systems.
  Suggested use: Travel tools, wellness brands, lifestyle content

Orchid Bloom
  Blooming pinks and violets with a soft green counterpoint for beauty, culture, and campaign work.
  Suggested use: Beauty campaigns, culture pieces, social launches

Candy Pop
  Coral, lemon, mint, lavender, and sky — saturated accents for social, D2C, and campaign work.
  Suggested use: Social media graphics, D2C brands, campaign pages

COLOR NUMBERING
───────────────
Each palette has 5 colors numbered 1-5:
  1 = Primary surface / background
  2 = Secondary panel / card
  3 = Supporting neutral / text
  4 = Accent / call-to-action
  5 = Contrast / deep accent

NEED HELP?
──────────

/packs

© ColorArchive · 
`;
writeFileSync(join(OUT_DIR, "README-creator-bundle.txt"), creatorReadme, "utf8");
const creatorCollIds = ["modern-seaside", "orchid-bloom", "candy-pop"];
createZip("content-creator-bundle.zip", [
  "content-creator-bundle-preview.txt",
  "colorarchive-all-collections.css",
  "colorarchive-all-collections.json",
  "colorarchive-tailwind-tokens.css",
  ...creatorCollIds.flatMap((id) => [
    `${id}-palette-board.svg`, `${id}-gradient-wallpaper.svg`, `${id}-gradient-wallpaper-diagonal.svg`,
    `${id}-ai-prompts.md`, `${id}-color-psychology.md`, `${id}-brand-guide.md`,
  ]),
  "README-creator-bundle.txt",
]);

// --- Complete Archive Token Set ---
// Generate comprehensive SCSS maps for the full archive
function generateScss() {
  const families = {};
  for (const { name: hueName, hue } of HUE_CATALOG) {
    const familyKey = hueName.toLowerCase();
    families[familyKey] = [];
    for (const { name: lName, l } of LIGHTNESS_CATALOG) {
      for (const { name: cName, s } of CHROMA_CATALOG) {
        const id = createId(`${hueName} ${lName} ${cName}`);
        const hex = hslToHex(hue, s, l);
        families[familyKey].push({ id, hex });
      }
    }
  }
  const lines = ["// ColorArchive — Complete SCSS Color Maps", "// Auto-generated — do not edit", ""];
  for (const [family, colors] of Object.entries(families)) {
    lines.push(`$ca-${family}: (`);
    for (const c of colors) {
      lines.push(`  "${c.id}": ${c.hex},`);
    }
    lines.push(");\n");
  }
  return lines.join("\n");
}

// Generate full archive CSS with ALL 2016 colors
function generateFullArchiveCss() {
  const lines = [":root {", "  /* ColorArchive — All 2016 Colors */"];
  for (const { name: hueName, hue } of HUE_CATALOG) {
    lines.push(`\n  /* ${hueName} */`);
    for (const { name: lName, l } of LIGHTNESS_CATALOG) {
      for (const { name: cName, s } of CHROMA_CATALOG) {
        const id = createId(`${hueName} ${lName} ${cName}`);
        const hex = hslToHex(hue, s, l);
        lines.push(`  --ca-${id}: ${hex};`);
      }
    }
  }
  lines.push("}");
  return lines.join("\n");
}

// Generate full archive Tailwind tokens
function generateFullArchiveTailwind() {
  const lines = ["/* Tailwind CSS v4 — Complete Archive Theme Tokens */", "@theme {"];
  for (const { name: hueName, hue } of HUE_CATALOG) {
    lines.push(`\n  /* ${hueName} */`);
    for (const { name: lName, l } of LIGHTNESS_CATALOG) {
      for (const { name: cName, s } of CHROMA_CATALOG) {
        const id = createId(`${hueName} ${lName} ${cName}`);
        const hex = hslToHex(hue, s, l);
        lines.push(`  --color-${id}: ${hex};`);
      }
    }
  }
  lines.push("}");
  return lines.join("\n");
}

// Generate full archive JSON
function generateFullArchiveJson() {
  const data = [];
  for (const { name: hueName, hue } of HUE_CATALOG) {
    for (const { name: lName, l } of LIGHTNESS_CATALOG) {
      for (const { name: cName, s } of CHROMA_CATALOG) {
        const colorName = `${hueName} ${lName} ${cName}`;
        const id = createId(colorName);
        const hex = hslToHex(hue, s, l);
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        data.push({ id, name: colorName, hex, hsl: `hsl(${hue}, ${s}%, ${l}%)`, rgb: `rgb(${r}, ${g}, ${b})`, hue, saturation: s, lightness: l });
      }
    }
  }
  return JSON.stringify(data, null, 2);
}

writeFileSync(join(OUT_DIR, "complete-archive-all-colors.css"), generateFullArchiveCss(), "utf8");
writeFileSync(join(OUT_DIR, "complete-archive-tailwind-tokens.css"), generateFullArchiveTailwind(), "utf8");
writeFileSync(join(OUT_DIR, "complete-archive-all-colors.json"), generateFullArchiveJson(), "utf8");
writeFileSync(join(OUT_DIR, "complete-archive-scss-maps.scss"), generateScss(), "utf8");

const completeArchiveReadme = `═══════════════════════════════════════════
  ColorArchive — Complete Archive Token Set
═══════════════════════════════════════════

QUICK START
───────────
1. Open complete-archive-all-colors.css — copy the :root { ... } block into your stylesheet
2. For Tailwind: paste complete-archive-tailwind-tokens.css into your @theme block
3. For Figma/Sketch: import complete-archive-figma-tokens.json as a color token set
4. For SCSS: @use complete-archive-scss-maps.scss and access colors via map-get()

FILE GUIDE
──────────
complete-archive-all-colors.css           — CSS custom properties for all 2016 colors
complete-archive-tailwind-tokens.css      — Tailwind CSS v4 theme tokens (all colors)
complete-archive-all-colors.json          — JSON data with hex, HSL, RGB for all colors
complete-archive-scss-maps.scss           — SCSS color maps organized by hue family
complete-archive.gpl                      — GIMP palette file
complete-archive-sketchpalette.json       — Sketch palette JSON
complete-archive.ase                      — Adobe Swatch Exchange file
complete-archive.aco                      — Adobe Color / Photoshop ACO file
complete-archive-framer-tokens.css        — Framer design tokens CSS
complete-archive-figma-tokens.json        — Figma / Tokens Studio JSON (nested by family)
complete-archive-style-dictionary.json    — Style Dictionary token format
complete-archive-swiftui.swift            — SwiftUI Color extension (all colors)
complete-archive-colors.xml               — Android colors.xml resource (all colors)
complete-archive-colors.dart              — Flutter Dart color constants (all colors)
complete-archive-theme.js                 — CSS-in-JS theme object (all colors)
{collection}-contrast-matrix.json         — WCAG contrast ratio matrix (per collection)
{collection}-contrast-report.md           — AA/AAA compliance report (per collection)
README-complete-archive.txt               — This file

PALETTES INCLUDED
─────────────────
All ${COLLECTIONS.length} curated collections plus the full 2016-color library
organized by hue family, lightness band, and chroma level.

COLOR NUMBERING
───────────────
Each palette has 5 colors numbered 1-5:
  1 = Primary surface / background
  2 = Secondary panel / card
  3 = Supporting neutral / text
  4 = Accent / call-to-action
  5 = Contrast / deep accent

Individual colors follow the pattern: {hue}-{lightness}-{chroma}
  36 hues x 14 lightness levels x 4 chroma bands = 2016 colors

NEED HELP?
──────────

/packs

© ColorArchive · 
`;
writeFileSync(join(OUT_DIR, "README-complete-archive.txt"), completeArchiveReadme, "utf8");
createZip("complete-archive.zip", [
  "complete-archive-all-colors.css",
  "complete-archive-tailwind-tokens.css",
  "complete-archive-all-colors.json",
  "complete-archive-scss-maps.scss",
  "complete-archive.gpl",
  "complete-archive-sketchpalette.json",
  "complete-archive.ase",
  "complete-archive.aco",
  "complete-archive-framer-tokens.css",
  "complete-archive-figma-tokens.json",
  "complete-archive-style-dictionary.json",
  "complete-archive-swiftui.swift",
  "complete-archive-colors.xml",
  "complete-archive-colors.dart",
  "complete-archive-theme.js",
  ...COLLECTIONS.map((c) => `${c.id}-contrast-matrix.json`),
  ...COLLECTIONS.map((c) => `${c.id}-contrast-report.md`),
  "README-complete-archive.txt",
]);

// --- Dark Mode UI Kit ---
// Generate paired light/dark token files
function generateDarkModeCss() {
  const lines = ["/* ColorArchive — Dark Mode UI Kit */", "/* Light theme (default) */", ":root, [data-theme='light'] {"];
  for (const col of COLLECTIONS) {
    const palette = resolvePalette(col.paletteIds);
    lines.push(`\n  /* ${col.title} */`);
    palette.forEach((c, i) => {
      lines.push(`  --${col.id}-${i + 1}: ${c.hex}; /* ${c.name} */`);
    });
  }
  lines.push("}\n");
  lines.push("/* Dark theme — inverted lightness mapping */");
  lines.push("[data-theme='dark'] {");
  for (const col of COLLECTIONS) {
    const palette = resolvePalette(col.paletteIds);
    lines.push(`\n  /* ${col.title} (dark) */`);
    palette.forEach((c, i) => {
      // Invert lightness for dark mode
      const darkL = 100 - c.lightness;
      const darkHex = hslToHex(c.hue, c.saturation, darkL);
      lines.push(`  --${col.id}-${i + 1}: ${darkHex}; /* ${c.name} (dark) */`);
    });
  }
  lines.push("}");
  return lines.join("\n");
}

function generateDarkModeTailwind() {
  const lines = ["/* Tailwind CSS v4 — Dark Mode Token Pairs */", "@theme {"];
  for (const col of COLLECTIONS) {
    const palette = resolvePalette(col.paletteIds);
    lines.push(`\n  /* ${col.title} — light */`);
    palette.forEach((c, i) => {
      lines.push(`  --color-${col.id}-${i + 1}: ${c.hex};`);
    });
    lines.push(`  /* ${col.title} — dark */`);
    palette.forEach((c, i) => {
      const darkL = 100 - c.lightness;
      const darkHex = hslToHex(c.hue, c.saturation, darkL);
      lines.push(`  --color-${col.id}-dark-${i + 1}: ${darkHex};`);
    });
  }
  lines.push("}");
  return lines.join("\n");
}

function generateDarkModeJson() {
  const data = COLLECTIONS.map((col) => {
    const palette = resolvePalette(col.paletteIds);
    return {
      id: col.id,
      title: col.title,
      pairs: palette.map((c, i) => {
        const darkL = 100 - c.lightness;
        const darkHex = hslToHex(c.hue, c.saturation, darkL);
        return {
          slot: i + 1,
          name: c.name,
          light: { hex: c.hex, hsl: c.hsl },
          dark: { hex: darkHex, hsl: `hsl(${c.hue}, ${c.saturation}%, ${darkL}%)` },
        };
      }),
    };
  });
  return JSON.stringify(data, null, 2);
}

writeFileSync(join(OUT_DIR, "dark-mode-ui-kit-paired.css"), generateDarkModeCss(), "utf8");
writeFileSync(join(OUT_DIR, "dark-mode-ui-kit-tailwind.css"), generateDarkModeTailwind(), "utf8");
writeFileSync(join(OUT_DIR, "dark-mode-ui-kit-paired.json"), generateDarkModeJson(), "utf8");

const darkModeReadme = `═══════════════════════════════════════════
  ColorArchive — Dark Mode UI Kit
═══════════════════════════════════════════

QUICK START
───────────
1. Open dark-mode-ui-kit-paired.css — copy the :root { ... } block and [data-theme='dark'] block into your stylesheet
2. For Tailwind: paste dark-mode-ui-kit-tailwind.css into your @theme block
3. For Figma/Sketch: import dark-mode-ui-kit-paired.json as a color token set
4. Read the contrast-report.md files for WCAG compliance guidance

FILE GUIDE
──────────
dark-mode-ui-kit-paired.css               — CSS custom properties with light/dark theme switching
dark-mode-ui-kit-tailwind.css             — Tailwind CSS v4 dark mode token pairs
dark-mode-ui-kit-paired.json              — JSON with light/dark hex and HSL value pairs
{collection}-contrast-matrix.json         — WCAG contrast ratio matrix (per collection)
{collection}-contrast-report.md           — AA/AAA compliance report (per collection)
README-dark-mode-ui-kit.txt               — This file

PALETTES INCLUDED
─────────────────
Nocturne Tech
  Dark-spectrum product colors with enough neon contrast to feel modern, not generic.
  Suggested use: AI tools, music products, dark-mode launches

Nordic Frost
  Ice blue, pale grey, and soft lavender for minimal UI, SaaS products, and clean landing pages.
  Suggested use: SaaS UI, tech landing pages, minimal dashboards

Monochrome Studio
  Pure grayscale with micro-warm and micro-cool shifts for editorial, typography, and minimal UI.
  Suggested use: Typography layouts, minimal UI systems, editorial design

COLOR NUMBERING
───────────────
Each palette has 5 colors numbered 1-5:
  1 = Primary surface / background
  2 = Secondary panel / card
  3 = Supporting neutral / text
  4 = Accent / call-to-action
  5 = Contrast / deep accent

Dark values are generated by inverting lightness while preserving
hue and saturation, giving you perceptually consistent pairs.
Light mode: use variables as-is (default)
Dark mode: add data-theme="dark" to your <html> element

NEED HELP?
──────────

/packs

© ColorArchive · 
`;
writeFileSync(join(OUT_DIR, "README-dark-mode-ui-kit.txt"), darkModeReadme, "utf8");
const darkModeCollIds = ["nocturne-tech", "nordic-frost", "monochrome-studio"];
createZip("dark-mode-ui-kit.zip", [
  "dark-mode-ui-kit-paired.css",
  "dark-mode-ui-kit-tailwind.css",
  "dark-mode-ui-kit-paired.json",
  ...darkModeCollIds.flatMap((id) => [`${id}-contrast-matrix.json`, `${id}-contrast-report.md`]),
  "README-dark-mode-ui-kit.txt",
]);

// --- Seasonal: Spring 2026 ---
const springCollectionIds = ["orchid-bloom", "matcha-linen", "sunset-boulevard"];
const springCols = springCollectionIds.map((id) => COLLECTIONS.find((c) => c.id === id)).filter(Boolean);

const springMoodNotes = `ColorArchive — Seasonal: Spring 2026

MOOD BOARD NOTES

THEME: Fresh Renewal
The Spring 2026 palette draws from floral warmth, matcha greens,
and golden-hour light. Designed for projects that need to feel
alive, optimistic, and grounded in nature.

PALETTES INCLUDED

Orchid Bloom
  Blooming pinks and violets with soft green counterpoint.
  Use for beauty campaigns, culture pieces, and social launches.

Matcha & Linen
  Soft matcha greens with warm paper and linen tones.
  Use for wellness, tea brands, and artisan product pages.

Sunset Boulevard
  Warm coral-to-rose gradient with amber highlights.
  Use for travel, lifestyle content, and editorial hero sections.

APPLICATION GUIDANCE
- Pair Orchid Bloom accents with Matcha & Linen backgrounds for spring beauty work
- Use Sunset Boulevard as a warm hero palette with Matcha & Linen as supporting neutrals
- All three collections work together for a comprehensive spring campaign system

— ColorArchive · 
`;

writeFileSync(join(OUT_DIR, "seasonal-spring-2026-mood-notes.txt"), springMoodNotes, "utf8");
writeFileSync(join(OUT_DIR, "seasonal-spring-2026-tokens.css"), generateCss(springCols), "utf8");
writeFileSync(join(OUT_DIR, "seasonal-spring-2026-tailwind.css"), generateTailwindSnippet(springCols), "utf8");
writeFileSync(join(OUT_DIR, "seasonal-spring-2026-data.json"), generateJson(springCols), "utf8");

const springReadme = `═══════════════════════════════════════════
  ColorArchive — Seasonal: Spring 2026
═══════════════════════════════════════════

QUICK START
───────────
1. Open seasonal-spring-2026-tokens.css — copy the :root { ... } block into your stylesheet
2. For Tailwind: paste seasonal-spring-2026-tailwind.css into your @theme block
3. For Figma/Sketch: import seasonal-spring-2026-data.json as a color token set
4. Read seasonal-spring-2026-mood-notes.txt for usage guidance

FILE GUIDE
──────────
seasonal-spring-2026-tokens.css           — CSS custom properties for spring collections
seasonal-spring-2026-tailwind.css         — Tailwind CSS v4 theme tokens
seasonal-spring-2026-data.json            — JSON data with hex, HSL, and color metadata
seasonal-spring-2026-mood-notes.txt       — Mood board notes and application guidance
README-seasonal-spring-2026.txt           — This file

PALETTES INCLUDED
─────────────────
Orchid Bloom
  Blooming pinks and violets with a soft green counterpoint for beauty, culture, and campaign work.
  Suggested use: Beauty campaigns, culture pieces, social launches

Matcha & Linen
  Soft matcha greens with warm paper and linen tones for wellness, tea, and artisan brands.
  Suggested use: Wellness brands, tea and food packaging, artisan product pages

Sunset Boulevard
  Warm coral-to-rose gradient with amber highlights for travel, lifestyle, and editorial work.
  Suggested use: Travel campaigns, lifestyle brands, editorial hero sections

COLOR NUMBERING
───────────────
Each palette has 5 colors numbered 1-5:
  1 = Primary surface / background
  2 = Secondary panel / card
  3 = Supporting neutral / text
  4 = Accent / call-to-action
  5 = Contrast / deep accent

NEED HELP?
──────────

/packs

© ColorArchive · 
`;
writeFileSync(join(OUT_DIR, "README-seasonal-spring-2026.txt"), springReadme, "utf8");
createZip("seasonal-spring-2026.zip", [
  "seasonal-spring-2026-tokens.css",
  "seasonal-spring-2026-tailwind.css",
  "seasonal-spring-2026-data.json",
  "seasonal-spring-2026-mood-notes.txt",
  "README-seasonal-spring-2026.txt",
]);
