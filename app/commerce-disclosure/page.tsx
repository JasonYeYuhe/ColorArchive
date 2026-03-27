import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { CommerceDisclosurePage } from "@/src/components/commerce-disclosure-page";

export const metadata: Metadata = {
  title: "Commerce Disclosure — ColorArchive",
  description:
    "特定商取引法に基づく表記 — Commerce disclosure for ColorArchive as required by Japan's Act on Specified Commercial Transactions.",
  alternates: {
    canonical: "/commerce-disclosure/",
  },
};

export default function CommerceDisclosureRoute() {
  return (
    <>
      <SiteHeader currentPath="/about" />
      <CommerceDisclosurePage />
    </>
  );
}
