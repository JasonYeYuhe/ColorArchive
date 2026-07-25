"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { audit, type AuditResult } from "@/src/lib/palette-audit";
import { track } from "@/src/lib/track";

const SAMPLE_INPUT = `/* Paste your CSS vars, Tailwind config, or a raw list of colors. */
:root {
  --primary: #2563EB;
  --primary-alt: #2564EB;    /* near-dup — audit catches this */
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  --bg: #FFFFFF;
  --surface: #F9FAFB;
  --text-muted: #E5E7EB;     /* low contrast vs bg */
}`;

function swatch(hex: string) {
  return (
    <span
      className="inline-block h-4 w-4 shrink-0 rounded border border-black/10 align-middle dark:border-white/15"
      style={{ backgroundColor: hex }}
      aria-hidden="true"
    />
  );
}

function SummaryCard({ result }: { result: AuditResult }) {
  const s = result.summary;
  const issueCount =
    s.duplicateGroups + s.lowContrastCount + s.nonArchiveCount;
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <MetricTile label="Colors found" value={s.uniqueColors} />
      <MetricTile
        label="Duplicates"
        value={s.duplicateGroups}
        bad={s.duplicateGroups > 0}
      />
      <MetricTile
        label="Low-contrast pairs"
        value={s.lowContrastCount}
        bad={s.lowContrastCount > 0}
      />
      <MetricTile
        label="Off-system"
        value={s.nonArchiveCount}
        bad={s.nonArchiveCount > 0}
      />
      <MetricTile label="Total issues" value={issueCount} bad={issueCount > 0} />
    </section>
  );
}

