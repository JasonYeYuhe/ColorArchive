import { readdirSync, readFileSync, statSync } from "fs";
import { describe, expect, it } from "vitest";

import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";
import { landingGuides } from "@/src/lib/guides";
import { colorDecades } from "@/src/lib/color-decades";
import { colorTrends2026 } from "@/src/lib/color-trends";
import { TOOL_COUNT } from "@/src/components/tools-page";

/**
 * Any number a page claims about the archive must match the archive.
 *
 * These drift silently and in both directions. Measured across two audits:
 *
 *   "25 free color tools"   ×3 surfaces   against 44   understated
 *   "23+ practical tools"                 against 44   understated
 *   "20+ free tools"                      against 44   understated by half
 *   "360+ color guides"                   against 333  overstated
 *   "5,000+ colors" / "5,400+ colors"     against 5,446, and one file said
 *                                         both 5,400+ and 5,446 in adjacent
 *                                         strings
 *
 * Nobody lies on purpose — a tool gets added and the prose that mentions it is
 * three files away. So the prose is checked against the data instead of against
 * someone's memory.
 *
 * WHAT COUNTS AS CORRECT. An exact number must match exactly. An "N+" claim is
 * allowed to undershoot, since it is a floor, but not by more than 20% — "20+"
 * against a real 44 is technically true and still misleading, and understating
 * the product is its own kind of wrong.
 */

// The nouns worth guarding, and where the truth lives.
const TRUTH: Record<string, number> = {
  tools: TOOL_COUNT,
  colors: colors.length,
  guides: landingGuides.length,
  collections: collections.length,
  decades: colorDecades.length,
  trends: colorTrends2026.length,
};

// How far below the real number an "N+" floor may sit before it stops being a
// floor and starts being a different claim.
const FLOOR_TOLERANCE = 0.2;

// Below these, the number is describing something local — "6 colors" per decade,
// "0 colors selected", "5 colors in this palette" — not the size of the archive.
// A total claim is always large; this is what separates the two without needing
// to enumerate every phrasing.
const TOTAL_FLOOR: Record<string, number> = {
  colors: 1000,
  tools: 10,
  guides: 20,
  collections: 20,
  decades: 5,
  trends: 5,
};

// Numbers in copy that are not counts of these things. Each needs a reason.
const NOT_A_TOTAL = [
  // "up to 10 colors" — the paste limit on /wcag-audit/, verified against
  // wcag-audit-page.tsx:18 `slice(0, 10)`.
  /up to \d+ colors/i,
  // "11 decades × 6 colors" — the 6 is per decade, not a total.
  /× \d+ colors/i,
  // "at least 2 colors", "Need 2 colors" — input requirements.
  /(at least|need|minimum of) \d+ colors/i,
  // Palette builder capacity, not archive size.
  /up to \d+ (colors|swatches) (in|to) (a |your )?palette/i,
];

/**
 * Everything that can put a number in front of a reader. The first version of
 * this test scanned app/ and src/components/ only and passed clean while
 * src/lib/i18n.ts held eighteen stale claims — a guard with a blind spot reads
 * exactly like a guard without one.
 */
const SCANNED_DIRS = ["app", "src/components", "src/lib"] as const;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const path = `${dir}/${entry}`;
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (path.endsWith(".tsx") || path.endsWith(".ts")) out.push(path);
  }
  return out;
}

interface Claim {
  file: string;
  text: string;
  value: number;
  isFloor: boolean;
  noun: string;
}

