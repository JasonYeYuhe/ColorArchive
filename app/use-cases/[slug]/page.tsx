import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/site-header";
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

  return (
    <>
      <SiteHeader currentPath="/use-cases" />
      <UseCaseDetailPage useCase={useCase} />
    </>
  );
}
