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
