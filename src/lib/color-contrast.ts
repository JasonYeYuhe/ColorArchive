import type { ColorRecord } from "@/src/types/color";
import { hslToRgb } from "./color-convert";
import { getHueDistance } from "./color-relationships";

export interface WcagContrastData {
  vsWhite: number;
  vsBlack: number;
  whiteGrade: "AA" | "AA Large" | "Fail";
  blackGrade: "AA" | "AA Large" | "Fail";
}

export interface WcagPairing {
  color: ColorRecord;
  ratio: number;
  grade: "AAA" | "AA" | "AA Large";
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
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

/**
 * Should text on this colour be dark rather than light?
 *
 * One function so two surfaces cannot disagree. The colour detail hero and the
 * sticky bar each decided this for themselves and differed on 21 of the 5,446
 * archive colours: the hero compared getWcagContrast's ratios, which are rounded
 * to one decimal before they are returned, so a pair like 4.55 vs 4.54 came back
 * as 4.6 vs 4.5 in one place and was compared unrounded in the other. Rounding
 * belongs in display, not in a branch.
 */
export function prefersDarkText(r: number, g: number, b: number): boolean {
  const luminance = getRelativeLuminance(r, g, b);
  const vsWhite = 1.05 / (luminance + 0.05);
  const vsBlack = (luminance + 0.05) / 0.05;
  return vsBlack > vsWhite;
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
