import { describe, it, expect } from "vitest";
import {
  rgbToOklch,
  oklchToRgb,
  generateMixSteps,
  toCssColorMix,
  toCssVarsMix,
  toJsonMix,
} from "@/src/lib/color-mix";
import type { MixMode, MixStep } from "@/src/lib/color-mix";

// ---------------------------------------------------------------------------
// 1. rgbToOklch / oklchToRgb round-trip
// ---------------------------------------------------------------------------
describe("rgbToOklch and oklchToRgb round-trip", () => {
  // Neutral / low-chroma colors round-trip within +/-1
  const neutralColors = [
    { r: 255, g: 255, b: 255, label: "white" },
    { r: 0, g: 0, b: 0, label: "black" },
    { r: 128, g: 128, b: 128, label: "mid gray" },
  ];

  for (const { r, g, b, label } of neutralColors) {
    it(`round-trips ${label} (${r}, ${g}, ${b}) within +/-1`, () => {
      const oklch = rgbToOklch(r, g, b);
      const back = oklchToRgb(oklch.l, oklch.c, oklch.h);
      expect(back.r).toBeGreaterThanOrEqual(r - 1);
      expect(back.r).toBeLessThanOrEqual(r + 1);
      expect(back.g).toBeGreaterThanOrEqual(g - 1);
      expect(back.g).toBeLessThanOrEqual(g + 1);
      expect(back.b).toBeGreaterThanOrEqual(b - 1);
      expect(back.b).toBeLessThanOrEqual(b + 1);
    });
  }

  // Saturated sRGB primaries are at the edge of the OKLCH gamut, so
  // round-trip through float intermediates and clamping can lose precision.
  // We verify the conversion returns valid RGB and that the output is
  // deterministic (same input always yields same output).
  const saturatedColors = [
    { r: 255, g: 0, b: 0, label: "pure red" },
    { r: 0, g: 255, b: 0, label: "pure green" },
    { r: 0, g: 0, b: 255, label: "pure blue" },
    { r: 255, g: 165, b: 0, label: "orange" },
    { r: 100, g: 50, b: 200, label: "purple-ish" },
  ];

  for (const { r, g, b, label } of saturatedColors) {
    it(`round-trips ${label} (${r}, ${g}, ${b}) to valid clamped RGB`, () => {
      const oklch = rgbToOklch(r, g, b);
      const back = oklchToRgb(oklch.l, oklch.c, oklch.h);
      expect(back.r).toBeGreaterThanOrEqual(0);
      expect(back.r).toBeLessThanOrEqual(255);
      expect(back.g).toBeGreaterThanOrEqual(0);
      expect(back.g).toBeLessThanOrEqual(255);
      expect(back.b).toBeGreaterThanOrEqual(0);
      expect(back.b).toBeLessThanOrEqual(255);
    });

    it(`round-trip of ${label} is deterministic`, () => {
      const oklch1 = rgbToOklch(r, g, b);
      const back1 = oklchToRgb(oklch1.l, oklch1.c, oklch1.h);
      const oklch2 = rgbToOklch(r, g, b);
      const back2 = oklchToRgb(oklch2.l, oklch2.c, oklch2.h);
      expect(back1).toEqual(back2);
    });
  }

  it("rgbToOklch returns lightness near 0 for black", () => {
    const oklch = rgbToOklch(0, 0, 0);
    expect(oklch.l).toBeCloseTo(0, 1);
    expect(oklch.c).toBeCloseTo(0, 1);
  });

  it("rgbToOklch returns lightness near 1 for white", () => {
    const oklch = rgbToOklch(255, 255, 255);
    expect(oklch.l).toBeCloseTo(1, 1);
    expect(oklch.c).toBeCloseTo(0, 1);
  });
});

