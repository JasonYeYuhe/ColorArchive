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
# IMPORTANT: paths are repo-root-relative. STRUCTURE.md lives at the
# repo root, not under docs/. docs/dev-plan-*, docs/gemini-review-*,
# and docs/human-todo.md are all autopilot-only artefacts that never
# change shipped HTML.
METADATA='^(\.claude/session-lock\.json|\.claude/autopilot-tasks\.md|autopilot-log\.md|docs/autopilot-log\.md|docs/human-todo\.md|STRUCTURE\.md|docs/STRUCTURE\.md|docs/dev-plan-.+\.md|docs/gemini-review-.+\.md|docs/modification-opinion-.+\.md|docs/next-phase-plan-.+\.md|docs/oauth-redirect-fix-plan\.md|docs/commerce-validation-plan-.+\.md|docs/ls-commerce-validation-.+\.md|docs/lemonsqueezy-.+\.md|docs/pinterest-standard-access-plan-.+\.md|docs/proposal-subscription-only-model\.md|docs/color-of-day-redesign\.md|docs/development-plan-.+\.md|docs/devto-article\.md|docs/directory-submissions\.md|docs/domain-migration-checklist\.md|docs/google-auth-checklist\.md|docs/ios-iap-setup-guide\.md|docs/product-hunt-launch\.md|docs/trademark-.+\.md|docs/backup-runbook\.md|docs/commerce-ops-checklist\.md|docs/app-store-listing\.md|docs/daily-colors-log\.md|docs/daily-posts-queue\.md|gemini-review-todo\.md|todo\.md|HANDOFF\.md|README\.md|AGENTS\.md|IMPROVEMENTS\.md|PRODUCT_MEMO\.md|ROADMAP\.md|support-knowledge\.md)$'

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
