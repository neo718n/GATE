import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function QpExamsPage() {
  await requireRole("question_provider");

  const allExams = await db.query.exams.findMany({
    orderBy: desc(exams.createdAt),
    with: {
      questions: { columns: { id: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Question Provider · Exams
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Exams</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Select an exam to add or edit questions.
        </p>
      </div>

      <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 bg-muted/30">
          {["Title", "Type", "Subject", "Questions", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">{h}</span>
          ))}
        </div>

        {allExams.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">
            No exams available yet. Ask an admin to create one.
          </p>
        )}

        {allExams.map((exam) => (
          <div key={exam.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center">
            <div className="min-w-0">
              <p className="text-sm font-light text-foreground truncate">{exam.title}</p>
              {exam.published && (
                <span className="text-[9px] font-semibold uppercase tracking-widest text-green-600">Published</span>
              )}
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
              {exam.type}
            </span>
            <p className="text-xs font-light text-foreground/50">
              {exam.subjectId ? `#${exam.subjectId}` : "—"}
            </p>
            <p className="text-sm font-light text-foreground">
              {exam.questions.length}
            </p>
            <Link
              href={`/qp/exams/${exam.id}`}
              className="text-xs text-gate-gold hover:underline"
            >
              Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
