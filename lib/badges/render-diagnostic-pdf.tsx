import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import type { EventBadge } from "@/lib/db/schema";
import type { PublicEventBadgeResult } from "@/lib/badges/results";
import { allResources, buildSubjectReports } from "@/lib/badges/diagnostic-report";
import { pdfSafeName } from "@/components/badges/badge-card-pdf";
import { DiagnosticReportPDF } from "@/components/verify/diagnostic-report-pdf";

const EVENT_LABEL = "China Camp 2026 · 18–24 August 2026";

function badgeVerifyUrl(cardNo: string): string {
  const base = (
    process.env.CERT_VERIFY_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://gate-assessment.org"
  ).replace(/\/+$/, "");
  return `${base}/verify/${cardNo}`;
}

// eventBadges.fullName casing is inconsistent across the source CSV — same
// normalisation as the certificates.
function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function qr(url: string, width: number): Promise<string> {
  return QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 1, width });
}

export async function renderDiagnosticReportPdf(
  badge: EventBadge,
  results: PublicEventBadgeResult[],
): Promise<Buffer> {
  const reports = buildSubjectReports(results);
  const verifyUrl = badgeVerifyUrl(badge.cardNo);

  const resourceUrls = [...new Set(reports.flatMap((r) => allResources(r).map((x) => x.url)))];
  const [verifyQr, ...resourceQrs] = await Promise.all([
    qr(verifyUrl, 256),
    ...resourceUrls.map((u) => qr(u, 160)),
  ]);
  const qrByUrl = Object.fromEntries(resourceUrls.map((u, i) => [u, resourceQrs[i]]));

  return renderToBuffer(
    <DiagnosticReportPDF
      name={toTitleCase(pdfSafeName(badge.cardNo, badge.fullName))}
      cardNo={badge.cardNo}
      country={badge.country}
      reports={reports}
      verifyUrl={verifyUrl}
      verifyQr={verifyQr}
      qrByUrl={qrByUrl}
      issuedOn={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      eventLabel={EVENT_LABEL}
    />,
  );
}
