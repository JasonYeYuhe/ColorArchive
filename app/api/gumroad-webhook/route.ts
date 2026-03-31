import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { checkoutConfig } from "@/src/lib/checkout-config";

const GUMROAD_WEBHOOK_SECRET = process.env.GUMROAD_WEBHOOK_SECRET ?? "";
const API_URL = process.env.BACKEND_API_URL ?? "https://api.colorarchive.me";
const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET ?? "";

/** Map Gumroad product permalink to our pack ID */
function resolveGumroadProduct(
  permalink: string
): string | null {
  // Gumroad short_url ends with /<permalink> — match against our config
  for (const [packId, cfg] of Object.entries(checkoutConfig)) {
    if (cfg.gumroadProductUrl?.includes(permalink)) return packId;
  }
  return null;
}

/** Forward fulfillment to backend. Throws on failure so caller returns 500. */
async function notifyBackend(
  path: string,
  payload: Record<string, unknown>
): Promise<void> {
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

/** Verify Gumroad webhook signature (HMAC SHA-256) */
function verifySignature(body: string, signature: string | null): boolean {
  if (!GUMROAD_WEBHOOK_SECRET || !signature) return false;
  const expected = crypto
    .createHmac("sha256", GUMROAD_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-gumroad-signature");

  // Verify signature if secret is configured
  if (GUMROAD_WEBHOOK_SECRET && !verifySignature(body, signature)) {
    console.error("[gumroad-webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let data: Record<string, string>;
  try {
    // Gumroad sends form-encoded or JSON depending on config
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(body);
      data = Object.fromEntries(params.entries());
    } else {
      data = JSON.parse(body);
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = data.email || data.purchaser_email || null;
  const saleId = data.sale_id || data.order_number || null;
  const productPermalink = data.permalink || data.product_permalink || "";
  const price = data.price || data.sale_price || "0";
  const currency = data.currency?.toLowerCase() || "usd";
  const productName = data.product_name || "";

  const packId = resolveGumroadProduct(productPermalink);

  console.log(
    `[gumroad-webhook] Sale: sale_id=${saleId} email=${email} product=${productName} permalink=${productPermalink} packId=${packId}`
  );

  if (!email || !packId) {
    console.warn(
      `[gumroad-webhook] Skipping — missing email or unrecognized product: email=${email} permalink=${productPermalink}`
    );
    return NextResponse.json({ received: true, skipped: true });
  }

  // Convert price string (e.g. "9.99") to cents/smallest unit
  const amountTotal = Math.round(parseFloat(price) * 100) || 0;

  try {
    await notifyBackend("/webhooks/order-completed", {
      sessionId: saleId,
      email,
      packId,
      amountTotal,
      currency,
      paymentIntent: `gumroad_${saleId}`,
      provider: "gumroad",
    });
  } catch (err) {
    console.error("[gumroad-webhook] Fulfillment failed:", err);
    return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
