"use server";

/**
 * Partner-portal self-serve actions (exam_partner role). Each action is scoped
 * to the caller's own tenant via {@link requirePartnerStaff}. Secrets are
 * revealed on demand (decrypted) or rotated; rotation returns the new plaintext
 * once. API keys are hash-only and can only be rotated, never revealed.
 */
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePartnerStaff } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import {
  exams,
  integrationPartners,
  type IntegrationPartner,
} from "@/lib/db/schema";
import { LAUNCH_AUDIENCE } from "@/lib/partner/auth";
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

/**
 * Generate a signed HS256 launch token + URL for testing, using the partner's
 * own shared secret. Lets staff click-test the full launch flow without writing
 * a signing script. The exam must belong to the partner.
 */
export async function generateSampleLaunchToken(input: {
  examId: number;
  externalUserId?: string;
  grade?: string;
  assignmentId?: string;
  returnUrl?: string;
}): Promise<{ token: string; url: string }> {
  const { userId, partner } = await loadOwn();
  if (!partner.sharedSecretEnc) throw new Error("No shared secret is set");

  const [exam] = await db
    .select({ id: exams.id })
    .from(exams)
    .where(
      and(eq(exams.id, input.examId), eq(exams.createdByPartnerId, partner.id)),
    )
    .limit(1);
  if (!exam) throw new Error("Exam not found");

  const secret = new TextEncoder().encode(decryptSecret(partner.sharedSecretEnc));
  const sub = input.externalUserId?.trim() || `sandbox_${Date.now()}`;

  const payload: Record<string, unknown> = { exam_ref: input.examId };
  if (input.grade?.trim()) payload.grade = input.grade.trim();
  if (input.assignmentId?.trim()) payload.assignment_id = input.assignmentId.trim();
  if (input.returnUrl?.trim()) payload.return_url = input.returnUrl.trim();

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(partner.clientId)
    .setAudience(LAUNCH_AUDIENCE)
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("5m")
    .setJti(randomUUID())
    .sign(secret);

  await writeAuditLog(
    userId,
    "partner_generate_sample_token",
    "integration_partner",
    partner.id,
    { examId: input.examId },
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return { token, url: `${appUrl}/api/v1/partner/launch?token=${token}` };
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
