import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorNamePage } from "@/src/components/color-name-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Color Name Generator — ColorArchive" },
  description:
    "Enter any hex color and get a poetic name, design token suggestions (CSS variable, Tailwind, Sass), semantic role guidance, and contrast ratios. Free color naming tool for designers.",
  alternates: {
    canonical: "/name/",
  },
  openGraph: {
    title: "Color Name Generator — ColorArchive",
    description:
      "Name any hex color. Get poetic names, CSS variable names, Tailwind class suggestions, and WCAG contrast data. Free tool for designers and developers.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Name Generator — ColorArchive",
    description:
      "Enter a hex code, get a poetic color name + design token names (CSS var, Tailwind, Sass) + WCAG contrast. Free, instant, no signup.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Color Name Generator", item: `${SITE_URL}/name/` },
  ],
};

export default function ColorNameRoute() {
  return (
    <>
      <SiteHeader currentPath="/name" />
      <StructuredDataScript data={[breadcrumbData]} />
      <Suspense>
        <ColorNamePage />
      </Suspense>
    </>
  );
}
