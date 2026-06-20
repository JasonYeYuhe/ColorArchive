"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { API_URL } from "@/src/lib/api-config";
import { attributionEventProps } from "@/src/lib/attribution";

export function PageTracker() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    if (!API_URL || pathname === lastPath.current) return;
    lastPath.current = pathname;

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
  }, [pathname]);

  return null;
}
