import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL ?? "https://api.colorarchive.me";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://colorarchive.me";
const LS_STORE_SLUG = "colorarchive";

export async function POST(req: NextRequest) {
  try {
    // Authenticate via backend session cookie
    const cookie = req.headers.get("cookie") || "";
    const meRes = await fetch(`${API_URL}/me/subscription`, {
      headers: { cookie },
    });

    if (!meRes.ok) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const subscription = await meRes.json();

    // Lifetime users don't need a billing portal
    if (subscription?.plan === "lifetime") {
      return NextResponse.json({
        url: `${FRONTEND_URL}/account/?message=lifetime-active`,
      });
    }

    // Lemon Squeezy Customer Portal URL
    // LS provides a hosted portal at: https://STORE.lemonsqueezy.com/billing
    // Users manage their subscription there with their email
    if (LS_STORE_SLUG) {
      return NextResponse.json({
        url: `https://${LS_STORE_SLUG}.lemonsqueezy.com/billing`,
      });
    }

    return NextResponse.json({ error: "Billing portal not configured" }, { status: 404 });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
