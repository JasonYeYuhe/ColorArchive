import { describe, it, expect } from "vitest";
import type { ColorRecord, SortOption } from "@/src/types/color";
import { getColorFamily, sortColors, COLOR_FAMILIES } from "@/src/lib/color-filter";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeColor(overrides: Partial<ColorRecord> & { id: string }): ColorRecord {
  return {
    name: overrides.id,
    hex: "#000000",
    rgb: "rgb(0,0,0)",
    hsl: "hsl(0,0%,0%)",
    hue: 0,
    saturation: 50,
    lightness: 50,
    family: "Red",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. COLOR_FAMILIES constant
// ---------------------------------------------------------------------------
describe("COLOR_FAMILIES", () => {
  it("contains exactly 9 families", () => {
    expect(COLOR_FAMILIES).toHaveLength(9);
  });
});

// ---------------------------------------------------------------------------
// 2. getColorFamily
// ---------------------------------------------------------------------------
describe("getColorFamily", () => {
  const cases: Array<[number, string]> = [
    // Red wraps around 0/360
    [0, "Red"],
    [5, "Red"],
    [14, "Red"],
    [350, "Red"],
    [359, "Red"],

    // Orange
    [15, "Orange"],
    [30, "Orange"],
    [44, "Orange"],

    // Yellow
    [45, "Yellow"],
    [55, "Yellow"],
    [69, "Yellow"],

    // Lime
    [70, "Lime"],
    [80, "Lime"],
    [94, "Lime"],

    // Green
    [95, "Green"],
    [120, "Green"],
    [149, "Green"],

    // Teal
    [150, "Teal"],
    [170, "Teal"],
    [184, "Teal"],

    // Blue
    [185, "Blue"],
    [210, "Blue"],
    [249, "Blue"],

    // Purple
    [250, "Purple"],
    [270, "Purple"],
    [289, "Purple"],

    // Pink
    [290, "Pink"],
    [320, "Pink"],
    [344, "Pink"],
  ];

  for (const [hue, expected] of cases) {
    it(`hue ${hue} → ${expected}`, () => {
      expect(getColorFamily(hue)).toBe(expected);
    });
  }

  it("covers all families across the 0-359 range", () => {
    const seen = new Set<string>();
    for (let h = 0; h < 360; h++) {
      seen.add(getColorFamily(h));
    }
    expect(seen.size).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// 3. sortColors
// ---------------------------------------------------------------------------
describe("sortColors", () => {
  const colors: ColorRecord[] = [
    makeColor({ id: "c", name: "Cherry",  hue: 350, lightness: 40 }),
    makeColor({ id: "a", name: "Amber",   hue: 30,  lightness: 70 }),
    makeColor({ id: "m", name: "Mint",    hue: 150, lightness: 55 }),
    makeColor({ id: "s", name: "Sky",     hue: 200, lightness: 60 }),
    makeColor({ id: "l", name: "Lime",    hue: 80,  lightness: 50 }),
  ];

  it("does not mutate the original array", () => {
    const original = [...colors];
    sortColors(colors, "hue");
    expect(colors).toEqual(original);
  });

  describe("sort by hue", () => {
    it("orders by hue ascending", () => {
      const sorted = sortColors(colors, "hue");
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].hue).toBeGreaterThanOrEqual(sorted[i - 1].hue);
      }
    });
  });

  describe("sort by lightness", () => {
    it("orders by lightness ascending", () => {
      const sorted = sortColors(colors, "lightness");
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].lightness).toBeGreaterThanOrEqual(sorted[i - 1].lightness);
      }
    });
  });

  describe("sort by name", () => {
    it("orders alphabetically by name", () => {
      const sorted = sortColors(colors, "name");
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].name.localeCompare(sorted[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("returns same length as input", () => {
    const options: SortOption[] = ["hue", "lightness", "name"];
    for (const opt of options) {
      expect(sortColors(colors, opt)).toHaveLength(colors.length);
    }
  });
});
