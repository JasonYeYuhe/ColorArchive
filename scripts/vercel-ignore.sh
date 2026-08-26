#!/bin/bash
# Vercel Ignored Build Step — exit 0 = skip build, exit 1 = build
# Skips deployment when only metadata files changed.

# WHICH COMMIT DO WE DIFF AGAINST?
#
# VERCEL_GIT_PREVIOUS_SHA is the previous deployment *of this branch*. On a
# branch's FIRST deployment there is no such thing, so it arrives empty.
#
# This used to `exit 1` (build) in that case, described as "build to be safe".
# It is not safe, it is expensive, and it was the single largest line on the
# Vercel bill. Measured over the 2026-07-25..08-25 cycle: 20 one-shot
# `claude/admiring-ramanujan-*` branches exist, 14 of them inside that window,
# every one of them a scheduled support-inbox check whose commit message is
# some spelling of "no new emails". Each got a full 4,461-page production-grade
# build because it was always a branch's first deployment, so this guard fired
# every single time and never once did its job. Build CPU for the cycle was 124
# hours / $26.17, against 7 pushes to main that genuinely needed building.
#
# So: fall back to the merge base with the production branch instead of giving
# up. "What has this branch changed relative to main" is exactly the right
# question for a preview deployment, and it is answerable without a previous
# deployment. Only when we cannot establish ANY base do we build blindly —
# that remains the correct failure direction, it just stops being the norm.
BASE="$VERCEL_GIT_PREVIOUS_SHA"

if [ -z "$BASE" ] || ! git cat-file -e "$BASE" 2>/dev/null; then
  # The merge-base fallback is ONLY valid for a branch that forked off main.
  # For main itself the merge base is HEAD, so the diff is empty and the script
  # would report "nothing changed" and skip a real production deploy. Caught by
  # CASE 2 of the table below, which is why that case is in the table.
  if [ "$VERCEL_ENV" = "production" ] || [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
    echo "→ Production deploy with no previous SHA — building (never skip production on a guess)"
    exit 1
  fi

  # Vercel clones shallow, so main is usually absent — fetch just enough of it.
  # Depth 50 comfortably covers any branch cut from a recent main; failure here
  # is non-fatal and simply falls through to the build-anyway branch below.
  git fetch --no-tags --depth=50 origin main >/dev/null 2>&1 || true
  BASE=$(git merge-base HEAD FETCH_HEAD 2>/dev/null || git merge-base HEAD origin/main 2>/dev/null || echo "")

  # A branch whose merge base is HEAD contains nothing of its own — it is main,
  # or an exact copy of an ancestor. Diffing gives an empty set, which must not
  # be read as "no changes, skip".
  if [ -n "$BASE" ] && [ "$(git rev-parse "$BASE")" = "$(git rev-parse HEAD)" ]; then
    echo "→ Branch has no commits of its own relative to main — building"
    exit 1
  fi

  if [ -n "$BASE" ]; then
    echo "→ No previous deployment for this branch; diffing against merge-base with main ($BASE)"
  fi
fi

if [ -z "$BASE" ] || ! git cat-file -e "$BASE" 2>/dev/null; then
  echo "→ No usable base commit, proceeding with build"
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

CHANGED=$(git diff "$BASE" HEAD --name-only)

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

# ── VERIFIED BEHAVIOUR (2026-08-26) ───────────────────────────────────────────
# Run against a real clone, one case per row. CASE 2 and CASE 6 are the ones the
# merge-base fallback can get WRONG, and both were caught by running it rather
# than by reading it — CASE 2 skipped a production build on the first draft.
#
#   1  autopilot branch, no prev deploy, metadata-only   → SKIP   ✅
#   2  main production deploy, no prev SHA               → BUILD  ✅
#   3  branch with a real code change, no prev deploy    → BUILD  ✅
#   4  branch with only a docs change, no prev deploy    → SKIP   ✅
#   5  normal main push WITH prev SHA (unchanged path)   → BUILD  ✅
#   6  branch identical to main (no commits of its own)  → BUILD  ✅
