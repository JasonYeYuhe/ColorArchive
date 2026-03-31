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

  const useGumroad = activeProvider === "Gumroad" && !!gumroadUrl;

  async function handleClick() {
    if (useGumroad) {
      window.open(gumroadUrl!, "_blank", "noopener,noreferrer");
      return;
    }

    // Stripe checkout (primary or fallback when no Gumroad URL)
    setLoading(true);
    try {
      await startCheckout(priceId);
    } catch {
      setLoading(false);
    }
  }

  const disabled = loading;

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
