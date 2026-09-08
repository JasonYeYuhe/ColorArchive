import { describe, expect, it } from "vitest";

import { getGuideSeedWord } from "@/src/lib/guide-seed-word";
import { GUIDE_SEED_POOL, wordToColorSeeds } from "@/src/lib/word-to-color-seeds";
import { landingGuides } from "@/src/lib/guides";

/**
 * Adding a /word-to-color/ page must not move any guide's seed word.
 *
 * `getGuideSeedWord()` falls back to `POOL[hashSlug(slug) % POOL.length]`. The
 * index is a function of the LIST LENGTH, so appending one word renumbers the
 * whole mapping. Measured 2026-09-08, adding the 27 missing hue roots to the
 * shared list: of 333 guides, 55 use the fallback and 54 of those 55 changed
 * the word they linked to. Nothing would have failed; 54 internal links would
 * simply have started pointing somewhere else, on the content→tool path that
 * W1 is currently measuring.
 *
 * So the pools are split: GUIDE_SEED_POOL is frozen, wordToColorSeeds grows.
 * These tests are what make the split hold.
 */
describe("guide seed words are stable when the word-to-color list grows", () => {
  it("the guide pool is frozen at 474 and is not the routing list", () => {
    // If these are ever equal again, the split has been undone and the mapping
    // is once more hostage to the sitemap.
    expect(GUIDE_SEED_POOL.length).toBe(474);
    expect(wordToColorSeeds.length).toBeGreaterThan(GUIDE_SEED_POOL.length);
  });

  it("every guide's fallback word is still a real word-to-color page", () => {
    // The frozen pool must stay a SUBSET of the routed list, or a guide would
    // link to a 404. This is the failure the freeze could otherwise cause.
    const routed = new Set(wordToColorSeeds);
    for (const w of GUIDE_SEED_POOL) {
      expect(routed.has(w), `guide pool word "${w}" has no /word-to-color/ page`).toBe(true);
    }
  });

  it("a known sample of guides keeps the exact word it had before the split", () => {
    // Captured from HEAD 51adfe2 (pre-split) by running getGuideSeedWord over
    // landingGuides. These six are all fallback users — the ones that move.
    const PINNED: Record<string, string> = {
      "design-system-palette": "oslo",
      "accessible-color-palette": "denim",
      "color-blind-friendly-palette": "mocha",
      "color-palette-for-apps": "hailstorm",
      "tints-shades-color-scale": "blue hour",
      "data-visualization-color-palettes": "scandinavia",
    };
    for (const [slug, word] of Object.entries(PINNED)) {
      const guide = (landingGuides as { slug: string; tags?: string[] }[]).find(
        (g) => g.slug === slug
      );
      expect(guide, `fixture guide "${slug}" no longer exists`).toBeTruthy();
      expect(getGuideSeedWord(slug, guide!.tags ?? [])).toBe(word);
    }
  });
});
