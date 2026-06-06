import { API_URL } from "@/src/lib/api-config";
import { phCapture } from "@/src/lib/posthog";

/**
 * Fire-and-forget event tracking. Never throws, never blocks UI.
 *
 * Fans out to two destinations that share the same event names:
 *  - the first-party backend `events` table (sendBeacon → /events), and
 *  - PostHog (product analytics: DAU / retention / funnels).
 * PostHog is a no-op until NEXT_PUBLIC_POSTHOG_KEY is configured.
 */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;

  phCapture(event, props);

  const path = window.location.pathname;

  try {
    const body = JSON.stringify({ event, props: props ?? {}, path });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${API_URL}/events`, new Blob([body], { type: "application/json" }));
    } else {
      fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "include",
      }).catch(() => {});
    }
  } catch {
    // Never let tracking break the app
  }
}

/**
 * Fire `login` on every successful authentication, plus `sign_up` when the account was
 * just created. The magic-link / Google flows don't tell the client whether a user is
 * new, so we infer it from `created_at` recency (a brand-new account was created seconds
 * ago). PostHog also tracks first-seen users on its own; this gives an explicit funnel
 * step the two platforms share by name.
 */
export function trackAuthSuccess(createdAt: string | null | undefined, method: string) {
  track("login", { method });

  if (!createdAt) return;
  const createdMs = new Date(createdAt).getTime();
  if (!Number.isFinite(createdMs)) return;
  // "Just created" = within the last 2 min. The lower bound tolerates ~5 min of
  // client/server clock skew; without it, a device clock running behind the server
  // makes `diff` negative (always < 2min) and marks EVERY login as a sign_up.
  const diff = Date.now() - createdMs;
  if (diff > -5 * 60 * 1000 && diff < 2 * 60 * 1000) {
    track("sign_up", { method });
  }
}
