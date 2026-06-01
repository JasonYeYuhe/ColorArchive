import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/lib/site-config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    "/admin/",
    "/analytics/",
    "/login/",
    "/account/",
    "/favorites/",
    "/recent/",
    "/palette/",
    "/projects/",
    "/api/",
  ];

  // Explicitly welcome AI / LLM crawlers. ChatGPT is already this site's
  // largest external referral source, and Google-Extended / Applebot-Extended
  // must be allowed *explicitly* for content to be eligible for Gemini and
  // Apple Intelligence answers — they are not covered by the "*" rule for AI
  // use. Same path restrictions as everyone else (no private routes).
  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Perplexity-User",
    "ClaudeBot",
    "anthropic-ai",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
    "cohere-ai",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiBots, allow: "/", disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
