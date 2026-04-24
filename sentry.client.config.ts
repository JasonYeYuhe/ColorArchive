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
