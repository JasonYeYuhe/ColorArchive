/**
 * Who redeems a magic-link token: this browser, or the iOS app.
 *
 * Tokens are single-use. Until 2026-09-17 /login tried `colorarchive://` on every
 * mobile visit, waited 1.5 s, then redeemed the token here. iOS asks "Open in
 * ColorArchive?" before switching apps, so the browser always won the race and the
 * app got "Invalid or expired login link" — on 2026-09-16 that left a customer
 * logged out of the app when they bought Pro in it, and the purchase reached no
 * account. The server now tags links requested from the app (`app=ios`, see
 * server/login-link.js); only those are offered to the app, and nothing redeems
 * them here until the visitor chooses this browser.
 */

export type MagicLinkPlan = "verify-here" | "offer-app";

export function planMagicLink(requestedFrom: string | null, choseBrowser: boolean): MagicLinkPlan {
  return requestedFrom === "ios" && !choseBrowser ? "offer-app" : "verify-here";
}

export function appLoginHref(token: string): string {
  return `colorarchive://login?token=${encodeURIComponent(token)}`;
}

/** Only an iPhone/iPad can take the automatic hand-off; elsewhere the buttons stay. */
export function canOpenIosApp(userAgent: string): boolean {
  return /iPhone|iPad|iPod/i.test(userAgent);
}
