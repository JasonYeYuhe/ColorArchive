import { Suspense } from "react";
import type { Metadata } from "next";
import { FreePackPage } from "@/src/components/free-pack-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { getCollectionById } from "@/src/lib/collections";
import { waitlistConfig } from "@/src/lib/checkout-config";
import { palettePacks } from "@/src/lib/palette-packs";

const freePackStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Free Color Palette Pack",
    description:
      "Download a free ColorArchive palette pack — includes hex codes, CSS variables, and Figma tokens. Preview the full pack format before buying.",
    url: "https://colorarchive.me/free-pack/",
    brand: { "@type": "Organization", name: "ColorArchive" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://colorarchive.me/free-pack/",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "Palette Packs", item: "https://colorarchive.me/packs/" },
      { "@type": "ListItem", position: 3, name: "Free Pack", item: "https://colorarchive.me/free-pack/" },
    ],
  },
];

const featuredPack = palettePacks.find((pack) => pack.id === "content-creator-bundle");
const featuredCollection = getCollectionById("orchid-bloom");

export const metadata: Metadata = {
  title: { absolute: "Free Color Palette Pack Download | ColorArchive" },
  description:
    "Download a free ColorArchive palette pack — includes hex codes, CSS variables, and Figma tokens. Preview the full pack format before buying.",
  alternates: {
    canonical: "/free-pack/",
  },
};

export default function FreePackRoute() {
  if (!featuredPack || !featuredCollection) {
    return null;
  }

  return (
    <>
      <SiteHeader currentPath="/packs" />
      <StructuredDataScript data={freePackStructuredData} />
      <Suspense fallback={null}>
        <FreePackPage
          featuredCollection={featuredCollection}
          pack={featuredPack}
          waitlist={waitlistConfig}
        />
      </Suspense>
    </>
  );
}
