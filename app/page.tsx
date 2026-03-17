import { ColorArchivePage } from "@/src/components/color-archive-page";
import { colors } from "@/src/data/colors";

export default function HomePage() {
  return <ColorArchivePage colors={colors} />;
}
