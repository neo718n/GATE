"use server";

import { db } from "@/lib/db";
import { participants, participantSubjects, cycles, rounds, payments, enrollments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";

/**
 * Saves or updates a participant's profile information.
 * Authorization: Requires participant, admin, or super_admin role.
 * Creates new participant record if none exists, otherwise updates existing record.
 * Automatically sets registrationStatus to "submitted" and paymentStatus to "unpaid" for new records.
 * @param formData - Form data containing: firstName, lastName, country, city, school, grade, dateOfBirth, phoneCode, phoneNumber, gender
 * @throws {Error} If any required field is missing
 */
export async function saveParticipantProfile(formData: FormData) {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const country = (formData.get("country") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const school = (formData.get("school") as string)?.trim();
  const grade = (formData.get("grade") as string)?.trim();
  const dateOfBirth = (formData.get("dateOfBirth") as string) || null;
  const phoneCode = (formData.get("phoneCode") as string)?.trim() ?? "";
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  const genderRaw = (formData.get("gender") as string)?.trim();

  if (!firstName || !lastName || !country || !city || !school || !grade || !dateOfBirth || !phoneNumber || !genderRaw) {
    throw new Error("All fields are required");
  }

  const fullName = `${firstName} ${lastName}`;
  const rawCode = phoneCode.replace(/\s*\(.*\)/, "");
  const phone = `${rawCode}${phoneNumber}`;
  const gender = (genderRaw === "male" || genderRaw === "female" || genderRaw === "prefer_not_to_say")
    ? (genderRaw as "male" | "female" | "prefer_not_to_say")
    : null;

  const data = {
    fullName,
    dateOfBirth,
    country,
    city,
    school,
    grade,
    phone,
    gender,
    registrationStatus: "submitted" as const,
    updatedAt: new Date(),
  };

  const existing = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  if (existing) {
    await db.update(participants).set(data).where(eq(participants.userId, session.user.id));
  } else {
    await db.insert(participants).values({
      userId: session.user.id,
      ...data,
      paymentStatus: "unpaid",
    });
  }

  revalidatePath("/participant");
  revalidatePath("/participant/profile");
}

/**
 * Assigns a round to a participant for competition enrollment.
 * Authorization: Requires participant, admin, or super_admin role. Verifies participant.userId matches session user.
 * Creates a new enrollment record or updates existing draft enrollment.
 * Prevents modification if enrollment payment has already been completed (paymentStatus === "paid").
 * @param formData - Form data containing: participantId, roundId
 * @throws {Error} If participant doesn't belong to session user (Unauthorized)
 */
export async function selectRound(formData: FormData) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const participantId = parseInt(formData.get("participantId") as string);
  const roundId = parseInt(formData.get("roundId") as string);

  if (isNaN(participantId) || isNaN(roundId) || !participantId || !roundId) return;

  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
  });
  if (!participant || participant.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Check if enrollment already exists for this participant+round
  const existingEnrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.participantId, participantId),
      eq(enrollments.roundId, roundId)
    ),
  });

  if (existingEnrollment) {
    // If enrollment exists and is already paid, don't allow changes
    if (existingEnrollment.paymentStatus === "paid") return;

    // Enrollment exists but not paid, just return (no update needed)
    return;
  }

  // Create new enrollment record
  await db.insert(enrollments).values({
    participantId,
    roundId,
    subjectId: null,
    enrollmentStatus: "draft",
    paymentStatus: "unpaid",
  });

  revalidatePath("/participant/enrollment");
}

/**
 * Assigns a subject to an enrollment for competition.
 * Authorization: Requires participant, admin, or super_admin role. Verifies enrollment.participant.userId matches session user.
 * Prevents modification if enrollment payment has already been completed (paymentStatus === "paid").
 * Updates the enrollment's subjectId field directly.
 * @param formData - Form data containing: enrollmentId, subjectId
 * @throws {Error} If enrollment doesn't belong to session user (Unauthorized)
 */
export async function selectSubject(formData: FormData) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const enrollmentId = parseInt(formData.get("enrollmentId") as string);
  const subjectId = parseInt(formData.get("subjectId") as string);

  if (isNaN(enrollmentId) || isNaN(subjectId) || !enrollmentId || !subjectId) return;

  // Fetch enrollment with participant data to verify ownership
  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, enrollmentId),
    with: {
      participant: true,
    },
  });

  if (!enrollment || enrollment.participant.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Prevent modification if enrollment is already paid
  if (enrollment.paymentStatus === "paid") return;

  // Update enrollment's subjectId
  await db.update(enrollments)
    .set({
      subjectId,
      updatedAt: new Date(),
    })
    .where(eq(enrollments.id, enrollmentId));

  revalidatePath("/participant/enrollment");
  revalidatePath("/participant");
}

