const express = require("express");
const router = express.Router();
const db = require("../db");
const { sendFreePackEmail, sendWaitlistConfirmationEmail } = require("../email");

// POST /subscribe
// Body: { email: string, source?: string }
router.post("/", async (req, res) => {
  const { email, source = "free-pack" } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    db.prepare(
      "INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)"
    ).run(email, source);

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
