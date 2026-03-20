import { Suspense } from "react";
import type { Metadata } from "next";
import { AllColorsPage } from "@/src/components/all-colors-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "All 2016 Hex Colors",
  description: "Browse the complete ColorArchive — all 2016 curated hex color codes in a single dense view, organized by hue across the full spectrum.",
  alternates: { canonical: "/all-colors/" },
  openGraph: {
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  robots: { index: true, follow: true },
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
