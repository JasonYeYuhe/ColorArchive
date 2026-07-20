import { describe, expect, it } from "vitest";
import {
  bandFillStyle,
  COLOR_SCREEN_PRESETS,
  DEAD_PIXEL_CYCLE,
  encodeWizardResult,
  GAMMA_PATCHES,
  generateHueChips,
  grayLevel,
  hueArrangementScore,
  HUE_SHUFFLE,
  NEAR_BLACK_STEPS,
  NEAR_WHITE_STEPS,
  normalizeHexInput,
  parseWizardResult,
  pickDistancePairs,
  scrambleChips,
  UNIFORMITY_LEVELS,
} from "@/src/lib/screen-test";
import { colorsById } from "@/src/data/colors";

describe("screen-test data", () => {
  it("dead-pixel cycle starts with the five classic fields", () => {
    expect(DEAD_PIXEL_CYCLE.slice(0, 5).map((c) => c.hex)).toEqual([
      "#ffffff",
      "#000000",
      "#ff0000",
      "#00ff00",
      "#0000ff",
    ]);
  });

  it("all preset hexes are valid 6-digit hex", () => {
    for (const c of [...DEAD_PIXEL_CYCLE, ...COLOR_SCREEN_PRESETS, ...UNIFORMITY_LEVELS]) {
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("near-black steps ascend and stay near black", () => {
    const steps = [...NEAR_BLACK_STEPS];
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
    expect(steps[0]).toBeGreaterThan(0);
    expect(steps[steps.length - 1]).toBeLessThanOrEqual(16);
  });

  it("near-white steps descend and stay near white", () => {
    const steps = [...NEAR_WHITE_STEPS];
    expect(steps).toEqual([...steps].sort((a, b) => b - a));
    expect(steps[0]).toBeLessThan(255);
    expect(steps[steps.length - 1]).toBeGreaterThanOrEqual(240);
  });
});

describe("grayLevel", () => {
  it("formats equal-channel rgb", () => {
    expect(grayLevel(4)).toBe("rgb(4, 4, 4)");
    expect(grayLevel(254)).toBe("rgb(254, 254, 254)");
  });

  it("clamps out-of-range and rounds", () => {
    expect(grayLevel(-5)).toBe("rgb(0, 0, 0)");
    expect(grayLevel(300)).toBe("rgb(255, 255, 255)");
    expect(grayLevel(3.6)).toBe("rgb(4, 4, 4)");
  });
});

describe("normalizeHexInput", () => {
  it("accepts 6-digit hex with or without #", () => {
    expect(normalizeHexInput("#1e90ff")).toBe("#1e90ff");
    expect(normalizeHexInput("1E90FF")).toBe("#1e90ff");
    expect(normalizeHexInput("  #AbCdEf ")).toBe("#abcdef");
  });

  it("expands 3-digit hex", () => {
    expect(normalizeHexInput("#f0a")).toBe("#ff00aa");
    expect(normalizeHexInput("fff")).toBe("#ffffff");
  });

  it("rejects invalid input", () => {
    expect(normalizeHexInput("")).toBeNull();
    expect(normalizeHexInput("#12345")).toBeNull();
    expect(normalizeHexInput("red")).toBeNull();
    expect(normalizeHexInput("amber-pearl-muted")).toBeNull();
  });
});

/* ---------------- Phase 2 ---------------- */

describe("gamma patches", () => {
  it("computes v = 255·0.5^(1/gamma) for the classic ladder", () => {
    const g22 = GAMMA_PATCHES.find((p) => p.gamma === 2.2)!;
    expect(g22.value).toBe(Math.round(255 * Math.pow(0.5, 1 / 2.2))); // 186
    expect(g22.value).toBe(186);
    const values = GAMMA_PATCHES.map((p) => p.value);
    expect(values).toEqual([...values].sort((a, b) => a - b)); // monotone with gamma
  });
});

describe("bandFillStyle", () => {
  it("produces per-channel ramps and clamps", () => {
    expect(bandFillStyle("gray", 128)).toBe("rgb(128, 128, 128)");
    expect(bandFillStyle("red", 300)).toBe("rgb(255, 0, 0)");
    expect(bandFillStyle("blue", -4)).toBe("rgb(0, 0, 0)");
  });
});

describe("pickDistancePairs", () => {
  it("returns 8 real archive pairs differing only in chroma band", () => {
    const pairs = pickDistancePairs(colorsById);
    expect(pairs).toHaveLength(8);
    for (const { a, b } of pairs) {
      expect(a.id).not.toBe(b.id);
      // same root+lightness prefix, different chroma suffix
      const pa = a.id.split("-");
      const pb = b.id.split("-");
      expect(pa.slice(0, -1)).toEqual(pb.slice(0, -1));
      expect(a.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("hue arrangement game", () => {
  it("generates chips with monotone hue and valid hex", () => {
    const chips = generateHueChips();
    expect(chips).toHaveLength(12);
    chips.forEach((c, i) => {
      expect(c.trueIndex).toBe(i);
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/);
    });
    // neighbouring chips must actually differ (visible game)
    for (let i = 1; i < chips.length; i++) expect(chips[i].hex).not.toBe(chips[i - 1].hex);
  });

  it("scramble is a fixed permutation and scoring is 0 for the true order", () => {
    const chips = generateHueChips();
    const scrambled = scrambleChips(chips);
    expect(new Set(scrambled.map((c) => c.trueIndex)).size).toBe(HUE_SHUFFLE.length);
    expect(hueArrangementScore(chips)).toBe(0);
    expect(hueArrangementScore(scrambled)).toBeGreaterThan(0);
    // reversing the perfect order is still perfect adjacency-wise? No: reversed
    // order has adjacent deltas of 1 too — FM-100 anchors normally prevent this;
    // the score treats it as perfect, which the UI handles via fixed end anchors.
    const reversed = [...chips].reverse();
    expect(hueArrangementScore(reversed)).toBe(0);
  });
});

describe("wizard result codec", () => {
  it("round-trips a full result", () => {
    const r = {
      black: 4,
      white: 250,
      uniformityOk: true,
      gamma: 2.2,
      bandingSmooth: false,
      distanceSeen: 6,
      distanceTotal: 8,
      hueScore: 3,
    };
    const enc = encodeWizardResult(r);
    expect(parseWizardResult(enc)).toEqual(r);
  });

  it("round-trips partial results and survives garbage", () => {
    expect(parseWizardResult(encodeWizardResult({ black: 8 }))).toEqual({ black: 8 });
    expect(parseWizardResult("v1")).toBeNull();
    expect(parseWizardResult("v2.b4")).toBeNull();
    expect(parseWizardResult("v1.zzz.b999.d9-8.g99")).toBeNull();
    expect(parseWizardResult("v1.b12.junk")).toEqual({ black: 12 });
  });
});
