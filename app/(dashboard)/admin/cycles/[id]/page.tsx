import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, results } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CycleParticipantsManager } from "./cycle-participants-manager";

export default async function CycleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["super_admin", "admin"]);

  const { id: idStr } = await params;
  const cycleId = parseInt(idStr);
  if (!cycleId) notFound();

  const cycle = await db.query.cycles.findFirst({
    where: (c, { eq }) => eq(c.id, cycleId),
    with: {
      rounds: { orderBy: (r, { asc }) => [asc(r.order)] },
      subjects: { with: { subject: true } },
    },
  });

  if (!cycle) notFound();

  const participantList = await db.query.participants.findMany({
    where: eq(participants.cycleId, cycleId),
    with: {
      user: true,
      subjects: { with: { subject: true } },
      results: {
        where: eq(results.cycleId, cycleId),
        with: { subject: true, round: true },
      },
    },
    orderBy: (p, { asc }) => [asc(p.fullName)],
  });

  const cycleSubjects = cycle.subjects
    .map((cs) => cs.subject)
    .filter(Boolean) as { id: number; name: string }[];

  return (
    <div className="flex flex-col gap-8 max-w-7xl">
      <div className="flex flex-col gap-1.5">
        <Link
          href="/admin/cycles"
          className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/40 hover:text-gate-gold transition-colors"
        >
          ← Cycles
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold mt-2">
          {cycle.year}
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">{cycle.name}</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          {participantList.length} participant{participantList.length !== 1 ? "s" : ""} ·{" "}
          {cycle.rounds.length} round{cycle.rounds.length !== 1 ? "s" : ""} ·{" "}
          <span className="capitalize text-gate-gold/80">{cycle.status.replace(/_/g, " ")}</span>
        </p>
      </div>

      <CycleParticipantsManager
        participants={participantList as any}
        rounds={cycle.rounds}
        cycleId={cycleId}
        cycleSubjects={cycleSubjects}
      />
    </div>
  );
}
