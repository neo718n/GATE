import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { verifyPartnerApiKey } from "@/lib/partner/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET(req: Request) {
  const partner = await verifyPartnerApiKey(req);
  if (!partner) {
    return NextResponse.json(
      { error: "Invalid or missing X-API-Key header" },
      { status: 401, headers: NO_STORE },
    );
  }
  const rl = checkRateLimit(`partner-api:${partner.clientId}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { ...NO_STORE, "Retry-After": "60" } },
    );
  }

  // Explicit columns only — never expose questions / correctAnswer.
  const rows = await db
    .select({
      id: exams.id,
      title: exams.title,
      type: exams.type,
      durationMinutes: exams.durationMinutes,
      questionsPerSession: exams.questionsPerSession,
      windowStart: exams.windowStart,
      windowEnd: exams.windowEnd,
      targetGrades: exams.targetGrades,
      published: exams.published,
    })
    .from(exams)
    .where(eq(exams.createdByPartnerId, partner.id))
    .orderBy(desc(exams.createdAt));

  return NextResponse.json(
    {
      exams: rows.map((e) => ({
        exam_ref: e.id,
        title: e.title,
        type: e.type,
        duration_minutes: e.durationMinutes,
        questions_per_session: e.questionsPerSession,
        window_start: e.windowStart,
        window_end: e.windowEnd,
        target_grades: e.targetGrades,
        published: e.published,
      })),
    },
    { headers: NO_STORE },
  );
}
