import { requireRole } from "@/lib/authz";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CoordinatorDashboard() {
  await requireRole(["coordinator", "admin", "super_admin"]);

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
          { label: "Assigned Participants", value: "—" },
          { label: "Pending Verification", value: "—" },
          { label: "Confirmed", value: "—" },
          { label: "Round II Qualified", value: "—" },
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
            title: "Status Tracking",
            desc: "Track participant registration status, verification progress, and payment confirmation across your assigned group.",
            href: "/coordinator/status",
            action: "View Status",
          },
          {
            title: "Communication",
            desc: "Send and receive messages to and from assigned participants. Share updates on registration deadlines and examination information.",
            href: "/coordinator/messages",
            action: "Messages",
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
