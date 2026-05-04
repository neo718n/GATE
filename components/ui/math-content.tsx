"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

function renderMath(html: string): string {
  let out = html;

  // TipTap Mathematics nodes: <span data-type="math">...$latex$...</span>
  out = out.replace(
    /<span\b[^>]*data-type="math"[^>]*>([^<]*)<\/span>/g,
    (_, inner: string) => {
      let latex = inner.trim();
      const display = latex.startsWith("$$") && latex.endsWith("$$");
      if (display) latex = latex.slice(2, -2);
      else if (latex.startsWith("$") && latex.endsWith("$")) latex = latex.slice(1, -1);
      return katex.renderToString(latex, { throwOnError: false, displayMode: display });
    },
  );

  // $$...$$ display math (must come before single $)
  out = out.replace(/\$\$([\s\S]+?)\$\$/g, (_, latex: string) =>
    katex.renderToString(latex.trim(), { throwOnError: false, displayMode: true }),
  );

  // $...$ inline math
  out = out.replace(/\$([^$\n]+?)\$/g, (_, latex: string) =>
    katex.renderToString(latex.trim(), { throwOnError: false, displayMode: false }),
  );

  return out;
}

export function MathContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: renderMath(html) }}
    />
  );
}
