"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShareLinkButton, ShareOnXButton } from "@/src/components/share-link-button";
import { CopyButton } from "@/src/components/copy-button";
import { generateColorFromWord } from "@/src/lib/word-color";
import { recordLookup } from "@/src/lib/word-lookup-depth";
import { wordToColorFaq } from "@/src/lib/word-color-faq";
import { wordToColorSeeds, slugifyWord, titleCaseWord } from "@/src/lib/word-to-color-seeds";
import { WordColorShareCard } from "@/src/components/word-color-share-card";
import { CotdSubscribeForm } from "@/src/components/cotd-subscribe-form";
import { WordIntentProbe } from "@/src/components/word-intent-probe";
import { track } from "@/src/lib/track";
import { useAuth } from "@/src/components/auth-provider";
import { isEntitlementResolved } from "@/src/lib/pro-gate-policy";
// The gate quotes a price, so it takes it from the thing that charges it.
// price-copy.test.ts exists because prices were retyped by hand in six places
// and went stale silently ("$4.99/month" ×3 in server/email.js against $3.49).
// Importing is the only version of this that cannot drift.
import { proSubscriptionConfig } from "@/src/lib/checkout-config";

const PROMPT_SUGGESTIONS = [
  "ocean memory",
  "quiet luxury",
  "midnight jazz",
  "soft archive",
  "electric plum",
] as const;

// The word shown on first paint and in the prerendered HTML. Also the "landing
// word", which the paywall always leaves free.
const DEFAULT_WORD = "quiet luxury";

// A diverse spread of ~60 word pages for the index hub — links the static
// /word-to-color/[word]/ pages from the highest-traffic page in one hop.
const BROWSE_WORDS = wordToColorSeeds.filter(
  (_, i) => i % Math.ceil(wordToColorSeeds.length / 60) === 0,
);

// --- Willingness-to-pay probe: free-preview limit on the interactive generator ---
// After FREE_GENERATIONS distinct user-initiated word lookups in this browser, words
// OTHER than the one the visitor landed on gate behind a Pro upsell with an email-unlock
// escape hatch. This is a WTP experiment on the #1 traffic page, NOT DRM. Design rules
// that keep it SEO- and share-safe:
//   • The word the visitor landed on (initial ?q= / default) is ALWAYS viewable and is
//     never counted — so deep links, social shares (the page's growth loop), and crawlers
//     always render the result they came for, even for a returning, already-gated visitor.
//   • Only NEW words typed after landing count, against a persisted distinct-word set, so
//     "5 free palettes" stays honest across reloads (retyping a counted word is free).
//   • An email unlock lifts the gate permanently for that browser, turning the wall into
//     lead capture so casual traffic isn't simply lost; the Pro click is the paid-intent
//     signal we actually measure.
//   • Flip WORD_PAYWALL_ENABLED to false to remove the gate instantly (the static [word]
//     pages don't use this component, so they're unaffected regardless).
const WORD_PAYWALL_ENABLED = true;
const FREE_GENERATIONS = 5;
const GEN_WORDS_KEY = "colorarchive-word-gen-words";
const UNLOCK_KEY = "colorarchive-word-unlocked";
// Per-TAB, so a reload cannot re-nominate the gated word as the free one.
const LANDING_WORD_KEY = "colorarchive-word-landing";
// The last ?q= this component wrote itself. Lets a reload of our own rewrite be
// told apart from an arrival on someone else's link.
const LAST_WRITTEN_KEY = "colorarchive-word-last-written";

// Event names live in one place so a typo can't silently split a funnel. All fan out
// through track() to both the first-party /events table and PostHog under these names.
const PAYWALL_EVENT = {
  hit: "word_paywall_hit", // first-ever crossing of the free limit this browser
  restored: "word_paywall_restored", // returning visitor re-gated on load (funnel denominator)
  proClick: "word_paywall_pro_click", // clicked the in-gate Pro CTA (paid intent)
  emailUnlock: "word_paywall_email_unlock", // unlocked by subscribing (lead)
  proBypass: "word_paywall_pro_bypass", // gate opened because the account is Pro
  // One event per NEW word, carrying `counted` (did it spend free quota),
  // `depth` (words this visit, uncapped) and — only when counted — its quota
  // ordinal `count` (1..FREE_GENERATIONS). The ordinal is the missing
  // denominator behind "only 3.3% of views hit the wall": the drop-off between
  // 1 and 5 tells us whether five free lookups is generous or simply more than
  // anyone wants. `counted:false` rows were added 2026-08-27 and are NOT part of
  // that curve — see the block at the emit site for why they exist and how to
  // filter them back out.
  //
  // NOT THE ONLY EMITTER since 2026-08-31. src/components/guide-word-card.tsx
  // emits the same event from inside guide articles (W1). Every row now carries
  // `surface` — "word_tool" here, "guide_card" there — so anything reading this
  // event as a measure of THIS page must filter on it, defaulting an absent key
  // to "word_tool". server/scripts/gate-report.cjs does exactly that.
  generated: "word_generated",
  // Click on one of the next-step links offered right after a hex is copied.
  // Fires on a CLICK — never on load — so it is outside the W1 §0.1 ban on
  // page-load events. Carries `target` (tokens | contrast | tints).
  nextStep: "word_next_step_click",
} as const;

