import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { ContrastCheckerPage } from "@/src/components/contrast-page";

export const metadata: Metadata = {
  title: "Contrast Checker",
  description:
    "Check WCAG contrast ratios between any two colors. See AA/AAA compliance for normal text, large text, and UI components.",
};

export default function ContrastPage() {
  return (
    <>
      <SiteHeader currentPath="/contrast" />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading checker…</main>}>
        <ContrastCheckerPage />
      </Suspense>
    </>
  );
}
