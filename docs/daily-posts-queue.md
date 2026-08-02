# Daily Posts Queue — Facebook (Manual)

Post manually to Facebook Page when ready. Remove entries after posting.

---

## Weekly Roundup — 2026-08-02

> **There was no user-facing release this week, so this is not a changelog.** 27 commits landed between Jul 26 and Aug 2 and every one of them was internal: an identity bug where all per-IP rate limits collapsed into one global bucket, crawler filtering for the traffic numbers, the AI kill-gate, a closed `:3002` email vector plus a host firewall, backup-runbook corrections, and a red CI unblocked. **Zero new colors, tools, collections, or guides** — the tool count is still 43, unchanged from last week's post. Writing a "look what we shipped" post off this week would mean inventing news, so I didn't.
>
> Two things this week *are* real and publishable, and both were verified in code this run:
>
> 1. **The Delta E piece.** Design Notes issue 2026-W31 was approved (commit 6238e05). Its central claim checks out: `/compare/` genuinely displays **both** CIEDE2000 and CIE76 for a color pair, side by side, with a plain-language read — `src/components/color-compare-page.tsx:406`. So the tool spotlight below is safe to publish. **But the issue itself has no public URL** — Design Notes is email-only (`server/scripts/send-design-notes.cjs`), and `app/notes/` is the separate monthly-newsletter system driven by `src/lib/newsletter-issues.ts`. Do **not** link to the design note; link to `/compare/`.
> 2. **The privacy fix** (commit f84b59c). The brand generator was retaining verbatim user-typed briefs (`{industry, style}` free text — live rows held real creative briefs) first-party *and* forwarding them to PostHog, disclosed nowhere. That storage is gone, and `ca_sid` / `ca_attr_v1` / PostHog are now disclosed in the cookie and privacy policies. This is worth saying out loud, but it is a **correction of our own past behavior**, not a feature — the honest framing is transparency, not achievement.
>
> **Owner notes:** (a) Design Notes still has **0 subscribers** — the W31 issue has no recipients, so no email went out and no draft was burned. The recruitment slot has been on guide detail pages since Jul 25 (f4170cd); ~382 guide views over five clean filtered days produced 0 signups. That's a conversion signal, not a pipeline fault, and it won't be fixed by another weekly post. (b) Per repo convention this file is **manual-post-only** — nothing below has been published. (c) Keep the X variant **URL-free**: a link raises X API cost from ~$0.015 to ~$0.20 per post, which is what drained the credits in May.

### Facebook

🎨 **Two color tools can give you two different Delta E numbers for the exact same pair of colors. Here's why that matters.**

You're checking whether a "near match" is close enough — a vendor's Pantone-to-hex conversion, a dark-mode tint that's meant to read as the same blue, a rebrand tweak. You run both colors through a difference calculator and get back a number. But "Delta E" isn't one formula. It's a family of them, and they disagree.

**CIE76** is the original: plain Euclidean distance between two Lab coordinates. Fast, simple, and built on the assumption that Lab space is perceptually uniform — which it isn't. It overstates differences in saturated colors.

**CIEDE2000** corrects for that. It weights lightness, chroma and hue separately, adds a hue-rotation term for the blue region, and adjusts for how chroma sensitivity shifts with saturation. It's the standard for accessibility and print-matching work because it tracks human judgment more closely.

⚠️ **The trap:** the two are *not* off by a fixed ratio. The gap moves depending on where your colors sit in the gamut, so you can't convert one into the other with a multiplier. A bare "Delta E: 3.2" with no formula attached tells you almost nothing.

📏 **Working thresholds for CIEDE2000** (a practical scale, not a formal standard):
• Under 1 — imperceptible to most people
• 1–2 — visible only in close side-by-side comparison
• 2–10 — a visible shade difference within the same color family
• Above 10 — reads as a genuinely different color

💡 **If you set a color tolerance for a design system or a QA gate, write down which formula it's measured in.** A CIEDE2000 threshold of 2.0 and a CIE76 threshold of 2.0 are not the same bar — and treating them as interchangeable is exactly how swatches that visibly differ end up "passing."

Our comparison tool shows you both numbers at once, side by side, with a plain-English read of what the difference actually means.

Compare two colors → colorarchive.org/compare

#ColorArchive #ColorTheory #DesignSystems #Accessibility #DeltaE #ColorManagement #UIDesign #WebDev #DesignTools #BrandColors

### X / Twitter (@ColorArxiv — post WITHOUT a URL, see owner note)

Two tools can hand you different Delta E numbers for the same pair of colors.

CIE76: plain Euclidean distance in Lab.
CIEDE2000: weights lightness, chroma and hue separately.

They're not off by a fixed ratio, so you can't convert between them.

Always ask which formula. 🎨

### Optional secondary post — privacy (Facebook, lower priority)

