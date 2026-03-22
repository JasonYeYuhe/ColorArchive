import { describe, expect, it } from "vitest";
import { generateColorFromWord } from "@/src/lib/word-color";

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

describe("generateColorFromWord", () => {
  describe("determinism", () => {
    it("returns the same result for identical input across calls", () => {
      const a = generateColorFromWord("ocean");
      const b = generateColorFromWord("ocean");
      expect(a).toEqual(b);
    });

    it("is case-insensitive", () => {
      const lower = generateColorFromWord("sunset");
      const upper = generateColorFromWord("SUNSET");
      const mixed = generateColorFromWord("SuNsEt");
      expect(lower).toEqual(upper);
      expect(lower).toEqual(mixed);
    });

    it("trims whitespace", () => {
      const clean = generateColorFromWord("forest");
      const padded = generateColorFromWord("  forest  ");
      expect(clean).toEqual(padded);
    });
  });

  describe("collision resistance", () => {
    const words = [
      "red", "blue", "green", "yellow", "purple",
      "ocean", "forest", "sunset", "midnight", "coral",
      "cat", "dog", "bird", "fish", "tree",
    ];

    it("produces distinct hex values for common words", () => {
      const hexes = words.map((w) => generateColorFromWord(w)!.hex);
      const unique = new Set(hexes);
      expect(unique.size).toBe(words.length);
    });
  });

  describe("output format", () => {
    it("returns valid hex for the main color", () => {
      const result = generateColorFromWord("hello")!;
      expect(result.hex).toMatch(HEX_PATTERN);
    });

    it("returns exactly 5 variants", () => {
      const result = generateColorFromWord("world")!;
      expect(result.variants).toHaveLength(5);
    });

    it("returns valid hex for every variant", () => {
      const result = generateColorFromWord("spectrum")!;
      for (const variant of result.variants) {
        expect(variant.hex).toMatch(HEX_PATTERN);
      }
    });

    it("includes expected variant labels", () => {
      const result = generateColorFromWord("palette")!;
      const labels = result.variants.map((v) => v.label);
      expect(labels).toEqual(["Mist", "Glow", "Base", "Deep", "Accent"]);
    });

    it("normalizes the token in the output", () => {
      const result = generateColorFromWord("  Hello  ")!;
      expect(result.token).toBe("hello");
    });
  });

  describe("edge cases", () => {
    it("returns null for empty string", () => {
      expect(generateColorFromWord("")).toBeNull();
    });

    it("returns null for whitespace-only string", () => {
      expect(generateColorFromWord("   ")).toBeNull();
    });

    it("handles single character input", () => {
      const result = generateColorFromWord("a")!;
      expect(result.hex).toMatch(HEX_PATTERN);
      expect(result.variants).toHaveLength(5);
    });

    it("handles long input", () => {
      const result = generateColorFromWord("a".repeat(1000))!;
      expect(result.hex).toMatch(HEX_PATTERN);
      expect(result.variants).toHaveLength(5);
    });
  });
});
