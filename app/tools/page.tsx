import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ToolsPage } from "@/src/components/tools-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Free Color Tools for Designers — ColorArchive" },
  description:
    "25 free color tools for designers: color mixer, contrast checker, tints & shades generator, color converter, blindness simulator, harmony generator, gradient builder, palette generator, and more. No sign-up required.",
  alternates: {
    canonical: "/tools/",
  },
  openGraph: {
    title: "Free Color Tools for Designers — ColorArchive",
    description:
      "25 free color tools for designers: contrast checker, tints & shades generator, color converter, blindness simulator, harmony generator, gradient builder, palette generator, and more.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Free Color Tools for Designers — ColorArchive",
    description:
      "25 free color tools: contrast checker, tints & shades generator, converter, blindness simulator, harmony generator, gradient builder, and more.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const toolsListStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free Color Tools for Designers",
  description:
    "A collection of free color tools for designers: contrast checker, color converter, color blindness simulator, harmony generator, gradient builder, palette generator, and more.",
  url: `${SITE_URL}/tools/`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "WCAG Contrast Checker",
        url: `${SITE_URL}/contrast/`,
        description: "Check WCAG AA/AAA contrast compliance between any two colors.",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Color Blindness Simulator",
        url: `${SITE_URL}/colorblind/`,
        description: "See how your color palette looks to users with different types of color vision deficiency.",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Color Converter",
        url: `${SITE_URL}/convert/`,
        description: "Convert colors between HEX, RGB, HSL, HSB, and CMYK formats instantly.",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Color Compare",
        url: `${SITE_URL}/compare/`,
        description: "Compare two colors side by side and see their properties and contrast ratio.",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Color Harmonies",
        url: `${SITE_URL}/harmonies/`,
        description: "Generate complementary, analogous, triadic, and split-complementary color harmonies.",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Gradient Generator",
        url: `${SITE_URL}/gradient/`,
        description: "Create smooth CSS gradients between any two colors with live preview.",
      },
      {
        "@type": "ListItem",
        position: 7,
        name: "Palette Builder & Generator",
        url: `${SITE_URL}/palette/`,
        description: "Build curated palettes, generate harmonies from a seed color, and export as CSS, Tailwind, or Figma tokens.",
      },
      {
        "@type": "ListItem",
        position: 9,
        name: "Word to Color",
        url: `${SITE_URL}/word-to-color/`,
        description: "Transform any word or phrase into a deterministic, unique color palette.",
      },
      {
        "@type": "ListItem",
        position: 10,
        name: "Spectrum View",
        url: `${SITE_URL}/spectrum/`,
        description: "Explore all 5,400+ archive colors arranged in a full visual spectrum.",
      },
      {
        "@type": "ListItem",
        position: 11,
        name: "Color Mixer",
        url: `${SITE_URL}/mixer/`,
        description: "Blend any two colors across 11 steps using RGB, HSL, or perceptually uniform OKLCH interpolation. Export as CSS variables, JSON, or color-mix() declarations.",
      },
      {
        "@type": "ListItem",
        position: 12,
        name: "Tints & Shades Generator",
        url: `${SITE_URL}/tints/`,
        description: "Generate a complete 11-step tonal color scale from any hex. Export as CSS variables, Tailwind config, Sass, or JSON.",
      },
      {
        "@type": "ListItem",
        position: 13,
        name: "Surprise Me",
        url: `${SITE_URL}/all-colors/`,
        description: "Get a random curated color for instant design inspiration.",
      },
      {
        "@type": "ListItem",
        position: 14,
        name: "Design Token Generator",
        url: `${SITE_URL}/tokens/`,
        description: "Generate a complete design token system from any brand color. Export as CSS, Tailwind, SCSS, or JSON.",
      },
    ],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
  ],
};

export default function ToolsIndexPage() {
  return (
    <>
      <SiteHeader currentPath="/tools" />
      <StructuredDataScript data={[toolsListStructuredData, breadcrumbData]} />
      <ToolsPage />
    </>
  );
}
