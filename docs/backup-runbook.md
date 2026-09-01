# SQLite Backup & Restore Runbook

> Last verified: **2026-09-01** — every command below was executed, not read.
> Superseded the 2026-04-24 version, which still described the DigitalOcean
> droplet (`143.198.85.72`). **That machine was destroyed on 2026-08-30.**
> Production moved to Azure on 2026-08-29.

## The five tiers, and what each one actually protects against

| tier | where | cadence | retention | survives |
|---|---|---|---|---|
| 1. local snapshot | `/root/ColorArchive/server/backups/` on the VM | 6h (cron) | 14d | an `rm`, a bad migration, app-level corruption |
| 2. offsite pull | Jason's Mac, `~/Library/do-harvest-offsite/` — **gzipped** | 6h (LaunchAgent) | **30d** | **the VM dying** |
| 3. cloud copy | Azure Blob `colorarchivestu/sqlite-backups` — keyless from the VM | 6h | 180d | **the VM and the Mac both dying** |
| 4. VM OS snapshot | Azure incremental disk snapshot | weekly | keep 4 | rebuilding the *machine*, not the data |
| 5. **second cloud** | **Google Drive `gdrive:ColorArchive-Backups/`** | 6h (from the Mac) | 365d | 🔴 **the whole Azure account ending** |

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

Tier 3 now runs **from the VM, keyless**, via `server/scripts/sync-azure.sh`.
The three lessons from the failure are built into it:

1. **every failure sets `rc=1` and logs `ERROR`** — never a silent success;
2. **it verifies by downloading the blob back**, decompressing it, comparing md5
   against the local file and running `integrity_check` on the result. "The
   upload returned 200" is not evidence that a backup is restorable;
3. **it alarms on staleness** (`> 30h`), and writes
   `~/Library/do-harvest-offsite/last-run-status.txt` plus a macOS notification
   on failure — so a dead credential is noticed in about a day, not at the next
   disaster.

### How tier 3 authenticates, and why it cannot be revoked by an expiring token

`apps-prod-vm` has a **system-assigned managed identity**. `sync-azure.sh` asks
IMDS (`169.254.169.254`) for a storage token at run time and uploads with plain
`curl`. **There is no key, no SAS, no `az login`, and nothing on disk to rotate
or leak** — which removes precisely the failure mode that killed the 2026-04
attempt. `az` is not installed on the VM and is not needed.

### 🔴 The VM cannot delete its own backups, deliberately

The identity holds a **custom** role, `Blob Backup Writer (no delete)`, scoped to
the `sqlite-backups` container only. It grants `blobs/read` + `blobs/write` and
`containers/read` (needed for List Blobs), and deliberately **not**
`blobs/delete`. Verified from the box:

```
LIST   -> HTTP 200
WRITE  -> HTTP 201
READ   -> HTTP 200
DELETE -> HTTP 403   ← the point
```

A backup producer that can erase its own backup history is one compromise away
from having no backups, and a public-facing web server is the most likely thing
in this system to be compromised. Because `write` still permits overwrite, the
account also has **blob versioning + 30-day blob and container soft delete**, so
an overwrite-with-garbage or a delete performed with some other credential is
still recoverable.

**Retention therefore does not run on the VM.** Expiring blobs past 180 days is
the Mac's job, using a separate credential.

### 🔴 Why tier 5 exists: tiers 1, 3 and 4 are all one Azure account

The obvious objection to tier 5 is "we already have a cloud copy". We do — and it
is in the same subscription as everything else:

- the VM's local backups → **Azure** VM disk
- the blob copy → **Azure** storage account
- the weekly OS snapshot → **Azure**

all under `Azure for Students`, subscription credit expiring **2027-03-18**, free
service window closing **2027-04-04**, conditional on still being a student. One
account ending — credit expiry, graduation, suspension, a mis-deleted
subscription — removes three of the four tiers simultaneously.

**This is not hypothetical. It already happened here, one month ago.** The
DigitalOcean student credit expired 2026-08-31, $65.22 evaporated, and the
droplet was destroyed. Had the backups lived only on DO, they would have gone
with it. Tier 5 is a different provider with a different billing relationship,
which is the only thing that actually diversifies that risk.

`rclone` already had a `gdrive:` remote configured (the xiaohongshu-daily task
uses it), so this needed no new credential and no OAuth. Drive holds 5 TB with
4.6 TiB free; the entire compressed archive is under 1 GB, which is why
retention there is a generous 365 days.

Verification is deliberately `rclone check --download`: it re-fetches and
compares **content**, not size+modtime. A tier whose whole purpose is
independence has to be verified independently too.

### The archive is stored gzipped, and rsync needs an exclude list for that

