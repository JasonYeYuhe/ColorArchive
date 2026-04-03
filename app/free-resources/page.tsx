import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { FreeResourcesPage } from "@/src/components/free-resources-page";

export const metadata: Metadata = {
  title: "Free Resources",
  description:
    "Download free color palette samples, preview design tokens, and explore 20+ free tools. No account required.",
  alternates: { canonical: "/free-resources/" },
};

export default function FreeResourcesRoute() {
  return (
    <>
      <SiteHeader currentPath="/free-resources" />
      <FreeResourcesPage />
    </>
  );
}
