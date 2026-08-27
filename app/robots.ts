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
    // 🔴 THIS ENTRY NOW BLOCKS A 301, AND THAT IS DELIBERATE — READ BEFORE REMOVING.
    //
    // The route itself was deleted on 2026-08-27; these URLs now 301 to
    // /colors/{a}/. Because they are Disallowed, Google will NOT fetch them and
    // therefore will NOT see that redirect, so the old URLs will linger in the
    // index as URL-only entries rather than consolidating. That is a real cost
    // and it is being accepted on purpose, for one cycle:
    //
    //   Un-blocking invites a re-crawl of every pair a spider still has queued —
    //   and they clearly queued a lot, since this route reached 8.75M ISR writes
    //   in a month. Each is now a cheap redirect rather than a render, but at
    //   ~$2.43 per million EDGE REQUESTS a full re-crawl of that backlog is still
    //   real money on a site that earns ~$7/month.
    //
    // The redirect is not for crawlers. It is for PEOPLE clicking stale search
    // results — GSC showed ~0.53 clicks/day still landing here — and robots.txt
    // never governed them.
    //
    // The index cleanup is a separate, monitored step, once a cycle of billing
    // data exists: allow Googlebot ONLY, let it observe the 301s, confirm the
    // URLs drop, then restore this line. Keep every other crawler blocked
    // throughout. Do not do it as a side effect of some other change.
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
