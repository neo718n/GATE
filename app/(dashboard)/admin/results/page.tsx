import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { results, participants, subjects, cycles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addResult } from "@/lib/actions/admin";

export default async function ResultsPage() {
  await requireRole(["admin", "super_admin"]);

  const [allResults, allParticipants, allSubjects, allCycles] = await Promise.all([
    db.query.results.findMany({
      with: { participant: true, subject: true, cycle: true },
      orderBy: desc(results.publishedAt),
    }),
    db.query.participants.findMany({ orderBy: participants.fullName }),
    db.query.subjects.findMany({ orderBy: subjects.order }),
    db.query.cycles.findMany({ orderBy: desc(cycles.year) }),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Results</h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">
          Input and publish examination results.
        </p>
      </div>

      <details className="border border-gate-fog bg-white">
        <summary className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800 cursor-pointer hover:bg-gate-fog/30 transition-colors list-none">
          + Add Result
        </summary>
        <form action={addResult} className="p-6 border-t border-gate-fog flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="participantId">Participant *</Label>
              <select
                id="participantId"
                name="participantId"
                required
                className="flex h-11 w-full border border-gate-800/20 bg-white px-3 py-2 text-sm font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
              >
                <option value="">Select participant...</option>
                {allParticipants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.country})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subjectId">Subject *</Label>
              <select
                id="subjectId"
                name="subjectId"
                required
                className="flex h-11 w-full border border-gate-800/20 bg-white px-3 py-2 text-sm font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
              >
                <option value="">Select subject...</option>
                {allSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cycleId">Cycle *</Label>
              <select
                id="cycleId"
                name="cycleId"
                required
                className="flex h-11 w-full border border-gate-800/20 bg-white px-3 py-2 text-sm font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
              >
                <option value="">Select cycle...</option>
                {allCycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="stage">Stage *</Label>
              <select
                id="stage"
                name="stage"
                required
                className="flex h-11 w-full border border-gate-800/20 bg-white px-3 py-2 text-sm font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
              >
                <option value="preliminary">Preliminary (Round I)</option>
                <option value="onsite">Onsite (Round II)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="score">Score</Label>
              <Input id="score" name="score" placeholder="e.g. 78.5" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxScore">Max Score</Label>
              <Input id="maxScore" name="maxScore" placeholder="e.g. 100" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rank">Rank</Label>
              <Input id="rank" name="rank" type="number" min="1" placeholder="e.g. 3" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="award">Award</Label>
              <select
                id="award"
                name="award"
                className="flex h-11 w-full border border-gate-800/20 bg-white px-3 py-2 text-sm font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
              >
                <option value="">No award</option>
                <option value="gold">Gold Medal</option>
                <option value="silver">Silver Medal</option>
                <option value="bronze">Bronze Medal</option>
                <option value="honorable_mention">Honorable Mention</option>
                <option value="participation">Participation</option>
              </select>
            </div>
          </div>
          <div>
            <Button type="submit" variant="gold" size="md">
              Add Result
            </Button>
          </div>
        </form>
      </details>

      {allResults.length === 0 ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8 text-center">
          <p className="text-sm font-light text-gate-800/60">No results yet. Add one above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-gate-fog bg-white divide-y divide-gate-fog/40">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px_80px_100px] gap-3 px-5 py-3 bg-gate-fog/30">
            {["Participant", "Subject", "Cycle", "Stage", "Score", "Rank", "Award"].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50">
                {h}
              </span>
            ))}
          </div>
          {allResults.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_80px_80px_100px] gap-3 px-5 py-3 items-center"
            >
              <p className="text-sm font-light text-gate-800 truncate">
                {r.participant?.fullName ?? "—"}
              </p>
              <p className="text-xs font-light text-gate-800/70">{r.subject?.name ?? "—"}</p>
              <p className="text-xs font-light text-gate-800/70">{r.cycle?.name ?? "—"}</p>
              <p className="text-xs font-light text-gate-800/70 capitalize">
                {r.stage === "preliminary" ? "Round I" : "Round II"}
              </p>
              <p className="text-xs font-light text-gate-800">
                {r.score !== null ? `${r.score}${r.maxScore ? `/${r.maxScore}` : ""}` : "—"}
              </p>
              <p className="text-xs font-light text-gate-800">
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
