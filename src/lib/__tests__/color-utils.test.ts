import { describe, it, expect } from "vitest";
import {
  hslToRgb,
  rgbToHsl,
  rgbToHex,
  hexToRgb,
  formatRgb,
  formatHsl,
  getColorFamily,
  getContrastRatio,
  getWcagContrast,
  getAnalogousColors,
  getComplementaryColor,
  getSplitComplementaryColors,
  getTriadicColors,
  filterColors,
  sortColors,
  getHueDistance,
  getColorDistance,
  getNearestColors,
  rgbToHsb,
  rgbToCmyk,
  findNearestArchiveColor,
  COLOR_FAMILIES,
} from "@/src/lib/color-utils";
import { colors } from "@/src/data/colors";
import type { ColorFamily, ColorRecord } from "@/src/types/color";

/* ------------------------------------------------------------------ */
/*  Helper: build a minimal ColorRecord for tests                      */
/* ------------------------------------------------------------------ */
function makeColor(overrides: Partial<ColorRecord> & { id: string }): ColorRecord {
  return {
    name: overrides.name ?? overrides.id,
    hex: overrides.hex ?? "#000000",
    rgb: overrides.rgb ?? "rgb(0, 0, 0)",
    hsl: overrides.hsl ?? "hsl(0, 0%, 0%)",
    hue: overrides.hue ?? 0,
    saturation: overrides.saturation ?? 0,
    lightness: overrides.lightness ?? 0,
    family: overrides.family ?? "Red",
    ...overrides,
  };
}

/* ================================================================== */
/*  hslToRgb / rgbToHsl — round-trip tests                            */
/* ================================================================== */

describe("hslToRgb", () => {
  it("converts pure red", () => {
    const rgb = hslToRgb(0, 100, 50);
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("converts pure green", () => {
    const rgb = hslToRgb(120, 100, 50);
    expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("converts pure blue", () => {
    const rgb = hslToRgb(240, 100, 50);
    expect(rgb).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("converts white (lightness 100)", () => {
    const rgb = hslToRgb(0, 0, 100);
    expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts black (lightness 0)", () => {
    const rgb = hslToRgb(0, 0, 0);
    expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts grey (saturation 0)", () => {
    const rgb = hslToRgb(180, 0, 50);
    expect(rgb).toEqual({ r: 128, g: 128, b: 128 });
  });
});

describe("rgbToHsl", () => {
  it("converts pure red", () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("converts pure green", () => {
    expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 });
  });

  it("converts pure blue", () => {
    expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 });
  });

  it("converts white", () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
  });

  it("converts black", () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
  });
});

describe("hslToRgb / rgbToHsl round-trip", () => {
  const testCases: [number, number, number][] = [
    [0, 100, 50],
    [120, 100, 50],
    [240, 100, 50],
    [60, 80, 40],
    [300, 60, 70],
    [180, 50, 25],
    [0, 0, 50],   // grey
    [0, 0, 0],    // black
    [0, 0, 100],  // white
    [210, 75, 55],
  ];

  for (const [h, s, l] of testCases) {
    it(`round-trips HSL(${h}, ${s}%, ${l}%)`, () => {
      const rgb = hslToRgb(h, s, l);
      const back = rgbToHsl(rgb.r, rgb.g, rgb.b);
      // Rounding tolerance of 1 for each component
      expect(back.h).toBeCloseTo(h, -0.5);
      expect(back.s).toBeCloseTo(s, -0.5);
      expect(back.l).toBeCloseTo(l, -0.5);
    });
  }
});

/* ================================================================== */
/*  rgbToHex / hexToRgb — known value pairs                           */
/* ================================================================== */

describe("rgbToHex", () => {
  it("converts red to #FF0000", () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#FF0000");
  });

  it("converts green to #00FF00", () => {
    expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe("#00FF00");
  });

  it("converts blue to #0000FF", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe("#0000FF");
  });

  it("converts white to #FFFFFF", () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#FFFFFF");
  });

  it("converts black to #000000", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
  });

  it("pads single-digit hex values", () => {
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe("#010203");
  });
});

