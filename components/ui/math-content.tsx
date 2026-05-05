"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

// Detect if string contains natural language words that wouldn't appear in pure LaTeX.
// Used to avoid rendering entire question sentences as math when accidentally wrapped in $...$.
const NATURAL_LANGUAGE_RE =
  /\b(?:find|the|sum|of|and|or|let|solve|simplify|expand|given|that|what|which|when|where|write|show|prove|determine|evaluate|calculate|compute|express|value|is|are|was|has|have|if|then|else|for|with|from|into|over|under|between|such|so|by|on|an|a)\b/i;

function isNaturalLanguage(s: string): boolean {
  return NATURAL_LANGUAGE_RE.test(s);
}

function renderMath(html: string): string {
  let out = html;

  // TipTap Mathematics nodes: <span data-type="math">...$latex$...</span>
  // ProseMirror strips whitespace adjacent to inline atoms — re-inject spaces
  // when the span directly touches surrounding word characters.
  out = out.replace(
    /<span\b[^>]*data-type="math"[^>]*>([^<]*)<\/span>/g,
    (fullMatch: string, inner: string, offset: number, str: string) => {
      let latex = inner.trim();
      const display = latex.startsWith("$$") && latex.endsWith("$$");
      if (display) latex = latex.slice(2, -2);
      else if (latex.startsWith("$") && latex.endsWith("$")) latex = latex.slice(1, -1);

      // If this "math" span actually contains a full sentence (accidentally in math mode),
      // render it as HTML so spaces and any inner $...$ formulas work correctly.
      if (isNaturalLanguage(latex)) return renderMath(latex);

      const rendered = katex.renderToString(latex, { throwOnError: false, displayMode: display });
      if (display) return rendered;
      const before = str[offset - 1];
      const after = str[offset + fullMatch.length];
      const pre = before && !/[\s>]/.test(before) ? " " : "";
      const suf = after && !/[\s<]/.test(after) ? " " : "";
      return pre + rendered + suf;
    },
  );

  // $$...$$ display math (must come before single $)
  out = out.replace(/\$\$([\s\S]+?)\$\$/g, (_: string, latex: string) =>
    katex.renderToString(latex.trim(), { throwOnError: false, displayMode: true }),
  );

  // $...$ inline math — skip if content is natural language, inject spaces otherwise
  out = out.replace(
    /\$([^$\n]+?)\$/g,
    (fullMatch: string, latex: string, offset: number, str: string) => {
      if (isNaturalLanguage(latex)) return latex; // strip $ and show as plain text
      const rendered = katex.renderToString(latex.trim(), { throwOnError: false, displayMode: false });
      const before = str[offset - 1];
      const after = str[offset + fullMatch.length];
      const pre = before && !/[\s>]/.test(before) ? " " : "";
      const suf = after && !/[\s<]/.test(after) ? " " : "";
      return pre + rendered + suf;
    },
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
