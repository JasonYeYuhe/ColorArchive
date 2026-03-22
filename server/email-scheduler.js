const db = require("./db");
const { sendFollowUp3DayEmail, sendFollowUp7DayEmail, sendFollowUp14DayEmail, sendFollowUp21DayEmail, sendFollowUp30DayEmail } = require("./email");

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const TWENTYONE_DAYS_MS = 21 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const INTERVAL_MS = 60 * 60 * 1000; // run every hour

// A/B variant assignment — deterministic based on email hash
// Ensures same subscriber always gets the same variant
function getVariant(email, numVariants = 2) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
  }
  return String.fromCharCode(65 + (Math.abs(hash) % numVariants)); // "A" or "B"
}

// Ensure subscriber has an ab_variant assigned
function ensureVariant(row) {
  if (!row.ab_variant) {
    const variant = getVariant(row.email);
    db.prepare(`UPDATE subscribers SET ab_variant = ? WHERE id = ?`).run(variant, row.id);
    row.ab_variant = variant;
  }
  return row.ab_variant;
}

async function runFollowUps() {
  const now = Date.now();

  // Day-3: free-pack subscribers who haven't received it yet, subscribed 3+ days ago
  const due3d = db
    .prepare(
      `SELECT id, email, created_at, ab_variant FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_3d_sent IS NULL
         AND (strftime('%s', 'now') - strftime('%s', created_at)) * 1000 >= ?`,
    )
    .all(THREE_DAYS_MS);

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

  // Day-7: free-pack subscribers who haven't received it yet, subscribed 7+ days ago
  const due7d = db
    .prepare(
      `SELECT id, email, created_at, ab_variant FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_7d_sent IS NULL
         AND (strftime('%s', 'now') - strftime('%s', created_at)) * 1000 >= ?`,
    )
    .all(SEVEN_DAYS_MS);

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
  const due14d = db
    .prepare(
      `SELECT id, email, created_at, ab_variant FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_14d_sent IS NULL
         AND (strftime('%s', 'now') - strftime('%s', created_at)) * 1000 >= ?`,
    )
    .all(FOURTEEN_DAYS_MS);

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
         AND (strftime('%s', 'now') - strftime('%s', created_at)) * 1000 >= ?`,
    )
    .all(TWENTYONE_DAYS_MS);

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
}

  // Day-30: final follow-up — catalog conversion email
  const due30d = db
    .prepare(
      `SELECT id, email, created_at, ab_variant FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_30d_sent IS NULL
         AND (strftime('%s', 'now') - strftime('%s', created_at)) * 1000 >= ?`,
    )
    .all(THIRTY_DAYS_MS);

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

function startScheduler() {
  // Run once on startup (catches any backlog), then on the interval
  runFollowUps().catch((err) => console.error("[scheduler] startup run failed:", err.message));
  setInterval(() => {
    runFollowUps().catch((err) => console.error("[scheduler] interval run failed:", err.message));
  }, INTERVAL_MS);
  console.log("[scheduler] email follow-up scheduler started (hourly)");
}

module.exports = { startScheduler };
