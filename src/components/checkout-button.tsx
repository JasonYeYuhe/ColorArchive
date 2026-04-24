"use client";

import {
  type ProPlan,
  getCheckoutUrl,
  getCheckoutMode,
  activeProvider,
} from "@/src/lib/checkout-config";
import { track } from "@/src/lib/track";

interface CheckoutButtonProps {
  plan: ProPlan;
  className?: string;
  children: React.ReactNode;
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
}: CheckoutButtonProps) {
  async function handleClick() {
    const mode = getCheckoutMode();

    track("checkout_clicked", { plan, provider: activeProvider, mode });

    if (mode === "redirect") {
      const url = getCheckoutUrl(plan);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        track("checkout_redirected", { plan, provider: activeProvider });
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
      {!isAvailable ? "Coming soon" : children}
    </button>
  );
}
