import {
  getAnalogousColors,
  getTonalStrip,
  getToneCompanion,
} from "@/src/lib/color-relationships";
import type { ColorRecord } from "@/src/types/color";

export const PIN_PALETTE_SIZE = 5;

function dedupe(list: (ColorRecord | null | undefined)[]): ColorRecord[] {
  const seen = new Set<string>();
  const out: ColorRecord[] = [];
  for (const color of list) {
    if (!color || seen.has(color.id)) continue;
    seen.add(color.id);
    out.push(color);
  }
  return out;
}

/**
 * The five swatches under the hero on a Pinterest pin image: a tonal ramp of the
 * base colour, presented light → dark.
 *
 * ─── WHY A RAMP AND NOT "BASE + ITS NEAREST NEIGHBOURS" ────────────────────
 *
 * The first version built [analogous, lighter, base, darker, analogous] from
 * getToneCompanion + getAnalogousColors. Rendered, it was useless: those helpers
 * return the NEAREST neighbour, so Teal Silk Bright produced
 * #69F2F2 #8EF5D3 #69F2C4 #43EFB6 #69F297 — five near-identical teals spanning
 * about 6% lightness. At the ~236px width Pinterest actually renders a pin in
 * the feed, that is one blurred green bar, not a palette.
 *
 * A ramp across the hue's full lightness range has high internal contrast, so it
 * survives being shrunk, and it is the shape designers actually save — a colour
 * scale, which is how design tokens are published.
 *
 * getTonalStrip returns every archive colour sharing this hue AND saturation,
 * sorted ascending by lightness: exactly the 14 lightness bands of one
 * hue/chroma pair, darkest first.
 *
 * Lives in src/lib rather than beside the route because Next.js type-checks the
 * exports of a route.tsx file and rejects ones it does not recognise — so the
 * route cannot export this for a test to reach.
 */
export function buildPinPalette(
  colors: readonly ColorRecord[],
  base: ColorRecord,
): ColorRecord[] {
  const strip = getTonalStrip(colors, base);

  // Degenerate strip. Shouldn't happen for algorithmically generated colours,
  // but a one-item strip must not render a one-swatch row.
  if (strip.length < PIN_PALETTE_SIZE) {
    return dedupe([
      getAnalogousColors(colors, base, 2)[0],
      getToneCompanion(colors, base, "lighter"),
      base,
      getToneCompanion(colors, base, "darker"),
      getAnalogousColors(colors, base, 2)[1],
    ]);
  }

  // Evenly spaced across the whole range...
  const picks: ColorRecord[] = [];
  for (let i = 0; i < PIN_PALETTE_SIZE; i++) {
    picks.push(strip[Math.round((i * (strip.length - 1)) / (PIN_PALETTE_SIZE - 1))]);
  }

  // ...then force the base in, by replacing whichever pick sits closest to it.
  // Without this, "Palette built around X" could omit X — the even spacing lands
  // on fixed lightness bands and the base is usually between two of them.
  let nearest = 0;
  for (let i = 1; i < picks.length; i++) {
    const closer =
      Math.abs(picks[i].lightness - base.lightness) <
      Math.abs(picks[nearest].lightness - base.lightness);
    if (closer) nearest = i;
  }
  picks[nearest] = base;

  // Ascending lightness means darkest first; token scales read light → dark.
  return dedupe(picks.reverse());
}
