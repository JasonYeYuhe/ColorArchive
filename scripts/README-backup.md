# SQLite Backup Setup

## 1. Copy script to server

```bash
scp scripts/backup-sqlite.sh root@143.198.85.72:/root/colorarchive-api/scripts/
ssh root@143.198.85.72 "chmod +x /root/colorarchive-api/scripts/backup-sqlite.sh"
```

## 2. Create required directories

```bash
ssh root@143.198.85.72 "mkdir -p /root/colorarchive-api/backups /root/colorarchive-api/logs"
```

## 3. Test it

```bash
ssh root@143.198.85.72 "/root/colorarchive-api/scripts/backup-sqlite.sh"
```

## 4. Set up cron (every 6 hours)

```bash
ssh root@143.198.85.72 'crontab -l 2>/dev/null; echo "0 */6 * * * /root/colorarchive-api/scripts/backup-sqlite.sh >> /root/colorarchive-api/logs/backup.log 2>&1"' | ssh root@143.198.85.72 'crontab -'
```

Or manually: `ssh root@143.198.85.72 crontab -e` and add:

```
0 */6 * * * /root/colorarchive-api/scripts/backup-sqlite.sh >> /root/colorarchive-api/logs/backup.log 2>&1
```

## 5. Optional: offsite backup to DigitalOcean Spaces / S3

Install `s3cmd` or `aws cli` on the Droplet, then append this to the backup script or add a second cron job:

```bash
# Upload latest backup to Spaces
LATEST=$(ls -t /root/colorarchive-api/backups/colorarchive-*.db.gz | head -1)
s3cmd put "$LATEST" s3://your-bucket-name/colorarchive-backups/
```

## Configuration

The script reads these environment variables (all have defaults):

| Variable | Default | Description |
|---|---|---|
| `DB_PATH` | `/root/colorarchive-api/data/colorarchive.db` | Path to live database |
| `BACKUP_DIR` | `/root/colorarchive-api/backups` | Where backups are stored |
| `RETENTION_DAYS` | `7` | Delete backups older than this |
