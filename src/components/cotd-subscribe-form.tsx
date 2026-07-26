"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { API_URL } from "@/src/lib/api-config";
import { attributionForSubscribe } from "@/src/lib/attribution";
import { track } from "@/src/lib/track";

type State = "idle" | "loading" | "success" | "error";

export function CotdSubscribeForm({
  colorHex,
  source = "cotd",
  heading = "Get a color every morning",
  onSuccess,
  cotd = true,
  notes = false,
  successNote = "One color, delivered to your inbox each morning.",
  footnote = "One email per day. Unsubscribe anytime.",
  successCta,
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
  /** opt into the weekly Design Notes list — the technical counterpart to COTD,
   *  used on guides, where readers arrive mid-research rather than browsing. */
  notes?: boolean;
  /** sub-text on the success card (defaults to the COTD message) */
  successNote?: string;
  /** fine print under the form (defaults to the COTD cadence note) */
  footnote?: string;
  /** Where to send someone straight after they subscribe. Signing up is the
   *  highest-intent moment we get; a bare "You're in!" spends it on nothing. */
  successCta?: { href: string; label: string };
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const reactId = useId();
  const headingId = `cotd-form-heading-${reactId}`;
  const errorId = `cotd-form-error-${reactId}`;

  const borderColor = colorHex ?? "#6366f1";

  // Impression = the form actually entered the viewport, not merely mounted.
  // Most of these sit below a long article; counting mounts would inflate the
  // denominator with forms nobody ever saw and make the capture rate a lie.
  //
  // A CALLBACK ref, not a plain one, because this component returns a different
  // root element once it succeeds: an effect keyed on props would keep observing
  // the detached pre-success node (leaking it, and losing the impression for
  // anyone who converts before the threshold is met — which would let the
  // conversion rate exceed 100%). The callback re-binds whenever the node
  // actually changes.
  const observerRef = useRef<IntersectionObserver | null>(null);
  const firedRef = useRef(false);
  const pathname = usePathname();

  // Same surface, new page (guide → guide is a client-side nav that reuses this
  // component): the guard has to reset or the second page reports no impression.
  useEffect(() => {
    firedRef.current = false;
  }, [pathname]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const setRoot = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node || firedRef.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !firedRef.current) {
          firedRef.current = true;
          track("email_form_impression", {
            source,
            list: notes ? "notes" : cotd ? "cotd" : "none",
          });
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    observerRef.current = io;
  };

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
        body: JSON.stringify({ email, source, cotd, notes, ...attributionForSubscribe() }),
      });
      if (!res.ok) throw new Error("Server error");
      // isNewSubscriber separates a genuine capture from an existing subscriber
      // re-submitting, so capture-rate metrics can't be inflated by re-submits.
      // Older server builds omit it — treat a missing value as a new capture.
      let isNew = true;
      try {
        const body = await res.json();
        if (typeof body?.isNewSubscriber === "boolean") isNew = body.isNewSubscriber;
      } catch {
        /* non-JSON success — keep the optimistic default */
      }
      track("email_subscribed", { source, list: notes ? "notes" : cotd ? "cotd" : "none", isNew });
      setState("success");
      onSuccess?.();
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div ref={setRoot} role="status" className="rounded-2xl border border-black/8 bg-white/80 px-5 py-4 text-center backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">You&apos;re in!</p>
        <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">{successNote}</p>
        {/* Subscribing is peak intent. Hand them something to do with it rather
            than ending the interaction on a confirmation. */}
        {successCta && (
          <Link
            href={successCta.href}
            onClick={() => track("email_capture_cta_click", { source, target: successCta.href })}
            className="mt-3 inline-block rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {successCta.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setRoot}
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
