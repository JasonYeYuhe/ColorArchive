import { describe, expect, it } from "vitest";

import { colors } from "@/src/data/colors";
import { buildPinPalette, PIN_PALETTE_SIZE } from "@/src/lib/pin-palette";

/**
 * The palette strip on the Pinterest pin image (/colors/{slug}/pin-image/).
 *
 * This is guarded because the FIRST version shipped a strip of five
 * near-identical swatches — #69F2F2 #8EF5D3 #69F2C4 #43EFB6 #69F297, about 6%
 * of lightness end to end. It typechecked, it rendered, it returned a valid
 * 1000×1500 PNG, and it was worthless: at the width Pinterest shows a pin in
 * the feed it reads as a single blurred bar. Nothing but looking at the picture
 * caught it, so the property that makes it a palette is asserted here instead.
 */
describe("buildPinPalette", () => {
  // Deterministic spread over the whole archive rather than a handful of
  // hand-picked ids — the interesting failures are at the band edges (nothing
  // lighter than a Veil, nothing darker than an Ink) and in the neutrals, which
  // carry no chroma token and could plausibly land in a different tonal strip.
  const sample = colors.filter((_, i) => i % 37 === 0);
  const neutrals = colors.filter((c) => c.id.includes("-gray-")).slice(0, 12);
  const edges = colors.filter(
    (c) => c.id.endsWith("-veil-faint") || c.id.endsWith("-ink-pure"),
  );
  const cases = [...sample, ...neutrals, ...edges];

  it("covers a meaningful sample", () => {
    expect(cases.length).toBeGreaterThan(150);
  });

  it("always returns a full strip", () => {
    for (const color of cases) {
      const palette = buildPinPalette(colors, color);
      expect(palette.length, color.id).toBe(PIN_PALETTE_SIZE);
    }
  });

  it("never repeats a swatch", () => {
    for (const color of cases) {
      const ids = buildPinPalette(colors, color).map((c) => c.id);
      expect(new Set(ids).size, color.id).toBe(ids.length);
    }
  });

  it("contains the colour the pin is about", () => {
    for (const color of cases) {
      const ids = buildPinPalette(colors, color).map((c) => c.id);
      expect(ids, color.id).toContain(color.id);
    }
  });

  it("reads light to dark", () => {
    for (const color of cases) {
      const palette = buildPinPalette(colors, color);
      const lightness = palette.map((c) => c.lightness);
      const sorted = [...lightness].sort((a, b) => b - a);
      expect(lightness, color.id).toEqual(sorted);
    }
  });

  /**
   * THE ONE THAT WOULD HAVE CAUGHT THE ORIGINAL BUG.
   *
   * 40 points of lightness between the ends is roughly the Pearl→Shadow span —
   * wide enough that the strip still reads as separate blocks when Pinterest
   * scales it down. The failed first version spanned 6.
   */
  it("spans enough lightness to be legible when shrunk", () => {
    for (const color of cases) {
      const lightness = buildPinPalette(colors, color).map((c) => c.lightness);
      const span = Math.max(...lightness) - Math.min(...lightness);
      expect(span, `${color.id} spans only ${span}`).toBeGreaterThanOrEqual(40);
    }
  });

  it("keeps one hue family — it is a tonal ramp, not a rainbow", () => {
    for (const color of cases) {
      for (const swatch of buildPinPalette(colors, color)) {
        expect(swatch.hue, `${color.id} → ${swatch.id}`).toBe(color.hue);
      }
    }
  });
});
