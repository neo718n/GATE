import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { examSessions, partnerParticipants } from "@/lib/db/schema";
import { verifyPartnerApiKey } from "@/lib/partner/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const sessionId = Number(id);
  if (!Number.isInteger(sessionId)) {
    return NextResponse.json(
      { error: "Invalid session id" },
      { status: 400, headers: NO_STORE },
    );
  }

  const [s] = await db
    .select({
      id: examSessions.id,
      examRef: examSessions.examId,
      assignment: examSessions.externalAssignmentId,
      status: examSessions.status,
      score: examSessions.score,
      startedAt: examSessions.startedAt,
      submittedAt: examSessions.submittedAt,
      tabSwitches: examSessions.tabSwitchCount,
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
    .where(
      and(
        eq(examSessions.id, sessionId),
        eq(examSessions.partnerId, partner.id),
      ),
    )
    .limit(1);

  if (!s) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: NO_STORE },
    );
  }

  return NextResponse.json(
    {
      session_id: s.id,
      exam_ref: s.examRef,
      external_user_id: s.externalUserId,
      external_assignment_id: s.assignment,
      status: s.status,
      score: s.score != null ? Number(s.score) : null,
      max_score: 100,
      started_at: s.startedAt,
      submitted_at: s.submittedAt,
      tab_switches: s.tabSwitches,
    },
    { headers: NO_STORE },
  );
}
