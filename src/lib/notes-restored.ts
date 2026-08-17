/**
 * URLs that were published, then retracted, and are being served again.
 *
 * WHAT THIS FILE IS FOR
 * A 404 on a page nobody ever linked to costs nothing. A 404 on a page Google
 * has indexed and still sends traffic to costs that traffic, every month, in
 * silence. This list is the second kind, so the loss is visible in the repo
 * instead of only in a referrer table nobody reads.
 *
 * HOW THE SET WAS CHOSEN — evidence, not "everything ever published"
 * Reconstructing git history says 345 of the 350 issues were publicly reachable
 * between 2026-03-22 and 2026-03-31, because no date filter existed yet. Taking
 * "never un-publish a published URL" literally would therefore mean serving 303
 * articles dated as far ahead as 2033, which is not a fix, it is the original
 * mistake at scale. The test is instead: does anything out there still ASK for
 * this URL? Two cohorts pass it.
 *
 *   Cohort B — dated 2026-08-20..12-24. Public from 2026-03-22 until 2026-08-08
 *   (f8cc6a3), i.e. four and a half months, long enough to be indexed properly.
 *   Retracted nine days ago; recovery odds are highest while the index is fresh.
 *   All fifteen are included, and all fifteen still drew requests in the last 30
 *   days.
 *
 *   Cohort A — dated 2027+. Public for only ~9 days in March 2026, and 404 for
 *   four and a half months since. Only the ones with MEASURED Google referrals
 *   in the last 30 days are restored; the other ~280 stay hidden.
 *
 * `googleReferrals30d` is from the first-party `pageviews` table on the droplet
 * (`referrer_domain='google.com'`, 30 days to 2026-08-17). It proves live demand;
 * it does not prove ranking. GSC is the instrument for that and has not been read
 * yet — see docs/dev-plan-2026-08-15.md §2.1.
 *
 * `publishedAt` is not a guess: it is the date of the first commit that put the
 * slug into src/data/newsletter-issues.json, which is when the page first built.
 */

export interface RestoredNote {
  slug: string;
  /** Google referrals in the 30 days to 2026-08-17, from first-party pageviews. */
  googleReferrals30d: number;
  /** Total requests in the same window, any referrer. */
  requests30d: number;
  cohort: "A" | "B";
}

/**
 * Ordered by measured demand. Anything added here MUST exist in
 * newsletter-issues.json with `status: "published"` — notes-restored.test.ts
 * fails the build otherwise.
 */
export const RESTORED_NOTES: RestoredNote[] = [
  // Cohort A — 2027+, indexed during the 9-day March window, 404 since 2026-03-31.
  { slug: "nov-2027-color-in-ai-generated-design", googleReferrals30d: 580, requests30d: 581, cohort: "A" },
  { slug: "apr-2028-color-game-ui", googleReferrals30d: 49, requests30d: 50, cohort: "A" },
  { slug: "sep-2027-color-in-email-design", googleReferrals30d: 42, requests30d: 42, cohort: "A" },
  { slug: "oct-2027-color-grading-for-photographers", googleReferrals30d: 14, requests30d: 14, cohort: "A" },
  { slug: "apr-2028-color-ecommerce", googleReferrals30d: 6, requests30d: 6, cohort: "A" },
  { slug: "may-2028-saas-dashboard-color", googleReferrals30d: 5, requests30d: 6, cohort: "A" },
  { slug: "jul-2031-neon-color-cycles-cultural", googleReferrals30d: 3, requests30d: 3, cohort: "A" },
  { slug: "dec-2028-color-consistency-cross-platform", googleReferrals30d: 1, requests30d: 1, cohort: "A" },

  // Cohort B — live 2026-03-22..2026-08-08, retracted by the build-date cutoff.
  { slug: "december-2026-print-vs-screen-color", googleReferrals30d: 0, requests30d: 8, cohort: "B" },
  { slug: "october-2026-color-blindness-accessible-palettes", googleReferrals30d: 0, requests30d: 5, cohort: "B" },
  { slug: "october-2026-color-temperature-design", googleReferrals30d: 1, requests30d: 5, cohort: "B" },
  { slug: "september-2026-interactive-color-states", googleReferrals30d: 0, requests30d: 5, cohort: "B" },
  { slug: "november-2026-color-and-motion", googleReferrals30d: 2, requests30d: 4, cohort: "B" },
  { slug: "november-2026-typography-color-harmony", googleReferrals30d: 1, requests30d: 4, cohort: "B" },
  { slug: "october-2026-negative-space-color", googleReferrals30d: 2, requests30d: 4, cohort: "B" },
  { slug: "december-2026-color-contrast-accessibility", googleReferrals30d: 0, requests30d: 3, cohort: "B" },
  { slug: "november-2026-cultural-color-reading", googleReferrals30d: 0, requests30d: 3, cohort: "B" },
  { slug: "september-2026-color-visual-hierarchy", googleReferrals30d: 0, requests30d: 3, cohort: "B" },
  { slug: "september-2026-saturation-control", googleReferrals30d: 0, requests30d: 3, cohort: "B" },
  { slug: "august-2026-brand-recognition-color", googleReferrals30d: 0, requests30d: 2, cohort: "B" },
  { slug: "december-2026-dark-mode-design-decisions", googleReferrals30d: 0, requests30d: 2, cohort: "B" },
  { slug: "september-2026-seasonal-palette-shifts", googleReferrals30d: 0, requests30d: 2, cohort: "B" },
  { slug: "december-2026-color-palette-documentation", googleReferrals30d: 0, requests30d: 1, cohort: "B" },
];

export const RESTORED_SLUGS: ReadonlySet<string> = new Set(RESTORED_NOTES.map((n) => n.slug));
