import { Suspense } from "react";
import type { Metadata } from "next";
import { AllColorsPage } from "@/src/components/all-colors-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "All Colors",
  description: "Browse the full dense ColorArchive spectrum in a single page.",
};

export default function AllColorsRoute() {
  return (
    <>
      <SiteHeader currentPath="/all-colors" />
      <Suspense fallback={null}>
        <AllColorsPage colors={colors} />
      </Suspense>
    </>
  );
}
