import { describe, expect, it } from "vitest";
import {
  REGION_MATCH_DISTANCE_THRESHOLD,
  findRegionsNearColor,
} from "@/src/lib/color-region-matches";
import type { RegionPalette } from "@/src/lib/region-palettes";

const fakeCatalog: RegionPalette[] = [
  {
    slug: "test-warm-region",
    name: "Test Warm Region",
    continent: "asia",
    tagline: "x",
    description: "x",
    colors: [
      { name: "Vermillion", hex: "#E44E2B", source: "test" },
      { name: "Pearl White", hex: "#F5F0E5", source: "test" },
    ],
    useCases: ["x"],
    references: [{ label: "x", url: "https://example.com" }],
  },
  {
    slug: "test-cool-region",
    name: "Test Cool Region",
    continent: "europe",
    tagline: "x",
    description: "x",
    colors: [{ name: "Slate Blue", hex: "#4A6FA5", source: "test" }],
    useCases: ["x"],
    references: [{ label: "x", url: "https://example.com" }],
  },
];

describe("findRegionsNearColor", () => {
  it("returns the closest matching region first", () => {
    const matches = findRegionsNearColor("#E44E2B", 3, fakeCatalog);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].region.slug).toBe("test-warm-region");
    expect(matches[0].distance).toBe(0);
  });

  it("respects the limit parameter", () => {
    const matches = findRegionsNearColor("#888888", 1, fakeCatalog);
    expect(matches.length).toBeLessThanOrEqual(1);
  });

  it("deduplicates per region (one match per region — its closest color)", () => {
    const matches = findRegionsNearColor("#F0EBE0", 5, fakeCatalog);
    const slugs = matches.map((m) => m.region.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("filters out matches above the distance threshold", () => {
    const matches = findRegionsNearColor("#FFFF00", 5, fakeCatalog);
    for (const m of matches) {
      expect(m.distance).toBeLessThanOrEqual(REGION_MATCH_DISTANCE_THRESHOLD);
    }
  });

  it("returns an empty list when nothing's close enough", () => {
    const tinyCatalog: RegionPalette[] = [
      {
        ...fakeCatalog[1],
        colors: [{ name: "Pure Blue", hex: "#0000FF", source: "test" }],
      },
    ];
    const matches = findRegionsNearColor("#FFFF00", 3, tinyCatalog);
    expect(matches).toHaveLength(0);
  });

  it("handles the live regionPalettes catalog without throwing", () => {
    // Sanity check on production data: feed in a hex that exactly
    // matches a stored value (Iznik Blue from Turkey region) and
    // expect that region to come back with distance 0.
    const matches = findRegionsNearColor("#1E5599", 3);
    expect(matches.length).toBeGreaterThan(0);
    const turkey = matches.find((m) => m.region.slug === "turkey-istanbul");
    expect(turkey).toBeDefined();
    if (turkey) expect(turkey.distance).toBe(0);
  });

  it("returns malformed hex as empty array (no throw)", () => {
    const matches = findRegionsNearColor("not-hex", 3);
    expect(matches).toEqual([]);
  });
});
