import type { MetadataRoute } from "next";
import { colors } from "@/src/data/colors";
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
      url: "https://colorarchive.me/all-colors",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/search",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/collections",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://colorarchive.me/favorites",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/recent",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/spectrum",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/surprise",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://colorarchive.me/word-to-color",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/support",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://colorarchive.me/waitlist",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: "https://colorarchive.me/thanks",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: "https://colorarchive.me/cancel",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://colorarchive.me/packs",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: "https://colorarchive.me/product-examples",
      lastModified: new Date("2026-03-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const colorRoutes: MetadataRoute.Sitemap = colors.map((color) => ({
    url: `https://colorarchive.me/colors/${color.id}`,
    lastModified: new Date("2026-03-18"),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const packRoutes: MetadataRoute.Sitemap = palettePacks.map((pack) => ({
    url: `https://colorarchive.me/packs/${pack.id}`,
    lastModified: new Date("2026-03-18"),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...topLevelRoutes, ...packRoutes, ...colorRoutes];
}
