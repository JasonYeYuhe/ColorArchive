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
  highlights: string[];
  sections: NewsletterIssueSection[];
  links: NewsletterIssueLink[];
}

export const newsletterIssues = issues as NewsletterIssue[];

export function getNewsletterIssue(slug: string) {
  return newsletterIssues.find((issue) => issue.slug === slug) ?? null;
}

export const latestNewsletterIssue = newsletterIssues[0] ?? null;
