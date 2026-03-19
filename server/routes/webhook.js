const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");
const { findCatalogProduct, getDownloadUrl } = require("../catalog");
const { sendOrderConfirmationEmail } = require("../email");

// Verify Lemon Squeezy webhook signature
function verifySignature(rawBody, signature) {
  const secret = process.env.LS_WEBHOOK_SECRET;
  if (!secret) return true; // skip in dev if not set
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

// POST /webhook/ls
// Receives raw body (must be parsed as raw before this route)
router.post("/ls", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["x-signature"];
  if (!verifySignature(req.body, signature || "")) {
    return res.status(401).send("Invalid signature");
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).send("Bad JSON");
  }

  const event = payload.meta?.event_name;

  if (event === "order_created") {
    const order = payload.data?.attributes;
    if (!order) return res.sendStatus(200);

    const email = order.user_email;
    const productName = order.first_order_item?.product_name ?? "your pack";
    const orderId = String(payload.data?.id ?? "");
    const receiptUrl = order.receipt || null;
    const matchedProduct = findCatalogProduct(productName);
    const downloadUrl = getDownloadUrl(productName) || receiptUrl || "https://colorarchive.me/packs";
    const subscriberAttribution = db
      .prepare(
        `
          SELECT source, utm_source, utm_medium, utm_campaign, landing_path
          FROM subscribers
          WHERE lower(email) = lower(?)
        `,
      )
      .get(email);

    // Persist order
    try {
      db.prepare(
        `
          INSERT OR IGNORE INTO orders (
            ls_order_id,
            email,
            product,
            amount,
            currency,
            pack_id,
            download_url,
            receipt_url,
            attributed_source,
            attributed_utm_source,
            attributed_utm_medium,
            attributed_utm_campaign,
            attributed_landing_path
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      ).run(
        orderId,
        email,
        productName,
        order.total ?? 0,
        order.currency ?? "USD",
        matchedProduct?.packId ?? null,
        downloadUrl,
        receiptUrl,
        subscriberAttribution?.source ?? null,
        subscriberAttribution?.utm_source ?? null,
        subscriberAttribution?.utm_medium ?? null,
        subscriberAttribution?.utm_campaign ?? null,
        subscriberAttribution?.landing_path ?? null,
      );

      // Also add buyer to subscribers list
      db.prepare(
        "INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)"
      ).run(email, "purchase");
    } catch (err) {
      console.error("DB error:", err);
    }

    // Send confirmation email (don't await — respond to LS immediately)
    sendOrderConfirmationEmail(email, { productName, downloadUrl, orderId }).catch(
      (err) => console.error("email error:", err)
    );
  }

  res.sendStatus(200);
});

module.exports = router;
