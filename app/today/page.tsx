import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { ColorOfDayPage } from "@/src/components/color-of-day-page";

export const metadata: Metadata = {
  title: { absolute: "Color of the Day | ColorArchive" },
  description:
    "A new color from the ColorArchive collection, every single day. Explore today's color, its palette companions, and share it.",
  alternates: { canonical: "/today/" },
  openGraph: {
    title: "Color of the Day | ColorArchive",
    description: "One curated color, every day. Explore today's pick from 5,400+ ColorArchive colors.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

export default function TodayRoute() {
  return (
    <>
      <SiteHeader currentPath="/today" />
      <ColorOfDayPage />
    </>
  );
}
