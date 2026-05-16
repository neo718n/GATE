"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  certificates,
  cycles,
  participants,
  results,
  subjects,
  type Award,
} from "@/lib/db/schema";
import { generateCode, subjectSlugToCode } from "./code";
import { hashCode } from "./hmac";
import { renderCertificatePdf } from "./render-pdf";

const issueSchema = z.object({
  resultId: z.number().int().positive(),
});

export interface IssueCertificateResult {
  certificateId: number;
  code: string;
  alreadyIssued: boolean;
}

export async function issueCertificate(
  input: z.infer<typeof issueSchema>,
): Promise<IssueCertificateResult> {
  await requireRole(["admin", "super_admin"]);
  const { resultId } = issueSchema.parse(input);

  const existing = await db
    .select()
    .from(certificates)
    .where(eq(certificates.resultId, resultId))
    .limit(1);
  if (existing[0]) {
    return {
      certificateId: existing[0].id,
      code: existing[0].verificationCode,
      alreadyIssued: true,
    };
  }

  const rows = await db
    .select({
      resultId: results.id,
      award: results.award,
      participantName: participants.fullName,
      subjectName: subjects.name,
      subjectSlug: subjects.slug,
      cycleId: cycles.id,
      cycleYear: cycles.year,
    })
    .from(results)
    .innerJoin(participants, eq(participants.id, results.participantId))
    .innerJoin(subjects, eq(subjects.id, results.subjectId))
    .innerJoin(cycles, eq(cycles.id, results.cycleId))
    .where(eq(results.id, resultId))
    .limit(1);

  const row = rows[0];
  if (!row) throw new Error(`Result ${resultId} not found`);
  if (!row.award) {
    throw new Error(
      `Result ${resultId} has no award assigned — cannot issue certificate`,
    );
  }

  const participantName = row.participantName.trim() || "Anonymous Participant";
  const subjectCode = subjectSlugToCode(row.subjectSlug);

  let code = "";
  let codeHash = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCode(row.cycleYear, subjectCode);
    const candidateHash = hashCode(candidate);
    const collision = await db
      .select({ id: certificates.id })
      .from(certificates)
      .where(eq(certificates.verificationCode, candidate))
      .limit(1);
    if (!collision[0]) {
      code = candidate;
      codeHash = candidateHash;
      break;
    }
  }
  if (!code) throw new Error("Failed to generate a unique certificate code");

  const inserted = await db
    .insert(certificates)
    .values({
      resultId: row.resultId,
      verificationCode: code,
      codeHash,
      participantName,
      subjectName: row.subjectName,
      subjectCode,
      award: row.award as Award,
      scorePercentile: null,
      cycleId: row.cycleId,
      cycleYear: row.cycleYear,
    })
    .returning();

  try {
    await renderCertificatePdf({ certificateId: inserted[0].id });
  } catch (err) {
    console.error(
      `[issueCertificate] PDF render failed for cert ${inserted[0].id}:`,
      err,
    );
  }

  revalidatePath("/admin/certificates");
  revalidatePath("/participant/certificates");

  return {
    certificateId: inserted[0].id,
    code,
    alreadyIssued: false,
  };
}

const revokeSchema = z.object({
  certificateId: z.number().int().positive(),
  reason: z.string().min(1).max(500).optional(),
});

export async function revokeCertificate(
  input: z.infer<typeof revokeSchema>,
): Promise<{ success: true }> {
  await requireRole(["admin", "super_admin"]);
  const { certificateId, reason } = revokeSchema.parse(input);

  await db
    .update(certificates)
    .set({ revokedAt: new Date(), revokedReason: reason ?? "No reason given" })
    .where(eq(certificates.id, certificateId));

  revalidatePath("/admin/certificates");
  revalidatePath("/participant/certificates");
  return { success: true };
}

export async function unrevokeCertificate(input: {
  certificateId: number;
}): Promise<{ success: true }> {
  await requireRole(["admin", "super_admin"]);
  const certificateId = z.number().int().positive().parse(input.certificateId);
  await db
    .update(certificates)
    .set({ revokedAt: null, revokedReason: null })
    .where(eq(certificates.id, certificateId));
  revalidatePath("/admin/certificates");
  return { success: true };
}
