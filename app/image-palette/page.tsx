import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ImagePalettePage } from "@/src/components/image-palette-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Extract Colors from Image — Image Palette Generator | ColorArchive" },
  description:
    "Upload an image to extract its color palette. Get hex, RGB, and HSL values for dominant colors. Runs locally in your browser — no upload needed. Free.",
  alternates: { canonical: "/image-palette/" },
  keywords: ["extract colors from image", "image color picker", "image palette generator", "color extraction", "dominant colors"],
  openGraph: {
    title: "Extract Colors from Image — Image Palette Generator | ColorArchive",
    description:
      "Upload an image to extract its color palette. Get hex, RGB, and HSL values for dominant colors. Runs locally in your browser — no upload needed. Free.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Extract Colors from Image — Image Palette Generator | ColorArchive",
    description:
      "Upload an image to extract its color palette. Get hex, RGB, and HSL values for dominant colors. Runs locally in your browser — no upload needed. Free.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Image Color Extractor",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/image-palette/`,
  description:
    "Extract the dominant color palette from any image. Get hex, RGB, and HSL values. Find the closest ColorArchive match for each extracted color.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Image Color Extractor", item: `${SITE_URL}/image-palette/` },
  ],
};

export default function ImagePaletteRoute() {
  return (
    <>
      <SiteHeader currentPath="/image-palette" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <ImagePalettePage />
    </>
  );
}
