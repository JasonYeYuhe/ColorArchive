import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { describe, expect, it } from "vitest";

import { collections } from "@/src/lib/collections";
import { COLOR_FAMILY_PAGES } from "@/src/lib/color-family-pages";
import { landingGuides } from "@/src/lib/guides";

/**
 * Every "Open next" pill on a guide page must point at a route that exists.
 *
 * WHY THIS IS A TEST AND NOT A BUILD-TIME THROW — the obvious place for this
 * guard is a module-load assertion in guides.ts, mirroring the `Unknown color id`
 * throw that already fails the build for collections. That would be wrong here:
 * guides.ts is imported by client components, so importing `collections` (251
 * entries) and the family tables into it to run the check would drag both
 * datasets into the browser bundle. This repo has already shipped that exact
 * regression once — 1.38MB client chunks caused by newsletter/guides datasets
 * leaking through co-located helpers. A vitest case gets the same protection
 * (CI runs `npm test` on every push to main) and costs the bundle nothing.
 *
 * WHAT IT CAUGHT WHEN INTRODUCED — 137 dead link instances across 95 of 333
 * guides, 58 distinct dead targets, 8 guides whose entire "Open next" row was
 * 404s. The measured consequence: over 12 clean days, /guides/* took 272 sessions
 * and produced only 19 tool clicks. The single most-read guide,
 * color-theory-fundamentals-guide, had all three of its forward links dead.
 *
 * The dead targets were not random. They were whole namespaces that had been
 * renamed and never swept: /tools/* (the prefix was dropped, every tool still
 * exists at the top level), /colors/ (the archive index is /all-colors/), and
 * /families/<colour-root>/ (only 9 family pages exist, and they are families,
 * not the 48 colour roots). A single stale link is a typo; a stale namespace is
 * what this test exists to catch.
 */

function staticRoutes(dir = "app", prefix = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    // Skip dynamic segments, route groups, private folders.
    if (/^[[(_.]/.test(entry)) continue;
    const path = `${dir}/${entry}`;
    if (!statSync(path).isDirectory()) continue;
    const route = `${prefix}/${entry}`;
    if (existsSync(`${path}/page.tsx`)) out.push(`${route}/`);
    out.push(...staticRoutes(path, route));
  }
  return out;
}

/**
 * A redirect source is a working URL, not a dead one. Missing this cost me a
 * real mistake while writing this test: /packs is not a route, so a first pass
 * flagged six guide links as dead and "fixed" them to /free-resources/ — quietly
 * changing their destination, because next.config.ts has redirected /packs to
 * /pro/ all along. Read the sources rather than re-deriving the route table.
 */
function redirectSources(): string[] {
  const config = readFileSync("next.config.ts", "utf8");
  const block = config.slice(config.indexOf("async redirects()"), config.indexOf("async headers()"));
  return [...block.matchAll(/source:\s*"([^"]+)"/g)].map((match) => match[1]);
}

const routes = new Set(staticRoutes());
routes.add("/");
for (const source of redirectSources()) {
  // Ignore parameterised sources (/packs/:slug); the literal prefixes alongside
  // them already cover what guides link to.
  if (source.includes(":")) continue;
  routes.add(source.endsWith("/") ? source : `${source}/`);
}

const collectionIds = new Set(collections.map((collection) => collection.id));
const familySlugs = new Set(COLOR_FAMILY_PAGES.map((page) => page.slug));
const guideSlugs = new Set(landingGuides.map((guide) => guide.slug));

function resolves(href: string): boolean {
  const path = href.split("?")[0].split("#")[0];
  // trailingSlash: true, so compare in that shape.
  const normalized = path.endsWith("/") ? path : `${path}/`;

  if (routes.has(normalized)) return true;

  const collection = normalized.match(/^\/collections\/(.+)\/$/);
  if (collection) return collectionIds.has(decodeURIComponent(collection[1]));

  const family = normalized.match(/^\/families\/(.+)\/$/);
  if (family) return familySlugs.has(family[1]);

  const guide = normalized.match(/^\/guides\/(.+)\/$/);
  if (guide) return guideSlugs.has(guide[1]);

  // Dynamic route families whose params are generated from the colour data.
  if (/^\/colors\/[^/]+\/$/.test(normalized)) return true;
  if (/^\/word-to-color\/[^/]+\/$/.test(normalized)) return true;

  return false;
}

describe("guide links", () => {
  it("every links[].href resolves to a real route", () => {
    const dead: string[] = [];
    for (const guide of landingGuides) {
      for (const link of guide.links ?? []) {
        if (!resolves(link.href)) {
          dead.push(`${guide.slug} → ${link.href} ("${link.label}")`);
        }
      }
    }
    // Listed in full rather than counted: a bare number tells whoever broke it
    // nothing, and these are always fixed one target at a time.
    expect(dead, `dead guide links:\n${dead.join("\n")}`).toEqual([]);
  });

  it("no guide is a dead end — every guide offers at least one forward link", () => {
    const stranded = landingGuides
      .filter((guide) => (guide.links ?? []).length === 0)
      .map((guide) => guide.slug);
    expect(stranded, `guides with no links at all:\n${stranded.join("\n")}`).toEqual([]);
  });

  it("featuredCollectionId, when set, names a collection that exists", () => {
    // A stale id silently drops the Featured Collection card — no error, no
    // card, no way to notice from the outside.
    const broken = landingGuides
      .filter((guide) => guide.featuredCollectionId)
      .filter((guide) => !collectionIds.has(guide.featuredCollectionId as string))
      .map((guide) => `${guide.slug} → ${guide.featuredCollectionId}`);
    expect(broken, `guides pointing at a missing collection:\n${broken.join("\n")}`).toEqual([]);
  });
});
