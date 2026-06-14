import { regionPalettes } from "@/src/lib/region-palettes";
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
  const region = regionPalettes.find((r) => r.slug === slug);
  if (!region) return new Response("Not found", { status: 404 });

  return paletteOgImage({
    eyebrow: "Regional Palette",
    title: region.name,
    subtitle: region.tagline,
    hexes: region.colors.map((c) => c.hex),
    footer: `${SITE_DOMAIN} · cultural colors`,
  });
}
