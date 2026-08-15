"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { API_URL } from "@/src/lib/api-config";
import { attributionEventProps } from "@/src/lib/attribution";
import { useIsBareRoute } from "@/src/lib/bare-routes";

export function PageTracker() {
  const pathname = usePathname();
  const isBare = useIsBareRoute();
  const lastPath = useRef("");

  useEffect(() => {
    // Bare routes are not product surfaces, so they do not report. This is a
    // deliberate widening of what src/lib/bare-routes.ts covers, not a bug fix:
    // the visible chrome was removed first, but a private page still beaconing its
    // path into the same analytics table as commercial traffic contradicts the point
    // of having the list at all.
    if (!API_URL || pathname === lastPath.current) return;
    // Advance the dedupe ref BEFORE the bare-route bail, not after. Bailing without
    // recording the path leaves lastPath pointing at the page the visitor came from,
    // so returning to it reads as a duplicate and that pageview is dropped —
    // suppressing one route would quietly cost measurements on the others.
    lastPath.current = pathname;
    if (isBare) return;

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
  }, [pathname, isBare]);

  return null;
}
