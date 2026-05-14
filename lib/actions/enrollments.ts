"use server";

import { db } from "@/lib/db";
import { enrollments, participantSubjects, participants, rounds, subjects, payments } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";

/**
 * Server actions for managing participant enrollments.
 *
 * This module provides functions for:
 * - Creating new enrollments (multiple programs per participant)
 * - Fetching participant enrollments with related data
 * - Updating enrollment status transitions
 * - Managing enrollment lifecycle (draft → pending_payment → confirmed → cancelled)
 *
 * Authorization: Most actions require participant, admin, or super_admin role.
 * Enrollment ownership is verified by matching participant.userId with session user.
 */

/**
 * Creates a new enrollment for a participant in a specific round.
 * Authorization: Requires participant, admin, or super_admin role. Verifies participant.userId matches session user.
 * Prevents duplicate enrollments using UNIQUE(participantId, roundId, subjectId) constraint.
 * Only allows enrollment if round registration status is "open".
 * Creates enrollment with status="draft" and paymentStatus="unpaid" by default.
 * @param formData - Form data containing: participantId, roundId, subjectId (optional)
 * @throws {Error} "All fields are required" if participantId or roundId missing
 * @throws {Error} "Unauthorized" if participant doesn't belong to session user
 * @throws {Error} "Round not found or registration is closed" if round doesn't exist or is not accepting registrations
 * @throws {Error} "You are already enrolled in this program" if duplicate enrollment detected
 */
export async function createEnrollment(formData: FormData) {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participantId = parseInt(formData.get("participantId") as string);
  const roundId = parseInt(formData.get("roundId") as string);
  const subjectIdRaw = formData.get("subjectId") as string;
  const subjectId = subjectIdRaw ? parseInt(subjectIdRaw) : null;

  if (isNaN(participantId) || isNaN(roundId) || !participantId || !roundId) {
    throw new Error("All fields are required");
  }

  // Verify participant belongs to session user
  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
  });
  if (!participant || participant.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Verify round exists and registration is open
  const round = await db.query.rounds.findFirst({
    where: eq(rounds.id, roundId),
  });
  if (!round || round.registrationStatus !== "open") {
    throw new Error("Round not found or registration is closed");
  }

  // Check for duplicate enrollment
  const existing = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.participantId, participantId),
      eq(enrollments.roundId, roundId),
      subjectId ? eq(enrollments.subjectId, subjectId) : eq(enrollments.subjectId, null)
    ),
  });

  if (existing) {
    throw new Error("You are already enrolled in this program");
  }

  // Create enrollment record
  const [enrollment] = await db
    .insert(enrollments)
    .values({
      participantId,
      roundId,
      subjectId,
      enrollmentStatus: "draft",
      paymentStatus: "unpaid",
    })
    .returning();

  revalidatePath("/participant");
  revalidatePath("/participant/enrollment");
  revalidatePath("/participant/enrollments");

  return enrollment;
}

/**
 * Fetches all enrollments for a specific participant with related data.
 * Authorization: Requires participant, admin, or super_admin role. Verifies participant.userId matches session user.
 * Returns enrollments sorted by most recent first (enrolledAt DESC).
 * Includes related data: round, subject, and payment information.
 * @param participantId - The ID of the participant whose enrollments to fetch
 * @returns Array of enrollment records with related round, subject, and payment data
 * @throws {Error} "Invalid participant ID" if participantId is missing or invalid
 * @throws {Error} "Unauthorized" if participant doesn't belong to session user
 */
export async function getParticipantEnrollments(participantId: number) {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  if (!participantId || isNaN(participantId)) {
    throw new Error("Invalid participant ID");
  }

  // Verify participant belongs to session user
  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
  });
  if (!participant || participant.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Fetch all enrollments for this participant with related data
  const participantEnrollments = await db.query.enrollments.findMany({
    where: eq(enrollments.participantId, participantId),
    with: {
      round: true,
      subject: true,
      payment: true,
    },
    orderBy: [desc(enrollments.enrolledAt)],
  });

  return participantEnrollments;
}
