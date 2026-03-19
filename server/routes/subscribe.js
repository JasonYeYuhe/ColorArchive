const express = require("express");
const router = express.Router();
const db = require("../db");
const { sendFreePackEmail, sendWaitlistConfirmationEmail } = require("../email");

function sanitizeString(value, limit = 240) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, limit) : null;
}

// POST /subscribe
// Body: { email: string, source?: string }
router.post("/", async (req, res) => {
  const {
    email,
    source = "free-pack",
    landingPath,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
  } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    db.prepare(
      `
        INSERT INTO subscribers (
          email,
          source,
          landing_path,
          referrer,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          source = excluded.source,
          landing_path = COALESCE(excluded.landing_path, subscribers.landing_path),
          referrer = COALESCE(excluded.referrer, subscribers.referrer),
          utm_source = COALESCE(excluded.utm_source, subscribers.utm_source),
          utm_medium = COALESCE(excluded.utm_medium, subscribers.utm_medium),
          utm_campaign = COALESCE(excluded.utm_campaign, subscribers.utm_campaign),
          utm_term = COALESCE(excluded.utm_term, subscribers.utm_term),
          utm_content = COALESCE(excluded.utm_content, subscribers.utm_content)
      `,
    ).run(
      email.trim().toLowerCase(),
      sanitizeString(source, 80) || "free-pack",
      sanitizeString(landingPath),
      sanitizeString(referrer),
      sanitizeString(utmSource, 120),
      sanitizeString(utmMedium, 120),
      sanitizeString(utmCampaign, 160),
      sanitizeString(utmTerm, 160),
      sanitizeString(utmContent, 160),
    );

    if (source === "waitlist") {
      await sendWaitlistConfirmationEmail(email);
    } else {
      await sendFreePackEmail(email);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("subscribe error:", err);
    res.status(500).json({ error: "Failed to process subscription" });
  }
});

module.exports = router;
