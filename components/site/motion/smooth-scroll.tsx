"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial smooth scrolling for the marketing site. Skipped entirely for
 * people who prefer reduced motion. In-page anchor links are routed through
 * Lenis so they glide instead of jumping.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Touch screens keep the phone's own native momentum scrolling — it is
    // smoother than anything a script can do and costs no frames.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // lerp instead of a long duration: smooth, but the page follows the
    // wheel closely instead of lagging behind it.
    const lenis = new Lenis({ lerp: 0.14, smoothWheel: true });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href");
      if (!href || !href.startsWith("#") || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
    }
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
