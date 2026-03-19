import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackDetailPage } from "@/src/components/pack-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
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
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pack.title,
    description: pack.detail,
    category: "Digital download",
    brand: {
      "@type": "Brand",
      name: "ColorArchive",
    },
    image: "https://colorarchive.me/og-image-v1.png",
    url: `https://colorarchive.me/packs/${pack.id}/`,
    offers: {
      "@type": "Offer",
      priceCurrency: "JPY",
      price: pack.priceHint.replace(/[^\d]/g, ""),
      availability: "https://schema.org/InStock",
      url: pack.checkoutUrl ?? `https://colorarchive.me/packs/${pack.id}/`,
    },
    isRelatedTo: relatedCollections.map((collection) => ({
      "@type": "CreativeWork",
      name: collection.title,
      url: `https://colorarchive.me/collections/${collection.id}/`,
    })),
  };

  return (
    <>
      <SiteHeader currentPath="/packs" />
      <StructuredDataScript data={productStructuredData} />
      <PackDetailPage pack={pack} relatedCollections={relatedCollections} />
    </>
  );
}
