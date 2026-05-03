import Link from "next/link";
import { ThemeAwareLogo } from "@/components/brand/theme-aware-logo";
import { requireSession } from "@/lib/authz";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role ?? "participant";

  const navMap: Record<string, { href: string; label: string }[]> = {
    super_admin: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/users", label: "Users & Roles" },
      { href: "/admin/participants", label: "Participants" },
      { href: "/admin/cycles", label: "Assessment Cycles" },
      { href: "/admin/subjects", label: "Subjects" },
      { href: "/admin/exams", label: "Online Exams" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/notifications", label: "Notifications" },
      { href: "/admin/partners", label: "Partner Applications" },
      { href: "/admin/careers", label: "Career Applications" },
      { href: "/admin/content", label: "Content" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/settings", label: "System Settings" },
    ],
    admin: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/participants", label: "Participants" },
      { href: "/admin/exams", label: "Online Exams" },
      { href: "/admin/results", label: "Results" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/notifications", label: "Notifications" },
      { href: "/admin/certificates", label: "Certificates" },
      { href: "/admin/inquiries", label: "Academic Inquiries" },
      { href: "/admin/content", label: "Content" },
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
      { href: "/participant/exams", label: "Exams" },
      { href: "/participant/results", label: "Results" },
      { href: "/participant/certificates", label: "Certificates" },
      { href: "/participant/documents", label: "My Documents" },
    ],
  };

  const links = navMap[role] ?? navMap.participant;
  const roleLabel = role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/">
            <ThemeAwareLogo size="xs" showTagline={false} />
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gate-gold/10 shrink-0">
              <span className="text-[13px] font-bold text-gate-gold">
                {session.user.name?.charAt(0).toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-gold truncate">
                {roleLabel}
              </p>
              <p className="text-xs font-light text-muted-foreground mt-0.5 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        <DashboardSidebar links={links} />

        {/* Bottom actions */}
        <div className="p-3 border-t border-border space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Theme
            </span>
            <ThemeToggle />
          </div>
          <SignOutButton className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-200">
            Sign Out
          </SignOutButton>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden relative flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <Link href="/">
            <ThemeAwareLogo size="xs" showTagline={false} />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <DashboardMobileNav links={links} roleLabel={roleLabel} email={session.user.email} />
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
