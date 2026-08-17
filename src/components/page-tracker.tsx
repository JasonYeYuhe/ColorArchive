"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { API_URL } from "@/src/lib/api-config";
import { attributionEventProps } from "@/src/lib/attribution";
import { useIsAnalyticsExcluded } from "@/src/lib/analytics-routes";
import { track } from "@/src/lib/track";

/**
 * How long a page must be held before a read counts, and what counts as being
 * held by a person. Both conditions are required, in either order.
 *
 * WHY THIS EXISTS: on 2026-08-10 e401e0f retired the Design Notes form from
 * guide detail pages. That form's impression was the ONLY event a guide page
 * emitted for somebody who just read it, so guide sessions fell from ~21 a day
 * to ~2.5 while guide pageviews stayed flat at 50-85 — the readers never left,
 * the instrument did. Since /guides/ is the top of the one acquisition path this
 * site has ever traced (guide -> word-to-color -> /pro/), losing its first step
 * means the funnel now starts midway through itself.
 *
 * WHY NOT JUST COUNT PAGEVIEWS: because `pageviews` is 22.5% automated and has
 * no caller identifier — the exact reason the denominator moved to `events`.
 * A plain page-load event would re-admit all of it. Requiring a real input
 * gesture AND four seconds keeps the bot resistance that made events worth
 * trusting: an HTTP-only crawler produces neither, and a JS crawler that renders
 * and leaves produces no pointer, scroll, key or touch.
 *
 * WHY A SEPARATE EVENT NAME: `page_read` is deliberately NOT folded into the
 * existing series. Adding it to what the reports already count would move the
 * engaged-visit number a second time, three weeks after 08-10 moved it once, and
 * make the before/after incomparable all over again. New question, new event.
 */
const READ_DWELL_MS = 4000;
const ENGAGEMENT_EVENTS = ["scroll", "pointermove", "keydown", "touchstart"] as const;

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

  useEffect(() => {
    // The exclusion check has to live INSIDE the effect. `return null` from the
    // component would not help: the effect still runs and would still attach
    // listeners. (Same trap as bf331d8.)
    if (!API_URL || isExcluded) return;

    // Once per path per tab. Without this, a client-side navigation back to a
    // page a reader already read counts them twice, and `page_read` stops being
    // a count of pages read.
    const key = `ca_read:${pathname}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
    } catch {
      // Storage blocked (private mode, hardened browsers). Continue: a possible
      // duplicate is a smaller error than dropping every read from those
      // browsers, and `fired` still holds within this page view.
    }

    let dwellElapsed = false;
    let engaged = false;
    let fired = false;

    const fireIfReady = () => {
      if (fired || !dwellElapsed || !engaged) return;
      fired = true;
      try {
        window.sessionStorage.setItem(key, "1");
      } catch {
        /* see above */
      }
      // No page value in the props: `track` already stamps the path, and this
      // event's whole job is to be counted, not inspected.
      track("page_read", {});
    };

    const onEngage = () => {
      engaged = true;
      fireIfReady();
    };
    // Either order is fine — a reader who scrolls immediately fires at 4s, one
    // who reads still and scrolls at 20s fires then.
    const timer = window.setTimeout(() => {
      dwellElapsed = true;
      fireIfReady();
    }, READ_DWELL_MS);

    for (const name of ENGAGEMENT_EVENTS) {
      window.addEventListener(name, onEngage, { passive: true });
    }

    return () => {
      window.clearTimeout(timer);
      for (const name of ENGAGEMENT_EVENTS) {
        window.removeEventListener(name, onEngage);
      }
    };
  }, [pathname, isExcluded]);

  return null;
}
