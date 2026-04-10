import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorTrendsPage } from "@/src/components/color-trends-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: {
    absolute:
      "Color Trends 2026 — Forecast Palettes for Design, Fashion & Branding | ColorArchive",
  },
  description:
    "Explore 13 defining color trends of 2026: Digital Calm, Neo Vibrant, Soft Industrial, Sunset Palette, Warm Earth Revival, Digital Sage, Quiet Luxury Neutrals, and more. Curated palettes with hex codes, design guidance, and cultural context.",
  alternates: {
    canonical: "/trends/",
  },
  openGraph: {
    title: "Color Trends 2026 — Forecast Palettes for Design, Fashion & Branding",
    description:
      "13 curated color trends shaping design in 2026 — from digital calm to neo vibrant. With hex codes, palettes, and design guidance.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Trends 2026 — Design Color Forecast",
    description:
      "13 curated color trends for 2026 with palettes, hex codes, and design guidance. From digital calm to neo vibrant.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Color Trends 2026 — Forecast Palettes for Design, Fashion & Branding",
  description:
    "A curated reference of 13 defining color trends of 2026 across fashion, interior design, technology, and branding — with hex-code palettes, cultural context, and practical design guidance.",
  url: `${SITE_URL}/trends/`,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ColorArchive",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Color Trends 2026",
        item: `${SITE_URL}/trends/`,
      },
    ],
  },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the main color trends for 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The key color trends for 2026 include Warm Earth Revival (terracottas and sienna), Digital Sage (muted greens for tech brands), Quiet Luxury Neutrals (greige, oat, cashmere), Cobalt Confidence (bold saturated blue), Neo-Botanica (complex botanical greens), Evolved Coral (warm layered coral), Midnight Plum (deep purple-burgundy for premium brands), and Warm Minimalism (cream and warm whites replacing cold whites).",
      },
    },
    {
      "@type": "Question",
      name: "What color trend is dominating interior design in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Interior design in 2026 is defined by two major movements: Neo-Botanica (rich, complex botanical greens referencing real foliage) and Warm Minimalism (cream, bone, and warm whites replacing the cold gray-white aesthetic of the previous decade).",
      },
    },
    {
      "@type": "Question",
      name: "What color trends are popular for branding in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In 2026, branding is seeing a strong trend toward Cobalt Confidence (bold saturated blue for challenger and fintech brands) and Midnight Plum (deep purple-burgundy for premium wine, spirits, and luxury beauty brands).",
      },
    },
  ],
};

export default function TrendsRoute() {
  return (
    <>
      <SiteHeader currentPath="/trends" />
      <StructuredDataScript data={[structuredData, faqData]} />
      <ColorTrendsPage />
    </>
  );
}
