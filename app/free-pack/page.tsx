import { Suspense } from "react";
import type { Metadata } from "next";
import { FreePackPage } from "@/src/components/free-pack-page";
import { SiteHeader } from "@/src/components/site-header";
import { getCollectionById } from "@/src/lib/collections";
import { waitlistConfig } from "@/src/lib/checkout-config";
import { palettePacks } from "@/src/lib/palette-packs";

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
