# SQLite Backup & Restore Runbook

> Last verified: 2026-04-24 (SSH inspection of production Droplet)

## Production layout (source of truth)

| | |
|---|---|
| Droplet | `143.198.85.72` |
| Repo | `/root/ColorArchive/` |
| Live DB | `/root/ColorArchive/server/data.db` (~3.9 MB as of 2026-04-24) |
| Backup dir | `/root/ColorArchive/server/backups/` |
| Log | `/root/ColorArchive/server/logs/backup.log` |
| Retention | 7 days, rotated every 6 hours |
| Offsite | **NONE** (known gap — see "Open items") |

## Cron (as installed)

```
0 */6 * * * DB_PATH=/root/ColorArchive/server/data.db \
            BACKUP_DIR=/root/ColorArchive/server/backups \
            /root/ColorArchive/server/scripts/backup-sqlite.sh \
            >> /root/ColorArchive/server/logs/backup.log 2>&1
```

The env-var overrides are **required** because the script's defaults have been corrected to match this layout as of 2026-04-24. Prior to this date the defaults pointed at `/root/colorarchive-api/...` which does not exist on the Droplet — if the env-vars were ever dropped the script would have died preflight.

## Verification

Check the cron is firing and producing real (non-zero-byte) backups:

```bash
ssh root@143.198.85.72 'ls -la /root/ColorArchive/server/backups/ | tail -10'
ssh root@143.198.85.72 'tail -20 /root/ColorArchive/server/logs/backup.log'
```

A healthy run logs:
```
[<ts>] Starting backup of /root/ColorArchive/server/data.db
[<ts>] Backup created: .../colorarchive-<ts>.db (3.8M)
[<ts>] Compressed to .../colorarchive-<ts>.db.gz (~530K)
[<ts>] Pruned N backup(s) older than 7 days
[<ts>] Backup complete. M backup(s) on disk.
```

## Restore procedure (tested)

> **Stop the app first** — restoring into a running SQLite DB can corrupt the WAL.

```bash
# 1. SSH to the Droplet
ssh root@143.198.85.72

# 2. Stop the API (PM2)
pm2 stop colorarchive-api

# 3. Safety: snapshot the current live DB before overwriting
cp /root/ColorArchive/server/data.db /tmp/data.db.pre-restore.$(date +%s)

# 4. Pick the backup to restore from
ls -la /root/ColorArchive/server/backups/
# Example: colorarchive-20260423-120001.db.gz

# 5. Decompress into place
gunzip -c /root/ColorArchive/server/backups/colorarchive-20260423-120001.db.gz \
  > /root/ColorArchive/server/data.db

# 6. Integrity check
sqlite3 /root/ColorArchive/server/data.db 'PRAGMA integrity_check;'
# Expect: ok

# 7. Restart the API
pm2 start colorarchive-api
pm2 logs colorarchive-api --lines 20 --nostream

# 8. Smoke test from a client
curl -sSf https://api.colorarchive.org/healthz
```

Rollback the restore if something went wrong:
```bash
pm2 stop colorarchive-api
cp /tmp/data.db.pre-restore.<timestamp> /root/ColorArchive/server/data.db
pm2 start colorarchive-api
```

## Restore drill schedule

Run the restore procedure against a **copy** (never in place) once a quarter:

```bash
ssh root@143.198.85.72
mkdir -p /tmp/restore-drill && cd /tmp/restore-drill
cp /root/ColorArchive/server/backups/colorarchive-<latest>.db.gz ./
gunzip colorarchive-<latest>.db.gz
sqlite3 colorarchive-<latest>.db 'SELECT COUNT(*) FROM users;'
sqlite3 colorarchive-<latest>.db 'SELECT COUNT(*) FROM orders;'
rm -rf /tmp/restore-drill
```

Next drill target: **2026-07-23** (or immediately after any schema change).

## Open items

- **No offsite backup.** A Droplet loss (filesystem corruption, disk failure, account compromise) loses everything. Fix options, in priority order:
  1. **Cloudflare R2** — 10 GB free, S3-compatible. Add an `rclone copy` step at the end of `backup-sqlite.sh`. Est. 30 min setup.
  2. **AWS S3 / Wasabi** — paid alternatives.
  3. **GitHub release assets** — free but requires a gh token and has 2 GB/file limit. Fine given current ~530 KB/backup.
- **No automated restore smoke test.** Manual quarterly drill is a floor, not a ceiling.
- **The legacy path `/root/colorarchive-api/...` may be referenced in older docs** — anything still pointing there should be corrected to `/root/ColorArchive/server/`.
