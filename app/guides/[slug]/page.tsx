import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GuideDetailPage } from "@/src/components/guide-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { getLandingGuide, getRelatedGuides, landingGuides } from "@/src/lib/guides";
import { getCollectionById } from "@/src/lib/collections";
import { SITE_URL } from "@/src/lib/site-config";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return landingGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getLandingGuide(slug);

  if (!guide) {
    return {};
  }

  return {
    title: { absolute: `${guide.title} — ColorArchive Guides` },
    description: guide.summary,
    alternates: {
      canonical: `/guides/${guide.slug}/`,
    },
    openGraph: {
      title: guide.title,
      description: guide.summary,
      url: `${SITE_URL}/guides/${guide.slug}/`,
      images: [`${SITE_URL}/og-image-v1.png`],
    },
    twitter: {
      title: guide.title,
      description: guide.summary,
      images: [`${SITE_URL}/og-image-v1.png`],
    },
  };
}

export default async function GuideRoute({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getLandingGuide(slug);

  if (!guide) {
    notFound();
  }

  const relatedGuides = getRelatedGuides(slug, 3);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.summary,
      keywords: guide.tags.join(", "),
      url: `${SITE_URL}/guides/${guide.slug}/`,
      author: { "@type": "Organization", name: "ColorArchive", url: SITE_URL },
      publisher: { "@type": "Organization", name: "ColorArchive", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides/` },
        { "@type": "ListItem", position: 3, name: guide.title, item: `${SITE_URL}/guides/${guide.slug}/` },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/guides" />
      <StructuredDataScript data={structuredData} />
      <GuideDetailPage
        guide={guide}
        relatedGuides={relatedGuides}
        featuredCollection={guide.featuredCollectionId ? getCollectionById(guide.featuredCollectionId) ?? null : null}
      />
    </>
  );
}
