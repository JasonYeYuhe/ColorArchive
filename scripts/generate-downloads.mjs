/**
 * generate-downloads.mjs
 * Generates download files in public/downloads/ from collection data.
 * Run via: node scripts/generate-downloads.mjs
 * Called automatically before npm run build via "prebuild" script.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "downloads");

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
    tags: ["Editorial", "Neutral", "Luxury"],
    paletteIds: ["blush-whisper-muted", "apricot-pearl-soft", "honey-bloom-muted", "olive-tone-muted", "merlot-ink-muted"],
  },
  {
    id: "modern-seaside", title: "Modern Seaside",
    summary: "Clear coastal blues and seafoam accents with enough structure for UI and brand systems.",
    tags: ["Coastal", "Fresh", "UI"],
    paletteIds: ["seafoam-whisper-soft", "lagoon-bloom-clear", "cerulean-silk-clear", "azure-core-vivid", "indigo-nocturne-soft"],
  },
  {
    id: "nocturne-tech", title: "Nocturne Tech",
    summary: "Dark-spectrum product colors with enough neon contrast to feel modern, not generic.",
    tags: ["Dark", "Tech", "Launch"],
    paletteIds: ["indigo-ink-muted", "violet-dusk-clear", "cobalt-core-vivid", "fuchsia-radiant-vivid", "aqua-bloom-soft"],
  },
  {
    id: "editorial-warmth", title: "Editorial Warmth",
    summary: "Paper-like warm colors for publishing, writing, storytelling, and thoughtful landing pages.",
    tags: ["Warm", "Publishing", "Storytelling"],
    paletteIds: ["apricot-whisper-soft", "amber-silk-soft", "citrine-tone-muted", "garnet-velvet-soft", "olive-dusk-muted"],
  },
  {
    id: "orchid-bloom", title: "Orchid Bloom",
    summary: "Blooming pinks and violets with a soft green counterpoint for beauty, culture, and campaign work.",
    tags: ["Campaign", "Beauty", "Expressive"],
    paletteIds: ["orchid-bloom-clear", "plum-radiant-clear", "peony-bloom-vivid", "rose-core-soft", "mint-whisper-muted"],
  },
  {
    id: "forest-terrain", title: "Forest Terrain",
    summary: "Deep greens, moss, earthy browns, and stone for outdoor, editorial, and natural brand work.",
    tags: ["Natural", "Organic", "Outdoor"],
    paletteIds: ["moss-tone-muted", "leaf-dusk-soft", "olive-silk-muted", "amber-velvet-soft", "honey-shadow-muted"],
  },
  {
    id: "nordic-frost", title: "Nordic Frost",
    summary: "Ice blue, pale grey, and soft lavender for minimal UI, SaaS products, and clean landing pages.",
    tags: ["Minimal", "Clean", "UI"],
    paletteIds: ["azure-mist-muted", "cerulean-whisper-soft", "sapphire-pearl-muted", "iris-veil-muted", "cobalt-bloom-soft"],
  },
  {
    id: "candy-pop", title: "Candy Pop",
    summary: "Coral, lemon, mint, lavender, and sky — saturated accents for social, D2C, and campaign work.",
    tags: ["Vibrant", "Playful", "Campaign"],
    paletteIds: ["coral-radiant-vivid", "citrine-tone-vivid", "mint-core-clear", "peony-core-vivid", "azure-bloom-clear"],
  },
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
  { id: "palette-pack-vol-1", collectionIds: ["quiet-luxury", "modern-seaside", "editorial-warmth"] },
  { id: "brand-starter-kit", collectionIds: ["quiet-luxury", "nocturne-tech", "orchid-bloom"] },
  { id: "content-creator-bundle", collectionIds: ["modern-seaside", "orchid-bloom"] },
];

function generatePackCss(collectionIds) {
  const cols = collectionIds.map((id) => COLLECTIONS.find((c) => c.id === id)).filter(Boolean);
  return generateCss(cols);
}

function generatePackJson(collectionIds) {
  const cols = collectionIds.map((id) => COLLECTIONS.find((c) => c.id === id)).filter(Boolean);
  return generateJson(cols);
}

// Write outputs
mkdirSync(OUT_DIR, { recursive: true });

// Full archive exports
writeFileSync(join(OUT_DIR, "colorarchive-all-collections.css"), generateCss(COLLECTIONS), "utf8");
writeFileSync(join(OUT_DIR, "colorarchive-all-collections.json"), generateJson(COLLECTIONS), "utf8");
writeFileSync(join(OUT_DIR, "colorarchive-tailwind-tokens.css"), generateTailwindSnippet(COLLECTIONS), "utf8");

// Pack preview files
for (const pack of PACK_PREVIEWS) {
  writeFileSync(join(OUT_DIR, `${pack.id}-preview.css`), generatePackCss(pack.collectionIds), "utf8");
  writeFileSync(join(OUT_DIR, `${pack.id}-preview.json`), generatePackJson(pack.collectionIds), "utf8");
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
