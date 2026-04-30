"use server";

import { db } from "@/lib/db";
import {
  cycles,
  rounds,
  cycleSubjects,
  participants,
  subjects,
  user,
  results,
  partners,
  careerApplications,
  payments,
  notifications,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { resend, DEFAULT_FROM } from "@/lib/email";

// ── Helpers ───────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function assertEnum<T extends string>(value: string, allowed: readonly T[], label: string): T {
  if (!(allowed as readonly string[]).includes(value)) throw new Error(`Invalid ${label}`);
  return value as T;
}

const CYCLE_STATUSES = ["planning", "registration_open", "active", "completed", "archived"] as const;
const ROUND_FORMATS = ["online", "onsite", "hybrid"] as const;
const ROUND_REG_STATUSES = ["closed", "soon", "open"] as const;
const PARTICIPANT_REG_STATUSES = ["draft", "submitted", "verified", "rejected"] as const;
const USER_ROLES = ["super_admin", "admin", "coordinator", "participant", "partner_contact", "career_applicant"] as const;
const PARTNER_STATUSES = ["pending", "approved", "rejected"] as const;
const CAREER_STATUSES = ["submitted", "reviewing", "shortlisted", "rejected", "hired"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
const AWARD_VALUES = ["gold", "silver", "bronze", "honorable_mention", "participation"] as const;

// ── Cycles ────────────────────────────────────────────────────────────────

export async function createCycle(formData: FormData) {
  await requireRole(["super_admin"]);

  const name = (formData.get("name") as string)?.trim();
  const year = parseInt(formData.get("year") as string);
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || isNaN(year) || year < 2000 || year > 2100) throw new Error("Name and valid year are required");

  try {
    await db.insert(cycles).values({ name, year, description, status: "planning" });
  } catch {
    throw new Error("Failed to create cycle");
  }

  revalidatePath("/admin/cycles");
}

export async function updateCycleStatus(id: number, status: string) {
  await requireRole(["super_admin", "admin"]);
  const validStatus = assertEnum(status, CYCLE_STATUSES, "cycle status");
  await db
    .update(cycles)
    .set({ status: validStatus, updatedAt: new Date() })
    .where(eq(cycles.id, id));
  revalidatePath("/admin/cycles");
}

// ── Rounds ────────────────────────────────────────────────────────────────

export async function createRound(formData: FormData) {
  await requireRole(["super_admin"]);

  const cycleId = parseInt(formData.get("cycleId") as string);
  const name = (formData.get("name") as string)?.trim();
  const order = parseInt(formData.get("order") as string) || 1;
  const rawFormat = (formData.get("format") as string) || "online";
  const startDate = (formData.get("startDate") as string) || null;
  const endDate = (formData.get("endDate") as string) || null;
  const venue = (formData.get("venue") as string)?.trim() || null;
  const feeUsd = parseInt(formData.get("feeUsd") as string) || 0;
  const rawRegStatus = (formData.get("registrationStatus") as string) || "closed";

  if (isNaN(cycleId) || !cycleId || !name) throw new Error("Cycle and round name are required");
  const format = assertEnum(rawFormat, ROUND_FORMATS, "format");
  const registrationStatus = assertEnum(rawRegStatus, ROUND_REG_STATUSES, "registration status");

  await db.insert(rounds).values({
    cycleId,
    name,
    order,
    format,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    venue,
    feeUsd,
    registrationStatus,
  });

  revalidatePath("/admin/cycles");
}

export async function deleteRound(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  await db.delete(rounds).where(eq(rounds.id, id));
  revalidatePath("/admin/cycles");
}

// ── Cycle subjects ─────────────────────────────────────────────────────────

export async function addCycleSubject(formData: FormData) {
  await requireRole(["super_admin"]);
  const cycleId = parseInt(formData.get("cycleId") as string);
  const subjectId = parseInt(formData.get("subjectId") as string);
  if (!cycleId || !subjectId) return;
  try {
    await db.insert(cycleSubjects).values({ cycleId, subjectId });
  } catch {
    // ignore duplicate
  }
  revalidatePath("/admin/cycles");
}

