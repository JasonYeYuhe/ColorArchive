/**
 * Reverse index: given an arbitrary hex, find brand colors close to it.
 *
 * Drives the "Brands using a similar color" section on every color
 * detail page, turning the 5,446 archive pages and the 51 brand pages
 * into a bidirectional graph for SEO internal linking + user
 * exploration.
 *
 * Distance: weighted-Euclidean RGB. We use a tighter threshold than
 * `findClosestArchiveColor` (which always returns the single nearest)
 * because here we want only *visually plausible* matches — a user
 * shouldn't see "Coca-Cola red" suggested next to a teal swatch just
 * because the brand catalog only has 51 entries.
 */
import { brandPalettes, type BrandPalette, type BrandColor } from "@/src/lib/brand-palettes";
import { hexToRgb } from "@/src/lib/color-convert";

export interface BrandColorMatch {
  brand: BrandPalette;
  color: BrandColor;
  /** Weighted RGB distance — lower = closer. */
  distance: number;
}

/** Threshold above which we suppress matches as visually unrelated. */
export const BRAND_MATCH_DISTANCE_THRESHOLD = 60;

function squaredWeightedRgb(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  // Standard perceptual weights (ITU-R BT.601 luma proxy).
  return 0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db;
}

export function rgbDistance(hexA: string, hexB: string): number {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return Number.POSITIVE_INFINITY;
  return Math.sqrt(squaredWeightedRgb(a, b));
}

/**
 * Return up to `limit` brand color matches within
 * `BRAND_MATCH_DISTANCE_THRESHOLD` of the input hex, deduplicated by
 * brand (one match per brand, the closest of that brand's colors).
 * Sorted by distance ascending.
 */
export function findBrandsNearColor(
  hex: string,
  limit = 3,
  catalog: readonly BrandPalette[] = brandPalettes,
): BrandColorMatch[] {
  const target = hexToRgb(hex);
  if (!target) return [];

  // First pass: best match per brand
  const bestPerBrand = new Map<string, BrandColorMatch>();
  for (const brand of catalog) {
    for (const color of brand.colors) {
      const cRgb = hexToRgb(color.hex);
      if (!cRgb) continue;
      const distance = Math.sqrt(squaredWeightedRgb(target, cRgb));
      if (distance > BRAND_MATCH_DISTANCE_THRESHOLD) continue;
      const existing = bestPerBrand.get(brand.slug);
      if (!existing || distance < existing.distance) {
        bestPerBrand.set(brand.slug, { brand, color, distance });
      }
    }
  }

  return Array.from(bestPerBrand.values())
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
