import { describe, expect, it } from "vitest";

import {
  decideGate,
  exportLimitFor,
  FREE_EXPORTS_PER_DAY,
  shouldWatermark,
  isEntitlementResolved,
  type GateTier,
} from "@/src/lib/pro-gate-policy";

/**
 * Guards for the twenty export gates.
 *
 * On 2026-07-20 the only paying customer this site has ever had was blocked by
 * the paywall 20+ times after paying. That instance was fixed; the shape that
 * produced it was still live on 2026-08-18, in three forms — each of which has
 * a test here that fails if the old behaviour returns.
 *
 * The invariant worth stating plainly: a request that FAILED is not a customer
 * who is anonymous. Every assertion below is downstream of that one sentence.
 */

const LIMIT = 3;
const ALL_TIERS: GateTier[] = ["anonymous", "free", "pro"];

describe("entitlement is known", () => {
  it("a Pro user is never locked, no matter how many exports are counted", () => {
    // The 2026-07-20 shape: a subscriber whose localStorage counter is at or
    // past the free limit (e.g. from before they upgraded) must not be gated.
    const d = decideGate({ tier: "pro", resolved: true, used: 99, limit: LIMIT });
    expect(d.locked).toBe(false);
    expect(d.charge).toBe(false);
    expect(d.remaining).toBeNull();
  });

  it("a free user under the limit can export, and it costs a credit", () => {
    const d = decideGate({ tier: "free", resolved: true, used: 1, limit: LIMIT });
    expect(d).toEqual({ locked: false, charge: true, remaining: 2 });
  });

  it("a free user at the limit is locked", () => {
    expect(decideGate({ tier: "free", resolved: true, used: 3, limit: LIMIT }).locked).toBe(true);
  });

  it("an anonymous visitor at the limit is locked", () => {
    expect(decideGate({ tier: "anonymous", resolved: true, used: 3, limit: LIMIT }).locked).toBe(true);
  });

  it("remaining never goes negative", () => {
    expect(decideGate({ tier: "free", resolved: true, used: 99, limit: LIMIT }).remaining).toBe(0);
  });
});

describe("entitlement is NOT known", () => {
  // resolved=false covers both "still loading" and "the session request failed".
  // The second is the one that cost a customer: AuthProvider reports a failed
  // request as tier="anonymous", so without this branch a Pro subscriber is
  // indistinguishable from a stranger the moment the API blips.

  for (const tier of ALL_TIERS) {
    it(`never locks a ${tier} user while entitlement is unknown, even past the limit`, () => {
      const d = decideGate({ tier, resolved: false, used: 99, limit: LIMIT });
      expect(d.locked).toBe(false);
    });

    it(`never charges a ${tier} user while entitlement is unknown`, () => {
      // The pre-resolution window: clicks used to land while tier was still the
      // "anonymous" default, burning free credits a Pro user does not spend.
      expect(decideGate({ tier, resolved: false, used: 0, limit: LIMIT }).charge).toBe(false);
    });

    it(`shows no quota counter to a ${tier} user while entitlement is unknown`, () => {
      // "Free: 0/3 today" rendered at a paying subscriber is the same error,
      // just quieter.
      expect(decideGate({ tier, resolved: false, used: 0, limit: LIMIT }).remaining).toBeNull();
    });
  }
});

describe("invariants", () => {
  it("charging and locking are mutually exclusive with Pro, always", () => {
    for (const resolved of [true, false]) {
      for (const used of [0, 2, 3, 50]) {
        const d = decideGate({ tier: "pro", resolved, used, limit: LIMIT });
        expect(d.locked, `pro locked at used=${used} resolved=${resolved}`).toBe(false);
        expect(d.charge, `pro charged at used=${used} resolved=${resolved}`).toBe(false);
      }
    }
  });

  it("a lock is only ever reachable from a KNOWN, non-Pro entitlement", () => {
    for (const tier of ALL_TIERS) {
      for (const resolved of [true, false]) {
        for (const used of [0, 3, 99]) {
          const d = decideGate({ tier, resolved, used, limit: LIMIT });
          if (d.locked) {
            expect(resolved, "locked while entitlement was unknown").toBe(true);
            expect(tier).not.toBe("pro");
          }
        }
      }
    }
  });
});