🔒 **A change we made this week, and why we're telling you about it.**

Our AI brand-palette generator was storing the text you typed into it — the industry and style description that makes up your brief — alongside our analytics, and passing it to our analytics provider. It was never needed: the only thing we actually measure is which tool was used. It should never have been retained, and as of this week it isn't.

We've also written down, in plain language, every piece of storage the site uses — the per-visit session id, the first-touch referrer record, and our analytics. All of it is in the privacy and cookie policies now, including the part people usually leave out: signing in mid-visit links that visit's earlier anonymous activity to your account.

No ad identifiers. No session recording. No selling anything to anyone.

Read the policy → colorarchive.org/privacy

#Privacy #DataProtection #ColorArchive #IndieWeb

---

## Weekly Roundup — 2026-07-26

> Real news this week (Jul 19 – Jul 26): **the biggest release week in months** — 16 commits after two consecutive silent weeks. Everything claimed below was verified in code this run: 10 new tool pages exist under `app/` (screen-test hub + dead-pixel + color-screens, tailwind-colors, css-filter, color-wheel, color-temperature, dark-mode-colors, duotone, paint-mix); `/convert/` really does emit OKLCH/Lab/LCH; `/compare/` and `/name/` really do use CIEDE2000 ΔE; the tools page lists **43** distinct tools, so that number is safe to publish. iOS v1.3 with the Hue Challenge went live on the App Store Jul 22 (READY_FOR_SALE). **Not in the public post, deliberately:** (a) the Auditor pre-order was cancelled and every pre-order surface closed — zero pre-orders were ever placed, so there is no customer to notify and announcing a cancellation of a product nobody bought only creates confusion; (b) the email-capture/instrumentation/unsubscribe work is internal plumbing, not a user-facing feature. **Owner note:** after two filler weeks, this one is a genuine changelog — worth pinning, and worth a second post later in the week spotlighting Screen Test on its own rather than burying it in a 10-tool list.

### Facebook

🎨 **This week at ColorArchive — 10 new free tools, and a new game on iOS.**

After a couple of quiet weeks, this one made up for it. Everything below is live right now, and all of it is free.

🖥️ **Screen Test — a whole suite for checking your display.** A dead pixel test, fullscreen white / black / solid color screens, plus a guided walkthrough that ends with a shareable report card. Useful whether you're inspecting a monitor you just bought or trying to figure out if that mark is on your screen or your desk.

🎯 **Hue Arrangement Challenge.** Tap to swap a scrambled row of colors back into order, then get a score for how close you got. It's a small thing, and it is genuinely hard.

🛠️ **Seven more tools, each doing one job:**
• **Tailwind Color Finder** — paste a HEX, get the nearest Tailwind class
• **CSS Filter Generator** — turn a black icon any color you want, with a real CSS filter string
• **Color Wheel** — interactive harmony picker
• **Color Temperature** — Kelvin ↔ RGB
• **Dark Mode Converter** — take a light palette and get a dark one
• **Duotone Generator** — two-color image effect, in browser
• **Paint Mixing Calculator** — "what colors make this?"

🔬 **Sharper color math across the site.** Convert now outputs OKLCH, Lab and LCH. Compare and Color Name now use CIEDE2000 — the perceptual difference standard — so "closest match" means closest to your eye, not closest on paper.

📱 **iOS v1.3 is live on the App Store** with the Hue Challenge built in.

That brings us to **43 free tools**, all of them backed by the same 5,446-color archive.

Try Screen Test → colorarchive.org/screen-test

Browse every tool → colorarchive.org/tools

#ColorArchive #DesignTools #ColorPalette #WebDev #Tailwind #CSS #UIDesign #ScreenTest #ColorTheory #WeeklyUpdate

---

### Twitter / X

🎨 Big week at ColorArchive — 10 new free tools shipped:

🖥️ Screen Test suite (dead pixel, fullscreen color screens, guided check + report card)
🎯 Hue Arrangement Challenge — harder than it looks
🎨 Tailwind Color Finder, CSS Filter Generator, Color Wheel, Color Temperature, Dark Mode Converter, Duotone, Paint Mixing

Plus better color math everywhere: Convert now does OKLCH/Lab/LCH, and Compare + Color Name switched to CIEDE2000 ΔE.

iOS v1.3 is live too, with the Hue Challenge in it.

43 free tools now. Start here → colorarchive.org/screen-test

#ColorArchive #DesignTools #WebDev #Tailwind

---

## Weekly Roundup — 2026-07-19

