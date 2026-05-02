import { describe, expect, it } from "vitest";
import {
  FAMILY_HERITAGES,
  getFamilyHeritage,
  getModifierProse,
  getOriginFamily,
} from "@/src/lib/color-origins";
import { COLOR_FAMILIES } from "@/src/lib/color-filter";
import { colors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";

describe("color-origins coverage", () => {
  it("provides a heritage entry for every ColorFamily plus Neutral", () => {
    const families = new Set(FAMILY_HERITAGES.map((h) => h.family));
    for (const f of COLOR_FAMILIES) {
      expect(families.has(f)).toBe(true);
    }
    expect(families.has("Neutral")).toBe(true);
    expect(families.size).toBe(COLOR_FAMILIES.length + 1);
  });

  it("each heritage entry has all four narrative sections, none empty", () => {
    for (const h of FAMILY_HERITAGES) {
      expect(h.tagline.length).toBeGreaterThan(10);
      expect(h.heritage.length).toBeGreaterThan(80);
      expect(h.cultures.length).toBeGreaterThan(80);
      expect(h.inTheWild.length).toBeGreaterThan(80);
      expect(h.howItReads.length).toBeGreaterThan(80);
    }
  });
});

describe("getOriginFamily", () => {
  it("collapses near-zero-saturation colors into Neutral", () => {
    const trueGray: ColorRecord = {
      id: "true-gray-tone",
      name: "True Gray Tone",
      hex: "#999999",
      rgb: "rgb(153, 153, 153)",
      hsl: "hsl(0, 0%, 60%)",
      hue: 0,
      saturation: 0,
      lightness: 60,
      family: "Red",
    };
    expect(getOriginFamily(trueGray)).toBe("Neutral");
  });

  it("keeps chromatic colors in their reported family", () => {
    const sample = colors.find((c) => c.saturation >= 60);
    expect(sample).toBeDefined();
    expect(getOriginFamily(sample!)).toBe(sample!.family);
  });

  it("classifies all 5,446 colors without throwing", () => {
    for (const c of colors) {
      const f = getOriginFamily(c);
      expect(getFamilyHeritage(f)).toBeDefined();
    }
  });
});

describe("getModifierProse", () => {
  it("returns 3 non-empty sentences for every color in the archive", () => {
    for (const c of colors.slice(0, 200)) {
      const m = getModifierProse(c);
      expect(m.lightness.length).toBeGreaterThan(20);
      expect(m.saturation.length).toBeGreaterThan(20);
      expect(m.composite.length).toBeGreaterThan(20);
    }
  });

  it("matches the expected band for an extreme low-saturation, deep color", () => {
    const c: ColorRecord = {
      id: "test",
      name: "Test",
      hex: "#222222",
      rgb: "rgb(34, 34, 34)",
      hsl: "hsl(0, 0%, 13%)",
      hue: 0,
      saturation: 0,
      lightness: 13,
      family: "Red",
    };
    const m = getModifierProse(c);
    expect(m.composite).toMatch(/dim|near-black|atmospheric/i);
  });

  it("matches the expected band for an extreme high-saturation, airy color", () => {
    const c: ColorRecord = {
      id: "test",
      name: "Test",
      hex: "#FF66FF",
      rgb: "rgb(255, 102, 255)",
      hsl: "hsl(300, 100%, 70%)",
      hue: 300,
      saturation: 100,
      lightness: 70,
      family: "Pink",
    };
    const m = getModifierProse(c);
    expect(m.composite).toMatch(/luminous|neon|high-key/i);
  });
});
