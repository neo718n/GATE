import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export default async function CoordinatorReportsPage() {
  await requireRole(["coordinator", "admin", "super_admin"]);

  const [
    [{ total: total }],
    [{ total: verified }],
    [{ total: paid }],
    [{ total: draft }],
  ] = await Promise.all([
    db.select({ total: count() }).from(participants),
    db.select({ total: count() }).from(participants).where(eq(participants.registrationStatus, "verified")),
    db.select({ total: count() }).from(participants).where(eq(participants.paymentStatus, "paid")),
    db.select({ total: count() }).from(participants).where(eq(participants.registrationStatus, "draft")),
  ]);

  const stats = [
    { label: "Total Participants", value: total },
    { label: "Verified", value: verified },
    { label: "Paid / Enrolled", value: paid },
    { label: "Incomplete Profiles", value: draft },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Coordinator
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Reports</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Registration and enrollment summary.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-card p-6 flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/60">
              {s.label}
            </p>
            <p className="font-serif text-4xl font-light text-gate-gold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-border bg-muted/30 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 mb-3">
          Report Export
        </p>
        <p className="text-sm font-light text-foreground/65 leading-[1.9]">
          Detailed participant reports in CSV/Excel format — available in a future release.
          Contact the admin team for an immediate data export.
        </p>
      </div>
    </div>
  );
}
