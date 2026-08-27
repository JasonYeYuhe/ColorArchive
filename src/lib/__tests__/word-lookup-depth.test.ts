import { describe, expect, it } from "vitest";

import { recordLookup } from "@/src/lib/word-lookup-depth";

/**
 * The assertion that matters is the one that was WRONG in production for four
 * minutes on 2026-08-27: a fragment and the word it was typed through must
 * count once, not twice. A test that only checked "distinct words increment"
 * would have passed against the broken version.
 */
describe("recordLookup", () => {
  it("counts distinct lookups", () => {
    const seen = new Set<string>();
    expect(recordLookup(seen, "harbor")).toBe(1);
    expect(recordLookup(seen, "lantern")).toBe(2);
    expect(recordLookup(seen, "orchard")).toBe(3);
  });

  it("collapses the fragment a word was typed through", () => {
    const seen = new Set<string>();
    expect(recordLookup(seen, "mid")).toBe(1);
    // The defect: this used to return 2 and read as "went a word further".
    expect(recordLookup(seen, "midnight")).toBe(1);
    expect([...seen]).toEqual(["midnight"]);
  });

  it("collapses a whole hesitant burst, not just the last fragment", () => {
    const seen = new Set<string>();
    recordLookup(seen, "m");
    recordLookup(seen, "mid");
    recordLookup(seen, "midni");
    expect(recordLookup(seen, "midnight jazz")).toBe(1);
    expect([...seen]).toEqual(["midnight jazz"]);
  });

  it("only collapses in the direction typing produces — never the reverse", () => {
    const seen = new Set<string>();
    expect(recordLookup(seen, "midnight")).toBe(1);
    // "mid" arriving AFTER "midnight" is a new, shorter lookup, not a fragment
    // of it. Collapsing here would silently erase a real lookup.
    expect(recordLookup(seen, "mid")).toBe(2);
    expect([...seen].sort()).toEqual(["mid", "midnight"]);
  });

  it("leaves words that merely share a stem alone", () => {
    const seen = new Set<string>();
    recordLookup(seen, "lantern");
    expect(recordLookup(seen, "latern")).toBe(2);
  });

  it("re-recording the same word is idempotent", () => {
    const seen = new Set<string>();
    recordLookup(seen, "harbor");
    expect(recordLookup(seen, "harbor")).toBe(1);
  });

  it("keeps counting past the free limit — the blind spot it exists to fill", () => {
    const seen = new Set<string>();
    let depth = 0;
    for (const w of ["one", "two", "three", "four", "five", "six", "seven"]) {
      depth = recordLookup(seen, w);
    }
    // `count` stops dead at FREE_GENERATIONS (5). This must not.
    expect(depth).toBe(7);
  });

  it("does not treat an unrelated word as a fragment just because it is short", () => {
    const seen = new Set<string>();
    recordLookup(seen, "a b");
    expect(recordLookup(seen, "b a")).toBe(2);
  });
});
