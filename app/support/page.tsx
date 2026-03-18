import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { SupportPage } from "@/src/components/support-page";

export const metadata: Metadata = {
  title: "Support",
  description: "See the strongest monetization paths for ColorArchive without adding backend complexity.",
};

export default function SupportRoute() {
  return (
    <>
      <SiteHeader currentPath="/support" />
      <SupportPage />
    </>
  );
}
