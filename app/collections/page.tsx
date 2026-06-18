import type { Metadata } from "next";
import { CollectionsPage } from "@/src/components/collections-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { collections } from "@/src/lib/collections";
import { getGuidesForCollection } from "@/src/lib/guides";
import { SITE_URL } from "@/src/lib/site-config";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Color Palette Collections — ColorArchive",
    description:
      "Curated color palette collections from ColorArchive — editorial themes for branding, UI design, and print. Each collection includes hex codes, design tokens, and export formats.",
    url: `${SITE_URL}/collections/`,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Collections", item: `${SITE_URL}/collections/` },
    ],
  },
];

export const metadata: Metadata = {
  title: "Color Palette Collections",
  description: "Curated color palette collections from ColorArchive — editorial themes for branding, UI design, and print. Each collection includes hex codes, design tokens, and export formats.",
  alternates: { canonical: "/collections/" },
  openGraph: {
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  robots: { index: true, follow: true },
};

export default function CollectionsRoute() {
  const guidesByCollection: Record<
    string,
    { slug: string; title: string; summary: string; searchIntent: string }[]
  > = {};
  for (const c of collections) {
    guidesByCollection[c.id] = getGuidesForCollection(c.id, 2).map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      summary: guide.summary,
      searchIntent: guide.searchIntent,
    }));
  }

  return (
    <>
      <SiteHeader currentPath="/collections" />
      <StructuredDataScript data={structuredData} />
      <CollectionsPage
        collections={collections.map((c) => ({
          id: c.id,
          title: c.title,
          summary: c.summary,
          description: c.description,
          tags: c.tags,
          palette: c.palette,
        }))}
        guidesByCollection={guidesByCollection}
      />
    </>
  );
}
