import { Suspense } from "react";
import type { Metadata } from "next";
import { AnalyticsPage } from "@/src/components/analytics-page";
import { SiteHeader } from "@/src/components/site-header";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Inspect live subscriber, order, and revenue activity for ColorArchive.",
  alternates: {
    canonical: "/analytics",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyticsRoute() {
  return (
    <>
      <SiteHeader currentPath="/analytics" />
      <Suspense fallback={null}>
        <AnalyticsPage />
      </Suspense>
    </>
  );
}
