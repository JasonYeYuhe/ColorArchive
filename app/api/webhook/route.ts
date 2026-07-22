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

/**
 * Detect the Accessibility Auditor pre-order — a NON-lifetime one-time LS order.
 * Without this, real pre-order payments hit `break` in order_created and are
 * silently dropped (no order row, no receipt, gate numerator stuck at 0).
 *
 * Match ONLY the pre-order so future unrelated one-time products aren't
 * mis-fulfilled as pre-orders. Primary signal: `custom_data.pack_id` set on the
 * checkout link (most robust); fallback: the LS variant / product name.
 */
function isPreorderOrder(
  attrs: Record<string, unknown>,
  customData: Record<string, string>,
): boolean {
  if (customData.pack_id === "preorder-auditor") return true;
  const item = (attrs.first_order_item as Record<string, unknown> | undefined) ?? {};
  // Check ALL candidate name fields, not just the first non-null one: LS may set a
  // single-variant order's variant_name to "Default" while product_name still carries
  // "…Accessibility Auditor — Pre-order". Missing it = a silently dropped paid order.
  const names = [item.variant_name, attrs.variant_name, item.product_name, attrs.product_name]
    .filter((v): v is string => typeof v === "string")
    .map((s) => s.toLowerCase());
  // Never mis-fulfill the lifetime Pro one-time order as a pre-order.
  if (names.some((n) => n.includes("lifetime"))) return false;
  return names.some(
    (n) => n.includes("auditor") || n.includes("pre-order") || n.includes("preorder"),
  );
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
        // NB: a `subscriptions` payload carries NO money fields (total/currency
        // do not exist on it) — the amount arrives via the sibling order_created
        // and later subscription_payment_success events. What it DOES carry is
        // the entitlement clock: status / trial_ends_at / renews_at, which the
        // backend needs so pro_expires_at is never left NULL (failure-open).
        await notifyBackend("/webhooks/subscription-checkout", {
          email,
          plan,
          subscriptionId: String(event.data.id),
          provider: "lemonsqueezy",
          customerId: String(attrs.customer_id ?? ""),
          testMode,
          status: (attrs.status as string) ?? null,
          trialEndsAt: attrs.trial_ends_at ?? null,
          renewsAt: attrs.renews_at ?? null,
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

      // Recurring payment landed — THE money event for months 2..N. The payload
      // is a subscription-invoice: total/currency are in minor units (JPY ×100).
      case "subscription_payment_success": {
        await notifyBackend("/webhooks/subscription-payment", {
          email,
          invoiceId: String(event.data.id),
          subscriptionId: String(attrs.subscription_id ?? ""),
          customerId: String(attrs.customer_id ?? ""),
          amountMinor: typeof attrs.total === "number" ? attrs.total : null,
          currency: (attrs.currency as string) ?? "JPY",
          billingReason: (attrs.billing_reason as string) ?? null,
          provider: "lemonsqueezy",
          testMode,
        });
        break;
      }

      case "subscription_payment_failed": {
        console.log(`[ls-webhook] Payment failed: subscription=${attrs.subscription_id} customer=${attrs.customer_id} test=${testMode}`);
        break;
      }

      // Money reversed or disputed — revoke Pro and flag the order rows.
      case "order_refunded":
      case "subscription_payment_refunded":
      case "dispute_created": {
        await notifyBackend("/webhooks/subscription-revoke", {
          email,
          reason: eventName,
          lsId: String(event.data.id),
          subscriptionId: String(attrs.subscription_id ?? ""),
          customerId: String(attrs.customer_id ?? ""),
          provider: "lemonsqueezy",
          testMode,
        });
        break;
      }

      // Pause/resume: route through subscription-updated so the existing
      // status → tier mapping applies ("paused" is not a pro status; resume
      // restores with the fresh renews_at).
      case "subscription_paused":
      case "subscription_unpaused":
      case "subscription_resumed": {
        await notifyBackend("/webhooks/subscription-updated", {
          subscriptionId: String(event.data.id),
          customerId: String(attrs.customer_id ?? ""),
          status: eventName === "subscription_paused" ? "paused" : ((attrs.status as string) ?? "active"),
          renewsAt: attrs.renews_at ?? null,
          endsAt: attrs.ends_at ?? null,
          provider: "lemonsqueezy",
          testMode,
        });
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
        } else if (isPreorderOrder(attrs, customData)) {
          // Pre-order: record the paid order so it enters the gate numerator and
          // the buyer gets a receipt. paymentIntent carries the real LS order id
          // so backend de-dupes LS retries; attributed_source pins the channel.
          await notifyBackend("/webhooks/order-completed", {
            email,
            packId: "preorder-auditor",
            paymentIntent: String(event.data.id),
            provider: "lemonsqueezy",
            amountTotal: firstAmount,
            currency: firstCurrency,
            testMode,
            attributedSource: "preorder",
          });
        } else {
          // Subscription orders land here (variant "ColorArchive Pro — Monthly/
          // Yearly"): this is the ONLY signup-time payload that carries the real
          // charged amount. Previously it was silently dropped, which made every
          // subscription look like ¥0 forever. Forward it as a payment record;
          // the backend skips the insert when total is 0 (free-trial signup).
          const item = (attrs.first_order_item as Record<string, unknown> | undefined) ?? {};
          const variantName = String(item.variant_name ?? attrs.variant_name ?? "").toLowerCase();
          if (variantName.includes("pro")) {
            await notifyBackend("/webhooks/subscription-payment", {
              email,
              lsOrderId: String(event.data.id),
              customerId: String(attrs.customer_id ?? ""),
              plan: variantName.includes("year") ? "yearly" : "monthly",
              amountMinor: typeof attrs.total === "number" ? attrs.total : null,
              currency: firstCurrency,
              billingReason: "initial",
              provider: "lemonsqueezy",
              testMode,
            });
          } else {
            console.log(`[ls-webhook] order_created unmatched variant: "${variantName}" order=${event.data.id}`);
          }
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
