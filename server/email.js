const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.me";

// Free pack download email
async function sendFreePackEmail(to) {
  return resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    to,
    subject: "Your free ColorArchive palette pack",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">Your free palette pack is ready</h2>
        <p>Thanks for grabbing the free pack from ColorArchive.</p>
        <p>
          <a href="https://colorarchive.me/downloads/free-palette-pack.zip"
             style="display:inline-block;background:#1a1a1a;color:#fff;
                    padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Download Free Pack
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
}

// Order confirmation email after LS purchase
async function sendOrderConfirmationEmail(to, { productName, downloadUrl, orderId }) {
  return resend.emails.send({
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
}

module.exports = { sendFreePackEmail, sendOrderConfirmationEmail };
