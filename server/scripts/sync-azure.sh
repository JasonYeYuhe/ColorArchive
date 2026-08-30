#!/usr/bin/env bash
# sync-azure.sh — OPTIONAL second offsite copy to Azure Blob Storage.
#
# STATUS 2026-07-08: INACTIVE. The primary, working offsite is an rsync-pull to
# Jason's Mac (a LaunchAgent on the Mac pulls both databases every 6h). This
# script is a ready-to-activate SECOND copy: the Azure CLI is installed and a
# subscription exists, but the cached login expired (refresh token inactive
# >90d). It therefore SKIPS cleanly (exit 0, no error spam) until re-enabled.
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
