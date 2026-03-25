/**
 * Color Name Generator
 *
 * Given any hex color, deterministically generates:
 * - A poetic evocative name (e.g. "Pale Sage Dusk")
 * - A CSS design token name (e.g. "--color-sage-pale")
 * - A semantic role suggestion (e.g. "background-subtle")
 * - Mood / psychological associations
 * - A Tailwind-compatible variable name (e.g. "sage-100")
 */

import { hslToRgb, rgbToHex, rgbToHsl, hexToRgb } from "@/src/lib/color-utils";

// ─── Word Pools by Hue Family ─────────────────────────────────────────────────

const HUE_WORDS: Record<string, { poetic: string[]; token: string; mood: string[] }> = {
  red: {
    poetic: ["Crimson", "Scarlet", "Garnet", "Ruby", "Ember", "Cherry", "Rose", "Cinnabar", "Vermillion", "Cardinal"],
    token: "red",
    mood: ["passionate", "urgent", "bold", "energizing", "attention-grabbing"],
  },
  orange: {
    poetic: ["Amber", "Tangerine", "Copper", "Bronze", "Paprika", "Sienna", "Apricot", "Terra", "Cinder", "Rust"],
    token: "orange",
    mood: ["warm", "creative", "friendly", "optimistic", "energetic"],
  },
  yellow: {
    poetic: ["Citrine", "Gold", "Honey", "Butter", "Wheat", "Flax", "Maize", "Canary", "Saffron", "Ivory"],
    token: "yellow",
    mood: ["cheerful", "optimistic", "luminous", "sunny", "uplifting"],
  },
  lime: {
    poetic: ["Chartreuse", "Citrus", "Fern", "Moss", "Peridot", "Pistachio", "Jade", "Willow", "Lichen", "Celadon"],
    token: "lime",
    mood: ["fresh", "natural", "youthful", "energetic", "vibrant"],
  },
  green: {
    poetic: ["Sage", "Forest", "Spruce", "Juniper", "Evergreen", "Laurel", "Clover", "Basil", "Emerald", "Malachite"],
    token: "green",
    mood: ["natural", "calming", "trustworthy", "fresh", "balanced"],
  },
  teal: {
    poetic: ["Teal", "Seafoam", "Aqua", "Verdigris", "Patina", "Tourmaline", "Cypress", "Lagoon", "Mist", "Cerulean"],
    token: "teal",
    mood: ["serene", "refreshing", "sophisticated", "calm", "clear"],
  },
  blue: {
    poetic: ["Cobalt", "Sapphire", "Indigo", "Azure", "Cerulean", "Lapis", "Sky", "Denim", "Ocean", "Slate"],
    token: "blue",
    mood: ["trustworthy", "calm", "professional", "reliable", "secure"],
  },
  purple: {
    poetic: ["Violet", "Amethyst", "Lavender", "Plum", "Mauve", "Heather", "Wisteria", "Iris", "Dusk", "Twilight"],
    token: "purple",
    mood: ["creative", "luxurious", "mysterious", "imaginative", "spiritual"],
  },
  pink: {
    poetic: ["Rose", "Blush", "Petal", "Peony", "Fuchsia", "Coral", "Flamingo", "Dusty Rose", "Orchid", "Carnation"],
    token: "pink",
    mood: ["romantic", "playful", "gentle", "compassionate", "joyful"],
  },
  neutral: {
    poetic: ["Stone", "Ash", "Pebble", "Bone", "Chalk", "Linen", "Fog", "Haze", "Driftwood", "Smoke"],
    token: "neutral",
    mood: ["balanced", "versatile", "calm", "understated", "timeless"],
  },
};

// ─── Lightness Descriptors ────────────────────────────────────────────────────

