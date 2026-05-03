"use client";

import { useEffect, useRef } from "react";
import "katex/dist/katex.min.css";

type RenderFn = (el: HTMLElement, opts: object) => void;

export function MathContent({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("katex/dist/contrib/auto-render.js" as any).then((mod: any) => {
      const render: RenderFn = mod.default ?? mod;
      render(ref.current!, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
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
