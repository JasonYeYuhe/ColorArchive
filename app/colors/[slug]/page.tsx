import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColorDetailPage } from "@/src/components/color-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import { sortColors } from "@/src/lib/color-utils";
import { colors } from "@/src/data/colors";

export const dynamicParams = false;

interface ColorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function getColorBySlug(slug: string) {
  return colors.find((color) => color.id === slug) ?? null;
}

export async function generateStaticParams() {
  return colors.map((color) => ({
    slug: color.id,
  }));
}

export async function generateMetadata({ params }: ColorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const color = getColorBySlug(slug);

  if (!color) {
    return {
      title: "Color not found",
    };
  }

  return {
    title: `${color.name} ${color.hex}`,
    description: `${color.name} in the ${color.family} family. View HEX, RGB, HSL, and related colors in ColorArchive.`,
    alternates: {
      canonical: `/colors/${color.id}/`,
    },
  };
}

export default async function ColorPage({ params }: ColorPageProps) {
  const { slug } = await params;
  const color = getColorBySlug(slug);

  if (!color) {
    notFound();
  }

  const relatedColors = sortColors(
    colors.filter((item) => item.family === color.family),
    "hue",
  )
    .slice(0, 8)
    .sort((a, b) => (a.id === color.id ? -1 : b.id === color.id ? 1 : 0));

  return (
    <>
      <SiteHeader currentPath="/" />
      <ColorDetailPage color={color} relatedColors={relatedColors} />
    </>
  );
}
