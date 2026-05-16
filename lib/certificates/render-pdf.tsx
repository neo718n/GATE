import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { CertificatePDF } from "@/components/certificate-pdf";
import { db } from "@/lib/db";
import { certificates } from "@/lib/db/schema";
import { r2, BUCKET } from "@/lib/r2";

const AWARD_LABELS: Record<string, string> = {
  gold: "Gold Medal",
  silver: "Silver Medal",
  bronze: "Bronze Medal",
  honorable_mention: "Honorable Mention",
  participation: "Participation",
};

export function verifyUrlFor(code: string): string {
  const base = (
    process.env.CERT_VERIFY_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://gate-assessment.org"
  ).replace(/\/+$/, "");
  return `${base}/verify/${code}`;
}

export async function renderCertificatePdf({
  certificateId,
}: {
  certificateId: number;
}): Promise<{ key: string; buffer: Buffer }> {
  const [cert] = await db
    .select()
    .from(certificates)
    .where(eq(certificates.id, certificateId))
    .limit(1);
  if (!cert) throw new Error(`Certificate ${certificateId} not found`);

  const verifyUrl = verifyUrlFor(cert.verificationCode);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
  });

  const buffer = await renderToBuffer(
    <CertificatePDF
      participantName={cert.participantName}
      subjectName={cert.subjectName}
      awardLabel={AWARD_LABELS[cert.award] ?? cert.award}
      cycleYear={cert.cycleYear}
      issuedAtIso={cert.issuedAt.toISOString()}
      verificationCode={cert.verificationCode}
      qrDataUrl={qrDataUrl}
      verifyUrl={verifyUrl}
    />,
  );

  const key = `certificates/cert-${cert.id}.pdf`;
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="GATE-${cert.cycleYear}-${cert.subjectCode}-${cert.verificationCode.split("-").pop()}.pdf"`,
    }),
  );

  await db
    .update(certificates)
    .set({ pdfKey: key })
    .where(eq(certificates.id, cert.id));

  return { key, buffer };
}
