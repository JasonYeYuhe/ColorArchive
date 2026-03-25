import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { ThanksPage } from "@/src/components/thanks-page";
import { checkoutFlowConfig } from "@/src/lib/checkout-config";

export const metadata: Metadata = {
  title: "Thanks",
  description: "Static purchase success page for ColorArchive palette pack checkouts.",
  robots: { index: false, follow: false },
};

export default function ThanksRoute() {
  return (
    <>
      <SiteHeader currentPath="/support" />
      <ThanksPage checkoutFlow={checkoutFlowConfig} />
    </>
  );
}
