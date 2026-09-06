import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ProPage } from "@/src/components/pro-page";
import { SITE_URL } from "@/src/lib/site-config";
import { proSubscriptionConfig, getCheckoutUrl, type ProPlan } from "@/src/lib/checkout-config";

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

/**
 * Two things this markup was asserting that the site does not do (2026-09-06).
 *
 * 1. TAX. Lemon Squeezy prices are tax-EXCLUSIVE — measured on the live checkout,
 *    cart.tax_inclusive is false and a JP billing address adds JCT at 10.00%
 *    (no-trial variant: subtotal 1999900 -> total 2199890). A bare `price` with
 *    no priceSpecification reads as the payable amount, so Google was quoting a
 *    number a Japanese buyer does not pay. valueAddedTaxIncluded: false says so.
 *
 * 2. AVAILABILITY. The lifetime Offer advertised a plan the code refuses to sell
 *    (LS_PLANS_BLOCKED_PENDING_SERVER_FIX — buying it would let a later
 *    subscription-cancelled webhook wipe the entitlement). Rather than hardcode
 *    that here and let the two drift, availability is derived from the same
 *    function the button uses: no checkout URL, not for sale.
 */
function offerAvailability(plan: ProPlan): string {
  return getCheckoutUrl(plan) === null
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";
}

function offer(plan: ProPlan, name: string) {
  const cfg = proSubscriptionConfig[plan];
  return {
    "@type": "Offer",
    price: offerPrice(cfg.price),
    priceCurrency: cfg.currency,
    priceSpecification: {
      "@type": "PriceSpecification",
      price: offerPrice(cfg.price),
      priceCurrency: cfg.currency,
      valueAddedTaxIncluded: false,
    },
    availability: offerAvailability(plan),
    name,
    url: `${SITE_URL}/pro/`,
  };
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
      offer("monthly", "Monthly"),
      offer("yearly", "Yearly"),
      offer("lifetime", "Lifetime"),
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
