"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.colorarchive.me";

type State = "idle" | "loading" | "success" | "error";

interface EmailCaptureFormProps {
  source?: string;
  successMessage?: string;
  placeholder?: string;
  buttonLabel?: string;
}

export function EmailCaptureForm({
  source = "free-pack",
  successMessage = "Check your inbox — download link sent.",
  placeholder = "you@example.com",
  buttonLabel = "Send download link",
}: EmailCaptureFormProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setState("loading");
    setError("");

    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          landingPath: pathname,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          utmSource: searchParams.get("utm_source"),
          utmMedium: searchParams.get("utm_medium"),
          utmCampaign: searchParams.get("utm_campaign"),
          utmTerm: searchParams.get("utm_term"),
          utmContent: searchParams.get("utm_content"),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }

      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-full border border-black/10 bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {state === "loading" ? "Sending…" : buttonLabel}
      </button>
      {state === "error" && (
        <span className="w-full text-xs text-red-500">{error}</span>
      )}
    </form>
  );
}
