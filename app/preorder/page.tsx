import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { PreorderPage } from "@/src/components/preorder-page";
import { preorderConfig } from "@/src/lib/checkout-config";

export const metadata: Metadata = {
  title: { absolute: `Pre-order the ${preorderConfig.feature} — ColorArchive Pro` },
  description: `Pre-order the ColorArchive ${preorderConfig.feature}: audit a whole palette for WCAG + color-blindness, get accessible fixes from the archive, and export a report. Founder price ${preorderConfig.priceUsd}.`,
  // Time-boxed willingness-to-pay experiment — keep it out of the index so a
  // pulled experiment doesn't leave a dead ranked URL. Traffic comes from internal
  // links + posts, not SEO.
  robots: { index: false, follow: true },
};

export default function PreorderRoute() {
  return (
    <>
      <SiteHeader currentPath="/pro" />
      <PreorderPage />
    </>
  );
}
