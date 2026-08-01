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
#
# server/ is skipped too (added 2026-08-01). It is a separate Express app
# deployed to the DigitalOcean droplet by scp — Vercel never runs it. Verified
# before adding: nothing under src/, app/ or next.config.ts imports server/,
# and server/ contains zero .ts files, so it contributes nothing to `next build`
# or to the type-check that build performs. Backend-only pushes were burning a
# full ~3 CPU-hour rebuild of every static page for no artefact change, and this
# repo pushes backend fixes often.
#
# WHY SKIPPING IS NOT LOSING A CHECK: .github/workflows/ci.yml runs on every push
# to main and executes typecheck, lint, the full test suite AND `npm run build` —
# it installs server deps too (`npm ci --prefix server`). So the Next build is
# still compiled and verified on a server-only push; Vercel is merely not asked to
# render 4,461 pages and re-write the ISR cache for an artefact that cannot have
# changed. If ci.yml ever stops running `npm run build`, take server/ back out.
#
# (tsconfig.json includes "**/*.ts" repo-wide, so a future .ts under server/ would
# be type-checked by that CI build as well — today there are none.)
METADATA='^(\.claude/.*|docs/.*\.md|server/.*|autopilot-log\.md|STRUCTURE\.md|gemini-review-todo\.md|todo\.md|HANDOFF\.md|README\.md|AGENTS\.md|CLAUDE\.md|IMPROVEMENTS\.md|PRODUCT_MEMO\.md|ROADMAP\.md|support-knowledge\.md)$'

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
