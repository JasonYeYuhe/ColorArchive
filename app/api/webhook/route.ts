import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";
const API_URL = process.env.BACKEND_API_URL ?? "https://api.colorarchive.org";
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
  const testMode = Boolean(attrs.test_mode);

  console.log(`[ls-webhook] Event: ${eventName} email=${email} test=${testMode}`);

  // Fire-and-forget raw payload capture to the Express raw-log endpoint,
  // so Phase B's validator can replay a real LS payload (not just a
  // synthetic one). Best-effort — failures are swallowed and never
  // affect the LS response.
  notifyBackend("/webhooks/raw-log", {
    event_name: eventName,
    test_mode: testMode,
    raw: body,
  }).catch((err) => {
    console.error("[ls-webhook] raw-log capture failed (non-fatal):", err?.message || err);
  });

  // Pull first-order amount for subscription-created events — LS
  // includes it on the signup event so our receipt email can show
  // the amount charged (or the trial-zero).
  //
  // IMPORTANT: prefer numeric fields (total, subtotal) over
  // price_formatted, which LS ships as a string like "$9.99".
  // Validate with Number.isFinite so a stringly-typed field never
  // propagates to the email template as "null JPY" or "undefined".
  // (Gemini P1, 2026-04-17).
  const orderItem = (attrs.first_order_item as Record<string, unknown> | undefined) ?? {};
  const amountCandidates = [attrs.total, attrs.subtotal, orderItem.total, orderItem.subtotal];
  const firstAmount = amountCandidates.find(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  ) ?? null;
  const firstCurrency =
    (attrs.currency as string | undefined) ??
    (orderItem.currency as string | undefined) ??
    "JPY";

  // Weak card fingerprint for duplicate-subscription detection on the
  // Express side. LS subscription events include card_brand +
  // card_last_four (receipts already expose both; no PCI concern).
  // We concat into a single string; the backend compares + soft-flags.
  const cardBrand = typeof attrs.card_brand === "string" ? attrs.card_brand.toLowerCase() : null;
  const cardLastFour = typeof attrs.card_last_four === "string" ? attrs.card_last_four : null;
  const cardFingerprint = cardBrand && cardLastFour ? `${cardBrand}:${cardLastFour}` : null;

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
          testMode,
          amount: firstAmount,
          currency: firstCurrency,
          cardFingerprint,
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
          testMode,
        });
        break;
      }

      // Subscription cancelled
      case "subscription_cancelled": {
        await notifyBackend("/webhooks/subscription-cancelled", {
          subscriptionId: String(event.data.id),
          customerId: String(attrs.customer_id ?? ""),
          provider: "lemonsqueezy",
          testMode,
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
          testMode,
        });
        break;
      }

      // Payment events (for analytics / dunning)
      case "subscription_payment_success":
      case "subscription_payment_failed": {
        console.log(`[ls-webhook] Payment ${eventName}: subscription=${event.data.id} customer=${attrs.customer_id} test=${testMode}`);
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
            testMode,
            amount: firstAmount,
            currency: firstCurrency,
            cardFingerprint,
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
