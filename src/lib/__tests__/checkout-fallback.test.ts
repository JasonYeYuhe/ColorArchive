import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/**
 * Pins the fix for the 2026-08-31 mis-charge.
 *
 * Customer id41 pressed "yearly" twice and was billed ¥500 on the MONTHLY
 * variant (invoice lsinv_8357021), because `getCheckoutUrl` fell back to the
 * hardcoded link.
 *
 * 🔴 CORRECTED 2026-09-06: that link is NOT "a page with a variant picker". Fetching
 * it and decoding the checkout payload shows `isMultiVariant: false` and a cart holding
 * exactly variant 1540585 "ColorArchive Pro — Monthly" at 49900. The uuid in it is the
 * monthly variant's own slug. So the fallback could only ever sell monthly — it did not
 * "default" to it. Same fix, blunter cause.
 *
 * WHY THIS FILE USES DYNAMIC IMPORT. checkout-config.ts reads `process.env` at
 * MODULE SCOPE, and vitest does not load .env.local, so a plain top-level import
 * resolves `activeProvider` to "none" and every getCheckoutUrl() returns null —
 * a green test that proves nothing. Each case therefore stubs the env first and
 * imports afterwards, with resetModules() so the stub is actually seen.
 * (That trap is the same shape as the bug: a value read once at load time and
 * then assumed to be whatever you set later.)
 */
/**
 * The hardcoded fallback. Verified 2026-09-06 to resolve to variant 1540585
 * "ColorArchive Pro — Monthly", ¥499/mo, published. Pinned here so that swapping the
 * uuid in checkout-config.ts fails a test instead of silently changing what is sold.
 */
const MONTHLY_VARIANT_URL =
  "https://colorarchive.lemonsqueezy.com/checkout/buy/771b252b-14d2-45ed-b4d5-b9f39f0883f8";

async function loadWithEnv(env: Record<string, string | undefined>) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_PAYMENT_PROVIDER", "lemonsqueezy");
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v as string);
  return import("@/src/lib/checkout-config");
}

