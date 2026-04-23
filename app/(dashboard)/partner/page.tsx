import { requireRole } from "@/lib/authz";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PartnerDashboard() {
  await requireRole(["partner_contact", "admin", "super_admin"]);

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Partner Portal
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">
          Partner Dashboard
        </h1>
      </div>

      <div className="border border-gate-gold/25 bg-gate-gold/5 p-6 flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
          Partnership Status
        </p>
        <p className="text-sm font-light text-gate-800/65">
          Your partnership application is currently under review. You will be
          notified by email once a decision has been made.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {
            title: "Organization Profile",
            desc: "View and update your organization details, contact information, and partnership preferences.",
            href: "/partner/profile",
            action: "View Profile",
          },
          {
            title: "Partnership Status",
            desc: "Track the status of your partnership application and view any outstanding requirements or communications.",
            href: "/partner/status",
            action: "View Status",
          },
          {
            title: "Communication History",
            desc: "View all correspondence with the G.A.T.E. partnerships team regarding your application and ongoing cooperation.",
            href: "/partner/messages",
            action: "View Messages",
          },
          {
            title: "Participant Access",
            desc: "Once your partnership is approved, manage participant registrations from your institution through this portal.",
            href: "/partner/participants",
            action: "View Participants",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="border border-gate-fog bg-white p-6 flex flex-col gap-4 shadow-sm"
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-800">
              {item.title}
            </h2>
            <p className="text-sm font-light text-gate-800/60 leading-[1.8] flex-1">
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
