/**
 * Reverse index: given an arbitrary hex, find region-palette colors
 * close to it. Mirrors color-brand-matches.ts but for the cultural-
 * palette catalog instead of the brand catalog.
 *
 * Drives the "Cultures using a similar color" section on every color
 * detail page, turning the 5,446 archive pages and the regions
 * catalog into another bidirectional graph for SEO + user discovery.
 */
import {
  regionPalettes,
  type RegionColor,
  type RegionPalette,
} from "@/src/lib/region-palettes";
import { hexToRgb } from "@/src/lib/color-convert";

export interface RegionColorMatch {
  region: RegionPalette;
  color: RegionColor;
  /** Weighted RGB distance — lower = closer. */
  distance: number;
}

/** Same threshold as the brand reverse-index — hides visually unrelated matches. */
export const REGION_MATCH_DISTANCE_THRESHOLD = 60;

function squaredWeightedRgb(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return 0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db;
}

/**
 * Return up to `limit` region color matches within the threshold.
 * Deduplicated by region (one match per region — its closest color).
 * Sorted by distance ascending.
 */
export function findRegionsNearColor(
  hex: string,
  limit = 3,
  catalog: readonly RegionPalette[] = regionPalettes,
): RegionColorMatch[] {
  const target = hexToRgb(hex);
  if (!target) return [];

  const bestPerRegion = new Map<string, RegionColorMatch>();
  for (const region of catalog) {
    for (const color of region.colors) {
      const cRgb = hexToRgb(color.hex);
      if (!cRgb) continue;
      const distance = Math.sqrt(squaredWeightedRgb(target, cRgb));
      if (distance > REGION_MATCH_DISTANCE_THRESHOLD) continue;
      const existing = bestPerRegion.get(region.slug);
      if (!existing || distance < existing.distance) {
        bestPerRegion.set(region.slug, { region, color, distance });
      }
    }
  }

  return Array.from(bestPerRegion.values())
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
