"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth-provider";
import { createProject } from "@/src/lib/auth-client";

interface SaveToProjectProps {
  /** Array of hex strings to save */
  palette: string[];
  /** Default project name */
  defaultName?: string;
}

export function SaveToProjectButton({ palette, defaultName = "" }: SaveToProjectProps) {
  const { status } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (status !== "authenticated") {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
        className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        Sign in to save
      </Link>
    );
  }

  if (saved) {
    return (
      <Link
        href="/projects"
        className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
      >
        Saved! View Projects
      </Link>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createProject({
        name: name.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        palette,
        notes: notes.trim(),
      });
      setSaved(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); if (defaultName && !name) setName(defaultName); }}
        className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
      >
        Save to Projects
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Save to Projects</h3>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Brand Refresh"
                className="w-full text-sm border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 bg-white dark:bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Tags <span className="text-slate-300 font-normal">(comma-separated)</span></label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. client, Q2, brand"
                className="w-full text-sm border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 bg-white dark:bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Notes <span className="text-slate-300 font-normal">(optional)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Design notes, context, or rationale..."
                className="w-full text-sm border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 bg-white dark:bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>

            {/* Preview swatches */}
            <div className="flex rounded-lg overflow-hidden h-8">
              {palette.slice(0, 10).map((hex, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
              ))}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/8 rounded-xl hover:bg-slate-200 dark:hover:bg-white/12 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
