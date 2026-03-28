import { Suspense } from "react";
import type { Metadata } from "next";
import { EmbedWidget } from "@/src/components/embed-widget";

export const metadata: Metadata = {
  title: "ColorArchive Embed Widget",
  robots: { index: false, follow: false },
};

export default function EmbedPage() {
  return (
    <Suspense>
      <EmbedWidget />
    </Suspense>
  );
}
