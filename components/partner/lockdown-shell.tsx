"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logProctorEvent } from "@/lib/actions/exam";
import { Button } from "@/components/ui/button";

/**
 * Soft web lockdown wrapper for the partner exam runner. Enforces fullscreen
 * (via a user gesture), blocks copy/paste/right-click and devtools shortcuts,
 * and logs forbidden actions for proctoring. NOTE: browsers cannot block
 * screenshots or lock the OS — this deters casual cheating only.
 */
export function LockdownShell({
  sessionId,
  examTitle,
  children,
}: {
  sessionId: number;
  examTitle: string;
  children: React.ReactNode;
}) {
  const [started, setStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fsLost, setFsLost] = useState(false);
  const startedRef = useRef(false);

  const [online, setOnline] = useState(true);

  const log = useCallback(
    (kind: "copy" | "fullscreen_exit" | "focus_loss" | "devtools") => {
      logProctorEvent(sessionId, kind).catch(() => {});
    },
    [sessionId],
  );

  // Online/offline indicator (answers are kept in memory and re-saved on reconnect).
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* fullscreen may be unavailable; continue anyway */
    }
  }

  async function start() {
    await enterFullscreen();
    setStarted(true);
    startedRef.current = true;
    setFsLost(false);
  }

  // Attach lockdown listeners once started.
  useEffect(() => {
    if (!started) return;

    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setFsLost(true);
        log("fullscreen_exit");
      } else {
        setFsLost(false);
      }
    };
    const onBlur = () => {
      if (startedRef.current) log("focus_loss");
    };
    const onCopyCutPaste = (e: Event) => {
      e.preventDefault();
      log("copy");
    };
    const onContextMenu = (e: Event) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const devtools =
        key === "f12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (key === "i" || key === "j" || key === "c")) ||
        ((e.ctrlKey || e.metaKey) && key === "u");
      if (devtools) {
        e.preventDefault();
        log("devtools");
      }
    };

    document.addEventListener("fullscreenchange", onFsChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopyCutPaste);
    document.addEventListener("cut", onCopyCutPaste);
    document.addEventListener("paste", onCopyCutPaste);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopyCutPaste);
      document.removeEventListener("cut", onCopyCutPaste);
      document.removeEventListener("paste", onCopyCutPaste);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [started, log]);

  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-serif text-2xl font-light text-foreground">
            {examTitle}
          </h1>
          <ul className="flex flex-col gap-2 text-left text-sm font-light text-muted-foreground">
            <li>• The exam runs in fullscreen — leaving is recorded.</li>
            <li>• Copy, paste, right-click and dev-tools are disabled.</li>
            <li>• Stay in this window until you submit.</li>
          </ul>
          <label className="flex items-center gap-2 text-left text-sm text-foreground">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 accent-gate-gold"
            />
            I understand the rules
          </label>
          <Button
            variant="gold"
            size="md"
            disabled={!agreed}
            onClick={start}
          >
            Enter fullscreen &amp; start
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="select-none">
      {!online && (
        <div className="fixed inset-x-0 top-0 z-[70] bg-amber-500 px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-950">
          ⚠ Offline — your answers are saved and will sync when you reconnect
        </div>
      )}
      {children}
      {fsLost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 p-4 backdrop-blur">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-yellow-400 bg-card p-8 text-center">
            <p className="font-serif text-xl font-light text-yellow-600">
              Fullscreen required
            </p>
            <p className="text-sm font-light text-foreground/70">
              You exited fullscreen. This was recorded. Return to continue your
              exam.
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={enterFullscreen}
              className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
            >
              Re-enter fullscreen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
