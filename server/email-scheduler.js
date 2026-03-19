const db = require("./db");
const { sendFollowUp3DayEmail, sendFollowUp7DayEmail } = require("./email");

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const INTERVAL_MS = 60 * 60 * 1000; // run every hour

async function runFollowUps() {
  const now = Date.now();

  // Day-3: free-pack subscribers who haven't received it yet, subscribed 3+ days ago
  const due3d = db
    .prepare(
      `SELECT id, email, created_at FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_3d_sent IS NULL
         AND (strftime('%s', 'now') - strftime('%s', created_at)) * 1000 >= ?`,
    )
    .all(THREE_DAYS_MS);

  for (const row of due3d) {
    try {
      await sendFollowUp3DayEmail(row.email);
      db.prepare(`UPDATE subscribers SET follow_up_3d_sent = datetime('now') WHERE id = ?`).run(
        row.id,
      );
      console.log(`[scheduler] day-3 follow-up sent to ${row.email}`);
    } catch (err) {
      console.error(`[scheduler] day-3 failed for ${row.email}:`, err.message);
    }
  }

  // Day-7: free-pack subscribers who haven't received it yet, subscribed 7+ days ago
  const due7d = db
    .prepare(
      `SELECT id, email, created_at FROM subscribers
       WHERE source = 'free-pack'
         AND follow_up_7d_sent IS NULL
         AND (strftime('%s', 'now') - strftime('%s', created_at)) * 1000 >= ?`,
    )
    .all(SEVEN_DAYS_MS);

  for (const row of due7d) {
    try {
      await sendFollowUp7DayEmail(row.email);
      db.prepare(`UPDATE subscribers SET follow_up_7d_sent = datetime('now') WHERE id = ?`).run(
        row.id,
      );
      console.log(`[scheduler] day-7 follow-up sent to ${row.email}`);
    } catch (err) {
      console.error(`[scheduler] day-7 failed for ${row.email}:`, err.message);
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
