const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.me";

// Free pack download email
async function sendFreePackEmail(to) {
  const result = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: "Your ColorArchive palette pack is ready",
    text: [
      "Your palette pack is ready",
      "",
      "Thanks for your interest in ColorArchive.",
      "",
      "Download your palette pack here:",
      "https://colorarchive.me/downloads/free-palette-pack.zip",
      "",
      "The pack includes 3 curated palettes with CSS variables and PNG swatches.",
      "",
      "— ColorArchive",
      "https://colorarchive.me",
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">Your palette pack is ready</h2>
        <p>Thanks for your interest in ColorArchive.</p>
        <p>
          <a href="https://colorarchive.me/downloads/free-palette-pack.zip"
             style="display:inline-block;background:#1a1a1a;color:#fff;
                    padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Download Palette Pack
          </a>
        </p>
        <p style="color:#666;font-size:14px">
          The pack includes 3 curated palettes with CSS variables and PNG swatches.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">
          ColorArchive · <a href="https://colorarchive.me" style="color:#999">colorarchive.me</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (free pack):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

// Product updates / waitlist confirmation email
async function sendWaitlistConfirmationEmail(to) {
  const result = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: "You are on the ColorArchive updates list",
    text: [
      "You are on the ColorArchive updates list",
      "",
      "Thanks for following ColorArchive.",
      "",
      "Current status:",
      "- 6 palette packs are live now on Lemon Squeezy",
      "- the free sample pack is still available",
      "- future drops, seasonal packs, and archive updates will be announced here",
      "",
      "Useful links:",
      "Packs: https://colorarchive.me/packs",
      "Free sample: https://colorarchive.me/free-pack",
      "Updates: https://colorarchive.me/updates",
      "",
      "Questions? Reply to this email.",
      "",
      "— ColorArchive",
      "https://colorarchive.me",
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">You are on the ColorArchive updates list</h2>
        <p>Thanks for following ColorArchive.</p>
        <p style="color:#444;line-height:1.6">
          Current status:<br>
          • 6 palette packs are live now on Lemon Squeezy<br>
          • the free sample pack is still available<br>
          • future drops, seasonal packs, and archive updates will be announced here
        </p>
        <p style="margin:20px 0">
          <a href="https://colorarchive.me/packs"
             style="display:inline-block;background:#1a1a1a;color:#fff;
                    padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Browse Live Packs
          </a>
        </p>
        <p style="color:#666;font-size:14px">
          You can also grab the free sample here:
          <a href="https://colorarchive.me/free-pack">colorarchive.me/free-pack</a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">
          Questions? Reply to this email. · ColorArchive ·
          <a href="https://colorarchive.me" style="color:#999">colorarchive.me</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (waitlist):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

// Order confirmation email after LS purchase
async function sendOrderConfirmationEmail(to, { productName, downloadUrl, orderId }) {
  const result = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    to,
    subject: `Your ${productName} download is ready`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">Thanks for your purchase</h2>
        <p>Your <strong>${productName}</strong> is ready to download.</p>
        <p>
          <a href="${downloadUrl}"
             style="display:inline-block;background:#1a1a1a;color:#fff;
                    padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Download Now
          </a>
        </p>
        <p style="color:#666;font-size:14px">
          Order ID: ${orderId}. This link is unique to your order.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">
          Questions? Reply to this email. · ColorArchive ·
          <a href="https://colorarchive.me" style="color:#999">colorarchive.me</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (order):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

module.exports = {
  sendFreePackEmail,
  sendOrderConfirmationEmail,
  sendWaitlistConfirmationEmail,
};
