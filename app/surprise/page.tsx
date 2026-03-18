import { Suspense } from "react";
import type { Metadata } from "next";
import { RandomDiscoveryPage } from "@/src/components/random-discovery-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "Surprise Me",
  description: "Jump to a random color discovery inside ColorArchive.",
};

export default function SurprisePage() {
  return (
    <>
      <SiteHeader currentPath="/surprise" />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading surprise…</main>}>
        <RandomDiscoveryPage colors={colors} />
      </Suspense>
    </>
  );
}
