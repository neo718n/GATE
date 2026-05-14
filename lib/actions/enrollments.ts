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
