"use client";

import {
  type ProPlan,
  getCheckoutUrl,
  getCheckoutMode,
  activeProvider,
} from "@/src/lib/checkout-config";
import { track } from "@/src/lib/track";
import { reportAdsConversion } from "@/src/lib/google-ads";

interface CheckoutButtonProps {
  plan: ProPlan;
  className?: string;
  children: React.ReactNode;
  /**
   * What to show when this plan has no usable checkout URL. The default
   * "Coming soon" is right for a product that does not exist yet; it is WRONG
   * for one that exists and is merely unlinked (yearly / lifetime while their
   * NEXT_PUBLIC_PRO_*_CHECKOUT_URL is unset), where the honest statement is
   * that it cannot be bought right now. See src/lib/checkout-config.ts.
   */
  unavailableLabel?: string;
}

/**
 * Provider-aware checkout button.
 *
 * - redirect mode (LS/Paddle): opens hosted checkout in new tab
 * - server-session mode (PayPal): POST to /api/checkout, then redirect
 * - none: shows "Coming soon"
 *
 * Funnel events emitted (consumed by /admin/funnel + /events/summary):
 * - `checkout_clicked`   — user pressed the button (any provider)
 * - `checkout_redirected` — hosted checkout tab actually opened
 * - `checkout_failed`    — server-session POST errored
 * Use these to compute click → opened-hosted-page → completed-purchase ratios.
 */
export function CheckoutButton({
  plan,
  className,
  children,
  unavailableLabel = "Coming soon",
}: CheckoutButtonProps) {
  async function handleClick() {
    const mode = getCheckoutMode();

    track("checkout_clicked", { plan, provider: activeProvider, mode });
    // Secondary/observation-only signal. This account will never see enough
    // PURCHASES to train Smart Bidding (3 in the site's history), so a
    // higher-volume upstream step gives the campaign something to learn from.
    // Mark it secondary in Google Ads — optimising toward a button press rather
    // than a payment is how an account learns to buy clicks that never convert.
    reportAdsConversion("checkout_click");

    if (mode === "redirect") {
      const url = getCheckoutUrl(plan);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        track("checkout_redirected", { plan, provider: activeProvider });
      } else {
        // Unreachable while the button is disabled, and deliberately loud if a
        // future change ever re-enables it: a press that opens nothing must be
        // visible in the funnel, not a silent no-op. It must NEVER fall back to
        // the shared picker — that is the bug that charged id41 monthly for a
        // yearly press (see checkout-config.ts).
        track("checkout_failed", { plan, provider: activeProvider, reason: "no_variant_url" });
      }
    } else if (mode === "server-session") {
      // PayPal: create session server-side, then redirect
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, provider: activeProvider }),
        });
        const data = await res.json();
        if (data.url) {
          track("checkout_redirected", { plan, provider: activeProvider });
          window.location.href = data.url;
        } else {
          track("checkout_failed", { plan, provider: activeProvider, reason: "no_url" });
        }
      } catch (err) {
        console.error("Checkout session error:", err);
        track("checkout_failed", { plan, provider: activeProvider, reason: "fetch_error" });
      }
    }
  }

  const url = getCheckoutUrl(plan);
  const mode = getCheckoutMode();
  const isAvailable = mode === "server-session" || !!url;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isAvailable}
      className={className}
    >
      {!isAvailable ? unavailableLabel : children}
    </button>
  );
}
