"use client";

import { usePathname } from "next/navigation";

/**
 * Routes that do not report a pageview.
 *
 * DELIBERATELY SEPARATE FROM src/lib/bare-routes.ts, and deliberately not derived
 * from it. Both lists hold the same single route today, and they answer different
 * questions: bare-routes asks "should the site's furniture render here?", this asks
 * "should this page appear in product analytics?".
 *
 * The first version of this WAS derived from bare-routes — the trackers simply
 * called useIsBareRoute(). An outside review named the failure that sets up: the
 * next bare route, an embeddable widget or a full-screen tool, would silently lose
 * all measurement, and whoever added it would have no reason to suspect they had
 * switched analytics off. Two decisions that happen to agree are still two
 * decisions. Keep the lists apart even while they match.
 *
 * SCOPE, stated honestly. This suppresses the pageview this app sends — the
 * first-party beacon and PostHog's `$pageview`. It does not un-initialise PostHog:
 * the provider is mounted once by the root layout, so bailing before init would
 * break measurement on every route the visitor opens afterwards in that session.
 * Autocapture can therefore still fire on interaction. On /20040303/ there is
 * nothing to interact with — zero links, zero inputs, verified in the build
 * artifact — so the residue is nil in practice, but it is not zero by construction.
 */
const ANALYTICS_EXCLUDED_ROUTES = ["/20040303"];

export function useIsAnalyticsExcluded(): boolean {
  const pathname = usePathname();
  if (!pathname) return false;
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return ANALYTICS_EXCLUDED_ROUTES.includes(normalized);
}
