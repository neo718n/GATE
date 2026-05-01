import { requireSession } from "@/lib/authz";
import { db } from "@/lib/db";
import { documents, participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ParticipantDocumentsList } from "./participant-documents-list";

export default async function MyDocumentsPage() {
  const session = await requireSession();

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  const myDocs = await db.query.documents.findMany({
    where: eq(documents.userId, session.user.id),
    orderBy: (d, { desc }) => [desc(d.uploadedAt)],
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          My Documents
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Documents</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Upload and manage your documents. Accepted: PDF, JPG, PNG, DOC (max 10 MB).
        </p>
      </div>

      <ParticipantDocumentsList
        docs={myDocs}
        participantId={participant?.id}
      />
    </div>
  );
}
