import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, examSessions, participants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StartExamButton } from "./start-exam-button";

export default async function PreExamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const { id } = await params;
  const examId = parseInt(id);

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: { subject: true, questions: true },
  });
  if (!exam || !exam.published) notFound();

  const now = new Date();
  if (exam.windowStart && now < exam.windowStart) {
    return (
      <div className="flex flex-col gap-4 max-w-xl">
        <h1 className="font-serif text-3xl font-light">{exam.title}</h1>
        <p className="text-sm font-light text-foreground/60">
          This exam opens on {new Date(exam.windowStart).toLocaleString()}.
        </p>
        <Link href="/participant/exams"><Button variant="outline" size="sm">Back</Button></Link>
      </div>
    );
  }
  if (exam.windowEnd && now > exam.windowEnd) {
    return (
      <div className="flex flex-col gap-4 max-w-xl">
        <h1 className="font-serif text-3xl font-light">{exam.title}</h1>
        <p className="text-sm font-light text-foreground/60">This exam window has closed.</p>
        <Link href="/participant/exams"><Button variant="outline" size="sm">Back</Button></Link>
      </div>
    );
  }

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  const existing = participant
    ? await db.query.examSessions.findFirst({
        where: and(
          eq(examSessions.examId, examId),
          eq(examSessions.participantId, participant.id),
        ),
      })
    : null;

  if (existing?.status === "active") redirect(`/participant/exams/${examId}/take`);
  if (existing?.status === "submitted" || existing?.status === "timed_out") {
    return (
      <div className="flex flex-col gap-4 max-w-xl">
        <h1 className="font-serif text-3xl font-light">{exam.title}</h1>
        <p className="text-sm font-light text-foreground/60">
          You have already completed this exam.
        </p>
        <Link href="/participant/exams"><Button variant="outline" size="sm">Back to Exams</Button></Link>
      </div>
    );
  }

  const questionCount = exam.questionsPerSession
    ? Math.min(exam.questionsPerSession, exam.questions.length)
    : exam.questions.length;

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          {exam.subject?.name ?? exam.type}
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">{exam.title}</h1>
      </div>

      {/* Exam info */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Questions", value: String(questionCount) },
          { label: "Duration", value: exam.durationMinutes ? `${exam.durationMinutes} min` : "Unlimited" },
          { label: "Type", value: exam.type === "practice" ? "Practice" : "Official Exam" },
          { label: "Attempts", value: exam.type === "practice" ? "Unlimited" : "1 attempt" },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border bg-card px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40">{label}</p>
            <p className="text-sm font-light text-foreground mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">Instructions</p>
        <div className="border border-border bg-card px-5 py-4 flex flex-col gap-2">
          {exam.instructions ? (
            <p className="text-sm font-light text-foreground/80 leading-relaxed whitespace-pre-wrap">{exam.instructions}</p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm font-light text-foreground/70">
              <li>· Answer all questions to the best of your ability.</li>
              <li>· You can flag questions and return to them later.</li>
              {exam.durationMinutes && <li>· The exam will auto-submit when time runs out.</li>}
              <li>· Your progress is saved automatically every 30 seconds.</li>
              {exam.type === "exam" && <li>· Switching tabs will be logged.</li>}
            </ul>
          )}
        </div>
      </div>

      {!participant && (
        <div className="border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-light text-destructive/80">
            Complete your participant profile before taking an exam.
          </p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <StartExamButton examId={examId} disabled={!participant} />
        <Link href="/participant/exams">
          <Button variant="outline" size="md">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}
