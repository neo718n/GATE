import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { certificates, type Certificate } from "@/lib/db/schema";
import { formatCode, isValidCodeShape } from "./code";
import { hashCode } from "./hmac";
import type { LookupResult, PublicCertificate } from "./types";

export function sanitizeCertificate(row: Certificate): PublicCertificate {
  return {
    verificationCode: row.verificationCode,
    participantName: row.participantName,
    subjectName: row.subjectName,
    award: row.award,
    scorePercentile: row.scorePercentile,
    cycleYear: row.cycleYear,
    issuedAt: row.issuedAt.toISOString(),
    revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
  };
}

export async function lookupByCode(rawCode: string): Promise<LookupResult> {
  const canonical = formatCode(rawCode);
  if (!isValidCodeShape(canonical)) return { status: "not_found" };

  const digest = hashCode(canonical);
  const rows = await db
    .select()
    .from(certificates)
    .where(eq(certificates.codeHash, digest))
    .limit(2);

  const match = rows.find((r) => r.verificationCode === canonical);
  if (!match) return { status: "not_found" };

  if (match.revokedAt) {
    return { status: "revoked", certificate: sanitizeCertificate(match) };
  }
  return { status: "verified", certificate: sanitizeCertificate(match) };
}

export async function lookupRawByCode(
  rawCode: string,
): Promise<Certificate | null> {
  const canonical = formatCode(rawCode);
  if (!isValidCodeShape(canonical)) return null;
  const digest = hashCode(canonical);
  const rows = await db
    .select()
    .from(certificates)
    .where(eq(certificates.codeHash, digest))
    .limit(2);
  return rows.find((r) => r.verificationCode === canonical) ?? null;
}
