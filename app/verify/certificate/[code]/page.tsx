import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  formatBadgeCode,
  lookupRawBadgeByCode,
  sanitizeBadge,
} from "@/lib/badges/lookup";
import { lookupExamResultsForBadge, sanitizeResult } from "@/lib/badges/results";
import { lookupAppreciationForBadge, sanitizeAppreciation } from "@/lib/badges/appreciations";
import { isBadgeVerifyEnabled } from "@/lib/badges/verify-flow";
import { certificateSerial } from "@/components/badges/certificate-pdf";
import { appreciationCertificateSerial } from "@/components/badges/appreciation-certificate-pdf";
import {
  CertificateResultCard,
  type CertificateVerifyStatus,
} from "@/components/verify/certificate-result-card";
import { AppreciationResultCard } from "@/components/verify/appreciation-result-card";

export const metadata: Metadata = {
  title: "Verify Certificate · G.A.T.E.",
  robots: { index: false, follow: false },
};

// Every badge holder earns at most one certificate today (one subject each —
// see scripts/seed-event-badge-results.ts) — the QR/URL only carries the
// badge code, so this takes that badge's one result. If a badge ever earns
// results in both subjects, this shows the first found rather than adding a
// subject picker nobody needs yet.
//
// A badge with no exam result at all (OFFICIAL/COUNTRY_REP, STAFF, MEDIA, ...)
// falls through to eventBadgeAppreciations instead — see
// lib/badges/appreciations.ts and scripts/generate-appreciation-certificate.ts.
export default async function CertificateVerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const canonical = formatBadgeCode(decodeURIComponent(code));

  const backLink = (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50 hover:text-gate-gold transition-colors mb-6 print:hidden"
    >
      <ArrowLeft className="h-3 w-3" aria-hidden />
      Main Page
    </Link>
  );

  if (!(await isBadgeVerifyEnabled())) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
        {backLink}
        <CertificateResultCard status="disabled" attemptedCode={canonical} />
      </div>
    );
  }

  const badge = await lookupRawBadgeByCode(canonical);
  const results = badge ? await lookupExamResultsForBadge(badge.id) : [];
  const [result] = results;

  if (badge && result) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
        {backLink}
        <CertificateResultCard
          status="verified"
          badge={sanitizeBadge(badge)}
          result={sanitizeResult(result)}
          serial={certificateSerial(result.award, result.id)}
          attemptedCode={canonical}
        />
      </div>
    );
  }

  const appreciation = badge ? await lookupAppreciationForBadge(badge.id) : null;
  const status: CertificateVerifyStatus = badge && appreciation ? "verified" : "not_found";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
      {backLink}
      <AppreciationResultCard
        status={status}
        badge={badge ? sanitizeBadge(badge) : undefined}
        roleLabel={appreciation ? sanitizeAppreciation(appreciation).roleLabel : undefined}
        serial={appreciation ? appreciationCertificateSerial(appreciation.id) : undefined}
        attemptedCode={canonical}
      />
    </div>
  );
}
