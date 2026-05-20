import { and, desc, eq } from "drizzle-orm";
import { requirePartnerStaff } from "@/lib/authz";
import { db } from "@/lib/db";
import { examSessions, exams, partnerParticipants } from "@/lib/db/schema";

export const metadata = { title: "Results" };

const STATUS_COLOR: Record<string, string> = {
  submitted: "text-green-700 dark:text-green-400",
  active: "text-amber-600 dark:text-amber-400",
  timed_out: "text-red-600 dark:text-red-400",
};

function fmt(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PartnerResultsPage() {
  const { partnerId } = await requirePartnerStaff();

  const rows = await db
    .select({
      id: examSessions.id,
      examTitle: exams.title,
      status: examSessions.status,
      score: examSessions.score,
      startedAt: examSessions.startedAt,
      submittedAt: examSessions.submittedAt,
      assignment: examSessions.externalAssignmentId,
      tabSwitches: examSessions.tabSwitchCount,
      copyAttempts: examSessions.copyAttempts,
      externalUserId: partnerParticipants.externalUserId,
    })
    .from(examSessions)
    .leftJoin(exams, eq(examSessions.examId, exams.id))
    .leftJoin(
      partnerParticipants,
      and(
        eq(partnerParticipants.participantId, examSessions.participantId),
        eq(partnerParticipants.partnerId, partnerId),
      ),
    )
    .where(eq(examSessions.partnerId, partnerId))
    .orderBy(desc(examSessions.startedAt))
    .limit(200);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-4xl font-light text-foreground">
          Results
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          Sessions launched from your platform. Scores update after auto-grading
          (and after any open questions are graded).
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm font-light text-muted-foreground">
          No sessions yet.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[1.3fr_1.3fr_1fr_0.7fr_1fr_1.2fr] gap-4 bg-muted/30 px-5 py-3">
            {["Student", "Exam", "Status", "Score", "Proctor", "Submitted"].map(
              (h, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50"
                >
                  {h}
                </span>
              ),
            )}
          </div>
          {rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[1.3fr_1.3fr_1fr_0.7fr_1fr_1.2fr] items-center gap-4 px-5 py-3 text-sm"
            >
              <span className="truncate font-mono text-xs text-muted-foreground">
                {r.externalUserId ?? "—"}
              </span>
              <span className="truncate font-light text-foreground">
                {r.examTitle ?? "—"}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${STATUS_COLOR[r.status] ?? ""}`}
              >
                {r.status}
              </span>
              <span className="font-light text-foreground">
                {r.score != null ? `${Math.round(Number(r.score))}%` : "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                {r.tabSwitches > 0 || (r.copyAttempts ?? 0) > 0
                  ? `⚑ ${r.tabSwitches} tab${r.copyAttempts ? ` · ${r.copyAttempts} copy` : ""}`
                  : "ok"}
              </span>
              <span className="text-xs font-light text-muted-foreground">
                {fmt(r.submittedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
