import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export const COLOR_FAMILIES: readonly ColorFamily[] = [
  "Red",
  "Orange",
  "Yellow",
  "Lime",
  "Green",
  "Teal",
  "Blue",
  "Purple",
  "Pink",
] as const;

export function hslToRgb(hue: number, saturation: number, lightness: number): RgbColor {
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  if (s === 0) {
    const value = Math.round(l * 255);
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let adjustedT = t;

    if (adjustedT < 0) {
      adjustedT += 1;
    }

    if (adjustedT > 1) {
      adjustedT -= 1;
    }

    if (adjustedT < 1 / 6) {
      return p + (q - p) * 6 * adjustedT;
    }

    if (adjustedT < 1 / 2) {
      return q;
    }

    if (adjustedT < 2 / 3) {
      return p + (q - p) * (2 / 3 - adjustedT) * 6;
    }

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

export function rgbToHex({ r, g, b }: RgbColor): string {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

export function formatRgb({ r, g, b }: RgbColor): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl(hue: number, saturation: number, lightness: number): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getColorFamily(hue: number): ColorFamily {
  if (hue < 15 || hue >= 345) {
    return "Red";
  }
  if (hue < 45) {
    return "Orange";
  }
  if (hue < 70) {
    return "Yellow";
  }
  if (hue < 95) {
    return "Lime";
  }
  if (hue < 150) {
    return "Green";
  }
  if (hue < 185) {
    return "Teal";
  }
  if (hue < 250) {
    return "Blue";
  }
  if (hue < 290) {
    return "Purple";
  }
  return "Pink";
}

function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

// Semantic search aliases — maps common color words to name fragments in the archive
const SEARCH_ALIASES: Record<string, string[]> = {
  sunset: ["ember", "coral", "amber", "merlot", "ruby"],
  ocean: ["azure", "sapphire", "cobalt", "lagoon", "teal"],
  forest: ["moss", "leaf", "emerald", "pine", "fern"],
  sky: ["azure", "mist", "veil", "whisper", "powder"],
  night: ["ink", "shadow", "onyx", "coal", "deep"],
  pastel: ["veil", "whisper", "mist", "pearl", "silk"],
  earth: ["ember", "clay", "rust", "sienna", "umber"],
  neon: ["vivid", "clear", "bright"],
  warm: ["crimson", "ruby", "ember", "coral", "amber", "honey"],
  cool: ["azure", "sapphire", "cobalt", "teal", "mint"],
  rose: ["ruby", "crimson", "blush", "peony", "fuchsia"],
  gold: ["amber", "honey", "citrine", "marigold"],
  ice: ["frost", "veil", "whisper", "mist", "pearl"],
  vintage: ["muted", "soft", "dusty"],
  bold: ["vivid", "clear", "core"],
  muted: ["muted", "soft"],
  dark: ["ink", "shadow", "deep", "coal"],
  light: ["veil", "whisper", "mist", "pearl"],
  spring: ["mint", "peony", "rose", "blossom", "lavender"],
  autumn: ["ember", "amber", "rust", "sienna", "garnet"],
  fall: ["ember", "amber", "rust", "sienna", "garnet"],
  winter: ["frost", "cobalt", "mist", "slate", "azure"],
  summer: ["coral", "citrine", "aqua", "lime", "vivid"],
  tropical: ["aqua", "lime", "coral", "teal", "vivid"],
  desert: ["sand", "sienna", "amber", "rust", "clay"],
  nordic: ["frost", "veil", "cobalt", "mist", "azure"],
  japanese: ["moss", "ink", "plum", "muted", "ivory"],
  luxury: ["merlot", "pearl", "soft", "garnet", "onyx"],
  natural: ["moss", "amber", "leaf", "olive", "clay"],
  minimal: ["veil", "mist", "whisper", "pearl", "slate"],
  vibrant: ["vivid", "clear", "radiant", "bloom"],
  dreamy: ["lavender", "blush", "peony", "lilac", "veil"],
  retro: ["muted", "amber", "sienna", "garnet", "soft"],
  tech: ["cobalt", "azure", "violet", "ink", "vivid"],
};

function fuzzyMatch(text: string, query: string): boolean {
  // Exact substring match
  if (text.includes(query)) return true;

  // Token-level: every query word must appear somewhere in the text
  const queryTokens = query.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => text.includes(token));
  }

  // Single-token: allow 1-char edit distance for queries >= 4 chars
  if (query.length >= 4) {
    const words = text.split(/[\s-]+/);
    for (const word of words) {
      if (Math.abs(word.length - query.length) > 1) continue;
      let edits = 0;
      const maxLen = Math.max(word.length, query.length);
      let wi = 0;
      let qi = 0;
      while (wi < word.length && qi < query.length) {
        if (word[wi] !== query[qi]) {
          edits++;
          if (edits > 1) break;
          if (word.length > query.length) wi++;
          else if (query.length > word.length) qi++;
          else { wi++; qi++; }
        } else {
          wi++;
          qi++;
        }
      }
      edits += (word.length - wi) + (query.length - qi);
      if (edits <= 1) return true;
    }
  }

  return false;
}

function compareHueSort(a: ColorRecord, b: ColorRecord): number {
  return a.hue - b.hue || a.saturation - b.saturation || a.lightness - b.lightness;
}

export function sortColors(colors: readonly ColorRecord[], sortBy: SortOption): ColorRecord[] {
  const sorted = [...colors];

  sorted.sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name) || compareHueSort(a, b);
    }

    if (sortBy === "lightness") {
      return a.lightness - b.lightness || compareHueSort(a, b);
    }

    return compareHueSort(a, b);
  });

  return sorted;
}

