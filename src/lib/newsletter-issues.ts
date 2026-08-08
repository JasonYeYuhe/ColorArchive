import issues from "@/src/data/newsletter-issues.json";
import { tagToSlug } from "./newsletter-slug";

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
  date: string;
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
 * Publish nothing that is dated in the future, and serve the archive newest-first.
 *
 * THE CUTOFF WAS A CONSTANT, NOT A DATE. It read "2026-12-31" under a comment
 * saying "avoid future-dated content in public site" — so on 2026-08-08 sixteen
 * issues dated up to 2026-12-24 were already live and in the sitemap, four months
 * early. Comparing against the build date does what the comment always said, and
 * needs no maintenance when the year rolls over.
 *
 * Note this resolves at BUILD time, not request time: an issue whose date passes
 * while no deploy happens stays hidden until the next build. That is the right
 * trade for a statically exported site — every page here is prerendered anyway,
 * and the alternative (a dynamic route) would cost far more than it buys.
 *
 * THE ORDER WAS WHATEVER THE JSON HAPPENED TO BE. The source file descends from
 * 2026-06-04 to 2026-03-11, then jumps back to 2026-05-07 and ascends. Nothing
 * sorted it, and three separate things read positional order: the /notes/ index,
 * `latestNewsletterIssue` (index 0), and getNewsletterNeighbors (index±1). So the
 * index jumped March → May mid-list, the newest issue was buried, and prev/next
 * walked the archive in an order no reader could follow. One sort at the source
 * fixes all three, which is why it belongs here rather than in each caller.
 */
const CUTOFF = new Date().toISOString().slice(0, 10);
export const newsletterIssues = (issues as NewsletterIssue[])
  .filter((issue) => issue.date <= CUTOFF)
  .sort((a, b) => b.date.localeCompare(a.date));

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
