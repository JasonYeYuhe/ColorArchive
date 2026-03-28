import { describe, it, expect } from "vitest";
import type { ColorRecord } from "@/src/types/color";
import {
  compareHueSort,
  getHueDistance,
  getColorDistance,
  getNearestColors,
  getComplementaryColor,
  getAnalogousColors,
  getSplitComplementaryColors,
  getTriadicColors,
  getTonalStrip,
  getToneCompanion,
  findClosestArchiveColor,
  findNearestArchiveColor,
} from "@/src/lib/color-relationships";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeColor(overrides: Partial<ColorRecord> & { id: string }): ColorRecord {
  return {
    name: overrides.id,
    hex: "#000000",
    rgb: "rgb(0,0,0)",
    hsl: "hsl(0,0%,0%)",
    hue: 0,
    saturation: 50,
    lightness: 50,
    family: "Red",
    ...overrides,
  };
}

const base = makeColor({ id: "base", hue: 120, saturation: 60, lightness: 50, hex: "#4d9933" });

const pool: ColorRecord[] = [
  base,
  makeColor({ id: "near",   hue: 125, saturation: 58, lightness: 52, hex: "#559b3f" }),
  makeColor({ id: "far",    hue: 300, saturation: 60, lightness: 50, hex: "#993d99" }),
  makeColor({ id: "same-h", hue: 120, saturation: 60, lightness: 30, hex: "#264d1a" }),
  makeColor({ id: "same-h2",hue: 120, saturation: 60, lightness: 70, hex: "#8fcc7a" }),
  makeColor({ id: "comp",   hue: 300, saturation: 62, lightness: 48, hex: "#963b96" }),
  makeColor({ id: "triad1", hue: 240, saturation: 55, lightness: 50, hex: "#3d3d99" }),
  makeColor({ id: "triad2", hue: 0,   saturation: 55, lightness: 50, hex: "#993d3d" }),
  makeColor({ id: "split1", hue: 270, saturation: 58, lightness: 50, hex: "#6b3d99" }),
  makeColor({ id: "split2", hue: 330, saturation: 58, lightness: 50, hex: "#993d6b" }),
  makeColor({ id: "analog1",hue: 144, saturation: 58, lightness: 50, hex: "#3d9966" }),
  makeColor({ id: "analog2",hue: 96,  saturation: 58, lightness: 50, hex: "#66993d" }),
  makeColor({ id: "lighter",hue: 121, saturation: 59, lightness: 65, hex: "#7cc06a" }),
  makeColor({ id: "darker", hue: 119, saturation: 59, lightness: 35, hex: "#33732a" }),
];

