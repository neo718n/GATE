import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { requirePartnerStaff } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, questions } from "@/lib/db/schema";
import { NewExamForm } from "@/components/partner/new-exam-form";

export const metadata = { title: "Exams" };

export default async function PartnerExamsPage() {
  const { partnerId } = await requirePartnerStaff();

  const rows = await db
    .select()
    .from(exams)
    .where(eq(exams.createdByPartnerId, partnerId))
    .orderBy(desc(exams.createdAt));

  const qCounts = await db
    .select({ examId: questions.examId, c: count() })
    .from(questions)
    .groupBy(questions.examId);
  const qMap = new Map(qCounts.map((r) => [r.examId, Number(r.c)]));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-4xl font-light text-foreground">
            Exams
          </h1>
          <p className="text-sm font-light text-muted-foreground">
            Build exams and launch them from your platform using the exam ID +
            shared secret.
          </p>
        </div>
        <NewExamForm />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm font-light text-muted-foreground">
          No exams yet. Create one to get started.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[2fr_0.8fr_0.8fr_0.8fr_70px] gap-4 bg-muted/30 px-5 py-3">
            {["Title", "ID", "Questions", "Status", ""].map((h, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50"
              >
                {h}
              </span>
            ))}
          </div>
          {rows.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-[2fr_0.8fr_0.8fr_0.8fr_70px] items-center gap-4 px-5 py-4"
            >
              <span className="truncate font-light text-foreground">
                {e.title}
              </span>
              <code className="font-mono text-xs text-muted-foreground">
                #{e.id}
              </code>
              <span className="text-sm font-light text-foreground">
                {qMap.get(e.id) ?? 0}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  e.published
                    ? "text-green-700 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {e.published ? "Live" : "Draft"}
              </span>
              <Link
                href={`/examPartner/exams/${e.id}`}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-gate-gold hover:underline"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
