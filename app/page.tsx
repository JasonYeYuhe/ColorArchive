import { ColorArchivePage } from "@/src/components/color-archive-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";

export default function HomePage() {
  return (
    <>
      <SiteHeader currentPath="/" />
      <ColorArchivePage colors={colors} />
    </>
  );
}
