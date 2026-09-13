"use client";

import { useState, useSyncExternalStore } from "react";
import { HERO_CLIPS } from "@/lib/marketing/hangzhou-media";

const STORAGE_KEY = "gate-hero-clip";

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

let cachedIndex: number | null = null;
const neverChanges = () => () => {};
const clientSnapshot = () => (cachedIndex ??= pickClipIndex());
const serverSnapshot = () => null;

export function HeroVideo() {
  // Deliberately server/client-divergent: null while rendering on the server,
  // a concrete clip once hydrated. useSyncExternalStore makes that explicit
  // instead of hiding it in an effect.
  const clipIndex = useSyncExternalStore(neverChanges, clientSnapshot, serverSnapshot);
  const [playing, setPlaying] = useState(false);

  const clip = clipIndex === null ? null : HERO_CLIPS[clipIndex];

  return (
    <>
      <div
        className={`absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,153,58,0.16),transparent),linear-gradient(135deg,#0b1f3a,#060f1c_60%)] transition-opacity duration-700 ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      />
      {clip && (
        // Decorative background footage — the hero's meaning is carried by the
        // heading and copy, so it is hidden from assistive technology.
        <video
          key={clip.src}
          aria-hidden="true"
          tabIndex={-1}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
          src={clip.src}
          poster={clip.poster}
          autoPlay
          muted
          loop
          playsInline
          // The poster carries the hero until motion starts, but the motion is
          // the point of this section — so the clip is fetched eagerly rather
          // than waiting on metadata first. Cost is bounded: clips are curated
          // and the session re-uses one cached file across pages.
          preload="auto"
          onPlaying={() => setPlaying(true)}
        />
      )}
    </>
  );
}
