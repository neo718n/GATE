import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { certificates, participants, results } from "@/lib/db/schema";
import { renderCertificatePdf } from "@/lib/certificates/render-pdf";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const { id } = await params;
  const certId = Number(id);
  if (!Number.isFinite(certId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const rows = await db
    .select({
      id: certificates.id,
      pdfKey: certificates.pdfKey,
      cycleYear: certificates.cycleYear,
      subjectCode: certificates.subjectCode,
      verificationCode: certificates.verificationCode,
      participantUserId: participants.userId,
    })
    .from(certificates)
    .innerJoin(results, eq(results.id, certificates.resultId))
    .innerJoin(participants, eq(participants.id, results.participantId))
    .where(eq(certificates.id, certId))
    .limit(1);

  const cert = rows[0];
  if (!cert) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = (session.user as { role?: string }).role ?? "participant";
  const isOwner = cert.participantUserId === session.user.id;
  const isStaff = role === "admin" || role === "super_admin";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let key = cert.pdfKey;
  if (!key) {
    const rendered = await renderCertificatePdf({ certificateId: certId });
    key = rendered.key;
  }

  const filename = `GATE-${cert.cycleYear}-${cert.subjectCode}-${cert.verificationCode.split("-").pop()}.pdf`;
  const url = await getPresignedDownloadUrl(key, 600, filename);
  return NextResponse.redirect(url);
}
