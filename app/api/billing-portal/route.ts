import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/src/lib/stripe";

const API_URL = process.env.BACKEND_API_URL ?? "https://api.colorarchive.me";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://colorarchive.me";

export async function POST(req: NextRequest) {
  try {
    // Forward the user's session cookie to the backend to authenticate
    const cookie = req.headers.get("cookie") || "";
    const meRes = await fetch(`${API_URL}/me/subscription`, {
      headers: { cookie },
    });

    if (!meRes.ok) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const subscription = await meRes.json();

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const origin = FRONTEND_URL;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/account/`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
