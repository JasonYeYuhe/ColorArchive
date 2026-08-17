"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { initPosthog, phCapture, phRegister, TOOL_SLUGS } from "@/src/lib/posthog";
import { attributionEventProps } from "@/src/lib/attribution";
import { useIsAnalyticsExcluded } from "@/src/lib/analytics-routes";

/**
 * Initializes PostHog on mount and emits a manual `$pageview` on every App Router
 * navigation. Next.js client-side route changes don't trigger a full page load, so
 * PostHog's automatic pageview can't see them — we fire it from `usePathname()` here,
 * mirroring how the first-party PageTracker works. When the route is one of the
 * interactive tools, we also emit `tool_used` (aligned by event name with iOS).
 *
 * Renders nothing. Mount once at the root layout. No-op until the PostHog key is set.
 *
 * NOTE: deliberately uses only `usePathname` (not `useSearchParams`) so it does not
 * force a Suspense boundary / opt routes out of static rendering.
 */
export function PostHogProvider() {
  const pathname = usePathname();
  const isExcluded = useIsAnalyticsExcluded();
  // Dedupe by path: avoids double-firing under React StrictMode (dev) and any re-render
  // that re-runs the effect without an actual route change. Mirrors PageTracker.
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    initPosthog();
    // Stamp first-touch acquisition source onto every event as super-properties, so even
    // PostHog autocapture events break down by channel. Cheap + idempotent; register() just
    // overwrites with the same persisted value on each route change.
    phRegister(attributionEventProps());
    if (!pathname || lastPath.current === pathname) return;
    // Record the path as seen, THEN decide whether to report it — same ordering as
    // page-tracker.tsx. Bailing first would make a return visit to the previous route
    // look like a duplicate and drop it.
    lastPath.current = pathname;
    // Excluded routes send no pageview. This sits BELOW initPosthog() on purpose: the
    // provider is mounted once by the root layout, so bailing before init would leave
    // PostHog uninitialised for every route the visitor opens next. See
    // src/lib/analytics-routes.ts for why that list is not the chrome list.
    if (isExcluded) return;

    phCapture("$pageview", { path: pathname });

    const segment = pathname.split("/").filter(Boolean)[0];
    if (segment && TOOL_SLUGS.has(segment)) {
      phCapture("tool_used", { tool: segment });
    }
  }, [pathname, isExcluded]);

  return null;
}
