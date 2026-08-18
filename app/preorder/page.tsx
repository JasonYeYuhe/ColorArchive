import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { PreorderPage } from "@/src/components/preorder-page";
import { preorderConfig } from "@/src/lib/checkout-config";

// The page body has honoured `preorderConfig.closed` since 2026-07-24, but the
// metadata kept selling: the tab title said "Pre-order the Accessibility
// Auditor" and the description quoted "Founder price ¥4,999" for a product that
// was off-ramped. noindex keeps it out of search, but the title is what a
// browser tab, a bookmark, and a chat/social unfurl show — so the one surface
// that still advertised the cancelled pre-order was the one people share.
const openMetadata: Metadata = {
  title: { absolute: `Pre-order the ${preorderConfig.feature} — ColorArchive Pro` },
  description: `Pre-order the ColorArchive ${preorderConfig.feature}: audit a whole palette for WCAG + color-blindness, get accessible fixes from the archive, and export a report. Founder price ${preorderConfig.price}.`,
  // Time-boxed willingness-to-pay experiment — keep it out of the index so a
  // pulled experiment doesn't leave a dead ranked URL. Traffic comes from internal
  // links + posts, not SEO.
  robots: { index: false, follow: true },
};

const closedMetadata: Metadata = {
  title: { absolute: `${preorderConfig.feature} — no longer available · ColorArchive` },
  description: `The ColorArchive ${preorderConfig.feature} pre-order closed on ${preorderConfig.closedOn} and the feature was not built. See ColorArchive Pro for what is available today.`,
  robots: { index: false, follow: true },
};

export const metadata: Metadata = preorderConfig.closed ? closedMetadata : openMetadata;

export default function PreorderRoute() {
  return (
    <>
      <SiteHeader currentPath="/pro" />
      <PreorderPage />
    </>
  );
}
