const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  sendFreePackEmail,
  sendWaitlistConfirmationEmail,
  sendPreorderReserveEmail,
  sendDesignNotesWelcomeEmail,
} = require("../email");
const { getRateLimitKey } = require("../client-ip");

function sanitizeString(value, limit = 240) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, limit) : null;
}

// Per-IP rate limit: max 10 subscribe attempts per minute. Without it, /subscribe
// is an open email-bomb relay (each first-time signup sends a welcome mail) and a
// script can flood the subscribers table with junk that pollutes the validation
// funnel (the exit gate reads subscribers.source). Mirrors events.js's limiter.
// Until 2026-07-26 this was a SITE-WIDE 10/minute cap, not a per-caller one:
// nginx never set X-Forwarded-For, so every request resolved to loopback (see
// client-ip.js). On the exact funnel the last two commits were built to
// instrument, ten signup attempts a minute was the ceiling for everyone at once.
const subAttempts = new Map();
setInterval(() => subAttempts.clear(), 60_000);
function subscribeRateLimit(req, res, next) {
  const ip = getRateLimitKey(req);
  const count = (subAttempts.get(ip) || 0) + 1;
  subAttempts.set(ip, count);
  if (count > 10) {
    return res.status(429).json({ error: "Too many requests. Please try again shortly." });
  }
  next();
}

// POST /subscribe
// Body: { email: string, source?: string, cotd?: boolean }
router.post("/", subscribeRateLimit, async (req, res) => {
  const {
    email,
    source = "free-pack",
    cotd = false,
    notes = false,
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

  const emailNorm = email.trim().toLowerCase();
  const cleanSource = sanitizeString(source, 80) || "free-pack";

  try {
    // Only send a welcome/confirmation email on the FIRST signup. Re-sending on
    // every POST (the prior behavior) is an email-bomb vector and spams returning
    // subscribers. The source still upserts so the gate's source attribution and
    // the preorder secondary numerator stay correct on repeat submits.
    const isNewSubscriber = !db
      .prepare("SELECT 1 FROM subscribers WHERE email = ?")
      .get(emailNorm);

    db.prepare(
      `
        INSERT INTO subscribers (
          email,
          source,
          first_source,
          landing_path,
          referrer,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          source = excluded.source,
          -- first_source is write-once: the surface that actually earned this
          -- subscriber, immune to the source overwrite on the line above. The
          -- middle term matters for rows that predate this column: their true
          -- origin still lives in the OLD source, so fall back to that before
          -- ever accepting the incoming one.
          first_source = COALESCE(subscribers.first_source, subscribers.source, excluded.source),
          landing_path = COALESCE(excluded.landing_path, subscribers.landing_path),
          referrer = COALESCE(excluded.referrer, subscribers.referrer),
          utm_source = COALESCE(excluded.utm_source, subscribers.utm_source),
          utm_medium = COALESCE(excluded.utm_medium, subscribers.utm_medium),
          utm_campaign = COALESCE(excluded.utm_campaign, subscribers.utm_campaign),
          utm_term = COALESCE(excluded.utm_term, subscribers.utm_term),
          utm_content = COALESCE(excluded.utm_content, subscribers.utm_content)
      `,
    ).run(
      emailNorm,
      cleanSource,
      cleanSource,
      sanitizeString(landingPath),
      sanitizeString(referrer),
      sanitizeString(utmSource, 120),
      sanitizeString(utmMedium, 120),
      sanitizeString(utmCampaign, 160),
      sanitizeString(utmTerm, 160),
      sanitizeString(utmContent, 160),
    );

    // Enable COTD if requested (separate update to handle existing subscribers too).
    // Never opt a pre-order reserver into the daily color list — they asked about
    // the Auditor, not a daily email (defense-in-depth; the form also sends cotd:false).
    if (cotd && cleanSource !== "preorder") {
      db.prepare(`UPDATE subscribers SET cotd_subscribed = 1 WHERE email = ?`)
        .run(emailNorm);
    }

    // Design Notes (weekly) — the guide-reader list. Same defense-in-depth as
    // COTD: only opt in when the form actually asked for it.
    // `changes` distinguishes a fresh opt-in from a repeat submit, so an EXISTING
    // subscriber joining the notes list still gets the note that confirms what
    // they just signed up for (they aren't a new subscriber, but this IS a new
    // list for them).
    let newlyJoinedNotes = false;
    if (notes && cleanSource !== "preorder") {
      const info = db
        .prepare(
          `UPDATE subscribers SET notes_subscribed = 1
            WHERE email = ? AND COALESCE(notes_subscribed, 0) = 0`,
        )
        .run(emailNorm);
      newlyJoinedNotes = info.changes > 0;
    }

    // Referral credit: if ref code provided, credit the referrer +5 AI credits (idempotent)
    const refCode = sanitizeString(ref, 20);
    if (refCode) {
      const subscriber = db.prepare("SELECT referred_by FROM subscribers WHERE email = ?")
        .get(emailNorm);
      // Only credit if this subscriber hasn't already been credited to a referrer
      // and the refCode maps to a real user (prevents invalid codes from locking the slot)
      if (!subscriber?.referred_by) {
        const referrerUser = db.prepare("SELECT id FROM users WHERE referral_code = ?").get(refCode);
        if (referrerUser) {
          db.prepare("UPDATE subscribers SET referred_by = ? WHERE email = ?")
            .run(refCode, emailNorm);
          db.prepare("UPDATE users SET credits = credits + 5 WHERE id = ?").run(referrerUser.id);
        }
      }
    }

    if (newlyJoinedNotes) {
      // Confirms the list they actually joined. Gated on the JOIN, not on being
      // a new subscriber, so a long-time daily-color reader who adds the weekly
      // notes still hears back. Repeat submits stay silent (no email bombs).
      await sendDesignNotesWelcomeEmail(email);
    } else if (isNewSubscriber) {
      if (cleanSource === "waitlist") {
        await sendWaitlistConfirmationEmail(email);
      } else if (cleanSource === "preorder") {
        // Pre-order reservers must NOT get the free-pack "your download is ready"
        // mail — they reserved a not-yet-shipped product. Send the reserve note.
        await sendPreorderReserveEmail(email);
      } else {
        await sendFreePackEmail(email);
      }
    }
    // isNewSubscriber lets the client distinguish "captured a new subscriber"
    // from "an existing subscriber re-submitted", so capture-rate metrics
    // aren't inflated by re-submits.
    res.json({ ok: true, isNewSubscriber });
  } catch (err) {
    console.error("subscribe error:", err);
    res.status(500).json({ error: "Failed to process subscription" });
  }
});

module.exports = router;