const LIGHTNESS_DESCRIPTORS = {
  pale: { range: [80, 100], words: ["Pale", "Light", "Ghost", "Whisper", "Pearl"], suffix: "pale", tailwindStep: 100 },
  soft: { range: [65, 80], words: ["Soft", "Mist", "Haze", "Pastel", "Cloud"], suffix: "soft", tailwindStep: 200 },
  medium_light: { range: [52, 65], words: ["Fair", "Subtle", "Gentle", "Airy", "Faint"], suffix: "light", tailwindStep: 300 },
  medium: { range: [40, 52], words: ["Mid", "True", "Pure", "Core", "Vivid"], suffix: "500", tailwindStep: 500 },
  medium_dark: { range: [28, 40], words: ["Deep", "Rich", "Dense", "Dusk", "Shade"], suffix: "dark", tailwindStep: 600 },
  dark: { range: [14, 28], words: ["Dark", "Shadow", "Dusk", "Night", "Deep"], suffix: "700", tailwindStep: 700 },
  very_dark: { range: [0, 14], words: ["Ink", "Void", "Abyss", "Onyx", "Sable"], suffix: "900", tailwindStep: 900 },
};

// ─── Saturation Descriptors ───────────────────────────────────────────────────

const SATURATION_DESCRIPTORS = {
  muted: { range: [0, 20], words: ["Muted", "Dusty", "Faded", "Worn", "Quiet"] },
  gentle: { range: [20, 42], words: ["Gentle", "Soft", "Subtle", "Calm", "Still"] },
  moderate: { range: [42, 64], words: ["Clear", "True", "Clean", "Honest", "Pure"] },
  vivid: { range: [64, 82], words: ["Vivid", "Bright", "Crisp", "Sharp", "Lively"] },
  intense: { range: [82, 100], words: ["Intense", "Bold", "Electric", "Vibrant", "Radiant"] },
};

// ─── Semantic Role Suggestions ────────────────────────────────────────────────

