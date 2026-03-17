import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://colorarchive.me",
      lastModified: new Date("2026-03-17"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
