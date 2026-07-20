import { describe, expect, it } from "vitest";
import {
  COLOR_SCREEN_PRESETS,
  DEAD_PIXEL_CYCLE,
  grayLevel,
  NEAR_BLACK_STEPS,
  NEAR_WHITE_STEPS,
  normalizeHexInput,
  UNIFORMITY_LEVELS,
} from "@/src/lib/screen-test";

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
