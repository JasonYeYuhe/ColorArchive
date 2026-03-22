import type { ColorRecord } from "@/src/types/color";
import { hexToRgb, rgbToHsl } from "./color-convert";

/** Shared hue-first sort comparator used across modules. */
export function compareHueSort(a: ColorRecord, b: ColorRecord): number {
  return a.hue - b.hue || a.saturation - b.saturation || a.lightness - b.lightness;
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

export function getSplitComplementaryColors(
  colors: readonly ColorRecord[],
  baseColor: ColorRecord,
): ColorRecord[] {
  const targetHues = [(baseColor.hue + 150) % 360, (baseColor.hue + 210) % 360];

  return targetHues
    .map((targetHue) =>
      [...colors]
        .filter((color) => color.id !== baseColor.id)
        .sort((a, b) => {
          const aScore =
            getHueDistance(a.hue, targetHue) * 2 +
            Math.abs(a.lightness - baseColor.lightness) +
            Math.abs(a.saturation - baseColor.saturation) * 0.8;
          const bScore =
            getHueDistance(b.hue, targetHue) * 2 +
            Math.abs(b.lightness - baseColor.lightness) +
            Math.abs(b.saturation - baseColor.saturation) * 0.8;
          return aScore - bScore;
        })[0],
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
      [...colors]
        .filter((color) => color.id !== baseColor.id)
        .sort((a, b) => {
          const aScore =
            getHueDistance(a.hue, targetHue) * 2 +
            Math.abs(a.lightness - baseColor.lightness) +
            Math.abs(a.saturation - baseColor.saturation) * 0.8;
          const bScore =
            getHueDistance(b.hue, targetHue) * 2 +
            Math.abs(b.lightness - baseColor.lightness) +
            Math.abs(b.saturation - baseColor.saturation) * 0.8;
          return aScore - bScore;
        })[0],
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