describe("watermark", () => {
  it("never brands a Pro export", () => {
    expect(shouldWatermark({ tier: "pro", resolved: true })).toBe(false);
  });

  it("brands free and anonymous once entitlement is known", () => {
    expect(shouldWatermark({ tier: "free", resolved: true })).toBe(true);
    expect(shouldWatermark({ tier: "anonymous", resolved: true })).toBe(true);
  });

  it("never brands while entitlement is unknown", () => {
    // The irreversible one: a Pro subscriber who clicked Download in the first
    // moment of the page view got "colorarchive.org" written into a file they
    // then saved and possibly sent on. A lock can be retried; this cannot.
    for (const tier of ["anonymous", "free", "pro"] as GateTier[]) {
      expect(shouldWatermark({ tier, resolved: false })).toBe(false);
    }
  });
});

describe("isEntitlementResolved", () => {
  it("is false while loading", () => {
    expect(isEntitlementResolved({ status: "loading", sessionError: false })).toBe(false);
  });

  it("is false when the session request FAILED, even though tier reads anonymous", () => {
    // AuthProvider collapses a failed request into tier="anonymous". Without
    // this, every paid surface reads an outage as "this person never paid".
    expect(isEntitlementResolved({ status: "anonymous", sessionError: true })).toBe(false);
    expect(isEntitlementResolved({ status: "authenticated", sessionError: true })).toBe(false);
  });

  it("is true only on a clean, settled session", () => {
    expect(isEntitlementResolved({ status: "anonymous", sessionError: false })).toBe(true);
    expect(isEntitlementResolved({ status: "authenticated", sessionError: false })).toBe(true);
  });
});

/**
 * G1 (2026-09-05): the tier→limit map, and the claim it settles.
 *
 * A reviewer asserted that "changing the policy number does not take effect at
 * runtime". It does: `limit` is the only numeric input to both `locked` and
 * `remaining`. These cases make that checkable by running the suite instead of
 * by reading the function, which is the whole reason the map moved out of the
 * component and into this module.
 */
describe("free export limits by tier", () => {
  it("gives a signed-in free account more than an anonymous one", () => {
    // Before G1 both were 3, while the locked overlay said "Sign in for more".
    // If these two ever become equal again, that promise is a lie again.
    expect(exportLimitFor("free")).toBeGreaterThan(exportLimitFor("anonymous"));
  });

  it("matches the AI quota's numbers (anonymous 3 / free 10)", () => {
    // server/ai-rate-limit.js TIER_LIMITS. Two different daily quotas with two
    // different numbers is a rule nobody can hold in their head.
    expect(exportLimitFor("anonymous")).toBe(3);
    expect(exportLimitFor("free")).toBe(10);
  });

  it("the limit genuinely drives locking — the disputed claim, run rather than argued", () => {
    const used = 5;
    // Same tier, same usage, different limit → opposite outcomes.
    expect(decideGate({ tier: "free", resolved: true, used, limit: 3 }).locked).toBe(true);
    expect(decideGate({ tier: "free", resolved: true, used, limit: 10 }).locked).toBe(false);
    expect(decideGate({ tier: "free", resolved: true, used, limit: 10 }).remaining).toBe(5);
  });

  it("a signed-in free user is NOT locked at 4 exports, an anonymous one is", () => {
    // The concrete behaviour change a visitor experiences after signing in.
    const used = 4;
    expect(
      decideGate({ tier: "anonymous", resolved: true, used, limit: exportLimitFor("anonymous") })
        .locked,
    ).toBe(true);
    expect(
      decideGate({ tier: "free", resolved: true, used, limit: exportLimitFor("free") }).locked,
    ).toBe(false);
  });

  it("still never applies a limit to Pro", () => {
    // Guard against the map growing a "pro" key and implying a ceiling.
    const d = decideGate({ tier: "pro", resolved: true, used: 999, limit: 3 });
    expect(d.locked).toBe(false);
    expect(d.remaining).toBeNull();
    expect(Object.keys(FREE_EXPORTS_PER_DAY)).toEqual(["anonymous", "free"]);
  });
});
