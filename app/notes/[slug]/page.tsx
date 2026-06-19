import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { NoteDetailPage } from "@/src/components/note-detail-page";
import { SITE_URL } from "@/src/lib/site-config";
import {
  getNewsletterIssue,
  getNewsletterNeighbors,
  newsletterIssues,
} from "@/src/lib/newsletter-issues";
import { getCollectionById } from "@/src/lib/collections";
import { getGuidesForCollection } from "@/src/lib/guides";
import type { NoteRelatedGuide } from "@/src/components/note-detail-page";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

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
      url: `${SITE_URL}/notes/${issue.slug}/`,
      type: "article",
      publishedTime: issue.date,
      authors: ["ColorArchive"],
      images: [`${SITE_URL}/og-image-v1.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: issue.title,
      description: issue.summary,
      images: [`${SITE_URL}/og-image-v1.png`],
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

  const relatedGuides: NoteRelatedGuide[] = getGuidesForCollection(issue.featuredCollectionId, 2)
    .map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      summary: guide.summary,
      searchIntent: guide.searchIntent,
    }))
    .filter(
      (guide, index, array) => array.findIndex((entry) => entry.slug === guide.slug) === index
    );

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: issue.title,
      description: issue.summary,
      datePublished: issue.date,
      dateModified: issue.date,
      keywords: (issue.tags ?? []).join(", "),
      url: `${SITE_URL}/notes/${issue.slug}/`,
      image: `${SITE_URL}/og-image-v1.png`,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/notes/${issue.slug}/`,
      },
      author: { "@type": "Organization", name: "ColorArchive", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` } },
      publisher: { "@type": "Organization", name: "ColorArchive", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` } },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Notes", item: `${SITE_URL}/notes/` },
        { "@type": "ListItem", position: 3, name: issue.title, item: `${SITE_URL}/notes/${issue.slug}/` },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/notes" />
      <StructuredDataScript data={structuredData} />
      <NoteDetailPage
        issue={issue}
        previousIssue={previous}
        nextIssue={next}
        featuredCollection={issue.featuredCollectionId ? getCollectionById(issue.featuredCollectionId) ?? null : null}
        relatedGuides={relatedGuides}
      />
    </>
  );
}
