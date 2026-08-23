import "server-only";

import { asc, eq, inArray } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { eventBadges, eventBadgeResults } from "@/lib/db/schema";
import { CertificateSheetPDF } from "@/components/badges/certificate-sheet-pdf";
import { certificateSerial, type CertificateData } from "@/components/badges/certificate-pdf";

function verifyUrlFor(code: string): string {
  const base = (
    process.env.CERT_VERIFY_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://gate-assessment.org"
  ).replace(/\/+$/, "");
  return `${base}/verify/certificate/${code}`;
}

// cardNos, when given, limits the sheet to those badges only — used for
// category-by-category re-grading review batches instead of the full set.
export async function renderCertificateSheetPdf(cardNos?: string[]): Promise<Buffer> {
  const query = db
    .select({
      cardNo: eventBadges.cardNo,
      fullName: eventBadges.fullName,
      country: eventBadges.country,
      resultId: eventBadgeResults.id,
      subject: eventBadgeResults.subject,
      award: eventBadgeResults.award,
      pointsEarned: eventBadgeResults.pointsEarned,
      pointsMax: eventBadgeResults.pointsMax,
    })
    .from(eventBadgeResults)
    .innerJoin(eventBadges, eq(eventBadgeResults.eventBadgeId, eventBadges.id));

  const rows = cardNos?.length
    ? await query.where(inArray(eventBadges.cardNo, cardNos)).orderBy(asc(eventBadges.cardNo), asc(eventBadgeResults.subject))
    : await query.orderBy(asc(eventBadges.cardNo), asc(eventBadgeResults.subject));

  const certificates: CertificateData[] = await Promise.all(
    rows.map(async (row) => {
      const serial = certificateSerial(row.award, row.resultId);
      return {
        fullName: row.fullName,
        country: row.country,
        subject: row.subject,
        award: row.award,
        badgeCode: row.cardNo,
        serial,
        pointsEarned: row.pointsEarned,
        pointsMax: row.pointsMax,
        qrDataUrl: await QRCode.toDataURL(verifyUrlFor(row.cardNo), {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 256,
        }),
      };
    }),
  );

  return renderToBuffer(CertificateSheetPDF({ certificates }));
}