const normalizeWord = (w: string) => w.trim().toLowerCase();

// The persisted set of distinct words already counted against the free limit (the seed
// word the visitor landed on is excluded — it's free). Count = its length.
function readCountedWords(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(GEN_WORDS_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function isUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

// --- Interview/feedback recruitment banner (B4) -------------------------------
// A small, dismissible strip on the #1 traffic page that routes engaged visitors to
// the 2-min survey (which itself funnels to interviews via its "open to a call?" Q).
// Rendered only after mount (no SSR/first-paint output → no hydration mismatch, no flash
// for people who already dismissed it). Flip RECRUIT_BANNER_ENABLED to remove instantly.
//
// OFF since 2026-07-24. Measured over 30 days: 3,857 impressions on our single
// best-trafficked surface, against ~0 survey responses and 1 email captured
// site-wide. Cold search traffic will not do research homework for us — that is
// what the (opt-in) email list is for, and asking there costs us no attention on
// the page itself. The banner slot stays reclaimed rather than refilled: this
// page already carries two subscribe forms (the paywall unlock and the one lower
// down), so a third ask would be noise, not capture.
const RECRUIT_BANNER_ENABLED = false;

const RECRUIT_SURVEY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf5dTPy9ccPgXdKx2SOf7ICKu5AHucxkm3VoWzBfaZXEZOm2Q/viewform";
const RECRUIT_DISMISS_KEY = "colorarchive-recruit-banner-dismissed";

export function WordColorGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  // ?q= is read AFTER mount, from window.location, and deliberately not through
  // useSearchParams().
  //
  // useSearchParams() opts the nearest Suspense boundary out of static
  // prerendering, and the boundary in app/word-to-color/page.tsx wraps this whole
  // component — so the prerendered HTML for the site's single highest-traffic
  // surface was nothing but the string "Loading generator…". Measured on the live
  // page (x-vercel-cache: HIT, ~6.6 days old, i.e. what everyone actually got):
  // zero <h1>, zero of the 60 BROWSE_WORDS links this page exists to emit in one
  // hop, and none of the FAQ answer text — while page.tsx still shipped FAQPage
  // JSON-LD describing answers that appeared nowhere in the document.
  //
  // Reading the query during render instead would hydration-mismatch (the server
  // prerenders the default word, a client on ?q=cat would render "cat"), so the
  // swap has to happen in an effect. First paint shows DEFAULT_WORD, then the
  // effect below applies ?q= if present.
  const [input, setInput] = useState(DEFAULT_WORD);
  // Latches once the ?q= handoff is done. The URL-rewrite effect must not fire
  // before it: that effect runs on mount with the default word still in state and
  // would router.replace() the visitor's own ?q= away before it had been read.
  const [queryApplied, setQueryApplied] = useState(false);
  const [wordHistory, setWordHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("colorarchive-word-history") || "[]"); } catch { return []; }
  });
  // WTP gate. Starts closed on the server + first client paint (so SSR output and shared
  // links always show content); a mount effect arms it for returning visitors who already
  // spent their free lookups. The word the visitor landed on is captured ONCE (the route
  // rewrites ?q= as the user types, so we can't recompute it) and is always free + viewable.
  const [gated, setGated] = useState(false);
  // The hex the visitor just copied, or null. Set only from CopyButton's
  // onCopied (a confirmed write), cleared whenever the generated colour changes,
  // so the card can never describe a colour other than the one on screen.
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  // Pro accounts pass the gate, period. This was THE bug that locked out our
  // first real subscriber (2026-07-20): the gate only knew the localStorage
  // email-unlock flag and never consulted the account tier, so a logged-in
  // paying Pro user was re-gated forever ("Unlock with Pro" that Pro couldn't
  // unlock).
  //
  // 2026-08-19: the fix for that bug had a second edition of the same mistake.
  // This page ran its OWN `fetchSession()` raced against a 4s timeout, and both
  // the timeout and the catch fell back to "not pro" — so a Pro subscriber on a
  // slow connection, or any Pro subscriber while the API was unreachable, got
  // the paywall armed against them anyway. It was written deliberately ("a hung
  // session fetch must fall back to 'not pro' so the gate can arm"), and it is
  // the wrong direction: this is the busiest paid surface on the site.
  //
  // Now it reads the one shared session and keeps three states. null = we do
  // not know yet, and every gating effect below refuses to arm on null.
  const { tier, status, sessionError } = useAuth();
  const proUser: boolean | null = isEntitlementResolved({ status, sessionError })
    ? tier === "pro"
    : null;
  const proBypassLoggedRef = useRef(false);
  const [showRecruit, setShowRecruit] = useState(false);
  const landingWordRef = useRef(normalizeWord(DEFAULT_WORD));
  const countedWordsRef = useRef<Set<string> | null>(null);
  // Words this mount committed, so prefix-refunding can be scoped to the burst
  // that produced the fragments rather than to all of history.
  const committedThisMountRef = useRef<Set<string>>(new Set());
  // Words this mount has already emitted `word_generated` for, whatever the
  // entitlement. `committedThisMountRef` above cannot do this job: it is only
  // populated on the quota-spending path, so it is blind to exactly the people
  // this ref exists to de-duplicate. It also absorbs a re-run that is otherwise
  // invisible — the effect below depends on `gated`, so crossing the limit
  // re-schedules the debounce for the SAME input and would emit it twice.
  const generatedThisMountRef = useRef<Set<string>>(new Set());

  // `depth` must discount the fragments the 2s debounce commits, exactly as the
  // quota refund below does, or it measures typing speed instead of lookups.
  // See src/lib/word-lookup-depth.ts for the rule and what it cost to find.
  const noteGenerated = (word: string) => recordLookup(generatedThisMountRef.current, word);
  const getCountedWords = () => {
    if (!countedWordsRef.current) {
      // Seed with the persisted counted words + the landing word, so the landed-on word
      // is never counted and already-counted words stay free across reloads.
      countedWordsRef.current = new Set([landingWordRef.current, ...readCountedWords()]);
    }
    return countedWordsRef.current;
  };
  // The word that armed the wall was itself one of the five free lookups — it
  // was counted, so it is paid for. Without this it rendered for the two seconds
  // of debounce and was then replaced by the paywall, which reads as the fifth
  // palette being taken back rather than the sixth being withheld.
  const grantedWordRef = useRef<string | null>(null);
  const currentWord = normalizeWord(input);
  const onLandingWord =
    currentWord === landingWordRef.current || currentWord === grantedWordRef.current;
  const generated = useMemo(() => generateColorFromWord(input), [input]);
  const paletteExport = useMemo(() => {
    if (!generated) {
      return "";
    }

    return generated.variants
      .map((variant) => `${variant.label}: ${variant.hex}`)
      .join("\n");
  }, [generated]);
  const cssVariableExport = useMemo(() => {
    if (!generated) {
      return "";
    }

    return generated.variants
      .map((variant) => {
        const slug = variant.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return `--${generated.tokenSlug}-${slug}: ${variant.hex};`;
      })
      .join("\n");
  }, [generated]);
  const tailwindExport = useMemo(() => {
    if (!generated) return "";
    const token = generated.tokenSlug;
    return `@theme {\n${generated.variants.map((v) => {
      const slug = v.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `  --color-${token}-${slug}: ${v.hex};`;
    }).join("\n")}\n}`;
  }, [generated]);

  // Apply ?q= once, on mount. Declared BEFORE the URL-rewrite effect below so it
  // wins the ordering — effects run in declaration order, and the rewrite would
  // otherwise replace the visitor's own ?q= with the default word.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    const fromUrl = q && q.trim().length > 0 ? q : DEFAULT_WORD;

    // THE LANDING WORD IS PER TAB, NOT PER PAGE LOAD.
    //
    // It used to be re-derived from ?q= on every mount, and the component
    // rewrites ?q= to whatever is in the box as you type. So the moment the wall
    // appeared for word W, the address bar already said ?q=W — and pressing
    // Reload made W the "landing word", which is the one word the paywall never
    // charges for. The wall dismissed itself, for free, with the browser's most
    // obvious button.
    //
    // THE TEST IS NOT "have we been here before", IT IS "did WE write this ?q=".
    //
    // A first attempt simply pinned the landing word to the first value the tab
    // ever saw. That fixed the reload, and broke something worse: arriving at a
    // shared ?q= link in a tab that had already opened the generator left the
    // landing word stuck on the earlier word, so the shared word was treated as a
    // typed lookup — charged against the free limit with no keystroke, and shown
    // the wall outright to anyone already at the limit. Deep links and shares are
    // this page's growth loop; breaking them costs more than the leak did.
    //
    // The two cases are distinguishable, because this component knows which ?q=
    // values it wrote itself. The rewrite effect below records its last write; a
    // ?q= that differs from it came from outside — a share, a chip, an inbound
    // link — and is a genuine new arrival that earns a fresh free word. A ?q= that
    // matches is our own rewrite coming back around, which is exactly the reload
    // case, and there the stored landing word stands.
    let landing = fromUrl;
    try {
      const stored = sessionStorage.getItem(LANDING_WORD_KEY);
      const lastWritten = sessionStorage.getItem(LAST_WRITTEN_KEY);
      // Compare against what WE last wrote, including the empty string — the
      // component writes a bare URL when the box is cleared, so "no ?q=" is a
      // value we can have written, not a signal to skip the check. An earlier
      // `q !== null` guard made every query-less arrival look internal, so
      // clicking the header link to a bare /word-to-color/ left the landing word
      // stuck on the previous one and charged (or walled) the default word.
      const arrivedFromOutside = lastWritten === null || (q ?? "") !== lastWritten;
      if (stored && !arrivedFromOutside) landing = stored;
      else sessionStorage.setItem(LANDING_WORD_KEY, fromUrl);
    } catch {
      // Private mode / storage disabled — fall back to the URL. Degrades to the
      // pre-existing behaviour rather than locking anyone out.
    }

    if (fromUrl !== DEFAULT_WORD) setInput(fromUrl);
    landingWordRef.current = normalizeWord(landing);
    countedWordsRef.current = null;
    setQueryApplied(true);
    // Mount only: ?q= is thereafter owned by this component, not the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!queryApplied) return;
    const trimmed = input.trim();
    const href = trimmed.length > 0 ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname;
    // Record what we wrote, so the mount effect above can tell a reload of our own
    // rewrite apart from a genuine arrival on someone else's link.
    try {
      sessionStorage.setItem(LAST_WRITTEN_KEY, trimmed);
    } catch {
      // Storage disabled — the mount effect falls back to trusting ?q=, which is
      // the pre-existing behaviour.
    }
    router.replace(href, { scroll: false });
  }, [input, pathname, router, queryApplied]);

  // Pro (or any future paid tier) opens the gate immediately — including a gate
  // that was already armed this session. Fires once per mount: `proUser` is
  // derived from context now, so this effect can re-run when the session
  // refreshes and we do not want a duplicate bypass event each time.
  useEffect(() => {
    if (proUser !== true || proBypassLoggedRef.current) return;
    proBypassLoggedRef.current = true;
    setGated(false);
    track(PAYWALL_EVENT.proBypass, {});
  }, [proUser]);

  // On mount, arm the gate for a returning visitor who already spent their free lookups
  // (unless they previously unlocked). They still see their landing word (onLandingWord),
  // but the next NEW word gates. `word_paywall_restored` gives the funnel a denominator for
  // these sessions, since `word_paywall_hit` only fires on the first-ever live crossing.
  // Waits for the session check: never arm for a Pro account (proUser === true skips;
  // while still null we also wait — the pro effect above un-gates if it resolves pro).
  useEffect(() => {
    if (!WORD_PAYWALL_ENABLED || proUser !== false || isUnlocked()) return;
    const n = readCountedWords().length;
    if (n >= FREE_GENERATIONS) {
      setGated(true);
      track(PAYWALL_EVENT.restored, { count: n });
    }
  }, [proUser]);

  // Save word to history after debounce + count it toward the WTP free limit.
  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length < 2) return;
    const timeout = setTimeout(() => {
      // Drop the prefixes this word was typed through.
      //
      // The only thing separating "a word" from "a keystroke" here is a 2s idle
      // pause, and typing is not uniform — anyone who pauses to think mid-word
      // commits a fragment. Typing "midnight jazz" with two natural pauses used
      // to spend THREE of the five free lookups ("midni", "midnight jaz",
      // "midnight jazz") and leave two meaningless chips in Recent. Since a
      // fragment is always a strict prefix of what follows it, superseding
      // prefixes on commit costs nothing and cleans up both.
      const supersedes = (older: string) =>
        older !== trimmed && trimmed.toLowerCase().startsWith(older.toLowerCase());

      setWordHistory((prev) => {
        const next = [trimmed, ...prev.filter((w) => w !== trimmed && !supersedes(w))].slice(0, 10);
        try { localStorage.setItem("colorarchive-word-history", JSON.stringify(next)); } catch {}
        return next;
      });

      const norm = normalizeWord(trimmed);
      // Count only NEW distinct words. The landing word + already-counted words are
      // pre-loaded into the set, so the page the visitor landed on is always free and a
      // retyped word never double-counts across reloads. Pro accounts never gate.
      const spendsQuota = WORD_PAYWALL_ENABLED && proUser === false && !gated && !isUnlocked();

      /* ---- THE §5 ANCHOR FIRES ABOVE THE ENTITLEMENT DECISION (2026-08-27) ----
       *
       * `word_generated` is the utility anchor the whole feature is judged on
       * (server/scripts/gate-report.cjs — "utility ≥300/mo, shrink <150/mo two
       * months running"). Until today it was emitted BELOW the return that
       * `spendsQuota` now expresses, which quietly made it a measure of FREE
       * QUOTA SPENT rather than of the product being used.
       *
       * Measured on production the same day, 30-day window: 699 visits touched
       * /word-to-color and 554 emitted the event. The 145 invisible ones were
       * 64 already-gated returning visitors, 3 email-unlocked browsers, 2 Pro
       * visits, and 71 that only ever emitted `page_read`. The input is not
       * disabled while gated — only the RESULT panel is swapped for the paywall —
       * so those people were typing words the whole time and none of it counted.
       *
       * The bias runs toward KILLING the feature, and it hides precisely the
       * most engaged people (paying, subscribed, or back for a second visit),
       * which is the worst possible direction for a retention decision.
       *
       * This changes no entitlement and no quota — only what gets recorded.
       *
       * `counted` reconstructs the old series EXACTLY, so the anchor keeps a
       * comparable history across the change:
       *     WHERE event_name='word_generated'
       *       AND COALESCE(json_extract(props_json,'$.counted'), 1) = 1
       * Rows written before today carry no `counted` key and were all
       * quota-spending by construction, which is what the COALESCE encodes.
       */
      if (!spendsQuota && !generatedThisMountRef.current.has(norm)) {
        const depth = noteGenerated(norm);
        track(PAYWALL_EVENT.generated, {
          // Which surface produced the lookup. Added 2026-08-31 with W1, which
          // put a second `word_generated` emitter on guide pages
          // (src/components/guide-word-card.tsx). Rows written before that carry
          // no `surface` key and were 100% this page by construction — verified
          // against production, every `word_generated` row in the preceding 30
          // days had path='/word-to-color/'. That is what the COALESCE default in
          // gate-report.cjs encodes, and it is the same argument the `counted`
          // change documents below.
          surface: "word_tool",
          counted: false,
          // Same precedence as the quota test above, so `reason` always names
          // the condition that would actually have returned first.
          reason: !WORD_PAYWALL_ENABLED
            ? "disabled"
            : proUser === true
              ? "pro"
              : proUser === null
                ? "unresolved"
                : gated
                  ? "gated"
                  : "unlocked",
          // Distinct lookups this VISIT, uncapped and net of typing fragments.
          // `count` cannot answer this: it is the persisted quota ordinal, so it
          // stops dead at FREE_GENERATIONS and 149 of 554 visits pile up on
          // exactly 5 with nothing visible after it.
          depth,
        });
      }

      if (!spendsQuota) return;
      const counted = getCountedWords();
      if (counted.has(norm)) return;
      // Refund the fragments: anything already counted that this word was typed
      // through was never a lookup the visitor asked for.
      // Only refund fragments typed in THIS mount. The eviction exists to undo
      // keystrokes the debounce mistook for words; it must not reach back and
      // refund a legitimate lookup from a previous visit just because today's
      // word happens to start with it. Someone who looked up "cat" last week and
      // types "catalog" today has spent two lookups, not one.
      for (const older of [...counted]) {
        if (older === landingWordRef.current) continue;
        if (!committedThisMountRef.current.has(older)) continue;
        if (older !== norm && norm.startsWith(older)) counted.delete(older);
      }
      committedThisMountRef.current.add(norm);
      counted.add(norm);
      const words = readCountedWords().filter(
        // Mirror the landing-word guard above. Without it the persisted array
        // could shed the landing word while the in-memory set kept it, and the
        // two would disagree after the next reload.
        (w) => w === norm || w === landingWordRef.current || !committedThisMountRef.current.has(w) || !norm.startsWith(w),
      );
      if (!words.includes(norm)) words.push(norm);
      try { localStorage.setItem(GEN_WORDS_KEY, JSON.stringify(words)); } catch {}
      // `count` keeps its original meaning untouched — the persisted quota
      // ordinal, 1..FREE_GENERATIONS — because conversion-digest.cjs reads it as
      // the paywall drop-off curve. `counted:true` is what marks this row as
      // belonging to the pre-2026-08-27 series. On this path `depth` should
      // track `count`, since both now refund the same fragments; it only pulls
      // ahead once the gate closes and `count` stops moving.
      track(PAYWALL_EVENT.generated, {
        surface: "word_tool", // see the note at the sibling emit above
        count: words.length,
        counted: true,
        depth: noteGenerated(norm),
      });
      if (words.length >= FREE_GENERATIONS) {
        grantedWordRef.current = norm;
        setGated(true);
        track(PAYWALL_EVENT.hit, { count: words.length });
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [input, gated, proUser]);

  const handleEmailUnlock = () => {
    try { localStorage.setItem(UNLOCK_KEY, "1"); } catch {}
    track(PAYWALL_EVENT.emailUnlock, {});
    // Let the subscribe form's "You're in!" confirmation paint before revealing the
    // result, so the unlock reads as a completed action (and the beacon is sent first).
    setTimeout(() => setGated(false), 1400);
  };

  // Recruitment banner: show only after mount, and only if not previously dismissed.
  useEffect(() => {
    if (!RECRUIT_BANNER_ENABLED) return;
    try {
      if (localStorage.getItem(RECRUIT_DISMISS_KEY) !== "1") {
        setShowRecruit(true);
        // Impression — without it the banner CTR (click/dismiss ÷ impression) is uncomputable.
        track("recruit_banner_impression", {});
      }
    } catch {}
  }, []);

  const dismissRecruit = () => {
    setShowRecruit(false);
    try { localStorage.setItem(RECRUIT_DISMISS_KEY, "1"); } catch {}
    track("recruit_banner_dismiss", {});
  };

  // The landing word is always viewable; the gate only replaces the result once the
  // visitor moves on to a different word while gated. Conditions are written inline as
  // `generated && (...)` so TypeScript narrows `generated` to non-null inside each branch.
  const resultVisible = !gated || onLandingWord;

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {showRecruit && (
          <div className="flex items-start sm:items-center justify-between gap-3 rounded-2xl border border-black/8 bg-neutral-950 px-4 py-2.5 text-xs sm:text-sm text-white">
            <span className="min-w-0">
              <span aria-hidden="true">🎨 </span>
              Did ColorArchive help? Tell us in a 2-min survey —{" "}
              <a
                href={RECRUIT_SURVEY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("recruit_banner_click", {})}
                className="font-semibold underline underline-offset-2 hover:text-neutral-200"
              >
                get a free month of Pro
              </a>
              .
            </span>
            <button
              type="button"
              onClick={dismissRecruit}
              aria-label="Dismiss"
              className="shrink-0 -mr-1 rounded-full p-2 text-lg leading-none text-neutral-400 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 dark:border-white/10 bg-white/74 dark:bg-neutral-900/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 dark:border-white/10 bg-white/85 dark:bg-white/8 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 dark:text-neutral-400 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Deterministic word palette
            </div>

            <h1 className="font-display max-w-3xl text-4xl font-light tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-6xl">
              Turn a word into color
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 dark:text-neutral-300 sm:text-lg">
              Enter any word or phrase. ColorArchive maps it to a repeatable color signature using
              a local deterministic hash, with no API and no backend.
            </p>

            <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
              <div className="rounded-[1.7rem] border border-black/6 dark:border-white/10 bg-white/82 dark:bg-neutral-900/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                    Input
                  </span>
                  <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type a word, phrase, or mood"
                    className="mt-3 w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-base text-neutral-950 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:bg-white/5 dark:text-white dark:border-white/10"
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-2">
                  {PROMPT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
                    >
                      {suggestion}
                    </button>
                  ))}
                  <ShareLinkButton
                    href={
                      input.trim().length > 0
                        ? `/word-to-color?q=${encodeURIComponent(input.trim())}`
                        : "/word-to-color"
                    }
                  />
                  {input.trim().length > 0 && (
                    <ShareOnXButton
                      href={`/word-to-color?q=${encodeURIComponent(input.trim())}`}
                      text={`I turned "${input.trim()}" into a color palette on ColorArchive`}
                    />
                  )}
                </div>
                {wordHistory.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">Recent</span>
                    {wordHistory.filter((w) => w !== input.trim()).slice(0, 6).map((w) => (
                      <button key={w} type="button" onClick={() => setInput(w)} className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white/12">
                        {w}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {generated && resultVisible ? (
                <div className="overflow-hidden rounded-[1.7rem] border border-black/6 dark:border-white/10 bg-white/82 dark:bg-neutral-900/80 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                  <div className="h-52 border-b border-black/6 dark:border-white/10" style={{ backgroundColor: generated.hex }} />
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                          Token
                        </div>
                        <div className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
                          {generated.token}
                        </div>
                      </div>
                      <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
                        {generated.family}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-white/8">
                        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">Hex</div>
                        <div className="mt-1 font-medium text-neutral-950 dark:text-white">{generated.hex}</div>
                      </div>
                      <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-white/8">
                        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">RGB</div>
                        <div className="mt-1 font-medium text-neutral-950 dark:text-white">{generated.rgb}</div>
                      </div>
                      <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-white/8">
                        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">HSL</div>
                        <div className="mt-1 font-medium text-neutral-950 dark:text-white">{generated.hsl}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <CopyButton
                        label="hex"
                        value={generated.hex}
                        onCopied={() => setCopiedHex(generated.hex)}
                      />
                      <CopyButton label="rgb" value={generated.rgb} />
                      <CopyButton label="hsl" value={generated.hsl} />
                      <CopyButton label="palette" value={paletteExport} />
                      <CopyButton label="CSS vars" value={cssVariableExport} />
                      <CopyButton label="Tailwind" value={tailwindExport} />
                      <WordColorShareCard
                        word={input}
                        hex={generated.hex}
                        family={generated.family}
                        variants={generated.variants}
                      />
                    </div>

                    {/* ─── THE OFFER, AT THE MOMENT OF USE (2026-09-03) ────────────
                        Measured over 60 days on this page: 58% of copies are the bare
                        hex; the paid exports are 3.6%. 62% of visitors look up 1–2
                        words and leave; only 18% ever reach the 5-word wall, and by
                        then they already have what they came for — 95% of them walk.

                        So the wall was in the wrong place in the journey. The moment
                        someone TAKES a colour is the moment they are about to use it,
                        and the thing they need next — the full 50–950 scale of that
                        colour as tokens — lives on /tokens/. This routes them there with
                        the hex prefilled. Nothing on this page is newly gated; nothing
                        free is removed; all three links are free tools, so the card reads
                        as help, not a toll.

                        🔴 CORRECTED 2026-09-03, same day it shipped: the first version
                        badged the scale link "Pro". That was wrong — /tokens/ renders all
                        11 steps of all 6 scales free, with a copy button per row. What is
                        Pro on that page is the bulk export in CSS/Tailwind/SCSS/JSON
                        (the ProGate at token-generator-page.tsx ~519). So the scale is
                        the free hook and the export is where the paid ask happens — which
                        is the better order anyway: value first, gate at the moment of
                        taking it in bulk. Labelling a free thing "Pro" would have taught
                        visitors that our badges lie.

                        Shown only after a CONFIRMED copy of the hex, and cleared when
                        the colour changes. Fires no event of its own on render; the
                        click event is the only new one. */}
                    {copiedHex === generated.hex ? (
                      <div className="mt-4 rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-white/8">
                        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                          {`Copied ${generated.hex} — next`}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Link
                            href={`/tokens/?hex=${encodeURIComponent(generated.hex.slice(1))}`}
                            onClick={() => track(PAYWALL_EVENT.nextStep, { target: "tokens" })}
                            className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                          >
                            Full 50–950 scale
                          </Link>
                          <Link
                            href={`/contrast/?fg=${encodeURIComponent(generated.hex.slice(1))}`}
                            onClick={() => track(PAYWALL_EVENT.nextStep, { target: "contrast" })}
                            className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-200 dark:hover:bg-white dark:hover:text-neutral-950"
                          >
                            Check contrast
                          </Link>
                          <Link
                            href={`/tints/?hex=${encodeURIComponent(generated.hex.slice(1))}`}
                            onClick={() => track(PAYWALL_EVENT.nextStep, { target: "tints" })}
                            className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-200 dark:hover:bg-white dark:hover:text-neutral-950"
                          >
                            Tints &amp; shades
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : generated && gated ? (
                <div className="overflow-hidden rounded-[1.7rem] border border-black/6 dark:border-white/10 bg-white/82 dark:bg-neutral-900/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-neutral-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
                    Free preview limit
                  </div>
                  <div className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
                    You&rsquo;ve explored {FREE_GENERATIONS} free word palettes
                  </div>
                  {/* ─── THE WALL NAMES ONLY WHAT PRO ACTUALLY ADDS HERE (2026-09-03) ──
                      This used to read "…and production-ready CSS, Tailwind, and Figma
                      token exports." All three were wrong on this page, in two
                      different ways:

                        · CSS vars and Tailwind are FREE copy buttons ~80 lines above
                          (search `label="CSS vars"`). Selling someone a thing they
                          already have, on the same screen, teaches them the wall lies.
                        · There is no Figma export on /word-to-color/ at all — the only
                          occurrence of the word "figma" in this file was that sentence.

                      What Pro genuinely changes here is exactly one thing: the
                      5-distinct-word limit goes away. So that is all the wall claims
                      now. Note this is NOT expected to raise the click rate — removing
                      a false promise should if anything lower it. The guard is the
                      opposite: 60-day `word_paywall_pro_click` must not COLLAPSE
                      (baseline 9 sessions / 60d; ≤4 counts as a real drop), and zero
                      refunds citing a missing Figma export. */}
                  <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    Keep going with unlimited word&rarr;color lookups. Everything you can
                    already copy here &mdash; hex, RGB, HSL, CSS variables, Tailwind &mdash;
                    stays free.
                  </p>
                  {/* ─── THE PRICE GOES ON THE BUTTON (2026-09-03) ──────────────
                      Measured over 60 days: 297 gate impressions (191 first hits +
                      106 returning re-gates) produced 9 Pro clicks, 4 email
                      unlocks and 1 login. ~95% did nothing at all.

                      The gate previously said "Unlock unlimited with Pro" and named
                      no price anywhere, so deciding meant clicking through to /pro/
                      to find out — a leap the numbers say almost nobody takes. And
                      the price is the strongest argument here, not the weakest:
                      ¥499 / $3.49 a month is impulse-level, and hiding a cheap
                      price makes it read as an expensive one.

                      This is information the visitor needs and did not have. It is
                      not a persuasion tactic and there is nothing to A/B about
                      whether to tell someone what a thing costs. */}
                  <Link
                    href="/pro/"
                    onClick={() => track(PAYWALL_EVENT.proClick, {})}
                    className="mt-5 block w-full rounded-full bg-neutral-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Unlock unlimited &mdash; {proSubscriptionConfig.monthly.price}/month
                  </Link>
                  <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                    about {proSubscriptionConfig.monthly.priceUsd} &middot; cancel anytime
                  </p>
                  <p className="mt-2.5 text-center text-xs text-neutral-500 dark:text-neutral-400">
                    Already Pro?{" "}
                    <Link
                      href="/login/?next=%2Fword-to-color%2F"
                      className="font-medium underline underline-offset-2"
                      onClick={() => track("word_paywall_login_click", {})}
                    >
                      Log in
                    </Link>{" "}
                    and this unlocks automatically.
                  </p>
                  <div className="mt-5 border-t border-black/6 pt-4 dark:border-white/10">
                    {/* The free door earned 4 unlocks in 60 days against 297 gate
                        impressions. It was one line of grey micro-copy under a
                        divider, and "Or keep generating free" reads as a footnote
                        rather than an offer. Same offer, stated as one. */}
                    <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      Not ready to pay? Unlock it free instead.
                    </p>
                    <p className="mb-3 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                      One curated color in your inbox each morning, and your palettes
                      unlock right away.
                    </p>
                    <CotdSubscribeForm
                      source="word-to-color"
                      heading="Email me a color a day (free)"
                      onSuccess={handleEmailUnlock}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* dev-plan-2026-08-22-phase-b §5.2 — first-hand evidence, asked where the
            person already is. Placed AFTER the result so it only ever interrupts
            someone who has already been given something, and shown only once the
            visitor has looked up a word of their own: wordHistory picks up the
            landing word on its own 2s debounce, so length >= 2 is the cheapest
            honest test for "did this person actually use the tool". The widget
            owns all of its own state and touches nothing in the gate above it. */}
        {generated && resultVisible && wordHistory.length >= 2 ? (
          <WordIntentProbe word={input} />
        ) : null}

        {generated && resultVisible ? (
          // [&>*]:min-w-0 — same grid-item min-width:auto trap as the colour
          // detail page. Here it pushed the site's highest-traffic surface 54px
          // wider than a 375px viewport, so the whole page scrolled sideways.
          <section className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
            <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
                    Generated palette
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Five linked colors around the same generated signature.
                  </p>
                </div>
                <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
                  Hue {generated.hue}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {generated.variants.map((variant) => (
                  <div
                    key={variant.label}
                    className="overflow-hidden rounded-[1.4rem] border border-black/6 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900/80"
                  >
                    <div className="h-28 border-b border-black/6 dark:border-white/10" style={{ backgroundColor: variant.hex }} />
                    <div className="p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                        {variant.label}
                      </div>
                      <CopyButton variant="compact" value={variant.hex} label={variant.hex} trackAs="swatch" copiedLabel="Copied ✓" className="mt-2 text-lg font-semibold tracking-[0.02em] text-neutral-950 dark:text-white transition hover:text-neutral-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                  How it works
                </div>
                <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  <p>
                    The input string is normalized and hashed locally in the browser.
                  </p>
                  <p>
                    That hash is mapped into stable hue, saturation, and lightness values.
                  </p>
                  <p>
                    The same word always returns the same color, making it useful as a lightweight
                    visual signature.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                  Find in archive
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  Search the curated ColorArchive for colors nearest to this generated hex.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/colors/hex/?c=${encodeURIComponent(generated.hex.replace('#',''))}`}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
                  >
                    Search by hex
                  </Link>
                  <Link
                    href="/all-colors/"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
                  >
                    Browse archive
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                      Export pack
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                      Copy this generated palette as plain text or CSS variables and drop it into a
                      design doc, prompt, or codebase.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <CopyButton label="palette" value={paletteExport} />
                    <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500 dark:bg-white/8 dark:text-neutral-400">
                      Static
                    </div>
                  </div>
                </div>

                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
                  {paletteExport}
                </pre>
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80">
                <p className="text-lg font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                  Save your word colors
                </p>
                <p className="mt-1 mb-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  Get one curated color in your inbox each morning — and a standing reason to come
                  back. Free, one email a day.
                </p>
                <CotdSubscribeForm
                  colorHex={generated.hex}
                  source="word-to-color"
                  heading="Email me a color every morning"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/pro/"
                    onClick={() => track("word_pro_click", { placement: "lower" })}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
                  >
                    Production-ready tokens with Pro
                  </Link>
                  <Link
                    href="/free-resources/"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
                  >
                    Free resources
                  </Link>
                </div>
              </div>

              {/* Contextual hook: you just generated a palette — will it pass WCAG? */}
            </div>
          </section>
        ) : null}

        <section className="rounded-[1.75rem] border border-black/6 bg-white/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-8 dark:border-white/10 dark:bg-neutral-900/80">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-2xl dark:text-white">
            Word to Color — frequently asked questions
          </h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {wordToColorFaq.map((item) => (
              <div
                key={item.question}
                className="rounded-[1.4rem] border border-black/6 bg-neutral-50/70 p-5 dark:border-white/10 dark:bg-white/8"
              >
                <dt className="text-base font-semibold text-neutral-900 dark:text-white">{item.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-8 dark:border-white/10 dark:bg-neutral-900/80">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            Browse word colors
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Ready-made pages with the exact hex, a 5-shade palette, and the nearest
            named color for popular words.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {BROWSE_WORDS.map((w) => (
              <Link
                key={w}
                href={`/word-to-color/${slugifyWord(w)}/`}
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
              >
                {titleCaseWord(w)}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
