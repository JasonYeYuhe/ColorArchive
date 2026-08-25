const db = require("./db");
const { sendFollowUp3DayEmail, sendFollowUp7DayEmail, sendFollowUp14DayEmail, sendFollowUp21DayEmail, sendFollowUp30DayEmail, sendCotdEmail } = require("./email");
const { getColorOfDay } = require("./colors");

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const TWENTYONE_DAYS_MS = 21 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const INTERVAL_MS = 60 * 60 * 1000; // run every hour

// RETIRED 2026-08-18 — the day 3 / 7 / 14 / 30 mails sell the palette packs, and
// the packs no longer exist. Commit 00d7a04 ("Drop product packs,
// migrate to pure SaaS subscription model") deleted palette-packs.ts and every
// /packs/* page, leaving a 301 to /pro/. So a subscriber is quoted a price,
// clicks "View pack →", and lands on a page selling a ¥499/mo subscription.
// There is no way to buy any of them anywhere on the site, and they never sold
// a single copy.
//
// Worse, the three mails disagree with each other about what the same products
// cost — Palette Pack Vol. 1 is ¥599 on day 3 and 7 but ¥499 on day 14;
// Complete Archive is ¥2,499 on day 7 and ¥2,799 on day 14. Whichever number a
// recipient saw, at least one of the mails was quoting a price we would not
// have honoured even if the storefront still existed.
//
// Same rule that closed the Auditor pre-order (checkout-config.ts
// `preorderConfig.closed`): a sell surface must not outlive the thing it sells.
//
// DECIDED (owner authorised, 2026-08-18): the packs are retired. `00d7a04`
// already migrated this product to a pure subscription; these mails were the
// leftover that nobody switched off. Day 30 joins them — it is a Complete
// Archive sales pitch, and it also claimed "all 2016 colors" against a real
// 5,446.
//
// Marked RETIRED rather than deleted, matching how `.claude/autopilot-tasks.md`
// retired its newsletter-generation tasks: the reasoning stays next to the code,
// and flipping this to true brings all four back unchanged if the storefront is
// ever rebuilt.
//
// Day 21 is NOT gated — it is the one genuinely useful mail in the sequence
// (three concrete things to build with a palette) and sells nothing. Its stray
// /packs/ link now points at /pro/.
//
// ⚠️ Fulfilment is NOT affected. Past buyers' downloads are static files under
// public/downloads, served by catalog.js, and keep working.
const PACK_MAILS_ENABLED = false; // RETIRED — see above

// A/B variant assignment — deterministic based on email hash
// Ensures same subscriber always gets the same variant
function getVariant(email, numVariants = 2) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
  }
  return String.fromCharCode(65 + (Math.abs(hash) % numVariants)); // "A", "B", or "C"
}

// Ensure subscriber has an ab_variant assigned
function ensureVariant(row) {
  if (!row.ab_variant) {
    const variant = getVariant(row.email, 3);
    db.prepare(`UPDATE subscribers SET ab_variant = ? WHERE id = ?`).run(variant, row.id);
    row.ab_variant = variant;
  }
  return row.ab_variant;
}

// Compute cutoff ISO string so SQLite can use an index on created_at directly
function cutoffISO(ms) {
  return new Date(Date.now() - ms).toISOString();
}

