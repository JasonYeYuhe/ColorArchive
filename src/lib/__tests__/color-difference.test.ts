import { describe, expect, it } from "vitest";
import {
  deltaE2000,
  deltaE2000Hex,
  deltaE76,
  hexToLab,
  interpretDeltaE,
} from "@/src/lib/color-difference";

describe("hexToLab", () => {
  it("maps white, black and mid-gray to known Lab values", () => {
    const white = hexToLab("#ffffff")!;
    expect(white.L).toBeCloseTo(100, 1);
    expect(Math.abs(white.a)).toBeLessThan(0.01);
    expect(Math.abs(white.b)).toBeLessThan(0.01);

    const black = hexToLab("#000000")!;
    expect(black.L).toBeCloseTo(0, 3);

    // #808080 → L* ≈ 53.59 (canonical sRGB mid-gray)
    expect(hexToLab("#808080")!.L).toBeCloseTo(53.59, 1);
  });

  it("expands 3-digit hex and rejects garbage", () => {
    expect(hexToLab("#fff")!.L).toBeCloseTo(100, 1);
    expect(hexToLab("nope")).toBeNull();
    expect(hexToLab("#12345")).toBeNull();
  });
});

describe("deltaE2000 — Sharma reference pairs", () => {
  // Sharma, Wu & Dalal (2005) supplementary test data, cases 1-3.
  const CASES: Array<[[number, number, number], [number, number, number], number]> = [
    [[50.0, 2.6772, -79.7751], [50.0, 0.0, -82.7485], 2.0425],
    [[50.0, 3.1571, -77.2803], [50.0, 0.0, -82.7485], 2.8615],
    [[50.0, 2.8361, -74.02], [50.0, 0.0, -82.7485], 3.4412],
  ];

  it.each(CASES)("ΔE00(%j, %j) ≈ %f", (lab1, lab2, expected) => {
    const d = deltaE2000(
      { L: lab1[0], a: lab1[1], b: lab1[2] },
      { L: lab2[0], a: lab2[1], b: lab2[2] },
    );
    expect(d).toBeCloseTo(expected, 3);
  });

  it("is symmetric and zero for identical colors", () => {
    const a = { L: 42.1, a: 12.3, b: -20.5 };
    const b = { L: 60.0, a: -5.0, b: 8.8 };
    expect(deltaE2000(a, b)).toBeCloseTo(deltaE2000(b, a), 10);
    expect(deltaE2000(a, a)).toBeCloseTo(0, 10);
  });
});

describe("deltaE76 / hex convenience / interpretation", () => {
  it("deltaE76 is plain euclidean", () => {
    expect(deltaE76({ L: 0, a: 0, b: 0 }, { L: 3, a: 4, b: 0 })).toBeCloseTo(5, 10);
  });

  it("deltaE2000Hex returns null on invalid input and a number otherwise", () => {
    // NB "bad" would be valid 3-digit hex (#bbaadd) — use a truly invalid token
    expect(deltaE2000Hex("nope", "#ffffff")).toBeNull();
    const d = deltaE2000Hex("#ff0000", "#00ff00");
    expect(d).toBeGreaterThan(50);
  });

  it("interpretation buckets are monotone", () => {
    expect(interpretDeltaE(0.2).bucket).toBe("identical");
    expect(interpretDeltaE(0.8).bucket).toBe("imperceptible");
    expect(interpretDeltaE(1.5).bucket).toBe("close");
    expect(interpretDeltaE(5).bucket).toBe("noticeable");
    expect(interpretDeltaE(30).bucket).toBe("distinct");
    expect(interpretDeltaE(80).bucket).toBe("different");
  });
});
