import { brandPalettes } from "@/src/lib/brand-palettes";
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
  const brand = brandPalettes.find((b) => b.slug === slug);
  if (!brand) return new Response("Not found", { status: 404 });

  return paletteOgImage({
    eyebrow: "Brand Palette",
    title: brand.name,
    subtitle: brand.tagline,
    hexes: brand.colors.map((c) => c.hex),
    footer: `${SITE_DOMAIN} · brand colors`,
  });
}
