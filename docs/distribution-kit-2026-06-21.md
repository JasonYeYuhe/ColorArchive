# Distribution kit — 2026-06-21 (v3-aligned: a11y-audit-pain → /preorder)

> Supersedes the hook/channel choices in `distribution-plan-2026-06-15.md` (that one used the
> v2 "free tool → HN/r/web_design" approach, which the Gemini 3.1 Pro review of
> `dev-plan-2026-06-19.md` rejected as channel↔hook mismatch). This kit is the **v3** version:
> **hook = the pain of accessibility auditing**, **CTA = `/preorder/`**, **channels = a11y +
> design-systems communities + direct ICP outreach** — not generic free-tool gawkers.
>
> **Why now (hard data, 2026-06-20):** 26k pageviews/30d, ~13k/wk to `/word-to-color`, and
> **0 visits to `/preorder` — ever. 0 orders.** The product + funnel work; nobody is being
> walked to the paid offer. This is 100% a distribution problem. Code is done.

## The offer (keep it honest)
- **Accessibility Auditor** (an upcoming ColorArchive Pro feature): scan a whole palette /
  design system for WCAG contrast + color-blindness in one pass, get accessible replacement
  colors from the 5,446-color archive, export fixed tokens + a PDF report.
- **Founder pre-order ¥4,999 (≈$33)**, regular ¥9,999 (≈$67). **Ships Q3 2026. Full refund if
  it doesn't ship.** → `https://colorarchive.org/preorder/`
- It's a pre-order for an unbuilt feature — say so. The ask is "pay the founder price to back
  it," and the honest goal is to find out if the pain is real enough that people will.

## ICP (who to actually reach)
People with a **WCAG/accessibility-compliance pain** who'd pay to automate it:
- **Design-system owners / Design Ops** at companies with a token-based palette (contrast across
  every token pairing is a real recurring chore).
- **Accessibility specialists / a11y engineers** (they audit by hand today).
- **Front-end leads** at orgs under WCAG/ADA/EAA compliance pressure (EU Accessibility Act took
  effect 2025 — live, relevant pain).
- **Small branding / compliance agencies** doing audits for clients.

## Channels + ready-to-use UTM links (so the gate dashboard auto-attributes)
Use these EXACT links — `utm_source` is chosen to land in the right channel bucket in the
`/analytics` gate (qualified vs generic), `utm_medium` records the platform. Campaign is fixed.

| Channel (ICP) | Paste this link | Shows in gate as |
|---|---|---|
| LinkedIn DM | `…/preorder/?utm_source=linkedin&utm_medium=dm&utm_campaign=auditor-preorder` | linkedin (qualified) |
| LinkedIn post | `…/preorder/?utm_source=linkedin&utm_medium=post&utm_campaign=auditor-preorder` | linkedin (qualified) |
| X DM / post | `…/preorder/?utm_source=x&utm_medium=dm&utm_campaign=auditor-preorder` | x (qualified) |
| web-a11y Slack / a11y Discord | `…/preorder/?utm_source=a11y-community&utm_medium=slack&utm_campaign=auditor-preorder` | a11y-community (qualified) |
| **r/accessibility** | `…/preorder/?utm_source=a11y-community&utm_medium=reddit&utm_campaign=auditor-preorder` | a11y-community (qualified) |
| Design Systems Slack | `…/preorder/?utm_source=design-systems&utm_medium=slack&utm_campaign=auditor-preorder` | design-systems (qualified) |
| Cold email | `…/preorder/?utm_source=cold-email&utm_medium=email&utm_campaign=auditor-preorder` | email (qualified) |
| a11y/DS newsletter (micro-sponsor) | `…/preorder/?utm_source=a11y-community&utm_medium=newsletter&utm_campaign=auditor-preorder` | a11y-community (qualified) |

(`…` = `https://colorarchive.org`.) **Note on r/accessibility:** I deliberately tag it
`a11y-community`, NOT a generic reddit source — the gate's qualified-floor *excludes* `reddit`
(broad subreddits = gawkers per §5), but r/accessibility is genuine ICP, so this counts it as
qualified. Don't reuse the `a11y-community` tag for a broad subreddit.

