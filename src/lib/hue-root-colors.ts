/**
 * The 48 hue roots, mapped to the colour the archive already says they are.
 *
 * ─── WHY THIS OVERRIDE EXISTS ──────────────────────────────────────────────
 *
 * `generateColorFromWord()` is a hash: `hue = hash % 360`. For an evocative word
 * ("nostalgia", "quiet luxury") an arbitrary-but-stable hue is the whole point,
 * and nobody can call it wrong. For a word that IS one of this archive's own
 * colour names, the same mechanism produces a claim a visitor can see is false.
 *
 * Measured across all 48 roots on 2026-09-08, hash output vs the archive's own
 * definition: median hue error 86°, and 22 of 48 more than 90° off. The worst
 * were near-complements — scarlet (a red) rendered cyan, aqua (a cyan) rendered
 * red, fuchsia rendered green. Nine of those pages were already live and had
 * been telling visitors that ember is blue, rose is green and seafoam is red.
 *
 * That matters more here than anywhere else on the site: /word-to-color/ is the
 * one route every paying subscriber arrived on from search, and "what colour is
 * coral" is exactly the query it ranks for.
 *
 * ─── SCOPE: DELIBERATELY ONLY THESE 48 ─────────────────────────────────────
 *
 * This is NOT the curated-mood-word idea that the 2026-09-08 review cut. That
 * proposed hand-picking 128 mood words out of SEARCH_ALIASES, whose success
 * criterion was a tautology and which would have made `ocean` curated and
 * `oceanic` hashed. These 48 are different in kind: they are the archive's own
 * generated vocabulary, `coral` returning the archive's coral is definitionally
 * right rather than a taste call, and every other word on the site keeps the
 * hash byte-for-byte.
 *
 * ─── WHY LITERALS AND NOT AN IMPORT OF colors.ts ───────────────────────────
 *
 * `src/data/colors.ts` generates all 5,446 records. Importing it here would pull
 * the whole dataset into the client bundle that renders the word tool, for 48
 * numbers. The values below are copied from each root's `{root}-core-pure`
 * record, and hue-root-colors.test.ts re-derives them FROM that dataset and
 * fails on any drift — so the literals cannot silently disagree with the archive
 * they are quoting.
 */
export interface RootColor {
  hue: number;
  saturation: number;
  lightness: number;
}

/** Lowercased root name -> the archive's `{root}-core-pure` HSL. */
export const HUE_ROOT_COLORS: Record<string, RootColor> = {
  amber: { hue: 50, saturation: 92, lightness: 48 },
  amethyst: { hue: 245, saturation: 92, lightness: 48 },
  apricot: { hue: 40, saturation: 92, lightness: 48 },
  aqua: { hue: 180, saturation: 92, lightness: 48 },
  azure: { hue: 200, saturation: 92, lightness: 48 },
  blush: { hue: 330, saturation: 92, lightness: 48 },
  canary: { hue: 55, saturation: 92, lightness: 48 },
  celadon: { hue: 145, saturation: 92, lightness: 48 },
  cerulean: { hue: 190, saturation: 92, lightness: 48 },
  chartreuse: { hue: 75, saturation: 92, lightness: 48 },
  citrine: { hue: 60, saturation: 92, lightness: 48 },
  clover: { hue: 115, saturation: 92, lightness: 48 },
  cobalt: { hue: 220, saturation: 92, lightness: 48 },
  coral: { hue: 30, saturation: 92, lightness: 48 },
  crimson: { hue: 0, saturation: 92, lightness: 48 },
  cyan: { hue: 175, saturation: 92, lightness: 48 },
  ember: { hue: 20, saturation: 92, lightness: 48 },
  emerald: { hue: 120, saturation: 92, lightness: 48 },
  fuchsia: { hue: 300, saturation: 92, lightness: 48 },
  garnet: { hue: 340, saturation: 92, lightness: 48 },
  honey: { hue: 70, saturation: 92, lightness: 48 },
  indigo: { hue: 230, saturation: 92, lightness: 48 },
  iris: { hue: 240, saturation: 92, lightness: 48 },
  jade: { hue: 150, saturation: 92, lightness: 48 },
  lagoon: { hue: 170, saturation: 92, lightness: 48 },
  leaf: { hue: 110, saturation: 92, lightness: 48 },
  lime: { hue: 90, saturation: 92, lightness: 48 },
  magenta: { hue: 290, saturation: 92, lightness: 48 },
  mauve: { hue: 305, saturation: 92, lightness: 48 },
  merlot: { hue: 350, saturation: 92, lightness: 48 },
  mint: { hue: 130, saturation: 92, lightness: 48 },
  moss: { hue: 100, saturation: 92, lightness: 48 },
  mulberry: { hue: 280, saturation: 92, lightness: 48 },
  olive: { hue: 80, saturation: 92, lightness: 48 },
  orchid: { hue: 260, saturation: 92, lightness: 48 },
  peony: { hue: 310, saturation: 92, lightness: 48 },
  plum: { hue: 270, saturation: 92, lightness: 48 },
  rose: { hue: 320, saturation: 92, lightness: 48 },
  ruby: { hue: 10, saturation: 92, lightness: 48 },
  saffron: { hue: 45, saturation: 92, lightness: 48 },
  sapphire: { hue: 210, saturation: 92, lightness: 48 },
  scarlet: { hue: 5, saturation: 92, lightness: 48 },
  seafoam: { hue: 140, saturation: 92, lightness: 48 },
  steel: { hue: 205, saturation: 92, lightness: 48 },
  tangerine: { hue: 25, saturation: 92, lightness: 48 },
  teal: { hue: 160, saturation: 92, lightness: 48 },
  vermillion: { hue: 15, saturation: 92, lightness: 48 },
  violet: { hue: 250, saturation: 92, lightness: 48 },
};

/** The archive's canonical colour for a word, or null if it is not a hue root. */
export function rootColorFor(normalizedToken: string): RootColor | null {
  return HUE_ROOT_COLORS[normalizedToken] ?? null;
}
