# Daily Posts Queue — Facebook (Manual)

Post manually to Facebook Page when ready. Remove entries after posting.

---

## Weekly Roundup — 2026-09-06

> **First week in seven with something a visitor can actually see.** 30 commits, Aug 30 → Sep 6. Counts are still byte-identical to the last four posts — colors **5,446**, collections **261**, guides **333**, tools **44** (43 on-site + the Figma plugin), **zero new colors, tools, collections or guides** — but this week the *existing* product changed in five visible ways, so for the first time since Jul 26 this is a changelog rather than a spotlight.
>
> **How the counts were read this run.** 🟢 **`vitest` works on this machine** and the Aug 30 owner-action (a) — "`vitest` will not start" — is **withdrawn**. Full suite this run: **48 files, 836 tests, all passing, 1.93s**, including `copy-counts.test.ts` (4 tests) which is the prose-vs-data guard. Counts were *also* read independently through an `esbuild`+`node` probe of `src/data/colors`, `src/lib/collections`, `landingGuides` in `src/lib/guides`, and `TOOL_COUNT` in `src/components/tools-page.tsx` — both methods agree. (Minor drift for a future run: `CLAUDE.md` says "44 files … 779 tests". The real figures are 48 / 836. Not corrected here — editing project instructions is outside this task's remit.)
>
> 🔴 **THIS RUN HAD NO NETWORK TO EITHER PRODUCTION OR GITHUB, AND THAT CHANGES WHAT IS VERIFIED.** `curl https://example.com` returns 200, but **`colorarchive.org` and `github.com` both return `000`** and `ssh github.com:22` fails — a selective block, not an outage, and it persisted with the sandbox disabled. Consequences, all of them load-bearing:
> - **No live URL was checked this run.** Every previous roundup verified its claims against the deployed site. This one verified them against the repo, the build script, and the actual zip files on disk. Where a claim needed production, it says so below.
> - **`git pull` failed, so the lock protocol's first step never ran.** The lock was free, taken and released locally, net diff zero — the correct end state either way. **The network came back before the push, and the commit is on `origin/main`** (`8e38a22`, in sync, nothing forced). Three sentences in the first version of this entry said it was unpushed; they were true when written and are corrected here rather than quietly deleted.
>
> ---
>
> **THE POST'S SUBJECT, AND IT IS THE best thing to happen to this site in weeks:** the free downloads were never linked. `grep -rn "downloads/.*\.zip" src app` returned **zero hits** — nothing in the entire application had ever pointed at either zip, though both have been publicly served and rebuilt on every deploy since April. That, not absence of demand, is why `/downloads/*` shows **0 impressions and 0 clicks in 90 days** of Search Console. Six weeks of these roundups read that zero as "nobody wants this." It was "nobody could find this." Fixed today in `1c9e79b`; both now sit at the top of `/free-resources/`.
>
> **Everything the post claims about those files was checked against the artifacts this run, not read off a commit message:**
> - `public/downloads/complete-archive.zip` — **782,150 bytes**, and it contains exactly the **fifteen** format files named in the post: `.css`, `tailwind-tokens.css`, `.json`, `scss-maps.scss`, `.gpl`, `sketchpalette.json`, `.ase`, `.aco`, `framer-tokens.css`, `figma-tokens.json`, `style-dictionary.json`, `.swift`, `.xml` (Android), `.dart`, `theme.js`.
> - **The "all 5,446" claim is exact, not rounded.** Unzipped and counted this run: the CSS file declares **5,446** custom properties and the JSON holds **5,446** entries. Both equal `colors.length`.
> - `public/downloads/brand-starter-kit.zip` — **18,776 bytes**, and 🔴 **three palettes, not twelve.** The first draft of this entry said twelve, inferred from the first screenful of the zip listing without counting. Counted properly (`*-brand-guide.md`): **3** — `quiet-luxury`, `nocturne-tech`, `orchid-bloom` — which is exactly what the page's own label has always said ("Brand Color Starter Kit — 3 curated palettes"). Each carries a brand guide, colour-psychology notes, and its own SwiftUI / Android / Flutter / theme.js exports. **A truncated listing is not a count**, and this is the second inference-instead-of-measurement error in this run's own subject matter.
> - **No signup, no paywall** — these are static files under `public/`, served by the CDN with no gate in front of them.
>
> 🟢 **AND THEN THE NETWORK CAME BACK, SO ALL OF IT WAS RE-CHECKED AGAINST PRODUCTION.** Everything above was verified against the repo; the following was verified against `colorarchive.org` after the block cleared, which is the standard the earlier roundups held themselves to:
> - `/downloads/complete-archive.zip` → **200, 786,092 bytes** (the deployed build regenerates it, hence the difference from the 782,150 on disk). Downloaded and opened this run: **15 format files** plus a README, and its CSS and JSON each hold exactly **5,446** entries. The post's two hardest numbers are true of the file a visitor actually receives.
> - `/downloads/brand-starter-kit.zip` → **200, 18,776 bytes**, byte-identical in size to the local copy.
> - **`1c9e79b` is deployed.** The HTML could not confirm it (see owner action (a2)), so the deployed JS chunks were grepped instead — the same technique `ec714e1` used for env vars. All 14 chunks pulled: `complete-archive.zip`, `brand-starter-kit.zip` and the exact new label `Complete Archive — 5,446 colors, 15 formats` are all present. The links are live.
> - **`/pro/` really does show two "Temporarily unavailable" buttons** — confirmed on the live page, which is exactly the yearly and lifetime pair. Exclusion 1 below is not a precaution, it is a measurement.
>
> 🔴 **AND IT REVERSES A STANDING NOTE IN `human-todo.md`, WHICH IS CORRECTED IN THIS COMMIT.** Yesterday's `cd165cc` recorded the SwiftUI / Android / Flutter exporters promised in `server/email.js:1280` as a **false promise**, citing `grep -rin swiftui src/ app/` = 0 hits. **The grep was the error, not the promise.** The generators live in `scripts/generate-downloads.mjs` (`generateSwiftUI`, `generateAndroidXml`, `generateFlutterDart`) and the output lives in `public/` — neither directory was searched. Re-verified independently this run: **15 `-swiftui.swift`, 15 `-colors.dart` and 15 `-colors.xml` files ship today**, plus complete-archive versions of all three. `1c9e79b` fixed the code and its own commit message but left `docs/human-todo.md:55` and `:76` still asserting "确认不存在"; this run corrects both. The half of that note that **still stands** is separate and unchanged: `:1124` sells "the complete 5,446-color token set" as a Pro benefit when it is the free public download above.
>
> **The four smaller visible changes, and what is actually true about each:**
> 1. **`/all-colors/` loads continuously** (`7975c81`). An IntersectionObserver sentinel raises the same limit the "Show more" button raises, 600px ahead of the viewport. The button stays — deliberately, because it carries the only `show_more` event and scrolling is not a gesture.
> 2. **Typing no longer re-navigates the page** (`1e01c05`, `7975c81`, `7323773`). Measured on production *before* the fix: typing a 9-character word on `/word-to-color/` issued **nine** separate `?q=…&_rsc=` requests, one per keystroke, remounting the component each time. Now one `history.replaceState`, no navigation. Seven pages in total.
> 3. **`/brands/` has a Tailwind snippet** (`44e9117`) next to the CSS one, using the same name derivation so both snippets always call a colour the same thing. Free and ungated.
> 4. **`/seasonal/` and `/mixer/` link into the archive** (`ecedbad`) — they had **zero** links into `/colors/` before, confirmed by grep. `/today/` and `/identify/` already had theirs; the plan was wrong to group all four.
> 5. **Pick-for-me works in Chinese, and stopped returning six shades of one colour** (`ca4f255`). Chinese has no spaces, so the whole phrase became one token and matched nothing — **11 of 12 chips returned an empty palette.** Ranked last on purpose: ~1.6 sessions/day. It is fixed because it was broken, not because it will grow anything.
>
> **Deliberately excluded, do not add:**
> 1. 🔴 **Do NOT write anything that sends people to buy Pro yearly or lifetime. Those buttons are DISABLED on `/pro/` right now** and read "Temporarily unavailable" — `ec714e1` stopped them silently falling back to a variant picker, which is how customer `id41` pressed "yearly" twice on Aug 31 and was charged ¥500 on the **monthly** variant. Monthly still works and all three sales in site history went through it. Until the three `NEXT_PUBLIC_PRO_*_CHECKOUT_URL` env vars are set, any post driving yearly traffic sends people to a dead button.
> 2. **`/20040303/` is private and personal.** Standing exclusion, repeated every week on purpose so no future run reading only `git log` mistakes it for a launch. `noindex`, unlinked, never in a public post, newsletter, sitemap or social copy.
> 3. **The paywall-honesty batch** (`f04fb67`, `cd165cc`, `bda47d4`). Real and correct work — the locked gate now says something true, and three `ProGate` bugs that only ever punished free users are gone. The announcement is "we were promising things we did not deliver," which is a confession, not news.
> 4. **The Google Ads repair** (`1c9e79b`, `65a5e71`). The account's website data source was still `colorarchive.me` — the domain the site migrated off — so Google reported the tag as "Not installed yet" while it had been live on `.org` the whole time. Its only primary Purchase action was a page load on a **deleted route on a dead domain**, zero conversions in its life. Internal.
> 5. **iOS v1.4.** Submitted Sep 5, `WAITING_FOR_REVIEW`, `AFTER_APPROVAL` release. **Not announced while unapproved** — hold it for the week it actually ships, and it is a genuine post when it does (it is the release where iOS analytics start working at all).
> 6. **The pageview correction.** 22 sessions produce 68% of this site's recorded pageviews, all from the keystroke bug in item 2. Ours to fix, not to announce.
>
> **Resolved since last week — dropping these, do not repeat them:**
> - ✅ Aug 30 owner action (a), "`vitest` will not start": **wrong.** 836 tests in 1.93s this run.
> - ✅ Aug 30 owner action (b), the Azure report scripts: **closed the same day** by an attended session with owner approval (`human-todo.md`, 2026-08-30) — redeployed and verified against the real DB.
> - ✅ Aug 23/30 owner action (c), duplicate build artifacts making `git status` unreadable: **fixed by `.gitignore:62`** (`**/* [2-9].*`). 48 duplicates remain on disk at 17 MB total; git no longer sees them and the Mac is at 28% disk, not 99%.
>
> **Owner actions:**
> (a) ✅ **Nothing needed — pushed.** The block cleared mid-run; `8e38a22` is on `origin/main` and this correction follows it. Docs-only, so `scripts/vercel-ignore.sh` skips the build (`docs/.*\.md` and `autopilot-log.md` are both in its METADATA set) — the second commit costs no Vercel minutes.
>
> (a3) 🔴 **A second session committed this run's corrections under its own message, and the lock did not stop it.** After this run released the lock and pushed `8e38a22`, session `7ea4284` ran `git add -A` while this run's follow-up edits were still unstaged, sweeping all four doc files into a Google Ads commit that is now on `origin/main`. **Nothing is lost and nothing is wrong in the content** — the palette-count fix, the push correction and the production checks are all there — but they are attributed to an unrelated change. Not rewritten: force-pushing a shared branch unattended to correct attribution is the worse trade. **The protocol gap is real and worth your decision:** `CLAUDE.md` releases the lock right after the final push, which leaves any post-push work unprotected. Either hold the lock until the last edit, or have runs stage nothing until the moment they commit.
>
> (a2) 🔵 **New, worth a look but NOT yet a conclusion: `/free-resources/` returns an HTML shell with none of its own text in it.** Not one of "Free Color Resources", "Sample Downloads" or any `downloads/` href appears in the served HTML — and that is equally true of copy that predates this week, so it is not a deploy problem. The body is client-rendered after hydration. Tempting to connect this to the 90 days of 0 impressions, and I am deliberately **not** doing so: Google renders JavaScript, so this may cost nothing at all. It is a real difference from the rest of the site and it sits on the page we just made the destination for every free download, which is reason enough to measure it deliberately rather than assume either way.
> (b) 🔴 **Time-sensitive, and already on `human-todo.md`: `id41` renews 2026-10-03.** They pressed yearly, were billed ¥500 monthly, and are roughly ¥3,500 under-billed on a plan they believe they bought. Two decisions, both yours: set the three `NEXT_PUBLIC_PRO_*_CHECKOUT_URL` env vars and redeploy (~15 min, and it re-enables the yearly and lifetime buttons), and whether to email them. **Customer email needs your authorization; this run sent none.**
> (c) The 165 in-content references to "Brand Starter Kit" are **less wrong than yesterday's note said** — the product is real and free at `/downloads/brand-starter-kit.zip`. What is wrong is the destination: most of those pills link to `/pro/` for a thing that needs no account. That reframes the job from a content migration to a link fix, but it is still 165 edits under the `content-links` guard, and still yours to schedule.
>
> **⚠️ Twenty-one roundups, dated 2026-04-05 through today, and not one has been removed** — the file's own first instruction is "Remove entries after posting." Nothing to add to the argument made on Aug 23 and Aug 30, so it is not repeated. **Owner: publish these and delete as you go, or declare the Facebook Page dead and stop this task from drafting them.** This is the first week in seven with real news in it, which makes an unpublished queue more expensive than usual, not less.
>
> **Standing conventions:** this file is **manual-post-only — nothing below has been published**, and this run did **not** post to Facebook. The task file says "if possible," which is not the owner's approval; publishing to a public Page is irreversible, outward-facing, and this run is unattended. It was also not *technically* possible this run — there was no network to any Meta endpoint. Keep the X variant **URL-free**: a link raises X API cost from ~$0.015 to ~$0.20 per post, which is what drained the credits in May.

### Facebook

🎨 **We've been giving away all 5,446 colors for months. Nothing on the site linked to it.**

That's not a figure of speech. We searched the entire application for a link to the download and found **zero**. The file has been sitting at a public URL since April, rebuilt on every single deploy, and the only way to reach it was to guess the address.

So Search Console said exactly what you'd expect: 90 days, **0 impressions, 0 clicks.**

We read that number for months as *"nobody wants this."* It was **"nobody could find this."** Those are very different problems, and we were solving the wrong one.

Fixed. Both downloads are now at the top of **/free-resources/** 👇

📦 **The Complete Archive** — every one of the 5,446 colors, in **fifteen formats**:

CSS Variables · Tailwind v4 · SCSS Maps · JSON · Figma Tokens · Style Dictionary · Adobe ASE · Photoshop ACO · GIMP · Sketch · Framer · SwiftUI · Android XML · Flutter Dart · CSS-in-JS

Not a sample. Not "the first 50." The whole archive, in whichever one your project speaks.

🎁 **The Brand Color Starter Kit** — 3 curated palettes, each with a brand guide, color-psychology notes, and its own SwiftUI / Android / Flutter exports.

**No account. No email. No signup wall.** Two clicks, both free.

—

**Also shipped this week:**

🔄 **/all-colors/ now loads as you scroll.** Keep going and it keeps going. The "Show more" button is still there if you prefer it.

⚡ **Typing got dramatically faster.** Every search box on the site used to quietly re-navigate the page on *every single keystroke* — nine keystrokes, nine round trips. Now it's zero. Seven pages, same fix.

🎨 **/brands/ speaks Tailwind.** Copy any brand's palette as a `theme.extend.colors` block, right next to the CSS one.

🔗 **/seasonal/ and /mixer/ now open into the archive.** They'd been sitting next to 5,446 colors with no door between them.

🌏 **Pick-for-me works in Chinese now** — and stopped answering "coffee shop brand" with six nearly identical near-blacks.

Same 5,446 colors. Considerably easier to actually get at.

### Twitter / X

(URL-free — a link raises the API cost per post from ~$0.015 to ~$0.20.)

All 5,446 of our colors, in 15 formats, free since April.

Nothing on the site linked to it.

90 days of Search Console: 0 impressions, 0 clicks. We read it as "nobody wants this."

It was "nobody could find this."

Now linked on our free resources page. No account, no email.

---

## Weekly Roundup — 2026-08-30

> **No user-facing release this week — 15 commits, Aug 23 to Aug 30, and not one of them adds something a visitor can see.** Counts are byte-identical to the last three posts: colors **5,446**, collections **261**, guides **333**, tools **44** (43 on-site + the Figma plugin). **Zero new colors, tools, collections, or guides.** So this is a spotlight, not a changelog — the sixth in the last eight weeks (Jul 12, Jul 19, Aug 2, Aug 9, Aug 23, and now).
>
> **How the counts were read this run, and the caveat that goes with it.** `copy-counts.test.ts` was **not** run — see the vitest note in owner actions. The numbers come from a direct `esbuild`+`node` probe importing the same four modules the test imports (`src/data/colors`, `src/lib/collections`, `src/lib/guides`, `TOOLS` in `src/components/tools-page.tsx`), so they are read from the data, not from last week's post. They are safe to publish. What is *not* verified this run is the prose-vs-data guard across the site — but this week's diff touched no collection, guide, or tool data, so nothing moved underneath it.
>
> **What the week actually was:** measurement repair (`0fe11dc`, `a406bc6`, `62ba8aa`), Vercel cost (`caf2f96`, `5506e32`), an SEO redirect for the retired `/vs/` route (`879c672`, guarded by `acae07d` after the route came back on its own), repo hygiene (`ffc9e18`, `f7730e4`), and a plan doc (`46e1b27`). Every one of those is either invisible from outside or a confession. Nothing to announce.
>
> **The spotlight is Paint Mix (`/paint-mix/`), and it is in exactly the position Screen Test was in last week:** shipped in the Jul 26 ten-tool batch, given one line inside a list, never mentioned again. Same batch still holds `/css-filter/`, `/color-temperature/`, `/dark-mode-colors/`, `/color-wheel/` and `/duotone/` — one each, for the next few quiet weeks, so future runs do not have to invent news.
>
> **Everything in the post below was executed this run, not read off the source.** The solver was run against real targets through an esbuild probe and the numbers printed are what it returned:
> - Five primaries, exactly as named in the post — Cadmium Red `#d32f2f`, Cadmium Yellow `#f9d71c`, Ultramarine Blue `#2b4a9b`, Titanium White `#f8f8f4`, Ivory Black `#221f1e` (`src/lib/paint-mix.ts:22`). Recipes are 2–3 primaries, ≤ 8 total parts, deterministic exhaustive search (`:70`), default 3 results (`:74`), and the page calls it with that default (`src/components/paint-mix-page.tsx:20`).
> - **The gold recipe is real.** Target `#c9a227` → **1 part Cadmium Red + 6 Cadmium Yellow + 1 Ultramarine Blue**, predicted `#c79e26`, ΔE 1.29. The page renders ΔE with `toFixed(1)`, so the post says **1.3** — write the number the user will actually see.
> - **The blue+yellow contrast is real.** Naive sRGB average of `#2b4a9b` and `#f9d71c` is `#92915c`, a muddy khaki. The subtractive model returns `#6c8046` at 1:1 and `#909835` at 1:2 — both genuinely green. This is the whole post in two numbers.
> - **The honest-failure line is real, and load-bearing.** `#4b7f52` comes back at ΔE 6.3 — visibly off — and the page already says so in its own copy, including that saturated cyans/magentas are outside this paint set's gamut and a high ΔE means change paints, not ratios (`paint-mix-page.tsx:105`, `:113`). Keep that paragraph in the post. It is the reason the rest is believable.
> - **No paywall** — zero `ProGate`/`isPro` hits in `paint-mix-page.tsx`, so "free, no signup" is safe. (Contrast `/wcag-audit/`, which *does* gate its report download at `:249` — do not spotlight that one as free.)
> - `/paint-mix/` returns **200 on colorarchive.org** and the live HTML contains "Cadmium Red", "Ultramarine", "Titanium White", "Ivory Black", "Kubelka-Munk" and "starting points" — checked this run.
>
> **Deliberately excluded, do not add:**
> 1. **`/20040303/` is private and personal.** Standing exclusion, repeated every week on purpose so no future run reading only `git log` mistakes it for a launch. `noindex`, unlinked, never in a public post, newsletter, sitemap or social copy.
> 2. **Do NOT say the copy button was fixed.** `src/lib/clipboard.ts` is the most tempting thing in this week's diff to misread — it is a new shared clipboard module with a failure counter, and its own header states in full that it **deliberately does not add a `document.execCommand` fallback**, because repairing the failure would destroy the measurement being taken. Copy still fails in the same in-app browsers it failed in last week; we can now *count* it. "We fixed copying" would be false. Re-read that header before writing anything about clipboards.
> 3. **The analytics corrections (`0fe11dc`, `a406bc6`, `62ba8aa`).** Three fixes to one bug shape: `color_copied` covered 2 of ~55 copy points, events fired only on the success path, and `word_generated`'s `depth` counted keystrokes instead of lookups. All real, all fixed. All of it is "our own numbers were wrong," addressed to an audience that never saw the numbers.
> 4. **The `/vs/` retirement (`caf2f96`, `5506e32`, `879c672`).** 3,000+ comparison pages nobody requested were costing build minutes; they now 308 to the color's own page (verified live this run: `/colors/amber-pearl-muted/vs/cobalt-shadow-vivid/` → `308` → `/colors/amber-pearl-muted/`, target `200`). Correct work, but the announcement is "we deleted several thousand pages," which invites the question of why they existed. The feature survives at `/compare/` — already spotlighted Aug 2, so it is not this week's post either.
> 5. The conflict-copy purge, the scheduled-task scratch cleanup, and the plan draft. Internal.
>
> **⚠️ Still unanswered, third week running: this file now holds 20 roundups dated 2026-04-05 through today, and not one has been removed** — the file's own first instruction is "Remove entries after posting." Nothing new to add to the Aug 23 argument, so it is not repeated here. **Owner: either publish these and delete them as you go, or say the Facebook Page is dead and this task should stop drafting them.** A twentieth unpublished post is not a distribution channel.
>
> **Owner actions:**
> (a) **New, and it blocks CI-style verification locally: `vitest` will not start on this machine.** `npx vitest run` on a single 53-line test file hangs indefinitely — killed at 9 minutes, retried non-parallel, retried after `rm -rf node_modules/.vite` — printing the `RUN v4.1.0` banner and then never loading a test file. It emits `DEP0205 module.register() is deprecated` from Vite's module runner first. Local Node is **v26.3.0** against `vitest ^4.1.0`; a Node this new is the first thing I would check, but this run did not confirm the cause and did not change any dependency. Consequence for now: **no roundup can run the repo's guards**, including `copy-counts.test.ts`, so count claims fall back to the probe described above.
> (b) 🔴 **TIME-SENSITIVE, found this run while checking whether an old item was still open — it isn't, it's a different and worse one. The Aug 27 report-script deployment did not survive the Azure migration, and production cron is running the pre-Aug-27 scripts right now.**
> `human-todo.md` records the two report scripts as scp'd to the droplet and verified against the real DB on Aug 27, with backups at `scripts/*.cjs.bak-20260827`. The backend moved to Azure `172.207.80.109` on Aug 29 (PM2 `colorarchive-server`, `script path /root/ColorArchive/server/index.js`, up 12h). On that host: **no `.bak-20260827` files exist**, both scripts are dated **Aug 24**, and the line counts are **496 / 310** against the repo's post-`a406bc6` **599 / 335**. So the Aug 27 work went to a host that is now stopped, and the new host came up from a pre-fix copy.
> Both crons are live there — `0 8 * * *` `conversion-digest.cjs` and `0 9 * * 1` `gate-report.cjs`. As of this run (Sun 2026-08-30 02:04 UTC) that means the **daily digest fires in ~6 hours and the weekly gate report Monday Aug 31 09:00 UTC, both from the old scripts.** The Aug 23 lockout tripwire *is* present in the host's `conversion-digest.cjs` (5 matches for its markers), so the subscriber alarm still works — it is the Aug 27 reporting fix that is missing.
> **Not deployed by this run, deliberately.** Copying files onto a production host is outward-facing and irreversible-ish, this run is unattended, and this task's remit is a content roundup — finding it is in scope, shipping it is not. It is one `scp` of two files plus a `pm2`-free restartless drop, and it is the owner's to make.
> Also worth a second look while in there: `/root/ColorArchive` is **not a git checkout** (`fatal: not a git repository`), so nothing on that host can be diffed against `main` without a checksum comparison like the one above.
> (c) `public/downloads/` still accumulates untracked duplicate build artifacts (flagged Aug 23). Harmless, still growing, still makes `git status` unreadable.
>
> **Standing conventions:** this file is **manual-post-only — nothing below has been published**, and this run did **not** post to Facebook. The task file says "if possible," which is not the owner's approval; publishing to a public Page is irreversible, outward-facing, and this run is unattended. Keep the X variant **URL-free**: a link raises X API cost from ~$0.015 to ~$0.20 per post, which is what drained the credits in May.

### Facebook

🎨 **Another quiet release week, so here's a tool that has only ever gotten one line in a list: Paint Mix.**

You learned this at about six years old, and then a screen unlearned it for you: **blue and yellow make green.**

Try it digitally. Take ultramarine `#2b4a9b`, take cadmium yellow `#f9d71c`, average them the way a screen does, and you get `#92915c` — a muddy khaki. Not green. Nothing like green.

That is not paint being mysterious. It is the two things working in opposite directions. **A screen adds light: every color you stack on makes it brighter.** **Paint takes light away: each pigment absorbs part of the spectrum, so a mix is always darker than what went into it, and yellow plus blue leaves green behind.**

**Paint Mix works the second way.** Give it a color you're chasing and it hands back a recipe in whole parts, from five paints you can actually walk into a shop and buy:

🔴 Cadmium Red
🟡 Cadmium Yellow
🔵 Ultramarine Blue
⚪ Titanium White
⚫ Ivory Black

Two or three of them per recipe, eight parts maximum — something you can measure with a palette knife, not a 24-tube shopping list.

**A real one.** Ask it for that deep mustard gold, `#c9a227`. The answer is **1 part Cadmium Red, 6 parts Cadmium Yellow, 1 part Ultramarine Blue** — and the blue is the part nobody guesses. A whisper of it is what turns bright yellow into *gold* rather than just yellow with the lights dimmed. The predicted mix lands at ΔE 1.3 from the target, which is close enough that most people can't separate the two side by side.

**And when it can't get there, it says so.** Every recipe shows its predicted color next to your target with the gap printed as a number. Greens pulled out of ultramarine come back around ΔE 6 — visibly off, and the tool tells you rather than pretending. Push it toward a saturated cyan or magenta and the number goes higher still, because those are simply outside what five paints can reach. A big number there means *change paints, not ratios.*

We'd rather hand you that than a recipe that quietly doesn't work. This is a subtractive-mixing approximation, not a pigment lab — real tubes vary by brand, medium and how long they've been open — so every recipe is a starting point, not a promise.

Free, runs entirely in your browser, nothing to sign up for.

Mix a color → colorarchive.org/paint-mix/

5,446 colors · 261 collections · 333 guides · 44 free tools

#ColorMixing #ColorTheory #Painting #Acrylic #Watercolor #OilPainting #Gouache #ArtTips #ColorArchive #DesignTools

### X / Twitter (@ColorArxiv — post WITHOUT a URL, see owner note)

A screen adds light. Paint takes it away.

Average ultramarine and cadmium yellow the way a screen does and you get #92915c — a muddy khaki. Mix them the way paint does and you get green.

Paint Mix gives you the recipe in whole parts, and tells you how far off it lands. 🎨

<!-- 274 weighted / 273 codepoints — measured this run (the palette emoji counts double on X, the em dash counts single). Under 280, URL-free per the cost rule. -->

---

## Weekly Roundup — 2026-08-23

> **No user-facing release this week — 17 commits since last week's roundup, Aug 17 to Aug 23, and not one of them adds something a visitor can see.** The counts are byte-identical to last week's post: colors **5,446**, collections **261**, guides **333**, tools **44** (read from `TOOL_COUNT` + `collections` + `landingGuides` + `colors` this run, `copy-counts.test.ts` 3/3 green). **Zero new colors, tools, collections, or guides.** So this is a spotlight, not a changelog — same call as Jul 12, Jul 19, Aug 2 and Aug 9.
>
> **What the week actually was:** billing and entitlement repair (`0b3a8ad`, `cf2abb7`, `2fa8773`), reporting corrections (`fbb0bc1`), a newsletter backlog that had been scheduling itself to publish through 2033 (`b066c39`), and four drafts of a next-phase plan that ended with the owner choosing to stop investing in the paid surface (`e9ee654`). Real work, all of it invisible from the outside, and most of it is a confession rather than news.
>
> **The spotlight is Screen Test, and it was verified in code and on the live site this run.** Everything claimed below exists: the guided run is six stages in this order — black level → white saturation → uniformity → gamma → gradients → archive color pairs (`src/components/screen-test/wizard.tsx:355-430`), and it ends with a 1200×630 report card drawn on a canvas and downloadable as PNG (`:229`), with the result encoded into the URL hash so it can be shared (`:219`). Eleven individual tests exist beside it: dead pixel (**9** fullscreen colors), color screens (**12** presets), black level (**9** near-black steps), white saturation (**7** near-white steps), uniformity (**3** gray fields), gamma (**5** patches), banding (**4** channels), sharpness, color distance, burn-in, touch. **The archive-pairs stage genuinely resolves to 8 real color pairs** — printed and checked this run, no invented ids: Crimson/Amber/Chartreuse/Emerald/Teal/Azure/Indigo/Magenta, each pair sharing a hue root and lightness band and one chroma step apart (`src/lib/screen-test.ts:189`). `/screen-test/`, `/screen-test/dead-pixel/` and `/screen-test/color-screens/` all return **200 on colorarchive.org**, and the live HTML contains the exact strings the post relies on. **No paywall on any screen-test surface** — grepped for `ProGate`/`isPro`, zero hits — so "free, no signup" is safe to publish.
>
> **Why Screen Test:** the Jul 26 post buried it in a ten-tool list and its own owner note said it was "worth a second post later in the week spotlighting Screen Test on its own." That second post never happened. This is it, four weeks late.
>
> **Deliberately excluded, do not add:**
> 1. **`/20040303/` (`cb7af88`) is private and personal.** It appears in this week's log as a `feat()`, which is exactly how a future run reading only `git log` would mistake it for a launch. It is `noindex`, unlinked, and must never appear in a public post, newsletter, sitemap, or social copy. Standing exclusion, repeated from last week on purpose.
> 2. **The Pro entitlement defects (`0b3a8ad`, `2fa8773`).** Cancelling a subscription took back time the customer had already paid for; the word-to-color paywall armed itself against Pro subscribers on a slow connection; and three download paths burned a "colorarchive.org" watermark into files belonging to Pro users during the first moment of a page load — a thing that cannot be undone after they have already sent the file to a client. All fixed and guarded. All of it is a paid-product confession aimed at an audience that overwhelmingly did not buy, and the affected population is approximately **one person**. Public Page post is the wrong channel; direct contact is the right one.
> 3. **The refund-policy unification (`cf2abb7`).** `/support` advertised a 7-day guarantee while `/commerce-disclosure` — the 特定商取引法 notice, the legally operative one — called digital goods non-refundable. Now unified on the guarantee, in both languages, derived from one constant and locked by a test. Genuinely buyer-favourable and worth having in writing, but "we now honour the refund we were advertising" invites scrutiny of what happened before, for the benefit of a buyer population of one. It belongs on `/pro/` and `/support` — where it already is — not on Facebook.
> 4. **The `WordIntentProbe` on `/word-to-color/` (`fbb0bc1`).** It is user-visible, so it will look like a feature to a future run. It is not: it is a one-tap research question shown under a result. Do not announce it. If the owner wants responses, a direct ask is its own post with its own audience, not a line buried in a tool spotlight — and note that this page **already ran an on-page research ask that failed** (the B4 banner: 3,857 impressions, ~0 responses, off since Jul 24), so a near-zero rate here is a repeat of a known result, not a new finding.
> 5. The 292 self-publishing newsletter issues, the analytics exclusion-list refactor, the order-attribution corrections, and the four plan drafts. All internal.
>
> **⚠️ The thing this task should stop ignoring: 18 weekly roundups are sitting in this file, dated 2026-04-05 through 2026-08-16, and not one has been removed.** The file's own instruction at the top is "Remove entries after posting." Either nothing has been posted in nearly five months, or entries are being posted and never cleared — and the two are indistinguishable from here, which is itself the problem. Every one of these posts was drafted, verified, and queued into a channel with no measured reach. That lines up with the `e9ee654` blind spot nobody in five reviews raised: traffic is ~500 sessions/month and **distribution has never actually been run**. Drafting a nineteenth post is cheap; it is not evidence of a distribution channel. **Owner: either publish these and delete them as you go, or say the Facebook Page is dead and this task should stop generating them.**
>
> **Owner actions (the two from Aug 22 are still open, not repeated in full here — see `docs/human-todo.md`):** (a) the two report scripts still are not on the droplet, so production cron is still sending the old single-field report; (b) Hayley's letter is still drafted and unsent, gated on the Aug 22 renewal outcome. (c) New, minor: `public/downloads/` has accumulated 22 untracked duplicate build artifacts (`complete-archive 5.zip`, `colorarchive 7.swatches`, …) — harmless, untracked, but they will keep growing and they make `git status` unreadable.
>
> **Standing conventions:** this file is **manual-post-only — nothing below has been published**, and this run did **not** post to Facebook. The task file says "if possible," which is not the owner's approval; publishing to a public Page is irreversible and outward-facing and this run is unattended. Keep the X variant **URL-free**: a link raises X API cost from ~$0.015 to ~$0.20 per post, which is what drained the credits in May.

### Facebook

🖥️ **Quiet release week, so here's the tool we've never given its own post: Screen Test.**

You are reading this on a display you have almost certainly never checked. Most people find out something is wrong with a monitor the same way — a grey smudge that turns out not to be dust, a photo that looked fine on the laptop and came out muddy on the desktop, a "black" background that glows in a dark room.

**Screen Test is a five-minute guided run that checks the things that actually go wrong**, in order:

⬛ **Black level** — a near-black step wedge on pure black. How far down can you still tell the steps apart? This is what "my dark scenes are just mush" looks like as a number.
⬜ **White saturation** — the same thing at the top end, to see whether your highlights are clipping.
💡 **Uniformity** — full black and grey fields to expose backlight bleed, clouding, and tint in the corners.
📐 **Gamma** — striped patterns against solid patches. Whichever patch disappears into its stripes tells you your gamma.
🌈 **Gradients** — a smooth 0→255 ramp. If you see stairs instead of a slope, that's banding.
🎨 **Color separation** — and this is the part no other screen test has.

That last stage pulls **8 pairs of colors straight out of the archive** — same hue family, same lightness, one single step apart in saturation. The subtlest neighbours in a 5,446-color set. Crimson, Amber, Chartreuse, Emerald, Teal, Azure, Indigo, Magenta, spread around the wheel so a weakness in one region has nowhere to hide. Can you see the line where one becomes the other? On a good panel, all eight. On a tired one, you will find out exactly which hues your screen has given up on.

📋 **It ends with a report card you can download** — a real image, drawn in your browser, with your resolution, gamut, HDR status, and every answer you gave. The page URL carries your result too, so you can send it to someone and they can compare their screen against yours.

🔧 **Eleven separate tests if you'd rather skip the tour:** dead pixel (9 fullscreen colors), plain color screens (12 presets — also just useful for cleaning a screen or lighting a room), sharpness and scaling, burn-in and image retention, and a multi-touch canvas for finding dead zones on a touchscreen.

**Two honest notes,** because the tool says them too: this is a visual check, not calibration — real calibration needs a colorimeter, and nothing in a browser can replace one. And everything runs locally. Your answers are drawn onto a card on your own machine; nothing about your screen is uploaded anywhere.

Free, no signup, no account. It even warns you if your OS has a forced-colors or high-contrast mode switched on, because that quietly rewrites the page and makes every result meaningless.

Test your screen → colorarchive.org/screen-test

Just want a white screen right now → colorarchive.org/screen-test/color-screens

5,446 colors · 261 collections · 333 guides · 44 free tools

#ScreenTest #DeadPixel #MonitorCalibration #ColorArchive #DisplayTest #ColorAccuracy #DesignTools #UIDesign #Photography #WebDev

### X / Twitter (@ColorArxiv — post WITHOUT a URL, see owner note)

Your monitor has a black level, a gamma curve, and probably a stuck pixel you've never looked for.

Screen Test runs six checks in five minutes and hands you a report card.

The last one: 8 archive colors, one saturation step apart. Can you see all eight? 🖥️

<!-- 260 chars weighted (258 codepoints, the monitor emoji counts double on X) — verified this run, URL-free per the cost rule. -->

---

## Weekly Roundup — 2026-08-16

> **First real changelog since Jul 26 — after three spotlight weeks, this one has user-facing things in it.** 11 commits, Aug 9 to Aug 16. Not a big release, but not a repair-only week either: dark mode reached the last two surfaces that lacked it, ten fully-written collections that resolved to no URL now have pages (**251 → 261**), and guide detail pages now lead with the tool the guide is about.
>
> **Every number and claim below was verified against the code and the live site this run**, not from the commit messages: colors **5,446**, collections **261**, guides **333**, tools **44** (`copy-counts.test.ts` + `dark-mode-classes.test.ts` 5/5 green). All ten new collection URLs return **200 on colorarchive.org** — checked individually, so the list in the post is safe to publish as written. The dark-mode work is `65714a8` (74 hover elements, edited one at a time by exact string with expected match counts — no regex, after a regex sweep broke this twice) and `5e09c40` (`/guides/` and `/word-to-color/[word]/`). The guide CTA is `e401e0f`, `src/components/guide-detail-page.tsx:208`.
>
> **Why the Design Notes signup vanished from guide pages, in case anyone asks:** the 14-day read came back 0 subscribers out of 292 sessions with the form continuously in view — under 1.0% at 95% confidence by rule of three. The slot now carries the guide's own tool links instead, since the same window produced 19 tool clicks against those 0 subscribes. Nothing was deleted; the weekly drafting routine is paused and W31 stays approved and unsent. **Not in the public post** — an audience does not need to hear that its own non-response killed a feature.
>
> **Deliberately excluded, do not add:**
> 1. **`/20040303/` (`bf331d8`) is private and personal.** It is `noindex`, it is not linked from anywhere, and it must never appear in a public post, a newsletter, a sitemap entry, or any social copy. Flagging it here only so no future roundup reads the commit log and treats it as a launch.
> 2. **The Complete Archive bundle defect (`0b89daf`, `d19fd68`).** Four flagship exports in the ¥2,499 bundle held 5,376 colors — every one of the 70 neutral greys was missing — and four shipped a literal `${ARCHIVE_SIZE}` in their header comment. Both are fixed and now guarded by `assertBundleIntegrity()` before the zip is written (verified by reproducing both real defects against the guard). This is a paid-product confession, and the right channel is a direct re-download note to whoever bought it, **not** a public Page post. → **Owner action below.**
> 3. The guide `<title>` rework (327 over the SERP cut → 12, 0 duplicates), the site-wide copy-count sweep, and the off-repo count audit. All plumbing.
>
> **Owner actions:** (a) Check whether any Complete Archive orders exist in the prod DB. If any do, email those customers that the bundle was regenerated and ask them to re-download — they are holding a file with 70 colors missing from four of its exports. If there are none, nothing to do. (b) `docs/human-todo.md` still lists off-repo surfaces quoting the old counts (`e28ae02`) — those are outside every test and need the manual sweep.
>
> **Standing conventions:** this file is **manual-post-only — nothing below has been published**, and this run did not post to Facebook (publishing to a public Page unattended isn't the agent's call). Keep the X variant **URL-free**: a link raises X API cost from ~$0.015 to ~$0.20 per post, which is what drained the credits in May.

### Facebook

🎨 **This week: dark mode is finally finished, and ten palettes that were written but unreachable now have pages.**

🌙 **Dark mode now covers the whole site.** Two surfaces had been holding out — the guides index and the word-to-color result pages — which happen to be two of the busiest pages we have. A bad pair to leave glowing white at midnight. Both are done.

We also went through the site hover state by hover state. **74 elements** had a hover style that snapped back to its light-mode color when you pointed at it — a button that reads fine until you reach for it, then flashes. Each one was fixed individually rather than swept with a find-and-replace, because a find-and-replace is exactly what broke this on the two previous attempts.

🖌️ **Ten new collections — 251 → 261.** An honest story: these were fully written, palettes and editorial notes and all, and then rendered nowhere. Each was sharing an id with another collection, and the lookup returns the first match, so ten finished collections quietly lived at no URL. They each have their own page now:

• **Shinrin-yoku** — forest bathing: moss, earth, canopy-filtered light
• **Abyssal Bioluminescence** — abyssal navy with a bioluminescent aqua
• **Midnight Botanicals** — forest green, midnight plum, lantern gold
• **Aged Copper & Bronze** — warm copper against oxidised jade
• **Desert Last Light** — mauve mesa shadow, amber last light, cooling violet
• **Nordic Ice Light** — ice-pale blue over bone white
• **Marine Depth** — navy and teal-black
• **Golden Hour Amber** — amber, honey, ember
• **Magic Hour** — rose gold, coral, peach
• **Autumn Russet & Gold** — deep amber, russet, harvest gold

🔧 **Guides now lead with the tool.** If a guide is about contrast ratios, the contrast checker is right there in the article, not only in a sidebar that disappears on anything narrower than a wide desktop. Read the idea, then go do it.

Browse all 261 collections → colorarchive.org/collections

Start with the forest → colorarchive.org/collections/shinrin-yoku

5,446 colors · 261 collections · 333 guides · 44 free tools

#ColorArchive #ColorPalette #DarkMode #Accessibility #WebDev #UIDesign #DesignTools #ColorTheory #DesignSystems #Frontend

### X / Twitter (@ColorArxiv — post WITHOUT a URL, see owner note)

Dark mode is finished on ColorArchive. The guides index and word-to-color pages were the last holdouts — plus 74 hover states that flashed back to a light color when you pointed at them.

Ten collections that shared an id, so they lived at no URL, now have pages. 251 → 261. 🎨

<!-- 276 chars, verified — fits the 280 limit with the em dash and arrow counted as single characters. -->


---

## Weekly Roundup — 2026-08-09

> **No user-facing release this week either — 8 commits, Aug 2 to Aug 9, and every one was a repair.** The bulk of it was a 12-agent quality audit and the three fix batches it produced (`923d4b6` high, `f8cc6a3` medium, `f0bdec2` low, `92a68fa` redirects), plus the Design Notes decision cron. **Zero new colors, tools, collections, or guides.** So this is a spotlight, not a changelog — same call as Jul 12 and Jul 19.
>
> **Correct the numbers we've been publishing.** This week's audit found three surfaces claiming 25, 25 and 23+ tools while the array actually held **44**, and `llms.txt` claiming 360+ guides against a real **333**. We were understating the tools and overstating the guides at the same time. Both are now interpolated from the data and locked by a test (`src/lib/__tests__/content-links.test.ts:218`, 10/10 green this run), so they can't drift again. **Publish 44 tools and 333 guides.** Note the Jul 26 post went out saying "43 free tools" — slightly under, not worth a correction post, but don't repeat it.
>
> **The spotlight is verified in code this run.** Tailwind Color Finder (`src/components/tailwind-colors-page.tsx`) genuinely does all of what's claimed below: hex → top-5 nearest Tailwind classes ranked by CIEDE2000 ΔE with a plain-language read of each gap (`:17`, `:120`), copy chips for `bg-`/`text-`/`border-`/hex, the full v4 palette browsable by family, and every Tailwind color cross-named with its nearest archive color linking into `/colors/<id>/` (`:56`, `:186`). The palette data is **generated from the installed `tailwindcss/theme.css` OKLCH definitions, not hand-typed** (`src/lib/tailwind-colors.ts:1`) — 22 families × 11 shades plus black and white. It's been mentioned exactly once in this queue, buried in the Jul 26 ten-tool list, so it's fresh.
>
> **Owner notes:** (a) The repair work is deliberately *not* the public post — "we fixed 137 dead links" is a confession, not news, and it'd be the second self-correction post in a row after last week's privacy item. The one repair worth a public line is the redirect batch, since it serves anyone holding an old bookmark; it's the last line of the FB post. (b) Per repo convention this file is **manual-post-only — nothing below has been published**, and this run did not post to Facebook (see the run summary). (c) Keep the X variant **URL-free**: a link raises X API cost from ~$0.015 to ~$0.20 per post, which is what drained the credits in May. (d) Design Notes decision mail fires **2026-08-10** via `server/scripts/design-notes-decision.cjs` — unrelated to this post, but it lands the day after.

### Facebook

🎨 **A quiet release week, so here's a tool that deserves more attention than it gets: the Tailwind Color Finder.**

If you build with Tailwind, you know the problem. A brand hands you `#1E90FF`. Tailwind has no `#1E90FF`. So you squint at the palette, pick something that looks close, and move on — or you give up and hardcode an arbitrary hex that breaks every dark-mode and hover utility you'd otherwise get for free.

**Paste the hex. Get the five nearest Tailwind classes, ranked.**

🔬 **Ranked by CIEDE2000, not by eyeballing it.** That's the perceptual color-difference standard — it weights lightness, chroma and hue separately instead of measuring raw distance in a color space that isn't perceptually uniform. "Closest" means closest *to your eye*.

📏 **Each match tells you how close it actually is.** Not just a ΔE number, but what that number means in practice — whether the swap is invisible, visible only side by side, or a genuinely different color. That's the difference between "close enough to ship" and "your designer will notice."

📋 **Copy the utility, not the hex.** One tap for `bg-sky-500`, `text-sky-500`, `border-sky-500`, or the raw hex if you need it.

🎛️ **Or browse the whole v4 palette.** All 22 families, every shade, clickable. Useful when you're picking rather than matching.

🔗 **And every Tailwind color is cross-named with its nearest archive color** — so `sky-500` isn't just a class, it's a doorway into the 5,446-color archive and all of that color's tonal, analogous and complementary relatives.

One detail we're a little proud of: the palette isn't a hand-copied list that goes stale the next time Tailwind ships a release. It's generated straight from the installed Tailwind v4 OKLCH definitions.

Match a hex to Tailwind → colorarchive.org/tailwind-colors

Browse all 44 free tools → colorarchive.org/tools

*Housekeeping: if you've got an old bookmark or an old link of ours that starts with `/tools/`, it now lands where it should instead of on a 404. Sorry it took us this long.*

#ColorArchive #Tailwind #TailwindCSS #WebDev #DesignTools #CSS #Frontend #UIDesign #ColorTheory #DesignSystems

### X / Twitter (@ColorArxiv — post WITHOUT a URL, see owner note)

Quiet release week, so — an underused one:

Brand gives you #1E90FF. Tailwind has no #1E90FF.

Paste the hex, get the 5 nearest Tailwind classes, ranked by CIEDE2000 ΔE, each with a read on whether the swap is actually visible.

Copy `bg-*` / `text-*` and move on. 🎨

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
