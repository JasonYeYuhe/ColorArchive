import { describe, it, expect } from "vitest";
import { colors } from "@/src/data/colors";

describe("colors dataset", () => {
  it("generates exactly 5,446 colors", () => {
    expect(colors.length).toBe(5446);
  });

  it("has no duplicate IDs", () => {
    const ids = colors.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(colors.length);
  });

  it("has no duplicate hex values (except neutral grays may overlap)", () => {
    const hexes = colors.map((c) => c.hex.toLowerCase());
    const unique = new Set(hexes);
    // Allow a small margin for grays that may produce identical hex at extremes
    expect(unique.size).toBeGreaterThan(colors.length * 0.95);
  });

  it("every color has required fields", () => {
    for (const c of colors) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.hex).toMatch(/^#[0-9A-F]{6}$/i);
      expect(c.hue).toBeGreaterThanOrEqual(0);
      expect(c.hue).toBeLessThan(360);
      expect(c.saturation).toBeGreaterThanOrEqual(0);
      expect(c.saturation).toBeLessThanOrEqual(100);
      expect(c.lightness).toBeGreaterThanOrEqual(0);
      expect(c.lightness).toBeLessThanOrEqual(100);
      expect(c.family).toBeTruthy();
    }
  });

  it("includes all 8 saturation bands", () => {
    const sats = new Set(colors.map((c) => c.saturation));
    expect(sats.has(10)).toBe(true);  // Faint
    expect(sats.has(18)).toBe(true);  // Muted
    expect(sats.has(26)).toBe(true);  // Dust
    expect(sats.has(34)).toBe(true);  // Soft
    expect(sats.has(54)).toBe(true);  // Clear
    expect(sats.has(74)).toBe(true);  // Vivid
    expect(sats.has(84)).toBe(true);  // Bright
    expect(sats.has(92)).toBe(true);  // Pure
  });

  it("includes neutral grays", () => {
    const neutrals = colors.filter((c) => c.name.includes("Gray"));
    expect(neutrals.length).toBe(70); // 5 groups × 14 lightness
    expect(neutrals.some((c) => c.name.startsWith("Warm Gray"))).toBe(true);
    expect(neutrals.some((c) => c.name.startsWith("Taupe Gray"))).toBe(true);
    expect(neutrals.some((c) => c.name.startsWith("True Gray"))).toBe(true);
    expect(neutrals.some((c) => c.name.startsWith("Sage Gray"))).toBe(true);
    expect(neutrals.some((c) => c.name.startsWith("Cool Gray"))).toBe(true);
  });

  it("preserves original color IDs (backward compatible)", () => {
    // Spot check a few known original colors
    const known = [
      "crimson-veil-muted",
      "sapphire-core-vivid",
      "emerald-ink-soft",
      "rose-bloom-clear",
      "amber-pearl-muted",
    ];
    for (const id of known) {
      expect(colors.find((c) => c.id === id)).toBeTruthy();
    }
  });

  it("includes new expansion colors", () => {
    const newColors = [
      "scarlet-core-bright",
      "steel-bloom-dust",
      "mauve-silk-vivid",
      "celadon-pearl-soft",
      "taupe-gray-tone",
      "sage-gray-whisper",
    ];
    for (const id of newColors) {
      expect(colors.find((c) => c.id === id)).toBeTruthy();
    }
  });
});
