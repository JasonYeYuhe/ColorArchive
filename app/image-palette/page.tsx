import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ImagePalettePage } from "@/src/components/image-palette-page";

export const metadata: Metadata = {
  title: { absolute: "Image Color Extractor — Extract Palette from Any Photo | ColorArchive" },
  description:
    "Upload any image to instantly extract its dominant color palette. Get hex, RGB, and HSL values. Find the closest ColorArchive match for each color. Free, private, runs in your browser.",
  alternates: { canonical: "/image-palette/" },
  openGraph: {
    title: "Image Color Extractor — Extract Palette from Any Photo | ColorArchive",
    description:
      "Extract dominant colors from any image. Get hex/RGB/HSL values and find matching ColorArchive colors. Free and private — no uploads.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Image Color Extractor | ColorArchive",
    description:
      "Extract a color palette from any photo or design. Find the closest ColorArchive match for each dominant color.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Image Color Extractor",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/image-palette/",
  description:
    "Extract the dominant color palette from any image. Get hex, RGB, and HSL values. Find the closest ColorArchive match for each extracted color.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://colorarchive.me/tools/" },
    { "@type": "ListItem", position: 3, name: "Image Color Extractor", item: "https://colorarchive.me/image-palette/" },
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
