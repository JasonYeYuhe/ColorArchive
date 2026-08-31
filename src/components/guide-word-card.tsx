"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import { generateColorFromWord } from "@/src/lib/word-color";
import { getW1Arm, type Arm } from "@/src/lib/experiment";
import { recordLookup } from "@/src/lib/word-lookup-depth";
import { track } from "@/src/lib/track";

/**
 * W1 — the in-body word→colour card on guide pages, and its A/B wrapper.
 *
 * THE PROBLEM IT ADDRESSES (dev-plan-2026-08-31-next §2, re-measured 2026-08-31).
 * Conversion is decided by the landing page, not the channel:
 *
 *     search → tool page     648 sessions → 495 generated a word   76.4%
 *     search → content page  801 sessions →  13                     1.6%
 *
 * and of those 13, SEVEN landed on `/` and only TWO on a guide. Guide-landing
 * sessions convert at 2/597 ≈ 0.34%. A guide reader and a tool user are, on
 * today's evidence, nearly disjoint populations — and the guides carry no route
 * into the tool: exactly 1 of 333 guides links to /word-to-color/ at all
 * (src/lib/guides.ts:531).
 *
 * WHY A CARD AND NOT A LINK. The page already HAS links to tools — the sidebar
 * "open next" list and the main-column "put it to work" CTA further down
 * (guide-detail-page.tsx), both instrumented as `guide_tool_click` since
 * 2026-08-11. Adding a fourth link would re-run an experiment that has already
 * been run. The untested variable is a working, already-filled tool in the
 * reader's path — something that has produced a result before it is asked for
 * anything.
 *
 * ─── WHAT THIS COMPONENT DELIBERATELY DOES NOT DO ───────────────────────────
 *
 * 1. IT NEVER SPENDS THE VISITOR'S FREE QUOTA. The paywall's counted-word set
 *    (`colorarchive-word-gen-words`, word-color-generator-page.tsx:53) is
 *    site-wide localStorage with no surface discrimination. If this card wrote to
 *    it, five article visits would burn all five free lookups — and the
 *    landing-word exemption does not travel to an embed, so the reader would
 *    arrive at /word-to-color/ ALREADY GATED. That is the precise opposite of
 *    what W1 exists to do: the whole point is to route people INTO the tool, not
 *    to spend their allowance on the way there. This card reads no quota key and
 *    writes none.
 *
 * 2. IT NEVER EMITS FOR THE SEED WORD. This is the single defect that would have
 *    produced a confident, wrong "the card works" reading. On the main page the
 *    `counted:false` branch (word-color-generator-page.tsx:396) sits ABOVE the
 *    landing-word guard at :421 and fires whenever `spendsQuota` is false — which
 *    includes `proUser === null`, the state of every visitor whose session has
 *    not resolved yet. An ungated, prefilled embed is `spendsQuota === false` by
 *    construction, so the naive port fires the criterion event 2s after mount,
 *    for every reader in the treatment arm, with zero user input. The
 *    experiment would have measured its own impression counter and reported a
 *    clean win. `userTypedRef` below is the guard, and it is the most important
 *    line in this file.
 *
 * 3. IT DOES NOT COPY, SHARE, OR SAVE. Those are reasons to open the tool. The
 *    card shows one swatch; the tool shows five tones, copy, share and history.
 *    Deliberately not using <CopyButton> also keeps `color_copied` — which W2
 *    reads on 2026-09-08 — free of a surface that did not exist when its 14-day
 *    window opened.
 *
 * ─── HOW IT IS READ ─────────────────────────────────────────────────────────
 *
 * `w1_assigned` fires from THIS wrapper, on mount, in BOTH arms. It is the
 * denominator. It must not be gated on the card's own geometry: if only the
 * treatment fired an impression, the treatment's denominator would fill with
 * shallower sessions the control never counted, biasing its measured rate DOWN.
 * That is not hypothetical — server/session-denominator.js records `e401e0f`
 * dropping guide sessions from ~21/day to ~2.5/day while pageviews stayed flat
 * ("the readers never left, the instrument did"). Qualify engagement at read
 * time with `page_read`, which is emitted by the root layout identically in both
 * arms, instead of with a per-arm impression.
 *
 * `word_generated` carries `surface:"guide_card"` and `counted:false`, so:
 *   - the §5 anchor (gate-report.cjs, `counted = 1`) already excludes it, and
 *   - `wordSessionsAll` — the anchor's successor-in-waiting, which is NOT
 *     filtered on `counted` — is given an explicit `surface` filter in the same
 *     commit, so its qualification window is not contaminated either.
 *
 * ─── LAYOUT ─────────────────────────────────────────────────────────────────
 *
 * Mount-gated, like every other client-decided block on this site
 * (word-intent-probe.tsx): no SSR output, so the 333 prerendered guide documents
 * are byte-identical to what they are today and nothing about indexing changes.
 * The hydration insert shifts the sections below it — which costs no CLS,
 * because CLS only scores shifts of content inside the viewport and this card is
 * spliced AFTER the first article section, below the hero and the key-points
 * panel. Do not move it above the fold without re-checking that.
 */

