"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { initPosthog, phCapture, TOOL_SLUGS } from "@/src/lib/posthog";

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

  useEffect(() => {
    initPosthog();
    if (!pathname) return;

    phCapture("$pageview", { path: pathname });

    const segment = pathname.split("/").filter(Boolean)[0];
    if (segment && TOOL_SLUGS.has(segment)) {
      phCapture("tool_used", { tool: segment });
    }
  }, [pathname]);

  return null;
}
