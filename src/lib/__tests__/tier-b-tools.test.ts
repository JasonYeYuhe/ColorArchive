import { describe, expect, it } from "vitest";
import {
  kelvinToHex,
  kelvinToRgb,
  TEMPERATURE_PRESETS,
  temperatureLabel,
} from "@/src/lib/color-temperature";
import { applyDuotone, buildDuotoneLut, hexToRgbTuple, pixelLuma } from "@/src/lib/duotone";
import { mixPaints, PAINT_PRIMARIES, solvePaintRecipe } from "@/src/lib/paint-mix";
import { deltaE2000Hex } from "@/src/lib/color-difference";

/* ---------------- color temperature ---------------- */

describe("kelvinToRgb", () => {
  it("matches known anchor points of the Helland fit", () => {
    // Candle ~1900K: strongly orange (blue ≈ 0)
    const candle = kelvinToRgb(1900);
    expect(candle.r).toBe(255);
    expect(candle.b).toBeLessThan(30);
    // 6600K is the fit's neutral crossover — very close to pure white
    const neutral = kelvinToRgb(6600);
    expect(neutral.r).toBeGreaterThan(250);
    expect(neutral.g).toBeGreaterThan(240);
    expect(neutral.b).toBe(255);
    // 10000K: blue-ish (red drops below green stays high)
    const sky = kelvinToRgb(10000);
    expect(sky.b).toBe(255);
    expect(sky.r).toBeLessThan(215);
  });

  it("clamps out-of-range input and formats hex", () => {
    expect(kelvinToRgb(200)).toEqual(kelvinToRgb(1000));
    expect(kelvinToHex(6600)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("presets are ordered and labeled", () => {
    const ks = TEMPERATURE_PRESETS.map((p) => p.kelvin);
    expect(ks).toEqual([...ks].sort((a, b) => a - b));
    expect(temperatureLabel(2000).key).toBe("warm");
    expect(temperatureLabel(4500).key).toBe("neutral");
    expect(temperatureLabel(8000).key).toBe("cool");
  });
});

/* ---------------- duotone ---------------- */

describe("duotone", () => {
  it("luma endpoints map to shadow and highlight exactly", () => {
    const shadow = hexToRgbTuple("#1a1a40")!;
    const highlight = hexToRgbTuple("#ffcf70")!;
    const lut = buildDuotoneLut(shadow, highlight);
    expect([lut[0], lut[1], lut[2]]).toEqual([shadow.r, shadow.g, shadow.b]);
    expect([lut[255 * 3], lut[255 * 3 + 1], lut[255 * 3 + 2]]).toEqual([
      highlight.r,
      highlight.g,
      highlight.b,
    ]);
  });

  it("applyDuotone maps black/white pixels to the ramp ends, keeps alpha", () => {
    const shadow = hexToRgbTuple("#102030")!;
    const highlight = hexToRgbTuple("#f0e0d0")!;
    const lut = buildDuotoneLut(shadow, highlight);
    const data = new Uint8ClampedArray([0, 0, 0, 200, 255, 255, 255, 123]);
    applyDuotone(data, lut);
    expect([data[0], data[1], data[2], data[3]]).toEqual([16, 32, 48, 200]);
    expect([data[4], data[5], data[6], data[7]]).toEqual([240, 224, 208, 123]);
  });

  it("pixelLuma weights green highest", () => {
    expect(pixelLuma(0, 255, 0)).toBeGreaterThan(pixelLuma(255, 0, 0));
    expect(pixelLuma(255, 0, 0)).toBeGreaterThan(pixelLuma(0, 0, 255));
  });
});

/* ---------------- paint mixing ---------------- */

describe("paint mixing", () => {
  it("yellow + blue makes green (subtractive, not additive gray)", () => {
    const yellow = PAINT_PRIMARIES.find((p) => p.id === "yellow")!.hex;
    const blue = PAINT_PRIMARIES.find((p) => p.id === "blue")!.hex;
    const mixed = mixPaints([yellow, blue], [1, 1]);
    const m = /^#(..)(..)(..)$/.exec(mixed)!;
    const [r, g, b] = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
    expect(g).toBeGreaterThan(r); // green dominates
    expect(g).toBeGreaterThan(b);
  });

  it("mixing a color with itself is identity-ish", () => {
    const red = PAINT_PRIMARIES[0].hex;
    const mixed = mixPaints([red, red], [1, 1]);
    expect(deltaE2000Hex(mixed, red)!).toBeLessThan(1);
  });

  it("solver returns reduced-ratio recipes sorted by ΔE for an achievable target", () => {
    // Target: the model's own 1:1 yellow+blue green — solver must find ~ΔE 0
    const yellow = PAINT_PRIMARIES.find((p) => p.id === "yellow")!.hex;
    const blue = PAINT_PRIMARIES.find((p) => p.id === "blue")!.hex;
    const target = mixPaints([yellow, blue], [1, 1]);
    const recipes = solvePaintRecipe(target);
    expect(recipes.length).toBeGreaterThan(0);
    expect(recipes[0].deltaE).toBeLessThan(0.5);
    // best recipe should be yellow+blue in equal (reduced) parts
    const ids = recipes[0].parts.map((p) => p.primary.id).sort();
    expect(ids).toEqual(["blue", "yellow"]);
    expect(recipes[0].parts[0].count).toBe(recipes[0].parts[1].count);
    // sorted ascending
    for (let i = 1; i < recipes.length; i++) {
      expect(recipes[i].deltaE).toBeGreaterThanOrEqual(recipes[i - 1].deltaE);
    }
  });

  it("returns [] on invalid target", () => {
    expect(solvePaintRecipe("nope")).toEqual([]);
  });

  it("a target equal to a pure primary returns the single-paint recipe", () => {
    const white = PAINT_PRIMARIES.find((p) => p.id === "white")!;
    const recipes = solvePaintRecipe(white.hex);
    expect(recipes[0].parts).toHaveLength(1);
    expect(recipes[0].parts[0].primary.id).toBe("white");
    expect(recipes[0].deltaE).toBeLessThan(0.01);
  });

  it("non-divisor-of-8 ratios like 1:2 are reachable", () => {
    // Target: the model's own 1:2 yellow+blue — the fixed-total-8 search
    // couldn't represent this ratio; the variable-total search must find it.
    const yellow = PAINT_PRIMARIES.find((p) => p.id === "yellow")!.hex;
    const blue = PAINT_PRIMARIES.find((p) => p.id === "blue")!.hex;
    const target = mixPaints([yellow, blue], [1, 2]);
    const recipes = solvePaintRecipe(target);
    expect(recipes[0].deltaE).toBeLessThan(0.5);
    const counts = recipes[0].parts
      .map((p) => ({ id: p.primary.id, count: p.count }))
      .sort((a, b) => a.count - b.count);
    expect(counts).toEqual([
      { id: "yellow", count: 1 },
      { id: "blue", count: 2 },
    ]);
  });
});
