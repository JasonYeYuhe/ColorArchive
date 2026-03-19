const { Resend } = require("resend");
const updateBrief = require("./content/update-brief");

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
  const featuredPalette = updateBrief.featuredPalette;
  const featuredPack = updateBrief.featuredPack;
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
      "What these emails will contain:",
      `- ${updateBrief.cadence}`,
      `- one featured collection or palette direction`,
      `- one product or token export update worth checking`,
      "",
      "Current featured collection:",
      `${featuredPalette.title} — ${featuredPalette.summary}`,
      featuredPalette.url,
      "",
      "Current featured pack:",
      `${featuredPack.title} — ${featuredPack.summary}`,
      featuredPack.url,
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
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:16px 18px;margin:20px 0">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#6b7280;font-weight:700">What you will get</div>
          <p style="margin:10px 0 0;color:#4b5563;line-height:1.6">
            ${updateBrief.cadence}<br>
            • one featured collection or palette direction<br>
            • one product or token export update worth checking
          </p>
        </div>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:16px 18px;margin:20px 0">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#9a3412;font-weight:700">Featured collection</div>
          <p style="margin:10px 0 0;color:#7c2d12;line-height:1.6">
            <strong>${featuredPalette.title}</strong><br>
            ${featuredPalette.summary}
          </p>
          <p style="margin:12px 0 0">
            <a href="${featuredPalette.url}" style="color:#9a3412;font-weight:600;text-decoration:none">Open collection</a>
          </p>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:16px 18px;margin:20px 0">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#1d4ed8;font-weight:700">Featured pack</div>
          <p style="margin:10px 0 0;color:#1e3a8a;line-height:1.6">
            <strong>${featuredPack.title}</strong><br>
            ${featuredPack.summary}
          </p>
          <p style="margin:12px 0 0">
            <a href="${featuredPack.url}" style="color:#1d4ed8;font-weight:600;text-decoration:none">Open pack</a>
          </p>
        </div>
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
