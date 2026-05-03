import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TYPE_COLOR: Record<string, string> = {
  exam: "text-gate-gold",
  practice: "text-blue-500",
};

export default async function ExamsPage() {
  await requireRole(["admin", "super_admin"]);

  const all = await db.query.exams.findMany({
    orderBy: desc(exams.createdAt),
    with: { subject: true, round: true, questions: true, sessions: true },
  });

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Admin</span>
          <h1 className="font-serif text-4xl font-light text-foreground">Online Exams</h1>
          <p className="text-sm font-light text-foreground/60">{all.length} total</p>
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

        {all.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">
            No exams yet. Create your first exam.
          </p>
        )}

        {all.map((e) => (
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
            <p className="text-xs font-light text-foreground/70">{e.questions.length}</p>
            <p className="text-xs font-light text-foreground/70">{e.sessions.length}</p>
            <Link href={`/admin/exams/${e.id}`}>
              <Button variant="outline" size="sm" className="text-xs">Manage</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
