/**
 * The word-paywall email unlock: how long it lasts, and who keeps forever.
 *
 * Extracted from word-color-generator-page.tsx for the same reason
 * pro-gate-policy.ts was extracted from ProGate — the component around it
 * cannot be tested, and this is the part that decides whether an existing
 * person silently loses access they were already given.
 *
 * ─── THE RULE ──────────────────────────────────────────────────────────────
 *
 * Before 2026-09-08 the flag was the literal string "1" and meant "forever".
 * From 2026-09-08 a new unlock is a 24-hour pass. Existing "1" holders keep
 * forever — the change binds new unlocks only.
 *
 * ─── THE TRAP THIS MODULE EXISTS TO PIN ────────────────────────────────────
 *
 * `JSON.parse("1")` does not throw. It returns the number 1. So the obvious
 * implementation — parse first, then look for `.exp` — silently revokes every
 * grandfathered browser instead of honouring it, and does so without an error
 * anywhere. The legacy check MUST come first, and `legacyFlagIsHonoured` below
 * is the test that says so.
 *
 * ─── WHAT THIS IS NOT ──────────────────────────────────────────────────────
 *
 * Not enforcement. The value lives in localStorage, is per-browser, and is not
 * bound to an account or an email. Clearing site data resets it, as it always
 * did. This bounds a giveaway; it does not secure anything.
 */

/** 24 hours. */
export const UNLOCK_WINDOW_MS = 24 * 60 * 60 * 1000;

/** The value written by unlocks before 2026-09-08. Means "no expiry". */
export const LEGACY_PERMANENT = "1";

/** What a new unlock writes. */
export function newUnlockValue(now: number): string {
  return JSON.stringify({ exp: now + UNLOCK_WINDOW_MS });
}

/**
 * @param raw the stored value, or null when nothing is stored
 * @param now epoch ms
 */
export function isUnlockValid(raw: string | null, now: number): boolean {
  if (!raw) return false;
  // Must precede JSON.parse — see "THE TRAP" above.
  if (raw === LEGACY_PERMANENT) return true;
  try {
    const parsed = JSON.parse(raw) as { exp?: unknown };
    return typeof parsed?.exp === "number" && now < parsed.exp;
  } catch {
    return false;
  }
}
