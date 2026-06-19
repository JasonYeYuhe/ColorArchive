import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionDetailPage } from "@/src/components/collection-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { collections, getCollectionById } from "@/src/lib/collections";
import { SITE_URL } from "@/src/lib/site-config";

interface CollectionDetailRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = false;

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
    title: { absolute: `${collection.title} — Color Palette | ColorArchive` },
    description: collection.summary,
    alternates: {
      canonical: `/collections/${collection.id}/`,
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

  const collectionStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: collection.title,
      description: collection.description,
      keywords: [...collection.tags, ...collection.promptWords].join(", "),
      url: `${SITE_URL}/collections/${collection.id}/`,
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
        url: `${SITE_URL}/colors/${color.id}/`,
        name: color.name,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Collections", item: `${SITE_URL}/collections/` },
        { "@type": "ListItem", position: 3, name: collection.title, item: `${SITE_URL}/collections/${collection.id}/` },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/collections" />
      <StructuredDataScript data={collectionStructuredData} />
      <CollectionDetailPage collection={collection} />
    </>
  );
}
