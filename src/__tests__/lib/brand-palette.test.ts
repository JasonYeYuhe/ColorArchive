import { describe, it, expect } from "vitest";
import {
  generateColorScale,
  generateNeutralScale,
  generateSemanticColors,
  generateBrandPalette,
  buildBrandCssVariables,
  buildBrandTailwindConfig,
  buildBrandFigmaTokens,
  buildBrandStyleDictionary,
  hexContrastRatio,
  wcagLabel,
  SCALE_STEPS,
} from "@/src/lib/brand-palette";

const VALID_HEX = "#3B82F6"; // Tailwind blue-500
const VALID_HEX_NO_HASH = "3B82F6";
const INVALID_HEX = "ZZZZZZ";
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// ---------------------------------------------------------------------------
// 1. generateColorScale
// ---------------------------------------------------------------------------
describe("generateColorScale", () => {
  it("returns 11 colors for valid hex", () => {
    const scale = generateColorScale(VALID_HEX);
    expect(scale).not.toBeNull();
    expect(scale!.colors).toHaveLength(11);
  });

  it("returns null for invalid hex", () => {
    expect(generateColorScale(INVALID_HEX)).toBeNull();
  });

  it("all hex values are valid 7-char hex strings", () => {
    const scale = generateColorScale(VALID_HEX)!;
    for (const color of scale.colors) {
      expect(color.hex).toMatch(HEX_RE);
    }
  });

  it("lightness decreases through the scale", () => {
    const scale = generateColorScale(VALID_HEX)!;
    for (let i = 1; i < scale.colors.length; i++) {
      expect(scale.colors[i].lightness).toBeLessThan(scale.colors[i - 1].lightness);
    }
  });

  it("step values match SCALE_STEPS", () => {
    const scale = generateColorScale(VALID_HEX)!;
    const steps = scale.colors.map((c) => c.step);
    expect(steps).toEqual([...SCALE_STEPS]);
  });

  it("each color includes a valid hsl string", () => {
    const scale = generateColorScale(VALID_HEX)!;
    for (const color of scale.colors) {
      expect(color.hsl).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    }
  });

  it("label is Primary", () => {
    const scale = generateColorScale(VALID_HEX)!;
    expect(scale.label).toBe("Primary");
  });
});

