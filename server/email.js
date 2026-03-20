const { Resend } = require("resend");
const updateBrief = require("./content/update-brief");
const newsletterIssues = require("../src/data/newsletter-issues.json");

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
      "Want the full library? The All Access Bundle includes every pack — all 2016 colors, dark mode pairings, brand kits, and more — in one download for ¥2,799.",
      "https://colorarchive.me/packs/all-access-bundle/",
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
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:16px;padding:16px 18px;margin:20px 0">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#14532d;font-weight:700">Want the full library?</div>
          <p style="margin:10px 0 0;color:#166534;line-height:1.6;font-size:14px">
            The <strong>All Access Bundle</strong> includes every pack — all 2016 colors, dark mode pairings, brand kits, and more — in one download for <strong>¥2,799</strong>.
          </p>
          <p style="margin:12px 0 0">
            <a href="https://colorarchive.me/packs/all-access-bundle/"
               style="color:#14532d;font-weight:600;font-size:13px;text-decoration:none">View All Access Bundle →</a>
          </p>
        </div>
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
  const latestIssue = newsletterIssues[0];
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
      "- all packs are live and available at colorarchive.me/packs",
      "- the free sample pack is available at colorarchive.me/free-pack",
      "- seasonal releases and archive updates will be announced here",
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
      latestIssue
        ? `Latest note: ${latestIssue.title} — https://colorarchive.me/notes/${latestIssue.slug}`
        : null,
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
          • all packs are live at <a href="https://colorarchive.me/packs/" style="color:#374151">colorarchive.me/packs</a><br>
          • the free sample pack is available at <a href="https://colorarchive.me/free-pack/" style="color:#374151">colorarchive.me/free-pack</a><br>
          • seasonal releases and archive updates will be announced here
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
        ${
          latestIssue
            ? `<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:16px;padding:16px 18px;margin:20px 0">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#6d28d9;font-weight:700">Latest note</div>
          <p style="margin:10px 0 0;color:#5b21b6;line-height:1.6">
            <strong>${latestIssue.title}</strong><br>
            ${latestIssue.summary}
          </p>
          <p style="margin:12px 0 0">
            <a href="https://colorarchive.me/notes/${latestIssue.slug}" style="color:#6d28d9;font-weight:600;text-decoration:none">Read the note</a>
          </p>
        </div>`
            : ""
        }
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

