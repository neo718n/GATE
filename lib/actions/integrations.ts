"use server";

/**
 * Admin actions for partner integrations (ArcMC).
 *
 * Provisioning creates a tenant row (`integration_partners`) plus an
 * `exam_partner` Better Auth login, without touching the admin's own session.
 * Generated secrets are returned to the caller ONCE; only hashes / encrypted
 * forms are persisted. All actions are super_admin-only and audited.
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import {
  integrationPartners,
  partnerStaff,
  type IntegrationPartnerStatus,
} from "@/lib/db/schema";
import {
  encryptSecret,
  generateApiKey,
  generateClientId,
  generateSecret,
  hashApiKey,
} from "@/lib/partner/crypto";
import { enqueueTestWebhook, redeliverWebhook } from "@/lib/partner/webhook";

const STATUSES: readonly IntegrationPartnerStatus[] = [
  "active",
  "disabled",
  "sandbox",
];

export type ProvisionResult = {
  partnerId: number;
  clientId: string;
  sharedSecret: string;
  apiKey: string;
  tempPassword: string;
  loginEmail: string;
};

/** Create a partner tenant + its exam_partner portal login. Returns one-time secrets. */
export async function createPartnerTenant(input: {
  name: string;
  loginEmail: string;
  firstName?: string;
  lastName?: string;
}): Promise<ProvisionResult> {
  const admin = await requireRole(["super_admin"]);
  const name = input.name?.trim();
  const loginEmail = input.loginEmail?.trim().toLowerCase();
  if (!name) throw new Error("Partner name is required");
  if (!loginEmail || !loginEmail.includes("@")) {
    throw new Error("A valid login email is required");
  }

  const clientId = generateClientId();
  const sharedSecret = generateSecret(32);
  const apiKey = generateApiKey();
  const tempPassword = generateSecret(12);

  const [partner] = await db
    .insert(integrationPartners)
    .values({
      name,
      clientId,
      signingAlg: "HS256",
      sharedSecretEnc: encryptSecret(sharedSecret),
      apiKeyHash: hashApiKey(apiKey),
      status: "active",
    })
    .returning({ id: integrationPartners.id });

  // Create the portal login user via the internal adapter (no session/cookie
  // side effects on the admin). neon-http has no transactions → roll back the
  // tenant row manually if user creation fails.
  const ctx = await auth.$context;
  let newUserId: string;
  try {
    const newUser = await ctx.internalAdapter.createUser({
      email: loginEmail,
      name:
        `${input.firstName ?? ""} ${input.lastName ?? ""}`.trim() || name,
      emailVerified: true,
      role: "exam_partner",
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
    });
    newUserId = newUser.id;
  } catch (err) {
    await db
      .delete(integrationPartners)
      .where(eq(integrationPartners.id, partner.id));
    const msg =
      err instanceof Error && /unique|exists|email|duplicate/i.test(err.message)
        ? "A user with that email already exists"
        : "Failed to create partner login user";
    throw new Error(msg);
  }

  await ctx.internalAdapter.updateUser(newUserId, { role: "exam_partner" });
  const passwordHash = await ctx.password.hash(tempPassword);
  await ctx.internalAdapter.linkAccount({
    userId: newUserId,
    accountId: newUserId,
    providerId: "credential",
    password: passwordHash,
  });

  await db
    .insert(partnerStaff)
    .values({ userId: newUserId, partnerId: partner.id });

  await writeAuditLog(
    admin.user.id,
    "create_partner_tenant",
    "integration_partner",
    partner.id,
    { name, loginEmail },
  );

  revalidatePath("/admin/integrations");
  return {
    partnerId: partner.id,
    clientId,
    sharedSecret,
    apiKey,
    tempPassword,
    loginEmail,
  };
}

/** Update mutable tenant fields (name, status, webhook URL). */
export async function updatePartner(input: {
  partnerId: number;
  name?: string;
  status?: IntegrationPartnerStatus;
  webhookUrl?: string | null;
}) {
  const admin = await requireRole(["super_admin"]);
  const set: Partial<typeof integrationPartners.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.name !== undefined) {
    const n = input.name.trim();
    if (!n) throw new Error("Name cannot be empty");
    set.name = n;
  }
  if (input.status !== undefined) {
    if (!STATUSES.includes(input.status)) throw new Error("Invalid status");
    set.status = input.status;
  }
  if (input.webhookUrl !== undefined) {
    set.webhookUrl = input.webhookUrl?.trim() || null;
  }
  await db
    .update(integrationPartners)
    .set(set)
    .where(eq(integrationPartners.id, input.partnerId));
  await writeAuditLog(
    admin.user.id,
    "update_partner",
    "integration_partner",
    input.partnerId,
    set as Record<string, unknown>,
  );
  revalidatePath("/admin/integrations");
}

/** Rotate the API key. Returns the new plaintext key once. */
export async function regenerateApiKey(
  partnerId: number,
): Promise<{ apiKey: string }> {
  const admin = await requireRole(["super_admin"]);
  const apiKey = generateApiKey();
  await db
    .update(integrationPartners)
    .set({ apiKeyHash: hashApiKey(apiKey), updatedAt: new Date() })
    .where(eq(integrationPartners.id, partnerId));
  await writeAuditLog(
    admin.user.id,
    "regenerate_partner_api_key",
    "integration_partner",
    partnerId,
  );
  revalidatePath("/admin/integrations");
  return { apiKey };
}

/** Rotate the HS256 shared secret. Returns the new plaintext once. */
export async function regenerateSharedSecret(
  partnerId: number,
): Promise<{ sharedSecret: string }> {
  const admin = await requireRole(["super_admin"]);
  const sharedSecret = generateSecret(32);
  await db
    .update(integrationPartners)
    .set({ sharedSecretEnc: encryptSecret(sharedSecret), updatedAt: new Date() })
    .where(eq(integrationPartners.id, partnerId));
  await writeAuditLog(
    admin.user.id,
    "regenerate_partner_shared_secret",
    "integration_partner",
    partnerId,
  );
  revalidatePath("/admin/integrations");
  return { sharedSecret };
}

/** Send a test webhook to the partner's configured URL. */
export async function sendTestWebhook(
  partnerId: number,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireRole(["super_admin"]);
  const result = await enqueueTestWebhook(partnerId);
  await writeAuditLog(
    admin.user.id,
    "send_test_webhook",
    "integration_partner",
    partnerId,
    { ok: result.ok },
  );
  revalidatePath(`/admin/integrations/${partnerId}`);
  return result;
}

/** Re-send a specific webhook delivery. */
export async function resendWebhook(
  deliveryId: number,
  partnerId: number,
): Promise<void> {
  const admin = await requireRole(["super_admin"]);
  await redeliverWebhook(deliveryId);
  await writeAuditLog(
    admin.user.id,
    "resend_webhook",
    "partner_webhook_delivery",
    deliveryId,
  );
  revalidatePath(`/admin/integrations/${partnerId}`);
}

/** Rotate the webhook signing secret. Returns the new plaintext once. */
export async function regenerateWebhookSecret(
  partnerId: number,
): Promise<{ webhookSecret: string }> {
  const admin = await requireRole(["super_admin"]);
  const webhookSecret = generateSecret(32);
  await db
    .update(integrationPartners)
    .set({
      webhookSecretEnc: encryptSecret(webhookSecret),
      updatedAt: new Date(),
    })
    .where(eq(integrationPartners.id, partnerId));
  await writeAuditLog(
    admin.user.id,
    "regenerate_partner_webhook_secret",
    "integration_partner",
    partnerId,
  );
  revalidatePath("/admin/integrations");
  return { webhookSecret };
}
