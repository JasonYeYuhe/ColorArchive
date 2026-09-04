/**
 * The iOS companion app on the App Store.
 *
 * 🔴 Verified live on 2026-09-05 (do NOT hand-edit this without re-checking):
 *   curl -sIL -o /dev/null -w '%{http_code} %{url_effective}\n' https://apps.apple.com/app/id6761363087
 *   → 200  https://apps.apple.com/us/app/colorarchive-color-tools/id6761363087
 *   curl -s 'https://itunes.apple.com/lookup?id=6761363087&country=us'
 *   → trackName "ColorArchive - Color Tools", Free, Graphics & Design, minimumOsVersion 17.0
 *
 * The id-only form is deliberate. The storefront segment (`/us/`) and the name slug are
 * added by Apple's own redirect based on the VIEWER's storefront — hard-coding `/us/`
 * would send everyone else through an extra hop, and hard-coding a slug rots the moment
 * the listing is renamed. A wrong slug still resolves; a wrong id 404s.
 */
export const APP_STORE_URL = "https://apps.apple.com/app/id6761363087";

/** Facts from the live listing, used in copy. Keep in step with the lookup API above. */
export const IOS_APP = {
  name: "ColorArchive - Color Tools",
  price: "Free",
  category: "Graphics & Design",
  minimumOS: "iOS 17.0",
} as const;
