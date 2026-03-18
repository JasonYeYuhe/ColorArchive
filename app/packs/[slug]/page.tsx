import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackDetailPage } from "@/src/components/pack-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import { collections } from "@/src/lib/collections";
import { palettePacks } from "@/src/lib/palette-packs";

interface PackDetailRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return palettePacks.map((pack) => ({
    slug: pack.id,
  }));
}

export async function generateMetadata({ params }: PackDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const pack = palettePacks.find((entry) => entry.id === slug);

  if (!pack) {
    return {};
  }

  return {
    title: pack.title,
    description: pack.detail,
    alternates: {
      canonical: `/packs/${pack.id}`,
    },
  };
}

export default async function PackDetailRoute({ params }: PackDetailRouteProps) {
  const { slug } = await params;
  const pack = palettePacks.find((entry) => entry.id === slug);

  if (!pack) {
    notFound();
  }

  const relatedCollections = pack.previewCollectionIds
    .map((collectionId) => collections.find((collection) => collection.id === collectionId))
    .filter((collection): collection is (typeof collections)[number] => Boolean(collection));

  return (
    <>
      <SiteHeader currentPath="/packs" />
      <PackDetailPage pack={pack} relatedCollections={relatedCollections} />
    </>
  );
}
