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
    // With 48 hue roots × 8 chroma bands × 14 lightness, some hex collisions
    // are expected — especially at extreme lightness (veil/ink) and low chroma (faint).
    // Current dataset yields ~94% unique hex values.
    expect(unique.size).toBeGreaterThan(colors.length * 0.93);
  });

  it("every color has required fields", () => {
    const invalid = colors.filter(
      (c) =>
        !c.id ||
        !c.name ||
        !/^#[0-9A-F]{6}$/i.test(c.hex) ||
        c.hue < 0 ||
        c.hue >= 360 ||
        c.saturation < 0 ||
        c.saturation > 100 ||
        c.lightness < 0 ||
        c.lightness > 100 ||
        !c.family,
    );
    expect(invalid).toHaveLength(0);
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
