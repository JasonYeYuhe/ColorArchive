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
    ];
  },
};

// withSentryConfig uploads source maps at build time and wires Next.js
// so the server/edge runtimes register Sentry via instrumentation.ts.
// Source-map upload is a no-op unless SENTRY_AUTH_TOKEN is set — keeps local
// builds fast and the CI / Vercel build path the same.
export default withSentryConfig(nextConfig, {
  org: "jason-yeyuhe",
  project: "colorarchive-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Tunnel to dodge aggressive ad-blockers; safe to enable because events
  // go through our own /monitoring route before Sentry.
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