Until 2026-09-01 tier 2 kept plain `.sqlite` files: 222 snapshots × 30 MB =
4.5 GB, on a volume that was 99 % full. The same content gzips to ~5.4 MB —
**5.6×**. Compacting the existing history freed **3,774 MB in 100 seconds**
(283 files, 0 failures, each verified by decompressing and comparing md5 against
the original before the original was removed).

🔴 **The trap that makes this non-obvious.** `rsync -a REMOTE/ LOCAL/` mirrors.
If the VM still holds `data-X.sqlite` and locally we now hold only
`data-X.sqlite.gz`, rsync sees the file as *missing* and re-downloads all 30 MB —
then it gets re-compressed, and re-downloaded again next run, forever. The
compression would appear to work while quietly costing a full re-pull every six
hours. So the pull is given an `--exclude-from` list built from the `.gz` files
already held. Confirmed in the log: `skipping 223 already held`.

### 🔴 Compressing reset every mtime, and retention reads mtime

Caught immediately after the compaction, before it could do damage. Both
`find -mtime` (retention) and `ls -t` ("which snapshot is newest") read **mtime**,
not the filename. Compressing writes a *new* file, so all 283 snapshots — including
ones from 8 July — acquired an mtime of the compaction minute.

The failure that would have produced: **nothing expires for 30 days, and then the
entire local archive expires on the same day.** It would have looked completely
healthy right up to the moment it emptied.

Fixed twice over: the existing files had their mtimes restored from their filename
stamps (283 corrected), and the compaction step in `pull-offsite.sh` now does
`touch -r "$f" "$f.gz"` so a re-compaction cannot reintroduce it. Verified after:
the 8 July file reads `mtime=2026-07-08 11:53`, and the first real retention pass
correctly expired the July stride snapshots.

### 🔴 The Mac is at 99% disk, and tier 2 half-failed because of it

Found 2026-09-01 while verifying the above. The `00:12Z` scheduled run died with
`No space left on device`: rsync left a partial temp file, the stride integrity
check could not open its database, and both gzips failed. **Nothing was
corrupted** — the pull is atomic per file and the previous copies survived — and
the new error handling reported it loudly, which is how it was found at all.

**The backups are not the cause.** The volume is 881 GB used of 926 GB with
~14 GB free; this store is 4.5 GB of that. So this is not a retention knob to
tune, it is "the machine hosting tier 2 is nearly full" and it needs attention
outside this system.

Two things changed in response:

1. **A free-space precondition** (`MIN_FREE_MB=6000`). Below it the run declines
   in one place with an `ALERT` instead of failing in four, and says explicitly
   that tier 3 is unaffected. It also protects the upload path: gzip writing a
   truncated `.part` on a full disk is exactly how a corrupt backup gets
   uploaded. Verification would catch that — not attempting is better.
2. **The cloud was backfilled with the Mac's whole history** — 278 blobs uploaded,
   0 failed; the cloud now holds 222 ColorArchive snapshots spanning **2026-07-08 →
   2026-09-01** plus 61 Stride, 0.83 GB total (~$0.01/month, Cool LRS). Tier 3 began on
   2026-09-01 holding one day. Tier 2 held ~220 snapshots back to 2026-07-08 on
   a disk that is nearly full — which is precisely when you would want to shorten
   tier 2's retention, and precisely when you must not, because the cloud was
   then the only other copy and it had nothing. Backfilling first makes tier 3
   genuinely the deep-history tier; only after that is trimming tier 2 safe.

**Consequence worth acting on:** now that tier 3 holds the history, the Mac's
60-day retention is no longer load-bearing and can be shortened to reclaim disk.
Do not shorten it below what the cloud actually contains.

### What the Mac still does, now that the VM uploads

Not redundant — it holds the two jobs the VM must not have:

- **Monitor.** The staleness alarm (>30h) is the only thing that will tell a
  human the cloud copy stopped. A host cannot be trusted to report its own
  death, so the check runs on a different machine with a different credential.
  This is exactly what was absent while the VM's uploader sat broken for five
  months reporting success.
- **Retention.** See above.
- **Backstop.** If the VM's upload fails, the Mac still uploads. Both derive the
  blob name from the same snapshot filename, so whichever runs first wins and
  the other finds it already present. **Do not let the two naming schemes drift.**

## Production layout (source of truth)

| | |
|---|---|
| Host | Azure VM `apps-prod-vm` in `apps-prod-rg`, japaneast (`api.colorarchive.org`) |
| Repo | `/root/ColorArchive/` (**no git remote** — deploy by `scp` + `install`) |
| Live DB | `/root/ColorArchive/server/data.db` (~30 MB, 2026-09-01) |
| Backup dir | `/root/ColorArchive/server/backups/` |
| Log | `/root/ColorArchive/server/logs/backup.log` |
| Retention | **14 days**, rotated every 6 hours |
| Offsite | Mac pull, gzipped (30d) + Azure Blob (180d) + Google Drive (365d) |

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

