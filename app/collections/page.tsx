import type { Metadata } from "next";
import { CollectionsPage } from "@/src/components/collections-page";
import { SiteHeader } from "@/src/components/site-header";
import { collections } from "@/src/lib/collections";

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
      <CollectionsPage collections={collections} />
    </>
  );
}
