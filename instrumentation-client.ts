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

// Required export for Next.js 15+ app-router instrumentation so Sentry
// can attach router-transition spans to page navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
