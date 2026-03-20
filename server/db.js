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
    ls_order_id TEXT UNIQUE NOT NULL,
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

module.exports = db;
