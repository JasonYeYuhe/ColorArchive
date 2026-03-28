import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { WordColorGeneratorPage } from "@/src/components/word-color-generator-page";

export const metadata: Metadata = {
  title: { absolute: "Word to Color Generator — Turn Text into Colors | ColorArchive" },
  description: "Convert any word or phrase into a unique hex color. Deterministic algorithm — same text always produces the same color with 5 tonal variants. Free tool.",
  alternates: { canonical: "/word-to-color/" },
  keywords: ["word to color", "text to color", "word color generator", "text to hex", "color from text"],
  openGraph: {
    title: "Word to Color Generator — Turn Text into Colors | ColorArchive",
    description: "Convert any word or phrase into a unique hex color. Deterministic algorithm — same text always produces the same color with 5 tonal variants. Free tool.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Word to Color Generator — Turn Text into Colors | ColorArchive",
    description: "Convert any word or phrase into a unique hex color. Deterministic algorithm — same text always produces the same color with 5 tonal variants. Free tool.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const generatorStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Word to Color Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/word-to-color/",
  description:
    "Type any word or phrase and instantly get a unique hex color code. A deterministic word-to-color algorithm — same word always produces the same color, with 5 tonal variants.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Word → Color", item: "https://colorarchive.me/word-to-color/" },
  ],
};

export default function WordToColorPage() {
  return (
    <>
      <SiteHeader currentPath="/word-to-color" />
      <StructuredDataScript data={[generatorStructuredData, breadcrumbData]} />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading generator…</main>}>
        <WordColorGeneratorPage />
      </Suspense>
    </>
  );
}
