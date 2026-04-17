#!/usr/bin/env node
/**
 * Synthetic Lemon Squeezy webhook validator.
 *
 * MANUAL USE ONLY — this script writes real rows (is_test=1) to the
 * prod DB and sends real (test-mode-prefixed) receipt emails via
 * Resend. It is not safe to run in a CI pipeline against the prod
 * endpoint. If we ever need CI coverage, stand up a staging instance
 * that points to a throwaway DB + a Resend test key.
 *
 * What it does: fires HMAC-signed payloads at the production webhook
 * endpoint and confirms each one flows through our full stack
 * (Vercel forwarder → Express fulfillment → DB row → receipt email).
 * Does NOT require a real LS purchase — usable any time commerce
 * code changes.
 *
 * Usage:
 *   node scripts/validate-ls-webhook.mjs
 *     Runs all 5 core events as test_mode: true
 *
 *   node scripts/validate-ls-webhook.mjs --replay path/to/raw.json
 *     Replays a real captured LS payload from the raw-log file. The
 *     raw body is re-signed with our local secret and sent byte-for-
 *     byte, so fulfillment sees the exact payload LS originally sent.
 *
 * Env vars:
 *   LEMONSQUEEZY_WEBHOOK_SECRET  — HMAC key (required)
 *   LS_WEBHOOK_ENDPOINT          — override URL (default prod)
 *   LS_TEST_EMAIL                — email address to use as buyer
 *                                  (default: test+ls-validate@colorarchive.org)
 *
 * Exit code 0 iff all events returned 200. Any 4xx/5xx → exit 1.
 *
 * Cleanup after a run:
 *   ssh root@<droplet> "sqlite3 /root/.../data.db
 *     \"DELETE FROM orders WHERE email LIKE 'test+%';
 *       DELETE FROM users WHERE email LIKE 'test+%';
 *       DELETE FROM subscribers WHERE email LIKE 'test+%'\""
 */

import { readFileSync, existsSync } from "node:fs";
import { createHmac } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_ENDPOINT = "https://colorarchive.org/api/webhook";
const DEFAULT_EMAIL = "test+ls-validate@colorarchive.org";

/* ── Load .env.local for secret ─────────────────────────── */
function loadDotEnv(filename) {
  const p = path.join(REPO_ROOT, filename);
  if (!existsSync(p)) return;
  for (const raw of readFileSync(p, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadDotEnv(".env.local");

const SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const ENDPOINT = process.env.LS_WEBHOOK_ENDPOINT || DEFAULT_ENDPOINT;
const EMAIL = process.env.LS_TEST_EMAIL || DEFAULT_EMAIL;

if (!SECRET) {
  console.error("✗ LEMONSQUEEZY_WEBHOOK_SECRET not set (check .env.local)");
  process.exit(2);
}

/* ── Synthetic payload builders ─────────────────────────── */
// These mirror the shape of the attributes our Vercel handler actually
// consumes in app/api/webhook/route.ts. Fields not read by our code
// are omitted — synthetic minimalism over structural fidelity.

function makeSubscriptionCreated({ plan, email, subId }) {
  const variantName = plan === "yearly" ? "ColorArchive Pro — Yearly" : "ColorArchive Pro — Monthly";
  return {
    meta: {
      event_name: "subscription_created",
      custom_data: {},
    },
    data: {
      id: subId,
      attributes: {
        user_email: email,
        customer_id: "test-customer-1",
        variant_name: variantName,
        status: "on_trial",
        test_mode: true,
        total: plan === "yearly" ? 3999 : 499,
        subtotal: plan === "yearly" ? 3999 : 499,
        currency: "JPY",
        first_order_item: {
          variant_name: variantName,
          total: plan === "yearly" ? 3999 : 499,
        },
      },
    },
  };
}

function makeOrderCreatedLifetime({ email, orderId }) {
  return {
    meta: {
      event_name: "order_created",
      custom_data: {},
    },
    data: {
      id: orderId,
      attributes: {
        user_email: email,
        customer_id: "test-customer-1",
        variant_name: "ColorArchive Pro — Lifetime",
        test_mode: true,
        total: 19999,
        subtotal: 19999,
        currency: "JPY",
        first_order_item: {
          variant_name: "ColorArchive Pro — Lifetime",
          total: 19999,
        },
      },
    },
  };
}

function makeSubscriptionUpdated({ subId, status }) {
  return {
    meta: { event_name: "subscription_updated", custom_data: {} },
    data: {
      id: subId,
      attributes: {
        customer_id: "test-customer-1",
        status,
        test_mode: true,
        renews_at: status === "active"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        ends_at: status === "cancelled"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      },
    },
  };
}

function makeSubscriptionCancelled({ subId }) {
  return {
    meta: { event_name: "subscription_cancelled", custom_data: {} },
    data: {
      id: subId,
      attributes: {
        customer_id: "test-customer-1",
        test_mode: true,
      },
    },
  };
}

/* ── HMAC + POST ────────────────────────────────────────── */

function sign(body) {
  return createHmac("sha256", SECRET).update(body).digest("hex");
}

/**
 * Send a pre-formed raw body + signature header. Caller is responsible
 * for providing the exact bytes that should be signed. This keeps
 * replay faithful to the original LS payload (no JSON.stringify round-
 * trip that could mutate field order / whitespace / number precision).
 */
async function postRaw(body, label) {
  const signature = sign(body);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-signature": signature,
    },
    body,
  });
  const text = await res.text();
  const ok = res.status === 200;
  const mark = ok ? "✓" : "✗";
  console.log(`${mark} ${label.padEnd(36)} → ${res.status} ${text.slice(0, 120)}`);
  return ok;
}

