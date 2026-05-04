"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Mathematics from "@tiptap/extension-mathematics";
import { useCallback, useRef, useState, useEffect } from "react";
import { FunctionSquare, Image as ImageIcon, Loader2 } from "lucide-react";
import "katex/dist/katex.min.css";

interface OptionEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function OptionEditor({ value, onChange, placeholder }: OptionEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [mathOpen, setMathOpen] = useState(false);
  const mathRef = useRef<HTMLDivElement>(null);
  const mlRef = useRef<HTMLElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true }), Mathematics],
    content: value || `<p>${placeholder ?? ""}</p>`,
    editorProps: {
      attributes: {
        class: "min-h-[38px] px-3 py-2 text-sm font-light text-foreground focus:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!mathOpen || !mathRef.current) return;
    import("mathlive").then(({ MathfieldElement }) => {
      if (!mathRef.current) return;
      const existing = mathRef.current.querySelector("math-field");
      if (existing) { (existing as HTMLElement).focus(); return; }
      const mf = new MathfieldElement();
      mf.setAttribute("style", "width:100%;font-size:1rem;padding:6px;border:none;outline:none;background:transparent;");
      mathRef.current.appendChild(mf);
      mlRef.current = mf;
      mf.focus();
    });
  }, [mathOpen]);

  const insertMath = useCallback(() => {
    const mf = mlRef.current as HTMLElement & { value?: string } | null;
    const latex = mf?.value ?? "";
    if (!latex.trim() || !editor) return;
    editor.chain().focus().insertContent(`$${latex}$`).run();
    setMathOpen(false);
    if (mlRef.current) (mlRef.current as HTMLElement & { value?: string }).value = "";
  }, [editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    setUploading(true);
    try {
      let res: Response;
      try {
        res = await fetch("/api/upload/question-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mimeType: file.type, size: file.size }),
        });
      } catch {
        alert("Upload API unreachable. Please refresh and try again.");
        setUploading(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Upload failed"); return; }
      const { presignedUrl, publicUrl } = data;
      try {
        const put = await fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!put.ok) { alert(`R2 upload failed (${put.status}).`); return; }
      } catch {
        alert("R2 storage upload failed (CORS).");
        return;
      }
      editor.chain().focus().setImage({ src: publicUrl }).run();
    } finally {
      setUploading(false);
    }
  }, [editor]);

  return (
    <div className="flex-1 flex flex-col gap-0">
      {/* Mini toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border border-border bg-muted/20 rounded-t-xl border-b-0">
        <button
          type="button"
          onClick={() => setMathOpen((o) => !o)}
          className={`flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-medium transition-colors hover:bg-gate-gold/10 ${mathOpen ? "bg-gate-gold/15 text-gate-gold" : "text-foreground/50"}`}
        >
          <FunctionSquare className="h-3 w-3" />
          <span>f(x)</span>
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-medium text-foreground/50 hover:bg-gate-gold/10 transition-colors disabled:opacity-40"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }}
        />
      </div>

      {mathOpen && (
        <div className="border border-border border-b-0 bg-card px-3 py-2 flex flex-col gap-2">
          <div ref={mathRef} className="min-h-[40px] border border-border rounded bg-background flex items-center px-2" />
          <div className="flex gap-2">
            <button type="button" onClick={insertMath} className="px-2.5 py-1 text-[11px] font-medium bg-gate-gold text-white rounded hover:bg-gate-gold/90 transition-colors">Insert</button>
            <button type="button" onClick={() => setMathOpen(false)} className="px-2.5 py-1 text-[11px] font-light text-foreground/60 hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="border border-border rounded-b-xl bg-card overflow-hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
