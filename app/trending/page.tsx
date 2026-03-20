import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { TrendingPage } from "@/src/components/trending-page";

export const metadata: Metadata = {
  title: "Trending Colors — ColorArchive",
  description:
    "Discover the most-viewed colors and palettes on ColorArchive right now. See what designers are reaching for this week.",
  alternates: {
    canonical: "/trending/",
  },
  openGraph: {
    title: "Trending Colors — ColorArchive",
    description: "Discover the most-viewed colors on ColorArchive right now.",
    url: "https://colorarchive.me/trending/",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

export default function TrendingRoute() {
  return (
    <>
      <SiteHeader currentPath="/trending" />
      <TrendingPage />
    </>
  );
}
