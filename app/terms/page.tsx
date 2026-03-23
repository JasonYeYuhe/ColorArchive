import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { TermsPage } from "@/src/components/terms-page";

export const metadata: Metadata = {
  title: "Terms of Service — ColorArchive",
  description:
    "Terms of Service for ColorArchive. Read our terms governing access to and use of our services.",
  alternates: {
    canonical: "/terms/",
  },
};

export default function TermsRoute() {
  return (
    <>
      <SiteHeader currentPath="/about" />
      <TermsPage />
    </>
  );
}
