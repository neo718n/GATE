// Generates a "Certificate of Appreciation" PDF for a non-contestant eventBadges
// row (OFFICIAL/COUNTRY_REP, STAFF, MEDIA, ...) — see
// components/badges/appreciation-certificate-pdf.tsx and
// lib/badges/appreciations.ts for why this is separate from the exam-award
// certificate pipeline (lib/badges/render-certificates-pdf.ts).
//
// Usage: tsx scripts/generate-appreciation-certificate.ts <cardNo> [roleLabel]
//   tsx scripts/generate-appreciation-certificate.ts TJK-R-001 "Country Representative"
// roleLabel defaults to "Country Representative" when omitted.
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { eventBadges, eventBadgeAppreciations } from "@/lib/db/schema";
import {
  AppreciationCertificatePDF,
  appreciationCertificateSerial,
  type AppreciationCertificateData,
} from "@/components/badges/appreciation-certificate-pdf";

function verifyUrlFor(code: string): string {
  const base = (
    process.env.CERT_VERIFY_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://gate-assessment.org"
  ).replace(/\/+$/, "");
  return `${base}/verify/${code}`;
}

async function main() {
  const [, , argCardNo, argRoleLabel] = process.argv;
  const badgeCode = (argCardNo ?? "TJK-R-001").toUpperCase();
  const roleLabel = argRoleLabel ?? "Country Representative";

  const [badge] = await db
    .select()
    .from(eventBadges)
    .where(eq(eventBadges.cardNo, badgeCode))
    .limit(1);
  if (!badge) {
    throw new Error(`No event_badges row with card_no "${badgeCode}"`);
  }

  const [appreciation] = await db
    .insert(eventBadgeAppreciations)
    .values({ eventBadgeId: badge.id, roleLabel })
    .onConflictDoUpdate({
      target: eventBadgeAppreciations.eventBadgeId,
      set: { roleLabel },
    })
    .returning();

  const serial = appreciationCertificateSerial(appreciation.id);

  const data: AppreciationCertificateData = {
    fullName: badge.fullName,
    country: badge.country,
    roleLabel,
    badgeCode: badge.cardNo,
    serial,
    qrDataUrl: await QRCode.toDataURL(verifyUrlFor(badge.cardNo), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
    }),
  };

  const buffer = await renderToBuffer(AppreciationCertificatePDF(data));

  const outDir = path.join(process.cwd(), "results", "certificates");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `appreciation-${badge.cardNo}.pdf`);
  fs.writeFileSync(outPath, buffer);
  console.log(`Wrote ${outPath} (serial ${serial})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
