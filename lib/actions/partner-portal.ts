"use server";

/**
 * Partner-portal self-serve actions (exam_partner role). Each action is scoped
 * to the caller's own tenant via {@link requirePartnerStaff}. Secrets are
 * revealed on demand (decrypted) or rotated; rotation returns the new plaintext
 * once. API keys are hash-only and can only be rotated, never revealed.
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePartnerStaff } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { integrationPartners, type IntegrationPartner } from "@/lib/db/schema";
import {
  decryptSecret,
  encryptSecret,
  generateApiKey,
  generateSecret,
  hashApiKey,
} from "@/lib/partner/crypto";

async function loadOwn(): Promise<{ userId: string; partner: IntegrationPartner }> {
  const { session, partnerId } = await requirePartnerStaff();
  const [partner] = await db
    .select()
    .from(integrationPartners)
    .where(eq(integrationPartners.id, partnerId))
    .limit(1);
  if (!partner) throw new Error("Partner not found");
  return { userId: session.user.id, partner };
}

export async function revealSharedSecret(): Promise<string> {
  const { userId, partner } = await loadOwn();
  if (!partner.sharedSecretEnc) throw new Error("No shared secret is set");
  await writeAuditLog(
    userId,
    "partner_reveal_shared_secret",
    "integration_partner",
    partner.id,
  );
  return decryptSecret(partner.sharedSecretEnc);
}

export async function revealWebhookSecret(): Promise<string> {
  const { userId, partner } = await loadOwn();
  if (!partner.webhookSecretEnc) throw new Error("No webhook secret is set");
  await writeAuditLog(
    userId,
    "partner_reveal_webhook_secret",
    "integration_partner",
    partner.id,
  );
  return decryptSecret(partner.webhookSecretEnc);
}

export async function rotateOwnSharedSecret(): Promise<string> {
  const { userId, partner } = await loadOwn();
  const secret = generateSecret(32);
  await db
    .update(integrationPartners)
    .set({ sharedSecretEnc: encryptSecret(secret), updatedAt: new Date() })
    .where(eq(integrationPartners.id, partner.id));
  await writeAuditLog(
    userId,
    "partner_rotate_shared_secret",
    "integration_partner",
    partner.id,
  );
  revalidatePath("/examPartner/settings");
  return secret;
}

export async function rotateOwnApiKey(): Promise<string> {
  const { userId, partner } = await loadOwn();
  const apiKey = generateApiKey();
  await db
    .update(integrationPartners)
    .set({ apiKeyHash: hashApiKey(apiKey), updatedAt: new Date() })
    .where(eq(integrationPartners.id, partner.id));
  await writeAuditLog(
    userId,
    "partner_rotate_api_key",
    "integration_partner",
    partner.id,
  );
  revalidatePath("/examPartner/settings");
  return apiKey;
}

export async function rotateOwnWebhookSecret(): Promise<string> {
  const { userId, partner } = await loadOwn();
  const secret = generateSecret(32);
  await db
    .update(integrationPartners)
    .set({ webhookSecretEnc: encryptSecret(secret), updatedAt: new Date() })
    .where(eq(integrationPartners.id, partner.id));
  await writeAuditLog(
    userId,
    "partner_rotate_webhook_secret",
    "integration_partner",
    partner.id,
  );
  revalidatePath("/examPartner/settings");
  return secret;
}

export async function updateOwnWebhookUrl(url: string): Promise<void> {
  const { userId, partner } = await loadOwn();
  const trimmed = url.trim();
  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
    throw new Error("Webhook URL must start with http(s)://");
  }
  await db
    .update(integrationPartners)
    .set({ webhookUrl: trimmed || null, updatedAt: new Date() })
    .where(eq(integrationPartners.id, partner.id));
  await writeAuditLog(
    userId,
    "partner_update_webhook_url",
    "integration_partner",
    partner.id,
  );
  revalidatePath("/examPartner/settings");
}
