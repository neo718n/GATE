import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { cycles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCycle, updateCycleStatus } from "@/lib/actions/admin";

const STATUS_LABELS: Record<string, string> = {
  planning: "Planning",
  registration_open: "Registration Open",
  preliminary: "Preliminary",
  onsite: "Onsite",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_NEXT: Record<string, string[]> = {
  planning: ["registration_open"],
  registration_open: ["preliminary", "planning"],
  preliminary: ["onsite", "registration_open"],
  onsite: ["completed"],
  completed: ["archived"],
  archived: [],
};

export default async function CyclesPage() {
  await requireRole(["super_admin"]);

  const allCycles = await db.query.cycles.findMany({
    orderBy: desc(cycles.year),
  });

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Assessment Cycles</h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">
          Create and manage annual assessment editions.
        </p>
      </div>

      <details className="border border-gate-fog bg-white">
        <summary className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800 cursor-pointer hover:bg-gate-fog/30 transition-colors list-none flex items-center justify-between">
          <span>+ Create New Cycle</span>
        </summary>
        <form action={createCycle} className="p-6 border-t border-gate-fog flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Cycle Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. GATE 2026" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="year">Year *</Label>
              <Input id="year" name="year" type="number" required placeholder="2026" min="2024" max="2040" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="registrationFeeUsd">Registration Fee (cents USD)</Label>
              <Input id="registrationFeeUsd" name="registrationFeeUsd" type="number" placeholder="e.g. 5000 = $50.00" min="0" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="onsiteVenue">Onsite Venue</Label>
              <Input id="onsiteVenue" name="onsiteVenue" placeholder="e.g. University of Oxford, UK" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prelimStart">Preliminary Start</Label>
              <Input id="prelimStart" name="prelimStart" type="datetime-local" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prelimEnd">Preliminary End</Label>
              <Input id="prelimEnd" name="prelimEnd" type="datetime-local" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="onsiteStart">Onsite Start</Label>
              <Input id="onsiteStart" name="onsiteStart" type="datetime-local" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="onsiteEnd">Onsite End</Label>
              <Input id="onsiteEnd" name="onsiteEnd" type="datetime-local" />
            </div>
          </div>
          <div>
            <Button type="submit" variant="gold" size="md">
              Create Cycle
            </Button>
          </div>
        </form>
      </details>

      {allCycles.length === 0 ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8 text-center">
          <p className="text-sm font-light text-gate-800/60">No cycles yet. Create one above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {allCycles.map((cycle) => {
            const nextStatuses = STATUS_NEXT[cycle.status] ?? [];
            return (
              <div key={cycle.id} className="border border-gate-fog bg-white p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold text-gate-800">{cycle.name}</h2>
                    <p className="text-xs font-light text-gate-800/50">
                      {cycle.year}
                      {cycle.onsiteVenue ? ` · ${cycle.onsiteVenue}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] border border-gate-gold/40 text-gate-gold px-3 py-1.5">
                    {STATUS_LABELS[cycle.status] ?? cycle.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs font-light text-gate-800/55">
                  <span>
                    Fee:{" "}
                    {cycle.registrationFeeUsd > 0
                      ? `$${(cycle.registrationFeeUsd / 100).toFixed(2)}`
                      : "Free"}
                  </span>
                  {cycle.prelimStart && (
                    <span>
                      Prelim:{" "}
                      {new Date(cycle.prelimStart).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {cycle.prelimEnd
                        ? ` — ${new Date(cycle.prelimEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                        : ""}
                    </span>
                  )}
                  {cycle.onsiteStart && (
                    <span>
                      Onsite:{" "}
                      {new Date(cycle.onsiteStart).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {nextStatuses.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-gate-fog/60">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/40 pt-2">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
