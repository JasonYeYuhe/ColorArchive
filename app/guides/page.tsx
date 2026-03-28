import type { Metadata } from "next";
import { GuidesPage } from "@/src/components/guides-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { landingGuides } from "@/src/lib/guides";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Color Guides — Palettes, Tokens & Design Systems | ColorArchive",
    description:
      "290+ practical guides for color palettes, dark mode UI, Figma color tokens, Tailwind themes, brand color systems, and accessible design. Free tools and downloadable palettes included.",
    url: "https://colorarchive.me/guides/",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://colorarchive.me/guides/" },
    ],
  },
];

export const metadata: Metadata = {
  title: "Color Guides — Palettes, Tokens & Design Systems",
  description:
    "290+ practical guides for color palettes, dark mode UI, Figma color tokens, Tailwind themes, brand color systems, and accessible design. Free tools and downloadable palettes included.",
  alternates: { canonical: "/guides/" },
};

export default function GuidesRoute() {
  return (
    <>
      <SiteHeader currentPath="/guides" />
      <StructuredDataScript data={structuredData} />
      <GuidesPage guides={landingGuides} />
    </>
  );
}
