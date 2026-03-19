import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { NoteDetailPage } from "@/src/components/note-detail-page";
import { getNewsletterIssue, newsletterIssues } from "@/src/lib/newsletter-issues";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return newsletterIssues.map((issue) => ({ slug: issue.slug }));
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const issue = getNewsletterIssue(slug);

  if (!issue) {
    return {};
  }

  return {
    title: issue.title,
    description: issue.summary,
    alternates: {
      canonical: `/notes/${issue.slug}`,
    },
  };
}

export default async function NoteIssueRoute({ params }: NotePageProps) {
  const { slug } = await params;
  const issue = getNewsletterIssue(slug);

  if (!issue) {
    notFound();
  }

  return (
    <>
      <SiteHeader currentPath="/notes" />
      <NoteDetailPage issue={issue} />
    </>
  );
}