function MetricTile({
  label,
  value,
  bad,
}: {
  label: string;
  value: number;
  bad?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
      <div
        className={`text-2xl font-semibold tabular-nums ${
          bad
            ? "text-amber-600 dark:text-amber-400"
            : "text-neutral-900 dark:text-white"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </div>
    </div>
  );
}

function ExtractedList({ result }: { result: AuditResult }) {
  return (
    <section className="rounded-2xl border border-black/8 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
        Colors in your input
      </h2>
      <ul className="space-y-2">
        {result.matches.map((m) => {
          const offSystem = m.archive && m.rgbDistance > 18;
          return (
            <li
              key={m.source.hex}
              className="flex items-center gap-3 rounded-lg border border-black/6 bg-white px-3 py-2 text-sm dark:border-white/8 dark:bg-neutral-950/60"
            >
              {swatch(m.source.hex)}
              <code className="font-mono text-neutral-800 dark:text-neutral-200">
                {m.source.hex}
              </code>
              {m.source.count > 1 && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  ×{m.source.count}
                </span>
              )}
              <span className="ml-auto flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span>nearest:</span>
                {m.archive && (
                  <>
                    {swatch(m.archive.hex)}
                    <Link
                      href={`/colors/${m.archive.id}/`}
                      className="font-medium text-neutral-700 hover:underline dark:text-neutral-200"
                    >
                      {m.archive.name}
                    </Link>
                  </>
                )}
                {offSystem && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                    off-system
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ContrastList({ result }: { result: AuditResult }) {
  const failed = result.lowContrastPairs.slice(0, 12);
  if (failed.length === 0) {
    return (
      <section className="rounded-2xl border border-emerald-200/50 bg-emerald-50/60 p-5 dark:border-emerald-900/30 dark:bg-emerald-950/20">
        <div className="text-sm text-emerald-900 dark:text-emerald-200">
          ✓ Every pair of colors you provided reaches WCAG AA contrast.
        </div>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-black/8 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
      <h2 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white">
        Low-contrast pairs
      </h2>
      <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
        These are all pairwise combinations of your colors — not every pair is
        necessarily used together as text on a background.
      </p>
      <ul className="space-y-2">
        {failed.map((p, i) => (
          <li
            key={`${p.a.hex}-${p.b.hex}-${i}`}
            className="flex items-center gap-3 rounded-lg border border-black/6 bg-white px-3 py-2 text-sm dark:border-white/8 dark:bg-neutral-950/60"
          >
            {swatch(p.a.hex)}
            <code className="font-mono">{p.a.hex}</code>
            <span className="text-neutral-400">on</span>
            {swatch(p.b.hex)}
            <code className="font-mono">{p.b.hex}</code>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {p.ratio.toFixed(1)}:1 · {p.grade}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SuggestionsList({ result }: { result: AuditResult }) {
  if (result.suggestions.length === 0) return null;
  return (
    <section className="rounded-2xl border border-black/8 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
        Suggested fixes
      </h2>
      <ul className="space-y-3">
        {result.suggestions.map((s, i) => (
          <li
            key={i}
            className="rounded-xl border border-black/6 bg-white p-3 text-sm dark:border-white/8 dark:bg-neutral-950/60"
          >
            <div className="flex items-start gap-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  s.kind === "low-contrast"
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                    : s.kind === "duplicate"
                      ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300"
                      : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {s.kind}
              </span>
              <div className="flex-1">
                <p className="text-neutral-800 dark:text-neutral-200">{s.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {s.colors.map((c) => (
                    <span key={c.hex} className="inline-flex items-center gap-1.5">
                      {swatch(c.hex)}
                      <code className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                        {c.hex}
                      </code>
                    </span>
                  ))}
                </div>
                {s.suggestion && (
                  <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="mr-1">→ Swap to</span>
                    <Link
                      href={`/colors/${s.suggestion.archiveId}/`}
                      className="inline-flex items-center gap-1 font-medium text-neutral-700 hover:underline dark:text-neutral-200"
                    >
                      {swatch(s.suggestion.toHex)}
                      {s.suggestion.archiveName}
                    </Link>
                    <span className="ml-1 opacity-70">— {s.suggestion.rationale}</span>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PaletteAuditPage() {
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [submitted, setSubmitted] = useState(SAMPLE_INPUT);
  // Defer audit render to post-mount so the SSR HTML and the first client
  // hydrate both emit the same skeleton (avoids React #418 mismatches that
  // varied with locale/extensions/font swaps). The audit itself is a pure
  // sync function — this only delays rendering the *result tree*, not the
  // computation.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const result = useMemo(() => audit(submitted), [submitted]);

  // Fire `audit_started` at most once per page load — the server rate-limits
  // /events to 60/min/IP, and the previous per-keystroke version would
  // exhaust that on any pasted token file.
  const startedFiredRef = useRef(false);

  const runAudit = () => {
    // Re-compute synchronously so the tracked payload reflects the run the
    // user just triggered (not the previous `submitted` value that
    // useMemo is still holding).
    const freshResult = audit(input);
    setSubmitted(input);
    track("audit_completed", {
      unique_colors: freshResult.summary.uniqueColors,
      duplicate_groups: freshResult.summary.duplicateGroups,
      low_contrast_count: freshResult.summary.lowContrastCount,
      non_archive_count: freshResult.summary.nonArchiveCount,
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-light tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Palette Audit
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Paste a block of CSS, Tailwind config, design-token JSON, or any file
          with color values in it. We extract every hex/rgb/hsl color, match
          each one to its nearest ColorArchive entry, flag near-duplicates,
          and check every pairwise contrast ratio against WCAG AA. No
          account, no upload limit, no watermark.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-black/8 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
        <label
          htmlFor="audit-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
        >
          Input
        </label>
        <textarea
          id="audit-input"
          // Browser extensions (Grammarly, etc.) inject attributes/nodes into textareas
          // before React hydrates, which intermittently triggers hydration error #418 on
          // this page (the only one with a prominent paste box). suppressHydrationWarning
          // tells React to tolerate the extension-mutated DOM here.
          suppressHydrationWarning
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Fire a single "started" event the first time the user actually
            // edits the textarea (replacing the preloaded sample). Guarded
            // against per-keystroke spam that would blow the server's
            // 60/min/IP /events rate limit.
            if (
              !startedFiredRef.current &&
              e.target.value.length > 0 &&
              e.target.value !== SAMPLE_INPUT
            ) {
              startedFiredRef.current = true;
              track("audit_started", {});
            }
          }}
          rows={10}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 font-mono text-xs text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-white/10 dark:bg-neutral-950/70 dark:text-neutral-100 dark:focus:border-white/30 dark:focus:ring-white/10"
          spellCheck={false}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={runAudit}
            className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            Run audit
          </button>
          <button
            type="button"
            onClick={() => {
              setInput(SAMPLE_INPUT);
              setSubmitted(SAMPLE_INPUT);
            }}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Reset to sample
          </button>
          <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
            Runs locally — your input never leaves the browser.
          </span>
        </div>
      </section>

      {!mounted ? (
        <div className="rounded-2xl border border-black/8 bg-white/70 p-5 text-sm text-neutral-500 backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
          Loading audit…
        </div>
      ) : result.summary.uniqueColors === 0 ? (
        <div className="rounded-2xl border border-black/8 bg-white/70 p-5 text-sm text-neutral-500 backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
          No colors detected. Paste CSS/Tailwind/JSON with hex, rgb(), or hsl()
          values.
        </div>
      ) : (
        <div className="space-y-6">
          {result.truncated && (
            <p className="rounded-2xl border border-amber-200/60 bg-amber-50/60 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
              Large input — analyzing the {result.summary.uniqueColors} most-used of{" "}
              {result.summary.totalUniqueColors} colors found, so the audit stays fast.
            </p>
          )}
          <SummaryCard result={result} />
          <SuggestionsList result={result} />
          <ExtractedList result={result} />
          <ContrastList result={result} />
        </div>
      )}
    </div>
  );
}
