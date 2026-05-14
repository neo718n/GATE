import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { results, participants, subjects, cycles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ResultsForm } from "./results-form";

export default async function ResultsPage() {
  await requireRole(["admin", "super_admin"]);

  const [allResults, allParticipants, allSubjects, allCycles] = await Promise.all([
    db.query.results.findMany({
      with: { participant: true, subject: true, cycle: true, round: true },
      orderBy: desc(results.publishedAt),
    }),
    db.query.participants.findMany({ orderBy: participants.fullName }),
    db.query.subjects.findMany({ orderBy: subjects.order }),
    db.query.cycles.findMany({
      with: { rounds: { orderBy: (r, { asc }) => [asc(r.order)] } },
      orderBy: desc(cycles.year),
    }),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Results</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Input and publish examination results.
        </p>
      </div>

      <details className="border border-border bg-card">
        <summary className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground cursor-pointer hover:bg-muted/30 transition-colors list-none">
          + Add Result
        </summary>
        <ResultsForm
          allParticipants={allParticipants}
          allSubjects={allSubjects}
          allCycles={allCycles as any}
        />
      </details>

      {allResults.length === 0 ? (
        <div className="border border-border bg-muted/30 p-8 text-center">
          <p className="text-sm font-light text-foreground/60">No results yet. Add one above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px_80px_100px] gap-3 px-5 py-3 bg-muted/30">
            {["Participant", "Subject", "Cycle", "Round", "Score", "Rank", "Award"].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
                {h}
              </span>
            ))}
          </div>
          {(allResults as any[]).map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_80px_80px_100px] gap-3 px-5 py-3 items-center"
            >
              <p className="text-sm font-light text-foreground truncate">
                {r.participant?.fullName ?? "—"}
              </p>
              <p className="text-xs font-light text-foreground/70">{r.subject?.name ?? "—"}</p>
              <p className="text-xs font-light text-foreground/70">{r.cycle?.name ?? "—"}</p>
              <p className="text-xs font-light text-foreground/70">{r.round?.name ?? "—"}</p>
              <p className="text-xs font-light text-foreground">
                {r.score !== null ? `${r.score}${r.maxScore ? `/${r.maxScore}` : ""}` : "—"}
              </p>
              <p className="text-xs font-light text-foreground">
                {r.rank !== null ? `#${r.rank}` : "—"}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gate-gold">
                {r.award ? r.award.replace("_", " ") : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
