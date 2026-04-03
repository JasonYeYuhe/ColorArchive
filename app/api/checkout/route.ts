import { NextResponse } from "next/server";

// Checkout sessions are now handled client-side via Lemon Squeezy hosted checkout.
// This route is kept as a stub to avoid 404 if any old client code calls it.

export async function POST() {
  return NextResponse.json(
    { error: "Checkout has moved to Lemon Squeezy. Use the hosted checkout URL instead." },
    { status: 410 }
  );
}
