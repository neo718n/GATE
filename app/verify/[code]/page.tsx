import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { ResultCard } from "@/components/verify/result-card";
import { BadgeResultCard } from "@/components/verify/badge-result-card";
import { formatCode, isValidCodeShape } from "@/lib/certificates/code";
import {
  clearFailures,
  recordFailure,
} from "@/lib/certificates/fail-tracker";
import {
  countryFromHeaders,
  hashIp,
  ipFromHeaders,
  logVerification,
} from "@/lib/certificates/log";
import { lookupRawByCode, sanitizeCertificate } from "@/lib/certificates/lookup";
import {
  formatBadgeCode,
  isBadgeCodeShape,
  lookupRawBadgeByCode,
  sanitizeBadge,
} from "@/lib/badges/lookup";

export const metadata: Metadata = {
  title: "Verify Certificate · G.A.T.E.",
  robots: { index: false, follow: false },
};

export default async function VerifyResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  const h = await headers();
  const ip = ipFromHeaders(h);
  const ipKey = hashIp(ip);

  // Certificate codes ("GATE-2026-MATH-XXXXXX") and event badge codes
  // ("UZB-C-014") are different shapes and live in separate tables — branch on
  // shape before doing any lookup. Badge codes never overlap the GATE- shape.
  const canonicalCert = formatCode(decoded);
  if (!isValidCodeShape(canonicalCert) && isBadgeCodeShape(formatBadgeCode(decoded))) {
    const canonical = formatBadgeCode(decoded);
    const badge = await lookupRawBadgeByCode(canonical);
    const status = badge ? ("verified" as const) : ("not_found" as const);

    if (status === "not_found") {
      recordFailure(ipKey);
    } else {
      clearFailures(ipKey);
    }

    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50 hover:text-gate-gold transition-colors mb-6 print:hidden"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Back to verify
        </Link>
        <BadgeResultCard
          status={status}
          badge={badge ? sanitizeBadge(badge) : undefined}
          attemptedCode={canonical}
        />
      </div>
    );
  }

  const canonical = canonicalCert;
  const row = await lookupRawByCode(canonical);

  const status = !row
    ? ("not_found" as const)
    : row.revokedAt
      ? ("revoked" as const)
      : ("verified" as const);

  if (status === "not_found") {
    recordFailure(ipKey);
  } else {
    clearFailures(ipKey);
  }

  void logVerification({
    certificateId: row?.id ?? null,
    attemptedCode: canonical,
    status,
    ip,
    countryCode: countryFromHeaders(h),
    userAgent: h.get("user-agent"),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href="/verify"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50 hover:text-gate-gold transition-colors mb-6 print:hidden"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        Back to verify
      </Link>
      <ResultCard
        status={status}
        certificate={row ? sanitizeCertificate(row) : undefined}
        attemptedCode={canonical}
      />
    </div>
  );
}
