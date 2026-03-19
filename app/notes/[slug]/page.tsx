import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { NoteDetailPage } from "@/src/components/note-detail-page";
import {
  getNewsletterIssue,
  getNewsletterNeighbors,
  newsletterIssues,
} from "@/src/lib/newsletter-issues";

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
    title: { absolute: `${issue.title} — ColorArchive Notes` },
    description: issue.summary,
    alternates: {
      canonical: `/notes/${issue.slug}/`,
    },
    openGraph: {
      title: issue.title,
      description: issue.summary,
      url: `https://colorarchive.me/notes/${issue.slug}/`,
      images: ["https://colorarchive.me/og-image-v1.png"],
    },
    twitter: {
      title: issue.title,
      description: issue.summary,
      images: ["https://colorarchive.me/og-image-v1.png"],
    },
  };
}

export default async function NoteIssueRoute({ params }: NotePageProps) {
  const { slug } = await params;
  const issue = getNewsletterIssue(slug);

  if (!issue) {
    notFound();
  }

  const { previous, next } = getNewsletterNeighbors(slug);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: issue.title,
      description: issue.summary,
      datePublished: issue.date,
      keywords: issue.tags.join(", "),
      url: `https://colorarchive.me/notes/${issue.slug}/`,
      author: { "@type": "Organization", name: "ColorArchive", url: "https://colorarchive.me" },
      publisher: { "@type": "Organization", name: "ColorArchive", url: "https://colorarchive.me" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
        { "@type": "ListItem", position: 2, name: "Notes", item: "https://colorarchive.me/notes/" },
        { "@type": "ListItem", position: 3, name: issue.title, item: `https://colorarchive.me/notes/${issue.slug}/` },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/notes" />
      <StructuredDataScript data={structuredData} />
      <NoteDetailPage issue={issue} previousIssue={previous} nextIssue={next} />
    </>
  );
}
