import { describe, it, expect } from "vitest";
import { getWcagPairings } from "@/src/lib/color-contrast";
import type { ColorRecord } from "@/src/types/color";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeColor(
  id: string,
  hue: number,
  saturation: number,
  lightness: number,
): ColorRecord {
  return {
    id,
    name: id,
    hex: "#000000",
    rgb: "rgb(0,0,0)",
    hsl: `hsl(${hue},${saturation}%,${lightness}%)`,
    hue,
    saturation,
    lightness,
    family: "Red" as const,
  };
}

// A small palette for testing: black, white, mid-gray, bright red, dark blue
const testColors: ColorRecord[] = [
  makeColor("black", 0, 0, 0),
  makeColor("white", 0, 0, 100),
  makeColor("mid-gray", 0, 0, 50),
  makeColor("bright-red", 0, 100, 50),
  makeColor("dark-blue", 240, 100, 20),
  makeColor("light-yellow", 60, 100, 90),
  makeColor("dark-green", 120, 100, 15),
  makeColor("light-pink", 350, 80, 85),
];

// ---------------------------------------------------------------------------
// getWcagPairings
// ---------------------------------------------------------------------------
describe("getWcagPairings", () => {
  it("returns an array of pairings", () => {
    const base = testColors.find((c) => c.id === "mid-gray")!;
    const pairings = getWcagPairings(testColors, base);
    expect(Array.isArray(pairings)).toBe(true);
  });

  it("all returned pairings have ratio >= 3.0", () => {
    const base = testColors.find((c) => c.id === "mid-gray")!;
    const pairings = getWcagPairings(testColors, base);
    for (const pairing of pairings) {
      expect(pairing.ratio).toBeGreaterThanOrEqual(3);
    }
  });

  it("does not include the base color itself", () => {
    const base = testColors.find((c) => c.id === "mid-gray")!;
    const pairings = getWcagPairings(testColors, base);
    const ids = pairings.map((p) => p.color.id);
    expect(ids).not.toContain("mid-gray");
  });

  it("respects limit parameter", () => {
    const base = testColors.find((c) => c.id === "mid-gray")!;
    const limited = getWcagPairings(testColors, base, 2);
    expect(limited.length).toBeLessThanOrEqual(2);
  });

  it("default limit is 8", () => {
    // Use a base color that has many contrasting candidates
    const base = testColors.find((c) => c.id === "white")!;
    const pairings = getWcagPairings(testColors, base);
    expect(pairings.length).toBeLessThanOrEqual(8);
  });

  it("grades are correctly assigned: AAA >= 7", () => {
    const base = testColors.find((c) => c.id === "white")!;
    const pairings = getWcagPairings(testColors, base);
    for (const pairing of pairings) {
      if (pairing.grade === "AAA") {
        expect(pairing.ratio).toBeGreaterThanOrEqual(7);
      }
    }
  });

  it("grades are correctly assigned: AA >= 4.5 and < 7", () => {
    const base = testColors.find((c) => c.id === "white")!;
    const pairings = getWcagPairings(testColors, base);
    for (const pairing of pairings) {
      if (pairing.grade === "AA") {
        expect(pairing.ratio).toBeGreaterThanOrEqual(4.5);
        expect(pairing.ratio).toBeLessThan(7);
      }
    }
  });

  it("grades are correctly assigned: AA Large >= 3 and < 4.5", () => {
    const base = testColors.find((c) => c.id === "white")!;
    const pairings = getWcagPairings(testColors, base);
    for (const pairing of pairings) {
      if (pairing.grade === "AA Large") {
        expect(pairing.ratio).toBeGreaterThanOrEqual(3);
        expect(pairing.ratio).toBeLessThan(4.5);
      }
    }
  });

  it("black should have high contrast with white (AAA)", () => {
    const base = testColors.find((c) => c.id === "black")!;
    const pairings = getWcagPairings(testColors, base);
    const whitePairing = pairings.find((p) => p.color.id === "white");
    expect(whitePairing).toBeDefined();
    expect(whitePairing!.ratio).toBe(21);
    expect(whitePairing!.grade).toBe("AAA");
  });

  it("white should have high contrast pairings with dark colors", () => {
    const base = testColors.find((c) => c.id === "white")!;
    const pairings = getWcagPairings(testColors, base);
    const blackPairing = pairings.find((p) => p.color.id === "black");
    expect(blackPairing).toBeDefined();
    expect(blackPairing!.grade).toBe("AAA");
  });

  it("results are sorted with AAA first, then AA, then AA Large", () => {
    const base = testColors.find((c) => c.id === "white")!;
    const pairings = getWcagPairings(testColors, base);
    if (pairings.length < 2) return; // skip if not enough pairings

    const gradeOrder = { AAA: 0, AA: 1, "AA Large": 2 };
    for (let i = 1; i < pairings.length; i++) {
      const prev = gradeOrder[pairings[i - 1].grade];
      const curr = gradeOrder[pairings[i].grade];
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  it("returns empty array when no candidates meet contrast threshold", () => {
    // Two very similar colors -- neither will have ratio >= 3 with the other
    const similar: ColorRecord[] = [
      makeColor("a", 0, 0, 50),
      makeColor("b", 0, 0, 52),
      makeColor("c", 0, 0, 48),
    ];
    const base = similar.find((c) => c.id === "a")!;
    const pairings = getWcagPairings(similar, base);
    expect(pairings).toHaveLength(0);
  });

  it("each pairing has a valid color object", () => {
    const base = testColors.find((c) => c.id === "white")!;
    const pairings = getWcagPairings(testColors, base);
    for (const pairing of pairings) {
      expect(pairing.color).toHaveProperty("id");
      expect(pairing.color).toHaveProperty("hue");
      expect(pairing.color).toHaveProperty("saturation");
      expect(pairing.color).toHaveProperty("lightness");
    }
  });
});
