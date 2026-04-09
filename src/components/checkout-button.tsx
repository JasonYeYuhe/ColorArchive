"use client";

import {
  type ProPlan,
  getCheckoutUrl,
  getCheckoutMode,
  activeProvider,
} from "@/src/lib/checkout-config";

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
 */
export function CheckoutButton({
  plan,
  className,
  children,
}: CheckoutButtonProps) {
  async function handleClick() {
    const mode = getCheckoutMode();

    if (mode === "redirect") {
      const url = getCheckoutUrl(plan);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
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
          window.location.href = data.url;
        }
      } catch (err) {
        console.error("Checkout session error:", err);
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
