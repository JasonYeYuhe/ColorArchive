const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * Opt-out. Every marketing email we have ever sent links to /unsubscribe/ —
 * and until 2026-07-25 that link 404'd, on both the page and the API. Daily
 * Color-of-the-Day mail was going out with a dead opt-out, which is a legal
 * problem (CAN-SPAM / GDPR both require a working one) and a trust problem
 * regardless of the law. This is the missing half.
 *
 * Design notes:
 *
 * - Unsubscribing is POST-only ON PURPOSE. Mail clients and security scanners
 *   pre-fetch links; a GET that opts people out would silently unsubscribe
 *   anyone whose provider scans their inbox. The page shows a confirm button.
 * - The response never reveals whether an address is on the list — an open
 *   endpoint that answers that is an email-enumeration oracle. Unknown
 *   addresses get the same "done" response.
 * - Idempotent: unsubscribing twice is a no-op success.
 */

const LISTS = {
  // list key → column it controls
  cotd: "cotd_subscribed",
  notes: "notes_subscribed",
};

// POST /unsubscribe  { email, list?: "cotd" | "notes" | "all" }
router.post("/", (req, res) => {
  const { email, list = "all" } = req.body || {};

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  const emailNorm = email.trim().toLowerCase();

  const columns =
    list === "all" ? Object.values(LISTS) : LISTS[list] ? [LISTS[list]] : null;
  if (!columns) return res.status(400).json({ error: "Unknown list" });

  try {
    db.prepare(
      `UPDATE subscribers SET ${columns.map((c) => `${c} = 0`).join(", ")} WHERE email = ?`,
    ).run(emailNorm);
    console.log(`[unsubscribe] ${emailNorm} → ${list}`);
  } catch (err) {
    console.error("[unsubscribe] failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to unsubscribe" });
  }

  // Deliberately uniform: never leak whether the address was subscribed.
  return res.json({ ok: true });
});

// GET /unsubscribe/status?email=…  — lets the page show which lists are active
// WITHOUT confirming existence: an unknown address reports everything off.
router.get("/status", (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  const row = db
    .prepare("SELECT cotd_subscribed, notes_subscribed FROM subscribers WHERE email = ?")
    .get(email);
  return res.json({
    cotd: Boolean(row?.cotd_subscribed),
    notes: Boolean(row?.notes_subscribed),
  });
});

module.exports = router;
