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
  {
    id: "sunset-boulevard", title: "Sunset Boulevard",
    summary: "Warm oranges, pink-golds, and sunset gradient tones for lifestyle, travel, and campaign work.",
    tags: ["Warm", "Lifestyle", "Campaign"],
    paletteIds: ["coral-bloom-clear", "amber-silk-clear", "ruby-radiant-soft", "rose-pearl-soft", "garnet-tone-clear"],
  },
  {
    id: "monochrome-studio", title: "Monochrome Studio",
    summary: "Pure grayscale with micro-warm and micro-cool shifts for editorial, typography, and minimal UI.",
    tags: ["Minimal", "Editorial", "Monochrome"],
    paletteIds: ["honey-whisper-muted", "azure-mist-muted", "olive-silk-muted", "cobalt-dusk-muted", "merlot-ink-muted"],
  },
  {
    id: "neon-after-dark", title: "Neon After Dark",
    summary: "Cyber neon colors on deep dark bases for gaming, nightlife, and bold tech products.",
    tags: ["Neon", "Dark", "Gaming"],
    paletteIds: ["fuchsia-radiant-vivid", "aqua-bloom-vivid", "lime-bloom-clear", "violet-nocturne-clear", "cobalt-ink-soft"],
  },
  {
    id: "matcha-linen", title: "Matcha & Linen",
    summary: "Japanese-inspired matcha greens with warm linen and paper whites for wellness, tea, and artisan brands.",
    tags: ["Japanese", "Wellness", "Organic"],
    paletteIds: ["moss-silk-soft", "leaf-bloom-muted", "olive-pearl-muted", "apricot-veil-muted", "honey-whisper-soft"],
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
  <text x="123" y="457" fill="white" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700">colorarchive.me</text>
  ${swatchRects}
</svg>`;
}

// Write outputs
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(join(OG_DIR, "packs"), { recursive: true });
mkdirSync(join(OG_DIR, "collections"), { recursive: true });
mkdirSync(join(OG_DIR, "families"), { recursive: true });
mkdirSync(join(OG_DIR, "colors"), { recursive: true });

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
  JSON.stringify(buildFigmaTokens(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(join(OUT_DIR, "colorarchive.gpl"), buildGplPalette(ALL_ARCHIVE_COLORS, "ColorArchive Full Library"), "utf8");
writeFileSync(
  join(OUT_DIR, "colorarchive-sketchpalette.json"),
  JSON.stringify(buildSketchpalette(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(join(OUT_DIR, "colorarchive.ase"), buildAsePalette(ALL_ARCHIVE_COLORS));

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
  JSON.stringify(buildFigmaTokens(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(join(OUT_DIR, "complete-archive.gpl"), buildGplPalette(ALL_ARCHIVE_COLORS, "Complete Archive Token Set"), "utf8");
writeFileSync(
  join(OUT_DIR, "complete-archive-sketchpalette.json"),
  JSON.stringify(buildSketchpalette(ALL_ARCHIVE_COLORS), null, 2),
  "utf8",
);
writeFileSync(join(OUT_DIR, "complete-archive.ase"), buildAsePalette(ALL_ARCHIVE_COLORS));

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
console.log(`✓ Generated Figma + Style Dictionary token exports`);

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

// Free palette pack ZIP (preview files from Vol.1 + usage guide)
const freePackReadme = `ColorArchive — Free Palette Pack

Thank you for downloading the free sample pack.

WHAT'S INCLUDED
- CSS variables for 3 curated collections (Quiet Luxury, Modern Seaside, Editorial Warmth)
- JSON data export with hex, HSL, and color metadata
- Tailwind CSS 4 theme tokens

HOW TO USE
1. Copy the CSS variables from the .css file into your project
2. Use the JSON data for programmatic access or design tool import
3. For Tailwind, paste the @theme block from the tokens file

UPGRADE TO THE FULL PACK
Visit https://colorarchive.me/packs for the complete palette system
with more collections, usage guides, and structured token exports.

— ColorArchive · https://colorarchive.me
`;
writeFileSync(join(OUT_DIR, "README-free-pack.txt"), freePackReadme, "utf8");
createZip("free-palette-pack.zip", [
  "palette-pack-vol-1-preview.css",
  "palette-pack-vol-1-preview.json",
  "colorarchive-tailwind-tokens.css",
  "README-free-pack.txt",
]);

// Palette Pack Vol. 1 ZIP (full)
const vol1Readme = `ColorArchive — Palette Pack Vol. 1

INCLUDED COLLECTIONS
- Quiet Luxury: Soft neutrals and muted warm surfaces
- Modern Seaside: Clear coastal blues and seafoam accents
- Editorial Warmth: Paper-like warm colors for publishing
- Forest Terrain: Deep greens, moss, and earthy browns

FORMATS
- CSS variables (copy into any project)
- JSON data (for design tools and automation)
- Tailwind CSS 4 theme tokens
- Full archive export (all 8 collections)

USAGE
Each collection has 5 curated colors numbered -1 through -5:
  -1 = Primary surface     -4 = Accent / CTA
  -2 = Secondary panel     -5 = Deep contrast
  -3 = Supporting neutral

— ColorArchive · https://colorarchive.me
`;
writeFileSync(join(OUT_DIR, "README-palette-pack-vol-1.txt"), vol1Readme, "utf8");
createZip("palette-pack-vol-1.zip", [
  "palette-pack-vol-1-preview.css",
  "palette-pack-vol-1-preview.json",
  "colorarchive-all-collections.css",
  "colorarchive-all-collections.json",
  "colorarchive-tailwind-tokens.css",
  "README-palette-pack-vol-1.txt",
]);

// Brand Color Starter Kit ZIP
const brandReadme = `ColorArchive — Brand Color Starter Kit

INCLUDED COLLECTIONS
- Quiet Luxury: Premium brand surfaces
- Nocturne Tech: Dark-spectrum product colors
- Orchid Bloom: Expressive pinks and violets

FORMATS
- CSS variables with brand-role annotations
- JSON data export
- Tailwind CSS 4 theme tokens
- Full archive export (all 8 collections)
- Usage notes with application guidance

BRAND APPLICATION
  -1 = Primary (backgrounds, hero surfaces)
  -2 = Secondary (UI panels, borders)
  -3 = Tertiary (supporting neutrals)
  -4 = Accent (buttons, CTAs, highlights)
  -5 = Deep base (text, strong contrast)

— ColorArchive · https://colorarchive.me
`;
writeFileSync(join(OUT_DIR, "README-brand-starter-kit.txt"), brandReadme, "utf8");
createZip("brand-starter-kit.zip", [
  "brand-starter-kit-preview.css",
  "brand-starter-kit-preview.json",
  "brand-starter-kit-preview.txt",
  "colorarchive-all-collections.css",
  "colorarchive-all-collections.json",
  "colorarchive-tailwind-tokens.css",
  "README-brand-starter-kit.txt",
]);

// Creator Bundle ZIP
const creatorReadme = `ColorArchive — Creator Bundle

INCLUDED COLLECTIONS
- Modern Seaside: Fresh coastal tones for lifestyle content
- Orchid Bloom: Vibrant pinks and violets for beauty and culture
- Candy Pop: Saturated accents for social and D2C

FORMATS
- CSS variables
- JSON data export
- Tailwind CSS 4 theme tokens
- Full archive export (all 8 collections)
- Prompt-friendly color descriptions

USE CASES
- Social media graphics and story cards
- Background and wallpaper color sets
- AI prompt color descriptions
- Brand-consistent content palettes

— ColorArchive · https://colorarchive.me
`;
writeFileSync(join(OUT_DIR, "README-creator-bundle.txt"), creatorReadme, "utf8");
createZip("content-creator-bundle.zip", [
  "content-creator-bundle-preview.css",
  "content-creator-bundle-preview.json",
  "content-creator-bundle-preview.txt",
  "colorarchive-all-collections.css",
  "colorarchive-all-collections.json",
  "colorarchive-tailwind-tokens.css",
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

const completeArchiveReadme = `ColorArchive — Complete Archive Token Set

ALL 2016 COLORS IN MULTIPLE FORMATS

FORMATS INCLUDED
- CSS variables (complete-archive-all-colors.css)
- Tailwind CSS 4 theme tokens (complete-archive-tailwind-tokens.css)
- Structured JSON with hex, HSL, RGB (complete-archive-all-colors.json)
- SCSS color maps by hue family (complete-archive-scss-maps.scss)
- GIMP palette (complete-archive.gpl)
- Sketch palette JSON (complete-archive-sketchpalette.json)
- Adobe Swatch Exchange (complete-archive.ase)

COLOR NAMING
Each color follows the pattern: {hue}-{lightness}-{chroma}
  36 hues x 14 lightness levels x 4 chroma bands = 2016 colors

USAGE
- CSS: copy variables into your :root {} block
- Tailwind: paste the @theme block into your config
- JSON: import for programmatic access or design tool integration
- SCSS: @use the maps and access colors via map-get()

— ColorArchive · https://colorarchive.me
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
  "complete-archive-preview.css",
  "complete-archive-preview.json",
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

const darkModeReadme = `ColorArchive — Dark Mode UI Kit

PAIRED LIGHT/DARK TOKEN SETS

FORMATS INCLUDED
- Paired CSS variables with data-theme switching (dark-mode-ui-kit-paired.css)
- Tailwind CSS 4 dark mode tokens (dark-mode-ui-kit-tailwind.css)
- JSON with light/dark value pairs (dark-mode-ui-kit-paired.json)

HOW IT WORKS
Light mode: use variables as-is (default)
Dark mode: add data-theme="dark" to your <html> element

The dark values are generated by inverting lightness while preserving
hue and saturation, giving you perceptually consistent pairs.

TAILWIND USAGE
Use --color-{collection}-{slot} for light and
--color-{collection}-dark-{slot} for dark mode values.

— ColorArchive · https://colorarchive.me
`;
writeFileSync(join(OUT_DIR, "README-dark-mode-ui-kit.txt"), darkModeReadme, "utf8");
createZip("dark-mode-ui-kit.zip", [
  "dark-mode-ui-kit-paired.css",
  "dark-mode-ui-kit-tailwind.css",
  "dark-mode-ui-kit-paired.json",
  "dark-mode-ui-kit-preview.css",
  "dark-mode-ui-kit-preview.json",
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

— ColorArchive · https://colorarchive.me
`;

writeFileSync(join(OUT_DIR, "seasonal-spring-2026-mood-notes.txt"), springMoodNotes, "utf8");
writeFileSync(join(OUT_DIR, "seasonal-spring-2026-tokens.css"), generateCss(springCols), "utf8");
writeFileSync(join(OUT_DIR, "seasonal-spring-2026-tailwind.css"), generateTailwindSnippet(springCols), "utf8");
writeFileSync(join(OUT_DIR, "seasonal-spring-2026-data.json"), generateJson(springCols), "utf8");

const springReadme = `ColorArchive — Seasonal: Spring 2026

SPRING-CURATED PALETTES

COLLECTIONS
- Orchid Bloom: Blooming pinks and violets
- Matcha & Linen: Matcha greens with warm linen tones
- Sunset Boulevard: Warm sunset gradient colors

FORMATS
- CSS variables (seasonal-spring-2026-tokens.css)
- Tailwind CSS 4 theme tokens (seasonal-spring-2026-tailwind.css)
- JSON data (seasonal-spring-2026-data.json)
- Mood board notes (seasonal-spring-2026-mood-notes.txt)

— ColorArchive · https://colorarchive.me
`;
writeFileSync(join(OUT_DIR, "README-seasonal-spring-2026.txt"), springReadme, "utf8");
createZip("seasonal-spring-2026.zip", [
  "seasonal-spring-2026-tokens.css",
  "seasonal-spring-2026-tailwind.css",
  "seasonal-spring-2026-data.json",
  "seasonal-spring-2026-mood-notes.txt",
  "seasonal-spring-2026-preview.css",
  "seasonal-spring-2026-preview.json",
  "README-seasonal-spring-2026.txt",
]);
