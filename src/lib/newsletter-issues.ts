import issues from "@/src/data/newsletter-issues.json";
import { tagToSlug } from "./newsletter-slug";
import { issuePublishedAt } from "./newsletter-date";

export { tagToSlug } from "./newsletter-slug";

export interface NewsletterIssueLink {
  label: string;
  href: string;
}

export interface NewsletterIssueSection {
  heading: string;
  body: string;
}

export interface NewsletterIssue {
  slug: string;
  /**
   * The SCHEDULING date — when this issue is slated to run. It is not the
   * publication date and must not be rendered as one; see `publishedAt`.
   */
  date: string;
  /**
   * Publication state, and the ONLY thing that puts an issue on the site.
   * Absent means the issue exists in the archive but is not public, whatever its
   * `date` says. Setting it is a deliberate act by a person; nothing computes it.
   */
  status?: "published";
  /** Real first-public date, from git history. Drives display, OG and JSON-LD. */
  publishedAt?: string;
  /** Real last-substantive-edit date. Drives JSON-LD dateModified + sitemap. */
  updatedAt?: string;
  title: string;
  summary: string;
  eyebrow?: string;
  tags: string[];
  featuredCollectionId?: string;
  highlights?: string[];
  sections?: NewsletterIssueSection[];
  links?: NewsletterIssueLink[];
  body?: string;
}

/**
 * Serve what was explicitly published, newest-first.
 *
 * THE CUTOFF IS GONE (2026-08-18). It went through three forms — a hardcoded
 * "2026-12-31", then the build date, then a date-or-flag hybrid — and each one
 * decided on its own which pages the public could see. History is under the
 * export below; the short version is that it retracted 318 already-public URLs
 * across two commits and had 292 more queued to publish themselves.
 *
 * THE ORDER WAS WHATEVER THE JSON HAPPENED TO BE. The source file descends from
 * 2026-06-04 to 2026-03-11, then jumps back to 2026-05-07 and ascends. Nothing
 * sorted it, and three separate things read positional order: the /notes/ index,
 * `latestNewsletterIssue` (index 0), and getNewsletterNeighbors (index±1). So the
 * index jumped March → May mid-list, the newest issue was buried, and prev/next
 * walked the archive in an order no reader could follow. One sort at the source
 * fixes all three, which is why it belongs here rather than in each caller.
 */
/**
 * `date` alone was carrying five different meanings — publish eligibility, the
 * date on the page, OG `publishedTime`, JSON-LD `datePublished` AND
 * `dateModified`, and sitemap `lastModified` — so any change made for one of
 * them silently rewrote the other four. Re-exported from newsletter-date.ts,
 * which holds no data and is therefore safe for client components to import.
 */
export { issuePublishedAt, issueUpdatedAt } from "./newsletter-date";

/**
 * PUBLICATION IS AN EXPLICIT ACT. `date` no longer publishes anything.
 *
 * This file has now caused the same class of incident three times, in both
 * directions, because a date was allowed to decide what the public could see:
 *
 *   2026-03-31 (d0f6903) — a cutoff added to stop future-dated issues going out
 *     RETRACTED 303 URLs that had been public since 2026-03-22.
 *   2026-08-08 (f8cc6a3) — moving that cutoff to the build date retracted 15
 *     more that had been live and indexed for four and a half months.
 *   ...and in the other direction, 292 issues dated 2027-2033 were queued to
 *     publish THEMSELVES, 53 of them during 2027, starting 2027-01-07, with no
 *     human deciding anything. The backlog was not inert. It was a timer.
 *
 * On 2026-08-18 every one of those 292 was checked against Search Console, by
 * year cohort: 2027, 2028, 2029, 2030, 2031, 2032 and 2033 each return zero
 * clicks and zero impressions over the preceding three months. Not "low" — no
 * data at all. So the backlog would have published itself into an audience that
 * has never once arrived, while carrying the fact-decay risk this content is
 * already known to have (the 2027 AI issue asserted Midjourney v6 and DALL·E 3
 * as current).
 *
 * The gate is therefore the flag alone. To publish an issue, say so in the data.
 * `date` reverts to what it always claimed to be — a scheduling slot — and
 * content-links.test.ts flags any issue whose slot has passed without a decision,
 * so nothing is forgotten rather than merely un-published.
 */
export const newsletterIssues = (issues as NewsletterIssue[])
  .filter((issue) => issue.status === "published")
  .sort((a, b) => issuePublishedAt(b).localeCompare(issuePublishedAt(a)));

export function getNewsletterIssue(slug: string) {
  return newsletterIssues.find((issue) => issue.slug === slug) ?? null;
}

export function getNewsletterIssueIndex(slug: string) {
  return newsletterIssues.findIndex((issue) => issue.slug === slug);
}

export function getNewsletterNeighbors(slug: string) {
  const index = getNewsletterIssueIndex(slug);
  if (index === -1) {
    return {
      previous: null,
      next: null,
    };
  }

  return {
    previous: newsletterIssues[index + 1] ?? null,
    next: newsletterIssues[index - 1] ?? null,
  };
}

export const latestNewsletterIssue = newsletterIssues[0] ?? null;

export function slugToTag(slug: string) {
  const allTags = newsletterIssues.flatMap((issue) => issue.tags);
  return allTags.find((tag) => tagToSlug(tag) === slug) ?? null;
}

export function getIssuesByTag(tag: string) {
  return newsletterIssues.filter((issue) => issue.tags.includes(tag));
}

export function getAllTags() {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const issue of newsletterIssues) {
    for (const tag of issue.tags) {
      if (!seen.has(tag)) {
        seen.add(tag);
        tags.push(tag);
      }
    }
  }
  return tags;
}