**Specific places to start** (you're already in some): web-a11y Slack (web-a11y community),
the Design Systems Slack (design.systems), r/accessibility, A11Y Project / Deque/axe community,
relevant Discords (Friends of Figma a11y, design-systems servers). Newsletters for the paid
contingency: A11y Weekly, Smashing, Design Systems newsletters.

## Outreach templates (value-first, maker disclosed)

**A) LinkedIn / X DM (short — research the person first):**
> Hi [name] — really liked your work on [their DS / a11y post]. Quick question for someone who
> lives this: how do you audit colour accessibility across a whole design system today — WCAG
> contrast for every token pairing, colour-blind checks? I'm building a tool that scans an entire
> palette/system in one pass and pulls accessible replacements from a 5,446-colour archive.
> There's a refundable founder pre-order while I validate it ([link]). Mostly I'd love your honest
> take — is this a real pain for your team, or am I solving something you've already got handled?

**B) Cold email:**
> Subject: auditing colour accessibility across your design system?
>
> Hi [name],
> [1 line: something specific + true about their work/company.]
> I'm building **ColorArchive Accessibility Auditor** — point it at a palette or design system and
> it checks every colour pairing for WCAG contrast + colour-blindness in one pass, then suggests
> accessible replacements and exports fixed tokens + a PDF. It's the part of an a11y audit that's
> pure manual grind today.
> It ships Q3; there's a **founder pre-order (¥4,999 ≈ $33, fully refundable if it doesn't ship)**
> here: [link]. Honestly I'm as interested in your reaction as the order — is whole-system colour
> auditing a real pain where you work?
> — Jason (maker)

**C) Community contribution (a11y Slack / r/accessibility) — lead with value, NOT the pitch:**
> [Answer a real question or share a genuinely useful take first — e.g. a quick method for
> catching low-contrast token pairings, or ColorArchive's *free* contrast/colour-blind tools as a
> helpful resource.] Then, only if it fits + the community allows self-promo + you've disclosed
> you're the maker: "I'm building a tool to automate the whole-system version of this — refundable
> founder pre-order if it's useful to you: [link]. Happy to hear if this is the wrong approach."

## Content posts (≥2/wk, a11y-audit-pain angle → /preorder)
1. **The pain post** (LinkedIn/X): "Manually checking WCAG contrast for every colour pairing in a
   design system is the kind of soul-crushing grind nobody budgets for — until the audit fails. So
   I'm building a one-pass auditor for whole palettes/systems. [what it does] Founder pre-order if
   you'd use it: [link]." Invite replies on how they do it today (that's also validation signal).
2. **The how-to value post**: a genuinely useful mini-guide ("3 ways colour choices silently fail
   WCAG in a design system") that ends with a soft CTA. Earns reach on merit.
3. **The EAA/compliance angle** (timely): the EU Accessibility Act is live — "if your product ships
   in the EU, your colour system is in scope. Here's the colour part of compliance, and a tool I'm
   building to make it one click."

## Weekly quotas (per dev-plan §3 — fill a real work-week, ~30+h/wk)
- **≥40 highly-targeted ICP touches/wk** (cold email + LinkedIn/X DM — research each, value-first).
- **≥20 genuine community contributions/wk** (answer/participate in a11y + DS communities; not blasts).
- **≥2 a11y-audit-pain posts/wk.**
- Target: ~**145 qualified UV/wk** to /preorder → ≥500 over the window.

## What to watch
- **The new `/analytics` gate card** (admin login) — qualified /preorder UV by channel, paywall
  triggers, orders. The PostHog "Exit Gate" dashboard mirrors it (funnels broken down by `channel`).
- **Tripwire ~2026-07-02** (window half-over): cumulative qualified /preorder UV < 250 → current
  channels/hook aren't working → switch / scale outreach hard / consider paid micro-sponsorship.
  Don't sit and wait.
- **Exit gate ~2026-07-15** (hard wall): ≥500 qualified UV (or ≥1000 paywall) + ≥10 real card
  pre-orders → build the Auditor. Else → off-ramp. (No re-window; see dev-plan §5.)

## Guardrails (or it backfires)
- **Disclose you're the maker** everywhere. Lead with value, never the pitch.
- **No blasting the same link everywhere same-day**; personalize every DM/email.
- **Reddit caveat (memory):** the Chrome extension domain-blocks reddit.com — post manually, or
  the screencapture + cliclick + AppleScript route used for the Figma launch.
- **No fake engagement / vote manipulation.** One honest post each. Quality > volume — junk UV
  pollutes the gate read (the whole point of channel hygiene).
