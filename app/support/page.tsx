import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { SupportPage } from "@/src/components/support-page";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Support — ColorArchive",
  description:
    "Get help with ColorArchive products, exports, and Pro subscriptions.",
  url: "https://colorarchive.me/support/",
  mainEntity: {
    "@type": "Organization",
    name: "ColorArchive",
    url: "https://colorarchive.me",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@colorarchive.me",
      contactType: "customer support",
    },
  },
};

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with ColorArchive — FAQs, Pro subscription, free tools, and customer support.",
};

export default function SupportRoute() {
  return (
    <>
      <SiteHeader currentPath="/support" />
      <StructuredDataScript data={structuredData} />
      <SupportPage />
    </>
  );
}
