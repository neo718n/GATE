import { desc, sql } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { applications, representatives } from "@/lib/db/schema";
import { PARTNERS_URL } from "@/lib/portal-urls";
import { AddRepresentativeForm, RepresentativeToggle } from "./client";

export default async function RepresentativesPage() {
  await requireRole(["super_admin", "admin"]);
  const reps = await db.query.representatives.findMany({ orderBy: desc(representatives.createdAt) });
  const counts = await db
    .select({ repId: applications.representativeId, n: sql<number>`count(*)::int` })
    .from(applications)
    .where(sql`${applications.status} <> 'cancelled' and ${applications.representativeId} is not null`)
    .groupBy(applications.representativeId);
  const countOf = (id: number) => counts.find((c) => c.repId === id)?.n ?? 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Partners</span>
        <h1 className="font-serif text-4xl font-light text-foreground">Country representatives</h1>
        <p className="max-w-2xl text-sm text-foreground/60">
          Only emails on this list can sign in at <span className="font-mono">{PARTNERS_URL.replace(/^https?:\/\//, "")}</span> with a
          one-time code. Deactivating a representative signs them out and pauses their registration links.
        </p>
      </div>

      <AddRepresentativeForm />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-[10px] uppercase tracking-[0.2em] text-foreground/55">
            <tr>
              <th className="px-5 py-3">Representative</th>
              <th className="px-5 py-3">Organization</th>
              <th className="px-5 py-3">Students</th>
              <th className="px-5 py-3">Last sign-in</th>
              <th className="px-5 py-3">Access</th>
            </tr>
          </thead>
          <tbody>
            {reps.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-5 py-4">
                  <div className="font-semibold text-foreground">{r.name}</div>
                  <div className="text-xs text-foreground/55">{r.email}</div>
                </td>
                <td className="px-5 py-4 text-foreground/70">{r.organization ?? "—"}</td>
                <td className="px-5 py-4 font-semibold text-foreground">{countOf(r.id)}</td>
                <td className="px-5 py-4 text-foreground/60">{r.lastLoginAt ? r.lastLoginAt.toLocaleDateString("en-GB") : "Never"}</td>
                <td className="px-5 py-4">
                  <RepresentativeToggle id={r.id} active={r.active} />
                </td>
              </tr>
            ))}
            {reps.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-foreground/50">
                  No representatives yet — add the first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
