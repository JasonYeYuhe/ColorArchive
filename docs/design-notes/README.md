# Design Notes — weekly issue drafts

Pipeline (see `server/scripts/send-design-notes.cjs`):

1. **Draft** — a scheduled cloud agent (Claude Code routine, weekly) writes
   `docs/design-notes/YYYY-Www.md` with `status: draft` and pushes it. `docs/*.md`
   is in the Vercel ignore list, so drafting never triggers a build.
2. **Approve** — a human reads the draft and flips the frontmatter to
   `status: approved`. Nothing can reach a subscriber before this happens: the
   sender skips anything that isn't approved.
3. **Send** — the approved file is copied to the droplet
   (`/root/ColorArchive/server/design-notes/`) and the weekly cron mails it to
   everyone with `subscribers.notes_subscribed = 1`. Sent issues are recorded in
   the `design_notes_sent` table, so a re-run can't double-send.

## Frontmatter

```yaml
---
title: The heading shown at the top of the email
subject: Subject line (falls back to title)
status: draft   # → approved, by a human, after reading it
---
```

Body is a small markdown subset: `##`/`###` headings, `**bold**`, `` `code` ``,
`[links](https://…)`, `- bullets`, and paragraphs. Everything is HTML-escaped
before formatting, so issue text can't inject markup.

## Editorial rules for drafts

- Audience: people who build things — designers and front-end engineers who
  arrived from a technical guide (contrast, OKLCH, tokens). Not colour theory
  for its own sake.
- Every claim must be true and checkable. No invented statistics, no fake case
  studies, no "studies show" without a real, named source.
- Only link to pages that actually exist in this repo (`app/` routes) — a dead
  link in a newsletter is worse than no link.
- One idea per issue, ~400–600 words. Concrete and usable beats comprehensive.
