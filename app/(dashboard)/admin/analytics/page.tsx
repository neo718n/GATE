import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, user, cycles, results, partners, careerApplications, payments } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export default async function AnalyticsPage() {
  await requireRole(["super_admin"]);

  const [
    [{ total: totalUsers }],
    [{ total: totalParticipants }],
    [{ total: verified }],
    [{ total: paid }],
    [{ total: totalCycles }],
    [{ total: totalResults }],
    [{ total: pendingPartners }],
    [{ total: pendingCareers }],
  ] = await Promise.all([
    db.select({ total: count() }).from(user),
    db.select({ total: count() }).from(participants),
    db.select({ total: count() }).from(participants).where(eq(participants.registrationStatus, "verified")),
    db.select({ total: count() }).from(participants).where(eq(participants.paymentStatus, "paid")),
    db.select({ total: count() }).from(cycles),
    db.select({ total: count() }).from(results),
    db.select({ total: count() }).from(partners).where(eq(partners.status, "pending")),
    db.select({ total: count() }).from(careerApplications).where(eq(careerApplications.status, "submitted")),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers },
    { label: "Total Participants", value: totalParticipants },
    { label: "Verified", value: verified },
    { label: "Paid", value: paid },
    { label: "Assessment Cycles", value: totalCycles },
    { label: "Results Published", value: totalResults },
    { label: "Partner Applications", value: pendingPartners },
    { label: "Career Applications", value: pendingCareers },
  ];

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Super Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Analytics</h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">Platform-wide statistics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-gate-fog bg-white p-6 flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gate-800/60">
              {s.label}
            </p>
            <p className="font-serif text-4xl font-light text-gate-gold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-gate-fog bg-gate-fog/30 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/50 mb-3">
          Conversion Funnel
        </p>
        <div className="flex flex-col gap-2">
          {[
            { label: "Registered Accounts", val: totalUsers, pct: 100 },
            { label: "Profiles Submitted", val: totalParticipants, pct: totalUsers ? Math.round((totalParticipants / totalUsers) * 100) : 0 },
            { label: "Verified", val: verified, pct: totalParticipants ? Math.round((verified / totalParticipants) * 100) : 0 },
            { label: "Paid / Enrolled", val: paid, pct: totalParticipants ? Math.round((paid / totalParticipants) * 100) : 0 },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-4">
              <span className="text-xs font-light text-gate-800/60 w-48 shrink-0">{row.label}</span>
              <div className="flex-1 h-2 bg-gate-fog rounded-full overflow-hidden">
                <div
                  className="h-full bg-gate-gold/60 transition-all"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gate-800 w-16 text-right">
                {row.val} ({row.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
