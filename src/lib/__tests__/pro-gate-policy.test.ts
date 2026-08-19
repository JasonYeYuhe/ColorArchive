import { describe, expect, it } from "vitest";

import {
  decideGate,
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
