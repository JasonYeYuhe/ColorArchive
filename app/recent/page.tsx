import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { RecentColorsPage } from "@/src/components/recent-colors-page";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "Recent Colors",
  description: "Local recently viewed color trail for ColorArchive browsing sessions.",
  robots: { index: false, follow: false },
};

export default function RecentRoute() {
  return (
    <>
      <SiteHeader currentPath="/recent" />
      <RecentColorsPage colors={colors} />
    </>
  );
}
