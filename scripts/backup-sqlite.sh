#!/bin/bash
set -euo pipefail

# ============================================================================
# ColorArchive SQLite Backup Script
# ============================================================================
# Safe hot-backup of a live SQLite database using the .backup command.
#
# Cron setup (every 6 hours):
#   0 */6 * * * /root/colorarchive-api/scripts/backup-sqlite.sh >> /root/colorarchive-api/logs/backup.log 2>&1
#
# Make sure the logs directory exists:
#   mkdir -p /root/colorarchive-api/logs
# ============================================================================

# --- Configuration ---
DB_PATH="${DB_PATH:-/root/colorarchive-api/data/colorarchive.db}"
BACKUP_DIR="${BACKUP_DIR:-/root/colorarchive-api/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# --- Helpers ---
timestamp() {
  date -u '+%Y-%m-%d %H:%M:%S UTC'
}

log() {
  echo "[$(timestamp)] $1"
}

die() {
  log "ERROR: $1"
  exit 1
}

# --- Preflight checks ---
command -v sqlite3 >/dev/null 2>&1 || die "sqlite3 is not installed"
[ -f "$DB_PATH" ] || die "Database not found at $DB_PATH"

mkdir -p "$BACKUP_DIR"

# --- Create backup ---
BACKUP_NAME="colorarchive-$(date -u '+%Y%m%d-%H%M%S').db"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

log "Starting backup of $DB_PATH"

sqlite3 "$DB_PATH" ".backup '$BACKUP_PATH'" || die "sqlite3 .backup failed"

log "Backup created: $BACKUP_PATH ($(du -h "$BACKUP_PATH" | cut -f1))"

# --- Compress ---
gzip "$BACKUP_PATH" || die "gzip compression failed"

log "Compressed to ${BACKUP_PATH}.gz ($(du -h "${BACKUP_PATH}.gz" | cut -f1))"

# --- Prune old backups ---
DELETED=$(find "$BACKUP_DIR" -name "colorarchive-*.db.gz" -type f -mtime +"$RETENTION_DAYS" -print -delete | wc -l)
log "Pruned $DELETED backup(s) older than $RETENTION_DAYS days"

log "Backup complete. $(find "$BACKUP_DIR" -name "colorarchive-*.db.gz" -type f | wc -l) backup(s) on disk."
