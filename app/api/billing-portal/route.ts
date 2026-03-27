import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/src/lib/stripe";

const API_URL = process.env.BACKEND_API_URL ?? "https://api.colorarchive.me";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId } = body as { customerId: string };

    if (!customerId) {
      return NextResponse.json({ error: "Missing customer ID" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://colorarchive.me";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
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
