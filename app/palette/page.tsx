import { Suspense } from "react";
import type { Metadata } from "next";
import { PalettePage } from "@/src/components/palette-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";

export const metadata: Metadata = {
  title: "Palette Builder",
  description: "View, export, and share curated color palettes from the ColorArchive.",
  robots: { index: false, follow: false },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Palette Builder", item: "https://colorarchive.me/palette/" },
  ],
};

export default function PaletteRoute() {
  return (
    <>
      <StructuredDataScript data={breadcrumbData} />
      <SiteHeader currentPath="/palette" />
      <Suspense fallback={null}>
        <PalettePage />
      </Suspense>
    </>
  );
}
