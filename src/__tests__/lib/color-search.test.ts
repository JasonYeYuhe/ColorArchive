import { describe, it, expect } from "vitest";
import { filterColors, filterColorsWithCounts } from "@/src/lib/color-search";
import type { ColorFamily, ColorRecord } from "@/src/types/color";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeColor(
  id: string,
  name: string,
  hex: string,
  family: ColorFamily,
  hue = 0,
): ColorRecord {
  return {
    id,
    name,
    hex,
    rgb: "rgb(0,0,0)",
    hsl: "hsl(0,0%,0%)",
    hue,
    saturation: 50,
    lightness: 50,
    family,
  };
}

const SAMPLE: readonly ColorRecord[] = [
  makeColor("amber-pearl-muted", "Amber Pearl Muted", "#D4A060", "Orange", 35),
  makeColor("cobalt-shadow-vivid", "Cobalt Shadow Vivid", "#1A3A9C", "Blue", 225),
  makeColor("ember-core-bright", "Ember Core Bright", "#CC3300", "Red", 15),
  makeColor("mint-bloom-soft", "Mint Bloom Soft", "#88DDC0", "Green", 160),
  makeColor("rose-silk-clear", "Rose Silk Clear", "#E05080", "Pink", 340),
  makeColor("coral-tone-vivid", "Coral Tone Vivid", "#FF6644", "Orange", 20),
];

