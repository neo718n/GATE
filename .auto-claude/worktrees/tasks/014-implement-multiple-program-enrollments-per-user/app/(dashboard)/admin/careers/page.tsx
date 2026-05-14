import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { careerApplications } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { updateCareerStatus } from "@/lib/actions/admin";

const STATUS_COLORS: Record<string, string> = {
  submitted: "text-blue-600 border-blue-200",
  reviewing: "text-amber-600 border-amber-200",
  shortlisted: "text-gate-gold border-gate-gold/30",
  rejected: "text-red-600 border-red-200",
  hired: "text-green-700 border-green-200",
};

const STATUS_FLOW: Record<string, string[]> = {
  submitted: ["reviewing", "rejected"],
  reviewing: ["shortlisted", "rejected"],
  shortlisted: ["hired", "rejected"],
  rejected: [],
  hired: [],
};

export default async function CareersPage() {
  await requireRole(["super_admin"]);

  const apps = await db.query.careerApplications.findMany({
    with: { position: true },
    orderBy: desc(careerApplications.createdAt),
  });

  const pending = apps.filter((a) => ["submitted", "reviewing"].includes(a.status)).length;

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Super Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Career Applications</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          {apps.length} total · {pending} active
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="border border-border bg-muted/30 p-8 text-center">
          <p className="text-sm font-light text-foreground/60">No applications yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {apps.map((a) => {
            const nextStatuses = STATUS_FLOW[a.status] ?? [];
            return (
              <div key={a.id} className="border border-border bg-card p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold text-foreground">{a.fullName}</h2>
                    <p className="text-xs font-light text-foreground/55">
                      {a.email}
                      {a.phone ? ` · ${a.phone}` : ""}
                      {a.country ? ` · ${a.country}` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.2em] border px-3 py-1.5 ${
                      STATUS_COLORS[a.status] ?? ""
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                {a.position && typeof a.position === 'object' && 'title' in a.position && (
                  <p className="text-sm font-light text-foreground/70">
                    Position: <span className="font-semibold">{a.position.title}</span>
                    {a.position.location ? ` · ${a.position.location}` : ""}
                  </p>
                )}

                {a.motivationText && (
                  <p className="text-sm font-light text-foreground/65 leading-[1.9] bg-muted/30 px-4 py-3 line-clamp-3">
                    &ldquo;{a.motivationText}&rdquo;
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                  {a.cvUrl && (
                    <a
                      href={a.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-gold hover:underline pt-2"
                    >
                      View CV
                    </a>
                  )}
                  {nextStatuses.map((s) => (
                    <form key={s} action={updateCareerStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value={s} />
                      <Button type="submit" variant="outline" size="sm">
                        {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Button>
                    </form>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
