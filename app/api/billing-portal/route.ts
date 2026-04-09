import { NextRequest, NextResponse } from "next/server";
import { getBillingPortalUrl } from "@/src/lib/checkout-config";

const API_URL = process.env.BACKEND_API_URL ?? "https://api.colorarchive.me";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://colorarchive.me";

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

    // Provider-aware billing portal URL
    const portalUrl = getBillingPortalUrl();
    if (portalUrl) {
      return NextResponse.json({ url: portalUrl });
    }

    // No billing portal configured for current provider
    return NextResponse.json({
      url: `${FRONTEND_URL}/account/?message=manage-subscription`,
    });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
