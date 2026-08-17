"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { API_URL } from "@/src/lib/api-config";
import { attributionEventProps } from "@/src/lib/attribution";
import { useIsAnalyticsExcluded } from "@/src/lib/analytics-routes";

export function PageTracker() {
  const pathname = usePathname();
  const isExcluded = useIsAnalyticsExcluded();
  const lastPath = useRef("");

  useEffect(() => {
    // Excluded routes are not product surfaces and do not report. The list lives in
    // src/lib/analytics-routes.ts, separate from the chrome list on purpose — see the
    // note there.
    if (!API_URL || pathname === lastPath.current) return;
    // Advance the dedupe ref BEFORE the exclusion bail, not after. Bailing without
    // recording the path leaves lastPath pointing at the page the visitor came from,
    // so returning to it reads as a duplicate and that pageview is dropped —
    // suppressing one route would quietly cost measurements on the others.
    lastPath.current = pathname;
    if (isExcluded) return;

    // Attach first-touch acquisition source so the /preorder UV denominator (the exit-gate
    // floor) can be split by channel — qualified ICP vs. generic gawkers.
    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer || "",
      screen: window.innerWidth,
      ...attributionEventProps(),
    });

    // Use sendBeacon for fire-and-forget (survives page unload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `${API_URL}/pageviews`,
        new Blob([body], { type: "application/json" })
      );
    } else {
      fetch(`${API_URL}/pageviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname, isExcluded]);

  return null;
}
