import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GuideDetailPage } from "@/src/components/guide-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { getLandingGuide, getRelatedGuides, landingGuides } from "@/src/lib/guides";
import { getCollectionById } from "@/src/lib/collections";
import { guideFaqs } from "@/src/lib/guide-seo";
import { getGuideSeoTitle } from "@/src/lib/guide-seo-title";
import { SITE_URL } from "@/src/lib/site-config";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return landingGuides.map((guide) => ({ slug: guide.slug }));
}

/**
 * Meta descriptions get cut by the engine at roughly 155-160 characters, and the
 * cut lands wherever it lands — 227 of 333 guide summaries are longer than that,
 * median 191, so most results were ending mid-sentence. Trimming on a sentence
 * boundary first, then a word boundary, means the SERP snippet is at least a
 * finished thought. The full summary is untouched for on-page use.
 */
const META_DESCRIPTION_MAX = 155;

function trimForSerp(summary: string): string {
  if (summary.length <= META_DESCRIPTION_MAX) return summary;
  const window = summary.slice(0, META_DESCRIPTION_MAX);
  const lastSentence = Math.max(window.lastIndexOf(". "), window.lastIndexOf("? "), window.lastIndexOf("! "));
  if (lastSentence > META_DESCRIPTION_MAX * 0.6) return window.slice(0, lastSentence + 1);
  const lastSpace = window.lastIndexOf(" ");
  return `${window.slice(0, lastSpace > 0 ? lastSpace : META_DESCRIPTION_MAX).trimEnd()}…`;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getLandingGuide(slug);

  if (!guide) {
    return {};
  }

  return {
    title: { absolute: getGuideSeoTitle(slug, guide.title) },
    description: guide.summary,
    alternates: {
      canonical: `/guides/${guide.slug}/`,
    },
    // No explicit `images` — lets the colocated opengraph-image.tsx route bind (per-guide
    // PNG card with the guide title). An explicit images array would override and suppress
    // it (the 9885f5b bug — that commit fixed collections/families but missed guides).
    openGraph: {
      title: guide.title,
      description: trimForSerp(guide.summary),
      url: `${SITE_URL}/guides/${guide.slug}/`,
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.summary,
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
  const faqs = guideFaqs[slug] ?? [];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.summary,
      keywords: guide.tags.join(", "),
      url: `${SITE_URL}/guides/${guide.slug}/`,
      inLanguage: "en",
      articleSection: guide.category,
      image: `${SITE_URL}/og-image-v1.png`,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/guides/${guide.slug}/` },
      about: guide.tags.map((tag) => ({ "@type": "Thing", name: tag })),
      author: { "@type": "Organization", name: "ColorArchive", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "ColorArchive",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image-v1.png` },
      },
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
    ...(faqs.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <SiteHeader currentPath="/guides" />
      <StructuredDataScript data={structuredData} />
      <GuideDetailPage
        guide={guide}
        relatedGuides={relatedGuides}
        featuredCollection={guide.featuredCollectionId ? getCollectionById(guide.featuredCollectionId) ?? null : null}
        faqs={faqs}
      />
    </>
  );
}
