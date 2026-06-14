import type { MetadataRoute } from "next";
import { colors } from "@/src/data/colors";
import stories from "@/src/data/color-stories.json";
import { collections } from "@/src/lib/collections";
import { COLOR_FAMILY_PAGES } from "@/src/lib/color-family-pages";
import { landingGuides } from "@/src/lib/guides";
import { getAllTags, newsletterIssues, tagToSlug } from "@/src/lib/newsletter-issues";
import { useCases } from "@/src/lib/use-cases";
import { brandPalettes } from "@/src/lib/brand-palettes";
import { regionPalettes } from "@/src/lib/region-palettes";
import { getComplementaryColor, getAnalogousColors } from "@/src/lib/color-relationships";
import { wordToColorSeeds, slugifyWord } from "@/src/lib/word-to-color-seeds";
import { SITE_URL } from "@/src/lib/site-config";

export const dynamic = "force-static";

const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const topLevelRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/all-colors/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/collections/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/updates/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/notes/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.76,
    },
    {
      url: `${SITE_URL}/guides/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.77,
    },
    // /favorites/, /recent/, /palette/, /projects/, /account/ are user-state
    // routes — disallowed in robots.ts, so they don't belong in sitemap either.
    // Do not re-add without updating robots.ts.
    {
      url: `${SITE_URL}/spectrum/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/word-to-color/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/convert/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: `${SITE_URL}/contrast/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: `${SITE_URL}/support/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/gradient/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: `${SITE_URL}/harmonies/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.83,
    },
    {
      url: `${SITE_URL}/compare/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.80,
    },
    {
      url: `${SITE_URL}/tools/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.88,
    },
    {
      url: `${SITE_URL}/colorblind/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: `${SITE_URL}/mixer/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/tints/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/brand/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.87,
    },
    {
      url: `${SITE_URL}/name/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.84,
    },
    {
      url: `${SITE_URL}/wcag-audit/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.84,
    },
    {
      url: `${SITE_URL}/palette-audit/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.88,
    },
    {
      url: `${SITE_URL}/combinations/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/image-palette/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.86,
    },
    {
      url: `${SITE_URL}/tokens/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/css-colors/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/famous-palettes/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.88,
    },
    {
      url: `${SITE_URL}/decades/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.87,
    },
    {
      url: `${SITE_URL}/seasonal/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.87,
    },
    {
      url: `${SITE_URL}/trends/`,
      lastModified: BUILD_DATE,
      changeFrequency: "yearly" as const,
      priority: 0.90,
    },
    {
      url: `${SITE_URL}/industry/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.87,
    },
    {
      url: `${SITE_URL}/use-cases/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: `${SITE_URL}/api-docs/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: `${SITE_URL}/free-resources/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/families/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pro/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/analyze/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/stories/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/trending/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.78,
    },
    {
      url: `${SITE_URL}/today/`,
      lastModified: BUILD_DATE,
      changeFrequency: "daily",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/identify/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: `${SITE_URL}/mesh-gradient/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/mood-palette/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/brand-generator/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/color-quiz/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/palette-generator/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.84,
    },
    {
      url: `${SITE_URL}/preview/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: `${SITE_URL}/product-examples/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: `${SITE_URL}/search/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/colors/hex/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/privacy/`,
      lastModified: BUILD_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms/`,
      lastModified: BUILD_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/commerce-disclosure/`,
      lastModified: BUILD_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const colorRoutes: MetadataRoute.Sitemap = colors.map((color) => ({
    url: `${SITE_URL}/colors/${color.id}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${SITE_URL}/collections/${collection.id}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const familyRoutes: MetadataRoute.Sitemap = COLOR_FAMILY_PAGES.map((family) => ({
    url: `${SITE_URL}/families/${family.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly",
    priority: 0.72,
  }));

  const noteRoutes: MetadataRoute.Sitemap = newsletterIssues.map((issue) => ({
    url: `${SITE_URL}/notes/${issue.slug}/`,
    lastModified: new Date(issue.date),
    changeFrequency: "monthly",
    priority: 0.68,
  }));

  const tagRoutes: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: `${SITE_URL}/notes/tags/${tagToSlug(tag)}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly",
    priority: 0.62,
  }));

  const storyRoutes: MetadataRoute.Sitemap = Object.keys(stories).map((slug) => ({
    url: `${SITE_URL}/stories/${slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const guideRoutes: MetadataRoute.Sitemap = landingGuides.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Static per-word pages — /word-to-color/[word]/ — the site's #1 query family.
  const wordColorRoutes: MetadataRoute.Sitemap = wordToColorSeeds.map((word) => ({
    url: `${SITE_URL}/word-to-color/${slugifyWord(word)}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const useCaseRoutes: MetadataRoute.Sitemap = useCases.map((uc) => ({
    url: `${SITE_URL}/use-cases/${uc.id}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  const brandIndexRoute: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/brands/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: `${SITE_URL}/journal/`,
      lastModified: BUILD_DATE,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];
  const brandRoutes: MetadataRoute.Sitemap = brandPalettes.map((b) => ({
    url: `${SITE_URL}/brands/${b.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  const regionIndexRoute: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/regions/`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.78,
    },
  ];
  const regionRoutes: MetadataRoute.Sitemap = regionPalettes.map((r) => ({
    url: `${SITE_URL}/regions/${r.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  // VS comparison pages — pre-render complementary + analogous for key roots
  const VS_ROOTS = [
    "crimson", "ember", "amber", "honey", "olive", "emerald",
    "teal", "azure", "cobalt", "indigo", "violet", "magenta",
    "rose", "garnet",
  ];
  const vsRoutes: MetadataRoute.Sitemap = [];
  const vsSeen = new Set<string>();
  for (const root of VS_ROOTS) {
    const seed = colors.find((c) => c.id === `${root}-core-vivid`);
    if (!seed) continue;
    const comp = getComplementaryColor(colors, seed);
    if (comp && !vsSeen.has(`${seed.id}:${comp.id}`)) {
      vsSeen.add(`${seed.id}:${comp.id}`);
      vsRoutes.push({
        url: `${SITE_URL}/colors/${seed.id}/vs/${comp.id}/`,
        lastModified: BUILD_DATE,
        changeFrequency: "monthly",
        priority: 0.55,
      });
    }
    for (const a of getAnalogousColors(colors, seed, 1)) {
      if (!vsSeen.has(`${seed.id}:${a.id}`)) {
        vsSeen.add(`${seed.id}:${a.id}`);
        vsRoutes.push({
          url: `${SITE_URL}/colors/${seed.id}/vs/${a.id}/`,
          lastModified: BUILD_DATE,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  return [
    ...topLevelRoutes,
    ...guideRoutes,
    ...wordColorRoutes,
    ...noteRoutes,
    ...tagRoutes,
    ...storyRoutes,
    ...familyRoutes,
    ...collectionRoutes,
    ...useCaseRoutes,
    ...brandIndexRoute,
    ...brandRoutes,
    ...regionIndexRoute,
    ...regionRoutes,
    ...colorRoutes,
    ...vsRoutes,
  ];
}
