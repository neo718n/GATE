"use client";

import { useRef, useState } from "react";
import { saveDocument } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  docType?: string;
  participantId?: number;
  onSuccess?: () => void;
  label?: string;
}

export function FileUpload({ docType = "other", participantId, onSuccess, label = "Upload File" }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDone(false);
    setPending(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          docType,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Upload failed");
      }

      const { url, key } = await res.json();

      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const fd = new FormData();
      fd.set("key", key);
      fd.set("name", file.name);
      fd.set("mimeType", file.type);
      fd.set("size", String(file.size));
      fd.set("docType", docType);
      if (participantId) fd.set("participantId", String(participantId));

      await saveDocument(fd);
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? "Uploading…" : label}
      </Button>
      {done && <p className="text-xs text-green-700">Uploaded successfully.</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
