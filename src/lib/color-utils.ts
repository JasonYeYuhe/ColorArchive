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

  return colors.filter((color) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      color.name.toLowerCase().includes(normalizedQuery) ||
      color.hex.toLowerCase().includes(normalizedQuery);

    const matchesFamily = activeFamily === "All" || color.family === activeFamily;

    return matchesSearch && matchesFamily;
  });
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
