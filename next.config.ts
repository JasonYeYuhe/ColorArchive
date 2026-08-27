import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  async redirects() {
    return [
      { source: "/packs", destination: "/pro/", permanent: true },
      { source: "/packs/", destination: "/pro/", permanent: true },
      { source: "/packs/:slug", destination: "/pro/", permanent: true },
      { source: "/packs/:slug/", destination: "/pro/", permanent: true },
      { source: "/free-pack", destination: "/free-resources/", permanent: true },
      { source: "/free-pack/", destination: "/free-resources/", permanent: true },
      // /colors/ was the single most-linked internal target on the site — 43
      // references, including two shipped tool pages and 40 guide links — and it
      // has never been a route. The archive index is /all-colors/; /colors/ only
      // ever existed as /colors/[slug]/. Every referrer is fixed at source in the
      // same change; this exists for inbound links and anything missed.
      { source: "/colors", destination: "/all-colors/", permanent: true },
      // The retired /colors/{a}/vs/{b}/ comparison route (removed 2026-08-27).
      //
      // It spanned ~29.6M pairs rendered on demand, and crawling that space was
      // the single largest line on the Vercel bill — 8.75M ISR writes / $34.99 in
      // one cycle. Closing it with `dynamicParams = false` (5506e32) stopped the
      // spend but started 404-ing live search traffic: GSC shows ~0.53 clicks/day
      // still arriving, spread one-click-per-URL across the long tail, and NONE
      // of them on the 28 pairs that were pre-rendered.
      //
      // WHY THE COLOUR PAGE AND NOT /compare/. The queries reaching these URLs are
      // colour-name lookups, not comparisons — "cloverdusk", "mauve nocturne",
      // "moss dusk", "#fcfbf8". Exactly one comparison query appears at all
      // ("mauve vs fuchsia", 37 impressions, 0 clicks). So :slug's own page is a
      // better answer than the page they were actually landing on, and a far
      // better one than a 404. The Compare affordance itself lives on /compare/
      // now, which is a static route and costs nothing to serve.
      //
      // NOTE the robots.txt Disallow on this path stays for now, which means
      // Google will not fetch these and so will not see this 301. That is
      // deliberate and temporary: un-blocking would invite a re-crawl of every
      // pair a spider still has queued, and while each is now a cheap redirect
      // rather than a render, millions of them still bill as edge requests. The
      // redirect is for PEOPLE clicking stale results — robots.txt never applied
      // to them. Consolidating the index is a separate, monitored step: unblock
      // Googlebot only, let it observe the 301s, then restore the block.
      { source: "/colors/:slug/vs/:slug2", destination: "/colors/:slug/", permanent: true },
      { source: "/colors/:slug/vs/:slug2/", destination: "/colors/:slug/", permanent: true },
      // The retired /tools/* namespace. Every one of these was linked from our own
      // guides and newsletters for months before the prefix was dropped, so they
      // are the URLs most likely to be in an index or someone else's bookmark.
      // The in-content links were all repointed; this rescues everything outside
      // our control, which a find-and-replace cannot reach.
      { source: "/tools/contrast", destination: "/contrast/", permanent: true },
      { source: "/tools/contrast-checker", destination: "/contrast/", permanent: true },
      { source: "/tools/wcag-audit", destination: "/wcag-audit/", permanent: true },
      { source: "/tools/colorblind", destination: "/colorblind/", permanent: true },
      { source: "/tools/color-converter", destination: "/convert/", permanent: true },
      { source: "/tools/convert", destination: "/convert/", permanent: true },
      { source: "/tools/compare", destination: "/compare/", permanent: true },
      { source: "/tools/design-tokens", destination: "/tokens/", permanent: true },
      { source: "/tools/tints-shades", destination: "/tints/", permanent: true },
      { source: "/tools/tints", destination: "/tints/", permanent: true },
      { source: "/tools/tonal", destination: "/tints/", permanent: true },
      { source: "/tools/mood", destination: "/mood-palette/", permanent: true },
      { source: "/tools/brand", destination: "/brand-generator/", permanent: true },
      { source: "/tools/wheel", destination: "/color-wheel/", permanent: true },
      { source: "/tools/harmonies", destination: "/harmonies/", permanent: true },
      { source: "/tools/palette", destination: "/palette-generator/", permanent: true },
      { source: "/palette-builder", destination: "/palette-generator/", permanent: true },
      { source: "/builder", destination: "/palette-generator/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/downloads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

// withSentryConfig uploads source maps at build time and wires Next.js
// so the server/edge runtimes register Sentry via instrumentation.ts.
// Source-map upload is a no-op unless SENTRY_AUTH_TOKEN is set — keeps local
// builds fast and the CI / Vercel build path the same.
//
// Keeping the option surface minimal. Earlier attempt to silence deprecation
// warnings by moving `automaticVercelMonitors` under `webpack.*` triggered
// Sentry's MCP integration, which failed the Vercel build with `ENOENT
// /vercel/path0/.mcp.json`. We don't need Vercel cron monitors for this
// project, so just drop the option entirely and live with the deprecation
// warning until @sentry/nextjs cleans up the guidance.
export default withSentryConfig(nextConfig, {
  org: "jason-yeyuhe",
  project: "colorarchive-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Tunnel to dodge aggressive ad-blockers; safe to enable because events
  // go through our own /monitoring route before Sentry.
  tunnelRoute: "/monitoring",
});
