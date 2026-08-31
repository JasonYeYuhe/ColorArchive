import { wordToColorSeeds } from "@/src/lib/word-to-color-seeds";

/**
 * The word a guide's in-body word→colour card is prefilled with.
 *
 * WHY A PREFILL AT ALL. dev-plan-2026-08-31-next §5 W1: the card has to be a
 * "带上下文预填的工具入口" — a tool entry that already shows a result — not an empty
 * input. An empty input is a second thing to do; a filled one is a demonstration.
 * The measured problem it addresses is that 98.4% of content-page sessions never
 * touch a tool while tool-page sessions convert at ~77%.
 *
 * WHY IT IS DERIVED AND NOT WRITTEN. There are 333 guides. Hand-writing a word
 * for each is 333 rows of prose that will rot the first time a guide is retitled.
 * Both inputs here already exist and are already maintained: the guide's own tags
 * and the 474 curated seeds behind the prerendered /word-to-color/[word]/ pages.
 *
 * THE RULE, in one line: use the guide's own SUBJECT when it has one, otherwise a
 * curated evocative word chosen deterministically from its slug.
 *
 * WHY TAGS AND NOT `searchIntent`. `searchIntent` is the raw SEO keyword phrase —
 * "color surface finish perception", "names css named" — and naive tokenisation of
 * it cuts across phrase boundaries. Measured over all 333 guides it produces 59
 * outright nonsense words. Tags are curated nouns and 99.1% of them are one or two
 * words (192 one-word, 138 two-word, 3 three-word).
 *
 * WHY META TAGS ARE REJECTED. A tag naming the CRAFT rather than the SUBJECT reads
 * wrong in the card's own sentence. "See the colour of healthcare" works; "see the
 * colour of design systems" does not — the reader is already looking at a page
 * about design systems, so it says nothing. `META_WORDS` is that filter, and a
 * rejected guide falls through to a curated seed rather than to a worse tag.
 *
 * MEASURED COVERAGE over all 333 guides (scripts in the 2026-08-31 session
 * scratchpad, re-runnable from `landingGuides`):
 *   278 (83.5%) — own subject tag: healthcare, fintech, wayfinding, pet care,
 *                 automotive, travel, gaming, packaging, legal, real estate
 *    55 (16.5%) — curated seed: nostalgia, magic, vivid, driftwood, santorini
 *     0          — nonsense. Every output is a real, grammatical word.
 *
 * NOT IMPORTABLE FROM A CLIENT COMPONENT — not because of this file, which is
 * tiny, but because the caller must pass a guide's tags in, and reaching for them
 * from the client means importing `src/lib/guides.ts`. That module has ~20
 * top-level `landingGuides.push(...)` calls plus a dedupe IIFE, so it does not
 * tree-shake: a value import into a "use client" file costs 1.42MB and reinstates
 * the two 1.38MB chunks removed in 96ff99e. Compute in the Server Component
 * (app/guides/[slug]/page.tsx) and pass the resulting string down as a prop.
 */

/**
 * Tag words that name the discipline rather than the thing being designed for.
 * A tag containing ANY of these is skipped — "Color Theory", "Design Systems",
 * "WCAG", "Best Practice" all describe the page the reader is already on.
 */
const META_WORDS = new Set([
  "color", "colour", "design", "system", "systems", "token", "tokens", "theory",
  "practice", "guide", "guides", "principle", "principles", "process",
  "accessibility", "wcag", "contrast", "advanced", "inspiration", "palette",
  "palettes", "scheme", "schemes", "method", "workflow", "management", "research",
  "strategy", "audit", "testing", "documentation", "naming", "conversion",
  "optimization", "psychology", "history", "trend", "trends", "basics",
  "fundamental", "fundamentals", "ux", "ui", "best", "tools", "tooling",
  "download", "export", "reference", "showcase", "case", "study", "studies",
  "tips", "ideas", "examples",
]);

/** Lowercase, strip punctuation, collapse whitespace. "UI/UX Design" → "ui ux design". */
function cleanTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[/&]/g, " ")
    .replace(/[^a-z\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSubjectTag(tag: string): boolean {
  const cleaned = cleanTag(tag);
  // The LOWER bound is the load-bearing half. `cleanTag` turns every character
  // outside [a-z\s'-] into a space, so a decade tag — "1970s", "1950s", "1980s",
  // which this corpus really uses — cleans to the single letter "s". Without a
  // minimum length that passes as the guide's subject AND wins over the real
  // subject tags after it, and three guides prefill the card with "s". An upper
  // bound alone does not catch it because "s" is short, not long.
  if (cleaned.length < 2 || cleaned.length > 18) return false;
  const parts = cleaned.split(" ");
  // Three-plus words stop reading as a single looked-up thing.
  if (parts.length > 2) return false;
  return parts.every((part) => !META_WORDS.has(part));
}

/**
 * The same hash `src/lib/word-color.ts` uses, for the same reason: it is stable
 * across builds and machines, so a guide's fallback word never changes on a
 * redeploy. Deliberately NOT `word-color.ts`'s exported behaviour — that one
 * avalanches degenerate inputs to fix a colour bug; here we only need a spread.
 */
function hashSlug(slug: string): number {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/**
 * @param slug  the guide's slug — the only thing the fallback keys on, so the
 *              word is stable for as long as the URL is.
 * @param tags  the guide's `tags` array, in author order. The FIRST subject-like
 *              tag wins, so a guide tagged ["Color Theory", "Healthcare"] gets
 *              "healthcare" rather than falling through to a seed.
 */
export function getGuideSeedWord(slug: string, tags: readonly string[]): string {
  const subject = tags.find(isSubjectTag);
  if (subject) return cleanTag(subject);
  return wordToColorSeeds[hashSlug(slug) % wordToColorSeeds.length];
}
