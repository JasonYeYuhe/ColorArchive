import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { SpectrumExplorerPage } from "@/src/components/spectrum-explorer-page";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "Spectrum Explorer",
  description: "Browse ColorArchive as a hue-by-lightness spectrum matrix.",
};

export default function SpectrumPage() {
  return (
    <>
      <SiteHeader currentPath="/spectrum" />
      <SpectrumExplorerPage colors={colors} />
    </>
  );
}
