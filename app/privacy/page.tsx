import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { PrivacyPage } from "@/src/components/privacy-page";

export const metadata: Metadata = {
  title: "Privacy Policy — ColorArchive",
  description:
    "Privacy Policy for ColorArchive. Learn how we collect, use, and protect your data.",
  alternates: {
    canonical: "/privacy/",
  },
};

export default function PrivacyRoute() {
  return (
    <>
      <SiteHeader currentPath="/about" />
      <PrivacyPage />
    </>
  );
}
