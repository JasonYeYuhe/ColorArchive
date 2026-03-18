import type { Metadata } from "next";
import { CollectionsPage } from "@/src/components/collections-page";
import { SiteHeader } from "@/src/components/site-header";
import { collections } from "@/src/lib/collections";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse curated ColorArchive palette collections built for real design use cases.",
};

export default function CollectionsRoute() {
  return (
    <>
      <SiteHeader currentPath="/collections" />
      <CollectionsPage collections={collections} />
    </>
  );
}
