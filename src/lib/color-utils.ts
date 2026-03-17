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
