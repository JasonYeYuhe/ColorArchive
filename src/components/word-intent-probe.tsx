"use client";

import { useEffect, useState } from "react";
import { track } from "@/src/lib/track";
import { useImpression } from "@/src/lib/use-impression";

/**
 * One-tap "what are you making?" probe on /word-to-color/.
 *
 * WHY THIS EXISTS: dev-plan-2026-08-22-phase-b §5 — after choosing to stop
 * investing in the paid surface, the one thing still worth doing is getting
 * FIRST-HAND evidence of what people actually want, instead of guessing at copy.
 * Five interview invitations were sent and all five were delivered; zero were
 * answered. That is a verdict on the research channel, not on whether visitors
 * have opinions. So: ask on the page, where the person already is.
 *
 * ⚠️ READ THIS BEFORE CONCLUDING ANYTHING FROM ITS RESULTS. This page has ALREADY
 * run an on-page research ask and it failed: the B4 recruitment banner (see
 * word-color-generator-page.tsx, RECRUIT_BANNER_ENABLED) got 3,857 impressions
 * over 30 days against ~0 survey responses, and was switched off 2026-07-24. A
 * near-zero response rate here is therefore NOT new information — it is the
 * expected repeat of a known result, and must not be written up as a fresh
 * finding about "users having nothing to say".
 *
 * What is genuinely different this time, and the only reason it is worth one
 * more attempt:
 *   • The banner sent people OFF-SITE to a Google Form. This asks inline and
 *     answers in one tap, with nothing to load, join, or navigate to.
 *   • The banner appeared at the top of the page before the visitor had received
 *     anything. This appears underneath a result they just got.
 *   • The banner asked for a 2-minute survey. This asks for one tap, and only
 *     then offers an optional sentence.
 * If it still returns ~0, the honest reading is "on-page research does not work
 * on cold search traffic on this site", and the slot should be reclaimed rather
 * than re-worded a third time.
 *
 * Flip WORD_INTENT_PROBE_ENABLED to false to remove it instantly.
 */
const WORD_INTENT_PROBE_ENABLED = true;

// Answered OR dismissed — either way we never ask this browser again. A question
// that reappears after you have answered it reads as a broken page.
const PROBE_KEY = "colorarchive-word-intent";

// Deliberately four coarse buckets plus an escape hatch, not a taxonomy. The
// point is to learn which JOB brings people to a word→colour tool, which is the
// input the "public utility" direction actually needs (§7.3: nobody has
// seriously asked why traffic is ~500/mo, and nobody has asked what the 500 are
// trying to do).
const CHOICES = [
  { id: "brand", label: "Brand / logo" },
  { id: "ui", label: "UI / web design" },
  { id: "art", label: "Art / illustration" },
  { id: "curious", label: "Just curious" },
] as const;

const NOTE_MAX = 280;

export function WordIntentProbe({ word }: { word: string }) {
  // Mount-gated, like the banner it replaces: no SSR output means no hydration
  // mismatch on the site's only prerendered high-traffic surface, and no flash
  // for someone who already answered.
  const [visible, setVisible] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);

  /**
   * The DENOMINATOR THAT WAS MISSING (added 2026-08-25).
   *
   * `word_intent_impression` below fires from a bare `useEffect(…, [])` — it counts
   * MOUNTS, not views. So "241 impressions / 62 sessions, 0 answers, 0 dismissals"
   * never supported "people saw it and ignored it", and the repo already knew the
   * difference: src/lib/use-impression.ts exists precisely because a mount is not an
   * exposure, and this component was the one place that did not use it.
   *
   * How bad the gap is, measured rather than assumed: two sessions fired 50 and 25
   * impressions (in 49s and 8s) with zero page_read and zero word_generated — 31% of
   * all impressions from two probable non-humans — and ~56% of consecutive impression
   * pairs are ≤5s apart. Meanwhile the true exposure count is bounded only as
   * 10 ≤ E ≤ 63. At E=10 the rule of three puts the 95% upper bound on the answer
   * rate near 30%; at E=63 it is near 4.8%. The question is INDETERMINATE on today's
   * data — not answered in either direction.
   *
   * So: keep the mount event (it is the existing series, and breaking it would throw
   * away the only history) and add a real one beside it. `seen / mounted` is then a
   * direct reachability measurement, which is what the "is it reachable on real
   * mobile traffic?" question actually needed. Same threshold/dwell defaults as every
   * other impression on the site, so the numbers are comparable.
   *
   * Hook order matters here: this sits ABOVE the `if (!visible) return null` below.
   * A hook underneath an early return is the mistake that once whited out the whole
   * site from the root layout.
   */
  const seenRef = useImpression("word_intent_seen", {});

  useEffect(() => {
    if (!WORD_INTENT_PROBE_ENABLED) return;
    try {
      if (localStorage.getItem(PROBE_KEY)) return;
    } catch {
      // localStorage unavailable (private mode / blocked): show it, but then we
      // cannot remember the answer. Asking once per visit beats never asking.
    }
    setVisible(true);
    // Impression, so the answer rate has a denominator. Without this the whole
    // exercise repeats the mistake logged in dev-plan §2.5: an event that fires
    // only on success measures success, never reach.
    track("word_intent_impression", {});
  }, []);

  if (!visible) return null;

  const remember = (state: string) => {
    try { localStorage.setItem(PROBE_KEY, state); } catch {}
  };

  const choose = (id: string) => {
    setAnswer(id);
    remember("answered");
    // `word` rides along so an answer can be read against what they looked up.
    track("word_intent_answer", { choice: id, word: String(word || "").slice(0, 60) });
  };

  const dismiss = () => {
    setVisible(false);
    remember("dismissed");
    track("word_intent_dismiss", {});
  };

  const sendNote = () => {
    const text = note.trim();
    if (!text) return;
    setNoteSent(true);
    track("word_intent_note", { choice: answer || "none", note: text.slice(0, NOTE_MAX) });
  };

  return (
    <section
      ref={seenRef}
      aria-label="Quick question"
      className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80"
    >
      {answer === null ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <p className="text-sm font-medium text-neutral-950 dark:text-white">
            Quick one &mdash; what are you making with this colour?
          </p>
          <div className="flex flex-wrap gap-2">
            {CHOICES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => choose(c.id)}
                className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-black/25 hover:text-neutral-950 dark:border-white/15 dark:bg-white/8 dark:text-neutral-200 dark:hover:border-white/35 dark:hover:text-white"
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="ml-auto text-xs text-neutral-400 underline underline-offset-2 transition hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            No thanks
          </button>
        </div>
      ) : noteSent ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Thank you &mdash; that genuinely helps.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Thanks. One optional line: what would make this more useful to you?
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={note}
              maxLength={NOTE_MAX}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendNote(); }}
              placeholder="Optional — anonymous"
              aria-label="What would make this more useful?"
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-neutral-900 outline-none transition focus:border-black/30 dark:border-white/15 dark:bg-white/8 dark:text-white dark:focus:border-white/35"
            />
            <button
              type="button"
              onClick={sendNote}
              disabled={!note.trim()}
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setNoteSent(true)}
              className="text-xs text-neutral-400 underline underline-offset-2 transition hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
