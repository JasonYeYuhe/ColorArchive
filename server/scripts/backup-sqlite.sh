#!/usr/bin/env bash
# backup-sqlite.sh — consistent point-in-time snapshot of the ColorArchive
# SQLite database. Runs 6-hourly from root cron:
#
#   0 */6 * * * DB_PATH=.../data.db BACKUP_DIR=.../backups backup-sqlite.sh >> logs/backup.log 2>&1
#
# `sqlite3 .backup` takes only a read lock and streams a transactionally
# consistent copy while the app keeps writing — it is safe on a live WAL
# database and never blocks or restarts the server. DB_PATH / BACKUP_DIR are
# supplied by cron; both fall back to prod defaults so the script also works
# when run by hand.
set -euo pipefail

DB_PATH="${DB_PATH:-/root/ColorArchive/server/data.db}"
BACKUP_DIR="${BACKUP_DIR:-/root/ColorArchive/server/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }

if [[ ! -f "$DB_PATH" ]]; then
  log "ERROR: database not found at $DB_PATH"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# Clean up any truncated snapshot (and its journal sidecars) left behind by a
# previous crash.
rm -f "$BACKUP_DIR"/data-*.sqlite.partial* 2>/dev/null || true

STAMP="$(date -u +%F-%H%M%S)"
DEST="$BACKUP_DIR/data-$STAMP.sqlite"
TMP="$DEST.partial"

log "backup start: $DB_PATH -> $DEST"

# Write to a .partial name first, then atomically rename, so a crash mid-copy
# never leaves a half-written file that looks like a good backup.
sqlite3 "$DB_PATH" ".backup '$TMP'"

# Trust nothing that fails integrity_check.
INTEG="$(sqlite3 "$TMP" 'PRAGMA integrity_check;' 2>&1 || true)"
if [[ "$INTEG" != "ok" ]]; then
  log "ERROR: integrity_check failed on fresh backup: $INTEG"
  rm -f "$TMP"
  exit 1
fi

mv -f "$TMP" "$DEST"
log "backup ok: $DEST ($(du -h "$DEST" | cut -f1)), integrity_check=ok"

# Retention: drop LOCAL snapshots older than RETENTION_DAYS. The offsite copies
# on the Mac keep their own (longer) history, so this only bounds droplet disk.
find "$BACKUP_DIR" -maxdepth 1 -name 'data-*.sqlite' -mtime +"$RETENTION_DAYS" -print -delete \
  | while read -r f; do log "retention: removed $f"; done
log "backup done: $(find "$BACKUP_DIR" -maxdepth 1 -name 'data-*.sqlite' | wc -l | tr -d ' ') snapshot(s) retained in $BACKUP_DIR"
