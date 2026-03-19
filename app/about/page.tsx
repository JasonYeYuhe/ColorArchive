import type { Metadata } from "next";
import { AboutPage } from "@/src/components/about-page";
import { SiteHeader } from "@/src/components/site-header";

export const metadata: Metadata = {
  title: "About ColorArchive",
  description:
    "ColorArchive is a curated library of 2016 hex color codes for designers and developers. Learn how the archive works, how colors are generated, and what the product layer offers.",
  alternates: {
    canonical: "/about/",
  },
};

export default function AboutRoute() {
  return (
    <>
      <SiteHeader currentPath="/about" />
      <AboutPage />
    </>
  );
}
