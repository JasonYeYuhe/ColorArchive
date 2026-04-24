/**
 * Sentry initialization for the Express API on the Droplet.
 *
 * MUST be required at the very top of server/index.js — before any route
 * modules or heavy work — so the SDK can patch Node's http/https modules for
 * auto-instrumentation. See:
 * https://docs.sentry.io/platforms/javascript/guides/express/
 *
 * A missing / empty SENTRY_DSN is treated as "Sentry disabled" — the server
 * boots normally, errors still go to the PM2 log, they just don't leave
 * the Droplet. This makes local dev and first-boot-without-DSN safe.
 */

const Sentry = require("@sentry/node");

const dsn = process.env.SENTRY_DSN || "";
const enabled = Boolean(dsn) && process.env.SENTRY_ENABLED !== "false";

if (enabled) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate:
      process.env.NODE_ENV === "production" ? 0.05 : 1.0,
    // The backend is a single Droplet — release tagging is nice-to-have, not load-bearing.
    release: process.env.GIT_SHA || undefined,
    // Don't send PII by default; we can opt in per-event via setUser when useful.
    sendDefaultPii: false,
    ignoreErrors: [
      // CORS preflight mismatches produced by bots probing the API — very high
      // volume, zero signal.
      "Not allowed by CORS",
    ],
  });
  // eslint-disable-next-line no-console
  console.log("[sentry] initialized");
} else if (!dsn) {
  // eslint-disable-next-line no-console
  console.log("[sentry] disabled (no SENTRY_DSN)");
}

module.exports = { Sentry, enabled };
