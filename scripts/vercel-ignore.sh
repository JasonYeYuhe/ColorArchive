#!/bin/bash
# Vercel Ignored Build Step — exit 0 = skip build, exit 1 = build
# Skips deployment when only metadata files changed.

# If previous SHA is missing or invalid (shallow clone), build to be safe
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ] || ! git cat-file -e "$VERCEL_GIT_PREVIOUS_SHA" 2>/dev/null; then
  echo "→ Previous SHA unavailable, proceeding with build"
  exit 1
fi

METADATA='^(\.claude/session-lock\.json|\.claude/autopilot-tasks\.md|autopilot-log\.md|docs/autopilot-log\.md|docs/human-todo\.md|docs/STRUCTURE\.md)$'

CHANGED=$(git diff "$VERCEL_GIT_PREVIOUS_SHA" HEAD --name-only)

if [ -z "$CHANGED" ]; then
  echo "→ No files changed, skipping build"
  exit 0
fi

NON_METADATA=$(echo "$CHANGED" | grep -vE "$METADATA")

if [ -z "$NON_METADATA" ]; then
  echo "→ Only metadata files changed, skipping build"
  exit 0
else
  echo "→ Code files changed, proceeding with build:"
  echo "$NON_METADATA"
  exit 1
fi
