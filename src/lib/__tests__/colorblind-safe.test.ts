import { describe, expect, it } from "vitest";
import {
  findSafeAlternative,
  hexToRgbCB,
  isDistinguishableSim,
  simulateColorBlindness,
} from "@/src/lib/colorblind";
import { colors } from "@/src/data/colors";

describe("isDistinguishableSim", () => {
  it("identical colors are not distinguishable; black vs white are", () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    expect(isDistinguishableSim(black, black)).toBe(false);
    expect(isDistinguishableSim(black, white)).toBe(true);
  });

  it("a warm-brown / olive confusion pair fails under deuteranopia simulation", () => {
    // Empirically verified collapsing pair (similar luminance, red/green axis):
    const brown = hexToRgbCB("#8d6e63")!;
    const olive = hexToRgbCB("#689f38")!;
    // In normal vision they are clearly different…
    expect(isDistinguishableSim(brown, olive)).toBe(true);
    // …but their deuteranopia simulations collapse toward each other.
    const simBrown = simulateColorBlindness(brown, "deuteranopia");
    const simOlive = simulateColorBlindness(olive, "deuteranopia");
    expect(isDistinguishableSim(simBrown, simOlive)).toBe(false);
  });
});

describe("findSafeAlternative", () => {
  it("suggests an archive color that passes the same criterion it was flagged by", () => {
    const problem = "#689f38"; // olive that collapses into the brown under deuteranopia
    const others = ["#8d6e63"];
    const fix = findSafeAlternative(problem, others, ["deuteranopia"], colors);
    expect(fix).not.toBeNull();
    const cand = hexToRgbCB(fix!.candidate.hex)!;
    const simCand = simulateColorBlindness(cand, "deuteranopia");
    for (const other of others) {
      const simOther = simulateColorBlindness(hexToRgbCB(other)!, "deuteranopia");
      expect(isDistinguishableSim(simCand, simOther)).toBe(true);
      // and it must stay distinct in normal vision too
      expect(isDistinguishableSim(cand, hexToRgbCB(other)!)).toBe(true);
    }
  });

  it("returns null for invalid input and prefers nearby colors", () => {
    expect(findSafeAlternative("nope", ["#ffffff"], ["protanopia"], colors)).toBeNull();
    const fix = findSafeAlternative("#1e6fd9", ["#ffffff"], ["protanopia"], colors);
    expect(fix).not.toBeNull();
    // the suggestion should be reasonably close to the original in RGB space
    expect(fix!.distance).toBeLessThan(120);
  });
});
