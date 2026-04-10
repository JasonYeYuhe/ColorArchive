import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorIndustriesPage } from "@/src/components/color-industries-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: {
    absolute:
      "Color Palettes by Industry — Brand Color Psychology Guide | ColorArchive",
  },
  description:
    "Curated color palettes for 9 major industries: Technology, Food & Restaurant, Healthcare, Fashion & Luxury, Nature & Outdoor, Finance, Education, Beauty, and Architecture. Brand psychology, industry conventions, and design guidance with copy-ready hex codes.",
  alternates: {
    canonical: "/industry/",
  },
  openGraph: {
    title: "Color Palettes by Industry — Brand Color Psychology Guide",
    description:
      "Industry-specific color palettes for designers: Technology blues, Food & Restaurant reds, Healthcare teals, Fashion blacks, Outdoor greens, Finance navy, Education blues, Beauty roses, Architecture terracottas. With brand psychology and design tips.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Palettes by Industry — Brand Color Psychology",
    description:
      "9 industry color palettes: Tech, Food, Healthcare, Luxury, Outdoor, Finance, Education, Beauty, Architecture — with brand context and design guidance.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Color Palettes by Industry",
  description:
    "Curated color palettes for 9 major design industries with brand psychology context, industry conventions, and practical design guidance.",
  url: `${SITE_URL}/industry/`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Technology & Software Colors",
        description:
          "Deep navy, system blue, intelligence violet, signal cyan — trust, precision, and innovation.",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Food & Restaurant Colors",
        description:
          "Appetite red, harvest orange, warm amber, roasted brown — warmth, energy, and craft.",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Healthcare & Medical Colors",
        description:
          "Clinical teal, medical aqua, wellness sage — trust, calm, and cleanliness.",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Fashion & Luxury Colors",
        description:
          "Absolute black, warm ivory, deep champagne, heritage plum — restraint and prestige.",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Nature & Outdoor Colors",
        description:
          "Deep forest, trail sienna, clay orange, lichen gray — vitality and natural materials.",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Finance & Banking Colors",
        description:
          "Institutional navy, wealth forest, reserve burgundy, capital gold — authority and stability.",
      },
      {
        "@type": "ListItem",
        position: 7,
        name: "Education & Learning Colors",
        description:
          "Knowledge blue, discovery yellow, growth green — clarity, optimism, and progress.",
      },
      {
        "@type": "ListItem",
        position: 8,
        name: "Beauty & Cosmetics Colors",
        description:
          "Velvet rose, blush petal, deep plum, rose gold — sensuality and allure.",
      },
      {
        "@type": "ListItem",
        position: 9,
        name: "Architecture & Interior Colors",
        description:
          "Terracotta clay, aged concrete, garden sage, forest oak — warmth and materiality.",
      },
    ],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
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
      name: "Color by Industry",
      item: `${SITE_URL}/industry/`,
    },
  ],
};

export default function IndustryColorsPage() {
  return (
    <>
      <SiteHeader currentPath="/industry" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <ColorIndustriesPage />
    </>
  );
}
