#!/usr/bin/env node
/**
 * backup-health.cjs — the watcher that does NOT live on the Mac.
 *
 *   0 8 * * * /usr/bin/node /root/ColorArchive/server/scripts/backup-health.cjs \
 *               >> /root/ColorArchive/server/logs/backup-health.log 2>&1
 *
 * ─── WHY THIS EXISTS ───────────────────────────────────────────────────────
 *
 * After 2026-09-01 the backup system has five tiers, and until now every
 * staleness alarm for the off-box ones lived in ONE place: pull-offsite.sh on
 * Jason's Mac. That is the same mistake as the failure it was written to catch.
 *
 *   A host cannot be trusted to report its own death.
 *
 * If the Mac stops — closed lid for a fortnight, disk full, rclone token
 * expired, LaunchAgent unloaded — then tier 2 stops, tier 5 (Google Drive)
 * stops, AND the thing that would have told anyone stops, all at once and
 * silently. Tier 3 keeps uploading from the VM, so the newest blob still looks
 * fresh; nothing anywhere notices that two tiers died.
 *
 * So the two machines watch each other, with different credentials:
 *   • pull-offsite.sh (Mac)  → alarms if the VM's blob uploads go stale
 *   • this script    (VM)    → alarms if the MAC goes stale
 *
 * The Mac proves it is alive by writing `_heartbeat-mac.txt` into the same
 * container after every successful run. This script reads it. That is the only
 * signal that covers tiers 2 and 5, because the VM deliberately holds no Google
 * Drive credential — giving it one would collapse the "different provider,
 * separate credential" property that is the entire point of tier 5.
 *
 * ─── EMAILS ONLY WHEN SOMETHING IS WRONG ───────────────────────────────────
 *
 * Deliberately silent when healthy. A report that arrives every day gets
 * filtered, and then the one that matters is filtered with it. The same reason
 * the Mac's notification only fires on failure.
 *
 * Auth is the VM's managed identity via IMDS — no key, no SAS, nothing on disk.
 * Read-only: this script never writes or deletes a blob.
 */
const path = require("path");
const fs = require("fs");
const SERVER_DIR = "/root/ColorArchive/server";
require(path.join(SERVER_DIR, "node_modules/dotenv")).config({ path: path.join(SERVER_DIR, ".env") });
const { Resend } = require(path.join(SERVER_DIR, "node_modules/resend"));

const OWNER_EMAIL = process.env.GATE_REPORT_TO || "yyyyy.yeyuhe@gmail.com";
const FROM = process.env.FROM_EMAIL || "hello@colorarchive.org";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || "colorarchivestu";
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER || "sqlite-backups";
const ENDPOINT = `https://${ACCOUNT}.blob.core.windows.net`;
const API_VERSION = "2021-08-06";
const LOCAL_BACKUPS = process.env.CA_BACKUP_DIR || path.join(SERVER_DIR, "backups");

// Thresholds. Generous on purpose: this should fire when something is genuinely
// broken, not when a run was 20 minutes late. Cadence is 6h everywhere.
const LOCAL_MAX_H = 9;    // tier 1, cron at :00 every 6h
const CLOUD_MAX_H = 30;   // tier 3, ~5 consecutive misses
const MAC_MAX_H = 30;     // tiers 2+5, same

const hoursSince = (d) => (Date.now() - d.getTime()) / 3_600_000;
const fmt = (h) => (h == null ? "n/a" : `${h.toFixed(1)}h`);