async function runFollowUps() {
  // Day-3: free-pack subscribers who haven't received it yet, subscribed 3+ days ago
  const due3d = PACK_MAILS_ENABLED ? db
    .prepare(
      `SELECT id, email, created_at, ab_variant FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_3d_sent IS NULL
         AND created_at <= ?`,
    )
    .all(cutoffISO(THREE_DAYS_MS)) : [];

  for (const row of due3d) {
    try {
      const variant = ensureVariant(row);
      await sendFollowUp3DayEmail(row.email, { variant });
      db.prepare(
        `UPDATE subscribers SET follow_up_3d_sent = datetime('now'), follow_up_3d_variant = ? WHERE id = ?`,
      ).run(variant, row.id);
      console.log(`[scheduler] day-3 follow-up (variant ${variant}) sent to ${row.email}`);
    } catch (err) {
      console.error(`[scheduler] day-3 failed for ${row.email}:`, err.message);
    }
  }

  // Day-7 (pack price list — RETIRED, see PACK_MAILS_ENABLED)
  const due7d = PACK_MAILS_ENABLED ? db
    .prepare(
      `SELECT id, email, created_at, ab_variant FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_7d_sent IS NULL
         AND created_at <= ?`,
    )
    .all(cutoffISO(SEVEN_DAYS_MS)) : [];

  for (const row of due7d) {
    try {
      const variant = ensureVariant(row);
      await sendFollowUp7DayEmail(row.email, { variant });
      db.prepare(
        `UPDATE subscribers SET follow_up_7d_sent = datetime('now'), follow_up_7d_variant = ? WHERE id = ?`,
      ).run(variant, row.id);
      console.log(`[scheduler] day-7 follow-up (variant ${variant}) sent to ${row.email}`);
    } catch (err) {
      console.error(`[scheduler] day-7 failed for ${row.email}:`, err.message);
    }
  }

  // Day-14: free-pack subscribers who haven't received it yet, subscribed 14+ days ago
  const due14d = PACK_MAILS_ENABLED ? db
    .prepare(
      `SELECT id, email, created_at, ab_variant FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_14d_sent IS NULL
         AND created_at <= ?`,
    )
    .all(cutoffISO(FOURTEEN_DAYS_MS)) : [];

  for (const row of due14d) {
    try {
      const variant = ensureVariant(row);
      await sendFollowUp14DayEmail(row.email, { variant });
      db.prepare(
        `UPDATE subscribers SET follow_up_14d_sent = datetime('now'), follow_up_14d_variant = ? WHERE id = ?`,
      ).run(variant, row.id);
      console.log(`[scheduler] day-14 follow-up (variant ${variant}) sent to ${row.email}`);
    } catch (err) {
      console.error(`[scheduler] day-14 failed for ${row.email}:`, err.message);
    }
  }

  // Day-21: creative inspiration email — use cases and palette ideas
  const due21d = db
    .prepare(
      `SELECT id, email, created_at, ab_variant FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_21d_sent IS NULL
         AND created_at <= ?`,
    )
    .all(cutoffISO(TWENTYONE_DAYS_MS));

  for (const row of due21d) {
    try {
      const variant = ensureVariant(row);
      await sendFollowUp21DayEmail(row.email, { variant });
      db.prepare(
        `UPDATE subscribers SET follow_up_21d_sent = datetime('now'), follow_up_21d_variant = ? WHERE id = ?`,
      ).run(variant, row.id);
      console.log(`[scheduler] day-21 follow-up (variant ${variant}) sent to ${row.email}`);
    } catch (err) {
      console.error(`[scheduler] day-21 failed for ${row.email}:`, err.message);
    }
  }

  // Day-30: final follow-up — catalog conversion email
  // Day-30 (Complete Archive pitch — RETIRED, see PACK_MAILS_ENABLED)
  const due30d = PACK_MAILS_ENABLED ? db
    .prepare(
      `SELECT id, email, created_at, ab_variant FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_30d_sent IS NULL
         AND created_at <= ?`,
    )
    .all(cutoffISO(THIRTY_DAYS_MS)) : [];

  for (const row of due30d) {
    try {
      const variant = ensureVariant(row);
      await sendFollowUp30DayEmail(row.email, { variant });
      db.prepare(
        `UPDATE subscribers SET follow_up_30d_sent = datetime('now'), follow_up_30d_variant = ? WHERE id = ?`,
      ).run(variant, row.id);
      console.log(`[scheduler] day-30 follow-up (variant ${variant}) sent to ${row.email}`);
    } catch (err) {
      console.error(`[scheduler] day-30 failed for ${row.email}:`, err.message);
    }
  }
}

async function runCotdEmails() {
  // Only send between UTC 09:00–09:59 to avoid spamming on restarts
  const utcHour = new Date().getUTCHours();
  if (utcHour !== 9) return;

  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const color = getColorOfDay(todayStr);
  if (!color) return;

  const due = db
    .prepare(
      `SELECT id, email FROM subscribers
       WHERE cotd_subscribed = 1
         AND (cotd_last_sent IS NULL OR cotd_last_sent < date('now'))`,
    )
    .all();

  for (const row of due) {
    try {
      await sendCotdEmail(row.email, color, todayStr);
      db.prepare(`UPDATE subscribers SET cotd_last_sent = date('now') WHERE id = ?`).run(row.id);
      console.log(`[scheduler] cotd sent to ${row.email} (${color.name})`);
    } catch (err) {
      console.error(`[scheduler] cotd failed for ${row.email}:`, err.message);
    }
  }
}

function startScheduler() {
  // Run once on startup (catches any backlog), then on the interval
  runFollowUps().catch((err) => console.error("[scheduler] startup run failed:", err.message));
  runCotdEmails().catch((err) => console.error("[scheduler] cotd startup run failed:", err.message));
  setInterval(() => {
    runFollowUps().catch((err) => console.error("[scheduler] interval run failed:", err.message));
    runCotdEmails().catch((err) => console.error("[scheduler] cotd interval run failed:", err.message));
  }, INTERVAL_MS);
  console.log("[scheduler] email follow-up scheduler started (hourly)");
}

module.exports = { startScheduler };
