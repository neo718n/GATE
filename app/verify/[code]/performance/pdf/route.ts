import { NextResponse } from "next/server";
import { formatBadgeCode, lookupRawBadgeByCode } from "@/lib/badges/lookup";
import { lookupExamResultsForBadge, sanitizeResult } from "@/lib/badges/results";
import { isBadgeVerifyEnabled } from "@/lib/badges/verify-flow";
import { renderDiagnosticReportPdf } from "@/lib/badges/render-diagnostic-pdf";

export const runtime = "nodejs";

// Same gates as app/verify/[code]/performance/page.tsx — the PDF is only
// available when the on-screen report is.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const canonical = formatBadgeCode(decodeURIComponent(code));

  if (!(await isBadgeVerifyEnabled())) {
    return NextResponse.json({ error: "Verification is temporarily disabled" }, { status: 503 });
  }

  const badge = await lookupRawBadgeByCode(canonical);
  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  const results = (await lookupExamResultsForBadge(badge.id))
    .map(sanitizeResult)
    .filter((r) => r.performanceReady);
  if (results.length === 0) {
    return NextResponse.json({ error: "Report not available yet" }, { status: 404 });
  }

  const pdf = await renderDiagnosticReportPdf(badge, results);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="GATE-Diagnostic-Report-${badge.cardNo}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
