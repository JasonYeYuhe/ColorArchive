import stories from "@/src/data/color-stories.json";
import { colors } from "@/src/data/colors";
import { getColorsForFamily, getFamilyBySlug } from "@/src/lib/color-family-pages";
import { paletteOgImage } from "@/src/lib/og-card";
import { SITE_DOMAIN } from "@/src/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

type Story = { name: string; headline: string; summary: string; hex: string };

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = (stories as Record<string, Story>)[slug];
  if (!story) return new Response("Not found", { status: 404 });

  const family = getFamilyBySlug(slug);
  const familyColors = family ? getColorsForFamily(colors, family) : [];
  const step = Math.max(1, Math.floor(familyColors.length / 6));
  const hexes = familyColors.filter((_, i) => i % step === 0).slice(0, 6).map((c) => c.hex);

  return paletteOgImage({
    eyebrow: "Color Story",
    title: story.name,
    subtitle: story.headline ?? story.summary,
    hexes: hexes.length > 0 ? hexes : [story.hex],
    footer: `${SITE_DOMAIN} · color story`,
  });
}
