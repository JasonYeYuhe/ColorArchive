"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth-provider";
import { fetchUsage, type UsageStats, API_URL } from "@/src/lib/auth-client";
import { ReferralCard } from "@/src/components/referral-card";

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const isUnlimited = limit === null;
  const pct = isUnlimited ? 0 : limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = !isUnlimited && limit > 0 && used >= limit * 0.8;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isUnlimited ? (
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Unlimited</span>
          ) : (
            <>{used} / {limit}</>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isNearLimit ? "bg-orange-500" : "bg-indigo-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ApiKeySection() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/me/api-key`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setApiKey(d.apiKey))
      .catch(() => {});
  }, []);

  const generateKey = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/me/api-key`, { method: "POST", credentials: "include" });
      const data = await res.json();
      setApiKey(data.apiKey);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">API Key</h2>
      <p className="text-xs text-slate-400 mb-4">Use this key for the Figma plugin, REST API, and integrations.</p>

      {apiKey ? (
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="flex-1 text-xs font-mono border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400"
          />
          <button
            onClick={copyKey}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors dark:bg-white dark:text-neutral-950 shrink-0"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      ) : (
        <button
          onClick={generateKey}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 dark:bg-white dark:text-neutral-950"
        >
          {loading ? "Generating..." : "Generate API Key"}
        </button>
      )}
    </div>
  );
}

export function AccountPage() {
  const { user, status, tier, logout } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsage()
        .then(setUsage)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (status === "anonymous") {
      setLoading(false);
    }
  }, [status]);

  if (status === "anonymous") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to view your account, usage stats, and manage your subscription.
          </p>
          <Link
            href="/login?next=/account"
            className="inline-block px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const isPro = tier === "pro";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 pb-24">
      <section className="max-w-2xl mx-auto px-4 pt-10 pb-6">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Account</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
          {user?.email ?? "Account"}
        </h1>
      </section>

      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Tier card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                isPro
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
              }`}>
                {isPro ? "PRO" : "FREE"}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {isPro ? "You have full access to all features." : "Upgrade for unlimited AI and exports."}
              </span>
            </div>
            {!isPro && (
              <Link
                href="/pro"
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>

          {isPro && (
            <p className="text-xs text-slate-400">
              Thank you for supporting ColorArchive! Contact hello@colorarchive.me for billing questions.
            </p>
          )}
        </div>

        {/* Usage stats */}
        {loading ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
            <div className="h-24 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
          </div>
        ) : usage && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Today&apos;s Usage</h2>
            <UsageBar
              label="AI Generations"
              used={usage.ai.used}
              limit={usage.ai.limit}
            />
            <UsageBar
              label="Projects"
              used={usage.projects.count}
              limit={usage.projects.limit}
            />
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
              <span className="text-xs text-slate-500 dark:text-slate-400">Favorites saved</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{usage.favorites.count}</span>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/projects/", label: "My Projects", desc: `${usage?.projects.count ?? 0} saved` },
              { href: "/favorites/", label: "Favorites", desc: `${usage?.favorites.count ?? 0} colors` },
              { href: "/brand-generator/", label: "Brand Generator", desc: "AI palette" },
              { href: "/mood-palette/", label: "Mood Palette", desc: "AI moods" },
            ].map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                <span className="text-[10px] text-slate-400">{desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Referral */}
        <ReferralCard />

        {/* API Key */}
        <ApiKeySection />

        {/* Sign out */}
        <button
          onClick={() => { logout(); window.location.href = "/"; }}
          className="w-full text-center py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
