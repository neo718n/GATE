"use client";

import { useState, useSyncExternalStore } from "react";
import { HERO_CLIPS } from "@/lib/marketing/hangzhou-media";

const STORAGE_KEY = "gate-hero-clip";
const SMALL_SCREEN = "(max-width: 640px)";

// The clip is chosen on the client (never during SSR) so every fresh visit can
// show a different one. Within a session the choice is remembered, so moving
// between pages re-uses the already-cached video instead of pulling a new
// multi-megabyte file each time.
function pickClipIndex(): number {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const i = Number(stored);
      if (Number.isInteger(i) && i >= 0 && i < HERO_CLIPS.length) return i;
    }
  } catch {
    // sessionStorage unavailable (private mode, blocked cookies) — just pick one.
  }
  const i = Math.floor(Math.random() * HERO_CLIPS.length);
  try {
    sessionStorage.setItem(STORAGE_KEY, String(i));
  } catch {
    // Non-fatal: the pick simply will not persist.
  }
  return i;
}

type Choice = { index: number; small: boolean };

let cached: Choice | null = null;
const neverChanges = () => () => {};
const clientSnapshot = (): Choice =>
  (cached ??= {
    index: pickClipIndex(),
    small: window.matchMedia(SMALL_SCREEN).matches,
  });
const serverSnapshot = (): Choice | null => null;

export function HeroVideo() {
  // Deliberately server/client-divergent: null while rendering on the server,
  // a concrete clip once hydrated. useSyncExternalStore makes that explicit
  // instead of hiding it in an effect.
  const choice = useSyncExternalStore(neverChanges, clientSnapshot, serverSnapshot);
  const [playing, setPlaying] = useState(false);

  const clip = choice === null ? null : HERO_CLIPS[choice.index];
  // Phones get the 540p cut — roughly half the bytes, and at that display
  // width the extra resolution is invisible.
  const src = clip && choice ? (choice.small ? clip.srcSmall : clip.src) : null;

  return (
    <>
      <div
        className={`absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,153,58,0.16),transparent),linear-gradient(135deg,#0b1f3a,#060f1c_60%)] transition-opacity duration-700 ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      />
      {clip && src && (
        // Decorative background footage — the hero's meaning is carried by the
        // heading and copy, so it is hidden from assistive technology.
        <video
          key={src}
          aria-hidden="true"
          tabIndex={-1}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
          src={src}
          poster={clip.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
        />
      )}
    </>
  );
}
