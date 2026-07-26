"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { track } from "@/src/lib/track";

/**
 * Fire an event once per page view, when an element is actually seen.
 *
 * WHY AN OBSERVER AND NOT A PAGEVIEW
 * The AI kill-criteria need an EXPOSURE denominator. A pageview is not one: the AI
 * card on the colour-detail page (our highest-traffic template) renders roughly
 * 1,500px into a 13,000px document — 1.9 viewport heights down — so most views
 * never showed it. Dividing requests by pageviews would understate the real
 * conversion rate and fail the feature for the wrong reason.
 *
 * KNOWN LIMITATION, stated rather than hidden: this measures "scrolled far enough
 * to see it", i.e. exposure conditional on scroll depth. It is the right
 * denominator for "of the people who saw this, how many used it" and the WRONG one
 * for "of everyone who landed here, how many used it". The report says so too.
 *
 * TWO DEFECTS THIS FILE HAS ALREADY HAD, both worth knowing before editing it:
 *
 *  1. NO RE-OBSERVE ON CLIENT-SIDE NAV. The pathname effect reset `firedRef` but
 *     nothing started observing again — React only re-invokes a callback ref when
 *     the DOM node identity changes, and /colors/a → /colors/b reuses both the
 *     component and the node. So only the FIRST colour page in a browsing session
 *     ever reported an impression. That deflates the denominator, which inflates
 *     exposure→request, which biases a kill-gate toward KEEP — the single worst
 *     direction for a bug in this file to point. Fixed by holding the node in a ref
 *     and re-arming the observer from the pathname effect.
 *
 *  2. NO DWELL. It fired the instant the threshold was crossed, so a fly-by at
 *     scroll speed counted as exposure, and so did a snapshot renderer.
 *
 * Both fixes are also the bot defence. A dwell requirement is worth more than any
 * user-agent list here — but do NOT over-claim it: crawlers that execute JS DO
 * reach our analytics endpoints in volume (55 of 84 POSTs to /events in one
 * measured four-hour window were AhrefsBot), so the dwell is a filter, not a
 * guarantee. The report carries concentration guards for that reason.
 */
export function useImpression(
  eventName: string,
  props?: Record<string, string | number | boolean>,
  { threshold = 0.5, dwellMs = 1000 }: { threshold?: number; dwellMs?: number } = {},
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);
  const firedRef = useRef(false);
  const pathname = usePathname();

  // Props arrive as a fresh object literal every render, so read them through a ref
  // to keep the observe callback stable — otherwise every render would tear down
  // and rebuild the observer, restarting the dwell each time.
  const propsRef = useRef(props);
  propsRef.current = props;

  const cleanup = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  const observe = useCallback(() => {
    cleanup();
    const node = nodeRef.current;
    if (!node || firedRef.current) return;
    // Absent in some embedded webviews. No observer means no impression, which
    // under-counts the denominator — that can only make a ratio look worse than
    // reality, never better, so it is the safe direction to fail in.
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        if (firedRef.current) return;

        if (entries.some((e) => e.isIntersecting)) {
          if (dwellTimerRef.current) return; // already counting down
          dwellTimerRef.current = setTimeout(() => {
            dwellTimerRef.current = null;
            if (firedRef.current) return;
            firedRef.current = true;
            track(eventName, propsRef.current);
            io.disconnect();
          }, dwellMs);
          return;
        }

        // Scrolled back out before the dwell elapsed — cancel, do not count.
        if (dwellTimerRef.current) {
          clearTimeout(dwellTimerRef.current);
          dwellTimerRef.current = null;
        }
      },
      { threshold },
    );

    io.observe(node);
    observerRef.current = io;
  }, [cleanup, eventName, threshold, dwellMs]);

  // Same component instance, new page. Reset the guard AND re-arm the observer —
  // resetting alone was defect (1) above.
  useEffect(() => {
    firedRef.current = false;
    observe();
  }, [pathname, observe]);

  useEffect(() => cleanup, [cleanup]);

  return useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node;
      observe();
    },
    [observe],
  );
}
