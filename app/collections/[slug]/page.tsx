import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionDetailPage } from "@/src/components/collection-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { collections, getCollectionById } from "@/src/lib/collections";
import { palettePacks } from "@/src/lib/palette-packs";

interface CollectionDetailRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return collections.map((collection) => ({
    slug: collection.id,
  }));
}

export async function generateMetadata({
  params,
}: CollectionDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionById(slug);

  if (!collection) {
    return {};
  }

  return {
    title: collection.title,
    description: collection.summary,
    alternates: {
      canonical: `/collections/${collection.id}`,
    },
  };
}

export default async function CollectionDetailRoute({
  params,
}: CollectionDetailRouteProps) {
  const { slug } = await params;
  const collection = getCollectionById(slug);

  if (!collection) {
    notFound();
  }

  const relatedPacks = palettePacks.filter((pack) =>
    pack.previewCollectionIds.includes(collection.id),
  );
  const collectionStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: collection.title,
      description: collection.description,
      keywords: [...collection.tags, ...collection.promptWords].join(", "),
      url: `https://colorarchive.me/collections/${collection.id}/`,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${collection.title} palette`,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: collection.palette.length,
      itemListElement: collection.palette.map((color, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://colorarchive.me/colors/${color.id}/`,
        name: color.name,
      })),
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/collections" />
      <StructuredDataScript data={collectionStructuredData} />
      <CollectionDetailPage collection={collection} relatedPacks={relatedPacks} />
    </>
  );
}
