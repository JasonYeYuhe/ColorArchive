import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomColorPage } from "@/src/components/custom-color-page";
import { SiteHeader } from "@/src/components/site-header";

export const metadata: Metadata = {
  alternates: { canonical: "/colors/hex/" },
  // Just the page name. app/layout.tsx sets a `%s · ColorArchive` template, so
  // spelling the brand out here rendered "Custom Color — ColorArchive · ColorArchive".
  title: "Custom Color",
  description:
    "Explore any hex color: see WCAG contrast, tonal scale, nearest archive matches, and harmonic relationships.",
};

export default function HexColorPage() {
  return (
    <>
      <SiteHeader currentPath="/colors" />
      <Suspense fallback={
        <div className="mx-auto max-w-5xl px-4 py-12 animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-neutral-200 dark:bg-neutral-800 mb-4" />
          <div className="h-64 w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      }>
        <CustomColorPage />
      </Suspense>
    </>
  );
}
