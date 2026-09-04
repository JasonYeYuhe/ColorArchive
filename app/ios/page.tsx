import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { IosPage } from "@/src/components/ios-page";
import { SITE_URL } from "@/src/lib/site-config";
import { APP_STORE_URL } from "@/src/lib/app-store";

export const metadata: Metadata = {
  title: { absolute: "ColorArchive for iPhone and iPad — Free Color Tools App | ColorArchive" },
  description:
    "The ColorArchive iOS app: browse all 5,446 colors offline, search by name, HEX or mood, copy HEX/RGB/HSL from any swatch, and save favorites. Free, no account required, iOS 17 or later.",
  alternates: {
    canonical: "/ios/",
  },
  keywords: [
    "color app iphone",
    "color palette app ios",
    "hex color app",
    "color picker app iphone",
    "colorarchive ios app",
  ],
  openGraph: {
    title: "ColorArchive for iPhone and iPad — Free Color Tools App",
    description:
      "Browse 5,446 colors offline, search by name, HEX or mood, and copy HEX/RGB/HSL from any swatch. Free, no account required.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "ColorArchive for iPhone and iPad — Free Color Tools App",
    description:
      "Browse 5,446 colors offline, search by name, HEX or mood, and copy HEX/RGB/HSL from any swatch. Free, no account required.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

/* A SEPARATE SoftwareApplication node, deliberately not folded into the one on /pro/.
   That node describes the WEB product — `operatingSystem: "Web"` with the subscription
   Offers — and Google quotes its prices directly. Adding iOS to it would mis-state both
   the platform and the price of the thing being described. This node describes the app:
   different platform, different price (free), its own URL. */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ColorArchive - Color Tools",
  applicationCategory: "DesignApplication",
  operatingSystem: "iOS 17.0 or later",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: APP_STORE_URL,
  description:
    "iPhone and iPad companion to ColorArchive: browse 5,446 algorithmically generated colors offline, search by name, HEX or mood, copy HEX/RGB/HSL, and save favorites.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "iOS App", item: `${SITE_URL}/ios/` },
  ],
};

export default function IosRoute() {
  return (
    <>
      <SiteHeader currentPath="/ios" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <IosPage />
    </>
  );
}
