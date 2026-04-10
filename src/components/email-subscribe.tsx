"use client";

import { useState } from "react";
import { useLocale } from "@/src/components/locale-provider";
import { API_URL } from "@/src/lib/api-config";

type SubscribeState = "idle" | "loading" | "success" | "error";

export function EmailSubscribe() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubscribeState>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state === "loading") return;

    setState("loading");
    try {
      const res = await fetch(
        `${API_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        }
      );
      if (!res.ok) throw new Error("Subscribe failed");
      setState("success");
      setEmail("");
    } catch {
      setState("error");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/60 sm:px-10 sm:py-12">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -left-12 top-6 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-4 h-48 w-48 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      <div className="relative mx-auto max-w-xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-50/80 px-3 py-1 text-xs font-medium tracking-[0.22em] text-amber-600 uppercase dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
          Weekly
        </div>

        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white sm:text-3xl">
          {t("newsletter.title")}
        </h2>

        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:text-base">
          {t("newsletter.subtitle")}
        </p>

        {state === "success" ? (
          <div className="mt-6 rounded-2xl border border-emerald-200/60 bg-emerald-50/80 px-5 py-4 text-sm font-medium text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400">
            {t("newsletter.success")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state === "error") setState("idle");
              }}
              placeholder={t("newsletter.placeholder")}
              className="flex-1 rounded-full border border-black/8 bg-white/90 px-5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100/60 dark:border-white/10 dark:bg-white/8 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-amber-700 dark:focus:ring-amber-900/30"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-amber-600 dark:hover:bg-amber-500"
            >
              {state === "loading" ? "..." : t("newsletter.subscribe")}
            </button>
          </form>
        )}

        {state === "error" && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {t("newsletter.error")}
          </p>
        )}
      </div>
    </section>
  );
}
