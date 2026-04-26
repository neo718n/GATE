import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { payments, participants, cycles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/authz";

export async function POST(req: NextRequest) {
  const session = await requireSession();

  const { cycleId } = await req.json();
  if (!cycleId) {
    return NextResponse.json({ error: "cycleId required" }, { status: 400 });
  }

  const cycle = await db.query.cycles.findFirst({
    where: eq(cycles.id, cycleId),
  });
  if (!cycle) {
    return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
  }
  if (cycle.registrationFeeUsd === 0) {
    return NextResponse.json({ error: "This cycle has no fee" }, { status: 400 });
  }

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

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
      participantId: participant ? String(participant.id) : "",
    },
    success_url: `${appUrl}/participant?payment=success`,
    cancel_url: `${appUrl}/participant/enrollment?payment=cancelled`,
  });

  await db.insert(payments).values({
    userId: session.user.id,
    participantId: participant?.id ?? null,
    cycleId,
    stripeCheckoutSessionId: checkoutSession.id,
    amountUsd: cycle.registrationFeeUsd,
    currency: "usd",
    status: "pending",
  });

  return NextResponse.json({ url: checkoutSession.url });
}
