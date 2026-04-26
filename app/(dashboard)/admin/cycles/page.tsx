import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { cycles, subjects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCycle,
  updateCycleStatus,
  createRound,
  deleteRound,
  addCycleSubject,
  removeCycleSubject,
} from "@/lib/actions/admin";

const STATUS_LABELS: Record<string, string> = {
  planning: "Planning",
  registration_open: "Registration Open",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_NEXT: Record<string, string[]> = {
  planning: ["registration_open"],
  registration_open: ["active", "planning"],
  active: ["completed", "registration_open"],
  completed: ["archived"],
  archived: [],
};

const FORMAT_LABELS: Record<string, string> = {
  online: "Online",
  onsite: "Onsite",
  hybrid: "Hybrid",
};

export default async function CyclesPage() {
  await requireRole(["super_admin"]);

  const [allCycles, allSubjects] = await Promise.all([
    db.query.cycles.findMany({
      with: {
        rounds: { orderBy: (r, { asc }) => [asc(r.order)] },
        subjects: { with: { subject: true } },
      },
      orderBy: desc(cycles.year),
    }),
    db.query.subjects.findMany({ where: (s, { eq }) => eq(s.active, true), orderBy: subjects.order }),
  ]);

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Assessment Cycles</h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">
          Manage competition events, rounds, and offered subjects per cycle.
        </p>
      </div>

      {/* Create cycle */}
      <details className="border border-gate-fog bg-white">
        <summary className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800 cursor-pointer hover:bg-gate-fog/30 transition-colors list-none flex items-center justify-between">
          <span>+ Create New Cycle</span>
        </summary>
        <form action={createCycle} className="p-6 border-t border-gate-fog flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Cycle Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. GATE 2026 Spring" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="year">Year *</Label>
              <Input id="year" name="year" type="number" required placeholder="2026" min="2024" max="2040" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Optional short description" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="registrationFeeUsd">Registration Fee (cents USD)</Label>
              <Input id="registrationFeeUsd" name="registrationFeeUsd" type="number" placeholder="e.g. 5000 = $50.00" min="0" />
            </div>
          </div>
          <div>
            <Button type="submit" variant="gold" size="md">Create Cycle</Button>
          </div>
        </form>
      </details>

      {allCycles.length === 0 ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8 text-center">
          <p className="text-sm font-light text-gate-800/60">No cycles yet. Create one above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {allCycles.map((cycle) => {
            const nextStatuses = STATUS_NEXT[cycle.status] ?? [];
            const cycleSubjectIds = new Set(cycle.subjects.map((cs) => cs.subjectId));
            const availableToAdd = allSubjects.filter((s) => !cycleSubjectIds.has(s.id));

            return (
              <div key={cycle.id} className="border border-gate-fog bg-white">
                {/* Cycle header */}
                <div className="p-6 flex items-start justify-between flex-wrap gap-4 border-b border-gate-fog/60">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold text-gate-800">{cycle.name}</h2>
                    <p className="text-xs font-light text-gate-800/50">
                      {cycle.year}
                      {cycle.description ? ` · ${cycle.description}` : ""}
                      {" · "}
                      {cycle.registrationFeeUsd > 0
                        ? `$${(cycle.registrationFeeUsd / 100).toFixed(2)} fee`
                        : "Free"}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] border border-gate-gold/40 text-gate-gold px-3 py-1.5">
                    {STATUS_LABELS[cycle.status] ?? cycle.status}
                  </span>
                </div>

                {/* Status transitions */}
                {nextStatuses.length > 0 && (
                  <div className="px-6 py-3 border-b border-gate-fog/60 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/40">
                      Move to:
                    </span>
                    {nextStatuses.map((s) => {
                      async function advance() {
                        "use server";
                        await updateCycleStatus(cycle.id, s);
                      }
                      return (
                        <form key={s} action={advance}>
                          <Button type="submit" variant="outline" size="sm">
                            {STATUS_LABELS[s] ?? s}
                          </Button>
                        </form>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gate-fog/60">
                  {/* Rounds column */}
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gate-800/50">
                      Rounds
                    </p>
                    {cycle.rounds.length === 0 ? (
                      <p className="text-xs font-light text-gate-800/40">No rounds yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {cycle.rounds.map((r) => (
                          <div key={r.id} className="flex items-start justify-between gap-3 border border-gate-fog/60 px-3 py-2.5">
                            <div className="flex flex-col gap-0.5">
                              <p className="text-sm font-light text-gate-800">{r.name}</p>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gate-800/40">
                                {FORMAT_LABELS[r.format]}
                                {r.startDate
                                  ? ` · ${new Date(r.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                                  : ""}
                                {r.venue ? ` · ${r.venue}` : ""}
                              </p>
                            </div>
                            <form action={deleteRound}>
                              <input type="hidden" name="id" value={r.id} />
                              <button
                                type="submit"
                                className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400 hover:text-red-600 transition-colors pt-0.5"
                              >
                                Remove
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Add round form */}
                    <details className="border border-gate-fog/60">
                      <summary className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50 cursor-pointer hover:bg-gate-fog/20 list-none">
                        + Add Round
                      </summary>
                      <form action={createRound} className="p-3 border-t border-gate-fog/60 flex flex-col gap-3">
                        <input type="hidden" name="cycleId" value={cycle.id} />
                        <Input name="name" required placeholder="Round name (e.g. Preliminary)" />
                        <div className="grid grid-cols-2 gap-2">
                          <Input name="order" type="number" min="1" placeholder="Order (1, 2, …)" defaultValue="1" />
                          <select
                            name="format"
                            className="flex h-11 w-full border border-gate-800/20 bg-white px-3 py-2 text-sm font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
                          >
                            <option value="online">Online</option>
                            <option value="onsite">Onsite</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input name="startDate" type="datetime-local" placeholder="Start" />
                          <Input name="endDate" type="datetime-local" placeholder="End" />
                        </div>
                        <Input name="venue" placeholder="Venue (for onsite/hybrid)" />
                        <Button type="submit" variant="outline" size="sm">Add Round</Button>
                      </form>
                    </details>
                  </div>

                  {/* Subjects column */}
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gate-800/50">
                      Offered Subjects
                    </p>
                    {cycle.subjects.length === 0 ? (
                      <p className="text-xs font-light text-gate-800/40">No subjects selected.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {cycle.subjects.map((cs) => (
                          <form key={cs.subjectId} action={removeCycleSubject} className="flex items-center gap-1.5 border border-gate-fog/60 pl-3 pr-2 py-1.5">
                            <input type="hidden" name="cycleId" value={cycle.id} />
                            <input type="hidden" name="subjectId" value={cs.subjectId} />
                            <span className="text-xs font-light text-gate-800">{cs.subject?.name}</span>
                            <button
                              type="submit"
                              className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </form>
                        ))}
                      </div>
                    )}
                    {availableToAdd.length > 0 && (
                      <form action={addCycleSubject} className="flex items-center gap-2">
                        <input type="hidden" name="cycleId" value={cycle.id} />
                        <select
                          name="subjectId"
                          className="flex-1 h-9 border border-gate-800/20 bg-white px-3 text-sm font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
                        >
                          {availableToAdd.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <Button type="submit" variant="outline" size="sm">Add</Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
