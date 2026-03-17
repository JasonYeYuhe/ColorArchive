import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchExplorerPage } from "@/src/components/search-explorer-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the full ColorArchive by color name, hex value, and family.",
};

export default function SearchPage() {
  return (
    <>
      <SiteHeader currentPath="/search" />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading search…</main>}>
        <SearchExplorerPage colors={colors} />
      </Suspense>
    </>
  );
}
