"use client";

import { useState } from "react";
import { startCheckout } from "@/src/lib/stripe-checkout";

interface StripeCheckoutButtonProps {
  priceId: string;
  className?: string;
  children: React.ReactNode;
}

export function StripeCheckoutButton({
  priceId,
  className,
  children,
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await startCheckout(priceId);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? "Redirecting…" : children}
    </button>
  );
}
