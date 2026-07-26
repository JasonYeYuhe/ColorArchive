"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { track } from "@/src/lib/track";

/**
 * Fire an event once when an element actually becomes visible.
 *
 * WHY AN OBSERVER AND NOT A PAGEVIEW
 * The AI kill-criteria need an EXPOSURE denominator. A pageview is not one: the
 * AI card on the colour-detail page (6,133 views/30d, our highest-traffic
 * template) sits well below the fold, so most of those views never showed it.
 * Dividing requests by pageviews would understate the real conversion rate and
 * make the feature look worse than it is — and a gate that fails for the wrong
 * reason is as useless as one that cannot fail.
 *
 * KNOWN LIMITATION, stated rather than hidden: this measures "scrolled far enough
 * to see it", which is exposure conditional on scroll depth. It is the right
 * denominator for "of the people who saw this, how many used it" and the WRONG one
 * for "of everyone who landed here, how many used it". The report labels it
 * accordingly.
 *
 * IMPLEMENTATION NOTES — both learned the hard way in cotd-subscribe-form.tsx:
 *  - A CALLBACK ref, not a plain ref plus an effect. Components that swap their
 *    root element on state change (loading → result) leave an effect observing a
 *    detached node: the impression is lost and the node leaks.
 *  - The fired-guard resets on `usePathname()` change, because guide → guide and
 *    colour → colour are client-side navigations that REUSE the component
 *    instance. Without the reset, only the first page in a browsing session
 *    reports an impression, and the denominator silently collapses.
 */
export function useImpression(
  eventName: string,
  props?: Record<string, string | number | boolean>,
  { threshold = 0.5, dwellMs = 1000 }: { threshold?: number; dwellMs?: number } = {},
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const pathname = usePathname();

  // Props arrive as a fresh object literal every render, so reading them through
  // a ref keeps the callback ref stable — otherwise React detaches and reattaches
  // the observer on every render, and each reattach re-observes from scratch.
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    firedRef.current = false;
  }, [pathname]);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    },
    [],
  );

  return useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      // A pending dwell belongs to the node we just stopped observing.
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }

      if (!node || firedRef.current) return;
      // Ancient browsers and some embedded webviews lack it. No observer means no
      // impression, which under-counts the denominator — the safe direction, since
      // it can only make a ratio look worse than reality, never better.
      if (typeof IntersectionObserver === "undefined") return;

      const io = new IntersectionObserver(
        (entries) => {
          if (firedRef.current) return;
          const visible = entries.some((e) => e.isIntersecting);

          // DWELL, not a touch. Half the element visible for one continuous second
          // — the standard viewability definition — instead of "the observer fired
          // once". Two reasons, and the second is the reason it is not optional:
          //
          //  1. Honesty. Flicking past a card at scroll speed is not exposure. A
          //     denominator inflated by fly-bys makes the conversion rate look
          //     worse than it is, which fails the gate for the wrong reason.
          //  2. It is a free bot filter, and a better one than any user-agent list.
          //     Automated renderers do not linger: measured over a fortnight, a
          //     6,753-IP crawler farm rendered 6,555 pages and fired exactly ONE
          //     interaction event. A dwell requirement is what makes that true.
          if (visible) {
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

          // Scrolled back out before the second elapsed — cancel, do not count.
          if (dwellTimerRef.current) {
            clearTimeout(dwellTimerRef.current);
            dwellTimerRef.current = null;
          }
        },
        { threshold },
      );

      io.observe(node);
      observerRef.current = io;
    },
    [eventName, threshold, dwellMs],
  );
}
