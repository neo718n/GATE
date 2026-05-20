import Link from "next/link";
import { and, avg, count, desc, eq } from "drizzle-orm";
import { requirePartnerStaff } from "@/lib/authz";
import { db } from "@/lib/db";
import { examSessions, exams, partnerParticipants } from "@/lib/db/schema";

export const metadata = { title: "Dashboard" };

const STATUS_COLOR: Record<string, string> = {
  submitted: "text-green-700 dark:text-green-400",
  active: "text-amber-600 dark:text-amber-400",
  timed_out: "text-red-600 dark:text-red-400",
};

function timeAgo(d: Date | null): string {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function PartnerDashboard() {
  const { partnerId } = await requirePartnerStaff();

  const [examAgg] = await db
    .select({ c: count() })
    .from(exams)
    .where(eq(exams.createdByPartnerId, partnerId));

  const [sessAgg] = await db
    .select({ c: count() })
    .from(examSessions)
    .where(eq(examSessions.partnerId, partnerId));

  const [doneAgg] = await db
    .select({ c: count(), avgScore: avg(examSessions.score) })
    .from(examSessions)
    .where(
      and(
        eq(examSessions.partnerId, partnerId),
        eq(examSessions.status, "submitted"),
      ),
    );

  const recent = await db
    .select({
      id: examSessions.id,
      examTitle: exams.title,
      status: examSessions.status,
      score: examSessions.score,
      startedAt: examSessions.startedAt,
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
    .limit(8);

  const avgScore = doneAgg?.avgScore
    ? `${Math.round(Number(doneAgg.avgScore))}%`
    : "—";

  const tiles = [
    { label: "Exams", value: examAgg?.c ?? 0 },
    { label: "Launches", value: sessAgg?.c ?? 0 },
    { label: "Completed", value: doneAgg?.c ?? 0 },
    { label: "Avg. score", value: avgScore },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl font-light text-foreground">
          Dashboard
        </h1>
        <Link
          href="/examPartner/exams"
          className="text-xs font-semibold uppercase tracking-[0.15em] text-gate-gold hover:underline"
        >
          Manage exams →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {t.label}
            </span>
            <span className="font-serif text-3xl font-light text-foreground">
              {t.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Recent launches
        </h2>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm font-light text-muted-foreground">
            No launches yet. Build an exam and launch it from your platform.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {recent.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1.5fr_1.5fr_1fr_0.7fr_0.8fr] items-center gap-4 px-5 py-3 text-sm"
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
                <span className="text-right text-xs font-light text-muted-foreground">
                  {timeAgo(r.startedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
