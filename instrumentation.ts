/**
 * Next.js instrumentation entry point — runs once per runtime boot on the
 * server (Node + Edge). Wires Sentry in the matching runtime. The browser
 * runtime is configured by sentry.client.config.ts.
 *
 * See https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";
