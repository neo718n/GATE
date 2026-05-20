import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { integrationPartners, partnerWebhookDeliveries } from "@/lib/db/schema";
import { SecretField } from "@/components/partner/secret-field";
import { PartnerSettingsForm } from "@/components/admin/integrations/partner-settings-form";
import { ReturnOriginsEditor } from "@/components/admin/integrations/return-origins-editor";
import { WebhookDeliveries } from "@/components/admin/integrations/webhook-deliveries";

export const metadata = { title: "Manage partner" };

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["super_admin"]);
  const { id } = await params;
  const partnerId = Number(id);
  if (!Number.isInteger(partnerId)) notFound();

  const [partner] = await db
    .select()
    .from(integrationPartners)
    .where(eq(integrationPartners.id, partnerId))
    .limit(1);
  if (!partner) notFound();

  const deliveries = await db
    .select({
      id: partnerWebhookDeliveries.id,
      event: partnerWebhookDeliveries.event,
      status: partnerWebhookDeliveries.status,
      attempts: partnerWebhookDeliveries.attempts,
      lastError: partnerWebhookDeliveries.lastError,
      createdAt: partnerWebhookDeliveries.createdAt,
    })
    .from(partnerWebhookDeliveries)
    .where(eq(partnerWebhookDeliveries.partnerId, partner.id))
    .orderBy(desc(partnerWebhookDeliveries.createdAt))
    .limit(15);

  const configured = (v: string | null) =>
    v ? "Configured" : "Not set";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/integrations"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Integrations
        </Link>
        <h1 className="font-serif text-4xl font-light text-foreground">
          {partner.name}
        </h1>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Identity
        </h2>
        <SecretField
          label="Client ID (= JWT issuer)"
          value={partner.clientId}
          defaultHidden={false}
        />
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              Shared secret
            </p>
            <p className="mt-1 font-light text-foreground">
              {configured(partner.sharedSecretEnc)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              API key
            </p>
            <p className="mt-1 font-light text-foreground">
              {configured(partner.apiKeyHash)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              Webhook secret
            </p>
            <p className="mt-1 font-light text-foreground">
              {configured(partner.webhookSecretEnc)}
            </p>
          </div>
        </div>
      </div>

      <PartnerSettingsForm
        partnerId={partner.id}
        name={partner.name}
        status={partner.status}
        webhookUrl={partner.webhookUrl}
      />

      <ReturnOriginsEditor
        partnerId={partner.id}
        initial={partner.allowedReturnOrigins ?? []}
      />

      <WebhookDeliveries
        partnerId={partner.id}
        deliveries={deliveries.map((d) => ({
          id: d.id,
          event: d.event,
          status: d.status,
          attempts: d.attempts,
          lastError: d.lastError,
          createdAt: d.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