export async function removeCycleSubject(formData: FormData) {
  await requireRole(["super_admin"]);
  const cycleId = parseInt(formData.get("cycleId") as string);
  const subjectId = parseInt(formData.get("subjectId") as string);
  await db
    .delete(cycleSubjects)
    .where(and(eq(cycleSubjects.cycleId, cycleId), eq(cycleSubjects.subjectId, subjectId)));
  revalidatePath("/admin/cycles");
}

// ── Participants ──────────────────────────────────────────────────────────

export async function updateParticipantStatus(formData: FormData) {
  await requireRole(["super_admin", "admin"]);
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id) || !id) throw new Error("Invalid request");
  const status = assertEnum(formData.get("status") as string, PARTICIPANT_REG_STATUSES, "status");
  await db
    .update(participants)
    .set({ registrationStatus: status, updatedAt: new Date() })
    .where(eq(participants.id, id));
  revalidatePath("/admin/participants");
}

// ── Users ─────────────────────────────────────────────────────────────────

export async function updateUserRole(formData: FormData) {
  const session = await requireRole(["super_admin"]);
  const userId = formData.get("userId") as string;
  if (!userId || userId === session.user.id) throw new Error("Invalid request");
  const role = assertEnum(formData.get("role") as string, USER_ROLES, "role");
  await db
    .update(user)
    .set({ role })
    .where(eq(user.id, userId));
  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const session = await requireRole(["super_admin"]);
  const userId = formData.get("userId") as string;
  if (!userId || userId === session.user.id) return;
  await db.delete(user).where(eq(user.id, userId));
  revalidatePath("/admin/users");
}

// ── Subjects ──────────────────────────────────────────────────────────────

export async function createSubject(formData: FormData) {
  await requireRole(["super_admin"]);
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const order = parseInt(formData.get("order") as string) || 0;
  if (!name || !slug) throw new Error("Name and slug are required");
  await db.insert(subjects).values({ name, slug, description, order, active: true });
  revalidatePath("/admin/subjects");
}

export async function toggleSubjectActive(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  const active = formData.get("active") === "true";
  await db.update(subjects).set({ active: !active }).where(eq(subjects.id, id));
  revalidatePath("/admin/subjects");
}

// ── Partners ──────────────────────────────────────────────────────────────

export async function updatePartnerStatus(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id) || !id) throw new Error("Invalid request");
  const status = assertEnum(formData.get("status") as string, PARTNER_STATUSES, "status");
  await db
    .update(partners)
    .set({ status, updatedAt: new Date() })
    .where(eq(partners.id, id));
  revalidatePath("/admin/partners");
}

// ── Careers ───────────────────────────────────────────────────────────────

export async function updateCareerStatus(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id) || !id) throw new Error("Invalid request");
  const status = assertEnum(formData.get("status") as string, CAREER_STATUSES, "status");
  await db
    .update(careerApplications)
    .set({ status, updatedAt: new Date() })
    .where(eq(careerApplications.id, id));
  revalidatePath("/admin/careers");
}

// ── Results ───────────────────────────────────────────────────────────────

export async function addResult(formData: FormData) {
  await requireRole(["super_admin", "admin"]);
  const participantId = parseInt(formData.get("participantId") as string);
  const subjectId = parseInt(formData.get("subjectId") as string);
  const cycleId = parseInt(formData.get("cycleId") as string);
  const roundId = parseInt(formData.get("roundId") as string) || null;
  const score = (formData.get("score") as string)?.trim() || null;
  const maxScore = (formData.get("maxScore") as string)?.trim() || null;
  const rank = parseInt(formData.get("rank") as string) || null;
  const award = (formData.get("award") as string) || null;

  await db.insert(results).values({
    participantId,
    subjectId,
    cycleId,
    roundId,
    score,
    maxScore,
    rank,
    award: award as typeof results.$inferInsert.award ?? null,
    publishedAt: new Date(),
  });

  revalidatePath("/admin/results");
}

// ── Seed ──────────────────────────────────────────────────────────────────

