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
    subject: "6 palette packs — find the one that fits your project",
    text: [
      "Find the right ColorArchive pack for your project",
      "",
      "You've had the free pack for a week. Here's a quick guide to the paid packs in case one fits:",
      "",
      "Palette Pack Vol. 1 (¥1,980) — Best first paid pack. 8 curated palettes, CSS + Tailwind tokens.",
      "https://colorarchive.me/packs/palette-pack-vol-1/",
      "",
      "Creator Bundle (¥2,980) — Social-ready palette boards + wallpaper sets for visual content.",
      "https://colorarchive.me/packs/content-creator-bundle/",
      "",
      "Dark Mode UI Kit (¥3,480) — Pre-tested light/dark pairings, contrast-checked, Tailwind ready.",
      "https://colorarchive.me/packs/dark-mode-ui-kit/",
      "",
      "Brand Starter Kit (¥5,980) — Primary + secondary + accent groups for landing pages and brands.",
      "https://colorarchive.me/packs/brand-starter-kit/",
      "",
      "Seasonal: Spring 2026 (¥1,280) — Limited seasonal direction with mood notes.",
      "https://colorarchive.me/packs/seasonal-spring-2026/",
      "",
      "Complete Archive Token Set (¥7,480) — All 2016 colors as CSS, JSON, Tailwind, Figma tokens.",
      "https://colorarchive.me/packs/complete-archive-token-set/",
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
          { id: "palette-pack-vol-1", title: "Palette Pack Vol. 1", price: "¥1,980", desc: "Best first paid pack. 8 curated palettes, CSS + Tailwind tokens.", bg: "#f0fdf4", border: "#bbf7d0", titleColor: "#14532d", textColor: "#166534" },
          { id: "content-creator-bundle", title: "Creator Bundle", price: "¥2,980", desc: "Social-ready palette boards and wallpaper sets for visual content.", bg: "#fff7ed", border: "#fed7aa", titleColor: "#9a3412", textColor: "#7c2d12" },
          { id: "dark-mode-ui-kit", title: "Dark Mode UI Kit", price: "¥3,480", desc: "Pre-tested light/dark pairings, contrast-checked, Tailwind ready.", bg: "#f5f3ff", border: "#ddd6fe", titleColor: "#6d28d9", textColor: "#5b21b6" },
          { id: "brand-starter-kit", title: "Brand Color Starter Kit", price: "¥5,980", desc: "Primary + secondary + accent groups for landing pages and brands.", bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1d4ed8", textColor: "#1e3a8a" },
          { id: "seasonal-spring-2026", title: "Seasonal: Spring 2026", price: "¥1,280", desc: "Limited seasonal direction with mood notes.", bg: "#fdf4ff", border: "#e9d5ff", titleColor: "#7e22ce", textColor: "#6b21a8" },
          { id: "complete-archive-token-set", title: "Complete Archive Token Set", price: "¥7,480", desc: "All 2016 colors as CSS, JSON, Tailwind, and Figma tokens.", bg: "#fafafa", border: "#e5e7eb", titleColor: "#111827", textColor: "#374151" },
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

module.exports = {
  sendFreePackEmail,
  sendFollowUp3DayEmail,
  sendFollowUp7DayEmail,
  sendMagicLinkEmail,
  sendOrderConfirmationEmail,
  sendWaitlistConfirmationEmail,
};
