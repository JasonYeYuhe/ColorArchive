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
    // /preorder is meta-noindex and acquires via on-site CTAs + posts, not search
    // (its UV is real-user pageviews, unaffected by robots). Keep crawlers off it.
    "/preorder/",
    // ── THE SINGLE LARGEST LINE ON THE VERCEL BILL (added 2026-08-26) ──────────
    //
    // /colors/{a}/vs/{b}/ spans ~29.6M pairs and is rendered on demand
    // (dynamicParams). Every crawler hit on a pair nobody has requested before
    // renders a page AND writes an ISR entry. Measured 2026-07-25..08-25:
    // 8.75M ISR writes = $34.99, against 16.2M edge requests — i.e. roughly half
    // of all traffic to this site was minting new cache entries for pairs no
    // human asked for.
    //
    // WHY THE TWO EARLIER FIXES DID NOT WORK, which is the part worth keeping:
    //   9fece2b (2026-06-20) added rel="nofollow" to vs→vs links.
    //   9a2d0b2 (2026-06-27) added robots: { index: false } to the page metadata.
    // Both target INDEXING. Neither reduces CRAWLING — a noindex tag has to be
    // fetched to be read, and fetching is the thing that costs money here. ISR
    // writes went 4.78M → 8.75M in the two months AFTER noindex shipped.
    // Disallow is the first of these that stops the request itself.
    //
    // Deliberately NOT paired with dynamicParams = false on the route: only ~28
    // pairs are pre-rendered, while every one of the ~3,066 colour pages renders
    // six "Compare" links, so switching it off would 404 roughly 18,000 internal
    // links. Humans reaching a pair through those links still render it normally;
    // they are a rounding error next to the crawl (~95 engaged visits/day).
    "/colors/*/vs/",
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
