import { Suspense } from "react";
import { ColorArchivePage } from "@/src/components/color-archive-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";

export default function HomePage() {
  return (
    <>
      <SiteHeader currentPath="/" />
      <Suspense fallback={null}>
        <ColorArchivePage colors={colors} />
      </Suspense>
    </>
  );
}
