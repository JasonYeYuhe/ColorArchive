import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchExplorerPage } from "@/src/components/search-explorer-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "Search Hex Colors",
  description: "Search 5,400+ curated hex colors by name, hex code, or color family. Filter by hue, lightness, and saturation to find the exact palette color you need.",
  alternates: { canonical: "/search/" },
};

export default function SearchPage() {
  return (
    <>
      <SiteHeader currentPath="/all-colors" />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading search…</main>}>
        <SearchExplorerPage colors={colors} />
      </Suspense>
    </>
  );
}