/**
 * Initiates Stripe payment checkout for participant enrollment fee.
 * Authorization: Requires participant role. Verifies participant.userId matches session user.
 * Implements idempotency: redirects if already paid or re-uses existing open Stripe session.
 *
 * Stripe Fee Reverse-Calculation Formula:
 * grossAmount = Math.ceil((netAmount + fixedFee) / (1 - percentFee/10000))
 *
 * Why this formula: We want the participant to pay exactly round.feeUsd (net amount) while covering
 * Stripe's percentage and fixed fees. Stripe deducts: gross * (percentFee/10000) + fixedFee.
 * To solve for gross such that: gross - (gross * percentFee/10000 + fixedFee) = netAmount,
 * we rearrange to: grossAmount = (netAmount + fixedFee) / (1 - percentFee/10000).
 * Math.ceil ensures we round up to avoid underpayment due to fractional cents.
 *
 * @param formData - Form data containing: cycleId, roundId, participantId
 * @throws {Error} "Invalid request" if any ID is NaN
 * @throws {Error} "Unauthorized" if participant doesn't belong to session user
 * @throws {Error} "Cycle or round not found" if referenced records don't exist
 */
export async function initiatePayment(formData: FormData) {
  const session = await requireRole(["participant"]);
  const cycleId = parseInt(formData.get("cycleId") as string);
  const roundId = parseInt(formData.get("roundId") as string);
  const participantId = parseInt(formData.get("participantId") as string);

  if (isNaN(cycleId) || isNaN(roundId) || isNaN(participantId)) {
    throw new Error("Invalid request");
  }

  // Verify participant belongs to session user
  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
  });
  if (!participant || participant.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Idempotency: already paid
  if (participant.paymentStatus === "paid") {
    redirect("/participant/enrollment?payment=success");
  }

  const [cycle, round] = await Promise.all([
    db.query.cycles.findFirst({ where: eq(cycles.id, cycleId) }),
    db.query.rounds.findFirst({ where: eq(rounds.id, roundId) }),
  ]);
  if (!cycle || !round) throw new Error("Cycle or round not found");

  // Update participant's roundId
  await db
    .update(participants)
    .set({ roundId, updatedAt: new Date() })
    .where(eq(participants.id, participantId));

  if (round.feeUsd === 0) {
    await db
      .update(participants)
      .set({ paymentStatus: "paid", updatedAt: new Date() })
      .where(eq(participants.id, participantId));
    revalidatePath("/participant");
    redirect("/participant/enrollment?payment=success");
  }

  // Idempotency: re-use an existing open Stripe session for this participant+round
  const existingPayment = await db.query.payments.findFirst({
    where: and(
      eq(payments.participantId, participantId),
      eq(payments.roundId, roundId),
      eq(payments.status, "pending")
    ),
  });
  if (existingPayment?.stripeCheckoutSessionId) {
    try {
      const existingSession = await stripe.checkout.sessions.retrieve(
        existingPayment.stripeCheckoutSessionId
      );
      if (existingSession.url && existingSession.status === "open") {
        redirect(existingSession.url);
      }
    } catch {
      // Session expired or invalid вЂ” fall through and create a new one
    }
  }

  // Reverse Stripe fee calculation: determine grossAmount such that after Stripe deducts
  // their percentage + fixed fee, the net amount equals round.feeUsd.
  // Formula: grossAmount = (netAmount + fixedFee) / (1 - percentFee)
  // stripeFeePercent is stored in basis points (e.g., 290 = 2.90%), so divide by 10000 to get decimal
  // Math.ceil ensures we round up to the nearest cent, guaranteeing we collect enough to cover all fees
  const grossAmount = Math.ceil(
    (round.feeUsd + cycle.stripeFeeFixedCents) /
      (1 - cycle.stripeFeePercent / 10000)
  );
  // feeAmount is the total service fee charged to the participant (Stripe's cut)
  const feeAmount = grossAmount - round.feeUsd;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: session.user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: grossAmount,
          product_data: {
            name: `${round.name} вЂ” Registration Fee`,
            description: `Includes $${(feeAmount / 100).toFixed(2)} service fee`,
          },
        },
      },
    ],
    metadata: {
      userId: session.user.id,
      cycleId: String(cycleId),
      roundId: String(roundId),
      participantId: String(participantId),
    },
    success_url: `${appUrl}/participant/enrollment?payment=success&sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/participant/enrollment?payment=cancelled`,
  });

  await db.insert(payments).values({
    userId: session.user.id,
    participantId,
    cycleId,
    roundId,
    stripeCheckoutSessionId: checkoutSession.id,
    amountCents: grossAmount,
    currency: "usd",
    status: "pending",
  });

  redirect(checkoutSession.url!);
}

