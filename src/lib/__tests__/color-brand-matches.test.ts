import { describe, expect, it } from "vitest";
import {
  BRAND_MATCH_DISTANCE_THRESHOLD,
  findBrandsNearColor,
  rgbDistance,
} from "@/src/lib/color-brand-matches";
import type { BrandPalette } from "@/src/lib/brand-palettes";

const fakeCatalog: BrandPalette[] = [
  {
    slug: "test-red-brand",
    name: "Test Red Brand",
    category: "tech",
    tagline: "x",
    description: "x",
    colors: [
      { role: "primary", name: "Red", hex: "#FF0000" },
      { role: "neutral", name: "Black", hex: "#000000" },
    ],
    source: { url: "https://example.com", asOf: "2026-05-03" },
  },
  {
    slug: "test-blue-brand",
    name: "Test Blue Brand",
    category: "tech",
    tagline: "x",
    description: "x",
    colors: [{ role: "primary", name: "Blue", hex: "#0000FF" }],
    source: { url: "https://example.com", asOf: "2026-05-03" },
  },
  {
    slug: "test-green-brand",
    name: "Test Green Brand",
    category: "tech",
    tagline: "x",
    description: "x",
    colors: [{ role: "primary", name: "Green", hex: "#00FF00" }],
    source: { url: "https://example.com", asOf: "2026-05-03" },
  },
];

describe("rgbDistance", () => {
  it("returns 0 for identical hexes", () => {
    expect(rgbDistance("#FF0000", "#FF0000")).toBe(0);
  });

  it("is symmetric", () => {
    expect(rgbDistance("#FF0000", "#0000FF")).toBe(rgbDistance("#0000FF", "#FF0000"));
  });

  it("returns Infinity for malformed input", () => {
    expect(rgbDistance("not-hex", "#FF0000")).toBe(Number.POSITIVE_INFINITY);
  });

  it("monotonic: more similar colors return smaller distances", () => {
    const same = rgbDistance("#FF0000", "#FF0000");
    const close = rgbDistance("#FF0000", "#FF1010");
    const far = rgbDistance("#FF0000", "#0000FF");
    expect(same).toBeLessThan(close);
    expect(close).toBeLessThan(far);
  });
});

describe("findBrandsNearColor", () => {
  it("returns the closest matching brand first", () => {
    const matches = findBrandsNearColor("#FF1010", 3, fakeCatalog);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].brand.slug).toBe("test-red-brand");
  });

  it("respects the limit parameter", () => {
    // Use a near-grey input that's roughly equidistant from the test
    // brand reds/greens/blues — but expect at most 2 results.
    const matches = findBrandsNearColor("#888888", 2, fakeCatalog);
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it("deduplicates per brand (one match per brand, the closest of its colors)", () => {
    const matches = findBrandsNearColor("#0A0A0A", 5, fakeCatalog);
    const brandSlugs = matches.map((m) => m.brand.slug);
    expect(new Set(brandSlugs).size).toBe(brandSlugs.length);
  });

  it("filters out matches above the distance threshold", () => {
    // A magenta hex is reasonably far from all 3 fake brand primaries.
    const matches = findBrandsNearColor("#888800", 5, fakeCatalog);
    for (const m of matches) {
      expect(m.distance).toBeLessThanOrEqual(BRAND_MATCH_DISTANCE_THRESHOLD);
    }
  });

  it("returns an empty list when nothing's close enough", () => {
    const tinyCatalog: BrandPalette[] = [
      {
        ...fakeCatalog[0],
        colors: [{ role: "primary", name: "Red", hex: "#FF0000" }],
      },
    ];
    // Cyan is ~360 distance from pure red — well past the threshold.
    const matches = findBrandsNearColor("#00FFFF", 3, tinyCatalog);
    expect(matches).toHaveLength(0);
  });

  it("handles the live brandPalettes catalog without throwing", () => {
    // Sanity check on production data: feed in a hex that exactly
    // matches a stored value (Twitter legacy blue #1D9BF0) and expect
    // the brand to be returned with distance 0.
    const matches = findBrandsNearColor("#1D9BF0", 3);
    expect(matches.length).toBeGreaterThan(0);
    const twitter = matches.find((m) => m.brand.slug === "twitter-x");
    expect(twitter).toBeDefined();
    if (twitter) expect(twitter.distance).toBe(0);
  });
});
