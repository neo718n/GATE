"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { archiveDocument, deleteDocument } from "@/lib/actions/documents";
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

export function ParticipantDocuments({
  docs,
  participantId,
}: {
  docs: Document[];
  participantId: number;
}) {
  const [list, setList] = useState(docs);

  const active = list.filter((d) => !d.archivedAt);
  const archived = list.filter((d) => d.archivedAt);

  async function handleArchive(id: number) {
    await archiveDocument(id);
    setList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, archivedAt: new Date() } : d)),
    );
  }

  async function handleDelete(id: number) {
    await deleteDocument(id);
    setList((prev) => prev.filter((d) => d.id !== id));
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <section className="border border-gate-fog bg-white p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gate-800">
          Documents
        </h2>
        <FileUpload participantId={participantId} label="+ Upload Document" />
      </div>

      {active.length === 0 && archived.length === 0 && (
        <p className="text-sm font-light text-gate-800/40">No documents uploaded.</p>
      )}

      {active.length > 0 && (
        <div className="flex flex-col gap-0 divide-y divide-gate-fog/40">
          {active.map((doc) => (
            <DocRow
              key={doc.id}
              doc={doc}
              formatSize={formatSize}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/40">
            Archived ({archived.length})
          </p>
          <div className="flex flex-col gap-0 divide-y divide-gate-fog/40 opacity-50">
            {archived.map((doc) => (
              <DocRow
                key={doc.id}
                doc={doc}
                formatSize={formatSize}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function DocRow({
  doc,
  formatSize,
  onArchive,
  onDelete,
}: {
  doc: Document;
  formatSize: (n: number | null) => string;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  async function handleDownload() {
    const url = await getPresignedDownloadUrl(doc.key);
    window.open(url, "_blank");
  }

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 py-3 items-center">
      <button
        type="button"
        onClick={handleDownload}
        className="text-sm font-light text-gate-800 hover:text-gate-gold text-left truncate transition-colors"
      >
        {doc.name}
      </button>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gate-800/50">
        {TYPE_LABEL[doc.type] ?? doc.type}
      </span>
      <span className="text-xs font-light text-gate-800/50">{formatSize(doc.size)}</span>
      <span className="text-[11px] font-light text-gate-800/40">
        {new Date(doc.uploadedAt).toLocaleDateString()}
      </span>
      <div className="flex gap-2">
        {!doc.archivedAt && (
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-[10px] text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => onDelete(doc.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
