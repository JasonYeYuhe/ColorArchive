#!/usr/bin/env bash
#
# Weekly Design Notes send. Cron:
#   0 10 * * 5  /root/ColorArchive/server/scripts/send-design-notes-cron.sh >> /root/ColorArchive/server/logs/design-notes.log 2>&1
#
# WHY A WRAPPER — the pipeline had a hole in the middle.
#
# A cloud routine drafts an issue into docs/design-notes/ IN THE REPO every Thursday
# and pushes it. A human then flips `status: draft` to `status: approved`. But
# send-design-notes.cjs reads from a directory ON THE DROPLET, and nothing ever
# carried the file from one to the other — no cron, no copy step, and the directory
# did not even exist. The first approved issue would have gone precisely nowhere,
# which is a bad way to discover a pipeline is unfinished.
#
# WHY NOT `git pull` — this droplet's checkout is a landmine. Its HEAD is weeks stale
# while the working tree IS production (deploys here are scp, not git), so a pull,
# checkout or clean would silently revert live server code, including the rate-limit
# fixes. So this touches the working tree NEVER:
#   * `git fetch` writes only to .git — refs and objects, no working files.
#   * `git archive` streams a tree straight out of the object store to stdout.
# Neither can modify a tracked file. If that ever stops being true, this script is
# wrong and should go back to a plain scp.
#
# The sender itself remains the safety gate: it mails ONLY issues whose frontmatter
# says `status: approved`, and keeps a per-recipient ledger so a crash resumes rather
# than double-sending. Running this on a schedule cannot cause an unapproved send.

set -uo pipefail

REPO="/root/ColorArchive"
SERVER="$REPO/server"
STAGING="/tmp/design-notes-staging"

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*"; }

log "design-notes: start"

# Refs only. Failure here is not fatal — fall through and let the sender find
# nothing, which is a no-op, rather than leaving a half-staged directory around.
if ! git -C "$REPO" fetch -q origin main 2>/dev/null; then
  log "design-notes: WARN git fetch failed — using whatever origin/main was last known"
fi

rm -rf "$STAGING"
mkdir -p "$STAGING"

# --strip-components=2 turns docs/design-notes/2026-W31.md into 2026-W31.md.
# `|| true` because an empty or missing directory in the tree is a normal state
# (nothing drafted yet), not an error worth alerting on.
if git -C "$REPO" archive origin/main docs/design-notes 2>/dev/null \
   | tar -x -C "$STAGING" --strip-components=2 2>/dev/null; then
  # Say "markdown file(s)", not "issue file(s)". This counts everything copied out
  # of docs/design-notes/, which includes README.md — so the old wording reported
  # "2 issue file(s)" for one issue and a readme. The sender prints the real issue
  # count on the next line; this one must not pre-empt it with a bigger number.
  COUNT=$(find "$STAGING" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')
  log "design-notes: staged $COUNT markdown file(s) from origin/main"
else
  log "design-notes: no docs/design-notes/ in origin/main yet — nothing to stage"
fi

cd "$SERVER" || { log "design-notes: FATAL cannot cd $SERVER"; exit 1; }

DESIGN_NOTES_DIR="$STAGING" /usr/bin/node scripts/send-design-notes.cjs "$@"
RC=$?

rm -rf "$STAGING"
log "design-notes: done (rc=$RC)"
exit $RC
