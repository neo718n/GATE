import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { certificateVerifications } from "@/lib/db/schema";

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  await requireRole(["admin", "super_admin"]);

  const rows = await db
    .select()
    .from(certificateVerifications)
    .orderBy(desc(certificateVerifications.verifiedAt))
    .limit(10_000);

  const header =
    "id,certificate_id,attempted_code,verified_at,ip_hash,country_code,user_agent_class,result_status";
  const body = rows
    .map((r) =>
      [
        r.id,
        r.certificateId ?? "",
        r.attemptedCode,
        r.verifiedAt.toISOString(),
        r.ipHash,
        r.countryCode ?? "",
        r.userAgentClass,
        r.resultStatus,
      ]
        .map(csvEscape)
        .join(","),
    )
    .join("\n");

  const csv = `${header}\n${body}\n`;
  const filename = `gate-verifications-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