// Magic link login email
async function sendMagicLinkEmail(to, { loginUrl, expiresInMinutes }) {
  const result = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: "Your ColorArchive sign-in link",
    text: [
      "Your ColorArchive sign-in link",
      "",
      "Use the link below to sign in and sync your saved colors and palettes across devices.",
      "",
      loginUrl,
      "",
      `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
      "",
      "If you did not request this email, you can ignore it.",
      "",
      "— ColorArchive",
      "https://colorarchive.me",
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">Your ColorArchive sign-in link</h2>
        <p>Use this link to sign in and sync your saved colors and palettes across devices.</p>
        <p>
          <a href="${loginUrl}"
             style="display:inline-block;background:#1a1a1a;color:#fff;
                    padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Sign In to ColorArchive
          </a>
        </p>
        <p style="color:#666;font-size:14px">
          This link expires in ${expiresInMinutes} minutes and can only be used once.
        </p>
        <p style="color:#666;font-size:14px">
          If you did not request this email, you can safely ignore it.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">
          ColorArchive · <a href="https://colorarchive.me" style="color:#999">colorarchive.me</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (magic link):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

// Order confirmation email after LS purchase
async function sendOrderConfirmationEmail(to, { productName, downloadUrl, orderId, amount, currency }) {
  const formattedAmount = amount
    ? (currency === "JPY" ? `¥${amount.toLocaleString()}` : `$${(amount / 100).toFixed(2)}`)
    : null;
  const orderDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const result = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: `Your ${productName} download is ready`,
    text: [
      `Your ${productName} is ready`,
      "",
      "Thanks for your purchase from ColorArchive.",
      "",
      "Order details:",
      `  Product: ${productName}`,
      formattedAmount ? `  Amount: ${formattedAmount} ${currency}` : null,
      `  Order ID: ${orderId}`,
      `  Date: ${orderDate}`,
      "",
      "Download your files:",
      downloadUrl,
      "",
      "This download link is unique to your order and does not expire.",
      "",
      "What's in the ZIP:",
      "  - CSS variables (copy-paste ready)",
      "  - Tailwind CSS 4 theme tokens",
      "  - JSON data (hex, RGB, HSL for every color)",
      "  - Usage notes with examples",
      "",
      "Quick start:",
      '  1. Unzip the downloaded file',
      '  2. Open the CSS file and copy the :root { ... } block',
      "  3. Paste it into your stylesheet — you're done",
      "",
      "Need help? Reply to this email.",
      "",
      "— ColorArchive",
      "https://colorarchive.me",
    ].filter(Boolean).join("\n"),
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <div style="text-align:center;padding:32px 0 24px">
          <div style="font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:#6b7280;font-weight:600">Order Confirmation</div>
          <h1 style="margin:12px 0 0;font-size:24px;font-weight:700;color:#111">Your ${escapeHtml(productName)} is ready</h1>
        </div>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:20px 22px;margin:0 0 20px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:6px 0;color:#6b7280">Product</td>
              <td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(productName)}</td>
            </tr>
            ${formattedAmount ? `<tr>
              <td style="padding:6px 0;color:#6b7280">Amount</td>
              <td style="padding:6px 0;text-align:right;font-weight:600">${formattedAmount}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:6px 0;color:#6b7280">Order ID</td>
              <td style="padding:6px 0;text-align:right;font-family:ui-monospace,monospace;font-size:12px">${escapeHtml(orderId)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280">Date</td>
              <td style="padding:6px 0;text-align:right">${orderDate}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280">Delivery</td>
              <td style="padding:6px 0;text-align:right;color:#059669;font-weight:600">Instant download</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin:28px 0">
          <a href="${downloadUrl}"
             style="display:inline-block;background:#111;color:#fff;
                    padding:14px 32px;border-radius:8px;text-decoration:none;
                    font-weight:700;font-size:15px;letter-spacing:0.3px">
            Download Your Files
          </a>
          <p style="margin:10px 0 0;font-size:12px;color:#9ca3af">
            This link is unique to your order and does not expire.
          </p>
        </div>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:18px 20px;margin:24px 0">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#166534;font-weight:700;margin-bottom:10px">Quick start</div>
          <ol style="margin:0;padding-left:18px;color:#15803d;line-height:1.8;font-size:14px">
            <li>Unzip the downloaded file</li>
            <li>Open the CSS file and copy the <code style="background:#dcfce7;padding:2px 6px;border-radius:4px">:root { … }</code> block</li>
            <li>Paste into your stylesheet — done</li>
          </ol>
          <p style="margin:12px 0 0;font-size:13px;color:#166534">
            The JSON file works in Figma too — import it as a token set.
          </p>
        </div>

        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:18px 20px;margin:24px 0">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:10px">What's in the ZIP</div>
          <ul style="margin:0;padding-left:18px;color:#1e40af;line-height:1.8;font-size:14px">
            <li>CSS variables (copy-paste ready)</li>
            <li>Tailwind CSS 4 theme tokens</li>
            <li>JSON data (hex, RGB, HSL for every color)</li>
            <li>Usage notes with examples</li>
          </ul>
        </div>

        <div style="text-align:center;margin:28px 0">
          <p style="color:#6b7280;font-size:14px;margin:0 0 12px">Explore more from ColorArchive</p>
          <a href="https://colorarchive.me/packs/" style="color:#1d4ed8;font-weight:600;font-size:14px;text-decoration:none;margin:0 8px">All packs</a>
          <span style="color:#d1d5db">·</span>
          <a href="https://colorarchive.me/collections/" style="color:#1d4ed8;font-weight:600;font-size:14px;text-decoration:none;margin:0 8px">Collections</a>
          <span style="color:#d1d5db">·</span>
          <a href="https://colorarchive.me/free-pack/" style="color:#1d4ed8;font-weight:600;font-size:14px;text-decoration:none;margin:0 8px">Free pack</a>
        </div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0">
        <div style="text-align:center;padding-bottom:24px">
          <p style="color:#9ca3af;font-size:12px;margin:0 0 4px">
            Questions? Reply to this email anytime.
          </p>
          <p style="color:#9ca3af;font-size:12px;margin:0">
            ColorArchive · <a href="https://colorarchive.me" style="color:#9ca3af">colorarchive.me</a>
          </p>
        </div>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (order):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Day-3 follow-up: how to use CSS tokens
async function sendFollowUp3DayEmail(to) {
  const result = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: "How to use your ColorArchive palette in code",
    text: [
      "A quick tip from ColorArchive",
      "",
      "A few days ago you grabbed the free palette pack. Here's the quickest way to drop it into a real project:",
      "",
      "1. Open the CSS file from your download.",
      "2. Paste the :root { ... } block at the top of your stylesheet.",
      "3. Use the variables anywhere: color: var(--palette-1-core);",
      "",
      "That's it. The JSON file works the same way in Figma — import it as a token set.",
      "",
      "If you want pre-tested dark/light pairings and Tailwind config out of the box, the Dark Mode UI Kit has that covered:",
      "https://colorarchive.me/packs/dark-mode-ui-kit/",
      "",
      "— ColorArchive",
      "https://colorarchive.me",
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">How to use your palette in code</h2>
        <p style="color:#444;line-height:1.6">A few days ago you grabbed the free palette pack. Here's the quickest way to drop it into a real project:</p>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:16px 18px;margin:20px 0">
          <ol style="margin:0;padding-left:18px;color:#374151;line-height:1.8">
            <li>Open the <strong>CSS file</strong> from your download.</li>
            <li>Paste the <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px">:root { … }</code> block at the top of your stylesheet.</li>
            <li>Use the variables anywhere: <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px">color: var(--palette-1-core);</code></li>
          </ol>
        </div>
        <p style="color:#444;line-height:1.6">The <strong>JSON file</strong> works the same way in Figma — import it as a token set.</p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:16px 18px;margin:20px 0">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#1d4ed8;font-weight:700">Want pre-tested dark/light pairs?</div>
          <p style="margin:10px 0 0;color:#1e3a8a;line-height:1.6">
            The <strong>Dark Mode UI Kit</strong> ships contrast-checked light and dark pairings with CSS variables, Figma tokens, and Tailwind config ready to use.
          </p>
          <p style="margin:12px 0 0">
            <a href="https://colorarchive.me/packs/dark-mode-ui-kit/"
               style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
              View Dark Mode UI Kit
            </a>
          </p>
        </div>
        <p style="color:#666;font-size:14px">
          Browse all packs: <a href="https://colorarchive.me/packs/" style="color:#444">colorarchive.me/packs</a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">
          ColorArchive · <a href="https://colorarchive.me" style="color:#999">colorarchive.me</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (follow-up day 3):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

// Day-7 follow-up: pack discovery
async function sendFollowUp7DayEmail(to) {
  const result = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: "ColorArchive catalog preview — find the pack that fits your project",
    text: [
      "Find the right ColorArchive pack for your project",
      "",
      "You've had the free pack for a week. Here's a quick guide to the paid packs in case one fits:",
      "",
      "Seasonal: Spring 2026 (¥99) — Limited edition seasonal palettes with mood notes.",
      "https://colorarchive.me/packs/seasonal-spring-2026/",
      "",
      "Palette Pack Vol. 1 (¥299) — Best starter pack. 8 curated palettes, CSS + Tailwind tokens.",
      "https://colorarchive.me/packs/palette-pack-vol-1/",
      "",
      "Dark Mode UI Kit (¥499) — Pre-tested light/dark pairings, contrast-checked, Tailwind ready.",
      "https://colorarchive.me/packs/dark-mode-ui-kit/",
      "",
      "Creator Bundle (¥799) — Social-ready palette boards + wallpaper sets for visual content.",
      "https://colorarchive.me/packs/content-creator-bundle/",
      "",
      "Brand Starter Kit (¥999) — Primary + secondary + accent groups for landing pages and brands.",
      "https://colorarchive.me/packs/brand-starter-kit/",
      "",
      "Complete Archive Token Set (¥1,499) — All 2016 colors as CSS, JSON, Tailwind, Figma tokens.",
      "https://colorarchive.me/packs/complete-archive/",
      "",
      "All Access Bundle (¥2,799) — Everything above in one download. Save 32%.",
      "https://colorarchive.me/packs/all-access-bundle/",
      "",
      "Questions? Reply here.",
      "",
      "— ColorArchive",
      "https://colorarchive.me",
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">Find the right pack for your project</h2>
        <p style="color:#444;line-height:1.6">You've had the free pack for a week. Here's a quick guide to the paid packs in case one fits what you're building:</p>
        ${[
          { id: "seasonal-spring-2026", title: "Seasonal: Spring 2026", price: "¥99", desc: "Limited edition seasonal palettes with mood notes.", bg: "#fdf4ff", border: "#e9d5ff", titleColor: "#7e22ce", textColor: "#6b21a8" },
          { id: "palette-pack-vol-1", title: "Palette Pack Vol. 1", price: "¥299", desc: "Best starter pack. 8 curated palettes, CSS + Tailwind tokens.", bg: "#f0fdf4", border: "#bbf7d0", titleColor: "#14532d", textColor: "#166534" },
          { id: "dark-mode-ui-kit", title: "Dark Mode UI Kit", price: "¥499", desc: "Pre-tested light/dark pairings, contrast-checked, Tailwind ready.", bg: "#f5f3ff", border: "#ddd6fe", titleColor: "#6d28d9", textColor: "#5b21b6" },
          { id: "content-creator-bundle", title: "Creator Bundle", price: "¥799", desc: "Social-ready palette boards and wallpaper sets for visual content.", bg: "#fff7ed", border: "#fed7aa", titleColor: "#9a3412", textColor: "#7c2d12" },
          { id: "brand-starter-kit", title: "Brand Color Starter Kit", price: "¥999", desc: "Primary + secondary + accent groups for landing pages and brands.", bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1d4ed8", textColor: "#1e3a8a" },
          { id: "complete-archive", title: "Complete Archive Token Set", price: "¥1,499", desc: "All 2016 colors as CSS, JSON, Tailwind, and Figma tokens.", bg: "#fafafa", border: "#e5e7eb", titleColor: "#111827", textColor: "#374151" },
          { id: "all-access-bundle", title: "All Access Bundle", price: "¥2,799", desc: "Everything above in one download. Save 32%.", bg: "#f0fdf4", border: "#86efac", titleColor: "#14532d", textColor: "#166534" },
        ].map(p => `
        <div style="background:${p.bg};border:1px solid ${p.border};border-radius:16px;padding:14px 16px;margin:12px 0">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <strong style="color:${p.titleColor}">${p.title}</strong>
            <span style="color:${p.titleColor};font-size:13px;font-weight:700">${p.price}</span>
          </div>
          <p style="margin:8px 0 10px;color:${p.textColor};font-size:14px;line-height:1.5">${p.desc}</p>
          <a href="https://colorarchive.me/packs/${p.id}/" style="color:${p.titleColor};font-weight:600;font-size:13px;text-decoration:none">View pack →</a>
        </div>`).join("")}
        <p style="color:#666;font-size:14px;margin-top:20px">Questions? Just reply to this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">
          ColorArchive · <a href="https://colorarchive.me" style="color:#999">colorarchive.me</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (follow-up day 7):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

// Day-14 follow-up: limited time offer with FIRSTPACK discount
async function sendFollowUp14DayEmail(to) {
  const result = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: "10% off your first ColorArchive pack — code FIRSTPACK",
    text: [
      "A small thank-you for sticking around",
      "",
      "You downloaded the free palette pack two weeks ago. If you've been thinking about upgrading, here's a nudge:",
      "",
      "Use code FIRSTPACK at checkout for 10% off any pack.",
      "",
      "A few popular picks:",
      "",
      "Palette Pack Vol. 1 (¥299 → ¥269) — 8 curated palettes, CSS + Tailwind tokens.",
      "https://colorarchive.me/packs/palette-pack-vol-1/",
      "",
      "Dark Mode UI Kit (¥499 → ¥449) — Pre-tested light/dark pairings, Tailwind ready.",
      "https://colorarchive.me/packs/dark-mode-ui-kit/",
      "",
      "All Access Bundle (¥2,799 → ¥2,519) — Every pack in one download.",
      "https://colorarchive.me/packs/all-access-bundle/",
      "",
      "The code is valid for 7 days.",
      "",
      "— ColorArchive",
      "https://colorarchive.me",
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">A small thank-you for sticking around</h2>
        <p style="color:#444;line-height:1.6">You downloaded the free palette pack two weeks ago. If you've been thinking about upgrading, here's a nudge:</p>

        <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:16px;padding:18px 20px;margin:20px 0;text-align:center">
          <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#92400e;font-weight:700">Your discount code</div>
          <div style="font-size:28px;font-weight:800;color:#78350f;letter-spacing:2px;margin:8px 0">FIRSTPACK</div>
          <p style="margin:4px 0 0;color:#92400e;font-size:14px">10% off any pack · Valid for 7 days</p>
        </div>

        <p style="color:#444;font-size:14px;font-weight:600;margin:20px 0 12px">Popular picks:</p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:14px 16px;margin:12px 0">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <strong style="color:#14532d">Palette Pack Vol. 1</strong>
            <span style="color:#14532d;font-size:13px"><s style="color:#9ca3af">¥299</s> <strong>¥269</strong></span>
          </div>
          <p style="margin:8px 0 10px;color:#166534;font-size:14px;line-height:1.5">8 curated palettes with CSS variables and Tailwind tokens.</p>
          <a href="https://colorarchive.me/packs/palette-pack-vol-1/" style="color:#14532d;font-weight:600;font-size:13px;text-decoration:none">View pack →</a>
        </div>

        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:16px;padding:14px 16px;margin:12px 0">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <strong style="color:#6d28d9">Dark Mode UI Kit</strong>
            <span style="color:#6d28d9;font-size:13px"><s style="color:#9ca3af">¥499</s> <strong>¥449</strong></span>
          </div>
          <p style="margin:8px 0 10px;color:#5b21b6;font-size:14px;line-height:1.5">Pre-tested light/dark pairings, contrast-checked, Tailwind ready.</p>
          <a href="https://colorarchive.me/packs/dark-mode-ui-kit/" style="color:#6d28d9;font-weight:600;font-size:13px;text-decoration:none">View pack →</a>
        </div>

        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:16px;padding:14px 16px;margin:12px 0">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <strong style="color:#14532d">All Access Bundle</strong>
            <span style="color:#14532d;font-size:13px"><s style="color:#9ca3af">¥2,799</s> <strong>¥2,519</strong></span>
          </div>
          <p style="margin:8px 0 10px;color:#166534;font-size:14px;line-height:1.5">Every pack in one download. The best value.</p>
          <a href="https://colorarchive.me/packs/all-access-bundle/" style="color:#14532d;font-weight:600;font-size:13px;text-decoration:none">View bundle →</a>
        </div>

        <p style="color:#666;font-size:14px;margin-top:20px">Questions? Just reply to this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">
          ColorArchive · <a href="https://colorarchive.me" style="color:#999">colorarchive.me</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (follow-up day 14):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

module.exports = {
  sendFreePackEmail,
  sendFollowUp3DayEmail,
  sendFollowUp7DayEmail,
  sendFollowUp14DayEmail,
  sendMagicLinkEmail,
  sendOrderConfirmationEmail,
  sendWaitlistConfirmationEmail,
};