> Real news this week (Jul 12 – Jul 19): **no product releases** — again zero code commits (the only commit in the window was last week's roundup). This is the **second consecutive quiet week**, so this is another evergreen spotlight, not a changelog. Last week spotlighted Word to Color, so this one goes to a different live tool: the **Color Blindness Simulator** (`/colorblind`) — verified in code this run: 4 deficiency types (protanopia, deuteranopia, tritanopia, achromatopsia) and palette mode accepting up to 8 pasted hex codes. It pairs naturally with Palette Audit for an accessibility angle. No "new," no fake urgency — the tool has been live for a while and the copy says so. **Owner note:** two silent weeks in a row is itself the signal — if nothing ships next week either, consider whether the weekly cadence should drop to monthly rather than keep generating filler.

### Facebook

🎨 **This week at ColorArchive — another quiet release week, so here's a tool worth knowing about.**

No new releases this week. Instead, a spotlight on something already live that too few people use: the **Color Blindness Simulator.**

👁️ **See your colors the way ~300 million people do.** Check any color — or a whole palette — under protanopia, deuteranopia, tritanopia, and achromatopsia. The distinction that looks obvious to you may collapse into one shade for someone else.

🎨 **Palette mode.** Paste up to 8 hex codes and see your entire palette rendered under each type of color vision deficiency, side by side. It's the fastest way to catch a chart or UI state that only works if you can see red and green apart.

♿ **Pairs with Palette Audit.** Simulator shows you what breaks; Palette Audit tells you which contrast pairs fail WCAG and suggests a real named color from the archive that passes.

Test your palette → colorarchive.org/colorblind

Explore all 5,446 colors → colorarchive.org

#ColorArchive #Accessibility #a11y #DesignTools #ColorPalette #ColorBlindness #InclusiveDesign #UIDesign #WCAG

---

### Twitter / X

🎨 Another quiet release week at ColorArchive — so here's an underused tool:

👁️ Color Blindness Simulator: check any color, or paste up to 8 hex codes, and see your whole palette under protanopia, deuteranopia, tritanopia & achromatopsia.

That red/green distinction in your chart? It may not exist for your reader.

Test it → colorarchive.org/colorblind

#ColorArchive #a11y #InclusiveDesign #DesignTools

---

## Weekly Roundup — 2026-07-12

> Real news this week (Jul 5 – Jul 12): **no product releases** — zero code commits landed this week (the only commit was last week's roundup itself). The Jun 29 batch (Palette Audit auto-fix, DTCG token export, /analyze contrast, iOS 1.2.1 in review) was already announced in last week's post, so re-announcing it would be dishonest. Rather than manufacture news, this is an evergreen **spotlight** on a real, already-live tool — Word to Color — which is our most-visited page. Kept truthful and low-key: no "new," no fake urgency. If a genuine feature ships next week, go back to a real changelog post.

### Facebook

🎨 **This week at ColorArchive — a quiet week, so here's a favorite worth revisiting.**

No new releases this week — so instead, a spotlight on the tool people keep coming back to: **Word to Color.**

✍️ **Type any word, get a color.** "Ocean," your name, your brand, a mood — Word to Color turns any text into a repeatable color and a small palette to go with it. Same word always gives the same result, so it's stable enough to actually build on.

🎨 **Every result maps into the archive.** The colors you get aren't random one-offs — they connect to our 5,446 curated, named colors, so you can branch out into analogous and complementary shades from there.

Give it a word and see what comes back → colorarchive.org/word-to-color

Explore all 5,446 colors → colorarchive.org

#ColorArchive #DesignTools #ColorPalette #ColorInspiration #WordToColor #BrandColors #UIDesign #WeeklyUpdate

---

### Twitter / X

🎨 Quiet release week at ColorArchive — so here's a favorite worth revisiting:

✍️ Word to Color: type any word — a name, a mood, a brand — and get a repeatable color + palette back. Same word, same result, every time.

Every color maps into our 5,446-color archive, so you can branch into analogous & complementary shades.

Try it → colorarchive.org/word-to-color

#ColorArchive #DesignTools #ColorPalette #WordToColor

---

## Weekly Roundup — 2026-07-05

> Real news this week (Jun 28 – Jul 5): a genuinely feature-y week on the tools side (commit 9d7586f, Jun 29). The headline is that **Palette Audit stopped just flagging problems and started fixing them** — every failing WCAG contrast pair now gets a concrete suggestion pulled from the 5,446-color archive (a real named color that clears AA, not a random hex). Supporting features: the **token exporter now emits standard W3C DTCG tokens** (with each color's name carried through as documentation), the **/analyze tool now runs a contrast check on any site's brand colors**, and the **palette generator got a "Preview on UI" link**. On mobile, **iOS 1.2.1 was submitted to App Store review** (StoreKit purchase-reliability fix). No new colors, collections, or guides this week. Lead with the Palette Audit auto-fix — it's the real differentiator. Keep the DTCG/token line for the design-tooling crowd; don't overclaim on iOS since it's still in review.

### Facebook

🎨 **This week at ColorArchive — the tools stopped just pointing at problems and started fixing them.**

♿️ **Palette Audit now suggests the fix, not just the fail.** Run a check and any color pair that fails WCAG contrast now comes with a ready-made replacement — pulled straight from our 5,446-color archive. It's always a real, named color that actually clears AA, so you get a fix you can reuse, not a random hex to babysit.

🧩 **Token export is now standard-compliant.** The token generator now outputs proper W3C DTCG design tokens — and every color's name travels with it as built-in documentation. Drop them straight into your design system.

🔍 **Check any site's contrast in seconds.** Paste a URL into /analyze and it now pulls the brand colors *and* runs a WCAG pairwise contrast snapshot — so you can spot accessibility gaps on any site, not just your own palette.

👀 **Preview your palette on a real UI.** The palette generator got a "Preview on UI →" link, so you can see your five colors on an actual interface before you commit.

📱 **iOS update in review.** ColorArchive 1.2.1 is with Apple, carrying a purchase-reliability fix for Pro.

Explore 5,446 curated colors → colorarchive.org

#ColorArchive #DesignTools #Accessibility #a11y #ColorContrast #DesignTokens #DTCG #UIDesign #ColorPalette #WeeklyUpdate

---

### Twitter / X

🎨 This week at ColorArchive — the tools got smarter:

♿️ Palette Audit now suggests fixes, not just fails — every failing contrast pair gets a real named color from the archive that clears WCAG AA
🧩 Token export is now standard W3C DTCG (names carried as docs)
🔍 /analyze runs a contrast check on any site's brand colors
👀 New "Preview on UI" link in the palette generator
📱 iOS 1.2.1 in App Store review

5,446 colors. Better every week.
→ colorarchive.org

#ColorArchive #DesignTools #a11y #DesignTokens #ColorContrast

---

## Weekly Roundup — 2026-06-28

> Real news this week (Jun 21 – Jun 28): another under-the-hood week — the bulk was security hardening and back-end measurement plumbing, no headline new feature. The honest user-facing theme is **accessibility**: the tools got an a11y polish pass (better text contrast and visible keyboard focus rings on the Contrast checker and other tool pages), and the **Palette Audit** tool no longer chokes on big palettes — it now caps analysis at 60 colors so it stays responsive instead of freezing. We're also quietly opening early reservations for an upcoming **Accessibility Auditor**. No new colors, collections, or guides this week. Lead with the accessibility polish; keep the Auditor a soft, optional teaser — don't overcommit since it's still validation-stage.

### Facebook

🎨 **This week at ColorArchive — making the tools work for everyone.**

No flashy new feature this week — instead we spent it on accessibility, which honestly matters more.

♿️ **The tools got an accessibility pass.** Better text contrast and clear, visible focus outlines when you navigate with a keyboard — so the Contrast checker and our other tools are easier to use for everyone, however you get around the page.

⚡️ **Palette Audit handles big palettes now.** Drop in a large set of colors and it stays smooth instead of grinding to a halt — analysis is capped at 60 colors so the tool stays fast and responsive.

👀 **Coming soon: an Accessibility Auditor.** We're exploring a tool to check whole palettes against accessibility standards. If that'd be useful to you, you can reserve early at colorarchive.org/preorder.

Same 5,446 curated colors. Now a little more usable for everyone.

Explore the library → colorarchive.org

#ColorArchive #DesignTools #Accessibility #a11y #ColorContrast #UIDesign #ColorPalette #WeeklyUpdate

---

### Twitter / X

🎨 This week at ColorArchive — accessibility focus:

♿️ Tools got an a11y pass — better contrast + visible keyboard focus rings
⚡️ Palette Audit no longer freezes on big palettes (now capped at 60 colors)
👀 Reserving early for an upcoming Accessibility Auditor → colorarchive.org/preorder

Same 5,446 colors, now more usable for everyone.

#ColorArchive #a11y #DesignTools #UIDesign

---

## Weekly Roundup — 2026-06-21

> Real news this week (Jun 14 – Jun 21): a quieter, under-the-hood week — no headline new feature, mostly speed and polish. The two genuinely user-facing wins: **(1) the site got noticeably faster** — we eliminated two oversized JavaScript bundles and slimmed page payloads dramatically (a typical color page's data dropped ~96%, from ~1MB to ~36KB), so pages load and feel snappier; **(2) shared links now look right everywhere** — previously some pages (notes, stories, use-cases, regions, brands, families) showed a blank card when shared on social; every page type now generates a proper preview image. The rest was internal: first-touch attribution/analytics plumbing and Vercel cost optimization. Lead with speed + link previews; keep it honest and modest.

### Facebook

🎨 **This week at ColorArchive — faster, and better to share.**

No big new toy this week — we spent it making the things you already use feel better.

⚡️ **The site is noticeably faster.** We trimmed a lot of dead weight from the pages — a typical color page now ships about 96% less data than before. Browsing, searching, and jumping between colors all feel snappier, especially on slower connections.

🔗 **Shared links finally look right everywhere.** If you've ever pasted a ColorArchive link into a chat or a post and gotten a blank, sad-looking preview — that's fixed. Every page now generates a proper preview image, so colors, collections, guides, and stories all show up beautifully when you share them.

Same 5,446 curated colors. Just smoother.

Explore the library → colorarchive.org

#ColorArchive #DesignTools #ColorPalette #UIDesign #WebPerformance #ColorInspiration #WeeklyUpdate

---

### Twitter / X

🎨 This week at ColorArchive — quiet but worth it:

⚡️ Site is noticeably faster — typical color page now ships ~96% less data
🔗 Shared links look right everywhere now — every page generates a proper preview image (no more blank cards)

Same 5,446 colors. Just smoother.
→ colorarchive.org

#ColorArchive #DesignTools #UIDesign #ColorPalette

---

## Weekly Roundup — 2026-06-14

> Real news this week (Jun 7 – Jun 14): the **ColorArchive Figma plugin v1.1.0 shipped to Figma Community** and we ran a full launch wave across 7 channels (X, Instagram, Pinterest, Facebook, Indie Hackers, Product Hunt, Reddit r/FigmaDesign). v1.1.0 adds API-key persistence (clientStorage) so you stay signed in between sessions, plus a couple of review-rejection bugfixes (localStorage guard, FigJam compatibility) and a CORS fix for the plugin's `Origin: null` calls. The rest was internal (UTM attribution plumbing, CI guard, launch docs). Lead with the plugin — it's the one genuinely new, user-facing thing.

### Facebook

🎨 **ColorArchive is now a Figma plugin.**

You no longer have to leave your canvas to find the right color. The ColorArchive plugin is live in the Figma Community — search all 5,446 named colors, inspect any swatch, and drop it straight into your design.

What's new in v1.1.0:
• 🔑 Stays signed in — your API key now persists between sessions, no re-entering it every time
• 🧩 Works in both Figma and FigJam
• ⚡️ Faster, more reliable color lookups inside the plugin

Same curated 5,446-color library you know from the site — now one click away inside Figma.

Get the plugin → search "ColorArchive" in the Figma Community
Explore the full library → colorarchive.org

#ColorArchive #Figma #FigmaPlugin #DesignTools #ColorPalette #UIDesign #ProductDesign #DesignWorkflow #ColorInspiration

---

### Twitter / X

🎨 This week at ColorArchive: our Figma plugin is live 🎉

All 5,446 named colors, right inside your canvas:
🔑 v1.1.0 — stays signed in (API key persistence)
🧩 Works in Figma + FigJam
⚡️ Faster, more reliable color lookups

No more tab-switching to find the right color.
→ Search "ColorArchive" in the Figma Community
→ colorarchive.org

#ColorArchive #Figma #FigmaPlugin #DesignTools #UIDesign

---

## Weekly Roundup — 2026-06-07

> Real news this week (May 31 – Jun 7), breaking a 3-week quiet streak. Two genuinely user-facing shipments: (1) an **editorial redesign** rolled out across the whole site — Fraunces serif page titles, a cleaner gallery-white canvas, redesigned color cards/header, decorative glows removed; (2) **downloadable share cards for Word to Color** (1080×1350 PNG, free, no login). The rest of the week was internal (PostHog/Sentry/Datadog/New Relic analytics, GEO/robots.txt for AI crawlers) — not for public posting. Lead with the redesign; it's safe to frame as "new."

### Facebook

✨ **A fresh look for ColorArchive — and a new way to share your colors.**

We just rolled out an editorial redesign across the whole site. Cleaner gallery-white canvas, elegant serif page titles, redesigned color cards and header — the focus is now fully on the color, with the decorative noise stripped away. Same 5,446 named colors, a calmer place to explore them.

And if you use **Word to Color** — type any word, get a palette — you can now download your result as a share card:
• 1080×1350 portrait PNG, made for Xiaohongshu / Instagram / X
• A real visual artifact to save and post, not just a link
• Free for everyone, no login, no Pro gate

Take the new look for a spin → colorarchive.org
Turn a word into a shareable palette → colorarchive.org/word-to-color

#ColorArchive #DesignTools #ColorPalette #WordToColor #UIDesign #ColorTheory #DesignInspiration #ColorOfTheDay

---

### Twitter / X

✨ ColorArchive got a fresh editorial redesign this week — cleaner gallery-white canvas, serif titles, redesigned color cards. All the focus on the color.

Plus: Word to Color now exports a 1080×1350 share card (PNG, free, no login). Type a word → get a palette → post it.

Explore → colorarchive.org

#ColorArchive #DesignTools #ColorPalette #UIDesign

---

## Weekly Roundup — 2026-05-31

> Third quiet build week in a row (May 24–31). The only change this week was an **internal security & reliability hardening pass** — nothing user-facing, and security fixes should never be publicized. So this is another **feature spotlight**, a different tool from the last two weeks (05-24 Image Palette Extractor, 05-17 Word to Color). Do NOT frame as "new." Optional to post — can be skipped if we'd rather stay quiet until there's real news.

### Facebook

♿ **Feature spotlight: the Contrast Checker** — make sure your colors are actually readable.

Beautiful palettes that fail accessibility help no one. ColorArchive's free Contrast Checker tells you in real time whether any two colors pass WCAG — for body text, large text, and UI elements — so you can ship interfaces everyone can read.

What it gives you:
• Live WCAG contrast ratio between any foreground/background pair
• Instant AA / AAA pass-fail for normal text, large text, and UI components
• Pulls from our 5,446 named colors — swap "that gray on white" for one that actually passes
• No login, no paywall on the basic check

Accessibility isn't a nice-to-have — it's the difference between a design that works and one that locks people out. Test your combos → colorarchive.org/contrast

#ColorArchive #Accessibility #WCAG #DesignTools #ColorContrast #UIDesign #a11y #ColorPalette #InclusiveDesign

---

### Twitter / X

♿ This week's spotlight: the ColorArchive Contrast Checker.

Drop in any two colors → instant WCAG ratio + AA/AAA pass-fail for text, large text & UI. Pulls from 5,446 named colors so you can swap a failing pair for one that passes.

Free, no login → colorarchive.org/contrast

#ColorArchive #Accessibility #WCAG #UIDesign #a11y

---

## Weekly Roundup — 2026-05-24

> Second quiet build week in a row (May 17–24, no feature commits). This is another **feature spotlight** — different tool from last week's Word to Color post, so it can run as a standalone or be skipped. Do not frame as "new."

### Facebook

🎨 **Feature spotlight: the Image Palette Extractor** — turn any photo into a buildable palette in seconds.

Drop in a photo — a sunset, a textile, a movie still, your morning coffee — and ColorArchive pulls out the dominant colors *and* maps each one to its closest match in our 5,446-color library. The result isn't just a list of hex codes; it's a palette you can actually work with.

What it does that most extractors don't:
• Every extracted color gets matched to a named ColorArchive entry (so "that warm orange" becomes Amber Bloom Vivid)
• Click any color → jump to its full page (tonal companions, brand uses, cultural origins)
• Export the palette as HEX, RGB, HSL, CSS variables, or JSON
• Save straight into a palette project, or add to your favorites

No login required for the basic extract. Try it with your camera roll → colorarchive.org/image-palette

#ColorArchive #DesignTools #ColorPalette #FreeTools #ImageToPalette #UIDesign #ColorTheory #DesignInspiration

---

### Twitter / X

🎨 Underrated free tool on ColorArchive: the Image Palette Extractor.

Drop a photo → get the dominant colors + each one matched to a named entry from our 5,446-color library. Export as HEX, RGB, HSL, CSS, or JSON.

No login. Try it → colorarchive.org/image-palette

#ColorArchive #DesignTools #FreeTools #ColorPalette

---

## Weekly Roundup — 2026-05-17

> Quiet build week — no new features shipped (May 10–17). This is a **feature spotlight** instead of a changelog, so it doesn't repeat last week's launch post. Post one or skip the week; do not frame as "new."

### Facebook

🎨 **Feature spotlight: the Word to Color Generator** — a tiny free tool that's quietly one of our favorites.

Type any word, name, or phrase and ColorArchive turns it into a unique hex color — plus 5 tonal variants you can actually build a palette from. It's deterministic, which is the fun part: the same text *always* produces the same color. Your name has a color. Your brand has a color. Your dog's name has a color. They never change.

Why it's more than a toy:
• Pick a brand name and instantly get a consistent, repeatable color signature
• Use the 5 tonal variants as a ready-made light→dark scale
• Every result links straight into our 5,446-color library to find the nearest curated match

No login, no paywall. Try your own name → colorarchive.org/word-to-color

#ColorArchive #DesignTools #ColorPalette #FreeTools #BrandColors #UIDesign #ColorTheory #DesignInspiration

---

### Twitter / X

🎨 Underrated free tool on ColorArchive: the Word to Color Generator.

Type any word → get a unique hex + 5 tonal variants. Deterministic, so your name always maps to the same color. Yes, your dog's name has a color too.

No login. Try it → colorarchive.org/word-to-color

#ColorArchive #DesignTools #FreeTools #ColorPalette

---

## Weekly Roundup — 2026-05-10

### Facebook

🎨 **This week at ColorArchive** — a journaling tool, world-tour palettes, and the story behind every color.

**📓 Color Journal — daily check-in (Pro)**
Pick a color each day to capture how a project, a mood, or a moment felt. Now with a calendar month grid, one-click "use today's COTD" entry, and 1080×1080 PNG export so you can share a finished month as a single image.

**🌍 Cultural Regions — 18 palettes from around the world**
We expanded our cultural color library from 12 to 18 regions — Japan, Morocco, Mexico, Scandinavia, India, West Africa, the Mediterranean, and more — each curated from local textiles, architecture, and craft. Every one of our 5,446 color pages now shows which regional palettes it appears in, so you can trace any shade back to where it lives in the world.

**📖 Color Origins — heritage on every color page**
All 5,446 color pages now carry an Origins section: where the name comes from, which cultures have used the shade historically, and where it shows up in the wild (textiles, ceramics, signage, nature). It's the difference between "Saffron Core Vivid" as a hex code and Saffron as a 3,000-year-old story.

**🏷 Brand palettes — 24 → 51**
We more than doubled the brand-palette catalog — 51 major brands now have dedicated SEO landing pages with their primary, secondary, and accent colors mapped to ColorArchive entries. And the brand↔color graph is bidirectional: from any color page, see which brands use that exact shade.

**✨ Pro polish**
- Visible AI quota counter so you always know what's left
- Export watermark for free tier (clean export stays a Pro perk)
- Upfront ProGate counter — no surprise paywalls mid-flow

Explore 5,446 curated colors → colorarchive.org

#ColorArchive #DesignTools #ColorPalette #UIDesign #ColorTheory #BrandColors #DesignInspiration #CulturalColors #WeeklyUpdate

---

### Twitter / X

🎨 This week at ColorArchive:

✅ Color Journal — daily check-in + month grid + PNG export (Pro)
✅ Cultural Regions: 12 → 18 (Japan, Morocco, Mexico, India, Scandinavia…)
✅ Color Origins on all 5,446 pages — heritage, cultures, wild
✅ Brand palettes 24 → 51 + bidirectional brand↔color graph
✅ Visible AI quota + cleaner ProGate

5,446 colors. More story behind every one.
→ colorarchive.org

#ColorArchive #DesignTools #ColorPalette #BrandColors #UIDesign

---

## Weekly Roundup — 2026-04-05

### Facebook

🎨 **This week at ColorArchive** — what a week!

We shipped a ton of updates across the web app, iOS app, and developer tools. Here's the highlights:

**🚀 New Pro features**
- **Palette History** — revisit every palette you've generated, never lose a combination again
- **WCAG Contrast Audit** — check accessibility compliance right inside your workspace
- **Bulk ZIP export** — download all your palettes at once
- **Dark mode color pairs** — automatically surface dark-UI-ready companion shades
- **Smart export nudges** — get suggestions on the best export format for your workflow

**🎨 Brand Generator upgrades (Pro)**
- New **Full Brand System** panel generates a complete brand kit: primary, secondary, accent, neutrals, and dark mode variants, all in one click

**🛠 Token Generator**
- Export directly to **Figma Tokens** and **Style Dictionary** — your design tokens, your tools

**📱 iOS app**
- Cloud sync is live — your favorites and palettes follow you everywhere
- iOS in-app purchases submitted for App Store review (Pro subscription + lifetime access)

**🧩 VS Code extension**
- Browse and insert ColorArchive colors without leaving your editor

**💳 Cleaner checkout**
- Simplified to a single Pro subscription model — no more pack bundles to navigate

Explore 5,446 curated colors → colorarchive.org

#ColorArchive #DesignTools #ColorPalette #UIDesign #AccessibilityDesign #DesignSystem #FigmaTokens #ProFeatures #iOSApp #WeeklyUpdate

---

### Twitter / X

🎨 This week at ColorArchive — big updates shipped:

✅ Palette History (never lose a combo again)
✅ WCAG Contrast Audit built-in
✅ Figma Tokens + Style Dictionary export
✅ Full Brand System generator (Pro)
✅ iOS cloud sync live
✅ VS Code extension
✅ Bulk ZIP export

5,446 colors. More tools every week.
→ colorarchive.org

#ColorArchive #DesignTools #UIDesign #FigmaTokens #ColorPalette

---

## Weekly Roundup — 2026-04-26

### Facebook

🎨 **This week at ColorArchive** — a brand-new tool, smarter daily colors, and a quieter, faster site.

**🆕 Palette Audit — new free tool**
Paste any block of CSS, a Tailwind config, or a design-token JSON file, and we'll instantly:
- Map every color to its nearest ColorArchive entry (named, not just nearest hex)
- Cluster near-duplicates so you can collapse a sprawling palette
- Run a full pairwise WCAG AA contrast matrix and flag every failing pair
- Suggest specific swap-to-fix replacements

Runs entirely client-side. No upload, no signup, no rate limit. Try it → colorarchive.org/palette-audit/

**☀️ Color of the Day — redesigned algorithm**
We rebuilt the daily-color selection to use golden-angle hue rotation, so consecutive days feel genuinely different — no more two warm yellows in a row. iOS users also get the COTD in their local timezone now (no more "today's color" being yesterday's).

**📈 /trending API — upstreamed**
The Trending page's backing API is now in the main repo and properly versioned, so trending data stays fresh and reproducible.

**⚡ Quietly faster + more reliable**
Under the hood we shipped a cache-warmer for the heaviest pages, wired Sentry into the front and back end (so we catch issues before users have to report them), made CI lint blocking (106 errors → 0), and locked down the Apple in-app-purchase JWS contract with shape + cert-chain tests. Less drama, more uptime.

Explore 5,446 curated colors → colorarchive.org

#ColorArchive #DesignTools #ColorPalette #UIDesign #Accessibility #WCAG #DesignTokens #PaletteAudit #ColorOfTheDay #WeeklyUpdate

---

### Twitter / X

🎨 This week at ColorArchive:

🆕 Palette Audit — paste CSS/Tailwind/tokens, get named matches, duplicate clusters & full WCAG AA contrast report. Free, client-side → colorarchive.org/palette-audit/
☀️ Color of the Day rebuilt with golden-angle hue rotation (no more two yellows in a row)
📱 iOS COTD now respects your local timezone
📈 /trending API upstreamed and versioned
⚡ Cache-warmer + Sentry + blocking CI lint = quietly faster, fewer surprises

5,446 colors. New tools every week.
→ colorarchive.org

#ColorArchive #DesignTools #PaletteAudit #UIDesign #WCAG #DesignTokens

---

## Weekly Roundup — 2026-04-19

### Facebook

🎨 **This week at ColorArchive** — one of our biggest weeks yet!

Payments are live, Pinterest is running on autopilot, and we shipped a wave of UX improvements. Here's what dropped:

**💳 Lemon Squeezy payments — live now**
You can finally unlock Lifetime access to ColorArchive — one payment, forever yours. Single streamlined checkout, no friction.

**📌 Pinterest — fully automated**
ColorArchive is now pinning a Color of the Day to Pinterest every day, completely on autopilot. If you're on Pinterest, follow us for daily color inspiration → pinterest.com/colorarchive

**🔗 Rich link previews everywhere**
Collection and guide pages now generate dynamic Open Graph images — so when you share a link, it looks great in every feed.

**📱 iOS v1.2 submitted**
The latest iOS build is in Apple's hands for review. This one brings stability fixes and deeper Pro integration.

**🧭 New user onboarding tour**
First time on the site? A 3-step guided tour now walks you through everything — no more wondering where to start.

**📈 Trending colors — now real**
The Trending page is connected to live pageview data. The colors you see there are genuinely the most-explored colors right now.

**📐 Mobile got a lot better**
Touch targets, better modal scroll, improved breakpoints across the board. Much smoother on phones.

**🔐 Security hardened**
We closed a P0 webhook vulnerability and added a full LS webhook validator + strict payment amount checks. Your transactions are safe.

Explore 5,446 curated colors → colorarchive.org

#ColorArchive #DesignTools #ColorPalette #UIDesign #NewFeatures #WeeklyUpdate #Pinterest #LifetimeAccess #ColorInspiration

---

### Twitter / X

🎨 This week at ColorArchive — massive week:

💳 Lemon Squeezy live — Lifetime access now available
📌 Pinterest autopilot — daily Color of the Day, every day
🔗 OG images for collections + guides (share links look great)
📱 iOS v1.2 submitted for App Store review
🧭 New 3-step onboarding tour for first-time visitors
📈 Trending page now shows real pageview data
📐 Mobile UX improvements across the board
🔐 P0 security fix + webhook hardening

5,446 colors. Getting better every week.
→ colorarchive.org

#ColorArchive #DesignTools #UIDesign #ColorPalette #Pinterest

---

## 2026-03-30 | Cobalt Core Vivid #205CD5 | Tech Startup

Today's color: **Cobalt Core Vivid**
Hex: `#205CD5` | HSL: 220° 74% 48%

The blue you reach for when your UI needs to say sharp, fast, and confident. Not corporate, not cold — vivid enough to make every interface feel alive.

🎨 **Pick For Me scenario: Tech Startup**
Cobalt signals precision and energy. Pair it with neutral grays and a warm accent for a UI that converts and a brand that people trust.

Explore 5,446 curated colors → colorarchive.org

#ColorOfTheDay #ColorPalette #UIDesign #WebDesign #ColorTheory #Cobalt #BlueAesthetic #DesignTools #ColorArchive