describe("hexToRgb", () => {
  it("parses 6-char hex with hash", () => {
    expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses 6-char hex without hash", () => {
    expect(hexToRgb("00FF00")).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("parses 3-char shorthand with hash", () => {
    expect(hexToRgb("#F00")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses 3-char shorthand without hash", () => {
    expect(hexToRgb("0F0")).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("is case-insensitive", () => {
    expect(hexToRgb("#ff8800")).toEqual(hexToRgb("#FF8800"));
  });

  it("returns null for invalid hex", () => {
    expect(hexToRgb("ZZZZZZ")).toBeNull();
    expect(hexToRgb("#GG0000")).toBeNull();
    expect(hexToRgb("")).toBeNull();
    expect(hexToRgb("#12345")).toBeNull();
  });
});

describe("rgbToHex / hexToRgb round-trip", () => {
  const pairs: [string, { r: number; g: number; b: number }][] = [
    ["#FF0000", { r: 255, g: 0, b: 0 }],
    ["#00FF00", { r: 0, g: 255, b: 0 }],
    ["#0000FF", { r: 0, g: 0, b: 255 }],
    ["#FFFFFF", { r: 255, g: 255, b: 255 }],
    ["#000000", { r: 0, g: 0, b: 0 }],
    ["#8B4513", { r: 139, g: 69, b: 19 }],
  ];

  for (const [hex, rgb] of pairs) {
    it(`round-trips ${hex}`, () => {
      expect(rgbToHex(hexToRgb(hex)!)).toBe(hex);
      expect(hexToRgb(rgbToHex(rgb))).toEqual(rgb);
    });
  }
});

/* ================================================================== */
/*  formatRgb / formatHsl                                              */
/* ================================================================== */

describe("formatRgb", () => {
  it("formats correctly", () => {
    expect(formatRgb({ r: 255, g: 128, b: 0 })).toBe("rgb(255, 128, 0)");
  });
});

describe("formatHsl", () => {
  it("formats correctly", () => {
    expect(formatHsl(210, 50, 60)).toBe("hsl(210, 50%, 60%)");
  });
});

/* ================================================================== */
/*  getColorFamily — boundary values                                   */
/* ================================================================== */

describe("getColorFamily", () => {
  const expectations: [number, ColorFamily][] = [
    [0, "Red"],
    [14, "Red"],
    [15, "Orange"],
    [30, "Orange"],
    [44, "Orange"],
    [45, "Yellow"],
    [60, "Yellow"],
    [69, "Yellow"],
    [70, "Lime"],
    [90, "Lime"],
    [94, "Lime"],
    [95, "Green"],
    [120, "Green"],
    [149, "Green"],
    [150, "Teal"],
    [170, "Teal"],
    [184, "Teal"],
    [185, "Blue"],
    [210, "Blue"],
    [249, "Blue"],
    [250, "Purple"],
    [270, "Purple"],
    [289, "Purple"],
    [290, "Pink"],
    [320, "Pink"],
    [344, "Pink"],
    [345, "Red"],
    [350, "Red"],
    [359, "Red"],
  ];

  for (const [hue, expected] of expectations) {
    it(`hue ${hue} => ${expected}`, () => {
      expect(getColorFamily(hue)).toBe(expected);
    });
  }
});

describe("COLOR_FAMILIES", () => {
  it("contains all 9 families", () => {
    expect(COLOR_FAMILIES).toHaveLength(9);
    expect(COLOR_FAMILIES).toContain("Red");
    expect(COLOR_FAMILIES).toContain("Blue");
    expect(COLOR_FAMILIES).toContain("Pink");
  });
});

/* ================================================================== */
/*  WCAG contrast — getContrastRatio, getWcagContrast                  */
/* ================================================================== */

describe("getContrastRatio", () => {
  it("returns 21 for black vs white", () => {
    const black = makeColor({ id: "black", hue: 0, saturation: 0, lightness: 0 });
    const white = makeColor({ id: "white", hue: 0, saturation: 0, lightness: 100 });
    expect(getContrastRatio(black, white)).toBe(21);
  });

  it("returns 1 for same color", () => {
    const color = makeColor({ id: "a", hue: 0, saturation: 100, lightness: 50 });
    expect(getContrastRatio(color, color)).toBe(1);
  });

  it("is symmetric (order does not matter)", () => {
    const a = makeColor({ id: "a", hue: 0, saturation: 100, lightness: 50 });
    const b = makeColor({ id: "b", hue: 200, saturation: 80, lightness: 70 });
    expect(getContrastRatio(a, b)).toBe(getContrastRatio(b, a));
  });

  it("returns a value >= 1 for any pair", () => {
    const a = makeColor({ id: "a", hue: 120, saturation: 60, lightness: 30 });
    const b = makeColor({ id: "b", hue: 60, saturation: 90, lightness: 80 });
    expect(getContrastRatio(a, b)).toBeGreaterThanOrEqual(1);
  });
});

describe("getWcagContrast", () => {
  it("black has high contrast vs white, low vs black", () => {
    const result = getWcagContrast(0, 0, 0);
    expect(result.vsWhite).toBe(21);
    expect(result.vsBlack).toBe(1);
    expect(result.whiteGrade).toBe("AA");
    expect(result.blackGrade).toBe("Fail");
  });

  it("white has low contrast vs white, high vs black", () => {
    const result = getWcagContrast(0, 0, 100);
    expect(result.vsWhite).toBe(1);
    expect(result.vsBlack).toBe(21);
    expect(result.whiteGrade).toBe("Fail");
    expect(result.blackGrade).toBe("AA");
  });

  it("AA grade requires ratio >= 4.5", () => {
    // A mid-tone color: check that grades align with thresholds
    const result = getWcagContrast(0, 100, 50); // pure red
    // Pure red on white has moderate contrast; on black as well
    expect(["AA", "AA Large", "Fail"]).toContain(result.whiteGrade);
    expect(["AA", "AA Large", "Fail"]).toContain(result.blackGrade);
    // Verify grade matches ratio
    if (result.vsWhite >= 4.5) expect(result.whiteGrade).toBe("AA");
    else if (result.vsWhite >= 3) expect(result.whiteGrade).toBe("AA Large");
    else expect(result.whiteGrade).toBe("Fail");
  });
});

/* ================================================================== */
/*  Color conversion extras: rgbToHsb, rgbToCmyk                      */
/* ================================================================== */

describe("rgbToHsb", () => {
  it("converts pure red", () => {
    expect(rgbToHsb(255, 0, 0)).toEqual({ h: 0, s: 100, b: 100 });
  });

  it("converts black", () => {
    expect(rgbToHsb(0, 0, 0)).toEqual({ h: 0, s: 0, b: 0 });
  });

  it("converts white", () => {
    expect(rgbToHsb(255, 255, 255)).toEqual({ h: 0, s: 0, b: 100 });
  });
});

describe("rgbToCmyk", () => {
  it("converts pure red", () => {
    expect(rgbToCmyk(255, 0, 0)).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });

  it("converts black", () => {
    expect(rgbToCmyk(0, 0, 0)).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });

  it("converts white", () => {
    expect(rgbToCmyk(255, 255, 255)).toEqual({ c: 0, m: 0, y: 0, k: 0 });
  });
});

/* ================================================================== */
/*  getHueDistance                                                      */
/* ================================================================== */

describe("getHueDistance", () => {
  it("returns 0 for same hue", () => {
    expect(getHueDistance(120, 120)).toBe(0);
  });

  it("handles simple difference", () => {
    expect(getHueDistance(0, 90)).toBe(90);
  });

  it("takes shortest path around the circle", () => {
    expect(getHueDistance(10, 350)).toBe(20);
    expect(getHueDistance(350, 10)).toBe(20);
  });

  it("returns 180 for opposite hues", () => {
    expect(getHueDistance(0, 180)).toBe(180);
  });
});

/* ================================================================== */
/*  Color relationships (use real colors dataset)                      */
/* ================================================================== */

describe("getComplementaryColor", () => {
  it("returns a color roughly opposite in hue", () => {
    const base = colors.find((c) => c.hue === 0 && c.saturation > 50)!;
    const comp = getComplementaryColor(colors, base);
    expect(comp).not.toBeNull();
    // Complement should be near hue 180
    const hueDist = getHueDistance(comp!.hue, 180);
    expect(hueDist).toBeLessThan(60); // within a reasonable range given discrete palette
  });

  it("does not return the base color itself", () => {
    const base = colors[0];
    const comp = getComplementaryColor(colors, base);
    expect(comp?.id).not.toBe(base.id);
  });
});

describe("getAnalogousColors", () => {
  it("returns 2 colors by default", () => {
    const base = colors[0];
    const analogous = getAnalogousColors(colors, base);
    expect(analogous).toHaveLength(2);
  });

  it("returns colors near +24 and -24 hue offsets", () => {
    const base = colors.find((c) => c.hue === 120 && c.saturation > 50)!;
    const analogous = getAnalogousColors(colors, base);
    for (const a of analogous) {
      expect(a.id).not.toBe(base.id);
    }
    // At least one should be within ~40 degrees of 144 or 96
    const targetA = (base.hue + 24) % 360;
    const targetB = (base.hue + 336) % 360;
    const hueDistances = analogous.map((a) =>
      Math.min(getHueDistance(a.hue, targetA), getHueDistance(a.hue, targetB))
    );
    for (const dist of hueDistances) {
      expect(dist).toBeLessThan(50);
    }
  });

  it("respects custom limit", () => {
    const base = colors[0];
    const analogous = getAnalogousColors(colors, base, 1);
    expect(analogous).toHaveLength(1);
  });
});

describe("getSplitComplementaryColors", () => {
  it("returns 2 colors", () => {
    const base = colors[0];
    const result = getSplitComplementaryColors(colors, base);
    expect(result).toHaveLength(2);
  });

  it("excludes base color", () => {
    const base = colors[0];
    const result = getSplitComplementaryColors(colors, base);
    for (const c of result) {
      expect(c.id).not.toBe(base.id);
    }
  });
});

describe("getTriadicColors", () => {
  it("returns 2 colors", () => {
    const base = colors[0];
    const result = getTriadicColors(colors, base);
    expect(result).toHaveLength(2);
  });

  it("targets hues at +120 and +240 from base", () => {
    const base = colors.find((c) => c.hue === 0 && c.saturation > 50)!;
    const triadic = getTriadicColors(colors, base);
    // One should be near hue 120, the other near 240
    const distTo120 = triadic.map((c) => getHueDistance(c.hue, 120));
    const distTo240 = triadic.map((c) => getHueDistance(c.hue, 240));
    expect(Math.min(...distTo120)).toBeLessThan(50);
    expect(Math.min(...distTo240)).toBeLessThan(50);
  });
});

describe("getNearestColors", () => {
  it("returns the requested number of colors", () => {
    const base = colors[0];
    const nearest = getNearestColors(colors, base, 4);
    expect(nearest).toHaveLength(4);
  });

  it("excludes the base color", () => {
    const base = colors[0];
    const nearest = getNearestColors(colors, base, 6);
    expect(nearest.every((c) => c.id !== base.id)).toBe(true);
  });
});

/* ================================================================== */
/*  findNearestArchiveColor                                            */
/* ================================================================== */

describe("findNearestArchiveColor", () => {
  it("returns exact match for a color in the archive", () => {
    const target = colors[0];
    const found = findNearestArchiveColor(colors, target.hex);
    expect(found).not.toBeNull();
    // Should return the same color or one very close
    expect(found!.hex).toBe(target.hex);
  });

  it("returns null for invalid hex", () => {
    expect(findNearestArchiveColor(colors, "not-hex")).toBeNull();
  });
});

/* ================================================================== */
/*  filterColors                                                       */
/* ================================================================== */

describe("filterColors", () => {
  it("returns all colors when query is empty and family is All", () => {
    const result = filterColors(colors, "", "All");
    expect(result).toHaveLength(colors.length);
  });

  it("filters by family when query is empty", () => {
    const result = filterColors(colors, "", "Blue");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.family === "Blue")).toBe(true);
  });

  it("filters by name substring", () => {
    const result = filterColors(colors, "Crimson", "All");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.name.toLowerCase().includes("crimson"))).toBe(true);
  });

  it("filters by hex substring", () => {
    const target = colors[0];
    const hexFragment = target.hex.slice(1, 4).toLowerCase();
    const result = filterColors(colors, hexFragment, "All");
    expect(result.length).toBeGreaterThan(0);
  });

  it("combines family filter with search query", () => {
    // Search within a specific family
    const allRed = filterColors(colors, "", "Red");
    const filtered = filterColors(colors, "crimson", "Red");
    expect(filtered.length).toBeLessThanOrEqual(allRed.length);
    expect(filtered.every((c) => c.family === "Red")).toBe(true);
  });

  it("returns empty array when no match", () => {
    const result = filterColors(colors, "xyznonexistent", "All");
    expect(result).toHaveLength(0);
  });

  it("uses semantic search aliases", () => {
    // "sunset" should match colors with names containing ember, coral, amber, etc.
    const result = filterColors(colors, "sunset", "All");
    expect(result.length).toBeGreaterThan(0);
  });

  it("is case-insensitive", () => {
    const lower = filterColors(colors, "azure", "All");
    const upper = filterColors(colors, "AZURE", "All");
    expect(lower).toEqual(upper);
  });
});

/* ================================================================== */
/*  sortColors                                                         */
/* ================================================================== */

describe("sortColors", () => {
  const subset = colors.slice(0, 50);

  it("sorts by hue ascending", () => {
    const sorted = sortColors(subset, "hue");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].hue).toBeGreaterThanOrEqual(sorted[i - 1].hue);
    }
  });

  it("sorts by lightness ascending", () => {
    const sorted = sortColors(subset, "lightness");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].lightness).toBeGreaterThanOrEqual(sorted[i - 1].lightness);
    }
  });

  it("sorts by name alphabetically", () => {
    const sorted = sortColors(subset, "name");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].name.localeCompare(sorted[i - 1].name)).toBeGreaterThanOrEqual(0);
    }
  });

  it("does not mutate the original array", () => {
    const original = [...subset];
    sortColors(subset, "hue");
    expect(subset).toEqual(original);
  });

  it("returns same length as input", () => {
    const sorted = sortColors(subset, "hue");
    expect(sorted).toHaveLength(subset.length);
  });
});

/* ================================================================== */
/*  getColorDistance                                                    */
/* ================================================================== */

describe("getColorDistance", () => {
  it("returns 0 for identical colors", () => {
    const c = makeColor({ id: "a", hue: 100, saturation: 50, lightness: 50 });
    expect(getColorDistance(c, c)).toBe(0);
  });

  it("weighs hue difference most heavily (1.8x)", () => {
    const base = makeColor({ id: "a", hue: 0, saturation: 50, lightness: 50 });
    const diffHue = makeColor({ id: "b", hue: 10, saturation: 50, lightness: 50 });
    const diffSat = makeColor({ id: "c", hue: 0, saturation: 60, lightness: 50 });
    // 10 hue * 1.8 = 18 vs 10 sat * 0.7 = 7
    expect(getColorDistance(base, diffHue)).toBeGreaterThan(getColorDistance(base, diffSat));
  });
});