export async function seedDefaultSubjects() {
  await requireRole(["super_admin"]);

  const defaults = [
    { slug: "mathematics", name: "Mathematics", description: "Pure and applied mathematics — algebra, analysis, combinatorics, geometry, number theory.", order: 1 },
    { slug: "physics", name: "Physics", description: "Classical mechanics, electrodynamics, thermodynamics, optics, modern physics.", order: 2 },
    { slug: "chemistry", name: "Chemistry", description: "Organic, inorganic, physical, and analytical chemistry.", order: 3 },
    { slug: "biology", name: "Biology", description: "Molecular biology, genetics, biochemistry, cell biology, ecology.", order: 4 },
    { slug: "competitive-programming", name: "Competitive Programming", description: "Algorithms, data structures, computational problem-solving.", order: 5 },
    { slug: "english", name: "English", description: "Academic English — reading comprehension, writing, language analysis.", order: 6 },
  ];

  for (const s of defaults) {
    const existing = await db.query.subjects.findFirst({ where: eq(subjects.slug, s.slug) });
    if (!existing) {
      await db.insert(subjects).values({ ...s, active: true });
    }
  }

  revalidatePath("/admin/subjects");
}

// ── Payments ──────────────────────────────────────────────────────────────

export async function updatePaymentStatus(formData: FormData) {
  await requireRole(["super_admin", "admin"]);
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id) || !id) throw new Error("Invalid request");
  const status = assertEnum(formData.get("status") as string, PAYMENT_STATUSES, "status");
  await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.id, id));
  revalidatePath("/admin/payments");
}

// ── Notifications ─────────────────────────────────────────────────────────

