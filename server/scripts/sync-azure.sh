#!/usr/bin/env bash
# sync-azure.sh — SUPERSEDED 2026-09-01. Does nothing. Read this before trusting it.
#
# 🔴 STATUS: INERT, AND IT WAS INERT FOR FIVE MONTHS WITHOUT ANYONE NOTICING.
#
# This script has been in root's crontab at :10 past every 6h since 2026-07-08
# and has uploaded ZERO bytes in that entire window — the container's newest
# blob was dated 2026-04-04. It failed in the worst available way: skip() logs
# one line and then `exit 0`, so cron recorded a success on every single run
# while nothing happened. First the cached `az` login expired; then the
# 2026-08-29 migration moved us to a box where `az` is not installed at all.
#
# THE LESSON, which is why this header is this long: a backup job that exits 0
# when it does not back anything up is worse than no backup job, because it
# manufactures the belief that the backup exists. If you resurrect this file,
# make every skip below an ERROR with a non-zero exit.
#
# The Azure cloud copy now runs from the MAC, inside
# ~/Library/do-harvest-offsite/pull-offsite.sh, which is where `az` is actually
# authenticated — so no credential has to live on this server. It gzips, uploads,
# then DOWNLOADS THE BLOB BACK and checks md5 + integrity_check before calling it
# a backup, and it alarms on staleness. See docs/backup-runbook.md ("The four
# tiers"). This file is left on disk only because deleting cron entries mid-
# incident is how cron entries get lost; it costs one log line per run.
#
# ── original header, kept for context ──────────────────────────────────────
# OPTIONAL second offsite copy to Azure Blob Storage. Ready-to-activate: the
# Azure CLI was installed and a subscription exists, but the cached login
# expired (refresh token inactive >90d), so it SKIPS cleanly until re-enabled.
#
# To enable the Azure second copy:
#   1) az login                       # interactive, refreshes the token
#   2) create/pick a storage account + container, then write:
#        /root/ColorArchive/server/scripts/.backup-env
#      containing:
#        AZURE_STORAGE_ACCOUNT=<youraccount>
#        AZURE_STORAGE_CONTAINER=db-backups
# After that this script (already wired into cron at :10 past every 6h) uploads
# the newest snapshot of BOTH databases on each run.
set -euo pipefail

CA_BACKUP_DIR="${CA_BACKUP_DIR:-/root/ColorArchive/server/backups}"
STRIDE_BACKUP_DIR="${STRIDE_BACKUP_DIR:-/root/backups}"
ENV_FILE="${BACKUP_ENV_FILE:-/root/ColorArchive/server/scripts/.backup-env}"

log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
skip() { log "SKIP: $* — offsite currently handled by Mac rsync-pull. See header to enable Azure."; exit 0; }

# --- Preconditions -----------------------------------------------------------
command -v az >/dev/null 2>&1 || skip "az CLI not found"

# shellcheck disable=SC1090
[[ -f "$ENV_FILE" ]] && source "$ENV_FILE"
: "${AZURE_STORAGE_ACCOUNT:=}"
: "${AZURE_STORAGE_CONTAINER:=db-backups}"
[[ -n "$AZURE_STORAGE_ACCOUNT" ]] || skip "AZURE_STORAGE_ACCOUNT unset ($ENV_FILE)"

# Cheap auth probe that uses the token cache; fails fast if login expired.
if ! timeout 60 az account get-access-token -o none >/dev/null 2>&1; then
  skip "az not authenticated (run 'az login')"
fi

# --- Upload newest snapshot of each database ---------------------------------
az storage container create --auth-mode login \
  --account-name "$AZURE_STORAGE_ACCOUNT" --name "$AZURE_STORAGE_CONTAINER" -o none

upload_newest() {
  local dir="$1" glob="$2" label="$3"
  local newest
  newest="$(find "$dir" -maxdepth 1 -name "$glob" -type f -printf '%T@ %p\n' 2>/dev/null \
            | sort -nr | head -1 | cut -d' ' -f2-)"
  if [[ -z "$newest" ]]; then
    log "WARN: no $label backup found in $dir ($glob) — skipping this DB"
    return 0
  fi
  log "azure upload ($label): $newest -> $AZURE_STORAGE_ACCOUNT/$AZURE_STORAGE_CONTAINER/$(basename "$newest")"
  az storage blob upload --auth-mode login --overwrite \
    --account-name "$AZURE_STORAGE_ACCOUNT" --container-name "$AZURE_STORAGE_CONTAINER" \
    --file "$newest" --name "$label/$(basename "$newest")" -o none
  log "azure upload ok ($label)"
}

upload_newest "$CA_BACKUP_DIR"     'data-*.sqlite' 'colorarchive'
upload_newest "$STRIDE_BACKUP_DIR" 'stride-*.db'   'stride'
log "azure sync done"
