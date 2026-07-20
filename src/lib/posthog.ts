import posthog from "posthog-js";

/**
 * PostHog product analytics — client-only singleton.
 *
 * This is the product-analytics layer (DAU / retention / conversion funnels). It
 * sits beside, not on top of, the existing observability stack: Sentry owns crashes,
 * New Relic owns frontend RUM, Datadog owns backend APM. PostHog answers "who are the
 * users and do they come back", which none of those do.
 *
 * Privacy posture (kept in lockstep with the iOS AnalyticsBootstrap):
 * - Cookieless: the anonymous distinct_id lives in localStorage, never a cookie, so
 *   retention/DAU still work across sessions without setting an analytics cookie.
 * - `person_profiles: "identified_only"` — anonymous traffic stays event-only; a person
 *   profile is created only after `identify()` on login.
 * - Session recording is OFF. We never pass PII (email / name) into events or identify;
 *   logged-in users are keyed by their opaque numeric backend id.
 * - No-op until NEXT_PUBLIC_POSTHOG_KEY is set, so this is safe to ship before the
 *   project exists — mirrors the empty-DSN no-op in instrumentation-client.ts and the
 *   iOS SentryBootstrap.
 */

let initialized = false;

function ready(): boolean {
  return initialized && typeof window !== "undefined";
}

// Defense-in-depth against PII. The signed-in user's email is rendered in the DOM
// (account / profile pages), and PostHog autocapture can pick rendered text up via
// `$el_text` / `$elements`. Redact any email-like substring from EVERY captured property
// (recursively, so nested autocapture `$elements` are covered) before it leaves the browser.
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// Pure: never mutates its input. PostHog may hand `sanitize_properties` objects we must not
// write to (frozen / shared super-property refs), so we build and return fresh copies.
function scrubPII(value: unknown): unknown {
  if (typeof value === "string") return value.replace(EMAIL_RE, "[redacted]");
  if (Array.isArray(value)) return value.map(scrubPII);
  if (value && typeof value === "object") {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src)) out[k] = scrubPII(src[k]);
    return out;
  }
  return value;
}

export function initPosthog(): void {
  if (initialized || typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // unconfigured → stay a no-op

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    // Cookieless: persist the distinct_id in localStorage only (no cookie banner needed
    // for storage in most readings; final consent call is the operator's).
    persistence: "localStorage",
    // Anonymous users don't create person profiles — cheaper + less PII. A profile is
    // created on identify() at login.
    person_profiles: "identified_only",
    // App Router does client-side navigation, so PostHog's automatic pageview would only
    // fire on hard loads. We capture $pageview manually on route change instead.
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    // Privacy: no session replay.
    disable_session_recording: true,
    // Privacy: strip any email that slips into a property (esp. autocapture $el_text).
    sanitize_properties: (properties) => scrubPII(properties) as typeof properties,
  });

  initialized = true;
}

/** Fire-and-forget capture. No-op until PostHog is configured. Never throws. */
export function phCapture(event: string, props?: Record<string, unknown>): void {
  if (!ready()) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* never let analytics break the app */
  }
}

/**
 * Register super-properties — attached to EVERY subsequent capture, including PostHog's
 * own autocapture events (clicks / form submits) that never pass through `track()`. Used
 * to stamp first-touch acquisition source (channel / utm_source / referring_domain) onto
 * all events so PostHog funnels can be broken down by source. No-op until configured.
 */
export function phRegister(props: Record<string, unknown>): void {
  if (!ready()) return;
  try {
    posthog.register(props);
  } catch {
    /* ignore */
  }
}

/** Associate subsequent events with a stable, non-PII user id (the backend user id). */
export function phIdentify(distinctId: string, props?: Record<string, unknown>): void {
  if (!ready()) return;
  try {
    posthog.identify(distinctId, props);
  } catch {
    /* ignore */
  }
}

/** Clear identity on logout so the next session starts anonymous. */
export function phReset(): void {
  if (!ready()) return;
  try {
    posthog.reset();
  } catch {
    /* ignore */
  }
}

/**
 * Interactive tool routes. When the first path segment matches one of these, the page
 * tracker also emits a `tool_used` event with the slug. Content / policy / account pages
 * are intentionally excluded. The web slugs (route names) differ from the iOS tool ids by
 * necessity — the two platforms expose different tool sets — but the EVENT NAME `tool_used`
 * is identical on both, which is what cross-platform analysis keys on.
 */
export const TOOL_SLUGS = new Set<string>([
  "word-to-color",
  "palette-generator",
  "brand-generator",
  "mood-palette",
  "harmonies",
  "contrast",
  "colorblind",
  "gradient",
  "mixer",
  "image-palette",
  "convert",
  "color-quiz",
  "palette-audit",
  "identify",
  "combinations",
  "compare",
  "tints",
  "spectrum",
  "validate",
  "mesh-gradient",
  "wcag-audit",
  "pick-for-me",
  "surprise",
  "analyze",
  // First-segment match covers /screen-test/, /screen-test/dead-pixel/, /screen-test/color-screens/
  "screen-test",
  "tailwind-colors",
  "css-filter",
  "color-wheel",
]);