function getSemanticRole(l: number, s: number): { primary: string; secondary: string } {
  if (l >= 90) return { primary: "background-subtle", secondary: "surface-elevated" };
  if (l >= 75) return { primary: "background-muted", secondary: "border-light" };
  if (l >= 60) return { primary: "surface-default", secondary: "background-tinted" };
  if (l >= 45 && s >= 50) return { primary: "accent-primary", secondary: "interactive-default" };
  if (l >= 45) return { primary: "surface-active", secondary: "text-secondary" };
  if (l >= 30) return { primary: "text-secondary", secondary: "icon-default" };
  if (l >= 18) return { primary: "text-primary", secondary: "icon-strong" };
  return { primary: "text-inverse-bg", secondary: "background-inverse" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHueFamily(hue: number, s: number): string {
  if (s < 10) return "neutral";
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

function getLightnessKey(l: number): keyof typeof LIGHTNESS_DESCRIPTORS {
  if (l >= 80) return "pale";
  if (l >= 65) return "soft";
  if (l >= 52) return "medium_light";
  if (l >= 40) return "medium";
  if (l >= 28) return "medium_dark";
  if (l >= 14) return "dark";
  return "very_dark";
}

function getSaturationKey(s: number): keyof typeof SATURATION_DESCRIPTORS {
  if (s < 20) return "muted";
  if (s < 42) return "gentle";
  if (s < 64) return "moderate";
  if (s < 82) return "vivid";
  return "intense";
}

/** Seeded pseudo-random to pick deterministically from word arrays */
function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface ColorNameResult {
  hex: string;
  /** e.g. "Pale Sage Mist" */
  poeticName: string;
  /** Alternative poetic names */
  alternateNames: string[];
  /** e.g. "--color-sage-pale" */
  cssVar: string;
  /** e.g. "sage-100" */
  tailwindName: string;
  /** e.g. "background-subtle" */
  semanticRole: string;
  /** e.g. "$color-sage-light" (SASS) */
  sassVar: string;
  /** Mood / psychological associations */
  moods: string[];
  /** Hue family */
  family: string;
  /** HSL values */
  hsl: { h: number; s: number; l: number };
  /** WCAG contrast against white */
  contrastWhite: number;
  /** WCAG contrast against black */
  contrastBlack: number;
  /** Best readable text color on this background */
  textOnColor: "#ffffff" | "#1a1a1a";
  /** Tailwind scale step (e.g. 100, 500, 700) */
  tailwindStep: number;
}

export function generateColorName(hex: string): ColorNameResult | null {
  const cleanHex = hex.startsWith("#") ? hex : `#${hex}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(cleanHex)) return null;

  const rgb = hexToRgb(cleanHex);
  if (!rgb) return null;

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const familyKey = getHueFamily(h, s);
  const lightnessKey = getLightnessKey(l);
  const saturationKey = getSaturationKey(s);

  const familyData = HUE_WORDS[familyKey];
  const lightnessData = LIGHTNESS_DESCRIPTORS[lightnessKey];
  const saturationData = SATURATION_DESCRIPTORS[saturationKey];

  // Use hue as seed for deterministic word picking
  const seed = Math.round(h * 100 + s * 10 + l);

  // Primary poetic name
  const hueWord = seededPick(familyData.poetic, seed);
  const lightWord = seededPick(lightnessData.words, seed + 1);
  const satWord = seededPick(saturationData.words, seed + 2);

  // Build poetic name: 2-3 words depending on specificity
  let poeticName: string;
  if (s < 12) {
    // Neutral: simple two-word
    const neutralWord = seededPick(HUE_WORDS.neutral.poetic, seed);
    poeticName = `${lightWord} ${neutralWord}`;
  } else if (saturationKey === "moderate" || saturationKey === "gentle") {
    poeticName = `${lightWord} ${hueWord}`;
  } else {
    poeticName = `${lightWord} ${hueWord}`;
  }

  // Alternate names
  const alternateNames: string[] = [];
  const altHueWord = seededPick(familyData.poetic, seed + 7);
  const altLightWord = seededPick(lightnessData.words, seed + 5);
  alternateNames.push(`${altLightWord} ${altHueWord}`);

  const altHueWord2 = seededPick(familyData.poetic, seed + 13);
  const altSatWord = seededPick(saturationData.words, seed + 11);
  alternateNames.push(`${altSatWord} ${altHueWord2}`);

  // Token / variable names
  const tokenBase = `${familyData.token}-${lightnessData.suffix}`;
  const cssVar = `--color-${tokenBase}`;
  const tailwindName = `${familyData.token}-${lightnessData.tailwindStep}`;
  const sassVar = `$color-${tokenBase}`;

  // Semantic role
  const semantic = getSemanticRole(l, s);

  // Contrast
  const lum = relativeLuminance(rgb.r, rgb.g, rgb.b);
  const cWhite = contrastRatio(lum, 1.0);
  const cBlack = contrastRatio(lum, 0.0);
  const textOnColor: "#ffffff" | "#1a1a1a" = cBlack > cWhite ? "#1a1a1a" : "#ffffff";

  return {
    hex: cleanHex.toUpperCase(),
    poeticName,
    alternateNames,
    cssVar,
    tailwindName,
    sassVar,
    semanticRole: semantic.primary,
    moods: familyData.mood,
    family: familyKey,
    hsl: { h: Math.round(h), s: Math.round(s), l: Math.round(l) },
    contrastWhite: Math.round(cWhite * 100) / 100,
    contrastBlack: Math.round(cBlack * 100) / 100,
    textOnColor,
    tailwindStep: lightnessData.tailwindStep,
  };
}

/** Find the nearest hex from a provided list using Euclidean distance in RGB space */
export function nearestColor(
  hex: string,
  candidates: Array<{ id: string; hex: string; name: string; slug: string }>
): { id: string; hex: string; name: string; slug: string; distance: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb || candidates.length === 0) return null;

  let best = candidates[0];
  let bestDist = Infinity;

  for (const c of candidates) {
    const cRgb = hexToRgb(c.hex);
    if (!cRgb) continue;
    const dist = Math.sqrt(
      Math.pow(rgb.r - cRgb.r, 2) +
      Math.pow(rgb.g - cRgb.g, 2) +
      Math.pow(rgb.b - cRgb.b, 2)
    );
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }

  return { ...best, distance: Math.round(bestDist) };
}