export function filterColors(
  colors: readonly ColorRecord[],
  searchQuery: string,
  activeFamily: ColorFamily | "All",
): ColorRecord[] {
  const normalizedQuery = normalizeSearchValue(searchQuery);

  if (normalizedQuery.length === 0) {
    return activeFamily === "All"
      ? [...colors]
      : colors.filter((color) => color.family === activeFamily);
  }

  // Expand aliases for semantic search
  const aliasFragments = SEARCH_ALIASES[normalizedQuery] ?? [];

  return colors.filter((color) => {
    const matchesFamily = activeFamily === "All" || color.family === activeFamily;
    if (!matchesFamily) return false;

    const nameLower = color.name.toLowerCase();
    const hexLower = color.hex.toLowerCase();

    // Direct match (fuzzy)
    if (fuzzyMatch(nameLower, normalizedQuery) || hexLower.includes(normalizedQuery)) {
      return true;
    }

    // Alias match
    if (aliasFragments.length > 0) {
      return aliasFragments.some((frag) => nameLower.includes(frag));
    }

    return false;
  });
}

/* ------------------------------------------------------------------ */
/*  Color format conversions                                           */
/* ------------------------------------------------------------------ */

export interface HsbColor {
  h: number; // 0–360
  s: number; // 0–100
  b: number; // 0–100 (brightness/value)
}

export interface CmykColor {
  c: number; // 0–100
  m: number; // 0–100
  y: number; // 0–100
  k: number; // 0–100
}

/** Parse a 3- or 6-char hex string (with or without #) into RGB. Returns null for invalid input. */
export function hexToRgb(hex: string): RgbColor | null {
  const cleaned = hex.replace(/^#/, "");
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9A-Fa-f]{6}$/.test(expanded)) return null;
  const num = parseInt(expanded, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Convert RGB (0–255) to HSL (hue 0–360, s/l 0–100). */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (delta > 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/** Convert RGB (0–255) to HSB/HSV (hue 0–360, s/b 0–100). */
export function rgbToHsb(r: number, g: number, b: number): HsbColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta > 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return {
    h,
    s: max === 0 ? 0 : Math.round((delta / max) * 100),
    b: Math.round(max * 100),
  };
}

/** Convert RGB (0–255) to CMYK (0–100). */
export function rgbToCmyk(r: number, g: number, b: number): CmykColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

/** Find the closest ColorRecord to an arbitrary HEX color using HSL perceptual distance. */
export function findNearestArchiveColor(
  colors: readonly ColorRecord[],
  hex: string,
): ColorRecord | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  let best: ColorRecord | null = null;
  let bestScore = Infinity;
  for (const color of colors) {
    const hueDiff = Math.min(Math.abs(color.hue - h), 360 - Math.abs(color.hue - h));
    const score = hueDiff * 1.8 + Math.abs(color.saturation - s) * 0.7 + Math.abs(color.lightness - l) * 1.15;
    if (score < bestScore) {
      bestScore = score;
      best = color;
    }
  }
  return best;
}

export function getHueDistance(fromHue: number, toHue: number): number {
  const difference = Math.abs(fromHue - toHue) % 360;
  return Math.min(difference, 360 - difference);
}

export function getColorDistance(baseColor: ColorRecord, comparisonColor: ColorRecord): number {
  return (
    getHueDistance(baseColor.hue, comparisonColor.hue) * 1.8 +
    Math.abs(baseColor.saturation - comparisonColor.saturation) * 0.7 +
    Math.abs(baseColor.lightness - comparisonColor.lightness) * 1.15
  );
}

export function getNearestColors(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
  limit = 6,
): ColorRecord[] {
  return [...colors]
    .filter((color) => color.id !== baseColor.id)
    .sort((leftColor, rightColor) => {
      return (
        getColorDistance(baseColor, leftColor) - getColorDistance(baseColor, rightColor) ||
        compareHueSort(leftColor, rightColor)
      );
    })
    .slice(0, limit);
}

export function getComplementaryColor(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
): ColorRecord | null {
  const targetHue = (baseColor.hue + 180) % 360;

  return (
    [...colors]
      .filter((color) => color.id !== baseColor.id)
      .sort((leftColor, rightColor) => {
        const leftScore =
          getHueDistance(leftColor.hue, targetHue) * 2 +
          Math.abs(leftColor.lightness - baseColor.lightness) * 1.1 +
          Math.abs(leftColor.saturation - baseColor.saturation) * 0.8;
        const rightScore =
          getHueDistance(rightColor.hue, targetHue) * 2 +
          Math.abs(rightColor.lightness - baseColor.lightness) * 1.1 +
          Math.abs(rightColor.saturation - baseColor.saturation) * 0.8;

        return leftScore - rightScore || compareHueSort(leftColor, rightColor);
      })[0] ?? null
  );
}

