"use client";

import { useState, useEffect, useRef } from "react";
import { API_URL } from "@/src/lib/auth-client";
import { useAuth } from "@/src/components/auth-provider";

interface ReferralData {
  code: string;
  credits: number;
  referrals: number;
  link: string;
}

export function ReferralCard() {
  const { status } = useAuth();
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`${API_URL}/me/referral`, { credentials: "include" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [status]);

  if (!data) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(data.link);
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Refer &amp; Earn</h2>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{data.credits}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">AI Credits</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{data.referrals}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Referrals</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">+5</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Per Referral</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={data.link}
          className="flex-1 text-xs font-mono border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400"
        />
        <button
          onClick={copyLink}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-colors shrink-0"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-3">
        Share your link. When someone signs up, you earn 5 AI credits. Credits are used before your daily limit.
      </p>
    </div>
  );
}
