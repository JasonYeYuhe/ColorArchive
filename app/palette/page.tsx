import { Suspense } from "react";
import type { Metadata } from "next";
import { PalettePage } from "@/src/components/palette-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Color Palette Builder — Design & Export Palettes | ColorArchive" },
  description: "Build custom color palettes with drag and drop. Export to CSS variables, Tailwind config, JSON, or Figma tokens. Share palettes with a link.",
  alternates: { canonical: "/palette/" },
  keywords: ["color palette builder", "palette designer", "CSS palette export", "Tailwind palette", "Figma tokens"],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Color Palette Builder — Design & Export Palettes | ColorArchive",
    description: "Build custom color palettes with drag and drop. Export to CSS variables, Tailwind config, JSON, or Figma tokens. Share palettes with a link.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Palette Builder — Design & Export Palettes | ColorArchive",
    description: "Build custom color palettes with drag and drop. Export to CSS variables, Tailwind config, JSON, or Figma tokens. Share palettes with a link.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Palette Builder", item: `${SITE_URL}/palette/` },
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
