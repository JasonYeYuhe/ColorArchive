import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { UseCaseDetailPage } from "@/src/components/use-case-detail-page";
import { useCases, getUseCaseById } from "@/src/lib/use-cases";

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
    openGraph: {
      title: `${useCase.title} Color Palettes | ColorArchive`,
      description: useCase.tagline,
      images: ["https://colorarchive.me/og-image-v1.png"],
    },
  };
}

export default async function UseCaseDetailRoute({ params }: UseCaseDetailRouteProps) {
  const { slug } = await params;
  const useCase = getUseCaseById(slug);
  if (!useCase) notFound();

  const useCaseStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${useCase.title} Color Palettes — Design Guide`,
      description: `${useCase.tagline}. ${useCase.description.slice(0, 150)}...`,
      url: `https://colorarchive.me/use-cases/${useCase.id}/`,
      publisher: {
        "@type": "Organization",
        name: "ColorArchive",
        url: "https://colorarchive.me",
        logo: "https://colorarchive.me/og-image-v1.png",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
        { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://colorarchive.me/use-cases/" },
        { "@type": "ListItem", position: 3, name: useCase.title, item: `https://colorarchive.me/use-cases/${useCase.id}/` },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/use-cases" />
      <StructuredDataScript data={useCaseStructuredData} />
      <UseCaseDetailPage useCase={useCase} />
    </>
  );
}
