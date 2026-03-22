import type { MetadataRoute } from "next";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";
import { COLOR_FAMILY_PAGES } from "@/src/lib/color-family-pages";
import { landingGuides } from "@/src/lib/guides";
import { getAllTags, newsletterIssues, tagToSlug } from "@/src/lib/newsletter-issues";
import { palettePacks } from "@/src/lib/palette-packs";

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

  const guideRoutes: MetadataRoute.Sitemap = landingGuides.map((guide) => ({
    url: `https://colorarchive.me/guides/${guide.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.67,
  }));

  return [
    ...topLevelRoutes,
    ...guideRoutes,
    ...noteRoutes,
    ...tagRoutes,
    ...familyRoutes,
    ...collectionRoutes,
    ...packRoutes,
    ...colorRoutes,
  ];
}
