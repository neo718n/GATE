import Link from "next/link";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  lt,
  ne,
  or,
  type SQL,
} from "drizzle-orm";
import { requirePartnerStaff } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, questions, subjects } from "@/lib/db/schema";
import { PoolBrowser } from "@/components/partner/pool-browser";

export const metadata = { title: "Question pool" };

const PAGE_SIZE = 30;
const TYPES = ["mcq", "numeric", "open"] as const;

export default async function PartnerPoolPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    subject?: string;
    page?: string;
  }>;
}) {
  const { partnerId } = await requirePartnerStaff();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const typeFilter = TYPES.includes(sp.type as (typeof TYPES)[number])
    ? (sp.type as (typeof TYPES)[number])
    : "";
  const subjectId = sp.subject ? Number(sp.subject) : null;
  const page = Math.max(1, Number(sp.page) || 1);

  // Safeguard: hide questions of currently-live official GATE exams (so live
  // competition answers don't leak). Available = practice OR unpublished OR
  // official whose window has already ended.
  const available = or(
    ne(exams.type, "exam"),
    eq(exams.published, false),
    and(isNotNull(exams.windowEnd), lt(exams.windowEnd, new Date())),
  );

  const conds: (SQL | undefined)[] = [available];
  if (typeFilter) conds.push(eq(questions.type, typeFilter));
  if (subjectId && Number.isInteger(subjectId)) {
    conds.push(eq(exams.subjectId, subjectId));
  }
  if (q) conds.push(ilike(questions.content, `%${q}%`));
  const where = and(...conds);

  const [rows, totalRow, partnerExams, subjectList] = await Promise.all([
    db
      .select({
        id: questions.id,
        content: questions.content,
        type: questions.type,
        points: questions.points,
        difficulty: questions.difficulty,
        examTitle: exams.title,
        subjectName: subjects.name,
      })
      .from(questions)
      .innerJoin(exams, eq(questions.examId, exams.id))
      .leftJoin(subjects, eq(exams.subjectId, subjects.id))
      .where(where)
      .orderBy(desc(questions.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(questions)
      .innerJoin(exams, eq(questions.examId, exams.id))
      .where(where),
    db
      .select({ id: exams.id, title: exams.title })
      .from(exams)
      .where(eq(exams.createdByPartnerId, partnerId))
      .orderBy(desc(exams.createdAt)),
    db
      .select({ id: subjects.id, name: subjects.name })
      .from(subjects)
      .where(eq(subjects.active, true))
      .orderBy(asc(subjects.order)),
  ]);

  const total = Number(totalRow[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (typeFilter) params.set("type", typeFilter);
    if (subjectId) params.set("subject", String(subjectId));
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/examPartner/pool${qs ? `?${qs}` : ""}`;
  };

  const inputClass =
    "h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-gate-gold focus:outline-none";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-4xl font-light text-foreground">
          Question pool
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          Browse the shared question bank, then add selected questions to one of
          your exams. {total} questions available.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3" method="get">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="q" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="fractions…"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="type" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
            Type
          </label>
          <select id="type" name="type" defaultValue={typeFilter} className={inputClass}>
            <option value="">All</option>
            <option value="mcq">MCQ</option>
            <option value="numeric">Numeric</option>
            <option value="open">Open</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="subject" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            defaultValue={subjectId ? String(subjectId) : ""}
            className={inputClass}
          >
            <option value="">All</option>
            {subjectList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-10 rounded-lg bg-gate-gold px-4 text-xs font-semibold uppercase tracking-[0.15em] text-gate-800 hover:bg-gate-gold-2"
        >
          Filter
        </button>
      </form>

      <PoolBrowser questions={rows} partnerExams={partnerExams} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildUrl(page - 1)} className="text-gate-gold hover:underline">
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl(page + 1)} className="text-gate-gold hover:underline">
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
