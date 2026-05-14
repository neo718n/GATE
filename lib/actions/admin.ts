"use server";

import { db } from "@/lib/db";
import {
  cycles,
  rounds,
  cycleSubjects,
  participants,
  subjects,
  user,
  session as sessionTable,
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
import { writeAuditLog } from "@/lib/audit";

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

/**
 * Creates a new assessment cycle.
 * Requires super_admin role. Initializes cycle with "planning" status.
 *
 * @param formData - Form data containing cycle details:
 *   - name (string, required): Display name for the cycle
 *   - year (string, required): Year as integer between 2000-2100
 *   - description (string, optional): Detailed cycle description
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If name is missing or year is invalid
 * @throws {Error} If database insertion fails
 */
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

/**
 * Updates the status of an existing cycle.
 * Requires super_admin or admin role. Status must be one of: planning, registration_open, active, completed, archived.
 *
 * @param id - Numeric ID of the cycle to update
 * @param status - New status value (validated against CYCLE_STATUSES enum)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks required role
 * @throws {Error} If status is not a valid cycle status
 */
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

/**
 * Creates a new round within a cycle.
 * Requires super_admin role. Format must be one of: online, onsite, hybrid.
 * Registration status must be one of: closed, soon, open.
 *
 * @param formData - Form data containing round details:
 *   - cycleId (string, required): Parent cycle ID
 *   - name (string, required): Round display name
 *   - order (string, optional): Display order (defaults to 1)
 *   - format (string, optional): Round format - online/onsite/hybrid (defaults to "online")
 *   - startDate (string, optional): ISO date string for round start
 *   - endDate (string, optional): ISO date string for round end
 *   - venue (string, optional): Physical location for onsite/hybrid rounds
 *   - feeUsd (string, optional): Registration fee in USD cents (defaults to 0)
 *   - registrationStatus (string, optional): closed/soon/open (defaults to "closed")
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If cycleId or name is missing
 * @throws {Error} If format is not a valid round format
 * @throws {Error} If registrationStatus is not a valid registration status
 */
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

/**
 * Deletes a round from the system.
 * Requires super_admin role. Warning: This will cascade delete related data.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric ID of the round to delete
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 */
export async function deleteRound(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  await db.delete(rounds).where(eq(rounds.id, id));
  revalidatePath("/admin/cycles");
}

// ── Cycle subjects ─────────────────────────────────────────────────────────

/**
 * Associates a subject with a cycle.
 * Requires super_admin role. Silently ignores duplicate associations.
 *
 * @param formData - Form data containing:
 *   - cycleId (string, required): Numeric cycle ID
 *   - subjectId (string, required): Numeric subject ID
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 */
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

/**
 * Removes a subject association from a cycle.
 * Requires super_admin role.
 *
 * @param formData - Form data containing:
 *   - cycleId (string, required): Numeric cycle ID
 *   - subjectId (string, required): Numeric subject ID
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 */
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

/**
 * Updates a participant's registration status.
 * Requires super_admin or admin role. Status must be one of: draft, submitted, verified, rejected.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric participant ID
 *   - status (string, required): New registration status (validated against PARTICIPANT_REG_STATUSES)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks required role
 * @throws {Error} If id is invalid or missing
 * @throws {Error} If status is not a valid participant registration status
 */
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

/**
 * Updates a user's role and invalidates their sessions.
 * Requires super_admin role. Prevents modifying own role. Role must be one of: super_admin, admin, coordinator, participant, partner_contact, career_applicant.
 * Logs the change to audit trail.
 *
 * @param formData - Form data containing:
 *   - userId (string, required): User ID to update
 *   - role (string, required): New role value (validated against USER_ROLES)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If userId is missing or matches current user
 * @throws {Error} If role is not a valid user role
 */
export async function updateUserRole(formData: FormData) {
  const authSession = await requireRole(["super_admin"]);
  const userId = formData.get("userId") as string;
  if (!userId || userId === authSession.user.id) throw new Error("Invalid request");
  const role = assertEnum(formData.get("role") as string, USER_ROLES, "role");
  const prevUser = await db.query.user.findFirst({ where: eq(user.id, userId) });
  await db
    .update(user)
    .set({ role })
    .where(eq(user.id, userId));
  // Invalidate all active sessions so the role change takes effect immediately
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
  await writeAuditLog(authSession.user.id, "update_user_role", "user", userId, {
    from: prevUser?.role,
    to: role,
  });
  revalidatePath("/admin/users");
}

/**
 * Deletes a user account from the system.
 * Requires super_admin role. Prevents deleting own account. Logs the deletion to audit trail.
 *
 * @param formData - Form data containing:
 *   - userId (string, required): User ID to delete
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 */
export async function deleteUser(formData: FormData) {
  const session = await requireRole(["super_admin"]);
  const userId = formData.get("userId") as string;
  if (!userId || userId === session.user.id) return;
  const target = await db.query.user.findFirst({ where: eq(user.id, userId) });
  await db.delete(user).where(eq(user.id, userId));
  await writeAuditLog(session.user.id, "delete_user", "user", userId, {
    email: target?.email,
    role: target?.role,
  });
  revalidatePath("/admin/users");
}

// ── Subjects ──────────────────────────────────────────────────────────────

/**
 * Creates a new subject in the system.
 * Requires super_admin role. Subject is created as active by default.
 *
 * @param formData - Form data containing:
 *   - name (string, required): Display name for the subject
 *   - slug (string, required): URL-safe identifier
 *   - description (string, optional): Detailed subject description
 *   - order (string, optional): Display order (defaults to 0)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If name or slug is missing
 */
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

/**
 * Toggles a subject's active status.
 * Requires super_admin role. Flips the boolean active field.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric subject ID
 *   - active (string, required): Current active status as "true" or "false"
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 */
export async function toggleSubjectActive(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = parseInt(formData.get("id") as string);
  const active = formData.get("active") === "true";
  await db.update(subjects).set({ active: !active }).where(eq(subjects.id, id));
  revalidatePath("/admin/subjects");
}

// ── Partners ──────────────────────────────────────────────────────────────

/**
 * Updates a partner's application status.
 * Requires super_admin role. Status must be one of: pending, approved, rejected.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric partner ID
 *   - status (string, required): New status (validated against PARTNER_STATUSES)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If id is invalid or missing
 * @throws {Error} If status is not a valid partner status
 */
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

/**
 * Updates a career application's status.
 * Requires super_admin role. Status must be one of: submitted, reviewing, shortlisted, rejected, hired.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric career application ID
 *   - status (string, required): New status (validated against CAREER_STATUSES)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If id is invalid or missing
 * @throws {Error} If status is not a valid career status
 */
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

/**
 * Adds a new result record for a participant.
 * Requires super_admin or admin role. Sets publishedAt to current timestamp.
 *
 * @param formData - Form data containing:
 *   - participantId (string, required): Numeric participant ID
 *   - subjectId (string, required): Numeric subject ID
 *   - cycleId (string, required): Numeric cycle ID
 *   - roundId (string, optional): Numeric round ID
 *   - score (string, optional): Participant's score (free text)
 *   - maxScore (string, optional): Maximum possible score (free text)
 *   - rank (string, optional): Numeric rank position
 *   - award (string, optional): Award type (gold, silver, bronze, honorable_mention, participation)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks required role
 */
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

/**
 * Seeds the database with default subject entries.
 * Requires super_admin role. Creates 6 subjects: Mathematics, Physics, Chemistry, Biology, Competitive Programming, English.
 * Skips subjects that already exist (identified by slug).
 *
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 */
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

/**
 * Updates a payment's status.
 * Requires super_admin or admin role. Status must be one of: pending, paid, failed, refunded.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric payment ID
 *   - status (string, required): New status (validated against PAYMENT_STATUSES)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks required role
 * @throws {Error} If id is invalid or missing
 * @throws {Error} If status is not a valid payment status
 */
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

/**
 * Sends a bulk email notification to users.
 * Requires super_admin or admin role. Recipients can be filtered to "all" verified users or participants in a specific cycle.
 * Continues sending to remaining recipients if individual sends fail. Records notification in database.
 *
 * @param formData - Form data containing:
 *   - subject (string, required): Email subject line
 *   - body (string, required): Email body text (escaped HTML, newlines converted to <br>)
 *   - recipientFilter (string, optional): "all" for all users or cycle-specific (defaults to "all")
 *   - cycleId (string, optional): Numeric cycle ID when filtering by cycle participants
 * @returns {Promise<void>}
 * @throws {Error} If user lacks required role
 * @throws {Error} If subject or body is missing
 */
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
      .filter((p) => (p.user as any)?.email)
      .map((p) => ({ email: (p.user as any).email as string, name: (p.user as any).name as string }));
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

/**
 * Deletes a cycle and its associated data.
 * Requires super_admin role. Prevents deletion if cycle has participants.
 * Nullifies cycle reference in payments, deletes results, then deletes the cycle.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric cycle ID
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If cycle has associated participants
 */
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

/**
 * Updates all fields of an existing cycle.
 * Requires super_admin role. Status must be valid cycle status.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric cycle ID
 *   - name (string, required): Display name
 *   - year (string, required): Year as integer between 2000-2100
 *   - description (string, optional): Detailed description
 *   - stripeFeePercent (string, optional): Stripe fee percentage in basis points (defaults to 290)
 *   - stripeFeeFixedCents (string, optional): Stripe fixed fee in cents (defaults to 30)
 *   - status (string, required): Cycle status (validated against CYCLE_STATUSES)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If required fields are missing or invalid
 * @throws {Error} If status is not a valid cycle status
 */
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

/**
 * Updates all fields of an existing round.
 * Requires super_admin role. Format and registration status must be valid enum values.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric round ID
 *   - name (string, required): Round display name
 *   - order (string, optional): Display order (defaults to 1)
 *   - format (string, required): Round format - online/onsite/hybrid (validated against ROUND_FORMATS)
 *   - startDate (string, optional): ISO date string for round start
 *   - endDate (string, optional): ISO date string for round end
 *   - venue (string, optional): Physical location
 *   - feeUsd (string, optional): Registration fee in USD cents (defaults to 0)
 *   - registrationStatus (string, optional): closed/soon/open (defaults to "closed", validated against ROUND_REG_STATUSES)
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If id or name is missing
 * @throws {Error} If format is not a valid round format
 * @throws {Error} If registrationStatus is not a valid registration status
 */
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

/**
 * Creates a new result or updates an existing one.
 * Requires super_admin or admin role. If resultId is provided, updates; otherwise creates new.
 * Award must be valid enum value if provided.
 *
 * @param formData - Form data containing:
 *   - resultId (string, optional): Numeric result ID for updates
 *   - participantId (string, required): Numeric participant ID
 *   - subjectId (string, required): Numeric subject ID
 *   - cycleId (string, required): Numeric cycle ID
 *   - roundId (string, optional): Numeric round ID
 *   - score (string, optional): Participant's score (free text)
 *   - maxScore (string, optional): Maximum possible score (free text)
 *   - rank (string, optional): Numeric rank position
 *   - award (string, optional): Award type (validated against AWARD_VALUES: gold, silver, bronze, honorable_mention, participation)
 *   - publishedAt (string, optional): ISO date string for publication timestamp
 * @returns {Promise<void>}
 * @throws {Error} If user lacks required role
 * @throws {Error} If participantId, subjectId, or cycleId is invalid
 * @throws {Error} If award is provided but not a valid award value
 */
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

/**
 * Deletes a result record.
 * Requires super_admin or admin role.
 *
 * @param formData - Form data containing:
 *   - id (string, required): Numeric result ID
 *   - cycleId (string, optional): Numeric cycle ID for path revalidation
 * @returns {Promise<void>}
 * @throws {Error} If user lacks required role
 */
export async function deleteResult(formData: FormData) {
  await requireRole(["super_admin", "admin"]);
  const id = parseInt(formData.get("id") as string);
  const cycleId = parseInt(formData.get("cycleId") as string) || 0;
  if (!id) return;
  await db.delete(results).where(eq(results.id, id));
  if (cycleId) revalidatePath(`/admin/cycles/${cycleId}`);
  revalidatePath("/admin/cycles");
}

// ─── Question Provider Management ────────────────────────────────────────────

/**
 * Creates a new question provider account.
 * Requires super_admin role. Creates user account via Better Auth, then sets role to "question_provider" and marks email as verified.
 *
 * @param formData - Form data containing:
 *   - email (string, required): Email address (converted to lowercase)
 *   - password (string, required): Password (minimum 8 characters)
 *   - name (string, required): Display name
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 * @throws {Error} If any required field is missing
 * @throws {Error} If password is less than 8 characters
 * @throws {Error} If Better Auth sign-up fails
 */
export async function createQuestionProvider(formData: FormData) {
  await requireRole("super_admin");
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string).trim();

  if (!email || !password || !name) throw new Error("All fields required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const { auth } = await import("@/lib/auth");
  const baseUrl =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const req = new Request(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const res = await auth.handler(req);
  if (!res.ok) {
    const data = (await res.json()) as { message?: string };
    throw new Error(data.message ?? "Failed to create account");
  }

  await db
    .update(user)
    .set({ role: "question_provider", emailVerified: true })
    .where(eq(user.email, email));

  revalidatePath("/admin/question-providers");
}

/**
 * Deletes a question provider account.
 * Requires super_admin role.
 *
 * @param formData - Form data containing:
 *   - userId (string, required): User ID of the question provider to delete
 * @returns {Promise<void>}
 * @throws {Error} If user lacks super_admin role
 */
export async function deleteQuestionProvider(formData: FormData) {
  await requireRole("super_admin");
  const userId = formData.get("userId") as string;
  if (!userId) return;
  await db.delete(user).where(eq(user.id, userId));
  revalidatePath("/admin/question-providers");
}
