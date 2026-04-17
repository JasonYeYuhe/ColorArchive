"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "@/src/components/locale-provider";
import {
  getPinterestAuthUrl,
  getStoredToken,
  fetchBoards,
  createPin,
  clearToken,
  subscribeToPinterestToken,
  setReturnPath,
} from "@/src/lib/pinterest";
import type { ColorRecord } from "@/src/types/color";
import { SITE_URL } from "@/src/lib/site-config";

/* ── Pinterest icon (simplified P logo) ─────────────────── */
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

/* ── Board picker modal ─────────────────────────────────── */
interface Board {
  id: string;
  name: string;
}

function BoardPickerModal({
  boards,
  loading,
  onSelect,
  onClose,
  saving,
  saved,
}: {
  boards: Board[];
  loading: boolean;
  onSelect: (boardId: string) => void;
  onClose: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const { t } = useLocale();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 w-full max-w-sm rounded-3xl border border-black/8 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <PinterestIcon className="h-5 w-5 text-red-600" />
          <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
            {t("pinterest.chooseBoard")}
          </h3>
        </div>

        {saved && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {t("pinterest.saved")}
          </div>
        )}

        {loading && (
          <div className="mt-6 flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-red-600" />
          </div>
        )}

        {!loading && !saved && boards.length === 0 && (
          <p className="mt-6 text-center text-sm text-neutral-500">
            {t("pinterest.noBoards")}
          </p>
        )}

        {!loading && !saved && boards.length > 0 && (
          <div className="mt-4 max-h-72 space-y-1.5 overflow-y-auto">
            {boards.map((board) => (
              <button
                key={board.id}
                type="button"
                disabled={saving}
                onClick={() => onSelect(board.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-black/5 px-4 py-3 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-white/8 dark:text-neutral-300 dark:hover:bg-white/5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </span>
                {board.name}
                {saving && (
                  <span className="ml-auto">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-red-600" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-black/6 pt-3 dark:border-white/8">
          <button
            type="button"
            onClick={() => {
              clearToken();
              onClose();
            }}
            className="text-xs text-neutral-400 transition hover:text-red-600"
          >
            {t("pinterest.disconnect")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Toast notification ─────────────────────────────────── */
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-[slideUp_0.3s_ease-out]">
      <div
        className={`flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-medium shadow-xl ${
          type === "success"
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white"
        }`}
      >
        {type === "success" ? (
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        )}
        {message}
      </div>
    </div>
  );
}

/* ── Main button ────────────────────────────────────────── */
export function PinterestSaveButton({ color }: { color: ColorRecord }) {
  const { t } = useLocale();
  const [token, setToken] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Sync token from localStorage
  useEffect(() => {
    setToken(getStoredToken());
    return subscribeToPinterestToken(() => setToken(getStoredToken()));
  }, []);

  const loadBoards = useCallback(async (tok: string) => {
    setLoadingBoards(true);
    try {
      const items = await fetchBoards(tok);
      setBoards(items.map((b) => ({ id: b.id, name: b.name })));
    } catch {
      setBoards([]);
    } finally {
      setLoadingBoards(false);
    }
  }, []);

  const handleClick = () => {
    if (!token) {
      // Save current path so callback can redirect back here
      setReturnPath(window.location.pathname);
      window.location.href = getPinterestAuthUrl();
      return;
    }
    // Open board picker
    setSaved(false);
    setShowPicker(true);
    loadBoards(token);
  };

  const handleSave = async (boardId: string) => {
    if (!token) return;
    setSaving(true);
    try {
      const pageUrl = `${SITE_URL}/colors/${color.id}/`;
      // Use the OG image as pin image. Trailing slash matters: next.config.ts
      // enforces trailingSlash:true, and Pinterest's image fetcher (2786 error)
      // does not follow the 308 redirect from the unslashed form.
      const imageUrl = `${SITE_URL}/colors/${color.id}/opengraph-image/`;

      await createPin({
        token,
        boardId,
        title: `${color.name} — ${color.hex}`,
        description: `${color.name} (${color.hex}) from ColorArchive. A curated color reference for designers. RGB: ${color.rgb} · HSL: ${color.hsl}`,
        link: pageUrl,
        imageUrl,
        altText: `Color swatch for ${color.name} (${color.hex})`,
      });
      setSaved(true);
      setShowPicker(false);
      setToast({ message: t("pinterest.saveSuccess"), type: "success" });
    } catch (err) {
      setToast({ message: t("pinterest.saveError"), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-red-700 transition hover:bg-red-600 hover:text-white dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
      >
        <PinterestIcon className="h-3.5 w-3.5" />
        {t("pinterest.save")}
      </button>

      {showPicker && (
        <BoardPickerModal
          boards={boards}
          loading={loadingBoards}
          onSelect={handleSave}
          onClose={() => setShowPicker(false)}
          saving={saving}
          saved={saved}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
