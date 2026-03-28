import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { TagNotesPage } from "@/src/components/tag-notes-page";
import { getAllTags, getIssuesByTag, slugToTag, tagToSlug } from "@/src/lib/newsletter-issues";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tagToSlug(tag) }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const tag = slugToTag(tagSlug);

  if (!tag) return {};

  const issues = getIssuesByTag(tag);
  const description = `${issues.length} ColorArchive note${issues.length !== 1 ? "s" : ""} tagged with ${tag}. Discover color palettes, design insights, and curated swatches.`;
  return {
    title: { absolute: `${tag} — Color Notes & Updates | ColorArchive` },
    description,
    alternates: {
      canonical: `/notes/tags/${tagSlug}/`,
    },
    openGraph: {
      title: `${tag} — Color Notes & Updates | ColorArchive`,
      description,
      images: ["https://colorarchive.me/og-image-v1.png"],
    },
    twitter: {
      title: `${tag} — Color Notes`,
      description,
      images: ["https://colorarchive.me/og-image-v1.png"],
    },
  };
}

export default async function TagRoute({ params }: TagPageProps) {
  const { tag: tagSlug } = await params;
  const tag = slugToTag(tagSlug);

  if (!tag) notFound();

  const issues = getIssuesByTag(tag);

  const collectionData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${tag} — Color Notes & Updates`,
    description: `${issues.length} ColorArchive note${issues.length !== 1 ? "s" : ""} tagged with ${tag}. Discover color palettes, design insights, and curated swatches.`,
    url: `https://colorarchive.me/notes/tags/${tagSlug}/`,
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "Notes", item: "https://colorarchive.me/notes/" },
      { "@type": "ListItem", position: 3, name: tag, item: `https://colorarchive.me/notes/tags/${tagSlug}/` },
    ],
  };

  return (
    <>
      <SiteHeader currentPath="/notes" />
      <StructuredDataScript data={[collectionData, breadcrumbData]} />
      <TagNotesPage tag={tag} issues={issues} />
    </>
  );
}
