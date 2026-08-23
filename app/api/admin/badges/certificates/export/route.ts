import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { renderCertificateSheetPdf } from "@/lib/badges/render-certificates-pdf";

export async function GET(request: Request) {
  await requireRole(["admin", "super_admin"]);

  // ?cards=UZB-C-013,UZB-C-022 limits the sheet to those badges — for
  // category-by-category re-grading review batches instead of everyone.
  const cardsParam = new URL(request.url).searchParams.get("cards");
  const cardNos = cardsParam
    ? cardsParam.split(",").map((c) => c.trim()).filter(Boolean)
    : undefined;

  const buffer = await renderCertificateSheetPdf(cardNos);
  const filename = cardNos
    ? `china-camp-2026-certificates-${cardNos.length}.pdf`
    : "china-camp-2026-certificates.pdf";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
