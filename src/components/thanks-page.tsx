"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CONTACT_EMAIL } from "@/src/lib/site-config";
import { track } from "@/src/lib/track";

export function ThanksPage() {
  // Close the checkout funnel: clicked → redirected → success. Fired on the
  // post-purchase landing so conversion rate is measurable end-to-end.
  useEffect(() => {
    track("checkout_success", {});
  }, []);
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Welcome to Pro
            </div>
            <h1 className="font-display max-w-3xl text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Your Pro access is now active.
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              You now have unlimited AI palette generations, exports in every format, WCAG audit reports, and full token generation. Start creating.
            </p>
            {/* The one step buyers actually miss (learned from our first real
                subscriber, who paid and then bounced off a still-locked tool):
                Pro lives on the ACCOUNT, so the browser must be signed in. */}
            <div className="mt-5 max-w-2xl rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3.5">
              <p className="text-sm leading-6 text-emerald-900">
                <span className="font-semibold">One more step:</span> sign in with your purchase
                email so this browser knows you&rsquo;re Pro — your tools unlock the moment you do.
              </p>
              <Link
                href="/login/"
                onClick={() => track("thanks_login_click", {})}
                className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
              >
                Sign in to activate this device
              </Link>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                {
                  title: "1. Try AI palettes",
                  body: "Generate unlimited palettes with our AI tools — brand palette, mood palette, or palette generator.",
                },
                {
                  title: "2. Export everything",
                  body: "Export any palette in CSS, Tailwind, SCSS, JSON, Figma tokens, SwiftUI, Android, Flutter, and more.",
                },
                {
                  title: "3. Run WCAG audits",
                  body: "Check accessibility compliance with full contrast ratio matrices and AA/AAA reports.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.2rem] border border-black/6 bg-white/86 px-4 py-4"
                >
                  <div className="text-sm font-semibold text-neutral-950">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Popular Pro tools
            </div>
            <div className="mt-4 grid gap-3">
              {[
                { href: "/palette-generator/", label: "Palette Generator", desc: "AI-powered palette creation" },
                { href: "/brand-generator/", label: "Brand Generator", desc: "Generate complete brand color systems" },
                { href: "/tokens/", label: "Token Generator", desc: "Full 50-950 scale in every format" },
                { href: "/wcag-audit/", label: "WCAG Audit", desc: "Contrast ratio matrix and compliance reports" },
              ].map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex gap-3 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 transition hover:bg-white"
                >
                  <div className="text-sm leading-6 text-neutral-600">
                    <span className="font-medium text-neutral-950">{tool.label}</span> — {tool.desc}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Go next
              </div>
              <div className="mt-4 grid gap-3">
                <Link
                  href="/account/"
                  className="flex items-center gap-3 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-3.5 text-sm leading-6 text-neutral-600 transition hover:bg-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm text-white">
                    A
                  </span>
                  <span>
                    <span className="font-medium text-neutral-950">Open account</span>
                    {" "}- manage subscription and usage stats
                  </span>
                </Link>
                <Link
                  href="/collections/"
                  className="flex items-center gap-3 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-3.5 text-sm leading-6 text-neutral-600 transition hover:bg-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm text-white">
                    C
                  </span>
                  <span>
                    <span className="font-medium text-neutral-950">Browse collections</span>
                    {" "}- curated palettes ready for export
                  </span>
                </Link>
              </div>
            </aside>

            <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Need help</div>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Questions about your Pro subscription? Visit your account page or email {CONTACT_EMAIL}.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/account/"
                    className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Open account
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
