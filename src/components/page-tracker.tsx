"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function PageTracker() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    if (!API_URL || pathname === lastPath.current) return;
    lastPath.current = pathname;

    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer || "",
      screen: window.innerWidth,
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
      }).catch((err) => console.warn("Analytics tracking failed:", err));
    }
  }, [pathname]);

  return null;
}
