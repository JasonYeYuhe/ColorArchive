import { describe, it, expect } from "vitest";
import { generateColorName } from "@/src/lib/color-naming";

const EXPECTED_ROLES = [
  "background-subtle",
  "surface-elevated",
  "background-muted",
  "border-light",
  "surface-default",
  "background-tinted",
  "accent-primary",
  "interactive-default",
  "surface-active",
  "text-secondary",
  "icon-default",
  "text-primary",
  "icon-strong",
  "text-inverse-bg",
  "background-inverse",
];

// ---------------------------------------------------------------------------
// 1. Return shape
// ---------------------------------------------------------------------------
describe("generateColorName return shape", () => {
  it("returns object with all expected fields", () => {
    const result = generateColorName("#3B82F6");
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("hex");
    expect(result).toHaveProperty("poeticName");
    expect(result).toHaveProperty("alternateNames");
    expect(result).toHaveProperty("cssVar");
    expect(result).toHaveProperty("tailwindName");
    expect(result).toHaveProperty("sassVar");
    expect(result).toHaveProperty("semanticRole");
    expect(result).toHaveProperty("moods");
    expect(result).toHaveProperty("family");
    expect(result).toHaveProperty("hsl");
    expect(result).toHaveProperty("contrastWhite");
    expect(result).toHaveProperty("contrastBlack");
    expect(result).toHaveProperty("textOnColor");
    expect(result).toHaveProperty("tailwindStep");
  });

  it("alternateNames is a non-empty array", () => {
    const result = generateColorName("#3B82F6")!;
    expect(Array.isArray(result.alternateNames)).toBe(true);
    expect(result.alternateNames.length).toBeGreaterThan(0);
  });

  it("moods is a non-empty array of strings", () => {
    const result = generateColorName("#3B82F6")!;
    expect(Array.isArray(result.moods)).toBe(true);
    expect(result.moods.length).toBeGreaterThan(0);
    for (const mood of result.moods) {
      expect(typeof mood).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Determinism
// ---------------------------------------------------------------------------
describe("generateColorName determinism", () => {
  it("same hex always produces the same result", () => {
    const a = generateColorName("#FF5733");
    const b = generateColorName("#FF5733");
    expect(a).toEqual(b);
  });

  it("same hex with and without # prefix gives same poeticName", () => {
    const a = generateColorName("#FF5733");
    const b = generateColorName("FF5733");
    expect(a!.poeticName).toBe(b!.poeticName);
  });

  it("case insensitive hex produces same result", () => {
    const a = generateColorName("#ff5733");
    const b = generateColorName("#FF5733");
    expect(a!.poeticName).toBe(b!.poeticName);
  });
});

// ---------------------------------------------------------------------------
// 3. Different hues produce different names
// ---------------------------------------------------------------------------
describe("generateColorName hue differentiation", () => {
  it("different hues produce different poetic names", () => {
    const red = generateColorName("#FF0000")!;
    const blue = generateColorName("#0000FF")!;
    const green = generateColorName("#00FF00")!;
    // Different hue families should produce different names
    expect(red.family).not.toBe(blue.family);
    expect(red.family).not.toBe(green.family);
    expect(red.poeticName).not.toBe(blue.poeticName);
  });

  it("red maps to red family", () => {
    const result = generateColorName("#FF0000")!;
    expect(result.family).toBe("red");
  });

  it("blue maps to blue family", () => {
    const result = generateColorName("#0000FF")!;
    expect(result.family).toBe("blue");
  });

  it("green maps to green family", () => {
    const result = generateColorName("#00AA00")!;
    expect(result.family).toBe("green");
  });
});

// ---------------------------------------------------------------------------
// 4. CSS token format
// ---------------------------------------------------------------------------
describe("generateColorName token formats", () => {
  it("cssVar is a valid CSS custom property format", () => {
    const result = generateColorName("#3B82F6")!;
    expect(result.cssVar).toMatch(/^--color-[a-z]+-[a-z0-9]+$/);
  });

  it("tailwindName is lowercase with hyphen", () => {
    const result = generateColorName("#3B82F6")!;
    expect(result.tailwindName).toMatch(/^[a-z]+-\d+$/);
  });

  it("sassVar starts with $ and matches CSS variable pattern", () => {
    const result = generateColorName("#3B82F6")!;
    expect(result.sassVar).toMatch(/^\$color-[a-z]+-[a-z0-9]+$/);
  });
});

// ---------------------------------------------------------------------------
// 5. Semantic role
// ---------------------------------------------------------------------------
describe("generateColorName semantic role", () => {
  it("role is one of expected semantic roles", () => {
    const result = generateColorName("#3B82F6")!;
    expect(EXPECTED_ROLES).toContain(result.semanticRole);
  });

  it("very light color gets background role", () => {
    const result = generateColorName("#F8F8F8")!;
    expect(result.semanticRole).toMatch(/background/);
  });

  it("very dark color gets text role", () => {
    const result = generateColorName("#111111")!;
    expect(result.semanticRole).toMatch(/text|background-inverse/);
  });
});

// ---------------------------------------------------------------------------
// 6. Edge cases
// ---------------------------------------------------------------------------
describe("generateColorName edge cases", () => {
  it("handles pure white (#FFFFFF)", () => {
    const result = generateColorName("#FFFFFF");
    expect(result).not.toBeNull();
    expect(result!.family).toBe("neutral");
    expect(result!.hsl.l).toBeGreaterThanOrEqual(95);
  });

  it("handles pure black (#000000)", () => {
    const result = generateColorName("#000000");
    expect(result).not.toBeNull();
    expect(result!.family).toBe("neutral");
    expect(result!.hsl.l).toBeLessThanOrEqual(5);
  });

  it("returns null for invalid hex (too short)", () => {
    expect(generateColorName("#FFF")).toBeNull();
  });

  it("returns null for invalid hex (non-hex chars)", () => {
    expect(generateColorName("#GGGGGG")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(generateColorName("")).toBeNull();
  });

  it("hex in result is uppercased with # prefix", () => {
    const result = generateColorName("ff5733")!;
    expect(result.hex).toBe("#FF5733");
  });

  it("textOnColor is either white or dark", () => {
    const result = generateColorName("#3B82F6")!;
    expect(["#ffffff", "#1a1a1a"]).toContain(result.textOnColor);
  });

  it("contrast values are positive numbers", () => {
    const result = generateColorName("#3B82F6")!;
    expect(result.contrastWhite).toBeGreaterThan(0);
    expect(result.contrastBlack).toBeGreaterThan(0);
  });
});
