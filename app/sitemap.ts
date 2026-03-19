import type { MetadataRoute } from "next";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";
import { COLOR_FAMILY_PAGES } from "@/src/lib/color-family-pages";
import { getAllTags, newsletterIssues, tagToSlug } from "@/src/lib/newsletter-issues";
import { palettePacks } from "@/src/lib/palette-packs";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const topLevelRoutes: MetadataRoute.Sitemap = [
    {
      url: "https://colorarchive.me",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://colorarchive.me/all-colors/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/search/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/collections/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/about/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/updates/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/notes/",
      lastModified: new Date("2026-05-14"),
      changeFrequency: "weekly",
      priority: 0.76,
    },
    {
      url: "https://colorarchive.me/favorites/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/recent/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/spectrum/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/surprise/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/word-to-color/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/contrast/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: "https://colorarchive.me/support/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/waitlist/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/thanks/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: "https://colorarchive.me/cancel/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://colorarchive.me/packs/",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
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
      lastModified: new Date("2026-03-19"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const colorRoutes: MetadataRoute.Sitemap = colors.map((color) => ({
    url: `https://colorarchive.me/colors/${color.id}/`,
    lastModified: new Date("2026-03-18"),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const packRoutes: MetadataRoute.Sitemap = palettePacks.map((pack) => ({
    url: `https://colorarchive.me/packs/${pack.id}/`,
    lastModified: new Date("2026-03-19"),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `https://colorarchive.me/collections/${collection.id}/`,
    lastModified: new Date("2026-03-19"),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const familyRoutes: MetadataRoute.Sitemap = COLOR_FAMILY_PAGES.map((family) => ({
    url: `https://colorarchive.me/families/${family.slug}/`,
    lastModified: new Date("2026-03-19"),
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
    lastModified: new Date("2026-03-19"),
    changeFrequency: "weekly",
    priority: 0.62,
  }));

  return [
    ...topLevelRoutes,
    ...noteRoutes,
    ...tagRoutes,
    ...familyRoutes,
    ...collectionRoutes,
    ...packRoutes,
    ...colorRoutes,
  ];
}
