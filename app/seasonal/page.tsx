import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorSeasonsPage } from "@/src/components/color-seasons-page";

export const metadata: Metadata = {
  title: {
    absolute:
      "Seasonal Color Palettes — Spring, Summer, Autumn & Winter Colors | ColorArchive",
  },
  description:
    "Explore curated color palettes for all four seasons — spring pastels, summer vibrancy, autumn earth tones, and winter jewels. Each palette includes 6 signature colors with hex codes, cultural context, design tips, and industry applications.",
  alternates: {
    canonical: "/seasonal/",
  },
  openGraph: {
    title: "Seasonal Color Palettes — Spring, Summer, Autumn & Winter",
    description:
      "Curated seasonal color references: spring blossom pastels, summer coral & teal, autumn harvest earth tones, winter navy & crimson. With hex codes, cultural context, and design guidance.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Seasonal Color Palettes — Spring, Summer, Autumn & Winter",
    description:
      "Curated seasonal color references: spring blossom pastels, summer coral & teal, autumn harvest earth tones, winter navy & crimson.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Seasonal Color Palettes — Spring, Summer, Autumn & Winter Colors",
  description:
    "A curated seasonal color reference with 24 signature colors across four seasons — including hex codes, cultural context, design tips, and industry applications for spring, summer, autumn, and winter palettes.",
  url: "https://colorarchive.me/seasonal/",
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
        name: "Seasonal Color Palettes",
        item: "https://colorarchive.me/seasonal/",
      },
    ],
  },
};

export default function SeasonalRoute() {
  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/seasonal" />
      <ColorSeasonsPage />
    </>
  );
}
