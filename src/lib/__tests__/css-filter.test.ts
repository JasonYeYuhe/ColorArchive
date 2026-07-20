import { describe, expect, it } from "vitest";
import {
  applyFilters,
  createRng,
  filterLoss,
  formatFilterCss,
  solveFilters,
  type FilterValues,
} from "@/src/lib/css-filter";
import { hexToLab } from "@/src/lib/color-difference";

describe("createRng", () => {
  it("is deterministic and in [0,1)", () => {
    const a = createRng(7);
    const b = createRng(7);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
    seqA.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
    expect(createRng(8)()).not.toBe(createRng(7)());
  });
});

describe("filter math (spec spot checks)", () => {
  it("identity chain keeps black black", () => {
    const identity: FilterValues = [0, 0, 100, 0, 100, 100];
    expect(applyFilters(identity)).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("invert(100%) turns black white", () => {
    const v: FilterValues = [100, 0, 100, 0, 100, 100];
    expect(applyFilters(v)).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("full sepia of white lands on the spec sepia tone", () => {
    // invert black → white, then sepia(100%). Row sums for white:
    // r = 1.351 → clamps 255, g = 1.203 → clamps 255, b = 0.937 → 239.
    const v: FilterValues = [100, 100, 100, 0, 100, 100];
    const { r, g, b } = applyFilters(v);
    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(Math.round(255 * (0.272 + 0.534 + 0.131)));
  });

  it("brightness(0%) crushes to black", () => {
    const v: FilterValues = [100, 0, 100, 0, 0, 100];
    expect(applyFilters(v)).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("solveFilters", () => {
  const TARGETS = ["#1e90ff", "#e74c3c", "#2ecc71", "#f5c542", "#6b21a8"];

  it.each(TARGETS)("converges to a close match for %s (seeded)", (hex) => {
    const solution = solveFilters(hex, 42)!;
    expect(solution).not.toBeNull();
    // CIEDE2000 < 5 = visually close; the classic solver typically lands 0–3.
    expect(solution.loss).toBeLessThan(5);
    // and the loss must agree with re-applying the values
    const lab = hexToLab(hex)!;
    expect(filterLoss(solution.values, lab)).toBeCloseTo(solution.loss, 6);
  });

  it("is deterministic for a fixed seed and returns valid CSS", () => {
    const a = solveFilters("#1e90ff", 7)!;
    const b = solveFilters("#1e90ff", 7)!;
    expect(a.values).toEqual(b.values);
    expect(a.css).toMatch(
      /^filter: invert\(\d+%\) sepia\(\d+%\) saturate\(\d+%\) hue-rotate\(\d+(\.\d+)?deg\) brightness\(\d+%\) contrast\(\d+%\);$/,
    );
    expect(formatFilterCss(a.values)).toBe(a.css);
  });

  it("returns null on invalid hex", () => {
    expect(solveFilters("nope")).toBeNull();
  });
});
