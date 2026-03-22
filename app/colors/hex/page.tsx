import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomColorPage } from "@/src/components/custom-color-page";
import { SiteHeader } from "@/src/components/site-header";

export const metadata: Metadata = {
  title: "Custom Color — ColorArchive",
  description:
    "Explore any hex color: see WCAG contrast, tonal scale, nearest archive matches, and harmonic relationships.",
};

export default function HexColorPage() {
  return (
    <>
      <SiteHeader currentPath="/colors" />
      <Suspense>
        <CustomColorPage />
      </Suspense>
    </>
  );
}
