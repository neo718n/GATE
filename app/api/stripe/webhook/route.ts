import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { payments, participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { participantId } = session.metadata ?? {};

    let stripeChargeId: string | null = null;
    let cardLast4: string | null = null;
    let cardBrand: string | null = null;

    if (session.payment_intent) {
      try {
        const pi = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
          { expand: ["latest_charge"] }
        );
        const charge = pi.latest_charge as Stripe.Charge | null;
        if (charge) {
          stripeChargeId = charge.id;
          cardLast4 = charge.payment_method_details?.card?.last4 ?? null;
          cardBrand = charge.payment_method_details?.card?.brand ?? null;
        }
      } catch {
        // non-fatal: proceed without card details
      }
    }

    await db
      .update(payments)
      .set({
        status: "paid",
        stripePaymentIntentId: session.payment_intent as string | null,
        stripeChargeId,
        cardLast4,
        cardBrand,
        updatedAt: new Date(),
      })
      .where(eq(payments.stripeCheckoutSessionId, session.id));

    if (participantId) {
      await db
        .update(participants)
        .set({ paymentStatus: "paid", updatedAt: new Date() })
        .where(eq(participants.id, parseInt(participantId)));
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    await db
      .update(payments)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(payments.stripeCheckoutSessionId, session.id));
  }

  return NextResponse.json({ received: true });
}
