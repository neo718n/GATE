/**
 * Outbound partner webhooks (server-only). Events are persisted to
 * `partner_webhook_deliveries` (idempotent per event+session) and delivered
 * best-effort immediately, with exponential-backoff retries via the cron route.
 *
 * Signature header: `X-GATE-Signature: t=<unix>,v1=<hmac-sha256(secret, `${t}.${body}`)>`
 */
import { createHmac } from "node:crypto";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  examSessions,
  integrationPartners,
  partnerParticipants,
  partnerWebhookDeliveries,
} from "@/lib/db/schema";
import { decryptSecret } from "./crypto";

export type WebhookEvent = "exam.submitted" | "result.finalized";

// Retry backoff per attempt: 1m, 5m, 30m, 2h (then capped); give up after 8.
const BACKOFF_MS = [60_000, 300_000, 1_800_000, 7_200_000];
const MAX_ATTEMPTS = 8;

export function signWebhook(secret: string, body: string): string {
  const t = Math.floor(Date.now() / 1000);
  const mac = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  return `t=${t},v1=${mac}`;
}

async function sendOnce(
  url: string,
  secret: string,
  event: string,
  deliveryId: string,
  payload: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const body = JSON.stringify(payload);
  const timeoutMs = Number(process.env.PARTNER_WEBHOOK_TIMEOUT_MS ?? "10000");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GATE-Event": event,
        "X-GATE-Delivery": deliveryId,
        "X-GATE-Signature": signWebhook(secret, body),
      },
      body,
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "fetch failed" };
  } finally {
    clearTimeout(timer);
  }
}

async function attemptDelivery(id: number): Promise<void> {
  const [d] = await db
    .select()
    .from(partnerWebhookDeliveries)
    .where(eq(partnerWebhookDeliveries.id, id))
    .limit(1);
  if (!d || d.status === "delivered") return;

  const [partner] = await db
    .select()
    .from(integrationPartners)
    .where(eq(integrationPartners.id, d.partnerId))
    .limit(1);

  const attempts = d.attempts + 1;

  if (!partner?.webhookUrl || !partner.webhookSecretEnc) {
    await db
      .update(partnerWebhookDeliveries)
      .set({
        status: "failed",
        attempts,
        lastError: "No webhook URL/secret configured",
        nextAttemptAt: null,
        updatedAt: new Date(),
      })
      .where(eq(partnerWebhookDeliveries.id, id));
    return;
  }

  const result = await sendOnce(
    partner.webhookUrl,
    decryptSecret(partner.webhookSecretEnc),
    d.event,
    d.deliveryId,
    d.payload,
  );

  if (result.ok) {
    await db
      .update(partnerWebhookDeliveries)
      .set({
        status: "delivered",
        attempts,
        lastError: null,
        nextAttemptAt: null,
        updatedAt: new Date(),
      })
      .where(eq(partnerWebhookDeliveries.id, id));
  } else {
    const giveUp = attempts >= MAX_ATTEMPTS;
    const next = giveUp
      ? null
      : new Date(
          Date.now() + BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)],
        );
    await db
      .update(partnerWebhookDeliveries)
      .set({
        status: giveUp ? "failed" : "pending",
        attempts,
        lastError: result.error ?? "delivery failed",
        nextAttemptAt: next,
        updatedAt: new Date(),
      })
      .where(eq(partnerWebhookDeliveries.id, id));
  }
}

/**
 * Build + enqueue a webhook for an exam session. Idempotent per (event,session):
 * a duplicate is skipped via the unique deliveryId. Attempts delivery inline.
 */
export async function enqueuePartnerWebhook(
  sessionId: number,
  event: WebhookEvent,
): Promise<void> {
  const [s] = await db
    .select({
      partnerId: examSessions.partnerId,
      examId: examSessions.examId,
      participantId: examSessions.participantId,
      assignment: examSessions.externalAssignmentId,
      status: examSessions.status,
      score: examSessions.score,
    })
    .from(examSessions)
    .where(eq(examSessions.id, sessionId))
    .limit(1);
  if (!s || !s.partnerId) return;

  const [partner] = await db
    .select({ clientId: integrationPartners.clientId })
    .from(integrationPartners)
    .where(eq(integrationPartners.id, s.partnerId))
    .limit(1);
  if (!partner) return;

  const [pp] = await db
    .select({ ext: partnerParticipants.externalUserId })
    .from(partnerParticipants)
    .where(
      and(
        eq(partnerParticipants.partnerId, s.partnerId),
        eq(partnerParticipants.participantId, s.participantId),
      ),
    )
    .limit(1);

  const deliveryId = `${event}:${sessionId}`;
  const payload = {
    event,
    delivery_id: deliveryId,
    occurred_at: new Date().toISOString(),
    partner_client_id: partner.clientId,
    external_user_id: pp?.ext ?? null,
    external_assignment_id: s.assignment ?? null,
    exam_ref: s.examId,
    status: s.status,
    score: s.score != null ? Number(s.score) : null,
    max_score: 100,
  };

  const inserted = await db
    .insert(partnerWebhookDeliveries)
    .values({
      partnerId: s.partnerId,
      event,
      payload,
      deliveryId,
      status: "pending",
      nextAttemptAt: new Date(),
    })
    .onConflictDoNothing({ target: partnerWebhookDeliveries.deliveryId })
    .returning({ id: partnerWebhookDeliveries.id });
  if (inserted.length === 0) return; // already enqueued/delivered

  await attemptDelivery(inserted[0].id);
}

/** Re-deliver a specific delivery row (admin "Resend"). */
export async function redeliverWebhook(id: number): Promise<void> {
  await attemptDelivery(id);
}

/** Send a one-off test webhook and report the immediate result. */
export async function enqueueTestWebhook(
  partnerId: number,
): Promise<{ ok: boolean; error?: string }> {
  const [partner] = await db
    .select()
    .from(integrationPartners)
    .where(eq(integrationPartners.id, partnerId))
    .limit(1);
  if (!partner?.webhookUrl || !partner.webhookSecretEnc) {
    return { ok: false, error: "No webhook URL/secret configured" };
  }
  const deliveryId = `test:${Date.now()}`;
  const [row] = await db
    .insert(partnerWebhookDeliveries)
    .values({
      partnerId,
      event: "test",
      payload: {
        event: "test",
        delivery_id: deliveryId,
        occurred_at: new Date().toISOString(),
        partner_client_id: partner.clientId,
        message: "GATE partner webhook test",
      },
      deliveryId,
      status: "pending",
      nextAttemptAt: new Date(),
    })
    .returning({ id: partnerWebhookDeliveries.id });

  await attemptDelivery(row.id);

  const [d] = await db
    .select({
      status: partnerWebhookDeliveries.status,
      lastError: partnerWebhookDeliveries.lastError,
    })
    .from(partnerWebhookDeliveries)
    .where(eq(partnerWebhookDeliveries.id, row.id))
    .limit(1);
  return d?.status === "delivered"
    ? { ok: true }
    : { ok: false, error: d?.lastError ?? "Delivery failed" };
}

/** Process due retries (called by the cron route). */
export async function processDueWebhooks(
  limit = 25,
): Promise<{ processed: number }> {
  const due = await db
    .select({ id: partnerWebhookDeliveries.id })
    .from(partnerWebhookDeliveries)
    .where(
      and(
        eq(partnerWebhookDeliveries.status, "pending"),
        lte(partnerWebhookDeliveries.nextAttemptAt, new Date()),
      ),
    )
    .limit(limit);
  for (const d of due) await attemptDelivery(d.id);
  return { processed: due.length };
}
