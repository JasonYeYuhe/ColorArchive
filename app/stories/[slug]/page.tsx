import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorStoryPage } from "@/src/components/color-story-page";
import stories from "@/src/data/color-stories.json";
import { SITE_URL } from "@/src/lib/site-config";

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

export const dynamicParams = false;

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
      images: [`${SITE_URL}/og-image-v1.png`],
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

  const storyStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: story.headline,
      description: story.summary,
      url: `${SITE_URL}/stories/${slug}/`,
      publisher: {
        "@type": "Organization",
        name: "ColorArchive",
        url: SITE_URL,
        logo: `${SITE_URL}/og-image-v1.png`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Color Stories", item: `${SITE_URL}/stories/` },
        { "@type": "ListItem", position: 3, name: story.name, item: `${SITE_URL}/stories/${slug}/` },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/stories" />
      <StructuredDataScript data={storyStructuredData} />
      <ColorStoryPage story={story} />
    </>
  );
}
