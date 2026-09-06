import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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
  it("uses the variant link for every plan, the fallback for none of them", async () => {
    const { getCheckoutUrl } = await loadWithEnv({
      NEXT_PUBLIC_PRO_MONTHLY_CHECKOUT_URL: "https://colorarchive.lemonsqueezy.com/buy/aaa",
      NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL: "https://colorarchive.lemonsqueezy.com/buy/bbb",
      NEXT_PUBLIC_PRO_LIFETIME_CHECKOUT_URL: "https://colorarchive.lemonsqueezy.com/buy/ccc",
    });
    expect(getCheckoutUrl("monthly")).toBe("https://colorarchive.lemonsqueezy.com/buy/aaa");
    expect(getCheckoutUrl("yearly")).toBe("https://colorarchive.lemonsqueezy.com/buy/bbb");
    expect(getCheckoutUrl("lifetime")).toBe("https://colorarchive.lemonsqueezy.com/buy/ccc");
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
