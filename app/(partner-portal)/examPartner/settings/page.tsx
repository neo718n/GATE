import { eq } from "drizzle-orm";
import { requirePartnerStaff } from "@/lib/authz";
import { db } from "@/lib/db";
import { integrationPartners } from "@/lib/db/schema";
import { PartnerCredentials } from "@/components/partner/partner-credentials";

export const metadata = { title: "Credentials" };

export default async function PartnerSettingsPage() {
  const { partnerId } = await requirePartnerStaff();
  const [partner] = await db
    .select()
    .from(integrationPartners)
    .where(eq(integrationPartners.id, partnerId))
    .limit(1);

  if (!partner) {
    return (
      <p className="text-sm text-muted-foreground">Partner not found.</p>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const launchUrl = `${appUrl}/api/v1/partner/launch`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-4xl font-light text-foreground">
          Credentials
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          Secrets used to sign launch tokens and call the API. Treat them like
          passwords.
        </p>
      </div>

      <PartnerCredentials
        clientId={partner.clientId}
        launchUrl={launchUrl}
        webhookUrl={partner.webhookUrl}
        hasSharedSecret={!!partner.sharedSecretEnc}
        hasWebhookSecret={!!partner.webhookSecretEnc}
      />
    </div>
  );
}
