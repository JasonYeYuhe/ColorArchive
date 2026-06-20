import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { UseCaseDetailPage } from "@/src/components/use-case-detail-page";
import { useCases, getUseCaseById } from "@/src/lib/use-cases";
import { getCollectionById } from "@/src/lib/collections";
import { landingGuides } from "@/src/lib/guides";
import { SITE_URL } from "@/src/lib/site-config";

interface UseCaseDetailRouteProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return useCases.map((uc) => ({ slug: uc.id }));
}

export async function generateMetadata({ params }: UseCaseDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCaseById(slug);
  if (!useCase) return {};

  return {
    title: { absolute: `${useCase.title} Color Palettes — Design Guide | ColorArchive` },
    description: `${useCase.tagline}. ${useCase.description.slice(0, 150)}...`,
    alternates: { canonical: `/use-cases/${useCase.id}/` },
    // No explicit `images` — lets the colocated opengraph-image.tsx route bind (per-use-case
    // PNG card). An explicit images array would override and suppress it (the 9885f5b bug).
    openGraph: {
      title: `${useCase.title} Color Palettes | ColorArchive`,
      description: useCase.tagline,
    },
    twitter: {
      card: "summary_large_image",
      title: `${useCase.title} Color Palettes | ColorArchive`,
      description: useCase.tagline,
    },
  };
}

export default async function UseCaseDetailRoute({ params }: UseCaseDetailRouteProps) {
  const { slug } = await params;
  const useCase = getUseCaseById(slug);
  if (!useCase) notFound();

  const relatedGuides = landingGuides
    .filter((g) =>
      useCase.guideSlugKeywords.some(
        (kw) =>
          g.slug.includes(kw) ||
          g.tags.some((tag) => tag.toLowerCase().includes(kw)) ||
          g.searchIntent.toLowerCase().includes(kw),
      ),
    )
    .slice(0, 4)
    .map(({ slug, title, eyebrow }) => ({ slug, title, eyebrow }));

  const useCaseStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${useCase.title} Color Palettes — Design Guide`,
      description: `${useCase.tagline}. ${useCase.description.slice(0, 150)}...`,
      url: `${SITE_URL}/use-cases/${useCase.id}/`,
      publisher: {
        "@type": "Organization",
        name: "ColorArchive",
        url: SITE_URL,
        logo: `${SITE_URL}/og-image-v1.png`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Use Cases", item: `${SITE_URL}/use-cases/` },
        { "@type": "ListItem", position: 3, name: useCase.title, item: `${SITE_URL}/use-cases/${useCase.id}/` },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/use-cases" />
      <StructuredDataScript data={useCaseStructuredData} />
      <UseCaseDetailPage
        useCase={useCase}
        relatedCollections={useCase.collectionIds.map((id) => getCollectionById(id)).filter((c): c is NonNullable<typeof c> => !!c)}
        relatedGuides={relatedGuides}
      />
    </>
  );
}
