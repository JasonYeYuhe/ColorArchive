import { landingGuides } from "@/src/lib/guides";
import { guideSeoTitles } from "@/src/lib/guide-seo";

/**
 * The <title> for a guide page: the shortest phrase that is still unique.
 *
 * SERVER ONLY — do not import this from a client component. It pulls in the full
 * landingGuides dataset, and guide-seo.ts (which it reads the hand-written titles
 * from) is already imported by guide-detail-page.tsx, a client component. Putting
 * this function in that file instead would drag the whole guides corpus into the
 * browser bundle, which this repo has already shipped once as 1.38MB of client
 * chunks. Hence the separate module.
 *
 * WHY DERIVE AT ALL. 327 of 333 guide titles ran past the ~60-character point
 * where a search result gets cut, median 87 — so most results ended mid-phrase.
 * The obvious fix, truncating, is the wrong one: these titles are deliberate
 * keyword phrases and a blind cut removes the keyword as often as the filler.
 *
 * WHAT THIS DOES INSTEAD. The titles already carry their own structure — a
 * keyword phrase, then a colon or a connective, then an elaboration:
 *
 *   "WCAG Color Accessibility Guide: Contrast Ratios, Color-Blind Design, and …"
 *   "Brand Color Palette Ideas That Hold Up Beyond the Launch"
 *   "Figma Color Tokens and the Fastest Route to a Shared Color System"
 *
 * Cutting at the author's own boundary keeps the keyword and drops the tail.
 *
 * AND WHY IT IS NOT JUST THE FIRST CUT. Taking the shortest phrase for every
 * guide produced 12 groups of pages sharing a <title> — trading "too long" for
 * "duplicate", which is the worse of the two and a problem this same audit
 * flagged elsewhere. So each guide takes the SHORTEST phrase not already claimed
 * by another, falling back through the longer cuts and finally to the full title.
 * Result: 12 titles still over 60 (from 327), zero duplicates, median 43.
 */

// Boundaries the guide titles actually use, longest-first so " and the " wins
// over " and " and the phrase does not get cut a word early.
const CLAUSE_BOUNDARIES = [
  ": ",
  " That ",
  " Without ",
  " for ",
  " and the ",
  " and ",
  " When ",
  " with ",
  " in ",
] as const;

// Below this a phrase stops being a keyword and starts being a fragment
// ("Color", "Palette"), so the full title is better than the cut.
const MIN_PHRASE_LENGTH = 18;

const BRAND_SUFFIX = " | ColorArchive";
const SERP_TITLE_MAX = 60;

/** Progressively longer candidates: shortest clause first, full title last. */
function candidates(title: string): string[] {
  const cuts = CLAUSE_BOUNDARIES.map((boundary) => title.indexOf(boundary))
    .filter((index) => index > 0)
    .sort((a, b) => a - b);

  const phrases = cuts
    .map((index) => title.slice(0, index).trim().replace(/[,–—-]$/, "").trim())
    .filter((phrase) => phrase.length >= MIN_PHRASE_LENGTH);

  return [...new Set([...phrases, title])];
}

/**
 * Built once, over every guide, because uniqueness is a property of the whole
 * set — a guide cannot know on its own whether its short phrase is taken. Order
 * follows landingGuides so the result is deterministic across builds.
 */
const titleBySlug = ((): Map<string, string> => {
  const result = new Map<string, string>();
  const claimed = new Set<string>(Object.values(guideSeoTitles));

  for (const guide of landingGuides) {
    const handWritten = guideSeoTitles[guide.slug];
    if (handWritten) {
      result.set(guide.slug, handWritten);
      continue;
    }

    const phrase = candidates(guide.title).find((option) => !claimed.has(option)) ?? guide.title;
    claimed.add(phrase);

    // The brand suffix is a nicety, not a requirement — drop it rather than let
    // it push the title past the cut.
    const withBrand = `${phrase}${BRAND_SUFFIX}`;
    result.set(guide.slug, withBrand.length <= SERP_TITLE_MAX ? withBrand : phrase);
  }

  return result;
})();

export function getGuideSeoTitle(slug: string, fallbackTitle: string): string {
  return titleBySlug.get(slug) ?? `${fallbackTitle}${BRAND_SUFFIX}`;
}

/** Exposed for the test that guards uniqueness and length. */
export const guideSeoTitleEntries = () => [...titleBySlug.entries()];
