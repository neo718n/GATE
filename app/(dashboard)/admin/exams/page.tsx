import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, questions, examSessions } from "@/lib/db/schema";
import { desc, count, eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 30;

const TYPE_COLOR: Record<string, string> = {
  exam: "text-gate-gold",
  practice: "text-blue-500",
};

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRole(["admin", "super_admin"]);

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);

  const [totalResult, rows, questionCounts, sessionCounts] = await Promise.all([
    db.select({ count: count() }).from(exams),
    db.query.exams.findMany({
      orderBy: desc(exams.createdAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      with: { subject: true, round: true },
    }),
    db.select({ examId: questions.examId, count: count() })
      .from(questions)
      .groupBy(questions.examId),
    db.select({ examId: examSessions.examId, count: count() })
      .from(examSessions)
      .groupBy(examSessions.examId),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const qCountMap = new Map(questionCounts.map((r) => [r.examId, r.count]));
  const sCountMap = new Map(sessionCounts.map((r) => [r.examId, r.count]));

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/exams${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Admin</span>
          <h1 className="font-serif text-4xl font-light text-foreground">Online Exams</h1>
          <p className="text-sm font-light text-foreground/60">{total} total</p>
        </div>
        <Link href="/admin/exams/new">
          <Button variant="gold" size="sm">+ New Exam</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
        <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr_80px_80px_100px] gap-4 px-5 py-3 bg-muted/30">
          {["Title", "Type", "Subject", "Round", "Questions", "Sessions", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">{h}</span>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">
            No exams yet. Create your first exam.
          </p>
        )}

        {rows.map((e) => (
          <div key={e.id} className="grid grid-cols-[2fr_1fr_1.2fr_1fr_80px_80px_100px] gap-4 px-5 py-4 items-center">
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm font-light text-foreground truncate">{e.title}</p>
              {!e.published && (
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/35">Draft</span>
              )}
              {e.published && (
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-green-600">Published</span>
              )}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${TYPE_COLOR[e.type]}`}>
              {e.type}
            </span>
            <p className="text-xs font-light text-foreground/60 truncate">{e.subject?.name ?? "—"}</p>
            <p className="text-xs font-light text-foreground/60 truncate">{e.round?.name ?? "—"}</p>
            <p className="text-xs font-light text-foreground/70">{qCountMap.get(e.id) ?? 0}</p>
            <p className="text-xs font-light text-foreground/70">{sCountMap.get(e.id) ?? 0}</p>
            <Link href={`/admin/exams/${e.id}`}>
              <Button variant="outline" size="sm" className="text-xs">Manage</Button>
            </Link>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-light text-foreground/50">
            Page {page} of {totalPages} &mdash; showing {rows.length} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl(page - 1)}
                className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] border border-border text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl(page + 1)}
                className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] border border-border text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
