import { colors } from "@/src/data/colors";
import { getColorsForFamily, getFamilyBySlug } from "@/src/lib/color-family-pages";
import { paletteOgImage } from "@/src/lib/og-card";
import { SITE_DOMAIN } from "@/src/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const family = getFamilyBySlug(slug);
  if (!family) return new Response("Not found", { status: 404 });

  // Sample 6 colors spread across the family for a representative strip.
  const familyColors = getColorsForFamily(colors, family);
  const step = Math.max(1, Math.floor(familyColors.length / 6));
  const hexes = familyColors.filter((_, i) => i % step === 0).slice(0, 6).map((c) => c.hex);

  return paletteOgImage({
    eyebrow: "Color Family",
    title: `${family} colors`,
    subtitle: `Browse named ${family.toLowerCase()} hex colors with contrast, tonal scales, and pairings.`,
    hexes,
    footer: `${SITE_DOMAIN} · color family`,
  });
}
