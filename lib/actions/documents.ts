"use server";

import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { deleteObject } from "@/lib/r2";
import { eq } from "drizzle-orm";

export async function saveDocument(formData: FormData) {
  const session = await requireSession();

  const key = formData.get("key") as string;
  const name = formData.get("name") as string;
  const mimeType = formData.get("mimeType") as string;
  const size = Number(formData.get("size"));
  const docType = (formData.get("docType") as string) || "other";
  const participantId = formData.get("participantId")
    ? Number(formData.get("participantId"))
    : null;

  await db.insert(documents).values({
    userId: session.user.id,
    participantId,
    type: docType as any,
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
