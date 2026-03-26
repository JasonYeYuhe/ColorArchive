import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorDecadesPage } from "@/src/components/color-decades-page";

export const metadata: Metadata = {
  title: {
    absolute:
      "Color Palettes by Decade — 1920s to 2020s Design History | ColorArchive",
  },
  description:
    "Explore the signature color palettes of each decade from the 1920s Art Deco era to the 2020s biophilic aesthetic. 11 decades × 6 colors each — with cultural history, design movement context, and copy-ready hex codes.",
  alternates: {
    canonical: "/decades/",
  },
  openGraph: {
    title: "Color Palettes by Decade — 1920s to 2020s",
    description:
      "100 years of design color history: Art Deco gold, 1950s pastels, 1970s earth tones, 1980s neon, Millennial Pink, and more. With hex codes and cultural context.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Color Palettes by Decade — 1920s to 2020s",
    description:
      "100 years of design color history: Art Deco gold, 1950s pastels, 1970s earth tones, 1980s neon, Millennial Pink, and more.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Color Palettes by Decade — 1920s to 2020s Design History",
  description:
    "A reference library of signature color palettes from each decade of the 20th and 21st centuries — with hex codes, cultural context, and design movement analysis.",
  url: "https://colorarchive.me/decades/",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ColorArchive",
        item: "https://colorarchive.me/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Color by Decade",
        item: "https://colorarchive.me/decades/",
      },
    ],
  },
};

export default function DecadesRoute() {
  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/decades" />
      <ColorDecadesPage />
    </>
  );
}
