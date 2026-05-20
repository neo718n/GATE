import Link from "next/link";
import { count, desc, isNotNull } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { integrationPartners, exams } from "@/lib/db/schema";
import { NewPartnerForm } from "@/components/admin/integrations/new-partner-form";

export const metadata = { title: "Integrations" };

const STATUS_COLOR: Record<string, string> = {
  active: "text-green-700 dark:text-green-400",
  sandbox: "text-amber-600 dark:text-amber-400",
  disabled: "text-red-600 dark:text-red-400",
};

export default async function IntegrationsPage() {
  await requireRole(["super_admin"]);

  const partners = await db
    .select()
    .from(integrationPartners)
    .orderBy(desc(integrationPartners.createdAt));

  const examCounts = await db
    .select({ partnerId: exams.createdByPartnerId, c: count() })
    .from(exams)
    .where(isNotNull(exams.createdByPartnerId))
    .groupBy(exams.createdByPartnerId);
  const examCountMap = new Map(
    examCounts.map((r) => [r.partnerId as number, Number(r.c)]),
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-4xl font-light text-foreground">
            Integrations
          </h1>
          <p className="text-sm font-light text-muted-foreground">
            Third-party exam partners (e.g. ArcMC) — provision tenants and
            manage credentials, exams and webhooks.
          </p>
        </div>
        <NewPartnerForm />
      </div>

      {partners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-sm font-light text-muted-foreground">
            No integration partners yet. Create one to issue credentials.
          </p>
        </div>
      ) : (
        <div className="flex flex-col border border-border bg-card divide-y divide-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_0.8fr_80px] gap-4 bg-muted/30 px-5 py-3">
            {["Partner", "Client ID", "Status", "Exams", ""].map((h, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50"
              >
                {h}
              </span>
            ))}
          </div>
          {partners.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[2fr_2fr_1fr_0.8fr_80px] items-center gap-4 px-5 py-4"
            >
              <span className="text-sm font-light text-foreground">{p.name}</span>
              <code className="truncate font-mono text-xs text-muted-foreground">
                {p.clientId}
              </code>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${STATUS_COLOR[p.status] ?? ""}`}
              >
                {p.status}
              </span>
              <span className="text-sm font-light text-foreground">
                {examCountMap.get(p.id) ?? 0}
              </span>
              <Link
                href={`/admin/integrations/${p.id}`}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-gate-gold hover:underline"
              >
                Manage
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
