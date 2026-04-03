import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { CancelPage } from "@/src/components/cancel-page";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  description: "Checkout cancelled — explore ColorArchive Pro or browse free resources.",
  robots: { index: false, follow: false },
};

export default function CancelRoute() {
  return (
    <>
      <SiteHeader currentPath="/support" />
      <CancelPage />
    </>
  );
}
