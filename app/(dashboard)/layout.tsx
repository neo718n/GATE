import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { requireSession } from "@/lib/authz";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role ?? "participant";

  const navMap: Record<string, { href: string; label: string }[]> = {
    super_admin: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/users", label: "Users & Roles" },
      { href: "/admin/cycles", label: "Olympiad Cycles" },
      { href: "/admin/subjects", label: "Subjects & Exams" },
      { href: "/admin/partners", label: "Partner Applications" },
      { href: "/admin/careers", label: "Career Applications" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/settings", label: "System Settings" },
    ],
    admin: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/participants", label: "Participants" },
      { href: "/admin/results", label: "Results" },
      { href: "/admin/certificates", label: "Certificates" },
      { href: "/admin/inquiries", label: "Academic Inquiries" },
    ],
    coordinator: [
      { href: "/coordinator", label: "Overview" },
      { href: "/coordinator/participants", label: "My Participants" },
      { href: "/coordinator/reports", label: "Reports" },
    ],
    partner_contact: [
      { href: "/partner", label: "Overview" },
      { href: "/partner/profile", label: "Organization Profile" },
      { href: "/partner/status", label: "Partnership Status" },
    ],
    participant: [
      { href: "/participant", label: "Overview" },
      { href: "/participant/profile", label: "My Profile" },
      { href: "/participant/enrollment", label: "Subject Enrollment" },
      { href: "/participant/exam", label: "Exam Instructions" },
      { href: "/participant/results", label: "Results" },
      { href: "/participant/certificates", label: "Certificates" },
    ],
  };

  const links = navMap[role] ?? navMap.participant;
  const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="flex min-h-screen bg-gate-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-gate-gold/10 bg-gate-800/50 shrink-0">
        <div className="px-5 py-5 border-b border-gate-gold/10">
          <Link href="/">
            <Logo size="xs" variant="dark" showTagline={false} />
          </Link>
        </div>
        <div className="px-4 py-4 border-b border-gate-gold/10">
          <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-gate-gold/60">{roleLabel}</p>
          <p className="text-xs font-light text-gate-white/60 mt-1 truncate">{session.user.email}</p>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-gray hover:text-gate-white hover:bg-gate-700/30 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gate-gold/10">
          <Link
            href="/api/auth/sign-out"
            className="block px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-gray hover:text-red-400 transition-colors"
          >
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-gate-gold/10 bg-gate-800/50">
          <Link href="/"><Logo size="xs" variant="dark" showTagline={false} /></Link>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gate-gold/70">{roleLabel}</p>
        </header>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
