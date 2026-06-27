"use client";

import { useId, useState } from "react";

import { API_URL } from "@/src/lib/api-config";
import { attributionForSubscribe } from "@/src/lib/attribution";

type State = "idle" | "loading" | "success" | "error";

export function CotdSubscribeForm({
  colorHex,
  source = "cotd",
  heading = "Get a color every morning",
  onSuccess,
  cotd = true,
  successNote = "One color, delivered to your inbox each morning.",
  footnote = "One email per day. Unsubscribe anytime.",
}: {
  colorHex?: string;
  /** attribution tag stored with the subscriber (e.g. "word-to-color") */
  source?: string;
  heading?: string;
  /** fired once after a successful subscribe (e.g. to lift a paywall gate) */
  onSuccess?: () => void;
  /** opt into the daily Color-of-the-Day list. Pre-order reservations pass
   *  false — they're reserving a product, not signing up for a daily email. */
  cotd?: boolean;
  /** sub-text on the success card (defaults to the COTD message) */
  successNote?: string;
  /** fine print under the form (defaults to the COTD cadence note) */
  footnote?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const reactId = useId();
  const headingId = `cotd-form-heading-${reactId}`;
  const errorId = `cotd-form-error-${reactId}`;

  const borderColor = colorHex ?? "#6366f1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      setState("error");
      return;
    }
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, cotd, ...attributionForSubscribe() }),
      });
      if (!res.ok) throw new Error("Server error");
      setState("success");
      onSuccess?.();
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div role="status" className="rounded-2xl border border-black/8 bg-white/80 px-5 py-4 text-center backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">You&apos;re in!</p>
        <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">{successNote}</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border bg-white/80 px-5 py-4 backdrop-blur-sm dark:bg-white/5"
      style={{ borderColor: `${borderColor}30` }}
    >
      <p id={headingId} className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 dark:text-slate-400">
        {heading}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-labelledby={headingId}
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? errorId : undefined}
          className="flex-1 min-w-0 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-white/25"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 px-4 py-2 text-xs font-semibold rounded-xl text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: borderColor }}
        >
          {state === "loading" ? "…" : "Subscribe"}
        </button>
      </form>
      {state === "error" && (
        <p id={errorId} role="alert" className="text-xs text-red-500 mt-1.5 dark:text-red-400">{errorMsg}</p>
      )}
      <p className="text-[10px] text-slate-400 mt-2 dark:text-slate-500">{footnote}</p>
    </div>
  );
}
