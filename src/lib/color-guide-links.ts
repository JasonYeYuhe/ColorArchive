import type { ColorFamily, ColorRecord } from "@/src/types/color";
import { landingGuides, type LandingGuide } from "@/src/lib/guides";

/**
 * Server-only helper: pick a few editorial guides relevant to a given color so
 * that every /colors/[slug]/ page links out to /guides/[slug]/ pages.
 *
 * Why this exists (SEO): the 5,446 color pages are the site's deepest, most
 * crawled surface, but they emitted ZERO links to the guides. The guides are
 * the pages stuck on Google page 2. Passing internal-link authority from the
 * color pages to the guides is the single highest-certainty "page 2 -> page 1"
 * lever. This module is imported only by the server color route, so the heavy
 * guides.ts data never ships to the client bundle.
 */

export interface ColorGuideLink {
  slug: string;
  title: string;
  eyebrow: string;
}

const FAMILIES: ColorFamily[] = [
  "Red",
  "Orange",
  "Yellow",
  "Lime",
  "Green",
  "Teal",
  "Blue",
  "Purple",
  "Pink",
];

// Categories that are useful next-reads for ANY color. Used to fill in when a
// family has few/no colour-specific guides. Ordered by general usefulness.
const EVERGREEN_CATEGORIES = new Set([
  "Color Theory",
  "Color Psychology",
  "Accessibility",
  "Brand & Marketing",
  "Color Systems",
  "UI Design",
  "Design Systems",
]);

function familyMatches(guide: LandingGuide, family: ColorFamily): boolean {
  // Whole-word match so "Green" does not match "evergreen", etc.
  const re = new RegExp(`\\b${family.toLowerCase()}\\b`, "i");
  if (re.test(guide.title)) return true;
  return guide.tags.some((tag) => re.test(tag));
}

// Precomputed once at module load (build time / server start).
const familyIndex = new Map<ColorFamily, LandingGuide[]>();
for (const family of FAMILIES) {
  familyIndex.set(
    family,
    landingGuides
      .filter((guide) => familyMatches(guide, family))
      .sort((a, b) => b.priority - a.priority),
  );
}

const evergreenPool = landingGuides
  .filter((guide) => EVERGREEN_CATEGORIES.has(guide.category))
  .sort((a, b) => b.priority - a.priority);

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Returns up to `limit` guide links for a color. Picks 1-2 family-specific
 * guides, then fills from the evergreen pool. Selection is rotated by the
 * color id so sibling colors in the same family don't all link to the exact
 * same guides — this spreads link equity and avoids a uniform footprint.
 */
export function getGuidesForColor(color: ColorRecord, limit = 3): ColorGuideLink[] {
  const picks: LandingGuide[] = [];
  const seen = new Set<string>();
  const add = (guide?: LandingGuide) => {
    if (guide && !seen.has(guide.slug) && picks.length < limit) {
      seen.add(guide.slug);
      picks.push(guide);
    }
  };

  const familyGuides = familyIndex.get(color.family) ?? [];
  if (familyGuides.length > 0) {
    const start = hashId(color.id) % familyGuides.length;
    add(familyGuides[start]);
    if (familyGuides.length > 1) add(familyGuides[(start + 1) % familyGuides.length]);
  }

  if (evergreenPool.length > 0) {
    const start = hashId(`${color.id}-evergreen`) % evergreenPool.length;
    for (let i = 0; i < evergreenPool.length && picks.length < limit; i += 1) {
      add(evergreenPool[(start + i) % evergreenPool.length]);
    }
  }

  return picks.map((guide) => ({
    slug: guide.slug,
    title: guide.title,
    eyebrow: guide.category,
  }));
}
