import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { WordColorGeneratorPage } from "@/src/components/word-color-generator-page";

export const metadata: Metadata = {
  title: "Word to Color",
  description:
    "Generate a deterministic color signature from any word or phrase using a local static algorithm.",
};

export default function WordToColorPage() {
  return (
    <>
      <SiteHeader currentPath="/word-to-color" />
      <WordColorGeneratorPage />
    </>
  );
}
