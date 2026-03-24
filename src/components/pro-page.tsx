"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchSession, type AuthSession } from "@/src/lib/auth-client";
import { proSubscriptionConfig } from "@/src/lib/checkout-config";

const FEATURES = [
  {
    title: "Unlimited AI Generations",
    description: "Brand palettes, mood palettes, and AI color naming — no daily limits.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    title: "Unlimited Exports",
    description: "CSS variables, Tailwind config, SCSS, and JSON — export as many palettes as you need.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    title: "WCAG Audit Reports",
    description: "Download full accessibility audit reports for your color systems.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Full Token Generator",
    description: "Complete color scale output (50-950) in all formats, not just previews.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
      </svg>
    ),
  },
];

const COMPARISON = [
  { feature: "Browse 2,016 colors", free: true, pro: true },
  { feature: "Copy hex / RGB / HSL", free: true, pro: true },
  { feature: "AI generations per day", free: "3 (anonymous) / 10 (signed in)", pro: "Unlimited" },
  { feature: "Export palettes", free: "1 per day", pro: "Unlimited" },
  { feature: "WCAG audit download", free: false, pro: true },
  { feature: "Token generator output", free: "Preview", pro: "Full" },
  { feature: "Image palette save", free: false, pro: true },
];

export function ProPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    fetchSession().then(setSession).catch(() => {});
  }, []);

  const isPro = session?.auth.tier === "pro";
  const plan = proSubscriptionConfig[billing];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-10 text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full mb-4">
          PRO
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-3">
          Unlock the full power of ColorArchive
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
          Unlimited AI generations, full exports, accessibility reports, and more — everything professionals need to ship faster.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-4 space-y-10">
        {/* Pricing card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          {/* Billing toggle */}
          <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                billing === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                billing === "yearly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Yearly <span className="text-indigo-600 text-xs font-semibold ml-1">Save 33%</span>
            </button>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
            <span className="text-slate-500 text-sm ml-1">/ {plan.period}</span>
          </div>

          {isPro ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold">
              <span>&#10003;</span> You&apos;re on Pro
            </div>
          ) : plan.url ? (
            <a
              href={plan.url}
              className="inline-block px-8 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
            >
              Subscribe to Pro
            </a>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Pro subscriptions are launching soon.
              </p>
              <Link
                href="/free-pack"
                className="inline-block px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Join the waitlist
              </Link>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3">Cancel anytime. 7-day money-back guarantee.</p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">{f.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 px-6 py-3">
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center">Pro</span>
          </div>
          {COMPARISON.map((row) => (
            <div key={row.feature} className="grid grid-cols-3 text-sm px-6 py-3 border-b border-slate-50 last:border-0">
              <span className="text-slate-700">{row.feature}</span>
              <span className="text-center text-slate-500">
                {row.free === true ? (
                  <span className="text-emerald-500">&#10003;</span>
                ) : row.free === false ? (
                  <span className="text-slate-300">&mdash;</span>
                ) : (
                  row.free
                )}
              </span>
              <span className="text-center text-slate-700 font-medium">
                {row.pro === true ? (
                  <span className="text-emerald-500">&#10003;</span>
                ) : (
                  row.pro
                )}
              </span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I try before I subscribe?",
                a: "Yes! Free accounts get 10 AI generations per day and 1 export per day. No credit card required.",
              },
              {
                q: "What happens when my subscription ends?",
                a: "You keep access to all colors and tools. AI generations and exports revert to free tier limits.",
              },
              {
                q: "Can I get a refund?",
                a: "Yes, we offer a 7-day money-back guarantee. Email hello@colorarchive.me.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-slate-800 mb-1">{q}</p>
                <p className="text-sm text-slate-500">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
