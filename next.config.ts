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
