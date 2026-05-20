import { eq } from "drizzle-orm";
import { requirePartnerStaff } from "@/lib/authz";
import { db } from "@/lib/db";
import { integrationPartners } from "@/lib/db/schema";
import { PortalNav } from "@/components/partner/portal-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function ExamPartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { partnerId } = await requirePartnerStaff();
  const [partner] = await db
    .select({
      name: integrationPartners.name,
      status: integrationPartners.status,
    })
    .from(integrationPartners)
    .where(eq(integrationPartners.id, partnerId))
    .limit(1);

  const name = partner?.name ?? "Partner";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <span className="shrink-0 text-base font-semibold tracking-tight text-foreground">
            ◆ {name} Exams
          </span>
          <div className="flex items-center gap-2 overflow-x-auto">
            <PortalNav />
            <ThemeToggle />
          </div>
        </div>
        {partner && partner.status !== "active" && (
          <div className="border-t border-amber-200 bg-amber-50 px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
            {partner.status === "sandbox"
              ? "Sandbox mode — for testing only"
              : "This portal is currently disabled"}
          </div>
        )}
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}