async function post(event, label) {
  return postRaw(JSON.stringify(event), label);
}

/* ── Orchestrate ────────────────────────────────────────── */

async function runSynthetic() {
  console.log(`Endpoint:  ${ENDPOINT}`);
  console.log(`Buyer:     ${EMAIL}`);
  console.log("Firing 4 synthetic test-mode events…\n");

  const subMonthly = `test-sub-${Date.now()}-m`;
  const subYearly = `test-sub-${Date.now()}-y`;
  const orderLifetime = `test-order-${Date.now()}-l`;

  const results = [];
  results.push(await post(
    makeSubscriptionCreated({ plan: "monthly", email: EMAIL, subId: subMonthly }),
    "subscription_created (Monthly)",
  ));
  results.push(await post(
    makeSubscriptionCreated({ plan: "yearly", email: EMAIL, subId: subYearly }),
    "subscription_created (Yearly)",
  ));
  results.push(await post(
    makeOrderCreatedLifetime({ email: EMAIL, orderId: orderLifetime }),
    "order_created (Lifetime)",
  ));
  results.push(await post(
    makeSubscriptionUpdated({ subId: subMonthly, status: "active" }),
    "subscription_updated (active)",
  ));
  results.push(await post(
    makeSubscriptionCancelled({ subId: subMonthly }),
    "subscription_cancelled",
  ));

  console.log("");
  const allOk = results.every(Boolean);
  if (!allOk) {
    console.error("✗ One or more events failed. See responses above.");
    process.exit(1);
  }
  console.log("✓ All events accepted with 200.");
  console.log("");
  console.log("Next:");
  console.log("1. Check /admin/autopilot/ with 'show test rows' toggled — you should see");
  console.log(`   at least three new orders under ${EMAIL} (Monthly, Yearly, Lifetime).`);
  console.log(`2. Inbox for ${EMAIL}: 3 receipt emails ([TEST]-prefixed).`);
  console.log("3. Clean test rows when done:");
  console.log(`   sqlite3 data.db "DELETE FROM orders WHERE email = '${EMAIL}'"`);
  console.log(`   (same for users, subscribers)`);
}

async function runReplay(replayPath) {
  const fullPath = path.isAbsolute(replayPath)
    ? replayPath
    : path.resolve(process.cwd(), replayPath);
  const raw = readFileSync(fullPath, "utf8");
  const entry = JSON.parse(raw);
  // Keep entry.raw as a string throughout — no JSON.parse round-trip,
  // so we preserve byte-for-byte what LS originally sent (whitespace,
  // field order, big-int precision on subscription IDs, etc.).
  const body = typeof entry.raw === "string"
    ? entry.raw
    : JSON.stringify(entry.raw);

  console.log(`Replaying captured event from ${replayPath}`);
  console.log(`Event:     ${entry.event_name}`);
  console.log(`Captured:  ${entry.at}`);
  console.log("");

  const ok = await postRaw(body, `REPLAY ${entry.event_name}`);
  if (!ok) process.exit(1);
  console.log("✓ Replay succeeded.");
}

const replayIdx = process.argv.indexOf("--replay");
if (replayIdx !== -1 && process.argv[replayIdx + 1]) {
  await runReplay(process.argv[replayIdx + 1]);
} else {
  await runSynthetic();
}
