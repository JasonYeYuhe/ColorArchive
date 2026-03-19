import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { WordColorGeneratorPage } from "@/src/components/word-color-generator-page";

export const metadata: Metadata = {
  title: "Word to Color Generator",
  description:
    "Type any word or phrase and instantly get a unique hex color code. A deterministic word-to-color algorithm — same word always produces the same color, with 5 tonal variants.",
  alternates: { canonical: "/word-to-color/" },
};

export default function WordToColorPage() {
  return (
    <>
      <SiteHeader currentPath="/word-to-color" />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading generator…</main>}>
        <WordColorGeneratorPage />
      </Suspense>
    </>
  );
}
