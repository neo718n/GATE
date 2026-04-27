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

// ── Cycles ────────────────────────────────────────────────────────────────

export async function createCycle(formData: FormData) {
  await requireRole(["super_admin"]);

  const name = (formData.get("name") as string)?.trim();
  const year = parseInt(formData.get("year") as string);
  const fee = parseInt(formData.get("registrationFeeUsd") as string) || 0;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !year) throw new Error("Name and year are required");

  try {
    await db.insert(cycles).values({ name, year, description, registrationFeeUsd: fee, status: "planning" });
  } catch (e) {
    throw new Error(`Failed to create cycle: ${e instanceof Error ? e.message : String(e)}`);
  }

  revalidatePath("/admin/cycles");
}

export async function updateCycleStatus(id: number, status: string) {
  await requireRole(["super_admin", "admin"]);
  await db
    .update(cycles)
    .set({ status: status as typeof cycles.$inferInsert.status, updatedAt: new Date() })
    .where(eq(cycles.id, id));
  revalidatePath("/admin/cycles");
}

// ── Rounds ────────────────────────────────────────────────────────────────

export async function createRound(formData: FormData) {
  await requireRole(["super_admin"]);

  const cycleId = parseInt(formData.get("cycleId") as string);
  const name = (formData.get("name") as string)?.trim();
  const order = parseInt(formData.get("order") as string) || 1;
  const format = (formData.get("format") as string) || "online";
  const startDate = (formData.get("startDate") as string) || null;
  const endDate = (formData.get("endDate") as string) || null;
  const venue = (formData.get("venue") as string)?.trim() || null;

  if (!cycleId || !name) throw new Error("Cycle and round name are required");

  await db.insert(rounds).values({
    cycleId,
    name,
    order,
    format: format as typeof rounds.$inferInsert.format,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    venue,
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
  const status = formData.get("status") as string;
  await db
    .update(participants)
    .set({
      registrationStatus: status as typeof participants.$inferInsert.registrationStatus,
      updatedAt: new Date(),
    })
    .where(eq(participants.id, id));
  revalidatePath("/admin/participants");
}

// ── Users ─────────────────────────────────────────────────────────────────

export async function updateUserRole(formData: FormData) {
  await requireRole(["super_admin"]);
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  await db
    .update(user)
    .set({ role: role as typeof user.$inferInsert.role })
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
  const status = formData.get("status") as string;
  await db
    .update(partners)
    .set({ status: status as typeof partners.$inferInsert.status, updatedAt: new Date() })
    .where(eq(partners.id, id));
  revalidatePath("/admin/partners");
}

// ── Careers ───────────────────────────────────────────────────────────────

export async function updateCareerStatus(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  const status = formData.get("status") as string;
  await db
    .update(careerApplications)
    .set({ status: status as typeof careerApplications.$inferInsert.status, updatedAt: new Date() })
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
  const status = formData.get("status") as string;
  await db
    .update(payments)
    .set({
      status: status as typeof payments.$inferInsert.status,
      updatedAt: new Date(),
    })
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
          <h2 style="color:#1a2634;font-weight:300;">${subject}</h2>
          <div style="color:#4a5568;line-height:1.8;">${body.replace(/\n/g, "<br>")}</div>
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
