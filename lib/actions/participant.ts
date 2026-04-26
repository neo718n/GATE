"use server";

import { db } from "@/lib/db";
import { participants, participantSubjects, cycles, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";

export async function saveParticipantProfile(formData: FormData) {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const fullName = (formData.get("fullName") as string)?.trim();
  const country = (formData.get("country") as string)?.trim();
  if (!fullName || !country) throw new Error("Full name and country are required");

  const data = {
    fullName,
    dateOfBirth: (formData.get("dateOfBirth") as string) || null,
    country,
    city: (formData.get("city") as string)?.trim() || null,
    school: (formData.get("school") as string)?.trim() || null,
    grade: (formData.get("grade") as string)?.trim() || null,
    guardianName: (formData.get("guardianName") as string)?.trim() || null,
    guardianEmail: (formData.get("guardianEmail") as string)?.trim() || null,
    guardianPhone: (formData.get("guardianPhone") as string)?.trim() || null,
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

export async function selectSubject(formData: FormData) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const participantId = parseInt(formData.get("participantId") as string);
  const subjectId = parseInt(formData.get("subjectId") as string);

  if (!subjectId || !participantId) return;

  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
  });
  if (!participant || participant.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.delete(participantSubjects).where(eq(participantSubjects.participantId, participantId));
  await db.insert(participantSubjects).values({ participantId, subjectId });

  revalidatePath("/participant/enrollment");
  revalidatePath("/participant");
}

export async function initiatePayment(formData: FormData) {
  const session = await requireRole(["participant"]);
  const cycleId = parseInt(formData.get("cycleId") as string);
  const participantId = parseInt(formData.get("participantId") as string);

  const cycle = await db.query.cycles.findFirst({
    where: eq(cycles.id, cycleId),
  });
  if (!cycle) throw new Error("Cycle not found");

  if (cycle.registrationFeeUsd === 0) {
    await db
      .update(participants)
      .set({ paymentStatus: "paid", updatedAt: new Date() })
      .where(eq(participants.id, participantId));
    revalidatePath("/participant");
    redirect("/participant?payment=success");
  }

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
          unit_amount: cycle.registrationFeeUsd,
          product_data: {
            name: `GATE Assessment ${cycle.name} — Registration Fee`,
          },
        },
      },
    ],
    metadata: {
      userId: session.user.id,
      cycleId: String(cycleId),
      participantId: String(participantId),
    },
    success_url: `${appUrl}/participant?payment=success`,
    cancel_url: `${appUrl}/participant/enrollment?payment=cancelled`,
  });

  await db.insert(payments).values({
    userId: session.user.id,
    participantId,
    cycleId,
    stripeCheckoutSessionId: checkoutSession.id,
    amountUsd: cycle.registrationFeeUsd,
    currency: "usd",
    status: "pending",
  });

  redirect(checkoutSession.url!);
}
