import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/src/lib/stripe";
import { checkoutConfig, proSubscriptionConfig, checkoutFlowConfig, type CheckoutProductId } from "@/src/lib/checkout-config";

const VALID_PRICE_IDS = new Set([
  ...Object.values(checkoutConfig).map((c) => c.stripePriceId),
  proSubscriptionConfig.monthly.stripePriceId,
  proSubscriptionConfig.yearly.stripePriceId,
]);

const SUBSCRIPTION_PRICE_IDS: Set<string> = new Set([
  proSubscriptionConfig.monthly.stripePriceId,
  proSubscriptionConfig.yearly.stripePriceId,
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId } = body as { priceId: string };

    if (!priceId || !VALID_PRICE_IDS.has(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://colorarchive.me";
    const isSubscription = SUBSCRIPTION_PRICE_IDS.has(priceId);

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${checkoutFlowConfig.successPath}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${checkoutFlowConfig.cancelPath}/`,
      ...(isSubscription && proSubscriptionConfig.monthly.trialDays > 0
        ? {
            subscription_data: {
              trial_period_days: proSubscriptionConfig.monthly.trialDays,
            },
          }
        : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
