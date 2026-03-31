import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { SpectrumExplorerPage } from "@/src/components/spectrum-explorer-page";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "Color Spectrum Explorer",
  description: "Visualize all 5,400+ ColorArchive hex colors as a hue-by-lightness matrix. See every shade across the full spectrum from red through violet at a glance.",
  alternates: { canonical: "/spectrum/" },
  openGraph: {
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Spectrum Explorer",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/spectrum/",
  description:
    "Visualize all 5,400+ ColorArchive hex colors as a hue-by-lightness matrix. See every shade across the full spectrum from red through violet at a glance.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Spectrum", item: "https://colorarchive.me/spectrum/" },
  ],
};

export default function SpectrumPage() {
  return (
    <>
      <SiteHeader currentPath="/spectrum" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <SpectrumExplorerPage colors={colors} />
    </>
  );
}
