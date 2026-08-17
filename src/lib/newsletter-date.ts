/**
 * Date semantics for newsletter issues, kept in a module that imports NO data.
 *
 * WHY IT IS NOT IN newsletter-issues.ts
 * That module imports src/data/newsletter-issues.json at the top level. Two of
 * the three callers here (`tag-notes-page.tsx`, and any future client surface)
 * are `"use client"`, and a value import — as opposed to `import type`, which is
 * erased — would pull the whole issue dataset into the browser bundle. This repo
 * has already shipped that bug once: two 1.38MB client chunks caused by helpers
 * co-located with the data they described (fixed in 96ff99e). A pure function
 * about dates does not need the dates to live next to it.
 *
 * The parameter type is structural rather than `NewsletterIssue` for the same
 * reason: importing the interface would re-introduce the coupling this file
 * exists to avoid.
 */

export interface IssueDates {
  /** Scheduling slot. Never render this to a reader. */
  date: string;
  publishedAt?: string;
  updatedAt?: string;
}

/** The date a reader sees, and the one every crawler is told. */
export function issuePublishedAt(issue: IssueDates) {
  return issue.publishedAt ?? issue.date;
}

/**
 * Last substantive edit, falling back to publication — never to the schedule
 * slot. Claiming an issue was "modified" on a date in 2028 because that is when
 * it was pencilled in would be worse than saying nothing.
 */
export function issueUpdatedAt(issue: IssueDates) {
  return issue.updatedAt ?? issuePublishedAt(issue);
}