beforeEach(() => {
  // Production state as of 2026-09-05, verified by grepping the DEPLOYED bundle:
  // an unset NEXT_PUBLIC_* survives as a literal `process.env.X` member
  // expression rather than being replaced by its value, and all three of these
  // printed while NEXT_PUBLIC_PREORDER_CHECKOUT_URL (which IS set) did not.
  vi.stubEnv("NEXT_PUBLIC_PRO_MONTHLY_CHECKOUT_URL", "");
  vi.stubEnv("NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL", "");
  vi.stubEnv("NEXT_PUBLIC_PRO_LIFETIME_CHECKOUT_URL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("checkout URL fallback (no variant links configured)", () => {
  it("monthly may still fall back — the fallback IS the monthly variant", async () => {
    // Deliberate, and evidence-based: the fallback resolves to the monthly variant,
    // so the button's promise and the charge agree by construction. Every external
    // subscription in this site's history (3 of 3) arrived through it, all monthly.
    const { getCheckoutUrl } = await loadWithEnv({});
    expect(getCheckoutUrl("monthly")).toBe(MONTHLY_VARIANT_URL);
  });

  it("yearly returns null rather than the monthly variant", async () => {
    const { getCheckoutUrl } = await loadWithEnv({});
    expect(getCheckoutUrl("yearly")).toBeNull();
  });

  it("lifetime returns null rather than the monthly variant", async () => {
    const { getCheckoutUrl } = await loadWithEnv({});
    expect(getCheckoutUrl("lifetime")).toBeNull();
  });
});

describe("checkout URL when the owner sets the variant links", () => {
  it("uses the variant link for the sellable plans", async () => {
    const { getCheckoutUrl } = await loadWithEnv({
      NEXT_PUBLIC_PRO_MONTHLY_CHECKOUT_URL: "https://colorarchive.lemonsqueezy.com/buy/aaa",
      NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL: "https://colorarchive.lemonsqueezy.com/buy/bbb",
    });
    expect(getCheckoutUrl("monthly")).toBe("https://colorarchive.lemonsqueezy.com/buy/aaa");
    expect(getCheckoutUrl("yearly")).toBe("https://colorarchive.lemonsqueezy.com/buy/bbb");
  });

  it("re-enables yearly on its own — no code change needed once the env var is set", async () => {
    // The whole point of §6 item 1 being a 15-minute owner task: setting the var
    // and redeploying restores the button with no follow-up commit.
    const { getCheckoutUrl } = await loadWithEnv({
      NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL: "https://colorarchive.lemonsqueezy.com/buy/bbb",
    });
    expect(getCheckoutUrl("yearly")).toBe("https://colorarchive.lemonsqueezy.com/buy/bbb");
    expect(getCheckoutUrl("lifetime")).toBeNull();
  });
});

describe("the plans are still priced even while unsellable", () => {
  it("keeps yearly and lifetime pricing intact", async () => {
    // Guard against over-correcting: disabling the BUTTON must not delete the
    // PLAN. If this fails, someone removed pricing instead of fixing the env.
    const { proSubscriptionConfig } = await loadWithEnv({});
    expect(proSubscriptionConfig.yearly.price).toBe("¥3,999");
    expect(proSubscriptionConfig.lifetime.price).toBe("¥19,999");
  });
});

describe("the kill switch outranks configuration, whichever plans it holds", () => {
  /**
   * Lifetime was switched off here on 2026-09-06 and back on the same day, once
   * the server guard shipped (server/lifetime.js). The point of the switch is
   * that it is CODE, not an env var: an unset variable is one `vercel env add`
   * away from re-opening a plan that is unsafe to sell, which is how the unsafe
   * version nearly shipped.
   *
   * So this asserts the mechanism, not today's setting — it keeps working
   * whichever plans are blocked, and it starts guarding a plan the moment
   * someone blocks one.
   */
  const PLANS = ["monthly", "yearly", "lifetime"] as const;

  it("a blocked plan returns null even when a valid variant link IS configured", async () => {
    const mod = await loadWithEnv({
      NEXT_PUBLIC_PRO_MONTHLY_CHECKOUT_URL: "https://colorarchive.lemonsqueezy.com/buy/aaa",
      NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL: "https://colorarchive.lemonsqueezy.com/buy/bbb",
      NEXT_PUBLIC_PRO_LIFETIME_CHECKOUT_URL: "https://colorarchive.lemonsqueezy.com/buy/ccc",
    });
    const { getCheckoutUrl, isPlanTemporarilyUnavailable } = mod;
    for (const plan of PLANS) {
      if (isPlanTemporarilyUnavailable(plan)) {
        expect(getCheckoutUrl(plan), `${plan} is switched off but still sells`).toBeNull();
      } else {
        expect(getCheckoutUrl(plan), `${plan} is on but returns no URL`).not.toBeNull();
      }
    }
  });

  it("lifetime is sellable again and uses its own variant link", async () => {
    // The server guard that made this safe is server/lifetime.js; if lifetime is
    // ever switched off again, the branch above takes over and this flips too.
    const { getCheckoutUrl, isPlanTemporarilyUnavailable } = await loadWithEnv({
      NEXT_PUBLIC_PRO_LIFETIME_CHECKOUT_URL:
        "https://colorarchive.lemonsqueezy.com/checkout/buy/00e86059-6879-479a-a0af-2c1aa4010a2a",
    });
    if (isPlanTemporarilyUnavailable("lifetime")) return;
    expect(getCheckoutUrl("lifetime")).toBe(
      "https://colorarchive.lemonsqueezy.com/checkout/buy/00e86059-6879-479a-a0af-2c1aa4010a2a",
    );
  });
});

describe("copy never advertises a plan the checkout refuses", () => {
  /**
   * Blocking lifetime in code (a7abfed) silenced the /pro/ button but left
   * /support, /terms and /refund-policy still describing it as a thing you can
   * buy — a visitor reads "a one-time purchase granting permanent Pro access,
   * ¥19,999" and then finds the button says Temporarily unavailable.
   *
   * This assertion is two-directional ON PURPOSE, so it maintains itself: while
   * the plan is blocked the pages must say so, and once the server guard ships
   * and the block is lifted, the test fails until the "currently unavailable"
   * copy is removed. A one-directional version would quietly leave stale
   * "unavailable" notices on three legal-ish pages forever.
   */
  const PAGES = [
    "src/components/support-page.tsx",
    "src/components/terms-page.tsx",
    "src/components/refund-policy-page.tsx",
  ];

  it("lifetime's block state and the copy on every page that sells it agree", async () => {
    const { isPlanTemporarilyUnavailable } = await loadWithEnv({});
    const blocked = isPlanTemporarilyUnavailable("lifetime");
    const offenders: string[] = [];
    for (const rel of PAGES) {
      const body = readFileSync(join(ROOT, rel), "utf8");
      const saysSo = /isPlanTemporarilyUnavailable\("lifetime"\)/.test(body);
      if (blocked && !saysSo) offenders.push(`${rel}: sells Lifetime but never says it is unavailable`);
      if (!blocked && saysSo) offenders.push(`${rel}: still carries the "unavailable" notice after the block was lifted`);
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});
