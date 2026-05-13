import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, cycles, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { EnrollmentForm } from "./enrollment-form";

export default async function EnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; sid?: string }>;
}) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const sp = await searchParams;

  let participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
    with: {
      subjects: { with: { subject: true } },
    },
  });

  // Verify Stripe payment when redirected back from checkout (webhook fallback).
  // Failure here is non-fatal — the webhook is the source of truth.
  if (sp.payment === "success" && sp.sid && participant?.paymentStatus !== "paid") {
    try {
      const sess = await stripe.checkout.sessions.retrieve(sp.sid);
      if (sess.payment_status === "paid") {
        await db
          .update(payments)
          .set({
            status: "paid",
            stripePaymentIntentId:
              typeof sess.payment_intent === "string" ? sess.payment_intent : null,
            updatedAt: new Date(),
          })
          .where(eq(payments.stripeCheckoutSessionId, sp.sid));
        if (participant) {
          await db
            .update(participants)
            .set({ paymentStatus: "paid", updatedAt: new Date() })
            .where(eq(participants.id, participant.id));
          participant = { ...participant, paymentStatus: "paid" };
        }
      }
    } catch (err) {
      console.error("[enrollment] Stripe session verify failed:", err);
    }
  }

  // Profile gate — must complete profile before enrolling
  if (!participant || participant.registrationStatus === "draft") {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Program Registration
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">Enrollment</h1>
        </div>
        <div className="border border-border bg-muted/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
            Profile Required
          </p>
          <p className="text-sm font-light text-foreground/65 leading-[1.9]">
            You must complete your participant profile before registering for a program.
          </p>
          <Button variant="gold" size="sm" asChild className="w-fit">
            <Link href="/participant/profile">Complete Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  const activeCycle = await db.query.cycles.findFirst({
    where: eq(cycles.status, "registration_open"),
    with: {
      subjects: { with: { subject: true } },
      rounds: { orderBy: (r, { asc }) => [asc(r.order)] },
    },
  });

  const openRounds = activeCycle?.rounds.filter((r) => r.registrationStatus === "open") ?? [];
  const selectedSubject = participant.subjects[0]?.subject ?? null;
  const selectedSubjectId = participant.subjects[0]?.subjectId ?? null;
  const selectedRound = activeCycle?.rounds.find((r) => r.id === participant.roundId) ?? null;
  const isPaid = participant.paymentStatus === "paid";

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Program Registration
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">
          Enrollment &amp; Payment
        </h1>
        <p className="text-sm font-light text-foreground/55 mt-2 leading-relaxed">
          Choose a program, pick your subject, and complete payment in a single step.
        </p>
      </div>

      {sp.payment === "success" && (
        <div className="border border-green-200 bg-green-50 px-5 py-4 dark:bg-green-950/30 dark:border-green-900">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-green-700 dark:text-green-400">
            Payment Successful
          </p>
          <p className="text-sm font-light text-green-800/70 dark:text-green-200/70 mt-1">
            Your registration fee has been received. Your enrollment is confirmed.
          </p>
        </div>
      )}

      {sp.payment === "cancelled" && (
        <div className="border border-border bg-muted/30 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
            Payment Cancelled
          </p>
          <p className="text-sm font-light text-foreground/65 mt-1">
            Your payment was not completed. Your selections are saved — you can submit again below.
          </p>
        </div>
      )}

      {!activeCycle && (
        <div className="border border-border bg-muted/30 p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60 mb-2">
            Registration Not Open
          </p>
          <p className="text-sm font-light text-foreground/65 leading-[1.9]">
            There is no active registration cycle at this time. Check back when the next cycle opens.
          </p>
        </div>
      )}

      {activeCycle && isPaid && (
        <div className="border border-gate-gold/30 bg-gate-gold/5 p-6 flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
            Enrolled
          </p>
          <p className="text-sm font-light text-foreground">
            Program: <span className="font-semibold">{selectedRound?.name ?? "—"}</span>
          </p>
          <p className="text-sm font-light text-foreground">
            Subject: <span className="font-semibold">{selectedSubject?.name ?? "—"}</span>
          </p>
          <p className="text-sm font-light text-foreground/60">
            Payment confirmed. Your enrollment is complete.
          </p>
        </div>
      )}

      {activeCycle && !isPaid && (
        <>
          {openRounds.length === 0 ? (
            <div className="border border-border bg-muted/30 p-5">
              <p className="text-sm font-light text-foreground/60">
                No programs are currently open for registration.
              </p>
            </div>
          ) : (
            <EnrollmentForm
              participant={{
                id: participant.id,
                roundId: participant.roundId,
                selectedSubjectId,
                passportNumber: participant.passportNumber,
                passportExpiry: participant.passportExpiry,
                parentalConsent: participant.parentalConsent,
                dietaryNeeds: participant.dietaryNeeds,
                emergencyContact: participant.emergencyContact,
              }}
              cycleId={activeCycle.id}
              rounds={openRounds.map((r) => ({
                id: r.id,
                name: r.name,
                order: r.order,
                format: r.format,
                startDate: r.startDate,
                endDate: r.endDate,
                feeUsd: r.feeUsd,
                venue: r.venue,
              }))}
              subjects={activeCycle.subjects
                .map((cs) => cs.subject)
                .filter((s): s is NonNullable<typeof s> => s !== null && s.active !== false)
                .map((s) => ({
                  id: s.id,
                  name: s.name,
                  description: s.description ?? null,
                }))}
              stripeFeePercent={activeCycle.stripeFeePercent}
              stripeFeeFixedCents={activeCycle.stripeFeeFixedCents}
            />
          )}
        </>
      )}
    </div>
  );
}
