import type { MetadataRoute } from "next";
import { colors } from "@/src/data/colors";
import stories from "@/src/data/color-stories.json";
import { collections } from "@/src/lib/collections";
import { COLOR_FAMILY_PAGES } from "@/src/lib/color-family-pages";
import { landingGuides } from "@/src/lib/guides";
import { getAllTags, newsletterIssues, tagToSlug } from "@/src/lib/newsletter-issues";
import { palettePacks } from "@/src/lib/palette-packs";
import { useCases } from "@/src/lib/use-cases";

export const dynamic = "force-static";

const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const topLevelRoutes: MetadataRoute.Sitemap = [
    {
      url: "https://colorarchive.me",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://colorarchive.me/all-colors/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/collections/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/about/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/updates/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/notes/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.76,
    },
    {
      url: "https://colorarchive.me/guides/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.77,
    },
    {
      url: "https://colorarchive.me/favorites/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/recent/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/spectrum/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/word-to-color/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/convert/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: "https://colorarchive.me/contrast/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: "https://colorarchive.me/support/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/packs/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/packs/quiz/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: "https://colorarchive.me/gradient/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: "https://colorarchive.me/harmonies/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.83,
    },
    {
      url: "https://colorarchive.me/compare/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.80,
    },
    {
      url: "https://colorarchive.me/tools/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.88,
    },
    {
      url: "https://colorarchive.me/colorblind/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: "https://colorarchive.me/mixer/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/tints/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/brand/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.87,
    },
    {
      url: "https://colorarchive.me/wcag-audit/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.84,
    },
    {
      url: "https://colorarchive.me/combinations/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/image-palette/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.86,
    },
    {
      url: "https://colorarchive.me/tokens/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/use-cases/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: "https://colorarchive.me/api-docs/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: "https://colorarchive.me/free-pack/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/families/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/pro/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/projects/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: "https://colorarchive.me/analyze/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/stories/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/trending/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.78,
    },
    {
      url: "https://colorarchive.me/today/",
      lastModified: BUILD_DATE,
      changeFrequency: "daily",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/identify/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: "https://colorarchive.me/mesh-gradient/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/mood-palette/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/brand-generator/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/color-quiz/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/palette-generator/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.84,
    },
    {
      url: "https://colorarchive.me/preview/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: "https://colorarchive.me/product-examples/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: "https://colorarchive.me/search/",
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/colors/hex/",
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/privacy/",
      lastModified: BUILD_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://colorarchive.me/terms/",
      lastModified: BUILD_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const colorRoutes: MetadataRoute.Sitemap = colors.map((color) => ({
    url: `https://colorarchive.me/colors/${color.id}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const packRoutes: MetadataRoute.Sitemap = palettePacks.map((pack) => ({
    url: `https://colorarchive.me/packs/${pack.id}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `https://colorarchive.me/collections/${collection.id}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const familyRoutes: MetadataRoute.Sitemap = COLOR_FAMILY_PAGES.map((family) => ({
    url: `https://colorarchive.me/families/${family.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly",
    priority: 0.72,
  }));

  const noteRoutes: MetadataRoute.Sitemap = newsletterIssues.map((issue) => ({
    url: `https://colorarchive.me/notes/${issue.slug}/`,
    lastModified: new Date(issue.date),
    changeFrequency: "monthly",
    priority: 0.68,
  }));

  const tagRoutes: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: `https://colorarchive.me/notes/tags/${tagToSlug(tag)}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly",
    priority: 0.62,
  }));

  const storyRoutes: MetadataRoute.Sitemap = Object.keys(stories).map((slug) => ({
    url: `https://colorarchive.me/stories/${slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const guideRoutes: MetadataRoute.Sitemap = landingGuides.map((guide) => ({
    url: `https://colorarchive.me/guides/${guide.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.67,
  }));

  const useCaseRoutes: MetadataRoute.Sitemap = useCases.map((uc) => ({
    url: `https://colorarchive.me/use-cases/${uc.id}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  return [
    ...topLevelRoutes,
    ...guideRoutes,
    ...noteRoutes,
    ...tagRoutes,
    ...storyRoutes,
    ...familyRoutes,
    ...collectionRoutes,
    ...packRoutes,
    ...useCaseRoutes,
    ...colorRoutes,
  ];
}
