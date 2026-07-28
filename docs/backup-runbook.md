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

A healthy run logs (verbatim from the live log, 2026-07-26):
```
2026-07-26T12:00:01Z backup start: /root/ColorArchive/server/data.db -> .../backups/data-2026-07-26-120001.sqlite
2026-07-26T12:00:02Z backup ok: .../backups/data-2026-07-26-120001.sqlite (19M), integrity_check=ok
2026-07-26T12:00:02Z retention: removed .../backups/data-2026-07-11-120001.sqlite
2026-07-26T12:00:02Z backup done: 60 snapshot(s) retained in /root/ColorArchive/server/backups
```

> **Snapshots are plain, uncompressed `.sqlite` files, retained 14 days.** This
> document described gzipped `colorarchive-<ts>.db.gz` files until 2026-07-27 — a
> format the running script has never produced. There are ZERO such files on the
> box, so anyone following the old restore step hit a dead end at exactly the
> moment they needed it to work. The script was replaced on 2026-07-08 and the
> runbook was not.

## Restore procedure (tested)

> **Stop the app first** — restoring into a running SQLite DB can corrupt the WAL.

```bash
# 1. SSH to the Droplet
ssh root@143.198.85.72

# 2. Stop the API (PM2)
pm2 stop colorarchive-server
# Assert it actually stopped. Until 2026-07-28 this said `colorarchive-api`, which
# is not a process on this box — so pm2 printed a warning, the step silently did
# NOTHING, and the restore below overwrote a live data.db. That is precisely the
# WAL corruption the warning above exists to prevent. Never let this fail open.
pm2 jlist | python3 -c 'import json,sys; ps=json.load(sys.stdin); s=[p for p in ps if p["name"]=="colorarchive-server"]; sys.exit(0 if s and s[0]["pm2_env"]["status"]=="stopped" else 1)' \
  || { echo "REFUSING TO RESTORE: colorarchive-server is not stopped"; exit 1; }

# 3. Safety: snapshot the current live DB before overwriting
cp /root/ColorArchive/server/data.db /tmp/data.db.pre-restore.$(date +%s)

# 4. Pick the backup to restore from
ls -la /root/ColorArchive/server/backups/
# Example: data-2026-07-26-120001.sqlite   (uncompressed — do NOT gunzip)

# 5. Copy into place. Also remove the stale WAL sidecars, or SQLite will replay
#    a write-ahead log belonging to the database you just replaced.
cp /root/ColorArchive/server/backups/data-2026-07-26-120001.sqlite \
  /root/ColorArchive/server/data.db
rm -f /root/ColorArchive/server/data.db-wal /root/ColorArchive/server/data.db-shm

# 6. Integrity check
sqlite3 /root/ColorArchive/server/data.db 'PRAGMA integrity_check;'
# Expect: ok

# 7. Restart the API
pm2 start colorarchive-server
pm2 logs colorarchive-server --lines 20 --nostream

# 8. Smoke test from a client
curl -sSf https://api.colorarchive.org/health   # NOT /healthz — that route does not exist and 404s
```

Rollback the restore if something went wrong:
```bash
pm2 stop colorarchive-server
cp /tmp/data.db.pre-restore.<timestamp> /root/ColorArchive/server/data.db
pm2 start colorarchive-server
```

## Restore drill schedule

Run the restore procedure against a **copy** (never in place) once a quarter:

```bash
ssh root@143.198.85.72
mkdir -p /tmp/restore-drill && cd /tmp/restore-drill
cp "$(ls -t /root/ColorArchive/server/backups/data-*.sqlite | head -1)" ./drill.sqlite
sqlite3 drill.sqlite 'PRAGMA integrity_check;'   # expect: ok
sqlite3 drill.sqlite 'SELECT COUNT(*) FROM users;'
sqlite3 drill.sqlite 'SELECT COUNT(*) FROM orders;'
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

---

## Which script is the real one (2026-07-27)

There were two, and the one under version control was **not** the one running.

- **Live and authoritative:** `server/scripts/backup-sqlite.sh` — the path root's
  crontab actually invokes (`0 */6 * * *`). Replaced 2026-07-08; produces
  uncompressed `data-<stamp>.sqlite`, runs `PRAGMA integrity_check` before keeping
  a snapshot, writes to `.partial` then renames so a crash cannot leave a
  half-written file that looks valid, retains 14 days. It is now committed.
- **Deleted:** `scripts/backup-sqlite.sh` (repo root, Apr 2026) and
  `scripts/README-backup.md`. The README instructed you to deploy to
  `/root/colorarchive-api/`, a path that has not existed since the domain
  migration, and the script was a previous generation producing the `.db.gz`
  format this runbook used to document. Both were removed rather than updated:
  during a restore, a second plausible-looking procedure pointing at a dead path
  is worse than no second procedure.

**If you ever change the backup script, change it at `server/scripts/`, deploy it,
and re-run the drill above.** The drift between the two was invisible precisely
because nothing ever executed the tracked copy.