// ---------------------------------------------------------------------------
// filterColors — empty query
// ---------------------------------------------------------------------------
describe("filterColors — empty query", () => {
  it("returns all colors when family is All", () => {
    const result = filterColors(SAMPLE, "", "All");
    expect(result).toHaveLength(SAMPLE.length);
  });

  it("returns only Red family when family is Red", () => {
    const result = filterColors(SAMPLE, "  ", "Red");
    expect(result).toHaveLength(1);
    expect(result[0].family).toBe("Red");
  });

  it("returns only Blue family", () => {
    const result = filterColors(SAMPLE, "", "Blue");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("cobalt-shadow-vivid");
  });

  it("returns empty array if family has no colors", () => {
    const result = filterColors(SAMPLE, "", "Yellow");
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// filterColors — name matching
// ---------------------------------------------------------------------------
describe("filterColors — name matching", () => {
  it("matches exact substring (case-insensitive)", () => {
    const result = filterColors(SAMPLE, "amber", "All");
    // "amber" also fuzzy-matches "ember" (1-char substitution, length ≥ 4)
    const ids = result.map((c) => c.id);
    expect(ids).toContain("amber-pearl-muted");
  });

  it("is case-insensitive", () => {
    const result = filterColors(SAMPLE, "COBALT", "All");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("cobalt-shadow-vivid");
  });

  it("matches partial name token", () => {
    const result = filterColors(SAMPLE, "vivid", "All");
    expect(result.map((c) => c.id)).toEqual(
      expect.arrayContaining(["cobalt-shadow-vivid", "coral-tone-vivid"]),
    );
    expect(result).toHaveLength(2);
  });

  it("trims whitespace from query", () => {
    const result = filterColors(SAMPLE, "  mint  ", "All");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("mint-bloom-soft");
  });
});

// ---------------------------------------------------------------------------
// filterColors — hex matching
// ---------------------------------------------------------------------------
describe("filterColors — hex matching", () => {
  it("matches partial hex string (lowercase)", () => {
    const result = filterColors(SAMPLE, "d4a0", "All");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("amber-pearl-muted");
  });

  it("matches partial hex string (uppercase via normalize)", () => {
    // Hex stored as uppercase "#D4A060"; query is lowercased internally
    const result = filterColors(SAMPLE, "d4a060", "All");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("amber-pearl-muted");
  });
});

// ---------------------------------------------------------------------------
// filterColors — fuzzy matching (1-edit distance, query >= 4 chars)
// ---------------------------------------------------------------------------
describe("filterColors — fuzzy matching", () => {
  it("matches 1-char substitution for long query", () => {
    // "cobalt" → "cobolt" is 1 substitution
    const result = filterColors(SAMPLE, "cobolt", "All");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("cobalt-shadow-vivid");
  });

  it("does not match 2-char edit distance", () => {
    // "cxbxlt" is 2 substitutions from "cobalt"
    const result = filterColors(SAMPLE, "cxbxlt", "All");
    expect(result).toHaveLength(0);
  });

  it("does not apply fuzzy logic for queries shorter than 4 chars", () => {
    // "amb" does not fuzzy-match "amber" (too short for edit distance)
    const result = filterColors(SAMPLE, "amx", "All");
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// filterColors — semantic alias search
// ---------------------------------------------------------------------------
describe("filterColors — semantic alias search", () => {
  it("expands 'sunset' alias to ember/coral/amber fragments", () => {
    // SAMPLE has "ember" and "amber" and "coral" tokens → should match
    const result = filterColors(SAMPLE, "sunset", "All");
    const ids = result.map((c) => c.id);
    expect(ids).toContain("ember-core-bright");
    expect(ids).toContain("amber-pearl-muted");
    expect(ids).toContain("coral-tone-vivid");
  });

  it("alias search still respects active family filter", () => {
    // "sunset" matches ember(Red), amber(Orange), coral(Orange)
    // Filter to Red → only ember
    const result = filterColors(SAMPLE, "sunset", "Red");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ember-core-bright");
  });
});

// ---------------------------------------------------------------------------
// filterColors — combined name + family filter
// ---------------------------------------------------------------------------
describe("filterColors — query + family filter", () => {
  it("query matches but family filter excludes → empty", () => {
    const result = filterColors(SAMPLE, "vivid", "Red");
    expect(result).toHaveLength(0);
  });

  it("query matches within correct family", () => {
    const result = filterColors(SAMPLE, "vivid", "Orange");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("coral-tone-vivid");
  });
});

// ---------------------------------------------------------------------------
// filterColorsWithCounts — family counts
// ---------------------------------------------------------------------------
describe("filterColorsWithCounts — empty query", () => {
  it("counts all families when family is All", () => {
    const { results, familyCounts } = filterColorsWithCounts(SAMPLE, "", "All");
    expect(results).toHaveLength(SAMPLE.length);
    expect(familyCounts["Orange"]).toBe(2); // amber + coral
    expect(familyCounts["Blue"]).toBe(1);
    expect(familyCounts["Red"]).toBe(1);
    expect(familyCounts["Green"]).toBe(1);
    expect(familyCounts["Pink"]).toBe(1);
  });

  it("filters results by family but familyCounts covers all families", () => {
    const { results, familyCounts } = filterColorsWithCounts(SAMPLE, "", "Orange");
    expect(results).toHaveLength(2);
    expect(results.every((c) => c.family === "Orange")).toBe(true);
    // Counts should cover non-Orange families too
    expect(familyCounts["Red"]).toBe(1);
    expect(familyCounts["Blue"]).toBe(1);
  });
});

describe("filterColorsWithCounts — with query", () => {
  it("returns correct family counts for matched colors only", () => {
    // "vivid" matches cobalt(Blue) + coral(Orange)
    const { results, familyCounts } = filterColorsWithCounts(SAMPLE, "vivid", "All");
    expect(results).toHaveLength(2);
    expect(familyCounts["Blue"]).toBe(1);
    expect(familyCounts["Orange"]).toBe(1);
    expect(familyCounts["Red"]).toBeUndefined();
  });

  it("results respect active family, familyCounts covers all matches", () => {
    // "vivid" matches Blue + Orange; active = Blue → 1 result, but counts include both
    const { results, familyCounts } = filterColorsWithCounts(SAMPLE, "vivid", "Blue");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("cobalt-shadow-vivid");
    expect(familyCounts["Blue"]).toBe(1);
    expect(familyCounts["Orange"]).toBe(1);
  });

  it("returns empty results and empty familyCounts for no match", () => {
    const { results, familyCounts } = filterColorsWithCounts(SAMPLE, "zzzzz", "All");
    expect(results).toHaveLength(0);
    expect(Object.keys(familyCounts)).toHaveLength(0);
  });
});
