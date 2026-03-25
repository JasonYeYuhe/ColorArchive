import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ToolsPage } from "@/src/components/tools-page";

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
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Free Color Tools for Designers — ColorArchive",
    description:
      "25 free color tools: contrast checker, tints & shades generator, converter, blindness simulator, harmony generator, gradient builder, and more.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const toolsListStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free Color Tools for Designers",
  description:
    "A collection of free color tools for designers: contrast checker, color converter, color blindness simulator, harmony generator, gradient builder, palette generator, and more.",
  url: "https://colorarchive.me/tools/",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "WCAG Contrast Checker",
        url: "https://colorarchive.me/contrast/",
        description: "Check WCAG AA/AAA contrast compliance between any two colors.",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Color Blindness Simulator",
        url: "https://colorarchive.me/colorblind/",
        description: "See how your color palette looks to users with different types of color vision deficiency.",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Color Converter",
        url: "https://colorarchive.me/convert/",
        description: "Convert colors between HEX, RGB, HSL, HSB, and CMYK formats instantly.",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Color Compare",
        url: "https://colorarchive.me/compare/",
        description: "Compare two colors side by side and see their properties and contrast ratio.",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Color Harmonies",
        url: "https://colorarchive.me/harmonies/",
        description: "Generate complementary, analogous, triadic, and split-complementary color harmonies.",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Gradient Generator",
        url: "https://colorarchive.me/gradient/",
        description: "Create smooth CSS gradients between any two colors with live preview.",
      },
      {
        "@type": "ListItem",
        position: 7,
        name: "Palette Builder & Generator",
        url: "https://colorarchive.me/palette/",
        description: "Build curated palettes, generate harmonies from a seed color, and export as CSS, Tailwind, or Figma tokens.",
      },
      {
        "@type": "ListItem",
        position: 9,
        name: "Word to Color",
        url: "https://colorarchive.me/word-to-color/",
        description: "Transform any word or phrase into a deterministic, unique color palette.",
      },
      {
        "@type": "ListItem",
        position: 10,
        name: "Spectrum View",
        url: "https://colorarchive.me/spectrum/",
        description: "Explore all 3,000+ archive colors arranged in a full visual spectrum.",
      },
      {
        "@type": "ListItem",
        position: 11,
        name: "Color Mixer",
        url: "https://colorarchive.me/mixer/",
        description: "Blend any two colors across 11 steps using RGB, HSL, or perceptually uniform OKLCH interpolation. Export as CSS variables, JSON, or color-mix() declarations.",
      },
      {
        "@type": "ListItem",
        position: 12,
        name: "Tints & Shades Generator",
        url: "https://colorarchive.me/tints/",
        description: "Generate a complete 11-step tonal color scale from any hex. Export as CSS variables, Tailwind config, Sass, or JSON.",
      },
      {
        "@type": "ListItem",
        position: 13,
        name: "Surprise Me",
        url: "https://colorarchive.me/all-colors/",
        description: "Get a random curated color for instant design inspiration.",
      },
      {
        "@type": "ListItem",
        position: 14,
        name: "Design Token Generator",
        url: "https://colorarchive.me/tokens/",
        description: "Generate a complete design token system from any brand color. Export as CSS, Tailwind, SCSS, or JSON.",
      },
    ],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://colorarchive.me/tools/" },
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
