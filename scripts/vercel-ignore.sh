#!/bin/bash
# Vercel Ignored Build Step — exit 0 = skip build, exit 1 = build
# Skips deployment when only metadata files changed.

# If previous SHA is missing or invalid (shallow clone), build to be safe
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ] || ! git cat-file -e "$VERCEL_GIT_PREVIOUS_SHA" 2>/dev/null; then
  echo "→ Previous SHA unavailable, proceeding with build"
  exit 1
fi

# Files that don't affect the built artefacts. If a push only modifies
# files matching this regex, skip the Vercel deployment entirely.
#
# IMPORTANT: paths are repo-root-relative. Each skipped build saves ~3
# CPU-hours (the site has 4,461 static pages) AND avoids invalidating the
# ISR cache (a per-deploy re-write storm) — the top two line items on the
# Vercel bill (see docs/human-todo.md). The build imports NOTHING from
# docs/ or .claude/ and no .md/.mdx (verified 2026-06-20), so ALL docs
# markdown + ALL .claude state are blanket-skipped — no need to enumerate
# every doc filename (the old list silently built on any new, unlisted doc).
METADATA='^(\.claude/.*|docs/.*\.md|autopilot-log\.md|STRUCTURE\.md|gemini-review-todo\.md|todo\.md|HANDOFF\.md|README\.md|AGENTS\.md|CLAUDE\.md|IMPROVEMENTS\.md|PRODUCT_MEMO\.md|ROADMAP\.md|support-knowledge\.md)$'

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
