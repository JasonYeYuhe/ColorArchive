/**
 * When does the export gate lock, and when does a click cost a free credit?
 *
 * Pure and dependency-free so it can be tested — the component around it cannot
 * be, and this is the part that has already cost a customer.
 *
 * ── WHY THIS IS ITS OWN MODULE (2026-08-18) ─────────────────────────────────
 *
 * On 2026-07-20 the site's first and only paying customer was blocked by the
 * paywall 20+ times AFTER paying, and it took two days to notice. The specific
 * cause was fixed. The shape was not: ProGate decided entitlement from its own
 * `fetchSession()` call, starting from `tier = "anonymous"` and treating a
 * FAILED request the same as a successful "you are anonymous".
 *
 * That produced three separate ways to charge or block a subscriber:
 *
 *   1. Session request errors      → catch ran the free-tier branch, so a Pro
 *                                    user with 3 exports already used got a
 *                                    locked panel whenever the API blipped.
 *   2. The locked panel then said  → "Sign in for more", shown to someone who
 *                                    was signed in AND paying.
 *   3. The window before the fetch → clicks landed while tier was still the
 *      resolved                      "anonymous" default, so a Pro user's
 *                                    clicks burned free credits they don't use.
 *
 * ── THE RULE ────────────────────────────────────────────────────────────────
 *
 * "I don't know yet" is not "no". Until entitlement is actually known, the gate
 * neither locks nor charges. That is deliberately generous while the backend is
 * unreachable: an anonymous visitor may get some uncounted exports during an
 * outage. The trade is not symmetric — the cost of over-charging a stranger is
 * a few files, and the cost of blocking a subscriber is the subscriber.
 */

export type GateTier = "anonymous" | "free" | "pro";

export interface GateInput {
  tier: GateTier;
  /** True only when entitlement is genuinely KNOWN — not loading, not errored. */
  resolved: boolean;
  used: number;
  limit: number;
}

export interface GateDecision {
  /** Render the locked overlay instead of the action. */
  locked: boolean;
  /** An export click should consume one free-tier credit. */
  charge: boolean;
  /** Free exports left, or null when no quota applies (Pro, or not yet known). */
  remaining: number | null;
}

/**
 * Free daily exports by tier — the numbers a caller should pass as `limit`.
 *
 * Lives here, not in the component, for one reason: a reviewer claimed on
 * 2026-09-05 that "changing the policy number does not take effect at runtime".
 * That is false — `limit` is the sole numeric input to both `locked` and
 * `remaining` below — but the claim was only refutable by reading code. With the
 * map in the tested module it is refutable by running the suite.
 *
 * anonymous 3 / free 10 mirrors the AI quota, which has enforced exactly those
 * two numbers server-side since it shipped (server/ai-rate-limit.js TIER_LIMITS).
 * Before this, both tiers got 3 while the locked overlay said "Sign in for more",
 * which was simply untrue.
 *
 * "pro" is absent on purpose: decideGate returns before any limit is compared
 * for a subscriber, so giving Pro a number here would imply a ceiling that does
 * not exist.
 */
export const FREE_EXPORTS_PER_DAY = { anonymous: 3, free: 10 } as const;

export function exportLimitFor(tier: GateTier): number {
  return tier === "free" ? FREE_EXPORTS_PER_DAY.free : FREE_EXPORTS_PER_DAY.anonymous;
}

export function decideGate({ tier, resolved, used, limit }: GateInput): GateDecision {
  // Unknown entitlement: never lock, never charge. See "THE RULE" above.
  if (!resolved) {
    return { locked: false, charge: false, remaining: null };
  }

  if (tier === "pro") {
    return { locked: false, charge: false, remaining: null };
  }

  const remaining = Math.max(limit - used, 0);
  return { locked: remaining <= 0, charge: true, remaining };
}

/**
 * Should this export carry the free-tier watermark?
 *
 * Same rule as decideGate(), applied to a different kind of loss. The three
 * `withSvgWatermark` call sites read `tier` straight from AuthProvider, which
 * reports BOTH "still loading" and "the session request failed" as
 * `"anonymous"` — so a Pro subscriber who hit Download in the first moment of a
 * page view got "colorarchive.org" burned into the file.
 *
 * That one is worse than a lock. A lock is an inconvenience the user can retry
 * past; a watermark is written into an artifact they have already saved and may
 * have already sent to a client, and nothing later tells them it happened.
 *
 * So: brand it only when we KNOW the user is not entitled.
 */
export function shouldWatermark({ tier, resolved }: { tier: GateTier; resolved: boolean }): boolean {
  if (!resolved) return false;
  return tier !== "pro";
}

/**
 * Is entitlement genuinely known? `status === "loading"` is the obvious half;
 * `sessionError` is the half that cost a customer, because AuthProvider
 * collapses a FAILED session request into `tier: "anonymous"`.
 *
 * Every paid surface should derive `resolved` from this rather than
 * re-deriving it, so a new gate cannot quietly reintroduce the old shape.
 */
export function isEntitlementResolved({
  status,
  sessionError,
}: {
  status: "loading" | "authenticated" | "anonymous";
  sessionError: boolean;
}): boolean {
  return status !== "loading" && !sessionError;
}
