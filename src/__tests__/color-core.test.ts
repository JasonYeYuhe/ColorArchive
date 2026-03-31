import { describe, it, expect } from "vitest";
import {
  hslToRgb,
  rgbToHex,
  hexToRgb,
  rgbToHsb,
  rgbToCmyk,
} from "@/src/lib/color-convert";
import { getWcagContrast, getContrastRatio } from "@/src/lib/color-contrast";
import type { ColorRecord } from "@/src/types/color";
import { colors } from "@/src/data/colors";

// ---------------------------------------------------------------------------
// 1. hslToRgb
// ---------------------------------------------------------------------------
describe("hslToRgb", () => {
  it("converts pure red (0, 100, 50)", () => {
    const { r, g, b } = hslToRgb(0, 100, 50);
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it("converts pure green (120, 100, 50)", () => {
    const { r, g, b } = hslToRgb(120, 100, 50);
    expect(r).toBe(0);
    expect(g).toBe(255);
    expect(b).toBe(0);
  });

  it("converts pure blue (240, 100, 50)", () => {
    const { r, g, b } = hslToRgb(240, 100, 50);
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(255);
  });

  it("converts white (0, 0, 100)", () => {
    const { r, g, b } = hslToRgb(0, 0, 100);
    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(255);
  });

  it("converts black (0, 0, 0)", () => {
    const { r, g, b } = hslToRgb(0, 0, 0);
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it("converts 50% gray (0, 0, 50)", () => {
    const { r, g, b } = hslToRgb(0, 0, 50);
    expect(r).toBe(128);
    expect(g).toBe(128);
    expect(b).toBe(128);
  });
});

// ---------------------------------------------------------------------------
// 2. rgbToHex
// ---------------------------------------------------------------------------
describe("rgbToHex", () => {
  it("converts black to #000000", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
  });

  it("converts white to #FFFFFF", () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#FFFFFF");
  });

  it("converts pure red to #FF0000", () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#FF0000");
  });

  it("converts a mid-range color correctly", () => {
    expect(rgbToHex({ r: 18, g: 52, b: 86 })).toBe("#123456");
  });

  it("pads single-digit hex values with leading zero", () => {
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe("#010203");
  });
});

// ---------------------------------------------------------------------------
// 3. hexToRgb
// ---------------------------------------------------------------------------
describe("hexToRgb", () => {
  it("parses 6-char hex with # prefix", () => {
    const result = hexToRgb("#FF8800");
    expect(result).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("parses 6-char hex without # prefix", () => {
    const result = hexToRgb("FF8800");
    expect(result).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("parses 3-char shorthand hex with # prefix", () => {
    const result = hexToRgb("#F80");
    expect(result).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("parses 3-char shorthand hex without # prefix", () => {
    const result = hexToRgb("F80");
    expect(result).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("handles lowercase hex", () => {
    const result = hexToRgb("#ff0000");
    expect(result).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("returns null for invalid hex string", () => {
    expect(hexToRgb("ZZZZZZ")).toBeNull();
    expect(hexToRgb("#GG0000")).toBeNull();
    expect(hexToRgb("")).toBeNull();
  });

  it("parses black and white", () => {
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
  });
});

// ---------------------------------------------------------------------------
// 4. rgbToHsb
// ---------------------------------------------------------------------------
describe("rgbToHsb", () => {
  it("converts pure red", () => {
    const hsb = rgbToHsb(255, 0, 0);
    expect(hsb.h).toBe(0);
    expect(hsb.s).toBe(100);
    expect(hsb.b).toBe(100);
  });

  it("converts pure green", () => {
    const hsb = rgbToHsb(0, 255, 0);
    expect(hsb.h).toBe(120);
    expect(hsb.s).toBe(100);
    expect(hsb.b).toBe(100);
  });

  it("converts pure blue", () => {
    const hsb = rgbToHsb(0, 0, 255);
    expect(hsb.h).toBe(240);
    expect(hsb.s).toBe(100);
    expect(hsb.b).toBe(100);
  });

  it("converts black to zero brightness", () => {
    const hsb = rgbToHsb(0, 0, 0);
    expect(hsb.s).toBe(0);
    expect(hsb.b).toBe(0);
  });

  it("converts white to zero saturation, full brightness", () => {
    const hsb = rgbToHsb(255, 255, 255);
    expect(hsb.s).toBe(0);
    expect(hsb.b).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// 5. rgbToCmyk
// ---------------------------------------------------------------------------
describe("rgbToCmyk", () => {
  it("converts pure red", () => {
    const cmyk = rgbToCmyk(255, 0, 0);
    expect(cmyk).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });

  it("converts pure green", () => {
    const cmyk = rgbToCmyk(0, 255, 0);
    expect(cmyk).toEqual({ c: 100, m: 0, y: 100, k: 0 });
  });

  it("converts pure blue", () => {
    const cmyk = rgbToCmyk(0, 0, 255);
    expect(cmyk).toEqual({ c: 100, m: 100, y: 0, k: 0 });
  });

  it("converts black to 100% key", () => {
    const cmyk = rgbToCmyk(0, 0, 0);
    expect(cmyk).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });

  it("converts white to all zeros", () => {
    const cmyk = rgbToCmyk(255, 255, 255);
    expect(cmyk).toEqual({ c: 0, m: 0, y: 0, k: 0 });
  });
});

// ---------------------------------------------------------------------------
// 6. WCAG contrast
// ---------------------------------------------------------------------------
describe("WCAG contrast", () => {
  describe("getWcagContrast", () => {
    it("returns ~21:1 contrast for black vs white", () => {
      // Black (lightness 0) vs white background
      const data = getWcagContrast(0, 0, 0);
      expect(data.vsWhite).toBe(21);
      expect(data.vsBlack).toBe(1);
    });

    it("returns ~1:1 contrast for white vs white", () => {
      const data = getWcagContrast(0, 0, 100);
      expect(data.vsWhite).toBe(1);
      expect(data.vsBlack).toBe(21);
    });

    it("assigns AA grade for high contrast", () => {
      const data = getWcagContrast(0, 0, 0); // black
      expect(data.whiteGrade).toBe("AA");
    });

    it("assigns Fail grade for same-color contrast", () => {
      const data = getWcagContrast(0, 0, 100); // white vs white
      expect(data.whiteGrade).toBe("Fail");
    });
  });

  describe("getContrastRatio", () => {
    const makeColor = (hue: number, saturation: number, lightness: number): ColorRecord => ({
      id: "test",
      name: "Test",
      hex: "#000000",
      rgb: "rgb(0,0,0)",
      hsl: "hsl(0,0%,0%)",
      hue,
      saturation,
      lightness,
      family: "Red",
    });

    it("returns 21 for black vs white", () => {
      const black = makeColor(0, 0, 0);
      const white = makeColor(0, 0, 100);
      expect(getContrastRatio(black, white)).toBe(21);
    });

    it("returns 1 for same color vs itself", () => {
      const color = makeColor(0, 100, 50);
      expect(getContrastRatio(color, color)).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// 7. Color ID validation
// ---------------------------------------------------------------------------
describe("Color ID validation", () => {
  const CHROMATIC_ROOTS = [
    "crimson", "scarlet", "ruby", "vermillion", "ember", "tangerine",
    "coral", "apricot", "saffron", "amber", "canary", "citrine",
    "honey", "chartreuse", "olive", "lime", "moss", "leaf",
    "clover", "emerald", "mint", "seafoam", "celadon", "jade",
    "teal", "lagoon", "cyan", "aqua", "cerulean", "azure",
    "steel", "sapphire", "cobalt", "indigo", "iris", "amethyst",
    "violet", "orchid", "plum", "mulberry", "magenta", "fuchsia",
    "mauve", "peony", "rose", "blush", "garnet", "merlot",
  ];

  const NEUTRAL_ROOTS = ["warm-gray", "taupe-gray", "true-gray", "sage-gray", "cool-gray"];

  const LIGHTNESS_BANDS = [
    "veil", "whisper", "mist", "pearl", "bloom", "silk", "tone",
    "radiant", "core", "velvet", "dusk", "shadow", "nocturne", "ink",
  ];

  const CHROMA_BANDS = ["faint", "muted", "dust", "soft", "clear", "vivid", "bright", "pure"];

  it("generates exactly 5446 colors", () => {
    expect(colors).toHaveLength(5446);
  });

  it("generates 5376 chromatic colors", () => {
    const chromatic = colors.filter(
      (c) => !NEUTRAL_ROOTS.some((root) => c.id.startsWith(root)),
    );
    expect(chromatic).toHaveLength(5376);
  });

  it("generates 70 neutral colors", () => {
    const neutrals = colors.filter((c) =>
      NEUTRAL_ROOTS.some((root) => c.id.startsWith(root)),
    );
    expect(neutrals).toHaveLength(70);
  });

  it("all chromatic IDs match {root}-{lightness}-{chroma} pattern", () => {
    const chromatic = colors.filter(
      (c) => !NEUTRAL_ROOTS.some((root) => c.id.startsWith(root)),
    );
    for (const color of chromatic) {
      const parts = color.id.split("-");
      expect(parts).toHaveLength(3);
      const [root, light, chroma] = parts;
      expect(CHROMATIC_ROOTS).toContain(root);
      expect(LIGHTNESS_BANDS).toContain(light);
      expect(CHROMA_BANDS).toContain(chroma);
    }
  });

  it("all neutral IDs match {root}-{lightness} with no chroma suffix", () => {
    const neutrals = colors.filter((c) =>
      NEUTRAL_ROOTS.some((root) => c.id.startsWith(root)),
    );
    for (const color of neutrals) {
      // Neutral IDs: "warm-gray-whisper", "cool-gray-shadow", "true-gray-tone", etc.
      // The root itself contains a hyphen, so split and validate accordingly
      const match = color.id.match(/^(?:warm|taupe|true|sage|cool)-gray-(\w+)$/);
      expect(match).not.toBeNull();
      const lightnessLabel = match![1];
      expect(LIGHTNESS_BANDS).toContain(lightnessLabel);
      // Ensure no chroma band appears as a fourth segment
      expect(CHROMA_BANDS).not.toContain(lightnessLabel);
    }
  });

  it("all color IDs are unique", () => {
    const ids = colors.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every color has a valid hex value", () => {
    for (const color of colors) {
      expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it("spot-check known color IDs exist", () => {
    const ids = new Set(colors.map((c) => c.id));
    expect(ids.has("amber-pearl-muted")).toBe(true);
    expect(ids.has("cobalt-shadow-vivid")).toBe(true);
    expect(ids.has("emerald-bloom-clear")).toBe(true);
    expect(ids.has("warm-gray-whisper")).toBe(true);
    expect(ids.has("cool-gray-shadow")).toBe(true);
    expect(ids.has("true-gray-tone")).toBe(true);
  });
});