/** Flip to false to remove the experiment instantly, both arms. */
const W1_ENABLED = true;

/**
 * One assignment row per VISIT, not per guide page and not per effect run.
 *
 * Three separate things would otherwise multiply this event, and the read-out
 * needs none of them: React StrictMode double-invokes effects in dev
 * (posthog-provider.tsx:25 dedupes for the same reason); a reader who opens five
 * guides in one visit would emit five rows; and a client-side nav back to a guide
 * already seen would emit another. The denominator is
 * `COUNT(DISTINCT session_id) GROUP BY arm`, so every one of those is pure volume
 * — and volume is not free: the server silently drops writes past 200/day/IP
 * (server/bot-detect.js) while still answering 200, so an event fired five times
 * as often is an event five times likelier to be clipped on a shared NAT.
 *
 * sessionStorage matches `ca_sid`'s lifetime exactly, which is the granularity the
 * read-out groups by. The module-level flag underneath it is not a duplicate: it
 * covers the browsers where sessionStorage throws, and it is what actually
 * absorbs the StrictMode double-invoke (module scope survives a remount).
 */
const ASSIGN_ONCE_KEY = "ca_w1_seen_v1";
let assignedThisLoad = false;

function shouldEmitAssignment(): boolean {
  if (assignedThisLoad) return false;
  assignedThisLoad = true;
  try {
    if (window.sessionStorage.getItem(ASSIGN_ONCE_KEY)) return false;
    window.sessionStorage.setItem(ASSIGN_ONCE_KEY, "1");
  } catch {
    // Storage unavailable: the module flag above still holds this page load, so
    // the worst case is one extra row per full document load, not per render.
  }
  return true;
}

/** Same 2s idle-commit the main generator uses, so `depth` means the same thing. */
const COMMIT_DELAY_MS = 2000;

const MAX_WORD_LENGTH = 40;

export function GuideWordCard({ seedWord, slug }: { seedWord: string; slug: string }) {
  // Nothing renders until the client has decided. `arm === null` is "not yet
  // known" and is distinct from "control" — the assignment event must not fire
  // twice, and a null arm is how the effect below tells the first pass apart.
  const [arm, setArm] = useState<Arm | null>(null);

  useEffect(() => {
    if (!W1_ENABLED) return;
    const { arm: assigned, persisted } = getW1Arm();
    // The arm is set on every mount; only the EVENT is once per visit. Reversing
    // that would leave later guides in a visit unrendered.
    setArm(assigned);
    if (!shouldEmitAssignment()) return;
    // The denominator. Fires in BOTH arms, on mount, with no dependence on the
    // card's own geometry. `persisted:false` marks browsers that may re-roll the
    // coin on the next document load; the read-out excludes them rather than
    // discovering them afterwards. `guide` names the FIRST guide of the visit,
    // which is the one the arm was decided on.
    track("w1_assigned", { arm: assigned, surface: "guide", persisted, guide: slug });
  }, [slug]);

  if (arm !== "card") return null;
  return <WordCard seedWord={seedWord} slug={slug} />;
}

