import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { WaitlistPage } from "@/src/components/waitlist-page";
import { waitlistConfig } from "@/src/lib/checkout-config";
import { palettePacks } from "@/src/lib/palette-packs";

export const metadata: Metadata = {
  title: "Waitlist",
  description: "Static pre-launch interest page for upcoming ColorArchive palette packs.",
};

export default function WaitlistRoute() {
  return (
    <>
      <SiteHeader currentPath="/support" />
      <Suspense fallback={null}>
        <WaitlistPage packs={palettePacks} waitlist={waitlistConfig} />
      </Suspense>
    </>
  );
}
