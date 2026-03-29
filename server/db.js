const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "data.db"));

function ensureColumn(tableName, definition) {
  try {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  } catch (error) {
    if (!String(error.message).includes("duplicate column name")) {
      throw error;
    }
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    email     TEXT UNIQUE NOT NULL,
    source    TEXT NOT NULL DEFAULT 'free-pack',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,
    email       TEXT NOT NULL,
    product     TEXT NOT NULL,
    amount      INTEGER NOT NULL,
    currency    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS magic_link_tokens (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    token_hash  TEXT UNIQUE NOT NULL,
    expires_at  INTEGER NOT NULL,
    used_at     TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    token_hash  TEXT UNIQUE NOT NULL,
    expires_at  INTEGER NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id         INTEGER PRIMARY KEY,
    favorites_json  TEXT NOT NULL DEFAULT '[]',
    palette_json    TEXT NOT NULL DEFAULT '[]',
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS pageviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    path        TEXT NOT NULL,
    referrer    TEXT,
    screen_width INTEGER,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

ensureColumn("orders", "pack_id TEXT");
ensureColumn("orders", "download_url TEXT");
ensureColumn("orders", "receipt_url TEXT");
ensureColumn("orders", "attributed_source TEXT");
ensureColumn("orders", "attributed_utm_source TEXT");
ensureColumn("orders", "attributed_utm_medium TEXT");
ensureColumn("orders", "attributed_utm_campaign TEXT");
ensureColumn("orders", "attributed_utm_term TEXT");
ensureColumn("orders", "attributed_utm_content TEXT");
ensureColumn("orders", "attributed_landing_path TEXT");

ensureColumn("subscribers", "landing_path TEXT");
ensureColumn("subscribers", "referrer TEXT");
ensureColumn("subscribers", "utm_source TEXT");
ensureColumn("subscribers", "utm_medium TEXT");
ensureColumn("subscribers", "utm_campaign TEXT");
ensureColumn("subscribers", "utm_term TEXT");
ensureColumn("subscribers", "utm_content TEXT");
ensureColumn("subscribers", "follow_up_3d_sent TEXT");
ensureColumn("subscribers", "follow_up_7d_sent TEXT");
ensureColumn("subscribers", "follow_up_14d_sent TEXT");
ensureColumn("subscribers", "ab_variant TEXT");
ensureColumn("subscribers", "follow_up_3d_variant TEXT");
ensureColumn("subscribers", "follow_up_7d_variant TEXT");
ensureColumn("subscribers", "follow_up_14d_variant TEXT");
ensureColumn("subscribers", "follow_up_21d_sent TEXT");
ensureColumn("subscribers", "follow_up_21d_variant TEXT");
ensureColumn("subscribers", "follow_up_30d_sent TEXT");
ensureColumn("subscribers", "follow_up_30d_variant TEXT");
ensureColumn("subscribers", "cotd_subscribed INTEGER DEFAULT 0");
ensureColumn("subscribers", "cotd_last_sent TEXT");

ensureColumn("users", "tier TEXT DEFAULT 'free'");
ensureColumn("users", "pro_expires_at TEXT");
ensureColumn("users", "credits INTEGER DEFAULT 0");
ensureColumn("users", "referral_code TEXT");
ensureColumn("users", "api_key TEXT");

ensureColumn("subscribers", "referred_by TEXT");

// AI usage tracking — per user (or IP hash) per day
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_usage (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL,
    date       TEXT NOT NULL,
    count      INTEGER NOT NULL DEFAULT 0,
    UNIQUE(identifier, date)
  );

  CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name  TEXT NOT NULL,
    props_json  TEXT NOT NULL DEFAULT '{}',
    user_id     INTEGER,
    session_id  TEXT,
    path        TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    name        TEXT NOT NULL,
    tags_json   TEXT NOT NULL DEFAULT '[]',
    palette_json TEXT NOT NULL DEFAULT '[]',
    notes       TEXT NOT NULL DEFAULT '',
    share_id    TEXT UNIQUE,
    critique_json TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Stripe subscription tracking
ensureColumn("users", "stripe_customer_id TEXT");
ensureColumn("users", "stripe_subscription_id TEXT");
ensureColumn("users", "subscription_status TEXT");
ensureColumn("users", "subscription_plan TEXT");
ensureColumn("users", "subscription_current_period_end TEXT");
ensureColumn("users", "subscription_cancel_at_period_end INTEGER DEFAULT 0");

// Stripe order support
ensureColumn("orders", "stripe_session_id TEXT");
ensureColumn("orders", "payment_intent TEXT");

module.exports = db;
