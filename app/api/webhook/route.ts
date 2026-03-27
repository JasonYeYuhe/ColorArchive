import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/src/lib/stripe";
import { checkoutConfig, proSubscriptionConfig } from "@/src/lib/checkout-config";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const API_URL = process.env.BACKEND_API_URL ?? "https://api.colorarchive.me";
const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET ?? "";

/** Map Stripe price IDs back to product/pack identifiers */
function resolvePriceId(priceId: string): { type: "pack"; packId: string } | { type: "subscription"; plan: "monthly" | "yearly" } | null {
  for (const [packId, cfg] of Object.entries(checkoutConfig)) {
    if (cfg.stripePriceId === priceId) return { type: "pack", packId };
  }
  if (priceId === proSubscriptionConfig.monthly.stripePriceId) return { type: "subscription", plan: "monthly" };
  if (priceId === proSubscriptionConfig.yearly.stripePriceId) return { type: "subscription", plan: "yearly" };
  return null;
}

/** Forward fulfillment events to the backend API (Express on DO) */
async function notifyBackend(path: string, payload: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_SECRET ? { "x-internal-secret": INTERNAL_SECRET } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`Backend ${path} responded ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error(`Failed to notify backend ${path}:`, err);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const email = session.customer_email ?? session.customer_details?.email ?? null;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
      const priceId = lineItems.data[0]?.price?.id ?? "";
      const product = resolvePriceId(priceId);

      console.log(
        `Payment completed: session=${session.id} email=${email} amount=${session.amount_total} product=${JSON.stringify(product)}`
      );

      if (product?.type === "pack") {
        // Fulfill pack purchase: record order + trigger download email via backend
        await notifyBackend("/webhooks/order-completed", {
          sessionId: session.id,
          email,
          packId: product.packId,
          amountTotal: session.amount_total,
          currency: session.currency,
          paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
        });
      } else if (product?.type === "subscription") {
        // Subscription checkout — backend handles pro activation via subscription events
        await notifyBackend("/webhooks/subscription-checkout", {
          sessionId: session.id,
          email,
          plan: product.plan,
          subscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
        });
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? "";
      console.log(
        `Subscription ${event.type}: id=${subscription.id} status=${subscription.status} customer=${customerId}`
      );

      await notifyBackend("/webhooks/subscription-updated", {
        subscriptionId: subscription.id,
        customerId,
        status: subscription.status,
        currentPeriodEnd: (subscription as unknown as Record<string, unknown>).current_period_end ?? null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: subscription.items?.data[0]?.price?.id ?? null,
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? "";
      console.log(`Subscription cancelled: id=${subscription.id} customer=${customerId}`);

      await notifyBackend("/webhooks/subscription-cancelled", {
        subscriptionId: subscription.id,
        customerId,
      });
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
