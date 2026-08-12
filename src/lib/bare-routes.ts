"use client";

import { usePathname } from "next/navigation";

/**
 * Routes that render on their own, with none of the site chrome.
 *
 * app/layout.tsx is the only layout — Next's root layout owns <html> and <body>,
 * so a route cannot opt out of it by nesting. Everything it mounts (footer,
 * back-to-top, palette tray, upsell toast, launch banner) therefore appears on
 * every page, including ones that are not product surfaces.
 *
 * That was fine until /20040303/, which is a private page one person made for
 * another. It was rendering a 320px marketing footer underneath: fourteen nav
 * pills, a commerce-disclosure link, and a floating back-to-top button, directly
 * after the page's own closing line. The page's subtree has zero links; the
 * document had twenty-one.
 *
 * So the chrome asks instead of assuming. Keep this list short — a route belongs
 * here only if the site's own furniture would be wrong on it, not merely
 * unwanted.
 */
const BARE_ROUTES = ["/20040303"];

export function useIsBareRoute(): boolean {
  const pathname = usePathname();
  if (!pathname) return false;
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return BARE_ROUTES.includes(normalized);
}
