import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { certificates } from "@/lib/db/schema";
import { renderCertificatePdf } from "@/lib/certificates/render-pdf";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;
  const certId = Number(id);
  if (!Number.isFinite(certId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const [cert] = await db
    .select()
    .from(certificates)
    .where(eq(certificates.id, certId))
    .limit(1);
  if (!cert) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
