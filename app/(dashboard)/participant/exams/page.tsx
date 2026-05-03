import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, examSessions, participants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function fmtDate(d: Date | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ParticipantExamsPage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  const published = await db.query.exams.findMany({
    where: eq(exams.published, true),
    with: { subject: true, round: true },
  });

  const now = new Date();
  const available = published.filter((e) => {
    if (e.windowStart && now < e.windowStart) return false;
    if (e.windowEnd && now > e.windowEnd) return false;
    return true;
  });
  const upcoming = published.filter((e) => e.windowStart && now < e.windowStart);
  const past = published.filter((e) => e.windowEnd && now > e.windowEnd);

  const mySessionsRaw = participant
    ? await db.query.examSessions.findMany({
        where: eq(examSessions.participantId, participant.id),
      })
    : [];
  const mySessionMap = new Map(mySessionsRaw.map((s) => [s.examId, s]));

  const ExamCard = ({ e }: { e: (typeof published)[0] }) => {
    const mySession = mySessionMap.get(e.id);
    const status = mySession?.status;

    return (
      <div className="flex items-center justify-between gap-4 px-5 py-5 border border-border bg-card">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-semibold uppercase tracking-[0.2em] ${e.type === "practice" ? "text-blue-500" : "text-gate-gold"}`}>
              {e.type}
            </span>
            {e.subject && (
              <>
                <span className="text-foreground/20">·</span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground/40">{e.subject.name}</span>
              </>
            )}
          </div>
          <p className="text-sm font-light text-foreground">{e.title}</p>
          <div className="flex items-center gap-3 text-xs font-light text-foreground/50 flex-wrap">
            {e.durationMinutes && <span>{e.durationMinutes} min</span>}
            {e.windowStart && <span>Opens {fmtDate(e.windowStart)}</span>}
            {e.windowEnd && <span>Closes {fmtDate(e.windowEnd)}</span>}
          </div>
        </div>

        <div className="shrink-0">
          {status === "submitted" && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-600">Completed</span>
          )}
          {status === "timed_out" && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-destructive">Timed out</span>
          )}
          {status === "active" && (
            <Link href={`/participant/exams/${e.id}/take`}>
              <Button variant="gold" size="sm">Resume</Button>
            </Link>
          )}
          {!status && (
            <Link href={`/participant/exams/${e.id}`}>
              <Button variant="gold" size="sm">Start</Button>
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">My Exams</span>
        <h1 className="font-serif text-4xl font-light text-foreground">Exams & Practice</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Official exams and practice tests assigned to your cycle.
        </p>
      </div>

      {available.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">Available Now</p>
          <div className="flex flex-col gap-2">
            {available.map((e) => <ExamCard key={e.id} e={e} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">Upcoming</p>
          <div className="flex flex-col gap-2">
            {upcoming.map((e) => <ExamCard key={e.id} e={e} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">Past</p>
          <div className="flex flex-col gap-2">
            {past.map((e) => <ExamCard key={e.id} e={e} />)}
          </div>
        </section>
      )}

      {published.length === 0 && (
        <div className="border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm font-light text-foreground/40">No exams available yet.</p>
        </div>
      )}
    </div>
  );
}
