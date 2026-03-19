import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { CancelPage } from "@/src/components/cancel-page";
import { checkoutFlowConfig } from "@/src/lib/checkout-config";
import { palettePacks } from "@/src/lib/palette-packs";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  description: "Static cancel return page for ColorArchive off-site checkout flows.",
};

export default function CancelRoute() {
  const starterPack = palettePacks.find((p) => p.id === "palette-pack-vol-1");
  return (
    <>
      <SiteHeader currentPath="/support" />
      <CancelPage checkoutFlow={checkoutFlowConfig} starterPack={starterPack} />
    </>
  );
}
