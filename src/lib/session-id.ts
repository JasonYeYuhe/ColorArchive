/**
 * An ephemeral per-tab id, used only to de-duplicate analytics within one visit.
 *
 * WHY THIS EXISTS
 * The AI kill-criteria in docs/dev-plan-2026-07-26-ai.md §8 are ratios — of the
 * visits that actually SAW the AI module, how many used it, and of those how many
 * kept the result. A ratio needs a denominator you can divide by, and the
 * first-party `pageviews` table has no visitor or session column at all, so
 * "distinct visits" was simply not computable. The `events` table already has an
 * unused `session_id TEXT` column (server/db.js:161, populated in 0 of 4,690
 * rows), so this fills a slot that was designed for it — no migration.
 *
 * WHY NOT A PERSISTENT ID
 * localStorage would give cross-visit identity and a nicer "distinct people"
 * number. It would also be a new persistent tracking identifier, which is a real
 * privacy cost for a metric that does not need it: the question is "did this VISIT
 * convert", not "who is this person". sessionStorage dies with the tab, is not
 * shared across tabs, and cannot link one person's visits together — so it adds no
 * tracking capability the site did not already have.
 *
 * POSTHOG CAN ALREADY DO THIS — a correction worth recording
 * An earlier version of this comment justified the whole file by claiming that
 * `person_profiles: "identified_only"` (src/lib/posthog.ts:61) makes anonymous
 * unique-visit counting unreliable. THAT WAS WRONG, and it was checked rather
 * than argued: HogQL against project 456902 for the last 30 days returns 20,293
 * `$pageview` events across 11,049 distinct_id and 11,538 distinct `$session_id`
 * with zero nulls. `identified_only` suppresses person PROFILES; it does not
 * suppress the identifiers. PostHog would answer the §8 ratios today with no code
 * at all.
 *
 * This still ships, for reasons that do not depend on that false claim:
 *   - The gate has to be runnable from the droplet as one command, next to the
 *     data it judges, with no vendor console round-trip and no HogQL to remember.
 *     server/scripts/gate-report.cjs already emails a verdict weekly.
 *   - It costs one existing, already-declared, always-NULL column and ~20 lines. That
 *     is cheaper than the alternative it replaces, not more expensive.
 *   - Two independent measurements of the same ratio is a feature: if the
 *     first-party number and the PostHog number disagree, one of them is broken,
 *     and finding that out is worth more than either number alone. The four-month
 *     loopback bug survived precisely because nothing cross-checked anything.
 *
 * NOT AN IDENTIFIER FOR ANYTHING ELSE. Never key authorisation, quota, or
 * personalisation on this: it is client-supplied, trivially forged, and resets on
 * every tab. It exists to divide one count by another.
 */

const KEY = "ca_sid";

/**
 * Returns the current tab's session id, creating it on first call.
 *
 * Returns null rather than throwing whenever storage is unavailable — Safari
 * private mode, embedded webviews and hardened browsers all throw on access, and
 * an analytics helper must never be the reason a page breaks. A null just means
 * that visit is missing from the denominator, which is the correct failure: it
 * under-counts rather than inventing sessions.
 */
export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.sessionStorage.getItem(KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : // Fallback for older webviews. Not cryptographically meaningful — it
          // only has to avoid colliding between two concurrent visits.
          `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    window.sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    return null;
  }
}
