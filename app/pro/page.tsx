import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ProPage } from "@/src/components/pro-page";
import { SITE_URL } from "@/src/lib/site-config";
import { proSubscriptionConfig } from "@/src/lib/checkout-config";

/**
 * schema.org wants a bare decimal — "¥3,999" is not a price, "3999" is. The
 * display strings in checkout-config carry a symbol and thousands separators,
 * so strip everything that is not a digit or a decimal point. Deriving instead
 * of hardcoding matters more here than anywhere else on the site: this markup
 * is what Google quotes in search results, and a stale number here is a price
 * we would be advertising but not charging.
 */
function offerPrice(display: string): string {
  return display.replace(/[^0-9.]/g, "");
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ColorArchive Pro",
    description:
      "Unlock unlimited AI palette generations, full exports, WCAG reports, and more with ColorArchive Pro.",
    url: `${SITE_URL}/pro/`,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        price: offerPrice(proSubscriptionConfig.monthly.price),
        priceCurrency: proSubscriptionConfig.monthly.currency,
        name: "Monthly",
        url: `${SITE_URL}/pro/`,
      },
      {
        "@type": "Offer",
        price: offerPrice(proSubscriptionConfig.yearly.price),
        priceCurrency: proSubscriptionConfig.yearly.currency,
        name: "Yearly",
        url: `${SITE_URL}/pro/`,
      },
      {
        "@type": "Offer",
        price: offerPrice(proSubscriptionConfig.lifetime.price),
        priceCurrency: proSubscriptionConfig.lifetime.currency,
        name: "Lifetime",
        url: `${SITE_URL}/pro/`,
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Pro", item: `${SITE_URL}/pro/` },
    ],
  },
];

export const metadata: Metadata = {
  title: "Pro",
  description:
    "Unlock unlimited AI palette generations, full exports, WCAG reports, and more with ColorArchive Pro.",
  alternates: { canonical: "/pro/" },
};

export default function ProRoute() {
  return (
    <>
      <SiteHeader currentPath="/pro" />
      <StructuredDataScript data={structuredData} />
      <ProPage />
    </>
  );
}