function claimsIn(file: string, source: string): Claim[] {
  const found: Claim[] = [];
  // Strip comments first. A comment explaining that "23+ tools" was once wrong
  // is not a claim the site makes, and flagging it would train everyone to
  // ignore this test.
  source = source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  // Only inside string literals — a claim is copy, not an expression.
  for (const literal of source.matchAll(/"([^"\\]{10,400})"|`([^`\\]{10,400})`/g)) {
    const text = literal[1] ?? literal[2] ?? "";
    if (NOT_A_TOTAL.some((pattern) => pattern.test(text))) continue;

    for (const match of text.matchAll(
      /\b([\d,]+)(\+?)\s+(?:free\s+|curated\s+|practical\s+|defining\s+)?(?:color\s+)?(tools|colors|guides|collections|decades|trends)\b/gi,
    )) {
      const value = Number(match[1].replace(/,/g, ""));
      // "2026 color trends" is a year, not a count. Real counts here are 13, 44,
      // 261, 333 and 5,446 — none of which can be confused with a year, and a
      // year never carries a thousands separator in this copy.
      const looksLikeAYear = !match[1].includes(",") && value >= 1990 && value <= 2100;
      if (looksLikeAYear) continue;

      found.push({
        file,
        text: text.length > 90 ? `${text.slice(0, 90)}…` : text,
        value,
        isFloor: match[2] === "+",
        noun: match[3].toLowerCase(),
      });
    }
  }
  return found;
}

const SCANNED_FILES = SCANNED_DIRS.flatMap(sourceFiles).filter((f) => !f.includes("__tests__"));

describe("counts quoted in page copy", () => {
  it("every claim matches the data it describes", () => {
    const wrong: string[] = [];

    for (const file of SCANNED_FILES) {
      for (const claim of claimsIn(file, readFileSync(file, "utf8"))) {
        const truth = TRUTH[claim.noun];
        if (truth === undefined) continue;
        if (claim.value < (TOTAL_FLOOR[claim.noun] ?? 0)) continue;

        if (claim.isFloor) {
          if (claim.value > truth) {
            wrong.push(`${file}\n    claims "${claim.value}+ ${claim.noun}" but there are only ${truth}\n    ${claim.text}`);
          } else if (claim.value < truth * (1 - FLOOR_TOLERANCE)) {
            wrong.push(`${file}\n    claims "${claim.value}+ ${claim.noun}" against ${truth} — a floor this low undersells it\n    ${claim.text}`);
          }
        } else if (claim.value !== truth) {
          wrong.push(`${file}\n    claims "${claim.value} ${claim.noun}" but there are ${truth}\n    ${claim.text}`);
        }
      }
    }

    expect(wrong, `copy that does not match the data:\n\n${wrong.join("\n\n")}`).toEqual([]);
  });

  it("finds the claims it is supposed to be checking", () => {
    // A guard that silently matches nothing is worse than no guard. If a refactor
    // changes how this copy is written, this fails rather than going quiet.
    const total = SCANNED_FILES
      .flatMap((file) => claimsIn(file, readFileSync(file, "utf8")))
      .filter((claim) => TRUTH[claim.noun] !== undefined)
      .filter((claim) => claim.value >= (TOTAL_FLOOR[claim.noun] ?? 0));
    expect(total.length).toBeGreaterThan(8);
  });

  it("the archive size is quoted as ONE figure, not three", () => {
    // The site simultaneously said 5,000+, 5,400+ and 5,446 — 31, 15 and 58
    // times. All three were true (two are floors) and that is the problem: the
    // root layout's site-wide description disagreed with the onboarding tour
    // about how big the product is. Pick one and hold it.
    const figures = new Map<string, string[]>();
    for (const file of SCANNED_FILES) {
      const source = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/^\s*\/\/.*$/gm, " ");
      for (const match of source.matchAll(/\b([45],[0-9]{3}\+?)\s+(?:curated\s+|archive\s+|designer-ready\s+)?colors?\b/gi)) {
        const figure = match[1];
        if (!figures.has(figure)) figures.set(figure, []);
        if (!figures.get(figure)!.includes(file)) figures.get(figure)!.push(file);
      }
    }
    const used = [...figures.keys()];
    expect(
      used.length <= 1,
      `the archive is described with ${used.length} different figures:\n${used
        .map((f) => `  "${f}" in ${figures.get(f)!.length} file(s)`)
        .join("\n")}`,
    ).toBe(true);
  });
});
