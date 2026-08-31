# SQLite Backup & Restore Runbook

> Last verified: **2026-09-01** — every command below was executed, not read.
> Superseded the 2026-04-24 version, which still described the DigitalOcean
> droplet (`143.198.85.72`). **That machine was destroyed on 2026-08-30.**
> Production moved to Azure on 2026-08-29.

## The four tiers, and what each one actually protects against

| tier | where | cadence | retention | survives |
|---|---|---|---|---|
| 1. local snapshot | `/root/ColorArchive/server/backups/` on the VM | 6h (cron) | 14d | an `rm`, a bad migration, app-level corruption |
| 2. **offsite pull** | Jason's Mac, `~/Library/do-harvest-offsite/` | 6h (LaunchAgent) | 60d | **the VM dying** |
| 3. **cloud copy** | Azure Blob `colorarchivestu/sqlite-backups` | 6h, gzipped | 180d | **the VM and the Mac both dying** |
| 4. VM OS snapshot | Azure incremental disk snapshot | weekly | keep 4 | rebuilding the *machine*, not the data |

Tier 1 is on the **same disk as the live database**, so on its own it is not a
backup — it is an undo button. Tiers 2–4 are the actual protection.

### What was missing before 2026-09-01, and what wasn't

The brief for this work said offsite backup did not exist. Measured, tiers 1, 2
and 4 were already in place and working — tier 2 had 220 verified snapshots
going back to 2026-07-08, and had been correctly re-pointed at Azure during the
migration. **Only tier 3 was missing**, and everything lived on exactly two
disks, one of them a laptop.

### 🔴 Why tier 3 had silently not existed for five months

`server/scripts/sync-azure.sh` has been in the VM's crontab at `:10` past every
6h since 2026-07-08 and uploaded **nothing** in that entire period. Its `skip()`
logs a line and then `exit 0`, so cron saw success every single run. First the
cached `az` login expired; after the Azure migration `az` was not installed on
the new box at all. The container's newest blob was from **2026-04-04**.

Tier 3 now runs from the Mac instead — that is where `az` is already
authenticated, so no credential has to be stored on either machine (the storage
key is fetched transiently per call and never written to disk). The three
lessons from the failure are built into it:

1. **every failure sets `rc=1` and logs `ERROR`** — never a silent success;
2. **it verifies by downloading the blob back**, decompressing it, comparing md5
   against the local file and running `integrity_check` on the result. "The
   upload returned 200" is not evidence that a backup is restorable;
3. **it alarms on staleness** (`> 30h`), and writes
   `~/Library/do-harvest-offsite/last-run-status.txt` plus a macOS notification
   on failure — so a dead credential is noticed in about a day, not at the next
   disaster.

**Known limitation, stated plainly:** tier 3 is only as fresh as the last time
the Mac was awake. Making it independent needs a system-assigned managed
identity on `apps-prod-vm` plus a `Storage Blob Data Contributor` role
assignment scoped to the `sqlite-backups` container, after which the VM can
upload with IMDS + `curl` and no secret at all. That is a ~5-minute owner task
and is the single best remaining improvement here.

## Production layout (source of truth)

| | |
|---|---|
| Host | Azure VM `apps-prod-vm` in `apps-prod-rg`, japaneast (`api.colorarchive.org`) |
| Repo | `/root/ColorArchive/` (**no git remote** — deploy by `scp` + `install`) |
| Live DB | `/root/ColorArchive/server/data.db` (~30 MB, 2026-09-01) |
| Backup dir | `/root/ColorArchive/server/backups/` |
| Log | `/root/ColorArchive/server/logs/backup.log` |
| Retention | **14 days**, rotated every 6 hours |
| Offsite | Mac pull (60d) + Azure Blob `colorarchivestu/sqlite-backups` (180d) |

SSH needs inline flags — the agent socket must be bypassed:

```bash
ssh -o IdentityAgent=none -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes azureuser@172.207.80.109
```

`/root` is mode 700, so globs need wrapping: `sudo bash -c "ls /root/..."`.

## Cron (as installed on the Azure VM)

```
0 */6 * * * DB_PATH=/root/ColorArchive/server/data.db \
            BACKUP_DIR=/root/ColorArchive/server/backups \
            /root/ColorArchive/server/scripts/backup-sqlite.sh \
            >> /root/ColorArchive/server/logs/backup.log 2>&1
```

