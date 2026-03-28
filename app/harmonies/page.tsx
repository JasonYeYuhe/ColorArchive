import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorHarmoniesPage } from "@/src/components/color-harmonies-page";

export const metadata: Metadata = {
  title: { absolute: "Color Harmonies Calculator — Color Wheel Tool | ColorArchive" },
  description: "Find complementary, analogous, triadic, and split-complementary color harmonies. Interactive color wheel with hex/RGB/HSL values. Free online tool.",
  alternates: { canonical: "/harmonies/" },
  keywords: ["color harmonies", "color wheel", "complementary colors", "triadic colors", "analogous colors", "color theory"],
  openGraph: {
    title: "Color Harmonies Calculator — Color Wheel Tool | ColorArchive",
    description: "Find complementary, analogous, triadic, and split-complementary color harmonies. Interactive color wheel with hex/RGB/HSL values. Free online tool.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Color Harmonies Calculator — Color Wheel Tool | ColorArchive",
    description: "Find complementary, analogous, triadic, and split-complementary color harmonies. Interactive color wheel with hex/RGB/HSL values. Free online tool.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Harmonies Calculator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  url: "https://colorarchive.me/harmonies/",
  description: "Calculate color harmonies from any hex color. Interactive color wheel with 6 harmony types.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://colorarchive.me" },
      { "@type": "ListItem", position: 2, name: "Color Harmonies", item: "https://colorarchive.me/harmonies/" },
    ],
  },
};

export default function HarmoniesRoute() {
  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/harmonies" />
      <ColorHarmoniesPage />
    </>
  );
}
