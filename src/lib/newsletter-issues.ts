import issues from "@/src/data/newsletter-issues.json";

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
  eyebrow: string;
  tags: string[];
  featuredCollectionId?: string;
  featuredPackId?: string;
  highlights: string[];
  sections: NewsletterIssueSection[];
  links: NewsletterIssueLink[];
}

export const newsletterIssues = issues as NewsletterIssue[];

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

export function tagToSlug(tag: string) {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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