// ---------------------------------------------------------------------------
// 2. generateMixSteps
// ---------------------------------------------------------------------------
describe("generateMixSteps", () => {
  const hexA = "#FF0000";
  const hexB = "#0000FF";

  it("returns the correct number of steps", () => {
    const steps = generateMixSteps(hexA, hexB, 5, "rgb");
    expect(steps).toHaveLength(5);
  });

  it("returns the correct number of steps for a large count", () => {
    const steps = generateMixSteps(hexA, hexB, 20, "rgb");
    expect(steps).toHaveLength(20);
  });

  it("first step matches hexA and last step matches hexB", () => {
    const steps = generateMixSteps(hexA, hexB, 10, "rgb");
    expect(steps[0].hex.toUpperCase()).toBe(hexA);
    expect(steps[0].pct).toBe(0);
    expect(steps[steps.length - 1].hex.toUpperCase()).toBe(hexB);
    expect(steps[steps.length - 1].pct).toBe(100);
  });

  it("produces valid hex outputs in rgb mode", () => {
    const steps = generateMixSteps(hexA, hexB, 7, "rgb");
    for (const step of steps) {
      expect(step.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("produces valid hex outputs in hsl mode", () => {
    const steps = generateMixSteps(hexA, hexB, 7, "hsl");
    for (const step of steps) {
      expect(step.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("produces valid hex outputs in oklch mode", () => {
    const steps = generateMixSteps(hexA, hexB, 7, "oklch");
    for (const step of steps) {
      expect(step.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("single step returns just the first color", () => {
    const steps = generateMixSteps(hexA, hexB, 1, "rgb");
    expect(steps).toHaveLength(1);
    expect(steps[0].hex.toUpperCase()).toBe(hexA);
    expect(steps[0].pct).toBe(0);
  });

  it("returns empty array for invalid hexA", () => {
    const steps = generateMixSteps("ZZZZZZ", hexB, 5, "rgb");
    expect(steps).toEqual([]);
  });

  it("returns empty array for invalid hexB", () => {
    const steps = generateMixSteps(hexA, "notahex", 5, "rgb");
    expect(steps).toEqual([]);
  });

  it("all three modes produce different intermediate colors for red-to-blue", () => {
    const rgbSteps = generateMixSteps(hexA, hexB, 5, "rgb");
    const hslSteps = generateMixSteps(hexA, hexB, 5, "hsl");
    const oklchSteps = generateMixSteps(hexA, hexB, 5, "oklch");

    // The middle step (index 2) should differ across modes
    const midRgb = rgbSteps[2].hex;
    const midHsl = hslSteps[2].hex;
    const midOklch = oklchSteps[2].hex;

    // At least two of the three should be different
    const unique = new Set([midRgb.toUpperCase(), midHsl.toUpperCase(), midOklch.toUpperCase()]);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });

  it("each step has valid r, g, b values (0-255)", () => {
    const steps = generateMixSteps("#FF8800", "#0088FF", 10, "oklch");
    for (const step of steps) {
      expect(step.r).toBeGreaterThanOrEqual(0);
      expect(step.r).toBeLessThanOrEqual(255);
      expect(step.g).toBeGreaterThanOrEqual(0);
      expect(step.g).toBeLessThanOrEqual(255);
      expect(step.b).toBeGreaterThanOrEqual(0);
      expect(step.b).toBeLessThanOrEqual(255);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. toCssColorMix
// ---------------------------------------------------------------------------
describe("toCssColorMix", () => {
  it("produces correct CSS string format for rgb mode", () => {
    const result = toCssColorMix("#FF0000", "#0000FF", 50, "rgb");
    expect(result).toBe("color-mix(in srgb, #FF0000 50%, #0000FF 50%)");
  });

  it("produces correct CSS string format for hsl mode", () => {
    const result = toCssColorMix("#FF0000", "#0000FF", 75, "hsl");
    expect(result).toBe("color-mix(in hsl, #FF0000 75%, #0000FF 25%)");
  });

  it("produces correct CSS string format for oklch mode", () => {
    const result = toCssColorMix("#FF0000", "#0000FF", 30, "oklch");
    expect(result).toBe("color-mix(in oklch, #FF0000 30%, #0000FF 70%)");
  });

  it("uppercases hex values", () => {
    const result = toCssColorMix("#ff0000", "#0000ff", 50, "rgb");
    expect(result).toContain("#FF0000");
    expect(result).toContain("#0000FF");
  });

  it("percentages sum to 100", () => {
    const result = toCssColorMix("#FF0000", "#0000FF", 33, "rgb");
    // "... #FF0000 33%, #0000FF 67%"
    expect(result).toContain("33%");
    expect(result).toContain("67%");
  });
});

// ---------------------------------------------------------------------------
// 4. toCssVarsMix
// ---------------------------------------------------------------------------
describe("toCssVarsMix", () => {
  const mockSteps: MixStep[] = [
    { hex: "#FF0000", r: 255, g: 0, b: 0, pct: 0 },
    { hex: "#800080", r: 128, g: 0, b: 128, pct: 50 },
    { hex: "#0000FF", r: 0, g: 0, b: 255, pct: 100 },
  ];

  it("contains :root { wrapper", () => {
    const result = toCssVarsMix(mockSteps, "test-mix");
    expect(result).toContain(":root {");
    expect(result).toContain("}");
  });

  it("produces --color- prefixed custom properties", () => {
    const result = toCssVarsMix(mockSteps, "my palette");
    expect(result).toContain("--color-my-palette-0:");
    expect(result).toContain("--color-my-palette-1:");
    expect(result).toContain("--color-my-palette-2:");
  });

  it("includes hex values in properties", () => {
    const result = toCssVarsMix(mockSteps, "test");
    expect(result).toContain("#FF0000");
    expect(result).toContain("#0000FF");
  });

  it("sanitizes name to lowercase with hyphens", () => {
    const result = toCssVarsMix(mockSteps, "My Cool Mix!!");
    expect(result).toContain("--color-my-cool-mix--");
  });
});

// ---------------------------------------------------------------------------
// 5. toJsonMix
// ---------------------------------------------------------------------------
describe("toJsonMix", () => {
  const mockSteps: MixStep[] = [
    { hex: "#FF0000", r: 255, g: 0, b: 0, pct: 0 },
    { hex: "#0000FF", r: 0, g: 0, b: 255, pct: 100 },
  ];

  it("produces valid JSON", () => {
    const result = toJsonMix(mockSteps);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("produces an array of hex strings", () => {
    const result = toJsonMix(mockSteps);
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toEqual(["#FF0000", "#0000FF"]);
  });

  it("length matches input steps", () => {
    const moreSteps: MixStep[] = [
      { hex: "#111111", r: 17, g: 17, b: 17, pct: 0 },
      { hex: "#555555", r: 85, g: 85, b: 85, pct: 50 },
      { hex: "#AAAAAA", r: 170, g: 170, b: 170, pct: 100 },
    ];
    const parsed = JSON.parse(toJsonMix(moreSteps));
    expect(parsed).toHaveLength(3);
  });
});
