import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { SupportPage } from "@/src/components/support-page";
import { SITE_URL, SUPPORT_EMAIL } from "@/src/lib/site-config";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Support — ColorArchive",
  description:
    "Get help with ColorArchive products, exports, and Pro subscriptions.",
  url: `${SITE_URL}/support/`,
  mainEntity: {
    "@type": "Organization",
    name: "ColorArchive",
    url: SITE_URL,
    contactPoint: {
      "@type": "ContactPoint",
      email: SUPPORT_EMAIL,
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
