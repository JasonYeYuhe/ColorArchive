"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth-provider";
import { fetchUsage, type UsageStats, API_URL } from "@/src/lib/auth-client";
import { ReferralCard } from "@/src/components/referral-card";
import { useLocale } from "@/src/components/locale-provider";

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const { t } = useLocale();
  const isUnlimited = limit === null;
  const pct = isUnlimited ? 0 : limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = !isUnlimited && limit > 0 && used >= limit * 0.8;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isUnlimited ? (
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{t("account.unlimited")}</span>
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
  const { t } = useLocale();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

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
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{t("account.apiKey")}</h2>
      <p className="text-xs text-slate-400 mb-4">{t("account.apiKeyDesc")}</p>

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
            {copied ? t("account.copied") : t("account.copy")}
          </button>
        </div>
      ) : (
        <button
          onClick={generateKey}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 dark:bg-white dark:text-neutral-950"
        >
          {loading ? t("account.generating") : t("account.generateApiKey")}
        </button>
      )}
    </div>
  );
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

function SubscriptionSection() {
  const { t } = useLocale();
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/me/subscription`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSub(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openPortal = useCallback(async () => {
    if (!sub?.stripeCustomerId) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing-portal/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: sub.stripeCustomerId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // ignore
    } finally {
      setPortalLoading(false);
    }
  }, [sub]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
        <div className="h-16 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!sub) return null;

  const renewDate = sub.currentPeriodEnd
    ? new Date(typeof sub.currentPeriodEnd === "number" ? sub.currentPeriodEnd * 1000 : sub.currentPeriodEnd).toLocaleDateString()
    : null;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Subscription</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Plan</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{sub.plan}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
          <span className={`text-xs font-semibold capitalize ${
            sub.status === "active" || sub.status === "trialing"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-orange-600 dark:text-orange-400"
          }`}>
            {sub.status}
          </span>
        </div>
        {renewDate && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {sub.cancelAtPeriodEnd ? "Expires" : "Renews"}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{renewDate}</span>
          </div>
        )}
        {sub.cancelAtPeriodEnd && (
          <p className="text-xs text-orange-600 dark:text-orange-400 pt-1">
            Your subscription will not renew. You retain access until the expiry date.
          </p>
        )}
      </div>
      {sub.stripeCustomerId && (
        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="mt-4 w-full py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          {portalLoading ? "Opening..." : "Manage subscription"}
        </button>
      )}
    </div>
  );
}

export function AccountPage() {
  const { t } = useLocale();
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("account.signIn")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("account.signInDesc")}
          </p>
          <Link
            href="/login?next=/account"
            className="inline-block px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            {t("account.signIn")}
          </Link>
        </div>
      </main>
    );
  }

  const isPro = tier === "pro";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 pb-24">
      <section className="max-w-2xl mx-auto px-4 pt-10 pb-6">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">{t("account.label")}</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
          {user?.email ?? t("account.label")}
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
                {isPro ? t("account.fullAccess") : t("account.upgradeHint")}
              </span>
            </div>
            {!isPro && (
              <Link
                href="/pro"
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
              >
                {t("account.upgradeToPro")}
              </Link>
            )}
          </div>

          {isPro && (
            <p className="text-xs text-slate-400">
              {t("account.proThanks")}
            </p>
          )}
        </div>

        {/* Subscription management (Pro users) */}
        {isPro && <SubscriptionSection />}

        {/* Usage stats */}
        {loading ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
            <div className="h-24 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
          </div>
        ) : usage && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">{t("account.todaysUsage")}</h2>
            <UsageBar
              label={t("account.aiGenerations")}
              used={usage.ai.used}
              limit={usage.ai.limit}
            />
            <UsageBar
              label={t("account.projects")}
              used={usage.projects.count}
              limit={usage.projects.limit}
            />
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
              <span className="text-xs text-slate-500 dark:text-slate-400">{t("account.favoritesSaved")}</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{usage.favorites.count}</span>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">{t("account.quickLinks")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/projects/", label: t("account.myProjects"), desc: `${usage?.projects.count ?? 0} ${t("account.saved")}` },
              { href: "/favorites/", label: t("account.favorites"), desc: `${usage?.favorites.count ?? 0} ${t("account.colors")}` },
              { href: "/brand-generator/", label: t("account.brandGenerator"), desc: t("account.aiPalette") },
              { href: "/mood-palette/", label: t("account.moodPalette"), desc: t("account.aiMoods") },
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
          {t("account.signOut")}
        </button>
      </div>
    </main>
  );
}