export function getAnalogousColors(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
  limit = 2,
): ColorRecord[] {
  const targetHues = [(baseColor.hue + 24) % 360, (baseColor.hue + 336) % 360];

  return targetHues
    .map((targetHue) =>
      [...colors]
        .filter((color) => color.id !== baseColor.id)
        .sort((leftColor, rightColor) => {
          const leftScore =
            getHueDistance(leftColor.hue, targetHue) * 2 +
            Math.abs(leftColor.lightness - baseColor.lightness) +
            Math.abs(leftColor.saturation - baseColor.saturation) * 0.8;
          const rightScore =
            getHueDistance(rightColor.hue, targetHue) * 2 +
            Math.abs(rightColor.lightness - baseColor.lightness) +
            Math.abs(rightColor.saturation - baseColor.saturation) * 0.8;

          return leftScore - rightScore || compareHueSort(leftColor, rightColor);
        })[0],
    )
    .filter((color): color is ColorRecord => Boolean(color))
    .slice(0, limit);
}

export interface WcagContrastData {
  vsWhite: number;
  vsBlack: number;
  whiteGrade: "AA" | "AA Large" | "Fail";
  blackGrade: "AA" | "AA Large" | "Fail";
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const sRGB = c / 255;
    return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function wcagGrade(ratio: number): "AA" | "AA Large" | "Fail" {
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

export function getWcagContrast(hue: number, saturation: number, lightness: number): WcagContrastData {
  const { r, g, b } = hslToRgb(hue, saturation, lightness);
  const colorLum = getRelativeLuminance(r, g, b);
  const vsWhite = (1 + 0.05) / (colorLum + 0.05);
  const vsBlack = (colorLum + 0.05) / (0 + 0.05);
  return {
    vsWhite: Math.round(vsWhite * 10) / 10,
    vsBlack: Math.round(vsBlack * 10) / 10,
    whiteGrade: wcagGrade(vsWhite),
    blackGrade: wcagGrade(vsBlack),
  };
}

export function getContrastRatio(color1: ColorRecord, color2: ColorRecord): number {
  const rgb1 = hslToRgb(color1.hue, color1.saturation, color1.lightness);
  const rgb2 = hslToRgb(color2.hue, color2.saturation, color2.lightness);
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;
}

export interface WcagPairing {
  color: ColorRecord;
  ratio: number;
  grade: "AAA" | "AA" | "AA Large";
}

export function getWcagPairings(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
  limit = 8,
): WcagPairing[] {
  const pairings: WcagPairing[] = [];

  for (const candidate of colors) {
    if (candidate.id === baseColor.id) continue;
    const ratio = getContrastRatio(baseColor, candidate);
    if (ratio >= 3) {
      const grade = ratio >= 7 ? "AAA" as const : ratio >= 4.5 ? "AA" as const : "AA Large" as const;
      pairings.push({ color: candidate, ratio, grade });
    }
  }

  // Sort: AAA first, then AA, then AA Large. Within same grade, prefer visual diversity
  pairings.sort((a, b) => {
    if (a.grade !== b.grade) {
      const gradeOrder = { "AAA": 0, "AA": 1, "AA Large": 2 };
      return gradeOrder[a.grade] - gradeOrder[b.grade];
    }
    // Within same grade, prefer colors from different families (diversity)
    const aDist = getHueDistance(a.color.hue, baseColor.hue);
    const bDist = getHueDistance(b.color.hue, baseColor.hue);
    return bDist - aDist; // farther hues first for diversity
  });

  return pairings.slice(0, limit);
}

export function getTonalStrip(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
): ColorRecord[] {
  return [...colors]
    .filter(
      (color) => color.hue === baseColor.hue && color.saturation === baseColor.saturation,
    )
    .sort((a, b) => a.lightness - b.lightness);
}

export function getToneCompanion(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
  direction: "lighter" | "darker",
): ColorRecord | null {
  return (
    [...colors]
      .filter((color) => {
        if (color.id === baseColor.id) {
          return false;
        }

        if (direction === "lighter") {
          return color.lightness > baseColor.lightness;
        }

        return color.lightness < baseColor.lightness;
      })
      .sort((leftColor, rightColor) => {
        const leftScore =
          getHueDistance(leftColor.hue, baseColor.hue) * 1.8 +
          Math.abs(leftColor.saturation - baseColor.saturation) * 0.8 +
          Math.abs(leftColor.lightness - baseColor.lightness) * 0.45;
        const rightScore =
          getHueDistance(rightColor.hue, baseColor.hue) * 1.8 +
          Math.abs(rightColor.saturation - baseColor.saturation) * 0.8 +
          Math.abs(rightColor.lightness - baseColor.lightness) * 0.45;

        return leftScore - rightScore || compareHueSort(leftColor, rightColor);
      })[0] ?? null
  );
}
