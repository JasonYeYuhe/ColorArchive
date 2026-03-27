"use client";

/**
 * Client-side helper to initiate Stripe Checkout.
 * Calls our API to create a Checkout Session, then redirects.
 */
export async function startCheckout(priceId: string): Promise<void> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Checkout failed");
  }

  const { url } = await res.json();
  if (url) {
    window.location.href = url;
  }
}
