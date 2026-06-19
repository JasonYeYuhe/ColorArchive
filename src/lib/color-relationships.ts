import type { ColorRecord } from "@/src/types/color";
import { hexToRgb, rgbToHsl } from "./color-convert";

/** Shared hue-first sort comparator used across modules. */
export function compareHueSort(a: ColorRecord, b: ColorRecord): number {
  return a.hue - b.hue || a.saturation - b.saturation || a.lightness - b.lightness;
}

/**
 * Single-pass equivalent of `[...items].filter(pred).sort(cmp)[0]`: O(n), no array
 * copy, no O(n log n) sort. Keeps the FIRST element among comparator ties (strict `<`),
 * which exactly reproduces a stable sort's `[0]` for both total and partial orders.
 */
function minByComparator(
  items: readonly ColorRecord[],
  pred: (color: ColorRecord) => boolean,
  cmp: (a: ColorRecord, b: ColorRecord) => number,
): ColorRecord | null {
  let best: ColorRecord | null = null;
  for (const item of items) {
    if (!pred(item)) continue;
    if (best === null || cmp(item, best) < 0) best = item;
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

/**
 * Find the closest archive color to an arbitrary hex value.
 * Uses weighted RGB distance for perceptual accuracy.
 */
export function findClosestArchiveColor(
  archiveColors: readonly ColorRecord[],
  hex: string,
): ColorRecord | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let best: { color: ColorRecord; d: number } | null = null;
  for (const ac of archiveColors) {
    const acRgb = hexToRgb(ac.hex);
    if (!acRgb) continue;
    const dr = rgb.r - acRgb.r, dg = rgb.g - acRgb.g, db = rgb.b - acRgb.b;
    const d = Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
    if (!best || d < best.d) best = { color: ac, d };
  }
  return best?.color ?? null;
}

export function getComplementaryColor(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
): ColorRecord | null {
  const targetHue = (baseColor.hue + 180) % 360;

  return minByComparator(
    colors,
    (color) => color.id !== baseColor.id,
    (leftColor, rightColor) => {
      const leftScore =
        getHueDistance(leftColor.hue, targetHue) * 2 +
        Math.abs(leftColor.lightness - baseColor.lightness) * 1.1 +
        Math.abs(leftColor.saturation - baseColor.saturation) * 0.8;
      const rightScore =
        getHueDistance(rightColor.hue, targetHue) * 2 +
        Math.abs(rightColor.lightness - baseColor.lightness) * 1.1 +
        Math.abs(rightColor.saturation - baseColor.saturation) * 0.8;

      return leftScore - rightScore || compareHueSort(leftColor, rightColor);
    },
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
      minByComparator(
        colors,
        (color) => color.id !== baseColor.id,
        (leftColor, rightColor) => {
          const leftScore =
            getHueDistance(leftColor.hue, targetHue) * 2 +
            Math.abs(leftColor.lightness - baseColor.lightness) +
            Math.abs(leftColor.saturation - baseColor.saturation) * 0.8;
          const rightScore =
            getHueDistance(rightColor.hue, targetHue) * 2 +
            Math.abs(rightColor.lightness - baseColor.lightness) +
            Math.abs(rightColor.saturation - baseColor.saturation) * 0.8;

          return leftScore - rightScore || compareHueSort(leftColor, rightColor);
        },
      ),
    )
    .filter((color): color is ColorRecord => Boolean(color))
    .slice(0, limit);
}

export function getSplitComplementaryColors(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
): ColorRecord[] {
  const targetHues = [(baseColor.hue + 150) % 360, (baseColor.hue + 210) % 360];

  return targetHues
    .map((targetHue) =>
      minByComparator(
        colors,
        (color) => color.id !== baseColor.id,
        (a, b) => {
          const aScore =
            getHueDistance(a.hue, targetHue) * 2 +
            Math.abs(a.lightness - baseColor.lightness) +
            Math.abs(a.saturation - baseColor.saturation) * 0.8;
          const bScore =
            getHueDistance(b.hue, targetHue) * 2 +
            Math.abs(b.lightness - baseColor.lightness) +
            Math.abs(b.saturation - baseColor.saturation) * 0.8;
          return aScore - bScore;
        },
      ),
    )
    .filter((color): color is ColorRecord => Boolean(color));
}

export function getTriadicColors(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
): ColorRecord[] {
  const targetHues = [(baseColor.hue + 120) % 360, (baseColor.hue + 240) % 360];

  return targetHues
    .map((targetHue) =>
      minByComparator(
        colors,
        (color) => color.id !== baseColor.id,
        (a, b) => {
          const aScore =
            getHueDistance(a.hue, targetHue) * 2 +
            Math.abs(a.lightness - baseColor.lightness) +
            Math.abs(a.saturation - baseColor.saturation) * 0.8;
          const bScore =
            getHueDistance(b.hue, targetHue) * 2 +
            Math.abs(b.lightness - baseColor.lightness) +
            Math.abs(b.saturation - baseColor.saturation) * 0.8;
          return aScore - bScore;
        },
      ),
    )
    .filter((color): color is ColorRecord => Boolean(color));
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
  return minByComparator(
    colors,
    (color) => {
      if (color.id === baseColor.id) {
        return false;
      }

      if (direction === "lighter") {
        return color.lightness > baseColor.lightness;
      }

      return color.lightness < baseColor.lightness;
    },
    (leftColor, rightColor) => {
      const leftScore =
        getHueDistance(leftColor.hue, baseColor.hue) * 1.8 +
        Math.abs(leftColor.saturation - baseColor.saturation) * 0.8 +
        Math.abs(leftColor.lightness - baseColor.lightness) * 0.45;
      const rightScore =
        getHueDistance(rightColor.hue, baseColor.hue) * 1.8 +
        Math.abs(rightColor.saturation - baseColor.saturation) * 0.8 +
        Math.abs(rightColor.lightness - baseColor.lightness) * 0.45;

      return leftScore - rightScore || compareHueSort(leftColor, rightColor);
    },
  );
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
