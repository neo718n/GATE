import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, results } from "@/lib/db/schema";
import { eq, isNotNull, count, or } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CoordinatorDashboard() {
  await requireRole(["coordinator", "admin", "super_admin"]);

  const [[{ total }], [{ pending }], [{ confirmed }], [{ qualified }]] =
    await Promise.all([
      db.select({ total: count() }).from(participants),
      db
        .select({ pending: count() })
        .from(participants)
        .where(eq(participants.registrationStatus, "submitted")),
      db
        .select({ confirmed: count() })
        .from(participants)
        .where(
          or(
            eq(participants.paymentStatus, "paid"),
            eq(participants.paymentStatus, "waived"),
          ),
        ),
      db
        .select({ qualified: count() })
        .from(results)
        .where(isNotNull(results.publishedAt)),
    ]);

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Coordinator Portal
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">
          Coordinator Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Participants", value: total },
          { label: "Pending Verification", value: pending },
          { label: "Confirmed", value: confirmed },
          { label: "Published Results", value: qualified },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-border bg-card p-6 flex flex-col gap-3 shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/60">
              {stat.label}
            </p>
            <p className="text-3xl font-serif font-light text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {
            title: "My Participants",
            desc: "View and manage all participants assigned to you. Verify registrations, check document status, and update participant records.",
            href: "/coordinator/participants",
            action: "View Participants",
          },
          {
            title: "Reports",
            desc: "Generate regional participation reports for submission to the G.A.T.E. administration. Track metrics for your assigned group.",
            href: "/coordinator/reports",
            action: "View Reports",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="border border-border bg-card p-6 flex flex-col gap-4 shadow-sm"
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              {item.title}
            </h2>
            <p className="text-sm font-light text-foreground/60 leading-[1.8] flex-1">
              {item.desc}
            </p>
            <Button variant="outline" size="sm" asChild className="w-fit">
              <Link href={item.href}>{item.action}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
