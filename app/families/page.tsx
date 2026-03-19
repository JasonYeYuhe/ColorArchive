import type { Metadata } from "next";
import { FamiliesPage } from "@/src/components/families-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";

export const metadata: Metadata = {
  title: "Color Families",
  description: "Explore hex colors by hue family — Red, Orange, Yellow, Green, Teal, Blue, Purple, and Pink. Each family page includes all shades, tones, and design-ready swatches.",
  alternates: {
    canonical: "/families/",
  },
  openGraph: {
    images: ["https://colorarchive.me/generated/og/families/index.svg"],
  },
  twitter: {
    images: ["https://colorarchive.me/generated/og/families/index.svg"],
  },
};

export default function FamiliesRoute() {
  return (
    <>
      <SiteHeader currentPath="/families" />
      <FamiliesPage colors={colors} collections={collections} />
    </>
  );
}
