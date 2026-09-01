#!/usr/bin/env bash
# sync-azure.sh — cloud copy of both SQLite databases to Azure Blob Storage.
#
# Runs from root cron at :10 past every 6h (backups are written at :00):
#   10 */6 * * * /root/ColorArchive/server/scripts/sync-azure.sh \
#                  >> /root/ColorArchive/server/logs/azure-sync.log 2>&1
#
# ─── REWRITTEN 2026-09-01. READ THIS BEFORE CHANGING IT. ────────────────────
#
# 🔴 THE VERSION THIS REPLACES UPLOADED ZERO BYTES FOR FIVE MONTHS.
#
# It had been in this same crontab slot since 2026-07-08. Its skip() logged one
# line and then `exit 0`, so cron recorded a success on every single run while
# nothing happened. First the cached `az login` expired; then the 2026-08-29
# migration moved us to a box where `az` was not installed at all. The container's
# newest blob was dated 2026-04-04 and nobody knew.
#
#   A backup job that exits 0 without backing anything up is worse than no backup
#   job at all, because it manufactures the belief that the backup exists.
#
# Three things follow from that, and they are the design of this file:
#
#   1. NO CREDENTIAL THAT CAN EXPIRE. Authentication is the VM's own
#      system-assigned managed identity, fetched from IMDS at 169.254.169.254.
#      There is no key, no SAS, no `az login`, nothing on disk to rotate or leak.
#      That removes the exact failure mode that killed the previous version.
#   2. NO SILENT SUCCESS. Every failure path sets rc=1 and prints ERROR. The word
#      "skip" does not appear in this file.
#   3. VERIFY, DON'T ASSUME. After uploading, it downloads the blob back,
#      decompresses it, compares md5 against the local file and runs
#      integrity_check on the result. "The upload returned 201" is not evidence
#      that a backup is restorable.
#
# ─── WHY THIS HOST CANNOT DELETE ITS OWN BACKUPS ───────────────────────────
#
# The identity is granted a CUSTOM role, "Blob Backup Writer (no delete)",
# scoped to the sqlite-backups container only. It has blobs/read + blobs/write
# and deliberately NOT blobs/delete — verified from this box: DELETE returns 403.
# A backup producer that can erase its own backup history is one compromise away
# from having no backups, and this host is the thing most likely to be
# compromised. Blob versioning + 30-day soft delete on the account cover the
# remaining case (write is still overwrite).
#
# Retention therefore does NOT live here. It runs from the Mac, which holds a
# separate credential. See docs/backup-runbook.md.
#
# ─── HOW A FAILURE HERE ACTUALLY REACHES A HUMAN ───────────────────────────
#
# It does not — not from this box. rc=1 lands in azure-sync.log and cron mails
# nobody. The alerting path is deliberately CROSS-MACHINE: the Mac's 6-hourly
# pull-offsite.sh checks the age of the newest blob and raises a macOS
# notification if it exceeds 30h. A host cannot be trusted to report its own
# death, so the check that matters runs somewhere else.
set -uo pipefail

CA_BACKUP_DIR="${CA_BACKUP_DIR:-/root/ColorArchive/server/backups}"
STRIDE_BACKUP_DIR="${STRIDE_BACKUP_DIR:-/root/backups}"
ACCOUNT="${AZURE_STORAGE_ACCOUNT:-colorarchivestu}"
CONTAINER="${AZURE_STORAGE_CONTAINER:-sqlite-backups}"
API_VERSION="2021-08-06"
IMDS="http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fstorage.azure.com%2F"
ENDPOINT="https://${ACCOUNT}.blob.core.windows.net"

rc=0
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
fail() { log "ERROR: $*"; rc=1; }

# --- Token ------------------------------------------------------------------
TOKEN="$(curl -s -H Metadata:true --max-time 15 "$IMDS" 2>/dev/null \
  | python3 -c 'import json,sys; print(json.load(sys.stdin).get("access_token",""))' 2>/dev/null)"
if [[ -z "$TOKEN" ]]; then
  fail "could not get a managed-identity token from IMDS. Is the system-assigned identity still enabled on this VM? (az vm identity show -g apps-prod-rg -n apps-prod-vm)"
  log "done (rc=$rc)"
  exit $rc
fi

