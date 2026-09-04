"use client";

import { track } from "@/src/lib/track";
import { APP_STORE_URL } from "@/src/lib/app-store";

/**
 * The only way this site links to the App Store.
 *
 * Two deliberate choices:
 *
 *  1. **Text link, not Apple's badge.** There are no badge assets in `public/`, and the
 *     badge is trademark-controlled artwork with clear-space and minimum-size rules that
 *     cannot be satisfied by a hand-drawn SVG. A text link has no such dependency.
 *
 *  2. **The click event is the only event.** Rendering this fires nothing — W1 is live on
 *     the guides until ~2026-10-12 and no page-load event may be added anywhere. So a
 *     readout of `app_store_click` measures clicks and nothing else.
 *
 * `surface` is what makes the four placements separable in the readout, so every call
 * site must pass a distinct one.
 */
export function AppStoreLink({
  surface,
  label = "Get the iOS app",
  className,
}: {
  surface: "ios_page" | "footer" | "homepage" | "word_to_color" | "privacy";
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("app_store_click", { surface })}
      className={className}
    >
      {label}
    </a>
  );
}
