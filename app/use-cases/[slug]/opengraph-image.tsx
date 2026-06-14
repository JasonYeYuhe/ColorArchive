import { useCases } from "@/src/lib/use-cases";
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
  const useCase = useCases.find((u) => u.id === slug);
  if (!useCase) return new Response("Not found", { status: 404 });

  return paletteOgImage({
    eyebrow: "Color Use Case",
    title: useCase.title,
    subtitle: useCase.tagline,
    hexes: [useCase.primaryColor],
    footer: `${SITE_DOMAIN} · use case`,
  });
}
