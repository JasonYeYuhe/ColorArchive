import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { TagNotesPage } from "@/src/components/tag-notes-page";
import { getAllTags, getIssuesByTag, slugToTag, tagToSlug } from "@/src/lib/newsletter-issues";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tagToSlug(tag) }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const tag = slugToTag(tagSlug);

  if (!tag) return {};

  return {
    title: `${tag} — ColorArchive Notes`,
    description: `ColorArchive notes and updates tagged with ${tag}.`,
    alternates: {
      canonical: `/notes/tags/${tagSlug}`,
    },
  };
}

export default async function TagRoute({ params }: TagPageProps) {
  const { tag: tagSlug } = await params;
  const tag = slugToTag(tagSlug);

  if (!tag) notFound();

  const issues = getIssuesByTag(tag);

  return (
    <>
      <SiteHeader currentPath="/notes" />
      <TagNotesPage tag={tag} issues={issues} />
    </>
  );
}
