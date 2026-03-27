import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/src/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
      console.log(
        `Payment completed: session=${session.id} customer=${session.customer_email} amount=${session.amount_total}`
      );
      // TODO: Fulfill the order — send download email, update user record, etc.
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      console.log(
        `Subscription ${event.type}: id=${subscription.id} status=${subscription.status}`
      );
      // TODO: Update user's pro status in the backend
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      console.log(`Subscription cancelled: id=${subscription.id}`);
      // TODO: Revoke pro access
      break;
    }
    default:
      // Unhandled event type — log and acknowledge
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