// ---------------------------------------------------------------------------
// 2. generateNeutralScale
// ---------------------------------------------------------------------------
describe("generateNeutralScale", () => {
  it("returns 11 colors for valid hex", () => {
    const scale = generateNeutralScale(VALID_HEX);
    expect(scale).not.toBeNull();
    expect(scale!.colors).toHaveLength(11);
  });

  it("returns null for invalid hex", () => {
    expect(generateNeutralScale(INVALID_HEX)).toBeNull();
  });

  it("label is Neutral", () => {
    const scale = generateNeutralScale(VALID_HEX)!;
    expect(scale.label).toBe("Neutral");
  });

  it("all colors have low saturation (neutral tint)", () => {
    const scale = generateNeutralScale(VALID_HEX)!;
    // Neutral scale uses baseSat of 7, with multipliers <= 1.0
    // so resulting saturation in the hsl string should be low
    for (const color of scale.colors) {
      const satMatch = color.hsl.match(/hsl\(\d+, (\d+)%, \d+%\)/);
      expect(satMatch).not.toBeNull();
      const saturation = parseInt(satMatch![1], 10);
      expect(saturation).toBeLessThanOrEqual(10);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. generateSemanticColors
// ---------------------------------------------------------------------------
describe("generateSemanticColors", () => {
  it("returns 4 colors for valid hex", () => {
    const semantics = generateSemanticColors(VALID_HEX);
    expect(semantics).not.toBeNull();
    expect(semantics).toHaveLength(4);
  });

  it("returns null for invalid hex", () => {
    expect(generateSemanticColors(INVALID_HEX)).toBeNull();
  });

  it("returns the four expected roles", () => {
    const semantics = generateSemanticColors(VALID_HEX)!;
    const roles = semantics.map((s) => s.role);
    expect(roles).toContain("success");
    expect(roles).toContain("warning");
    expect(roles).toContain("error");
    expect(roles).toContain("info");
  });

  it("all hex values are valid", () => {
    const semantics = generateSemanticColors(VALID_HEX)!;
    for (const sem of semantics) {
      expect(sem.hex).toMatch(HEX_RE);
    }
  });

  it("all entries have labels", () => {
    const semantics = generateSemanticColors(VALID_HEX)!;
    for (const sem of semantics) {
      expect(sem.label.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. generateBrandPalette
// ---------------------------------------------------------------------------
describe("generateBrandPalette", () => {
  it("returns full palette structure for valid hex", () => {
    const palette = generateBrandPalette(VALID_HEX);
    expect(palette).not.toBeNull();
    expect(palette!.primary).toBeDefined();
    expect(palette!.neutral).toBeDefined();
    expect(palette!.semantics).toBeDefined();
    expect(palette!.inputHex).toBeDefined();
  });

  it("works with hex without # prefix", () => {
    const palette = generateBrandPalette(VALID_HEX_NO_HASH);
    expect(palette).not.toBeNull();
    expect(palette!.inputHex).toBe("#3B82F6");
  });

  it("returns null for invalid hex", () => {
    expect(generateBrandPalette(INVALID_HEX)).toBeNull();
  });

  it("inputHex is uppercased with # prefix", () => {
    const palette = generateBrandPalette("#3b82f6")!;
    expect(palette.inputHex).toBe("#3B82F6");
  });

  it("primary has 11 colors and neutral has 11 colors", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    expect(palette.primary.colors).toHaveLength(11);
    expect(palette.neutral.colors).toHaveLength(11);
  });

  it("semantics has 4 colors", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    expect(palette.semantics).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// 5. buildBrandCssVariables
// ---------------------------------------------------------------------------
describe("buildBrandCssVariables", () => {
  it("contains :root { and --color-primary- variables", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const css = buildBrandCssVariables(palette);
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primary-");
    expect(css).toContain("--color-neutral-");
  });

  it("contains semantic role variables", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const css = buildBrandCssVariables(palette);
    expect(css).toContain("--color-success:");
    expect(css).toContain("--color-warning:");
    expect(css).toContain("--color-error:");
    expect(css).toContain("--color-info:");
  });

  it("contains all 11 primary step keys", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const css = buildBrandCssVariables(palette);
    for (const step of SCALE_STEPS) {
      expect(css).toContain(`--color-primary-${step}:`);
    }
  });
});

// ---------------------------------------------------------------------------
// 6. buildBrandTailwindConfig
// ---------------------------------------------------------------------------
describe("buildBrandTailwindConfig", () => {
  it("contains module.exports and brand colors", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const config = buildBrandTailwindConfig(palette);
    expect(config).toContain("module.exports");
    expect(config).toContain("brand:");
    expect(config).toContain("neutral:");
  });

  it("includes semantic role keys", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const config = buildBrandTailwindConfig(palette);
    expect(config).toContain("success:");
    expect(config).toContain("warning:");
    expect(config).toContain("error:");
    expect(config).toContain("info:");
  });
});

// ---------------------------------------------------------------------------
// 7. buildBrandFigmaTokens
// ---------------------------------------------------------------------------
describe("buildBrandFigmaTokens", () => {
  it("produces valid JSON", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const json = buildBrandFigmaTokens(palette);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("contains $type and $value fields", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const parsed = JSON.parse(buildBrandFigmaTokens(palette));
    // Check the first brand token
    const firstKey = Object.keys(parsed.brand)[0];
    expect(parsed.brand[firstKey].$type).toBe("color");
    expect(parsed.brand[firstKey].$value).toMatch(HEX_RE);
  });

  it("has brand, neutral, and semantic top-level keys", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const parsed = JSON.parse(buildBrandFigmaTokens(palette));
    expect(parsed).toHaveProperty("brand");
    expect(parsed).toHaveProperty("neutral");
    expect(parsed).toHaveProperty("semantic");
  });
});

// ---------------------------------------------------------------------------
// 8. buildBrandStyleDictionary
// ---------------------------------------------------------------------------
describe("buildBrandStyleDictionary", () => {
  it("produces valid JSON", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const json = buildBrandStyleDictionary(palette);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("contains value and type fields", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const parsed = JSON.parse(buildBrandStyleDictionary(palette));
    const firstKey = Object.keys(parsed.color.brand)[0];
    expect(parsed.color.brand[firstKey].type).toBe("color");
    expect(parsed.color.brand[firstKey].value).toMatch(HEX_RE);
  });

  it("has color.brand, color.neutral, and color.semantic", () => {
    const palette = generateBrandPalette(VALID_HEX)!;
    const parsed = JSON.parse(buildBrandStyleDictionary(palette));
    expect(parsed.color).toHaveProperty("brand");
    expect(parsed.color).toHaveProperty("neutral");
    expect(parsed.color).toHaveProperty("semantic");
  });
});

// ---------------------------------------------------------------------------
// 9. hexContrastRatio
// ---------------------------------------------------------------------------
describe("hexContrastRatio", () => {
  it("returns 21 for black vs white", () => {
    expect(hexContrastRatio("#000000", "#FFFFFF")).toBe(21);
  });

  it("returns 1 for same color vs itself", () => {
    expect(hexContrastRatio("#3B82F6", "#3B82F6")).toBe(1);
  });

  it("is symmetric (order does not matter)", () => {
    const ab = hexContrastRatio("#FF0000", "#0000FF");
    const ba = hexContrastRatio("#0000FF", "#FF0000");
    expect(ab).toBe(ba);
  });

  it("returns a value between 1 and 21", () => {
    const ratio = hexContrastRatio("#336699", "#FFCC00");
    expect(ratio).toBeGreaterThanOrEqual(1);
    expect(ratio).toBeLessThanOrEqual(21);
  });
});

// ---------------------------------------------------------------------------
// 10. wcagLabel
// ---------------------------------------------------------------------------
describe("wcagLabel", () => {
  it("returns AAA for ratio >= 7", () => {
    expect(wcagLabel(7)).toBe("AAA");
    expect(wcagLabel(10)).toBe("AAA");
    expect(wcagLabel(21)).toBe("AAA");
  });

  it("returns AA for ratio >= 4.5 and < 7", () => {
    expect(wcagLabel(4.5)).toBe("AA");
    expect(wcagLabel(6.9)).toBe("AA");
  });

  it("returns AA Large for ratio >= 3 and < 4.5", () => {
    expect(wcagLabel(3)).toBe("AA Large");
    expect(wcagLabel(4.4)).toBe("AA Large");
  });

  it("returns Fail for ratio < 3", () => {
    expect(wcagLabel(2.9)).toBe("Fail");
    expect(wcagLabel(1)).toBe("Fail");
    expect(wcagLabel(0)).toBe("Fail");
  });
});
