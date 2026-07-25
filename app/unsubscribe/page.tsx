import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { UnsubscribePage } from "@/src/components/unsubscribe-page";

export const metadata: Metadata = {
  title: { absolute: "Unsubscribe | ColorArchive" },
  description: "Stop receiving ColorArchive emails.",
  // A transactional destination, not a page anyone should find in search.
  robots: { index: false, follow: false },
};

export default function UnsubscribeRoute() {
  return (
    <>
      <SiteHeader currentPath="/unsubscribe" />
      {/* Suspense: the client component reads ?email= via useSearchParams. */}
      <Suspense fallback={<main className="px-4 py-20 text-sm text-neutral-500">Loading…</main>}>
        <UnsubscribePage />
      </Suspense>
    </>
  );
}
