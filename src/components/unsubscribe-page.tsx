"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/src/lib/api-config";

/**
 * /unsubscribe/ — the page every marketing email has linked to since the
 * beginning, and which did not exist until 2026-07-25.
 *
 * Opting out requires an explicit click, never a bare page load: inbox
 * providers and security scanners pre-fetch links, so a load-triggered
 * unsubscribe would quietly drop people who never asked.
 */
type State = "idle" | "working" | "done" | "error";

export function UnsubscribePage() {
  const params = useSearchParams();
  const emailParam = params.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [state, setState] = useState<State>("idle");
  const [lists, setLists] = useState<{ cotd: boolean; notes: boolean } | null>(null);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  // Show what they're actually subscribed to, so "unsubscribe" isn't a blind action.
  useEffect(() => {
    const e = emailParam.trim();
    if (!e) return;
    let cancelled = false;
    fetch(`${API_URL}/unsubscribe/status?email=${encodeURIComponent(e)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setLists({ cotd: Boolean(d.cotd), notes: Boolean(d.notes) });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [emailParam]);

  const unsubscribe = useCallback(
    async (list: "all" | "cotd" | "notes") => {
      const e = email.trim();
      if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        setState("error");
        return;
      }
      setState("working");
      try {
        const res = await fetch(`${API_URL}/unsubscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: e, list }),
        });
        if (!res.ok) throw new Error("failed");
        setState("done");
      } catch {
        setState("error");
      }
    },
    [email],
  );

  if (state === "done") {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          You&rsquo;re unsubscribed
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          That&rsquo;s done — no more emails. Thanks for having given them a try.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-300 dark:text-neutral-900"
        >
          Back to ColorArchive
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-20">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Unsubscribe</h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        Confirm the address below and we&rsquo;ll stop emailing it. No questions, no
        &ldquo;are you sure&rdquo; loop.
      </p>

      <label htmlFor="unsub-email" className="mt-6 block text-xs font-medium text-neutral-500">
        Email address
      </label>
      <input
        id="unsub-email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
        placeholder="you@example.com"
        className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />

      {lists && (lists.cotd || lists.notes) && (
        <p className="mt-3 text-xs text-neutral-500">
          Currently subscribed to:{" "}
          {[lists.cotd && "Color of the Day (daily)", lists.notes && "Design Notes (weekly)"]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          disabled={state === "working"}
          onClick={() => unsubscribe("all")}
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:hover:bg-neutral-300 dark:text-neutral-900"
        >
          {state === "working" ? "Unsubscribing…" : "Unsubscribe from everything"}
        </button>

        {/* Only offer the granular options when there is a real choice to make. */}
        {lists?.cotd && lists?.notes && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={state === "working"}
              onClick={() => unsubscribe("cotd")}
              className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-xs text-neutral-700 transition hover:border-neutral-500 disabled:opacity-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:text-neutral-300"
            >
              Stop the daily color only
            </button>
            <button
              type="button"
              disabled={state === "working"}
              onClick={() => unsubscribe("notes")}
              className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-xs text-neutral-700 transition hover:border-neutral-500 disabled:opacity-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:text-neutral-300"
            >
              Stop the weekly notes only
            </button>
          </div>
        )}
      </div>

      {state === "error" && (
        <p className="mt-3 text-xs text-red-500">
          That didn&rsquo;t work. Check the address, or email hello@colorarchive.org and we&rsquo;ll
          remove you by hand.
        </p>
      )}
    </main>
  );
}
