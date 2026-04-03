"use client";

import { type ProPlan, getCheckoutUrl } from "@/src/lib/checkout-config";

interface CheckoutButtonProps {
  plan: ProPlan;
  className?: string;
  children: React.ReactNode;
}

/**
 * Lemon Squeezy checkout button.
 * Opens the hosted checkout page for the selected Pro plan.
 */
export function CheckoutButton({
  plan,
  className,
  children,
}: CheckoutButtonProps) {
  function handleClick() {
    const url = getCheckoutUrl(plan);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  const url = getCheckoutUrl(plan);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!url}
      className={className}
    >
      {!url ? "Coming soon" : children}
    </button>
  );
}