`10 */6 * * * sync-azure.sh` is also present and is **inert** — see above. It is
left in place because it costs one log line per run and removing cron entries
during an incident is how cron entries get lost; do not mistake it for tier 3.

## Verification

Check the cron is firing and producing real (non-zero-byte) backups:

```bash
ssh -o IdentityAgent=none -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes azureuser@172.207.80.109 'sudo ls -la /root/ColorArchive/server/backups/ | tail -10'
ssh -o IdentityAgent=none -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes azureuser@172.207.80.109 'sudo tail -20 /root/ColorArchive/server/logs/backup.log'
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
ssh -o IdentityAgent=none -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes azureuser@172.207.80.109
sudo -i   # backups and data.db live under /root

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
ssh -o IdentityAgent=none -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes azureuser@172.207.80.109
sudo -i   # backups and data.db live under /root
mkdir -p /tmp/restore-drill && cd /tmp/restore-drill
cp "$(ls -t /root/ColorArchive/server/backups/data-*.sqlite | head -1)" ./drill.sqlite
sqlite3 drill.sqlite 'PRAGMA integrity_check;'   # expect: ok
sqlite3 drill.sqlite 'SELECT COUNT(*) FROM users;'
sqlite3 drill.sqlite 'SELECT COUNT(*) FROM orders;'
rm -rf /tmp/restore-drill
```

Next drill target: **2026-12-01** (or immediately after any schema change).
Last full drill: **2026-09-01** — cloud round-trip verified byte-identical
(md5 `5288a733...`), `integrity_check=ok`, 12,791 `events` rows, 23 `users`.

## Open items

- **Tier 3 depends on the Mac being awake.** Fix: system-assigned managed
  identity on `apps-prod-vm` + `Storage Blob Data Contributor` scoped to the
  `sqlite-backups` container, then upload from the VM with IMDS + `curl`. No
  stored secret, no expiry — and unlike the 2026-04 attempt it cannot die from a
  credential timing out. ~5 minutes, owner-only (needs Azure RBAC rights).
- **No automated restore drill.** The quarterly manual drill below is a floor.
  Tier 3 does verify a full download → decompress → `integrity_check` on every
  new upload, which is the closest thing to a continuous drill currently running.
- **The repo is PUBLIC.** The VM's IP is already public via DNS
  (`api.colorarchive.org`), so its presence in these docs is not a leak. The
  Azure **subscription ID and disk resource ID are not public and must not be
  committed** — which is why `pull-offsite.sh` itself is not in this repo.

## Restoring from the cloud copy (tier 3)

Blobs are gzipped and named `colorarchive-<local-stamp>.sqlite.gz`. The 144
`*.db.gz` blobs from 2026-03/04 are a **different, older format** from the
abandoned first attempt; retention deliberately never touches them.

```bash
# newest cloud backup
az storage blob list --account-name colorarchivestu --container-name sqlite-backups \
  --auth-mode key --prefix colorarchive- \
  --query "sort_by([?ends_with(name,'.sqlite.gz')],&properties.lastModified)[-1].name" -o tsv

az storage blob download --account-name colorarchivestu --container-name sqlite-backups \
  --auth-mode key --name <blob> --file /tmp/restore.sqlite.gz
gunzip -c /tmp/restore.sqlite.gz > /tmp/restore.sqlite
sqlite3 /tmp/restore.sqlite 'PRAGMA integrity_check;'      # expect: ok
sqlite3 /tmp/restore.sqlite 'SELECT COUNT(*) FROM events;' # the instrument W1 writes to
```

Then follow the in-place restore steps above from step 2.

## Health check (run this, not a guess)

```bash
cat ~/Library/do-harvest-offsite/last-run-status.txt   # OK / FAIL + timestamp
tail -20 ~/Library/do-harvest-offsite/pull.log
```

A healthy run, verbatim from 2026-09-01:

```
verify (colorarchive): data-2026-08-31-120001.sqlite ( 30M) integrity_check=ok
cloud (colorarchive): uploading colorarchive-2026-08-31-120001.sqlite.gz (5.3M gz, from 30M)
verify (cloud/colorarchive): colorarchive-...sqlite.gz round-tripped, md5 matches, integrity_check=ok
cloud (colorarchive): newest cloud backup is 0h old
===== offsite pull done (rc=0) =====
```

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
