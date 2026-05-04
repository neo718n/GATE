"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Mathematics from "@tiptap/extension-mathematics";
import { useCallback, useRef, useState, useEffect } from "react";
import { Bold, Italic, Image as ImageIcon, FunctionSquare, Loader2 } from "lucide-react";
import "katex/dist/katex.min.css";

interface QuestionEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

export function QuestionEditor({ name, defaultValue = "", placeholder }: QuestionEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [mathOpen, setMathOpen] = useState(false);
  const [mathInput, setMathInput] = useState("");
  const mathRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mlRef = useRef<HTMLElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true }),
      Mathematics,
    ],
    content: defaultValue || `<p>${placeholder ?? ""}</p>`,
    editorProps: {
      attributes: {
        class: "min-h-[140px] px-4 py-3 text-sm font-light text-foreground focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

  // Initialize MathLive once
  useEffect(() => {
    if (!mathOpen || !mathRef.current) return;
    import("mathlive").then(({ MathfieldElement }) => {
      if (!mathRef.current) return;
      const existing = mathRef.current.querySelector("math-field");
      if (existing) {
        (existing as HTMLElement).focus();
        return;
      }
      const mf = new MathfieldElement();
      mf.value = mathInput;
      mf.setAttribute("style", "width:100%;font-size:1.1rem;padding:8px;border:none;outline:none;background:transparent;");
      mathRef.current.appendChild(mf);
      mlRef.current = mf;
      mf.focus();
    });
  }, [mathOpen]);

  const insertMath = useCallback(() => {
    const mf = mlRef.current as HTMLElement & { value?: string } | null;
    const latex = mf?.value ?? mathInput;
    if (!latex.trim() || !editor) return;
    editor.chain().focus().insertContent(`$${latex}$`).run();
    setMathOpen(false);
    setMathInput("");
    if (mlRef.current) {
      (mlRef.current as HTMLElement & { value?: string }).value = "";
    }
  }, [editor, mathInput]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    setUploading(true);
    try {
      const res = await fetch("/api/upload/question-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mimeType: file.type, size: file.size }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Upload failed");
        return;
      }
      const { presignedUrl, publicUrl } = data;
      const putRes = await fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!putRes.ok) {
        alert("Failed to upload image to storage. Check R2 CORS settings.");
        return;
      }
      editor.chain().focus().setImage({ src: publicUrl }).run();
    } catch (e) {
      alert("Image upload error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const html = editor?.getHTML() ?? defaultValue;

  return (
    <div className="flex flex-col gap-0">
      <input type="hidden" name={name} value={html} />

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border border-border bg-muted/20 rounded-t-xl border-b-0">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-gate-gold/10 ${editor?.isActive("bold") ? "bg-gate-gold/15 text-gate-gold" : "text-foreground/60"}`}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors hover:bg-gate-gold/10 ${editor?.isActive("italic") ? "bg-gate-gold/15 text-gate-gold" : "text-foreground/60"}`}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={() => setMathOpen((o) => !o)}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-gate-gold/10 ${mathOpen ? "bg-gate-gold/15 text-gate-gold" : "text-foreground/60"}`}
          title="Insert formula"
        >
          <FunctionSquare className="h-3.5 w-3.5" />
          <span>Formula</span>
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-foreground/60 hover:bg-gate-gold/10 transition-colors disabled:opacity-40"
          title="Insert image"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
          <span>Image</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageUpload(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Math input popover */}
      {mathOpen && (
        <div className="border border-border border-b-0 bg-card px-4 py-3 flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
            Visual Formula Editor — type or use keyboard
          </p>
          <div
            ref={mathRef}
            className="min-h-[48px] border border-border rounded-lg bg-background flex items-center px-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={insertMath}
              className="px-3 py-1.5 text-xs font-medium bg-gate-gold text-white rounded-lg hover:bg-gate-gold/90 transition-colors"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => { setMathOpen(false); setMathInput(""); }}
              className="px-3 py-1.5 text-xs font-light text-foreground/60 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Editor body */}
      <div className="border border-border rounded-b-xl bg-card overflow-hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