```
10 */6 * * * /root/ColorArchive/server/scripts/sync-azure.sh \
             >> /root/ColorArchive/server/logs/azure-sync.log 2>&1
```

That second entry **is** tier 3 as of 2026-09-01. It runs at `:10` because the
tier-1 backups are written at `:00`. It was previously inert — see above.

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

- ~~Tier 3 depends on the Mac being awake.~~ **Closed 2026-09-01** — the VM now
  uploads keyless via managed identity; the Mac is monitor/retention/backstop.
- 🔴 **The Mac is still ~98% disk.** Compressing the archive gave back 3.8 GB
  (the store is now 841 MB of an 881 GB-used volume), so the backups are no
  longer a meaningful contributor — but the volume itself is still nearly full
  for unrelated reasons and needs a human. Tier 2 declines cleanly below 6 GB
  free instead of half-failing; tiers 3 and 5 are unaffected either way.
- ~~Mac retention can now be shortened.~~ **Done 2026-09-01** — 60d → 30d, and
  the archive is stored gzipped. **4.5 GB → 579 MB** (124 ColorArchive + 31 Stride
  snapshots retained); free space **11.8 GB → 19.4 GB**.
- ~~Nothing alerts if the whole Mac stops.~~ **Closed 2026-09-02** —
  `server/scripts/backup-health.cjs` runs daily on the VM at `30 8 * * *` and
  alarms if tier 1 or tier 3 goes stale **or if the Mac stops checking in**. The
  Mac writes `_heartbeat-mac.txt` into the container after every successful run;
  the VM reads it. The two machines watch each other with different credentials,
  because a host cannot be trusted to report its own death. Emails only on
  problems. See "Mutual monitoring" below.
- **No automated restore drill.** The quarterly manual drill below is a floor.
  Tier 3 does verify a full download → decompress → `integrity_check` on every
  new upload, which is the closest thing to a continuous drill currently running.
- **The repo is PUBLIC.** The VM's IP is already public via DNS
  (`api.colorarchive.org`), so its presence in these docs is not a leak. The
  Azure **subscription ID and disk resource ID are not public and must not be
  committed** — which is why `pull-offsite.sh` itself is not in this repo.

## Mutual monitoring — who watches what

| watcher | runs on | credential | alarms when |
|---|---|---|---|
| `pull-offsite.sh` | Mac (LaunchAgent, 6h) | Azure account key + rclone gdrive | tier 3 or tier 5 uploads go stale (>30h) |
| `backup-health.cjs` | VM (cron, `30 8 * * *`) | VM managed identity (read-only) | tier 1 stale (>9h), tier 3 stale (>30h), **or the Mac stops checking in (>30h)** |

The Mac cannot report its own death, so the VM does it. The Mac proves liveness
by writing `_heartbeat-mac.txt` into the container after each successful run —
it carries tier-2 snapshot counts, tier-5 Drive size and free space, so the
heartbeat is also a status summary.

**Why the VM cannot simply check Google Drive itself:** it deliberately holds no
Drive credential. Giving it one would collapse the "different provider, separate
credential" property that is the entire reason tier 5 exists. The heartbeat is
the indirection that lets the VM detect a dead tier 5 without being able to reach
it.

Both alarms are **silent when healthy**, on purpose. A daily all-clear gets
filtered, and then the one that matters is filtered with it.

```bash
# run the VM-side check by hand (prints, never mails, with --dry-run)
ssh ... azureuser@172.207.80.109 'sudo node /root/ColorArchive/server/scripts/backup-health.cjs --dry-run'
```

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

## Restoring from Google Drive (tier 5)

Use this when Azure is the thing that is gone. Same gzipped artifact as tiers 2
and 3, so the restore is identical after the download.

```bash
# what is there
rclone lsf gdrive:ColorArchive-Backups/colorarchive --format tsp | sort | tail -5

# newest
rclone copy gdrive:ColorArchive-Backups/colorarchive/data-<stamp>.sqlite.gz /tmp/
gunzip -c /tmp/data-<stamp>.sqlite.gz > /tmp/restore.sqlite
sqlite3 /tmp/restore.sqlite 'PRAGMA integrity_check;'      # expect: ok
sqlite3 /tmp/restore.sqlite 'SELECT COUNT(*) FROM events;'
```

Then follow the in-place restore steps above from step 2.

⚠️ `rclone lsf --format t` prints **local time**, not UTC — unlike every other
timestamp in this system. That cost a bug: the staleness alarm computed every
Drive backup as 9 hours in the future ("-8h old") and would have never fired.

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
