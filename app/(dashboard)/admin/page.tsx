import { requireRole } from "@/lib/authz";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  await requireRole(["admin", "super_admin"]);

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div className="flex flex-col gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gate-gold">Admin Panel</span>
        <h1 className="font-serif text-4xl font-light text-gate-white">Administration</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Participants", value: "—" },
          { label: "Pending Verification", value: "—" },
          { label: "Published Results", value: "—" },
          { label: "Open Inquiries", value: "—" },
        ].map((stat) => (
          <div key={stat.label} className="border border-border/40 bg-gate-800/20 p-6 flex flex-col gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gate-gray">{stat.label}</p>
            <p className="text-2xl font-serif font-light text-gate-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Participant Management", desc: "View, verify, and manage participant registrations. Update statuses, approve documents, and track payment records.", href: "/admin/participants", action: "Manage Participants" },
          { title: "Results Publishing", desc: "Input and publish Round I and Round II results. Manage score uploads and ranking calculations per discipline.", href: "/admin/results", action: "Manage Results" },
          { title: "Certificate Generation", desc: "Generate and issue certificates for all eligible participants. Manage certificate templates and batch issuance.", href: "/admin/certificates", action: "Certificates" },
          { title: "Academic Inquiries", desc: "Respond to participant and institution inquiries about eligibility, examination, and academic procedures.", href: "/admin/inquiries", action: "View Inquiries" },
        ].map((item) => (
          <div key={item.title} className="border border-border/40 p-6 flex flex-col gap-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gate-white">{item.title}</h2>
            <p className="text-sm font-light text-gate-white/55 leading-[1.8] flex-1">{item.desc}</p>
            <Button variant="outline" size="sm" asChild className="w-fit">
              <Link href={item.href}>{item.action}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
