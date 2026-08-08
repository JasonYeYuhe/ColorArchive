import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { WordColorGeneratorPage } from "@/src/components/word-color-generator-page";
import { SITE_URL } from "@/src/lib/site-config";
import { wordToColorFaq } from "@/src/lib/word-color-faq";

// NOTE: openGraph/twitter images are intentionally omitted so Next uses the
// file-convention dynamic OG at app/word-to-color/opengraph-image.tsx. Setting
// images here would override (and disable) that generated card.
export const metadata: Metadata = {
  title: { absolute: "Word to Color Generator — Turn Text into Colors | ColorArchive" },
  description: "Convert any word or phrase into a unique hex color. Deterministic algorithm — same text always produces the same color with 5 tonal variants. Free tool.",
  alternates: { canonical: "/word-to-color/" },
  keywords: ["word to color", "text to color", "word color generator", "text to hex", "color from text"],
  openGraph: {
    title: "Word to Color Generator — Turn Text into Colors | ColorArchive",
    description: "Convert any word or phrase into a unique hex color. Deterministic algorithm — same text always produces the same color with 5 tonal variants. Free tool.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word to Color Generator — Turn Text into Colors | ColorArchive",
    description: "Convert any word or phrase into a unique hex color. Deterministic algorithm — same text always produces the same color with 5 tonal variants. Free tool.",
  },
};

const generatorStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Word to Color Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/word-to-color/`,
  description:
    "Type any word or phrase and instantly get a unique hex color code. A deterministic word-to-color algorithm — same word always produces the same color, with 5 tonal variants.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Word → Color", item: `${SITE_URL}/word-to-color/` },
  ],
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: wordToColorFaq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function WordToColorPage() {
  return (
    <>
      <SiteHeader currentPath="/word-to-color" />
      <StructuredDataScript data={[generatorStructuredData, breadcrumbData, faqStructuredData]} />
      {/* No Suspense boundary here on purpose. It existed only because the
          generator called useSearchParams(), which opts the enclosing boundary
          out of static prerendering — and since this boundary wrapped the whole
          page, the prerendered HTML for the site's top surface was just the
          fallback string. The generator now reads ?q= from window after mount,
          so the page prerenders in full. Leaving an unnecessary boundary here
          would let a future dynamic API silently empty this page again; without
          one, that mistake fails the build instead. */}
      <WordColorGeneratorPage />
    </>
  );
}