async function imdsToken() {
  const url =
    "http://169.254.169.254/metadata/identity/oauth2/token" +
    "?api-version=2018-02-01&resource=https%3A%2F%2Fstorage.azure.com%2F";
  const res = await fetch(url, { headers: { Metadata: "true" }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`IMDS ${res.status}`);
  const j = await res.json();
  if (!j.access_token) throw new Error("IMDS returned no access_token");
  return j.access_token;
}

async function listBlobs(token, prefix) {
  const url = `${ENDPOINT}/${CONTAINER}?restype=container&comp=list&prefix=${encodeURIComponent(prefix)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "x-ms-version": API_VERSION },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`List Blobs ${res.status}`);
  const xml = await res.text();
  // Minimal parse: <Blob><Name>x</Name><Properties><Last-Modified>d</Last-Modified>
  const out = [];
  const re = /<Blob>[\s\S]*?<Name>([^<]+)<\/Name>[\s\S]*?<Last-Modified>([^<]+)<\/Last-Modified>[\s\S]*?<\/Blob>/g;
  let m;
  while ((m = re.exec(xml)) !== null) out.push({ name: m[1], modified: new Date(m[2]) });
  return out;
}

(async () => {
  const problems = [];
  const lines = [];
  const stamp = new Date().toISOString().replace("T", " ").slice(0, 19) + "Z";

  /* ── tier 1: local snapshots on this box ─────────────────────────── */
  try {
    const files = fs
      .readdirSync(LOCAL_BACKUPS)
      .filter((f) => /^data-.*\.sqlite$/.test(f))
      .map((f) => ({ f, m: fs.statSync(path.join(LOCAL_BACKUPS, f)).mtime }))
      .sort((a, b) => b.m - a.m);
    if (!files.length) {
      problems.push("TIER 1 (this VM): no local snapshots at all in " + LOCAL_BACKUPS);
    } else {
      const age = hoursSince(files[0].m);
      lines.push(`tier 1  local snapshot   ${fmt(age)} old   ${files[0].f}   (${files.length} kept)`);
      if (age > LOCAL_MAX_H) problems.push(`TIER 1 (this VM): newest local snapshot is ${fmt(age)} old (> ${LOCAL_MAX_H}h). Is the backup-sqlite.sh cron still running?`);
    }
  } catch (e) {
    problems.push(`TIER 1 (this VM): could not read ${LOCAL_BACKUPS} — ${e.message}`);
  }

  /* ── tier 3 + the Mac heartbeat, both from the blob container ─────── */
  try {
    const token = await imdsToken();

    const snaps = (await listBlobs(token, "colorarchive-")).filter((b) => b.name.endsWith(".sqlite.gz"));
    if (!snaps.length) {
      problems.push("TIER 3 (Azure Blob): the container holds NO ColorArchive snapshot.");
    } else {
      snaps.sort((a, b) => b.modified - a.modified);
      const age = hoursSince(snaps[0].modified);
      lines.push(`tier 3  Azure Blob       ${fmt(age)} old   ${snaps[0].name}   (${snaps.length} kept)`);
      if (age > CLOUD_MAX_H) problems.push(`TIER 3 (Azure Blob): newest cloud backup is ${fmt(age)} old (> ${CLOUD_MAX_H}h). sync-azure.sh on this VM is not uploading — check logs/azure-sync.log and that the managed identity still holds its role.`);
    }

    const hb = (await listBlobs(token, "_heartbeat-mac"))[0];
    if (!hb) {
      problems.push("TIERS 2+5 (Mac / Google Drive): no heartbeat from the Mac has ever been written. Either pull-offsite.sh has not run since this check was installed, or its heartbeat step is broken.");
    } else {
      const age = hoursSince(hb.modified);
      lines.push(`tiers 2+5  Mac heartbeat ${fmt(age)} old`);
      if (age > MAC_MAX_H) {
        problems.push(
          `TIERS 2+5 (Mac / Google Drive): the Mac has not checked in for ${fmt(age)} (> ${MAC_MAX_H}h).\n` +
          `    Tier 3 above may still look healthy — this VM keeps uploading regardless — but the Mac\n` +
          `    copy AND the Google Drive copy have both stopped, and so has the alarm that watches THIS\n` +
          `    machine. Check: is the Mac awake? \`launchctl list | grep offsite\`, and\n` +
          `    ~/Library/do-harvest-offsite/last-run-status.txt`
        );
      }
    }
  } catch (e) {
    problems.push(`TIER 3 / heartbeat: could not query Azure Blob — ${e.message}. If this says IMDS, the VM's managed identity may have been removed.`);
  }

  /* ── report ──────────────────────────────────────────────────────── */
  const body =
    `ColorArchive backup health — ${stamp}\n\n` +
    lines.map((l) => "  " + l).join("\n") +
    (problems.length
      ? `\n\n${problems.length} PROBLEM(S):\n\n` + problems.map((p) => "  ✗ " + p).join("\n\n")
      : "\n\n  All tiers healthy.") +
    `\n\nThresholds: tier1 ${LOCAL_MAX_H}h, tier3 ${CLOUD_MAX_H}h, Mac heartbeat ${MAC_MAX_H}h.\n` +
    `Runbook: docs/backup-runbook.md\n`;

  console.log(body);
  try {
    fs.appendFileSync(
      path.join(SERVER_DIR, "logs/backup-health.log"),
      `[${stamp}] ${problems.length ? "PROBLEM x" + problems.length : "ok"} | ${lines.join(" | ")}\n`
    );
  } catch { /* logging must never be the thing that fails */ }

  if (!problems.length) return;              // silent when healthy, on purpose
  if (process.argv.includes("--dry-run")) { console.log("(--dry-run: no email sent)"); return; }
  if (!resend) { console.error("No RESEND_API_KEY — printed only, no email sent."); process.exit(1); }

  const r = await resend.emails.send({
    from: `ColorArchive <${FROM}>`,
    reply_to: FROM,
    to: OWNER_EMAIL,
    subject: `[ColorArchive] ⚠️ backup health: ${problems.length} problem(s)`,
    text: body,
  });
  if (r.error) { console.error("Resend error:", JSON.stringify(r.error)); process.exit(1); }
  console.log(`Emailed ${OWNER_EMAIL} (id=${r.data && r.data.id}).`);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
