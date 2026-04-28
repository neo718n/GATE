"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { archiveDocument } from "@/lib/actions/documents";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { Button } from "@/components/ui/button";
import type { Document } from "@/lib/db/schema";

const TYPE_LABEL: Record<string, string> = {
  identity: "Identity",
  photo: "Photo",
  certificate: "Certificate",
  invoice: "Invoice",
  cv: "CV",
  other: "Other",
};

const DOC_TYPES = ["identity", "photo", "certificate", "cv", "other"] as const;

export function ParticipantDocumentsList({
  docs,
  participantId,
}: {
  docs: Document[];
  participantId?: number;
}) {
  const [list, setList] = useState(docs);
  const [selectedType, setSelectedType] = useState<string>("other");

  const active = list.filter((d) => !d.archivedAt);
  const archived = list.filter((d) => d.archivedAt);

  async function handleArchive(id: number) {
    await archiveDocument(id);
    setList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, archivedAt: new Date() } : d)),
    );
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Upload panel */}
      <div className="border border-gate-fog bg-white p-5 flex flex-col gap-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gate-800">
          Upload New Document
        </h2>
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50">
              Document Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 border border-gate-800/20 bg-white px-3 text-sm font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <FileUpload
            docType={selectedType}
            participantId={participantId}
            label="Choose File & Upload"
            onSuccess={() => window.location.reload()}
          />
        </div>
      </div>

      {/* Active documents */}
      <div className="flex flex-col gap-0 border border-gate-fog bg-white divide-y divide-gate-fog/40">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gate-fog/30">
          {["File", "Type", "Size", "Uploaded", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50">
              {h}
            </span>
          ))}
        </div>

        {active.length === 0 && (
          <p className="px-5 py-8 text-sm font-light text-gate-800/40">
            No documents uploaded yet.
          </p>
        )}

        {active.map((doc) => (
          <DocRow key={doc.id} doc={doc} formatSize={formatSize} onArchive={handleArchive} />
        ))}
      </div>

      {archived.length > 0 && (
        <details className="border border-gate-fog bg-white">
          <summary className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/40 cursor-pointer">
            Archived ({archived.length})
          </summary>
          <div className="divide-y divide-gate-fog/40 opacity-50">
            {archived.map((doc) => (
              <DocRow key={doc.id} doc={doc} formatSize={formatSize} onArchive={handleArchive} archived />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function DocRow({
  doc,
  formatSize,
  onArchive,
  archived = false,
}: {
  doc: Document;
  formatSize: (n: number | null) => string;
  onArchive: (id: number) => void;
  archived?: boolean;
}) {
  async function handleDownload() {
    const url = await getPresignedDownloadUrl(doc.key);
    window.open(url, "_blank");
  }

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center">
      <button
        type="button"
        onClick={handleDownload}
        className="text-sm font-light text-gate-800 hover:text-gate-gold text-left truncate transition-colors"
      >
        {doc.name}
      </button>
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gate-800/50">
        {TYPE_LABEL[doc.type] ?? doc.type}
      </span>
      <span className="text-xs font-light text-gate-800/50">{formatSize(doc.size)}</span>
      <span className="text-[11px] font-light text-gate-800/40">
        {new Date(doc.uploadedAt).toLocaleDateString()}
      </span>
      {!archived && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-[10px]"
          onClick={() => onArchive(doc.id)}
        >
          Archive
        </Button>
      )}
    </div>
  );
}
