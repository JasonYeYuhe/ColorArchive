import { describe, it, expect } from "vitest";
import {
  simulateColorBlindness,
  hexToRgbCB,
  rgbToHexCB,
  luminance,
  type RGB,
  type ColorBlindType,
  COLOR_BLIND_INFO,
  SAMPLE_PALETTE,
} from "@/src/lib/colorblind";

/* ------------------------------------------------------------------ */
/*  hexToRgbCB                                                        */
/* ------------------------------------------------------------------ */
describe("hexToRgbCB", () => {
  it("parses a 6-digit hex string", () => {
    expect(hexToRgbCB("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgbCB("#00FF00")).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgbCB("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("parses without the leading #", () => {
    expect(hexToRgbCB("ABCDEF")).toEqual({ r: 0xab, g: 0xcd, b: 0xef });
  });

  it("parses a 3-digit shorthand hex", () => {
    expect(hexToRgbCB("#FFF")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgbCB("#000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgbCB("#F00")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("handles lowercase hex", () => {
    expect(hexToRgbCB("#ff8800")).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("returns null for invalid input", () => {
    expect(hexToRgbCB("")).toBeNull();
    expect(hexToRgbCB("#GG0000")).toBeNull();
    expect(hexToRgbCB("#12345")).toBeNull(); // 5 digits
    expect(hexToRgbCB("#1234567")).toBeNull(); // 7 digits
  });

  it("known value: white", () => {
    expect(hexToRgbCB("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("known value: black", () => {
    expect(hexToRgbCB("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

/* ------------------------------------------------------------------ */
/*  rgbToHexCB                                                        */
/* ------------------------------------------------------------------ */
describe("rgbToHexCB", () => {
  it("converts RGB to uppercase hex", () => {
    expect(rgbToHexCB({ r: 255, g: 0, b: 0 })).toBe("#FF0000");
    expect(rgbToHexCB({ r: 0, g: 255, b: 0 })).toBe("#00FF00");
    expect(rgbToHexCB({ r: 0, g: 0, b: 255 })).toBe("#0000FF");
  });

  it("pads single-digit channels with zero", () => {
    expect(rgbToHexCB({ r: 0, g: 0, b: 0 })).toBe("#000000");
    expect(rgbToHexCB({ r: 1, g: 2, b: 3 })).toBe("#010203");
  });

  it("converts white", () => {
    expect(rgbToHexCB({ r: 255, g: 255, b: 255 })).toBe("#FFFFFF");
  });
});

/* ------------------------------------------------------------------ */
/*  hexToRgbCB / rgbToHexCB round-trip                                */
/* ------------------------------------------------------------------ */
describe("hex<->rgb round-trip", () => {
  const samples = ["#FF0000", "#00FF00", "#0000FF", "#ABCDEF", "#123456", "#000000", "#FFFFFF"];

  it.each(samples)("round-trips %s", (hex) => {
    const rgb = hexToRgbCB(hex);
    expect(rgb).not.toBeNull();
    expect(rgbToHexCB(rgb!)).toBe(hex);
  });

  it("round-trips all SAMPLE_PALETTE entries", () => {
    for (const hex of SAMPLE_PALETTE) {
      const rgb = hexToRgbCB(hex);
      expect(rgb).not.toBeNull();
      expect(rgbToHexCB(rgb!)).toBe(hex.toUpperCase());
    }
  });
});

/* ------------------------------------------------------------------ */
/*  simulateColorBlindness                                            */
/* ------------------------------------------------------------------ */
describe("simulateColorBlindness", () => {
  /* -- Black & white should be unchanged for every type ------------ */
  const allTypes: ColorBlindType[] = ["protanopia", "deuteranopia", "tritanopia", "achromatopsia"];
  const black: RGB = { r: 0, g: 0, b: 0 };
  const white: RGB = { r: 255, g: 255, b: 255 };

  it.each(allTypes)("black stays black under %s", (type) => {
    const result = simulateColorBlindness(black, type);
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it.each(allTypes)("white stays white under %s", (type) => {
    const result = simulateColorBlindness(white, type);
    expect(result.r).toBeGreaterThanOrEqual(254);
    expect(result.g).toBeGreaterThanOrEqual(254);
    expect(result.b).toBeGreaterThanOrEqual(254);
  });

  /* -- Achromatopsia produces grayscale ----------------------------- */
  describe("achromatopsia produces grayscale", () => {
    const coloredInputs: RGB[] = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
      { r: 128, g: 64, b: 192 },
      { r: 255, g: 128, b: 0 },
    ];

    it.each(coloredInputs)("R=$r G=$g B=$b becomes grayscale", (input) => {
      const result = simulateColorBlindness(input, "achromatopsia");
      expect(result.r).toBe(result.g);
      expect(result.g).toBe(result.b);
    });

    it("pure green produces brighter gray than pure red or blue (luminance weighting)", () => {
      const fromRed = simulateColorBlindness({ r: 255, g: 0, b: 0 }, "achromatopsia");
      const fromGreen = simulateColorBlindness({ r: 0, g: 255, b: 0 }, "achromatopsia");
      const fromBlue = simulateColorBlindness({ r: 0, g: 0, b: 255 }, "achromatopsia");
      expect(fromGreen.r).toBeGreaterThan(fromRed.r);
      expect(fromGreen.r).toBeGreaterThan(fromBlue.r);
    });
  });

  /* -- Protanopia: pure red shifts toward yellow/brown -------------- */
  describe("protanopia", () => {
    it("pure red shifts: red channel decreases, green increases relative to blue", () => {
      const pureRed: RGB = { r: 255, g: 0, b: 0 };
      const result = simulateColorBlindness(pureRed, "protanopia");
      // Under protanopia, red is no longer perceived as vivid red.
      // The result should have a lower R than 255 and gain some G.
      expect(result.r).toBeLessThan(255);
      expect(result.g).toBeGreaterThan(0);
      // Blue channel should remain near zero (the matrix has 0 contribution from R to B)
      expect(result.b).toBeLessThanOrEqual(5);
    });

    it("pure red simulated result has R and G closer together (yellow/brown shift)", () => {
      const pureRed: RGB = { r: 255, g: 0, b: 0 };
      const result = simulateColorBlindness(pureRed, "protanopia");
      // In the yellow/brown region, R and G are relatively close
      const diff = Math.abs(result.r - result.g);
      // They shouldn't be hugely far apart (original diff was 255)
      expect(diff).toBeLessThan(100);
    });
  });

  /* -- Deuteranopia: red and green become similar ------------------- */
  describe("deuteranopia", () => {
    it("red and green become more similar", () => {
      const red: RGB = { r: 200, g: 0, b: 0 };
      const green: RGB = { r: 0, g: 200, b: 0 };
      const simRed = simulateColorBlindness(red, "deuteranopia");
      const simGreen = simulateColorBlindness(green, "deuteranopia");
      // The difference between simulated red and green should be much smaller
      // than the difference between the originals
      const origDist = Math.sqrt(200 ** 2 + 200 ** 2); // ~283
      const simDist = Math.sqrt(
        (simRed.r - simGreen.r) ** 2 +
          (simRed.g - simGreen.g) ** 2 +
          (simRed.b - simGreen.b) ** 2
      );
      expect(simDist).toBeLessThan(origDist * 0.6);
    });
  });

  /* -- Tritanopia: blue shifts -------------------------------------- */
  describe("tritanopia", () => {
    it("pure blue gains some green component", () => {
      const pureBlue: RGB = { r: 0, g: 0, b: 255 };
      const result = simulateColorBlindness(pureBlue, "tritanopia");
      // The tritanopia matrix maps blue into green-ish tones
      expect(result.g).toBeGreaterThan(0);
    });
  });

  /* -- Output channels are always in valid 0-255 range ------------- */
  it("output values are clamped to 0-255 for all types", () => {
    const extremes: RGB[] = [
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
    ];
    for (const type of allTypes) {
      for (const input of extremes) {
        const result = simulateColorBlindness(input, type);
        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(255);
        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(255);
        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(255);
      }
    }
  });

  /* -- Output channels are integers -------------------------------- */
  it("output channels are integers", () => {
    const input: RGB = { r: 123, g: 77, b: 201 };
    for (const type of allTypes) {
      const result = simulateColorBlindness(input, type);
      expect(Number.isInteger(result.r)).toBe(true);
      expect(Number.isInteger(result.g)).toBe(true);
      expect(Number.isInteger(result.b)).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  luminance                                                         */
/* ------------------------------------------------------------------ */
describe("luminance", () => {
  it("black has luminance 0", () => {
    expect(luminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it("white has luminance ~1", () => {
    expect(luminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2);
  });

  it("green contributes more luminance than red or blue", () => {
    const lRed = luminance({ r: 255, g: 0, b: 0 });
    const lGreen = luminance({ r: 0, g: 255, b: 0 });
    const lBlue = luminance({ r: 0, g: 0, b: 255 });
    expect(lGreen).toBeGreaterThan(lRed);
    expect(lGreen).toBeGreaterThan(lBlue);
    expect(lRed).toBeGreaterThan(lBlue);
  });

  it("returns value between 0 and 1", () => {
    const midGray = luminance({ r: 128, g: 128, b: 128 });
    expect(midGray).toBeGreaterThan(0);
    expect(midGray).toBeLessThan(1);
  });
});

/* ------------------------------------------------------------------ */
/*  Exported constants                                                */
/* ------------------------------------------------------------------ */
describe("COLOR_BLIND_INFO", () => {
  it("has entries for all 4 types", () => {
    const types = COLOR_BLIND_INFO.map((info) => info.type);
    expect(types).toContain("deuteranopia");
    expect(types).toContain("protanopia");
    expect(types).toContain("tritanopia");
    expect(types).toContain("achromatopsia");
    expect(COLOR_BLIND_INFO).toHaveLength(4);
  });

  it("each entry has required fields", () => {
    for (const info of COLOR_BLIND_INFO) {
      expect(info.label).toBeTruthy();
      expect(info.shortLabel).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.prevalence).toBeTruthy();
      expect(info.affected).toBeTruthy();
    }
  });
});

describe("SAMPLE_PALETTE", () => {
  it("contains valid hex strings", () => {
    for (const hex of SAMPLE_PALETTE) {
      expect(hexToRgbCB(hex)).not.toBeNull();
    }
  });

  it("has 6 entries", () => {
    expect(SAMPLE_PALETTE).toHaveLength(6);
  });
});
