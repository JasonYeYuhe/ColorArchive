import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FamilyDetailPage } from "@/src/components/family-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import {
  COLOR_FAMILY_PAGES,
  getCollectionsForFamily,
  getColorsForFamily,
  getFamilyBySlug,
  getFamilyPageData,
  getFamilySlug,
} from "@/src/lib/color-family-pages";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";
import { palettePacks } from "@/src/lib/palette-packs";
import { StructuredDataScript } from "@/src/components/structured-data-script";

interface FamilyRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return COLOR_FAMILY_PAGES.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: FamilyRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const family = getFamilyBySlug(slug);

  if (!family) {
    return {};
  }

  const page = getFamilyPageData(family);

  return {
    title: page.title,
    description: page.seoDescription,
    alternates: {
      canonical: `/families/${page.slug}`,
    },
    openGraph: {
      images: [`https://colorarchive.me/generated/og/families/${page.slug}.svg`],
    },
    twitter: {
      images: [`https://colorarchive.me/generated/og/families/${page.slug}.svg`],
    },
  };
}

export default async function FamilyDetailRoute({ params }: FamilyRouteProps) {
  const { slug } = await params;
  const family = getFamilyBySlug(slug);

  if (!family) {
    notFound();
  }

  const familyPage = getFamilyPageData(family);
  const familyColors = getColorsForFamily(colors, family);
  const relatedCollections = getCollectionsForFamily(collections, family);
  const collectionIds = new Set(relatedCollections.map((entry) => entry.collection.id));
  const relatedPacks = palettePacks.filter((pack) =>
    pack.previewCollectionIds.some((collectionId) => collectionIds.has(collectionId)),
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: familyPage.title,
    description: familyPage.description,
    url: `https://colorarchive.me/families/${getFamilySlug(family)}/`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: familyColors.slice(0, 24).map((color, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: color.name,
        url: `https://colorarchive.me/colors/${color.id}/`,
      })),
    },
  };

  return (
    <>
      <SiteHeader currentPath="/families" />
      <StructuredDataScript data={structuredData} />
      <FamilyDetailPage
        family={family}
        familyPage={familyPage}
        familyColors={familyColors}
        relatedCollections={relatedCollections}
        relatedPacks={relatedPacks}
      />
    </>
  );
}
