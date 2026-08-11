import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { EmbedCodePage } from "@/src/components/embed-code-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Embed a Free Color Widget or Color Badge — ColorArchive" },
  description:
    "Add a free color tool to your site: an interactive color-picker widget (iframe) or a lightweight HTML color badge for blogs and docs. Hex, RGB, HSL and 5,446 curated colors.",
  alternates: {
    canonical: "/embed/embed-code/",
  },
  openGraph: {
    title: "Embed ColorArchive — Free Color Picker Widget",
    description:
      "Add a free color picker widget to your website with hex, RGB, HSL values and 5,446 curated colors.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Embed ColorArchive — Free Color Picker Widget",
    description:
      "Add a free color picker widget to your website with hex, RGB, HSL values and 5,446 curated colors.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

export default function EmbedCodeRoute() {
  return (
    <>
      <SiteHeader currentPath="/embed/embed-code" />
      <EmbedCodePage />
    </>
  );
}