function WordCard({ seedWord, slug }: { seedWord: string; slug: string }) {
  const { t } = useLocale();
  const [input, setInput] = useState(seedWord);

  /**
   * FALSE UNTIL THE READER TYPES. See note 2 in the header — without this the
   * card reports a conversion for every impression. It is a ref and not state
   * because flipping it must not re-render, and because the commit effect has to
   * read the value at fire time rather than the value captured when the timer
   * was scheduled.
   */
  const userTypedRef = useRef(false);
  /** Words this mount already emitted for, so a re-render cannot double-count. */
  const emittedRef = useRef<Set<string>>(new Set());
  /** Distinct lookups this visit, net of typing fragments — same as the tool's. */
  const depthRef = useRef<Set<string>>(new Set());
  /** `w1_card_interact` is a first-touch funnel step, not a per-keystroke event. */
  const interactedRef = useRef(false);

  const color = useMemo(() => generateColorFromWord(input) ?? generateColorFromWord(seedWord), [input, seedWord]);

  useEffect(() => {
    if (!userTypedRef.current) return;
    const trimmed = input.trim();
    if (trimmed.length < 2) return;
    const timer = setTimeout(() => {
      const word = trimmed.toLowerCase();
      if (emittedRef.current.has(word)) return;
      emittedRef.current.add(word);
      track("word_generated", {
        // Never spends quota, so it can never belong to the pre-2026-08-27
        // counted series. This is what keeps the §5 anchor's COALESCE filter
        // correct without the anchor having to know this card exists.
        counted: false,
        reason: "embed",
        surface: "guide_card",
        depth: recordLookup(depthRef.current, word),
        guide: slug,
      });
    }, COMMIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [input, slug]);

  const onType = (value: string) => {
    userTypedRef.current = true;
    setInput(value.slice(0, MAX_WORD_LENGTH));
    if (!interactedRef.current) {
      interactedRef.current = true;
      track("w1_card_interact", { surface: "guide", guide: slug });
    }
  };

  if (!color) return null;

  const target = `/word-to-color/?q=${encodeURIComponent(input.trim() || seedWord)}`;

  return (
    <section
      aria-label={t("guideCard.label")}
      className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80"
    >
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
        {t("guideCard.eyebrow")}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div
          aria-hidden="true"
          className="swatch-shadow h-16 w-16 shrink-0 rounded-[1rem]"
          style={{ backgroundColor: color.hex }}
        />
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            {input.trim() || seedWord}
          </div>
          <div className="mt-1 font-mono text-sm uppercase text-neutral-500 dark:text-neutral-400">
            {color.hex}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        {t("guideCard.desc")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={input}
          maxLength={MAX_WORD_LENGTH}
          onChange={(event) => onType(event.target.value)}
          placeholder={t("guideCard.placeholder")}
          aria-label={t("guideCard.inputLabel")}
          // `outline-none` removes the browser's focus ring, so the focus state is
          // carried entirely by the border — which means it needs a dark variant or
          // keyboard focus becomes invisible in dark mode (a darker border than the
          // resting one). Same pair as src/components/word-intent-probe.tsx.
          className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-neutral-900 outline-none transition focus:border-black/30 dark:border-white/15 dark:bg-white/8 dark:text-white dark:focus:border-white/35"
        />
        <Link
          href={target}
          onClick={() =>
            track("guide_tool_click", {
              guide: slug,
              target: "/word-to-color/",
              placement: "w1_card",
            })
          }
          // `dark:hover:bg-neutral-200` is not symmetry for its own sake. In dark
          // mode the button is `dark:bg-white dark:text-neutral-950` — near-black
          // text on white — and a bare `hover:bg-neutral-800` repaints the
          // background dark while the text stays near-black, so the label
          // disappears on hover. src/lib/__tests__/dark-mode-classes.test.ts
          // catches exactly this and fails CI without the partner.
          className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          {t("guideCard.cta")}
        </Link>
      </div>
    </section>
  );
}
