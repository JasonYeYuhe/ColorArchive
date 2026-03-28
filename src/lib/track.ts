import { API_URL } from "@/src/lib/api-config";

/**
 * Fire-and-forget event tracking. Never throws, never blocks UI.
 */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;

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
