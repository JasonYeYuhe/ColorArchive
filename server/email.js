const { Resend } = require("resend");
const updateBrief = require("./content/update-brief");
const newsletterIssues = require("../src/data/newsletter-issues.json");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.me";

// CAN-SPAM compliant email send wrapper
async function sendEmail(options) {
  if (!resend) return;
  return resend.emails.send({
    ...options,
    from: options.from || `ColorArchive <${FROM}>`,
    reply_to: options.reply_to || FROM,
    headers: {
      "List-Unsubscribe": `<mailto:${FROM}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click-Unsubscribe",
      ...options.headers,
    },
  });
}

// Free pack download email
async function sendFreePackEmail(to) {
  const result = await sendEmail({
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
  const result = await sendEmail({
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
  const result = await sendEmail({
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

  const result = await sendEmail({
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

// A/B subject line variants for follow-up emails
const SUBJECT_VARIANTS = {
  day3: {
    A: "How to use your ColorArchive palette in code",
    B: "3 steps to drop your free palette into any project",
    C: "Your free palette pack — getting started",
    D: "CSS variables, Figma tokens, and JSON — all in the pack",
    E: "Quick start: your palette pack in 3 minutes",
    F: "Turn your free palette into a working design system",
  },
  day7: {
    A: "ColorArchive catalog preview — find the pack that fits your project",
    B: "Which ColorArchive pack matches what you're building?",
    C: "One palette library, every format you need",
    D: "The 2016-color library — organized for real projects",
    E: "Seven packs. One for every type of project.",
    F: "From landing pages to dark mode — your palette options",
  },
  day14: {
    A: "10% off your first ColorArchive pack — code FIRSTPACK",
    B: "Your FIRSTPACK discount expires in 7 days",
    C: "A discount for your first ColorArchive pack — use FIRSTPACK",
    D: "A week left to use FIRSTPACK — 10% off any pack",
    E: "A thank-you: use FIRSTPACK for 10% off",
    F: "FIRSTPACK — 10% off, 7 days, yours to use",
  },
  day21: {
    A: "Three things you can build with a ColorArchive palette today",
    B: "Color ideas for your next project — from the archive",
    C: "Practical color: three real starting points",
    D: "What 2016 colors give you that 5 could not",
    E: "Three ways designers put palette packs to work",
    F: "A landing page, a moodboard, and a social template — in one palette",
  },
  day30: {
    A: "Your ColorArchive palette — one month on",
    B: "The pack that pays for itself in one project",
    C: "What designers do after the free pack",
    D: "Still building with the free pack? Here is what comes next",
    E: "One month in — what the full library gives you",
    F: "Ready for more than the free pack? Two options.",
  },
};

// Day-3 follow-up: how to use CSS tokens
async function sendFollowUp3DayEmail(to, { variant = "A" } = {}) {
  const subject = SUBJECT_VARIANTS.day3[variant] || SUBJECT_VARIANTS.day3.A;
  const result = await sendEmail({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject,
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
async function sendFollowUp7DayEmail(to, { variant = "A" } = {}) {
  const subject = SUBJECT_VARIANTS.day7[variant] || SUBJECT_VARIANTS.day7.A;
  const result = await sendEmail({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject,
    text: [
      "Find the right ColorArchive pack for your project",
      "",
      "You've had the free pack for a week. Here's a quick guide to the paid packs in case one fits:",
      "",
      "Seasonal: Spring 2026 (¥299) — Limited edition seasonal palettes with mood notes.",
      "https://colorarchive.me/packs/seasonal-spring-2026/",
      "",
      "Palette Pack Vol. 1 (¥599) — Best starter pack. 8 curated palettes, CSS + Tailwind tokens.",
      "https://colorarchive.me/packs/palette-pack-vol-1/",
      "",
      "Dark Mode UI Kit (¥999) — Pre-tested light/dark pairings, contrast-checked, Tailwind ready.",
      "https://colorarchive.me/packs/dark-mode-ui-kit/",
      "",
      "Creator Bundle (¥999) — Social-ready palette boards + wallpaper sets for visual content.",
      "https://colorarchive.me/packs/content-creator-bundle/",
      "",
      "Brand Starter Kit (¥1,499) — Primary + secondary + accent groups for landing pages and brands.",
      "https://colorarchive.me/packs/brand-starter-kit/",
      "",
      "Complete Archive Token Set (¥2,499) — All 3,000+ colors as CSS, JSON, Tailwind, Figma tokens.",
      "https://colorarchive.me/packs/complete-archive/",
      "",
      "All Access Bundle (¥3,999) — Everything above in one download. Save 40%.",
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
          { id: "seasonal-spring-2026", title: "Seasonal: Spring 2026", price: "¥299", desc: "Limited edition seasonal palettes with mood notes.", bg: "#fdf4ff", border: "#e9d5ff", titleColor: "#7e22ce", textColor: "#6b21a8" },
          { id: "palette-pack-vol-1", title: "Palette Pack Vol. 1", price: "¥599", desc: "Best starter pack. 8 curated palettes, CSS + Tailwind tokens.", bg: "#f0fdf4", border: "#bbf7d0", titleColor: "#14532d", textColor: "#166534" },
          { id: "dark-mode-ui-kit", title: "Dark Mode UI Kit", price: "¥999", desc: "Pre-tested light/dark pairings, contrast-checked, Tailwind ready.", bg: "#f5f3ff", border: "#ddd6fe", titleColor: "#6d28d9", textColor: "#5b21b6" },
          { id: "content-creator-bundle", title: "Creator Bundle", price: "¥999", desc: "Social-ready palette boards and wallpaper sets for visual content.", bg: "#fff7ed", border: "#fed7aa", titleColor: "#9a3412", textColor: "#7c2d12" },
          { id: "brand-starter-kit", title: "Brand Color Starter Kit", price: "¥1,499", desc: "Primary + secondary + accent groups for landing pages and brands.", bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1d4ed8", textColor: "#1e3a8a" },
          { id: "complete-archive", title: "Complete Archive Token Set", price: "¥2,499", desc: "All 3,000+ colors as CSS, JSON, Tailwind, and Figma tokens.", bg: "#fafafa", border: "#e5e7eb", titleColor: "#111827", textColor: "#374151" },
          { id: "all-access-bundle", title: "All Access Bundle", price: "¥3,999", desc: "Everything above in one download. Save 40%.", bg: "#f0fdf4", border: "#86efac", titleColor: "#14532d", textColor: "#166534" },
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
async function sendFollowUp14DayEmail(to, { variant = "A" } = {}) {
  const subject = SUBJECT_VARIANTS.day14[variant] || SUBJECT_VARIANTS.day14.A;
  const result = await sendEmail({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject,
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

// Day-21 follow-up: creative inspiration — three use cases with palette ideas
async function sendFollowUp21DayEmail(to, { variant = "A" } = {}) {
  const subject = SUBJECT_VARIANTS.day21[variant] || SUBJECT_VARIANTS.day21.A;
  const result = await sendEmail({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject,
    text: [
      "Three things you can build with a ColorArchive palette",
      "",
      "It has been a few weeks since you downloaded the free palette pack. Here are three concrete starting points for putting it to use:",
      "",
      "1. A landing page hero section",
      "Take any five-color palette and assign roles: background (lightest), card surface, text, accent, and action color (darkest or most saturated). That structure gives you a complete landing page color system in under five minutes.",
      "",
      "2. A brand identity moodboard",
      "Paste the palette swatches into a simple grid in Figma or Canva alongside a typeface sample and a photography reference. A palette moodboard is the fastest way to align a client or stakeholder before detailed design work begins.",
      "",
      "3. A social media post template",
      "Use one dominant palette color as the background, one accent for type or graphic elements, and one near-neutral for any secondary information. Applied consistently across a dozen posts, it creates a feed that looks intentional and considered.",
      "",
      "Browse more palettes and collections: https://colorarchive.me/collections/",
      "",
      "Or if you want ready-made CSS, JSON, and Figma tokens: https://colorarchive.me/packs/",
      "",
      "— ColorArchive",
      "https://colorarchive.me",
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">Three things you can build with a ColorArchive palette</h2>
        <p style="color:#444;line-height:1.6">It has been a few weeks since you downloaded the free palette pack. Here are three concrete starting points:</p>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:16px 18px;margin:20px 0">
          <p style="margin:0 0 6px;font-weight:700;color:#111">1. A landing page hero section</p>
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">Assign five roles to any palette: background (lightest), card surface, text, accent, and action color. That structure gives you a complete landing page color system in under five minutes.</p>
        </div>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:16px 18px;margin:12px 0">
          <p style="margin:0 0 6px;font-weight:700;color:#111">2. A brand identity moodboard</p>
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">Paste swatches into a grid in Figma alongside a typeface sample and a photography reference. A palette moodboard is the fastest way to align a client before detailed work begins.</p>
        </div>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:16px 18px;margin:12px 0">
          <p style="margin:0 0 6px;font-weight:700;color:#111">3. A social media post template</p>
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">One dominant background color, one accent for type or graphics, one near-neutral for secondary info. Applied consistently across a dozen posts, it creates a feed that looks intentional.</p>
        </div>
        <div style="margin:24px 0;display:flex;gap:10px;flex-wrap:wrap">
          <a href="https://colorarchive.me/collections/"
             style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
            Browse Collections
          </a>
          <a href="https://colorarchive.me/packs/"
             style="display:inline-block;background:#f8fafc;border:1px solid #e5e7eb;color:#1a1a1a;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
            View Packs →
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">
          ColorArchive · <a href="https://colorarchive.me" style="color:#999">colorarchive.me</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (follow-up day 21):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}


async function sendFollowUp30DayEmail(to, { variant = "A" } = {}) {
  const subject = SUBJECT_VARIANTS.day30[variant] || SUBJECT_VARIANTS.day30.A;
  const result = await sendEmail({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject,
    text: [
      "One month with ColorArchive",
      "",
      "You downloaded the free palette pack a month ago. Here is where a lot of designers end up after that first step:",
      "",
      "The free pack gives you a strong starting point — 30 production-ready palettes with HEX and HSL values. But the most common request after the free pack is: 'I need more range. I am working on a dark-mode product and need the full spectrum, or I am building a brand system and need the token structure, not just the colors.'",
      "",
      "The Complete Archive gives you all 2016 colors in the system — every hue, every lightness band, every chroma level, in HEX, RGB, HSL, CSS variables, and Figma tokens. It is the reference collection designers use when they need the full set on hand.",
      "",
      "The Brand Starter Kit is the other option: fewer colors, but organized by role rather than by spectrum. Primary, surface, accent, text — already structured for implementation.",
      "",
      "Both are one-time purchases with no subscription.",
      "",
      "Browse the full catalog: https://colorarchive.me/packs/",
      "",
      "— ColorArchive",
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1a1a1a">One month with ColorArchive</h2>
        <p style="color:#444;line-height:1.6">You downloaded the free palette pack a month ago. Here is where a lot of designers end up after that first step:</p>
        <p style="color:#444;line-height:1.6">The free pack gives you a strong starting point — 30 production-ready palettes with HEX and HSL values. But the most common request after the free pack is: <em>"I need more range."</em></p>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:20px 22px;margin:20px 0">
          <p style="margin:0 0 4px;font-weight:700;color:#111">Complete Archive</p>
          <p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.6">All 2016 colors in HEX, RGB, HSL, CSS variables, and Figma tokens. The full reference collection for when you need the entire spectrum on hand.</p>
          <a href="https://colorarchive.me/packs/complete-archive/" style="display:inline-block;background:#1a1a1a;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px">View Complete Archive →</a>
        </div>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:20px 22px;margin:12px 0">
          <p style="margin:0 0 4px;font-weight:700;color:#111">Brand Starter Kit</p>
          <p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.6">Fewer colors, organized by role. Primary, surface, accent, text — already structured for brand systems and implementation handoff.</p>
          <a href="https://colorarchive.me/packs/brand-starter-kit/" style="display:inline-block;background:#1a1a1a;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px">View Brand Starter Kit →</a>
        </div>
        <p style="color:#666;font-size:14px;line-height:1.6">Both are one-time purchases. No subscription. Download once, use forever.</p>
        <div style="margin:20px 0">
          <a href="https://colorarchive.me/packs/"
             style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
            Browse the full catalog
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">
          ColorArchive · <a href="https://colorarchive.me" style="color:#999">colorarchive.me</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (follow-up day 30):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

// Newsletter issue alert — sent to subscribers when a new note is published
async function sendNewsletterIssueAlert(to, { issue, unsubscribeToken = null } = {}) {
  if (!issue || !issue.slug || !issue.title) {
    throw new Error("sendNewsletterIssueAlert: issue must have slug and title");
  }
  const issueUrl = `https://colorarchive.me/notes/${issue.slug}`;
  const unsubscribeUrl = unsubscribeToken
    ? `https://colorarchive.me/unsubscribe?token=${unsubscribeToken}`
    : "https://colorarchive.me/unsubscribe";

  const highlightLines = Array.isArray(issue.highlights) && issue.highlights.length > 0
    ? issue.highlights.slice(0, 3).map((h) => `• ${h}`).join("\n")
    : "";

  const result = await sendEmail({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: issue.title,
    text: [
      issue.eyebrow ? `${issue.eyebrow} — ColorArchive Notes` : "ColorArchive Notes",
      "",
      issue.title,
      "",
      issue.summary || "",
      "",
      highlightLines,
      "",
      `Read the full note: ${issueUrl}`,
      "",
      "— ColorArchive",
      "https://colorarchive.me",
      "",
      `Unsubscribe: ${unsubscribeUrl}`,
    ].filter((l) => l !== null).join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        ${issue.eyebrow ? `<p style="font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#9ca3af;font-weight:600;margin:0 0 12px">${issue.eyebrow} — ColorArchive Notes</p>` : ""}
        <h2 style="color:#111827;font-size:20px;line-height:1.4;margin:0 0 12px">${issue.title}</h2>
        ${issue.summary ? `<p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 20px">${issue.summary}</p>` : ""}
        ${highlightLines ? `
        <div style="background:#f9fafb;border-left:3px solid #d1d5db;padding:14px 18px;margin:0 0 20px;border-radius:0 8px 8px 0">
          ${issue.highlights.slice(0, 3).map((h) =>
            `<p style="margin:0 0 10px;color:#374151;font-size:13px;line-height:1.6;last-child:margin-bottom:0">${h}</p>`
          ).join("")}
        </div>` : ""}
        <a href="${issueUrl}"
           style="display:inline-block;background:#111827;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
          Read the full note →
        </a>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0">
        <p style="color:#9ca3af;font-size:11px;line-height:1.6">
          ColorArchive · <a href="https://colorarchive.me" style="color:#9ca3af">colorarchive.me</a>
          &nbsp;·&nbsp;
          <a href="${unsubscribeUrl}" style="color:#9ca3af">Unsubscribe</a>
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (newsletter issue alert):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

/**
 * Daily "Color of the Day" email
 * @param {string} to
 * @param {{ id: string, name: string, hex: string, hsl: string, family: string }} color
 * @param {string} dateStr  e.g. "2026-03-24"
 */
async function sendCotdEmail(to, color, dateStr) {
  const formattedDate = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const archiveUrl = `https://colorarchive.me/colors/${color.id}/`;
  const unsubUrl = `https://colorarchive.me/unsubscribe/?email=${encodeURIComponent(to)}`;
  const luminance = parseInt(color.hex.slice(1, 3), 16) * 0.299 +
    parseInt(color.hex.slice(3, 5), 16) * 0.587 +
    parseInt(color.hex.slice(5, 7), 16) * 0.114;
  const textOnSwatch = luminance > 140 ? "#1a1a1a" : "#ffffff";

  const result = await sendEmail({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: `${color.name} — your ColorArchive color for ${formattedDate}`,
    text: [
      `${color.name}`,
      `Your ColorArchive color for ${formattedDate}`,
      "",
      `Hex: ${color.hex}`,
      `HSL: ${color.hsl}`,
      `Family: ${color.family}`,
      "",
      `View in Archive: ${archiveUrl}`,
      "",
      "— ColorArchive",
      "https://colorarchive.me",
      "",
      `Unsubscribe: ${unsubUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 16px">
          ${formattedDate}
        </p>

        <!-- Swatch -->
        <div style="background:${color.hex};border-radius:16px;padding:32px 24px;text-align:center;margin-bottom:20px">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${textOnSwatch};opacity:0.6;margin-bottom:8px">
            Color of the Day
          </div>
          <div style="font-size:28px;font-weight:700;color:${textOnSwatch};letter-spacing:-0.5px">
            ${color.name}
          </div>
          <div style="font-size:14px;font-family:monospace;color:${textOnSwatch};opacity:0.7;margin-top:6px">
            ${color.hex.toUpperCase()}
          </div>
        </div>

        <!-- Details -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr>
            <td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #f0f0f0">Family</td>
            <td style="padding:8px 0;color:#1a1a1a;font-size:14px;font-weight:500;border-bottom:1px solid #f0f0f0;text-align:right">${color.family}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:1px;text-transform:uppercase">HSL</td>
            <td style="padding:8px 0;color:#1a1a1a;font-size:14px;font-family:monospace;text-align:right">${color.hsl}</td>
          </tr>
        </table>

        <p style="text-align:center;margin:24px 0">
          <a href="${archiveUrl}"
             style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            View in ColorArchive →
          </a>
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#bbb;font-size:11px;text-align:center">
          ColorArchive · <a href="https://colorarchive.me" style="color:#bbb">colorarchive.me</a>
          &nbsp;·&nbsp;
          <a href="${unsubUrl}" style="color:#bbb">Unsubscribe</a>
        </p>
      </div>
    `,
  });

  if (result.error) {
    console.error("Resend error (cotd email):", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
  return result;
}

async function sendProUpsellEmail(email) {
  if (!resend) return;
  const result = await sendEmail({
    from: `ColorArchive <${FROM}>`,
    to: email,
    subject: "You've hit your daily limit — unlock unlimited AI with Pro",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <p style="color:#1a1a2e;font-size:15px;line-height:1.6;">
          Hey there,
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;">
          You've used all your free AI generations for today. That means you're getting real value from ColorArchive — nice!
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;">
          With <strong>Pro</strong>, you get <strong>unlimited</strong> AI palette generations, exports, WCAG reports, and more — for just $4.99/month.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://colorarchive.me/pro" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">
            Upgrade to Pro
          </a>
        </div>
        <p style="color:#999;font-size:12px;line-height:1.5;">
          Your free generations reset tomorrow. Or share your referral link to earn bonus AI credits!
        </p>
        <p style="color:#ccc;font-size:11px;margin-top:24px;">
          ColorArchive · hello@colorarchive.me
        </p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (pro upsell):", JSON.stringify(result.error));
  }
  return result;
}


// Referral welcome email — sent to a referred user after they sign up
async function sendReferralWelcomeEmail(to, { referrerName = null } = {}) {
  const referrerPhrase = referrerName
    ? `Someone you know — ${referrerName} — shared ColorArchive with you.`
    : "Someone shared ColorArchive with you.";
  const result = await sendEmail({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to,
    subject: "Welcome to ColorArchive — you were referred",
    text: [
      "Welcome to ColorArchive",
      "",
      referrerPhrase,
      "",
      "Here is what you can do right now for free:",
      "- Browse 3,066 named colors at colorarchive.me/all-colors",
      "- Generate an AI brand palette from a text description",
      "- Extract colors from any image",
      "- Run a WCAG accessibility audit on any color pair",
      "",
      "Your free account gives you 10 AI generations per day — no credit card required.",
      "",
      "Want unlimited AI generations, exports, and every color format? Pro is $4.99/month.",
      "https://colorarchive.me/pro",
      "",
      "— ColorArchive",
      "https://colorarchive.me",
    ].join("\n"),
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <p style="color:#1a1a2e;font-size:15px;line-height:1.6;font-weight:600;">Welcome to ColorArchive</p>
        <p style="color:#555;font-size:14px;line-height:1.6;">${referrerPhrase}</p>
        <p style="color:#555;font-size:14px;line-height:1.6;">Here is what you can do right now, for free:</p>
        <ul style="color:#374151;font-size:14px;line-height:1.9;padding-left:20px;">
          <li>Browse <strong>3,066 named colors</strong> — filterable by family, mood, and lightness</li>
          <li>Generate an <strong>AI brand palette</strong> from a text description</li>
          <li>Extract colors from any image</li>
          <li>Run a <strong>WCAG accessibility audit</strong> on any color pair</li>
        </ul>
        <p style="color:#555;font-size:14px;line-height:1.6;">Your free account includes 10 AI generations per day — no credit card needed.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://colorarchive.me" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">Explore ColorArchive</a>
        </div>
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:16px;padding:16px 18px;margin:20px 0;">
          <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#14532d;font-weight:700;">Pro — unlimited everything</div>
          <p style="margin:8px 0 0;color:#166534;font-size:14px;line-height:1.6;">Unlimited AI generations, WCAG reports, exports in every format, and access to the complete 3,066-color token set. From <strong>$4.99/month</strong>.</p>
          <p style="margin:10px 0 0;"><a href="https://colorarchive.me/pro" style="color:#14532d;font-weight:600;font-size:13px;text-decoration:none;">View Pro plans →</a></p>
        </div>
        <p style="color:#ccc;font-size:11px;margin-top:24px;">ColorArchive · hello@colorarchive.me</p>
      </div>
    `,
  });
  if (result.error) {
    console.error("Resend error (referral welcome):", JSON.stringify(result.error));
  }
  return result;
}

module.exports = {
  sendFreePackEmail,
  sendFollowUp3DayEmail,
  sendFollowUp7DayEmail,
  sendFollowUp14DayEmail,
  sendFollowUp21DayEmail,
  sendFollowUp30DayEmail,
  sendMagicLinkEmail,
  sendOrderConfirmationEmail,
  sendWaitlistConfirmationEmail,
  sendNewsletterIssueAlert,
  sendCotdEmail,
  sendProUpsellEmail,
  sendReferralWelcomeEmail,
};
