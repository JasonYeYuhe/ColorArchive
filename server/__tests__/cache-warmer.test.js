/**
 * Tests for server/cache-warmer.js — long-tail color page warm scheduler.
 *
 * Run with:
 *   node --test server/__tests__/cache-warmer.test.js
 *
 * The warmer picks the set of `/colors/<slug>` routes that are NOT
 * prerendered at build time (~3,000 long-tail slugs) and HEADs them on a
 * weekly cron so Vercel's edge cache stays warm. The critical invariant is
 * that `isPrerendered` matches app/colors/[slug]/page.tsx generateStaticParams
 * exactly — if it ever drifts, we'll either re-warm already-cached pages
 * (wasted egress) or skip the colors that actually need warming (the whole
 * point of the job).
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const { isPrerendered, getLongTailSlugs } = require("../cache-warmer");

describe("isPrerendered — mirrors app/colors/[slug]/page.tsx", () => {
  test("all neutral gray slugs count as prerendered", () => {
    for (const root of ["warm-gray", "true-gray", "cool-gray"]) {
      assert.equal(isPrerendered(`${root}-whisper`), true);
      assert.equal(isPrerendered(`${root}-shadow`), true);
      assert.equal(isPrerendered(`${root}-ink`), true);
    }
  });

  test("taupe and sage grays are NOT prerendered (not in original neutral set)", () => {
    assert.equal(isPrerendered("taupe-gray-tone"), false);
    assert.equal(isPrerendered("sage-gray-bloom"), false);
  });

  test("original hue × original chroma = prerendered", () => {
    assert.equal(isPrerendered("amber-core-vivid"), true);
    assert.equal(isPrerendered("cobalt-shadow-pure"), true);
    assert.equal(isPrerendered("emerald-bloom-soft"), true);
  });

  test("new hues (Scarlet, Vermillion, etc.) are long-tail", () => {
    assert.equal(isPrerendered("scarlet-core-vivid"), false);
    assert.equal(isPrerendered("vermillion-bloom-clear"), false);
    assert.equal(isPrerendered("tangerine-tone-vivid"), false);
  });

  test("new chroma bands (dust, bright) are long-tail even on original hues", () => {
    assert.equal(isPrerendered("amber-core-dust"), false);
    assert.equal(isPrerendered("cobalt-shadow-bright"), false);
  });
});

describe("getLongTailSlugs", () => {
  test("returns a non-empty subset that excludes prerendered", () => {
    const slugs = getLongTailSlugs();
    assert.ok(slugs.length > 1000, `expected >1000 long-tail slugs, got ${slugs.length}`);
    for (const slug of slugs.slice(0, 50)) {
      assert.equal(isPrerendered(slug), false, `slug ${slug} leaked through`);
    }
  });

  test("all returned slugs are lowercased and url-safe", () => {
    const slugs = getLongTailSlugs();
    for (const slug of slugs.slice(0, 100)) {
      assert.match(slug, /^[a-z0-9-]+$/);
    }
  });
});
