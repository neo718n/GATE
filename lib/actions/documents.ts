"use server";

import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { documents, participants } from "@/lib/db/schema";
import { deleteObject } from "@/lib/r2";
import { eq } from "drizzle-orm";

/**
 * Valid document type categories for uploaded files.
 * Used to classify documents: identity cards, photos, certificates, invoices, CVs, or other files.
 */
const ALLOWED_DOC_TYPES = ["identity", "photo", "certificate", "invoice", "cv", "other"] as const;
type DocType = typeof ALLOWED_DOC_TYPES[number];

/**
 * Saves document metadata to the database after successful file upload to R2 storage.
 *
 * Validates document type, ensures ownership authorization when linked to a participant,
 * and stores the R2 object key for future retrieval. File upload to R2 happens client-side;
 * this action only persists metadata.
 *
 * Authorization:
 * - Requires authenticated session
 * - If participantId provided, validates that participant belongs to the current user
 *
 * @param formData - Form data containing:
 *   - key: R2 object key from successful upload
 *   - name: Original filename
 *   - mimeType: File MIME type
 *   - size: File size in bytes
 *   - docType: One of ALLOWED_DOC_TYPES (defaults to "other")
 *   - participantId: (optional) ID of participant this document belongs to
 *
 * @throws {Error} "Missing required fields" if key, name, or mimeType are missing
 * @throws {Error} "Invalid document type" if docType is not in ALLOWED_DOC_TYPES
 * @throws {Error} "Invalid file size" if size is not a positive number
 * @throws {Error} "Invalid request" if participantId is not a valid number
 * @throws {Error} "Forbidden" if participant does not belong to current user
 */
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

/**
 * Soft-deletes a document by setting its archivedAt timestamp.
 *
 * The file remains in R2 storage and the database record is preserved with archivedAt set.
 * Archived documents are typically filtered out from normal views but can be restored by admins.
 *
 * Authorization:
 * - User must own the document, OR
 * - User must have admin or super_admin role
 *
 * @param id - Database ID of the document to archive
 *
 * @throws {Error} "Document not found" if document with given ID does not exist
 * @throws {Error} "Forbidden" if user is not the owner and lacks admin privileges
 */
export async function archiveDocument(id: number) {
  const session = await requireSession();
  const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
  if (!doc) throw new Error("Document not found");

  const role = (session.user as unknown as { role: string }).role;
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

/**
 * Permanently deletes a document from both R2 storage and the database.
 *
 * This is a destructive operation that removes the file from R2 using the stored key
 * and deletes the database record. Cannot be undone.
 *
 * Authorization:
 * - Requires admin or super_admin role
 *
 * Integration:
 * - Deletes file from R2 storage via deleteObject(key)
 * - Removes database record from documents table
 *
 * @param id - Database ID of the document to permanently delete
 *
 * @throws {Error} "Document not found" if document with given ID does not exist
 * @throws {Error} Authorization error if user lacks admin/super_admin role (thrown by requireRole)
 */
export async function deleteDocument(id: number) {
  await requireRole(["super_admin", "admin"]);

  const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
  if (!doc) throw new Error("Document not found");

  await deleteObject(doc.key);
  await db.delete(documents).where(eq(documents.id, id));

  revalidatePath("/admin/participants");
}
