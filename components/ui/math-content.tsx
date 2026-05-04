"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export function MathContent({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Handle TipTap Mathematics nodes serialized as <span data-type="math">
    el.querySelectorAll<HTMLElement>('[data-type="math"]').forEach((span) => {
      let latex = span.textContent?.trim() ?? "";
      const displayMode = latex.startsWith("$$") && latex.endsWith("$$");
      if (displayMode) latex = latex.slice(2, -2);
      else if (latex.startsWith("$") && latex.endsWith("$")) latex = latex.slice(1, -1);
      if (!latex) return;
      try {
        katex.render(latex, span, { throwOnError: false, displayMode });
      } catch { /* ignore */ }
    });

    // Handle $...$ and $$...$$ delimiters in plain text via auto-render
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("katex/dist/contrib/auto-render.js" as any).then((mod: any) => {
      const renderMathInElement = (mod.default ?? mod) as (el: HTMLElement, opts: object) => void;
      renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$",  right: "$",  display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    });
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
