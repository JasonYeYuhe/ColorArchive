import { describe, expect, it } from "vitest";

import {
  LEGACY_PERMANENT,
  UNLOCK_WINDOW_MS,
  isUnlockValid,
  newUnlockValue,
} from "@/src/lib/word-unlock";

const NOW = 1_757_000_000_000; // fixed epoch ms; no clock in tests

describe("the six grandfathered browsers keep what they were given", () => {
  it('honours the legacy "1" forever', () => {
    expect(isUnlockValid(LEGACY_PERMANENT, NOW)).toBe(true);
    // A century later. "Forever" has to mean forever, or the grandfather
    // clause is just a slow revocation.
    expect(isUnlockValid(LEGACY_PERMANENT, NOW + 100 * 365 * 24 * 3600 * 1000)).toBe(true);
  });

  it('does not treat "1" as an expiry object (the JSON.parse trap)', () => {
    // JSON.parse("1") === 1, which has no .exp, so a parse-first implementation
    // returns false here and silently revokes every grandfathered browser.
    // This assertion is the entire reason word-unlock.ts exists as a module.
    expect(JSON.parse(LEGACY_PERMANENT)).toBe(1);
    expect(isUnlockValid(LEGACY_PERMANENT, NOW)).toBe(true);
  });
});

describe("a new unlock is a bounded 24-hour pass", () => {
  it("is valid immediately and just inside the window", () => {
    const v = newUnlockValue(NOW);
    expect(isUnlockValid(v, NOW)).toBe(true);
    expect(isUnlockValid(v, NOW + UNLOCK_WINDOW_MS - 1)).toBe(true);
  });

  it("has actually expired at the boundary and after", () => {
    const v = newUnlockValue(NOW);
    expect(isUnlockValid(v, NOW + UNLOCK_WINDOW_MS)).toBe(false);
    expect(isUnlockValid(v, NOW + UNLOCK_WINDOW_MS + 1)).toBe(false);
  });

  it("is 24 hours, derived rather than asserted as a literal", () => {
    const v = JSON.parse(newUnlockValue(NOW)) as { exp: number };
    expect(v.exp - NOW).toBe(UNLOCK_WINDOW_MS);
    expect(UNLOCK_WINDOW_MS).toBe(24 * 60 * 60 * 1000);
  });
});

describe("nothing else counts as unlocked", () => {
  it.each([
    ["null (never unlocked)", null],
    ["empty string", ""],
    ["garbage", "not json"],
    ["an object with no exp", '{"foo":1}'],
    ["a non-numeric exp", '{"exp":"tomorrow"}'],
    ["a bare number that is not the legacy flag", "2"],
    ["an array", "[]"],
  ])("%s is locked", (_label, raw) => {
    expect(isUnlockValid(raw as string | null, NOW)).toBe(false);
  });
});
