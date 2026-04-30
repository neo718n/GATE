"use server";

import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { documents, participants } from "@/lib/db/schema";
import { deleteObject } from "@/lib/r2";
import { eq } from "drizzle-orm";

const ALLOWED_DOC_TYPES = ["identity", "photo", "certificate", "invoice", "cv", "other"] as const;
type DocType = typeof ALLOWED_DOC_TYPES[number];

export async function saveDocument(formData: FormData) {
  const session = await requireSession();

  const key = formData.get("key") as string;
  const name = formData.get("name") as string;
  const mimeType = formData.get("mimeType") as string;
  const size = Number(formData.get("size"));
  const rawDocType = (formData.get("docType") as string) || "other";
  const participantIdRaw = formData.get("participantId");
  const participantId = participantIdRaw ? Number(participantIdRaw) : null;

  if (!key || !name || !mimeType) throw new Error("Missing required fields");
  if (!(ALLOWED_DOC_TYPES as readonly string[]).includes(rawDocType)) throw new Error("Invalid document type");
  if (isNaN(size) || size <= 0) throw new Error("Invalid file size");

  if (participantId !== null) {
    if (isNaN(participantId)) throw new Error("Invalid request");
    const ownerParticipant = await db.query.participants.findFirst({
      where: eq(participants.id, participantId),
    });
    if (!ownerParticipant || ownerParticipant.userId !== session.user.id) {
      throw new Error("Forbidden");
    }
  }

  await db.insert(documents).values({
    userId: session.user.id,
    participantId,
    type: rawDocType as DocType,
    name,
    key,
    size,
    mimeType,
  });

  revalidatePath("/participant/documents");
  revalidatePath("/admin/participants");
}

export async function archiveDocument(id: number) {
  const session = await requireSession();
  const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
  if (!doc) throw new Error("Document not found");

  const role = (session.user as any).role;
  if (doc.userId !== session.user.id && role !== "super_admin" && role !== "admin") {
    throw new Error("Forbidden");
  }

  await db
    .update(documents)
    .set({ archivedAt: new Date() })
    .where(eq(documents.id, id));

  revalidatePath("/participant/documents");
  revalidatePath("/admin/participants");
}

export async function deleteDocument(id: number) {
  await requireRole(["super_admin", "admin"]);

  const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
  if (!doc) throw new Error("Document not found");

  await deleteObject(doc.key);
  await db.delete(documents).where(eq(documents.id, id));

  revalidatePath("/admin/participants");
}
