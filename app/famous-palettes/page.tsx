import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { FamousPalettesPage } from "@/src/components/famous-palettes-page";

export const metadata: Metadata = {
  title: {
    absolute:
      "Famous Color Palettes — Iconic Brand, Art & Film Colors | ColorArchive",
  },
  description:
    "Explore 35+ iconic color palettes from famous brands (Google, Apple, Spotify), art movements (Bauhaus, Impressionism), films (Blade Runner, Wes Anderson), and design systems (Nord, Dracula). Copy hex codes instantly.",
  alternates: {
    canonical: "/famous-palettes/",
  },
  openGraph: {
    title: "Famous Color Palettes — Iconic Brand, Art & Film Colors",
    description:
      "35+ iconic palettes from Google, Apple, Bauhaus, The Matrix, and more. With hex codes, history, and cultural context.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Famous Color Palettes — Iconic Brand, Art & Film Colors",
    description:
      "35+ iconic palettes from Google, Apple, Bauhaus, The Matrix, and more. Copy hex codes, explore history.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Famous Color Palettes — Iconic Brand, Art & Film Colors",
  description:
    "A reference library of 35+ iconic color palettes from famous brands, art movements, films, design systems, and fashion trends — with hex codes and cultural context.",
  url: "https://colorarchive.me/famous-palettes/",
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
        name: "Famous Palettes",
        item: "https://colorarchive.me/famous-palettes/",
      },
    ],
  },
};

export default function FamousPalettesRoute() {
  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/famous-palettes" />
      <FamousPalettesPage />
    </>
  );
}
