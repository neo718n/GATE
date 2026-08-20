import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { renderBadgeSheetPdf } from "@/lib/badges/render-pdf";

export async function GET() {
  await requireRole(["admin", "super_admin"]);

  const buffer = await renderBadgeSheetPdf();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="china-camp-2026-badges.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
