/**
 * Server-side color dataset — mirrors src/data/colors.ts
 * Generates 5,446 colors algorithmically (48 hues × 14 lightness × 8 chroma + 5 neutral groups × 14 lightness).
 */

const hueCatalog = [
  { hue: 0, root: "Crimson" }, { hue: 5, root: "Scarlet" }, { hue: 10, root: "Ruby" },
  { hue: 15, root: "Vermillion" }, { hue: 20, root: "Ember" }, { hue: 25, root: "Tangerine" },
  { hue: 30, root: "Coral" }, { hue: 40, root: "Apricot" }, { hue: 45, root: "Saffron" },
  { hue: 50, root: "Amber" }, { hue: 55, root: "Canary" }, { hue: 60, root: "Citrine" },
  { hue: 70, root: "Honey" }, { hue: 75, root: "Chartreuse" }, { hue: 80, root: "Olive" },
  { hue: 90, root: "Lime" }, { hue: 100, root: "Moss" }, { hue: 110, root: "Leaf" },
  { hue: 115, root: "Clover" }, { hue: 120, root: "Emerald" }, { hue: 130, root: "Mint" },
  { hue: 140, root: "Seafoam" }, { hue: 145, root: "Celadon" }, { hue: 150, root: "Jade" },
  { hue: 160, root: "Teal" }, { hue: 170, root: "Lagoon" }, { hue: 175, root: "Cyan" },
  { hue: 180, root: "Aqua" }, { hue: 190, root: "Cerulean" }, { hue: 200, root: "Azure" },
  { hue: 205, root: "Steel" }, { hue: 210, root: "Sapphire" }, { hue: 220, root: "Cobalt" },
  { hue: 230, root: "Indigo" }, { hue: 240, root: "Iris" }, { hue: 245, root: "Amethyst" },
  { hue: 250, root: "Violet" }, { hue: 260, root: "Orchid" }, { hue: 270, root: "Plum" },
  { hue: 280, root: "Mulberry" }, { hue: 290, root: "Magenta" }, { hue: 300, root: "Fuchsia" },
  { hue: 305, root: "Mauve" }, { hue: 310, root: "Peony" }, { hue: 320, root: "Rose" },
  { hue: 330, root: "Blush" }, { hue: 340, root: "Garnet" }, { hue: 350, root: "Merlot" },
];

const lightBands = [
  { label: "Veil", lightness: 98 }, { label: "Whisper", lightness: 94 },
  { label: "Mist", lightness: 90 }, { label: "Pearl", lightness: 84 },
  { label: "Bloom", lightness: 76 }, { label: "Silk", lightness: 68 },
  { label: "Tone", lightness: 60 }, { label: "Radiant", lightness: 54 },
  { label: "Core", lightness: 48 }, { label: "Velvet", lightness: 42 },
  { label: "Dusk", lightness: 34 }, { label: "Shadow", lightness: 28 },
  { label: "Nocturne", lightness: 20 }, { label: "Ink", lightness: 14 },
];

const chromaBands = [
  { label: "Faint", saturation: 10 }, { label: "Muted", saturation: 18 },
  { label: "Dust", saturation: 26 }, { label: "Soft", saturation: 34 },
  { label: "Clear", saturation: 54 }, { label: "Vivid", saturation: 74 },
  { label: "Bright", saturation: 84 }, { label: "Pure", saturation: 92 },
];

const neutralCatalog = [
  { root: "Warm Gray", hue: 30, saturation: 6 },
  { root: "Taupe Gray", hue: 40, saturation: 5 },
  { root: "True Gray", hue: 0, saturation: 0 },
  { root: "Sage Gray", hue: 150, saturation: 5 },
  { root: "Cool Gray", hue: 210, saturation: 6 },
];

