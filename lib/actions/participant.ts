"use server";

import { db } from "@/lib/db";
import { participants, participantSubjects, cycles, rounds, payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";

export async function saveParticipantProfile(formData: FormData) {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const country = (formData.get("country") as string)?.trim();
  const school = (formData.get("school") as string)?.trim();
  const grade = (formData.get("grade") as string)?.trim();

  if (!firstName || !lastName || !country || !school || !grade) {
    throw new Error("First name, last name, country, school, and grade are required");
  }

  const fullName = `${firstName} ${lastName}`;

  const phoneCode = (formData.get("phoneCode") as string)?.trim() ?? "";
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim() ?? "";
  const rawCode = phoneCode.replace(/\s*\(.*\)/, "");
  const phone = phoneNumber ? `${rawCode}${phoneNumber}` : null;

  const genderRaw = (formData.get("gender") as string)?.trim();
  const gender = (genderRaw === "male" || genderRaw === "female" || genderRaw === "prefer_not_to_say")
    ? (genderRaw as "male" | "female" | "prefer_not_to_say")
    : null;

  const data = {
    fullName,
    dateOfBirth: (formData.get("dateOfBirth") as string) || null,
    country,
    city: (formData.get("city") as string)?.trim() || null,
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
  redirect("/participant/enrollment");
}

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

  if (participant.paymentStatus === "paid") return;

  await db
    .update(participants)
    .set({ roundId, cycleId: participant.cycleId, updatedAt: new Date() })
    .where(eq(participants.id, participantId));

  revalidatePath("/participant/enrollment");
}

export async function selectSubject(formData: FormData) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const participantId = parseInt(formData.get("participantId") as string);
  const subjectId = parseInt(formData.get("subjectId") as string);

  if (isNaN(participantId) || isNaN(subjectId) || !participantId || !subjectId) return;

  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
  });
  if (!participant || participant.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (participant.paymentStatus === "paid") return;

  await db.delete(participantSubjects).where(eq(participantSubjects.participantId, participantId));
  await db.insert(participantSubjects).values({ participantId, subjectId });

  revalidatePath("/participant/enrollment");
  revalidatePath("/participant");
}

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
      // Session expired or invalid — fall through and create a new one
    }
  }

  const grossAmount = Math.ceil(
    (round.feeUsd + cycle.stripeFeeFixedCents) /
      (1 - cycle.stripeFeePercent / 10000)
  );
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
            name: `${round.name} — Registration Fee`,
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
