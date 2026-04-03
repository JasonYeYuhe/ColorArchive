import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";
const API_URL = process.env.BACKEND_API_URL ?? "https://api.colorarchive.me";
const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET ?? "";

/** Verify Lemon Squeezy webhook signature (HMAC SHA-256) */
function verifySignature(body: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

/** Forward events to the backend API (Express on DO). */
async function notifyBackend(path: string, payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(INTERNAL_SECRET ? { "x-internal-secret": INTERNAL_SECRET } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend ${path} responded ${res.status}: ${text}`);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-signature");

  if (!verifySignature(body, signature)) {
    console.error("[ls-webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    meta: { event_name: string; custom_data?: Record<string, string> };
    data: {
      id: string;
      attributes: Record<string, unknown>;
    };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventName = event.meta.event_name;
  const attrs = event.data.attributes;
  const email = (attrs.user_email as string) ?? null;
  const customData = event.meta.custom_data ?? {};

  console.log(`[ls-webhook] Event: ${eventName} email=${email}`);

  try {
    switch (eventName) {
      // Subscription created (monthly/yearly)
      case "subscription_created": {
        const plan = (attrs.variant_name as string)?.toLowerCase().includes("year") ? "yearly" : "monthly";
        await notifyBackend("/webhooks/subscription-checkout", {
          email,
          plan,
          subscriptionId: String(event.data.id),
          provider: "lemonsqueezy",
          customerId: String(attrs.customer_id ?? ""),
          ...customData,
        });
        break;
      }

      // Subscription updated (plan change, renewal)
      case "subscription_updated": {
        await notifyBackend("/webhooks/subscription-updated", {
          subscriptionId: String(event.data.id),
          customerId: String(attrs.customer_id ?? ""),
          status: attrs.status,
          renewsAt: attrs.renews_at ?? null,
          endsAt: attrs.ends_at ?? null,
          provider: "lemonsqueezy",
        });
        break;
      }

      // Subscription cancelled
      case "subscription_cancelled": {
        await notifyBackend("/webhooks/subscription-cancelled", {
          subscriptionId: String(event.data.id),
          customerId: String(attrs.customer_id ?? ""),
          provider: "lemonsqueezy",
        });
        break;
      }

      // Subscription expired (past due, no recovery)
      case "subscription_expired": {
        await notifyBackend("/webhooks/subscription-cancelled", {
          subscriptionId: String(event.data.id),
          customerId: String(attrs.customer_id ?? ""),
          provider: "lemonsqueezy",
          reason: "expired",
        });
        break;
      }

      // Payment events (for analytics / dunning)
      case "subscription_payment_success":
      case "subscription_payment_failed": {
        console.log(`[ls-webhook] Payment ${eventName}: subscription=${event.data.id} customer=${attrs.customer_id}`);
        break;
      }

      // One-time purchase (lifetime Pro)
      case "order_created": {
        const isLifetime = (attrs.first_order_item as Record<string, unknown>)?.variant_name
          ?.toString().toLowerCase().includes("lifetime")
          ?? (attrs.variant_name as string)?.toLowerCase().includes("lifetime")
          ?? false;

        if (isLifetime) {
          await notifyBackend("/webhooks/subscription-checkout", {
            email,
            plan: "lifetime",
            subscriptionId: `lifetime_${event.data.id}`,
            provider: "lemonsqueezy",
            customerId: String(attrs.customer_id ?? ""),
            ...customData,
          });
        }
        break;
      }

      default:
        console.log(`[ls-webhook] Unhandled event: ${eventName}`);
    }
  } catch (err) {
    console.error(`[ls-webhook] Fulfillment failed for ${eventName}:`, err);
    return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
