import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { MixerPage } from "@/src/components/mixer-page";

export const metadata: Metadata = {
  title: { absolute: "Color Mixer — Blend Two Colors with RGB, HSL & OKLCH | ColorArchive" },
  description:
    "Mix any two hex colors across 11 steps using RGB, HSL, or perceptually uniform OKLCH interpolation. See vivid gradients without muddy midpoints. Export as CSS variables, JSON, or native CSS color-mix().",
  alternates: { canonical: "/mixer/" },
  openGraph: {
    title: "Color Mixer — RGB, HSL & OKLCH Blending | ColorArchive",
    description:
      "Blend any two colors across 11 perceptually uniform steps. Export as CSS variables, JSON, or CSS color-mix(). Free, instant, no sign-up.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Color Mixer — OKLCH Blending | ColorArchive",
    description:
      "Mix two colors with perceptually uniform OKLCH interpolation. 11-step blend, CSS export, free.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Mixer",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/mixer/",
  description:
    "Mix any two hex colors across 11 steps using RGB, HSL, or perceptually uniform OKLCH interpolation. Export as CSS variables, JSON, or native CSS color-mix().",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://colorarchive.me/tools/" },
    { "@type": "ListItem", position: 3, name: "Color Mixer", item: "https://colorarchive.me/mixer/" },
  ],
};

export default function ColorMixerPage() {
  return (
    <>
      <SiteHeader currentPath="/mixer" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <MixerPage />
    </>
  );
}
