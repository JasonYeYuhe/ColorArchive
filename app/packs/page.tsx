import type { Metadata } from "next";
import { PalettePacksPage } from "@/src/components/palette-packs-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { palettePacks } from "@/src/lib/palette-packs";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Color Palette Packs — ColorArchive",
    description:
      "Download professional color palette packs with hex codes, Figma tokens, CSS variables, and Tailwind config. Built for brand designers, UI developers, and creative teams.",
    url: "https://colorarchive.me/packs/",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "Palette Packs", item: "https://colorarchive.me/packs/" },
    ],
  },
];

export const metadata: Metadata = {
  title: "Color Palette Packs",
  description: "Download professional color palette packs with hex codes, Figma tokens, CSS variables, and Tailwind config. Built for brand designers, UI developers, and creative teams.",
  alternates: { canonical: "/packs/" },
};

export default function PacksRoute() {
  return (
    <>
      <SiteHeader currentPath="/packs" />
      <StructuredDataScript data={structuredData} />
      <PalettePacksPage packs={palettePacks} />
    </>
  );
}
