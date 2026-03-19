import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { ContrastCheckerPage } from "@/src/components/contrast-page";

export const metadata: Metadata = {
  title: { absolute: "WCAG Contrast Checker — ColorArchive" },
  description:
    "Free WCAG contrast ratio checker. Enter any two hex colors and see AA/AAA compliance for normal text, large text, and UI components in real time.",
  alternates: {
    canonical: "/contrast/",
  },
  openGraph: {
    title: "WCAG Contrast Checker — ColorArchive",
    description:
      "Free WCAG contrast ratio checker. Enter any two hex colors and see AA/AAA compliance for normal text, large text, and UI components in real time.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "WCAG Contrast Checker — ColorArchive",
    description:
      "Free WCAG contrast ratio checker. Enter any two hex colors and see AA/AAA compliance in real time.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

export default function ContrastPage() {
  return (
    <>
      <SiteHeader currentPath="/contrast" />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading checker…</main>}>
        <ContrastCheckerPage />
      </Suspense>
    </>
  );
}
