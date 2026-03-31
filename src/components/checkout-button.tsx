"use client";

import { useState } from "react";
import { activeProvider } from "@/src/lib/checkout-config";
import { startCheckout } from "@/src/lib/stripe-checkout";

interface CheckoutButtonProps {
  priceId: string;
  gumroadUrl: string | null;
  className?: string;
  children: React.ReactNode;
}

/**
 * Provider-agnostic checkout button.
 * Renders a Stripe or Gumroad checkout flow based on `activeProvider`.
 */
export function CheckoutButton({
  priceId,
  gumroadUrl,
  className,
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (activeProvider === "Gumroad" && gumroadUrl) {
      window.open(gumroadUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Fallback to Stripe
    setLoading(true);
    try {
      await startCheckout(priceId);
    } catch {
      setLoading(false);
    }
  }

  const disabled = activeProvider === "Gumroad" ? !gumroadUrl : loading;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {loading ? "Redirecting…" : children}
    </button>
  );
}
