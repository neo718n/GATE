import { NextResponse } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { examSessions, partnerParticipants } from "@/lib/db/schema";
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

  const url = new URL(req.url);
  const sinceRaw = url.searchParams.get("since");
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? "50") || 50, 1),
    200,
  );

  const conds = [eq(examSessions.partnerId, partner.id)];
  if (sinceRaw) {
    const since = new Date(sinceRaw);
    if (!Number.isNaN(since.getTime())) {
      conds.push(gt(examSessions.submittedAt, since));
    }
  }

  const rows = await db
    .select({
      id: examSessions.id,
      examRef: examSessions.examId,
      assignment: examSessions.externalAssignmentId,
      status: examSessions.status,
      score: examSessions.score,
      submittedAt: examSessions.submittedAt,
      externalUserId: partnerParticipants.externalUserId,
    })
    .from(examSessions)
    .leftJoin(
      partnerParticipants,
      and(
        eq(partnerParticipants.participantId, examSessions.participantId),
        eq(partnerParticipants.partnerId, partner.id),
      ),
    )
    .where(and(...conds))
    .orderBy(desc(examSessions.submittedAt))
    .limit(limit);

  return NextResponse.json(
    {
      results: rows.map((r) => ({
        session_id: r.id,
        exam_ref: r.examRef,
        external_user_id: r.externalUserId,
        external_assignment_id: r.assignment,
        status: r.status,
        score: r.score != null ? Number(r.score) : null,
        max_score: 100,
        submitted_at: r.submittedAt,
      })),
    },
    { headers: NO_STORE },
  );
}
