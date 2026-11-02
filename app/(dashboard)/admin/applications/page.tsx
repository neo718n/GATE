import Link from "next/link";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { CONTACT_METHODS } from "@/lib/applications/schema";

const STATUS_STYLE: Record<string, string> = {
  paid: "border-green-200 text-green-700",
  submitted: "border-blue-200 text-blue-700",
  pending_payment: "border-amber-200 text-amber-700",
  cancelled: "border-border text-foreground/40",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "pending_payment", label: "Awaiting payment" },
  { key: "submitted", label: "Via partners" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole(["super_admin", "admin"]);
  const { status = "all" } = await searchParams;
  const where: SQL | undefined =
    status !== "all" && FILTERS.some((f) => f.key === status)
      ? and(eq(applications.status, status as "paid" | "pending_payment" | "submitted" | "cancelled"))
      : undefined;
  const rows = await db.query.applications.findMany({
    where,
    orderBy: desc(applications.createdAt),
    with: { representative: true },
    limit: 500,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Applications</span>
        <h1 className="font-serif text-4xl font-light text-foreground">Program applications</h1>
        <p className="text-sm text-foreground/60">Individual applications (paid online) and students registered by country representatives.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/applications" : `/admin/applications?status=${f.key}`}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
              status === f.key ? "border-gate-gold bg-gate-gold/10 text-foreground" : "border-border text-foreground/60"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-[10px] uppercase tracking-[0.2em] text-foreground/55">
            <tr>
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Subject · Grade</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Guardian</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border align-top last:border-0">
                <td className="px-4 py-3">
                  <div className="font-mono text-xs font-semibold text-foreground">{r.reference}</div>
                  <div className="text-xs text-foreground/50">{r.createdAt.toLocaleDateString("en-GB")}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">
                    {r.firstName} {r.lastName}
                  </div>
                  <div className="text-xs text-foreground/55">
                    {r.dateOfBirth} · {r.country}, {r.city}
                  </div>
                  <div className="text-xs text-foreground/45">{r.school}</div>
                </td>
                <td className="px-4 py-3 text-foreground/75">
                  {r.subject} · {r.grade}
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground/75">{r.email}</div>
                  <div className="text-xs text-foreground/55">
                    {CONTACT_METHODS.find((c) => c.value === r.contactMethod)?.label}: {r.contactValue}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-foreground/65">
                  {r.guardianName}
                  <br />
                  {r.guardianPhone}
                </td>
                <td className="px-4 py-3 text-xs text-foreground/65">
                  {r.source === "individual" ? "Individual" : (r.representative?.organization ?? r.representative?.name ?? "Representative")}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                    {r.status === "pending_payment" ? "Awaiting payment" : r.status === "submitted" ? "Registered" : r.status}
                    {r.status === "paid" && r.amountCents ? ` · $${r.amountCents / 100}` : ""}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-foreground/50">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
