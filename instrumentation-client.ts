// This file is the Next.js 15+ client-runtime instrumentation entry for
// @sentry/nextjs v10. Previously named `sentry.client.config.ts` — that
// legacy name was silently ignored by the v10 bundler, so Sentry never
// initialized on the client and we were blind to every browser-side error
// from Week 2 (deploy 2026-04-17) until this fix (2026-04-24).
//
// Renaming to `instrumentation-client.ts` (plus exporting onRouterTransitionStart)
// is the canonical v10 wiring per node_modules/@sentry/nextjs/build/types/
// config/withSentryConfig/buildTime.d.ts.

import * as Sentry from "@sentry/nextjs";
import { BrowserAgent } from "@newrelic/browser-agent/loaders/browser-agent";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,

    // 10% trace sampling in prod, 100% in dev — keeps quota sane on the free tier.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session replay is OFF by default; error-only replay catches the 30s before a
    // crash without recording every healthy session. Sampling is trivial if OFF.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // Filter out noisy browser extensions + third-party script errors that we cannot fix.
    // Expand this list as real noise shows up in the dashboard.
    ignoreErrors: [
      /ResizeObserver loop/i,
      /Non-Error promise rejection/i,
      /extension\/\//i,
      /chrome-extension:\/\//i,
    ],

    // Don't send events while running Playwright / local dev unless explicitly opted in.
    enabled:
      process.env.NEXT_PUBLIC_SENTRY_ENABLED !== "false" &&
      typeof window !== "undefined",
  });
}

// New Relic Browser (RUM): Core Web Vitals, page-load / SPA route timing, JS errors.
// The identifiers below are PUBLIC browser-agent values — they ship in client JS by
// design (not secrets), so committing them is expected. Account 8123978 (US, beacon
// bam.nr-data.net), app "ColorArchive" (applicationID 1120537094). Complements Sentry
// (errors) with RUM; tune overlap in the NR dashboard if needed.
if (typeof window !== "undefined") {
  const NR_APP_ID = "1120537094";
  const NR_BROWSER_KEY =
    "9253281111BA9CF8B6829A0B314E3CBD113D064B9CE890C5646A6D57F79867D3";
  new BrowserAgent({
    init: {
      distributed_tracing: { enabled: true },
      privacy: { cookies_enabled: true },
      ajax: { deny_list: ["bam.nr-data.net"] },
    },
    info: {
      beacon: "bam.nr-data.net",
      errorBeacon: "bam.nr-data.net",
      licenseKey: NR_BROWSER_KEY,
      applicationID: NR_APP_ID,
      sa: 1,
    },
    loader_config: {
      accountID: "8123978",
      trustKey: "8123978",
      agentID: NR_APP_ID,
      licenseKey: NR_BROWSER_KEY,
      applicationID: NR_APP_ID,
    },
  });
}

// Required export for Next.js 15+ app-router instrumentation so Sentry
// can attach router-transition spans to page navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
