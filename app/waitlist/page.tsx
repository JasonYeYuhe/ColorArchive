import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { WaitlistPage } from "@/src/components/waitlist-page";
import { waitlistConfig } from "@/src/lib/checkout-config";
import { palettePacks } from "@/src/lib/palette-packs";

export const metadata: Metadata = {
  title: "Stay Updated — ColorArchive",
  description: "Get email updates about new ColorArchive palette packs, seasonal drops, and archive improvements.",
  alternates: { canonical: "/waitlist/" },
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
