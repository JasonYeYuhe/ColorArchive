import type { Metadata } from "next";
import { CollectionsPage } from "@/src/components/collections-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { collections } from "@/src/lib/collections";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Color Palette Collections — ColorArchive",
    description:
      "Curated color palette collections from ColorArchive — editorial themes for branding, UI design, and print. Each collection includes hex codes, design tokens, and export formats.",
    url: "https://colorarchive.me/collections/",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "Collections", item: "https://colorarchive.me/collections/" },
    ],
  },
];

export const metadata: Metadata = {
  title: "Color Palette Collections",
  description: "Curated color palette collections from ColorArchive — editorial themes for branding, UI design, and print. Each collection includes hex codes, design tokens, and export formats.",
  alternates: { canonical: "/collections/" },
  openGraph: {
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  robots: { index: true, follow: true },
};

export default function CollectionsRoute() {
  return (
    <>
      <SiteHeader currentPath="/collections" />
      <StructuredDataScript data={structuredData} />
      <CollectionsPage collections={collections} />
    </>
  );
}