// ---------------------------------------------------------------------------
// 1. compareHueSort
// ---------------------------------------------------------------------------
describe("compareHueSort", () => {
  it("sorts by hue first", () => {
    const a = makeColor({ id: "a", hue: 10 });
    const b = makeColor({ id: "b", hue: 20 });
    expect(compareHueSort(a, b)).toBeLessThan(0);
    expect(compareHueSort(b, a)).toBeGreaterThan(0);
  });

  it("breaks hue ties with saturation", () => {
    const a = makeColor({ id: "a", hue: 10, saturation: 30 });
    const b = makeColor({ id: "b", hue: 10, saturation: 60 });
    expect(compareHueSort(a, b)).toBeLessThan(0);
  });

  it("breaks saturation ties with lightness", () => {
    const a = makeColor({ id: "a", hue: 10, saturation: 50, lightness: 20 });
    const b = makeColor({ id: "b", hue: 10, saturation: 50, lightness: 80 });
    expect(compareHueSort(a, b)).toBeLessThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. getHueDistance
// ---------------------------------------------------------------------------
describe("getHueDistance", () => {
  it("returns 0 for identical hues", () => {
    expect(getHueDistance(90, 90)).toBe(0);
  });

  it("returns shortest arc", () => {
    expect(getHueDistance(10, 350)).toBe(20);
    expect(getHueDistance(0, 180)).toBe(180);
  });
});

// ---------------------------------------------------------------------------
// 3. getColorDistance
// ---------------------------------------------------------------------------
describe("getColorDistance", () => {
  it("returns 0 for identical colors", () => {
    expect(getColorDistance(base, base)).toBe(0);
  });

  it("near color has smaller distance than far color", () => {
    const near = pool.find((c) => c.id === "near")!;
    const far = pool.find((c) => c.id === "far")!;
    expect(getColorDistance(base, near)).toBeLessThan(getColorDistance(base, far));
  });
});

// ---------------------------------------------------------------------------
// 4. getNearestColors
// ---------------------------------------------------------------------------
describe("getNearestColors", () => {
  it("excludes the base color itself", () => {
    const result = getNearestColors(pool, base, 4);
    expect(result.every((c) => c.id !== "base")).toBe(true);
  });

  it("respects the limit parameter", () => {
    expect(getNearestColors(pool, base, 3)).toHaveLength(3);
  });

  it("returns closest colors first", () => {
    const result = getNearestColors(pool, base, 3);
    // The first result should be nearer than the last
    expect(getColorDistance(base, result[0])).toBeLessThanOrEqual(
      getColorDistance(base, result[2]),
    );
  });

  it("defaults to 6 results when limit is omitted", () => {
    expect(getNearestColors(pool, base)).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// 5. getComplementaryColor
// ---------------------------------------------------------------------------
describe("getComplementaryColor", () => {
  it("returns a color near hue+180", () => {
    const result = getComplementaryColor(pool, base);
    expect(result).not.toBeNull();
    const targetHue = (base.hue + 180) % 360;
    expect(getHueDistance(result!.hue, targetHue)).toBeLessThan(40);
  });

  it("returns null for an empty pool", () => {
    expect(getComplementaryColor([], base)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 6. getAnalogousColors
// ---------------------------------------------------------------------------
describe("getAnalogousColors", () => {
  it("returns up to 2 colors by default", () => {
    const result = getAnalogousColors(pool, base);
    expect(result.length).toBeLessThanOrEqual(2);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns colors with hues near base +/-24 degrees", () => {
    const result = getAnalogousColors(pool, base);
    for (const c of result) {
      const d = getHueDistance(c.hue, base.hue);
      expect(d).toBeLessThan(50); // generous tolerance
    }
  });
});

// ---------------------------------------------------------------------------
// 7. getSplitComplementaryColors
// ---------------------------------------------------------------------------
describe("getSplitComplementaryColors", () => {
  it("returns 2 colors", () => {
    const result = getSplitComplementaryColors(pool, base);
    expect(result).toHaveLength(2);
  });

  it("returns colors near hue+150 and hue+210", () => {
    const result = getSplitComplementaryColors(pool, base);
    const target1 = (base.hue + 150) % 360;
    const target2 = (base.hue + 210) % 360;
    const hues = result.map((c) => c.hue);

    // One color should be closer to target1, the other to target2
    const distances1 = hues.map((h) => getHueDistance(h, target1));
    const distances2 = hues.map((h) => getHueDistance(h, target2));
    expect(Math.min(...distances1)).toBeLessThan(50);
    expect(Math.min(...distances2)).toBeLessThan(50);
  });

  it("returns empty for an empty pool", () => {
    expect(getSplitComplementaryColors([], base)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 8. getTriadicColors
// ---------------------------------------------------------------------------
describe("getTriadicColors", () => {
  it("returns 2 colors", () => {
    const result = getTriadicColors(pool, base);
    expect(result).toHaveLength(2);
  });

  it("returns colors near hue+120 and hue+240", () => {
    const result = getTriadicColors(pool, base);
    const target1 = (base.hue + 120) % 360;
    const target2 = (base.hue + 240) % 360;
    const hues = result.map((c) => c.hue);
    expect(Math.min(...hues.map((h) => getHueDistance(h, target1)))).toBeLessThan(50);
    expect(Math.min(...hues.map((h) => getHueDistance(h, target2)))).toBeLessThan(50);
  });

  it("returns empty for an empty pool", () => {
    expect(getTriadicColors([], base)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 9. getTonalStrip
// ---------------------------------------------------------------------------
describe("getTonalStrip", () => {
  it("returns only colors with same hue and saturation", () => {
    const result = getTonalStrip(pool, base);
    for (const c of result) {
      expect(c.hue).toBe(base.hue);
      expect(c.saturation).toBe(base.saturation);
    }
  });

  it("sorts by lightness ascending", () => {
    const result = getTonalStrip(pool, base);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].lightness).toBeGreaterThanOrEqual(result[i - 1].lightness);
    }
  });

  it("includes the base color itself", () => {
    const result = getTonalStrip(pool, base);
    expect(result.some((c) => c.id === base.id)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10. getToneCompanion
// ---------------------------------------------------------------------------
describe("getToneCompanion", () => {
  it("returns a lighter color when direction is 'lighter'", () => {
    const result = getToneCompanion(pool, base, "lighter");
    expect(result).not.toBeNull();
    expect(result!.lightness).toBeGreaterThan(base.lightness);
  });

  it("returns a darker color when direction is 'darker'", () => {
    const result = getToneCompanion(pool, base, "darker");
    expect(result).not.toBeNull();
    expect(result!.lightness).toBeLessThan(base.lightness);
  });

  it("excludes the base color", () => {
    const lighter = getToneCompanion(pool, base, "lighter");
    const darker = getToneCompanion(pool, base, "darker");
    expect(lighter?.id).not.toBe(base.id);
    expect(darker?.id).not.toBe(base.id);
  });

  it("returns null when no candidates exist", () => {
    const veryLight = makeColor({ id: "top", hue: 120, lightness: 100 });
    const result = getToneCompanion([veryLight], veryLight, "lighter");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 11. findClosestArchiveColor
// ---------------------------------------------------------------------------
describe("findClosestArchiveColor", () => {
  const archiveColors = [
    makeColor({ id: "red",   hex: "#ff0000" }),
    makeColor({ id: "green", hex: "#00ff00" }),
    makeColor({ id: "blue",  hex: "#0000ff" }),
  ];

  it("returns the closest color by weighted RGB distance", () => {
    const result = findClosestArchiveColor(archiveColors, "#00ee00");
    expect(result?.id).toBe("green");
  });

  it("returns null for an invalid hex", () => {
    expect(findClosestArchiveColor(archiveColors, "not-a-hex")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 12. findNearestArchiveColor
// ---------------------------------------------------------------------------
describe("findNearestArchiveColor", () => {
  const archiveColors = [
    makeColor({ id: "red",   hex: "#ff0000", hue: 0,   saturation: 100, lightness: 50 }),
    makeColor({ id: "green", hex: "#00ff00", hue: 120, saturation: 100, lightness: 50 }),
    makeColor({ id: "blue",  hex: "#0000ff", hue: 240, saturation: 100, lightness: 50 }),
  ];

  it("returns the nearest color by HSL distance", () => {
    const result = findNearestArchiveColor(archiveColors, "#00ee00");
    expect(result?.id).toBe("green");
  });

  it("returns null for an invalid hex", () => {
    expect(findNearestArchiveColor(archiveColors, "xyz")).toBeNull();
  });
});
