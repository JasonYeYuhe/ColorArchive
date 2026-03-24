const express = require("express");
const router = express.Router();
const db = require("../db");
const { sendFreePackEmail, sendWaitlistConfirmationEmail } = require("../email");

function sanitizeString(value, limit = 240) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, limit) : null;
}

// POST /subscribe
// Body: { email: string, source?: string, cotd?: boolean }
router.post("/", async (req, res) => {
  const {
    email,
    source = "free-pack",
    cotd = false,
    landingPath,
    referrer,
    ref,
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

    // Enable COTD if requested (separate update to handle existing subscribers too)
    if (cotd) {
      db.prepare(`UPDATE subscribers SET cotd_subscribed = 1 WHERE email = ?`)
        .run(email.trim().toLowerCase());
    }

    // Referral credit: if ref code provided, credit the referrer +5 AI credits
    const refCode = sanitizeString(ref, 20);
    if (refCode) {
      db.prepare("UPDATE subscribers SET referred_by = ? WHERE email = ?")
        .run(refCode, email.trim().toLowerCase());
      // Credit the referrer (find user by referral_code)
      const referrerUser = db.prepare("SELECT id FROM users WHERE referral_code = ?").get(refCode);
      if (referrerUser) {
        db.prepare("UPDATE users SET credits = credits + 5 WHERE id = ?").run(referrerUser.id);
      }
    }

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
