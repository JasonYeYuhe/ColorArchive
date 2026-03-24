import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/site-header";
import { ColorStoryPage } from "@/src/components/color-story-page";
import stories from "@/src/data/color-stories.json";

type Story = {
  slug: string;
  name: string;
  hex: string;
  hue: string;
  headline: string;
  summary: string;
  origin: string;
  psychology: string;
  design: string;
  brands: string;
  palette_tip: string;
};

export function generateStaticParams() {
  return Object.keys(stories).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = (stories as Record<string, Story>)[slug];
  if (!story) return {};
  return {
    title: { absolute: `${story.headline} | ColorArchive` },
    description: story.summary,
    alternates: { canonical: `/stories/${slug}/` },
    openGraph: {
      title: story.headline,
      description: story.summary,
      images: ["https://colorarchive.me/og-image-v1.png"],
    },
  };
}

export default async function StoryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = (stories as Record<string, Story>)[slug];
  if (!story) notFound();

  return (
    <>
      <SiteHeader currentPath="/stories" />
      <ColorStoryPage story={story} />
    </>
  );
}
