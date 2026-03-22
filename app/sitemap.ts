import type { MetadataRoute } from "next";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";
import { COLOR_FAMILY_PAGES } from "@/src/lib/color-family-pages";
import { landingGuides } from "@/src/lib/guides";
import { getAllTags, newsletterIssues, tagToSlug } from "@/src/lib/newsletter-issues";
import { palettePacks } from "@/src/lib/palette-packs";

export const dynamic = "force-static";

const MARCH_18 = new Date("2026-03-18");
const MARCH_19 = new Date("2026-03-19");
const MARCH_20 = new Date("2026-03-20");
const MARCH_21 = new Date("2026-03-21");
const MARCH_22 = new Date("2026-03-22");

export default function sitemap(): MetadataRoute.Sitemap {
  const topLevelRoutes: MetadataRoute.Sitemap = [
    {
      url: "https://colorarchive.me",
      lastModified: MARCH_18,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://colorarchive.me/all-colors/",
      lastModified: MARCH_18,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/search/",
      lastModified: MARCH_18,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/collections/",
      lastModified: MARCH_18,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/about/",
      lastModified: MARCH_18,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/updates/",
      lastModified: MARCH_20,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/notes/",
      lastModified: MARCH_20,
      changeFrequency: "weekly",
      priority: 0.76,
    },
    {
      url: "https://colorarchive.me/guides/",
      lastModified: MARCH_19,
      changeFrequency: "weekly",
      priority: 0.77,
    },
    {
      url: "https://colorarchive.me/favorites/",
      lastModified: MARCH_18,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/recent/",
      lastModified: MARCH_18,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/spectrum/",
      lastModified: MARCH_18,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/surprise/",
      lastModified: MARCH_18,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/word-to-color/",
      lastModified: MARCH_18,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/convert/",
      lastModified: MARCH_20,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: "https://colorarchive.me/contrast/",
      lastModified: MARCH_18,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: "https://colorarchive.me/support/",
      lastModified: MARCH_18,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/waitlist/",
      lastModified: MARCH_18,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/thanks/",
      lastModified: MARCH_19,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: "https://colorarchive.me/cancel/",
      lastModified: MARCH_21,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://colorarchive.me/packs/",
      lastModified: MARCH_21,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/packs/quiz/",
      lastModified: MARCH_21,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: "https://colorarchive.me/palette-generator/",
      lastModified: MARCH_21,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/gradient/",
      lastModified: MARCH_21,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: "https://colorarchive.me/harmonies/",
      lastModified: MARCH_21,
      changeFrequency: "monthly",
      priority: 0.83,
    },
    {
      url: "https://colorarchive.me/compare/",
      lastModified: MARCH_21,
      changeFrequency: "monthly",
      priority: 0.80,
    },
    {
      url: "https://colorarchive.me/tools/",
      lastModified: MARCH_22,
      changeFrequency: "monthly",
      priority: 0.88,
    },
    {
      url: "https://colorarchive.me/colorblind/",
      lastModified: MARCH_22,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: "https://colorarchive.me/tints/",
      lastModified: MARCH_22,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/product-examples/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/free-pack/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/families/",
      lastModified: MARCH_19,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/launch/",
      lastModified: MARCH_20,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const colorRoutes: MetadataRoute.Sitemap = colors.map((color) => ({
    url: `https://colorarchive.me/colors/${color.id}/`,
    lastModified: MARCH_18,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const packRoutes: MetadataRoute.Sitemap = palettePacks.map((pack) => ({
    url: `https://colorarchive.me/packs/${pack.id}/`,
    lastModified: MARCH_19,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `https://colorarchive.me/collections/${collection.id}/`,
    lastModified: MARCH_19,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const familyRoutes: MetadataRoute.Sitemap = COLOR_FAMILY_PAGES.map((family) => ({
    url: `https://colorarchive.me/families/${family.slug}/`,
    lastModified: MARCH_19,
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
    lastModified: MARCH_19,
    changeFrequency: "weekly",
    priority: 0.62,
  }));

  const guideRoutes: MetadataRoute.Sitemap = landingGuides.map((guide) => ({
    url: `https://colorarchive.me/guides/${guide.slug}/`,
    lastModified: MARCH_20,
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
