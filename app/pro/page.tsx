import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { ProPage } from "@/src/components/pro-page";

export const metadata: Metadata = {
  title: "Pro",
  description:
    "Unlock unlimited AI palette generations, full exports, WCAG reports, and more with ColorArchive Pro.",
  alternates: { canonical: "/pro/" },
};

export default function ProRoute() {
  return (
    <>
      <SiteHeader currentPath="/pro" />
      <ProPage />
    </>
  );
}