function hslToRgb(hue, saturation, lightness) {
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hueToRgb = (p, q, t) => {
    let a = t;
    if (a < 0) a += 1;
    if (a > 1) a -= 1;
    if (a < 1 / 6) return p + (q - p) * 6 * a;
    if (a < 1 / 2) return q;
    if (a < 2 / 3) return p + (q - p) * (2 / 3 - a) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function getColorFamily(hue) {
  if (hue < 15 || hue >= 345) return "Red";
  if (hue < 45) return "Orange";
  if (hue < 70) return "Yellow";
  if (hue < 95) return "Lime";
  if (hue < 150) return "Green";
  if (hue < 185) return "Teal";
  if (hue < 250) return "Blue";
  if (hue < 290) return "Purple";
  return "Pink";
}

function createColorId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Generate chromatic colors (48 × 14 × 8 = 5,376)
const chromaticColors = hueCatalog.flatMap(({ hue, root }) =>
  lightBands.flatMap(({ label: lightLabel, lightness }) =>
    chromaBands.map(({ label: chromaLabel, saturation }) => {
      const name = `${root} ${lightLabel} ${chromaLabel}`;
      const rgb = hslToRgb(hue, saturation, lightness);
      return {
        id: createColorId(name),
        name,
        hex: rgbToHex(rgb),
        hue,
        saturation,
        lightness,
        family: getColorFamily(hue),
      };
    })
  )
);

// Generate neutral grays (5 × 14 = 70)
const neutralColors = neutralCatalog.flatMap(({ root, hue, saturation }) =>
  lightBands.map(({ label, lightness }) => {
    const name = `${root} ${label}`;
    const rgb = hslToRgb(hue, saturation, lightness);
    return {
      id: createColorId(name),
      name,
      hex: rgbToHex(rgb),
      hue,
      saturation,
      lightness,
      family: getColorFamily(hue),
    };
  })
);

const colors = [...chromaticColors, ...neutralColors];

// Collection definitions (color IDs only — resolved at runtime)
const collectionDefs = [
  {
    id: "quiet-luxury", title: "Quiet Luxury",
    summary: "Soft neutrals and muted warm surfaces",
    ids: ["blush-whisper-muted", "apricot-pearl-soft", "honey-bloom-muted", "olive-tone-muted", "merlot-ink-muted"],
  },
  {
    id: "modern-seaside", title: "Modern Seaside",
    summary: "Clear coastal blues and seafoam accents",
    ids: ["seafoam-whisper-soft", "lagoon-bloom-clear", "cerulean-silk-clear", "azure-core-vivid", "indigo-nocturne-soft"],
  },
  {
    id: "nocturne-tech", title: "Nocturne Tech",
    summary: "Dark mode indigo and electric accents",
    ids: ["indigo-ink-muted", "violet-dusk-clear", "cobalt-core-vivid", "fuchsia-radiant-vivid", "aqua-bloom-soft"],
  },
  {
    id: "editorial-warmth", title: "Editorial Warmth",
    summary: "Amber, olive, and garnet for editorial surfaces",
    ids: ["apricot-whisper-soft", "amber-silk-soft", "citrine-tone-muted", "garnet-velvet-soft", "olive-dusk-muted"],
  },
  {
    id: "orchid-bloom", title: "Orchid Bloom",
    summary: "Orchid, plum, and peony florals",
    ids: ["orchid-bloom-clear", "plum-radiant-clear", "peony-bloom-vivid", "rose-core-soft", "mint-whisper-muted"],
  },
];

const colorMap = new Map(colors.map((c) => [c.id, c]));

const collections = collectionDefs.map((def) => ({
  ...def,
  palette: def.ids.map((id) => colorMap.get(id)).filter(Boolean),
}));

/** Visually interesting colors — exclude very light/dark/muted extremes. */
const heroColors = colors.filter(
  (c) => c.lightness >= 30 && c.lightness <= 75 && c.saturation >= 34
);

/** Get a deterministic "random" color for a given date string (YYYY-MM-DD). */
function getColorOfDay(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return heroColors[Math.abs(hash) % heroColors.length];
}

/** Get analogous colors (±24° hue) for a base color. */
function getAnalogous(base, count = 4) {
  const step = 24;
  const result = [];
  for (let i = 1; i <= count; i++) {
    const targetHue = (base.hue + step * (i % 2 === 1 ? Math.ceil(i / 2) : -Math.ceil(i / 2)) + 360) % 360;
    const match = colors.find(
      (c) => Math.abs(c.hue - targetHue) <= 12 &&
        Math.abs(c.lightness - base.lightness) <= 10 &&
        Math.abs(c.saturation - base.saturation) <= 16
    );
    if (match && match.id !== base.id) result.push(match);
  }
  return result;
}

/** Get complementary color (opposite hue). */
function getComplementary(base) {
  const targetHue = (base.hue + 180) % 360;
  return colors.find(
    (c) => Math.abs(c.hue - targetHue) <= 12 &&
      Math.abs(c.lightness - base.lightness) <= 12 &&
      Math.abs(c.saturation - base.saturation) <= 16
  );
}

module.exports = { colors, colorMap, collections, getColorOfDay, getAnalogous, getComplementary, hslToRgb, rgbToHex };
