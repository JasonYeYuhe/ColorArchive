const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "data.db"));
db.pragma("foreign_keys = ON");
// WAL + relaxed sync + busy timeout: readers (admin dashboards) no longer block the
// high-volume event/pageview writers and vice versa, and a busy writer waits up to 5s
// instead of dropping the write on SQLITE_BUSY. Standard config for concurrent web load.
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("busy_timeout = 5000");

// Migration helper — adequate for current scale. Consider better-sqlite3-migrations
// or umzug if schema changes become more complex or need rollback support.
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
ensureColumn("users", "api_key_hash TEXT");
ensureColumn("users", "api_key_prefix TEXT");

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

// Source/channel attribution on the acquisition funnel (events + pageviews). Lets the exit
// gate split the funnel by channel — qualified ICP traffic vs. generic gawkers — instead of
// only knowing total counts. Written from the client's first-touch attribution.
ensureColumn("events", "channel TEXT");
ensureColumn("events", "utm_source TEXT");
ensureColumn("events", "utm_medium TEXT");
ensureColumn("events", "utm_campaign TEXT");
ensureColumn("events", "referrer_domain TEXT");
ensureColumn("events", "landing_path TEXT");

ensureColumn("pageviews", "channel TEXT");
ensureColumn("pageviews", "utm_source TEXT");
ensureColumn("pageviews", "utm_medium TEXT");
ensureColumn("pageviews", "utm_campaign TEXT");
ensureColumn("pageviews", "referrer_domain TEXT");
ensureColumn("pageviews", "landing_path TEXT");

// Performance indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
  CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
  CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON pageviews(created_at);
  CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
  CREATE INDEX IF NOT EXISTS idx_events_event_name ON events(event_name);
  CREATE INDEX IF NOT EXISTS idx_events_channel ON events(channel);
  CREATE INDEX IF NOT EXISTS idx_pageviews_channel ON pageviews(channel);
  CREATE INDEX IF NOT EXISTS idx_pageviews_path ON pageviews(path);
  CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
  CREATE INDEX IF NOT EXISTS idx_users_api_key_hash ON users(api_key_hash);
  CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
  CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
  CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
  CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_ai_usage_identifier_date ON ai_usage(identifier, date);
  -- Composite indexes for the exit-gate analytics (filter by window + group/filter by name/source).
  CREATE INDEX IF NOT EXISTS idx_events_event_name_created_at ON events(event_name, created_at);
  CREATE INDEX IF NOT EXISTS idx_orders_attributed_source_created_at ON orders(attributed_source, created_at);
`);

// Apple IAP purchases
db.exec(`
  CREATE TABLE IF NOT EXISTS apple_purchases (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                 INTEGER NOT NULL,
    product_id              TEXT NOT NULL,
    original_transaction_id TEXT UNIQUE NOT NULL,
    transaction_date        TEXT NOT NULL,
    environment             TEXT NOT NULL DEFAULT 'Production',
    status                  TEXT NOT NULL DEFAULT 'active',
    created_at              TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_apple_purchases_user_id ON apple_purchases(user_id);
  CREATE INDEX IF NOT EXISTS idx_apple_purchases_original_txn ON apple_purchases(original_transaction_id);
`);

// Apple-specific columns on users
ensureColumn("users", "apple_original_transaction_id TEXT");

// Apple subscription lifecycle tracking
ensureColumn("apple_purchases", "expires_date TEXT");
ensureColumn("apple_purchases", "auto_renew_status INTEGER DEFAULT 1");

// Multi-provider payment support
ensureColumn("users", "payment_provider TEXT");
ensureColumn("users", "provider_customer_id TEXT");
ensureColumn("users", "provider_subscription_id TEXT");

// Test-mode flag for LS (and any future provider) — lets admin
// dashboards + growth metrics filter synthetic/test-mode activity
// out of the real numbers. 0 = real, 1 = test.
ensureColumn("orders", "is_test INTEGER DEFAULT 0");
ensureColumn("users", "is_test INTEGER DEFAULT 0");
ensureColumn("subscribers", "is_test INTEGER DEFAULT 0");

// Card fingerprint for weak cross-account duplicate detection.
// LS webhook subscription.attrs exposes card_brand + card_last_four
// (not PCI-sensitive — receipts already show them). We concat and
// store on the user. On a new subscription-checkout, scan for any
// other active Pro user with the same fingerprint inside the last
// 30 days → soft-flag as a suspected duplicate (trial abuse). Never
// hard-blocks; legitimate family-card / gift scenarios stay alive.
ensureColumn("users", "card_fingerprint TEXT");
ensureColumn("users", "is_duplicate INTEGER DEFAULT 0");
ensureColumn("users", "duplicate_suspects TEXT"); // JSON array of user ids

// Migrate plaintext API keys to hashed storage
const crypto = require("crypto");
function hashApiKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

const plaintextKeys = db.prepare("SELECT id, api_key FROM users WHERE api_key IS NOT NULL AND api_key_hash IS NULL").all();
if (plaintextKeys.length > 0) {
  const migrate = db.prepare("UPDATE users SET api_key_hash = ?, api_key_prefix = ?, api_key = NULL WHERE id = ?");
  const tx = db.transaction(() => {
    for (const row of plaintextKeys) {
      migrate.run(hashApiKey(row.api_key), row.api_key.slice(0, 7) + "...", row.id);
    }
  });
  tx();
  console.log(`[db] Migrated ${plaintextKeys.length} API keys to hashed storage`);
}

module.exports = db;
module.exports.hashApiKey = hashApiKey;
