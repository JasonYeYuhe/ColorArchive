import type { Metadata } from "next";
import { FamiliesPage } from "@/src/components/families-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";

export const metadata: Metadata = {
  title: "Families",
  description: "Browse ColorArchive by hue family, from red and orange through blue, purple, and pink.",
  alternates: {
    canonical: "/families",
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