export async function sendNotification(formData: FormData) {
  const session = await requireRole(["super_admin", "admin"]);

  const subject = (formData.get("subject") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const recipientFilter = (formData.get("recipientFilter") as string) || "all";
  const cycleIdRaw = formData.get("cycleId") as string;
  const cycleId = cycleIdRaw ? parseInt(cycleIdRaw) : null;

  if (!subject || !body) throw new Error("Subject and body are required");

  let recipients: { email: string; name: string }[] = [];

  if (recipientFilter === "all") {
    const allUsers = await db.query.user.findMany({
      where: eq(user.emailVerified, true),
    });
    recipients = allUsers.map((u) => ({ email: u.email, name: u.name }));
  } else if (cycleId) {
    const participantList = await db.query.participants.findMany({
      where: eq(participants.cycleId, cycleId),
      with: { user: true },
    });
    recipients = participantList
      .filter((p) => p.user?.email)
      .map((p) => ({ email: p.user!.email, name: p.user!.name }));
  }

  let sentCount = 0;
  for (const recipient of recipients) {
    try {
      await resend.emails.send({
        from: DEFAULT_FROM,
        to: recipient.email,
        subject,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <h2 style="color:#1a2634;font-weight:300;">${escapeHtml(subject)}</h2>
          <div style="color:#4a5568;line-height:1.8;">${escapeHtml(body).replace(/\n/g, "<br>")}</div>
          <hr style="margin:30px 0;border:none;border-top:1px solid #e2e8f0;">
          <p style="color:#9ca3af;font-size:12px;">G.A.T.E. Assessment Platform</p>
        </div>`,
      });
      sentCount++;
    } catch {
      // continue sending to others if one fails
    }
  }

  await db.insert(notifications).values({
    subject,
    body,
    recipientFilter,
    cycleId,
    sentByUserId: session.user.id,
    recipientCount: sentCount,
    sentAt: new Date(),
  });

  revalidatePath("/admin/notifications");
}

// ── Cycle delete ──────────────────────────────────────────────────────────

export async function deleteCycle(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  if (!id) return;

  const linked = await db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.cycleId, id))
    .limit(1);
  if (linked.length > 0) throw new Error("Cannot delete a cycle that has participants");

  await db.update(payments).set({ cycleId: null }).where(eq(payments.cycleId, id));
  await db.delete(results).where(eq(results.cycleId, id));
  await db.delete(cycles).where(eq(cycles.id, id));

  revalidatePath("/admin/cycles");
}

// ── Cycle full edit ────────────────────────────────────────────────────────

export async function updateCycle(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  const name = (formData.get("name") as string)?.trim();
  const year = parseInt(formData.get("year") as string);
  const description = (formData.get("description") as string)?.trim() || null;
  const stripeFeePercent = parseInt(formData.get("stripeFeePercent") as string) || 290;
  const stripeFeeFixedCents = parseInt(formData.get("stripeFeeFixedCents") as string) || 30;
  const rawStatus = formData.get("status") as string;

  if (isNaN(id) || !id || !name || isNaN(year) || year < 2000 || year > 2100) throw new Error("Required fields missing");
  const status = assertEnum(rawStatus, CYCLE_STATUSES, "status");

  await db
    .update(cycles)
    .set({ name, year, description, stripeFeePercent, stripeFeeFixedCents, status, updatedAt: new Date() })
    .where(eq(cycles.id, id));

  revalidatePath("/admin/cycles");
  revalidatePath(`/admin/cycles/${id}`);
}

// ── Round full edit ────────────────────────────────────────────────────────

export async function updateRound(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  const name = (formData.get("name") as string)?.trim();
  const order = parseInt(formData.get("order") as string) || 1;
  const rawFormat = formData.get("format") as string;
  const startDate = (formData.get("startDate") as string) || null;
  const endDate = (formData.get("endDate") as string) || null;
  const venue = (formData.get("venue") as string)?.trim() || null;
  const feeUsd = parseInt(formData.get("feeUsd") as string) || 0;
  const rawRegStatus = (formData.get("registrationStatus") as string) || "closed";

  if (isNaN(id) || !id || !name) throw new Error("Round id and name required");
  const format = assertEnum(rawFormat, ROUND_FORMATS, "format");
  const registrationStatus = assertEnum(rawRegStatus, ROUND_REG_STATUSES, "registration status");

  await db
    .update(rounds)
    .set({ name, order, format, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, venue, feeUsd, registrationStatus })
    .where(eq(rounds.id, id));

  revalidatePath("/admin/cycles");
}

// ── Results upsert/delete ─────────────────────────────────────────────────

export async function upsertResult(formData: FormData) {
  await requireRole(["super_admin", "admin"]);

  const resultId = parseInt(formData.get("resultId") as string) || null;
  const participantId = parseInt(formData.get("participantId") as string);
  const subjectId = parseInt(formData.get("subjectId") as string);
  const cycleId = parseInt(formData.get("cycleId") as string);
  const roundId = parseInt(formData.get("roundId") as string) || null;
  const score = (formData.get("score") as string)?.trim() || null;
  const maxScore = (formData.get("maxScore") as string)?.trim() || null;
  const rank = parseInt(formData.get("rank") as string) || null;
  const awardRaw = (formData.get("award") as string)?.trim() || "";
  const publishedAtRaw = (formData.get("publishedAt") as string)?.trim() || "";

  if (isNaN(participantId) || isNaN(subjectId) || isNaN(cycleId)) throw new Error("Invalid request");
  const award = awardRaw ? assertEnum(awardRaw, AWARD_VALUES, "award") : null;

  const vals = {
    participantId,
    subjectId,
    cycleId,
    roundId,
    score: score || null,
    maxScore: maxScore || null,
    rank: rank || null,
    award,
    publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : null,
  };

  if (resultId) {
    await db.update(results).set(vals).where(eq(results.id, resultId));
  } else {
    await db.insert(results).values(vals);
  }

  revalidatePath(`/admin/cycles/${cycleId}`);
  revalidatePath(`/admin/participants/${participantId}`);
}

export async function deleteResult(formData: FormData) {
  await requireRole(["super_admin", "admin"]);
  const id = parseInt(formData.get("id") as string);
  const cycleId = parseInt(formData.get("cycleId") as string) || 0;
  if (!id) return;
  await db.delete(results).where(eq(results.id, id));
  if (cycleId) revalidatePath(`/admin/cycles/${cycleId}`);
  revalidatePath("/admin/cycles");
}
