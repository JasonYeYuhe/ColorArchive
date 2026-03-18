import type { Metadata } from "next";
import { FreePackPage } from "@/src/components/free-pack-page";
import { SiteHeader } from "@/src/components/site-header";
import { getCollectionById } from "@/src/lib/collections";
import { waitlistConfig } from "@/src/lib/checkout-config";
import { palettePacks } from "@/src/lib/palette-packs";

const featuredPack = palettePacks.find((pack) => pack.id === "content-creator-bundle");
const featuredCollection = getCollectionById("orchid-bloom");

export const metadata: Metadata = {
  title: "Free Sample Pack",
  description:
    "Download a free ColorArchive sample pack while paid palette packs are still pending checkout approval.",
  alternates: {
    canonical: "/free-pack",
  },
};

export default function FreePackRoute() {
  if (!featuredPack || !featuredCollection) {
    return null;
  }

  return (
    <>
      <SiteHeader currentPath="/packs" />
      <FreePackPage
        featuredCollection={featuredCollection}
        pack={featuredPack}
        waitlist={waitlistConfig}
      />
    </>
  );
}
