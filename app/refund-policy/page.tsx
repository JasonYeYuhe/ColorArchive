import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { RefundPolicyPage } from "@/src/components/refund-policy-page";

export const metadata: Metadata = {
  title: "Refund Policy — ColorArchive",
  description:
    "Refund Policy for ColorArchive. Learn about our refund terms for digital products and subscriptions.",
  alternates: {
    canonical: "/refund-policy/",
  },
};

export default function RefundPolicyRoute() {
  return (
    <>
      <SiteHeader currentPath="/about" />
      <RefundPolicyPage />
    </>
  );
}
