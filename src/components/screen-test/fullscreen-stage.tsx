"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared fullscreen engine for the /screen-test/ family.
 *
 * Progressive-enhancement ladder (dev-plan-2026-07-20 §2.3):
 *  1. element.requestFullscreen() (Chrome/Edge/Firefox, Safari macOS 16.4+)
 *  2. webkitRequestFullscreen() prefix (older Safari / iPadOS)
 *  3. iPhone Safari cannot fullscreen non-video elements at all → maximize
 *     fallback: fixed inset-0 overlay with touch scrolling locked.
 *
 * Also handles: Screen Wake Lock (with visibilitychange re-acquire), cursor
 * auto-hide, a fading exit hint, and Escape/double-tap exit wiring. Fullscreen
 * must be entered from a user gesture — mounting with `active` satisfies that
 * when the caller flips `active` inside a click handler.
 *
 * Lifecycle note: `onExit` / `onAdvance` are read through refs so parents may
 * pass inline or state-capturing callbacks WITHOUT tearing the effect down —
 * re-running it would race the async wake-lock request (leak) and re-call
 * requestFullscreen outside a user gesture (console security errors).
 */

interface FullscreenStageProps {
  /** Current background (any CSS color). */
  background: string;
  /** Whether the stage is currently shown. */
  active: boolean;
  /** Called when the user exits (Esc, browser UI, or the exit button). */
  onExit: () => void;
  /** Advance on click/tap/arrow keys (dead-pixel cycling). Optional. */
  onAdvance?: (direction: 1 | -1) => void;
  /** Optional HUD line shown until the user interacts (e.g. color name). */
  hudText?: string;
  children?: React.ReactNode;
}

export function FullscreenStage({
  background,
  active,
  onExit,
  onAdvance,
  hudText,
  children,
}: FullscreenStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [cursorHidden, setCursorHidden] = useState(false);
  const cursorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitedRef = useRef(false);

  // Stable views of the parent callbacks — parents may pass inline closures.
  const onExitRef = useRef(onExit);
  const onAdvanceRef = useRef(onAdvance);
  useEffect(() => {
    onExitRef.current = onExit;
    onAdvanceRef.current = onAdvance;
  });
  const hasAdvance = Boolean(onAdvance);

  /* ---------------- wake lock ---------------- */
  const acquireWakeLock = useCallback(async () => {
    try {
      // Screen Wake Lock: HTTPS-only, auto-releases on tab hide — re-acquired below.
      const nav = navigator as Navigator & {
        wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
      };
      if (nav.wakeLock) {
        const lock = await nav.wakeLock.request("screen");
        if (exitedRef.current) {
          // The stage ended while the async request was in flight — release immediately.
          lock.release().catch(() => {});
        } else {
          wakeLockRef.current = lock;
        }
      }
    } catch {
      // Denied / unsupported — non-fatal, the test still works.
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  /* ---------------- fullscreen ladder ---------------- */
  const enterFullscreen = useCallback(async () => {
    const el = stageRef.current;
    if (!el) return;
    type PrefixedElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as PrefixedElement).webkitRequestFullscreen) {
        await (el as PrefixedElement).webkitRequestFullscreen?.();
      }
      // else: iPhone Safari — the fixed-overlay fallback below is already the UI.
    } catch {
      // Fullscreen denied — the fixed overlay still covers the viewport.
    }
  }, []);

  const exitStage = useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    releaseWakeLock();
    onExitRef.current();
  }, [releaseWakeLock]);

  /* ---------------- lifecycle (runs once per activation) ---------------- */
  useEffect(() => {
    if (!active) return;
    exitedRef.current = false;
    setCursorHidden(false);
    void enterFullscreen();
    void acquireWakeLock();
    // Move focus onto the stage: screen readers announce it, and Enter/Space
    // can no longer re-trigger the (now hidden) launcher button behind it.
    stageRef.current?.focus();

    // Leaving browser fullscreen (Esc / swipe) ends the stage — never fight it.
    const onFsChange = () => {
      if (!document.fullscreenElement) exitStage();
    };
    document.addEventListener("fullscreenchange", onFsChange);

    // Re-acquire the wake lock when the tab becomes visible again.
    const onVisibility = () => {
      if (document.visibilityState === "visible" && !exitedRef.current) void acquireWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Browser handles real fullscreen itself; this covers the iPhone fallback.
        exitStage();
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        onAdvanceRef.current?.(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onAdvanceRef.current?.(-1);
      }
    };
    window.addEventListener("keydown", onKey);

    // iOS elastic-scroll lock for the maximize fallback (plan §2.3-2).
    const onTouchMove = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.body.style.overflow = "hidden";

    return () => {
      if (cursorTimer.current) clearTimeout(cursorTimer.current);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("touchmove", onTouchMove);
      document.body.style.overflow = "";
      releaseWakeLock();
    };
  }, [active, acquireWakeLock, enterFullscreen, exitStage, releaseWakeLock]);

  /* Hint: show on activation and whenever the HUD text changes, fade after 4s. */
  useEffect(() => {
    if (!active) return;
    setHintVisible(true);
    const timer = setTimeout(() => setHintVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [active, hudText]);

  /* ---------------- cursor auto-hide ---------------- */
  const onMouseMove = useCallback(() => {
    setCursorHidden(false);
    if (cursorTimer.current) clearTimeout(cursorTimer.current);
    cursorTimer.current = setTimeout(() => setCursorHidden(true), 2500);
  }, []);

  if (!active) return null;

  return (
    <div
      ref={stageRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label="Test pattern — tap to advance, press Escape or double-tap to exit"
      // inset-0 alone pins all four edges to the viewport — do NOT add an explicit
      // height (100dvh can mis-resolve in embedded panes / iOS and break centering).
      className={`fixed inset-0 z-[999] touch-none select-none overscroll-none outline-none ${cursorHidden ? "cursor-none" : ""}`}
      style={{ background }}
      onMouseMove={onMouseMove}
      onClick={(e) => {
        // detail > 1 = part of a double-click — let onDoubleClick exit without
        // spuriously advancing (would distort fields_seen analytics).
        if (e.detail === 1) onAdvanceRef.current?.(1);
      }}
      onDoubleClick={exitStage}
    >
      {children}
      {/* Exit hint — fades after 4s, reappears when the HUD text changes */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-6 flex justify-center transition-opacity duration-700 ${hintVisible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="rounded-full bg-black/60 px-4 py-1.5 text-xs text-white backdrop-blur-sm">
          {hudText ? `${hudText} · ` : ""}
          {hasAdvance ? "Tap / → to advance · " : ""}Esc or double-tap to exit
        </div>
      </div>
      {/* Always-available exit affordance for touch (iPhone fallback has no Esc) */}
      <button
        type="button"
        aria-label="Exit test"
        className={`absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-opacity duration-700 ${hintVisible ? "opacity-100" : "opacity-0 hover:opacity-100 focus:opacity-100"}`}
        onClick={(e) => {
          e.stopPropagation();
          exitStage();
        }}
      >
        ✕ Exit
      </button>
    </div>
  );
}
