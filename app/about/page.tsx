import type { Metadata } from "next";
import { AboutPage } from "@/src/components/about-page";
import { SiteHeader } from "@/src/components/site-header";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn what ColorArchive is, why it is built as a static project, and how its archive and product layers fit together.",
  alternates: {
    canonical: "/about",
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
