import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { payments, participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { sendPaymentConfirmationEmail } from "@/lib/send-payment-email";

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

  // Handle successful payment completion
  // Flow: (1) Extract card details from PaymentIntent, (2) Update payment record to "paid",
  // (3) Update participant status, (4) Send confirmation email with invoice/receipt
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { participantId } = session.metadata ?? {};

    // Card details are optional extras for receipts and admin records
    // We fetch them from the PaymentIntent's latest charge
    let stripeChargeId: string | null = null;
    let cardLast4: string | null = null;
    let cardBrand: string | null = null;

    if (session.payment_intent) {
      try {
        // Retrieve PaymentIntent with expanded charge to get card details
        // Wrapped in try-catch because: (1) network issues to Stripe API are possible,
        // (2) PaymentIntent might not be immediately available due to eventual consistency,
        // (3) Card details are nice-to-have, not critical for payment completion
        const pi = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
          { expand: ["latest_charge"] }
        );
        const charge = pi.latest_charge as Stripe.Charge | null;
        if (charge) {
          stripeChargeId = charge.id;
          // Graceful fallback: card details might be missing for non-card payments
          // (Apple Pay, Google Pay, etc.) or if payment_method_details is incomplete
          cardLast4 = charge.payment_method_details?.card?.last4 ?? null;
          cardBrand = charge.payment_method_details?.card?.brand ?? null;
        }
      } catch {
        // Non-fatal: Payment is already completed successfully per the webhook event.
        // Proceeding without card details allows us to still mark the payment as paid
        // and send confirmation email (which has fallback for missing card info).
      }
    }

    // Mark payment record as paid and store Stripe identifiers for reconciliation
    // This is the source of truth for payment completion in our database
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

    // Update participant status to reflect successful payment
    // This unlocks access to program features for the participant
    const participantIdNum = participantId ? parseInt(participantId) : NaN;
    if (!isNaN(participantIdNum)) {
      await db
        .update(participants)
        .set({ paymentStatus: "paid", updatedAt: new Date() })
        .where(eq(participants.id, participantIdNum));
    }

    // Send confirmation email with invoice + receipt attached
    // We re-fetch the payment record to get updated data and related cycle/round info
    const payment = await db.query.payments.findFirst({
      where: eq(payments.stripeCheckoutSessionId, session.id),
      with: { cycle: true, round: true },
    });

    if (payment && !isNaN(participantIdNum)) {
      const participant = await db.query.participants.findFirst({
        where: eq(participants.id, participantIdNum),
        with: {
          user: true,
          subjects: { with: { subject: true } },
        },
      });

      const email = participant?.user?.email;
      if (email && participant && !payment.receiptPdfKey) {
        // Compute optional metadata fields for receipt/invoice line item
        const round = payment.round;
        const isCamp = round?.order === 2;
        const start = round?.startDate ? new Date(round.startDate) : null;
        const end = round?.endDate ? new Date(round.endDate) : null;
        let programDates: string | undefined;
        if (start && end) {
          const sameMonth = start.getUTCMonth() === end.getUTCMonth();
          const fmt = (d: Date) =>
            d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
          programDates = sameMonth
            ? `${start.getUTCDate()}–${end.getUTCDate()} ${end.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}`
            : `${fmt(start)} – ${fmt(end)}`;
        }
        const subjectName = participant.subjects[0]?.subject?.name;

        sendPaymentConfirmationEmail({
          paymentId: payment.id,
          amountCents: payment.amountCents,
          serviceFeeCents: payment.serviceFeeCents ?? 0,
          cardLast4: payment.cardLast4 ?? cardLast4,
          cardBrand: payment.cardBrand ?? cardBrand,
          stripeChargeId: payment.stripeChargeId ?? stripeChargeId,
          stripePaymentIntentId: payment.stripePaymentIntentId,
          cycle: payment.cycle?.name ?? "-",
          round: round?.name,
          programDates,
          subject: subjectName,
          venue: round?.venue ?? undefined,
          isCamp,
          participant: {
            name: participant.fullName,
            email,
            country: participant.country ?? "-",
          },
        }).catch((err) => console.error("Payment email failed:", err));
      }
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
