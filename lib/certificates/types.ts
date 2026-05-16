import type { Award } from "@/lib/db/schema";

export type LookupStatus = "verified" | "revoked" | "not_found";

export interface PublicCertificate {
  verificationCode: string;
  participantName: string;
  subjectName: string;
  award: Award;
  scorePercentile: number | null;
  cycleYear: number;
  issuedAt: string;
  revokedAt: string | null;
}

export interface LookupResult {
  status: LookupStatus;
  certificate?: PublicCertificate;
}
