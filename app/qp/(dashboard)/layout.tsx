import Link from "next/link";
import { requireRole } from "@/lib/authz";
import { ThemeAwareLogo } from "@/components/brand/theme-aware-logo";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV = [
  { href: "/qp", label: "Overview" },
  { href: "/qp/exams", label: "Exams" },
];

export default async function QpLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("question_provider");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <Link href="/">
            <ThemeAwareLogo size="xs" showTagline={false} />
          </Link>
        </div>

        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/35 px-3 py-2">
            Question Provider
          </p>
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-light text-foreground/70 hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-light text-foreground truncate">
              {(session.user as { name?: string }).name ?? session.user.email}
            </p>
            <p className="text-[10px] text-foreground/40 truncate">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 px-5 py-5 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