auth=(-H "Authorization: Bearer $TOKEN" -H "x-ms-version: $API_VERSION")

# upload_one <backup_dir> <glob> <label> <blob_prefix>
upload_one() {
  local dir="$1" glob="$2" label="$3" prefix="$4"

  local newest
  newest="$(find "$dir" -maxdepth 1 -name "$glob" -type f -printf '%T@ %p\n' 2>/dev/null \
            | sort -nr | head -1 | cut -d' ' -f2-)"
  if [[ -z "$newest" || ! -f "$newest" ]]; then
    fail "($label) no local snapshot found in $dir matching $glob"
    return
  fi

  # Blob name carries the snapshot's own stamp, so this is idempotent and the
  # blob is traceable to an exact local file. The Mac's pull-offsite.sh derives
  # the SAME name from the SAME filename, so whichever runs first wins and the
  # other simply finds it already there — they must not diverge.
  local base stamp blob
  base="$(basename "$newest")"
  stamp="${base#data-}"; stamp="${stamp#stride-}"; stamp="${stamp%.sqlite}"; stamp="${stamp%.db}"
  blob="${prefix}-${stamp}.sqlite.gz"

  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' -I "${auth[@]}" "$ENDPOINT/$CONTAINER/$blob" 2>/dev/null)"
  if [[ "$code" == "200" ]]; then
    log "($label) $blob already present — nothing new since the last run"
    return
  elif [[ "$code" != "404" ]]; then
    fail "($label) unexpected HTTP $code probing $blob (403 = the identity lost its role assignment)"
    return
  fi

  local gz="/tmp/.sync-azure-$blob"
  rm -f "$gz"
  if ! gzip -c "$newest" > "$gz"; then
    fail "($label) gzip failed for $base"; rm -f "$gz"; return
  fi

  log "($label) uploading $blob ($(du -h "$gz" | cut -f1) gz, from $(du -h "$newest" | cut -f1))"
  code="$(curl -s -o /dev/null -w '%{http_code}' -X PUT "${auth[@]}" \
      -H "x-ms-blob-type: BlockBlob" \
      -H "x-ms-access-tier: Cool" \
      -H "Content-Type: application/gzip" \
      --data-binary "@$gz" "$ENDPOINT/$CONTAINER/$blob" 2>/dev/null)"
  if [[ "$code" != "201" ]]; then
    fail "($label) upload of $blob failed with HTTP $code"
    rm -f "$gz"; return
  fi

  # --- Verify the CLOUD copy, not the local one ---------------------------
  local back="/tmp/.sync-azure-verify.gz" plain="/tmp/.sync-azure-verify.sqlite"
  rm -f "$back" "$plain"
  code="$(curl -s -o "$back" -w '%{http_code}' "${auth[@]}" "$ENDPOINT/$CONTAINER/$blob" 2>/dev/null)"
  if [[ "$code" != "200" ]]; then
    fail "($label) uploaded $blob but could NOT read it back (HTTP $code) — treat as unverified"
    rm -f "$gz" "$back"; return
  fi
  if ! gunzip -c "$back" > "$plain" 2>/dev/null; then
    fail "($label) $blob will not decompress — the cloud copy is corrupt"
    rm -f "$gz" "$back" "$plain"; return
  fi

  local want got integ
  want="$(md5sum "$newest" | cut -d' ' -f1)"
  got="$(md5sum "$plain"  | cut -d' ' -f1)"
  integ="$(sqlite3 "$plain" 'PRAGMA integrity_check;' 2>&1 | head -1)"
  rm -f "$plain"-wal "$plain"-shm
  if [[ "$want" == "$got" && "$integ" == "ok" ]]; then
    log "($label) VERIFIED $blob — round-tripped, md5 matches, integrity_check=ok"
  else
    fail "($label) $blob FAILED verification (md5 $want vs $got, integrity=$integ)"
  fi
  rm -f "$gz" "$back" "$plain"
}

log "===== azure sync start (managed identity, account=$ACCOUNT) ====="
upload_one "$CA_BACKUP_DIR"     "data-*.sqlite" "colorarchive" "colorarchive"
upload_one "$STRIDE_BACKUP_DIR" "stride-*.db"   "stride"       "stride"
log "===== azure sync done (rc=$rc) ====="
exit $rc
