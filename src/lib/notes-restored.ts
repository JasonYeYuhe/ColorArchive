/**
 * URLs that were published, then retracted by accident, and are being served again.
 *
 * READ THIS BEFORE ADDING A ROW — the first version of this file used the wrong
 * evidence, and Search Console caught it.
 *
 * WHAT WENT WRONG THE FIRST TIME
 * This list originally held 23 URLs, ranked by "Google referrals in the last 30
 * days" taken from the first-party `pageviews` table. The flagship entry showed
 * 580 of them. That number was not people:
 *
 *   - 540 of 540 recorded requests reported a viewport width of exactly 1919px.
 *     Real traffic to /word-to-color/ in the same window spans a dozen widths
 *     (1180, 820, 1920, 1528, 2560, 390, 384...). One constant width is one
 *     automated client.
 *   - The requests were spread flat across all 24 hours (10-41 per hour) with no
 *     day/night cycle.
 *   - Not one `events` row was ever recorded on that path. Nobody scrolled,
 *     clicked or typed. Ever.
 *   - Search Console, for that exact URL over three months: 0 clicks, 0
 *     impressions. For the WHOLE /notes/ namespace: 28 clicks, 6,370
 *     impressions, position 12.6.
 *
 * So the referrer was spoofed, and 580 "Google referrals" were one bot. The
 * mistake is worth naming precisely, because the repo had already written the
 * rule down and I broke it anyway: `pageviews` is the table this project
 * established is 22.5% automated and unusable as evidence, and
 * docs/dev-plan-2026-08-15.md §2.1 said in as many words to check GSC BEFORE
 * deciding how much to invest. Deriving "demand" from a referrer column in that
 * same table is the banned metric wearing a different hat.
 *
 * WHY THE REMAINING FIFTEEN STILL BELONG HERE
 * They are cohort B, and their case never rested on the referral counts:
 *
 *   - They were publicly reachable from 2026-03-22 until 2026-08-08, four and a
 *     half months, which is long enough to be indexed properly.
 *   - `f8cc6a3` retracted them as a SIDE EFFECT of correcting the publish gate.
 *     Nobody decided to unpublish them; the change was aimed at future-dated
 *     content and took these with it.
 *   - They still have search presence: november-2026-color-and-motion alone
 *     carries 159 impressions in the three months to 2026-08-15, and the /notes/
 *     index has 1,455.
 *   - Their scheduled dates are weeks to months away, not years. When each date
 *     arrives the `status` flag becomes redundant rather than load-bearing.
 *
 * The eight cohort-A entries (dated 2027-2031) were removed on 2026-08-17. They
 * were public for about nine days in March 2026 and have no measurable search
 * presence. Their content edits were kept — the stale Midjourney/DALL·E version
 * claims really were wrong — but the articles stay unpublished.
 *
 * `publishedAt` is not a guess: it is the date of the first commit that put the
 * slug into src/data/newsletter-issues.json, which is when the page first built.
 */

export interface RestoredNote {
  slug: string;
  /** Search Console impressions, 3 months to 2026-08-15. 0 means "not surfaced". */
  gscImpressions3mo: number;
  /** Search Console clicks in the same window. */
  gscClicks3mo: number;
  /**
   * Days the URL was publicly reachable before being retracted. This, not the
   * traffic, is the primary justification: a page that was live for four months
   * and then vanished by accident is a regression to undo.
   */
  daysPublic: number;
}

/**
 * Cohort B only. Anything added here MUST exist in newsletter-issues.json with
 * `status: "published"` — notes-restored.test.ts fails the build otherwise.
 *
 * Do not add a row on the strength of `pageviews` referrals. Check Search
 * Console. That is the whole lesson of this file.
 */
export const RESTORED_NOTES: RestoredNote[] = [
  // Public 2026-03-22 .. 2026-08-08, retracted by f8cc6a3 as a side effect.
  { slug: "november-2026-color-and-motion", gscImpressions3mo: 159, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "august-2026-brand-recognition-color", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "september-2026-color-visual-hierarchy", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "september-2026-saturation-control", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "september-2026-interactive-color-states", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "september-2026-seasonal-palette-shifts", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "october-2026-color-blindness-accessible-palettes", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "october-2026-color-temperature-design", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "october-2026-negative-space-color", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "november-2026-typography-color-harmony", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "november-2026-cultural-color-reading", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "december-2026-color-palette-documentation", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "december-2026-color-contrast-accessibility", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "december-2026-print-vs-screen-color", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
  { slug: "december-2026-dark-mode-design-decisions", gscImpressions3mo: 0, gscClicks3mo: 0, daysPublic: 139 },
];

export const RESTORED_SLUGS: ReadonlySet<string> = new Set(RESTORED_NOTES.map((n) => n.slug));
