import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, cycles, payments, enrollments, rounds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LocalDate } from "@/components/ui/local-date";
import Link from "next/link";
import { selectRound, selectSubject, initiatePayment, enrollAndPay } from "@/lib/actions/participant";
import { getParticipantEnrollments, createEnrollment } from "@/lib/actions/enrollments";
import { stripe } from "@/lib/stripe";
import { PaymentSubmitButton } from "@/components/payment-submit-button";
import { EnrollmentCard } from "@/components/participant/enrollment-card";

export default async function EnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; sid?: string; program?: string }>;
}) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const sp = await searchParams;

  let participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
    with: {
      subjects: { with: { subject: true } },
    },
  });

  // Verify Stripe payment when redirected back from checkout (webhook fallback)
  if (sp.payment === "success" && sp.sid) {
    try {
      const sess = await stripe.checkout.sessions.retrieve(sp.sid);
      if (sess.payment_status === "paid") {
        // Extract enrollmentId from session metadata
        const enrollmentIdStr = sess.metadata?.enrollmentId;
        const enrollmentId = enrollmentIdStr ? parseInt(enrollmentIdStr, 10) : null;

        // Update payment record
        await db
          .update(payments)
          .set({
            status: "paid",
            stripePaymentIntentId:
              typeof sess.payment_intent === "string" ? sess.payment_intent : null,
            updatedAt: new Date(),
          })
          .where(eq(payments.stripeCheckoutSessionId, sp.sid));

        if (enrollmentId) {
          // New enrollment-based flow: Update enrollment status
          await db
            .update(enrollments)
            .set({
              paymentStatus: "paid",
              enrollmentStatus: "confirmed",
              updatedAt: new Date(),
            })
            .where(eq(enrollments.id, enrollmentId));
        } else if (participant && participant.paymentStatus !== "paid") {
          // Legacy flow: Update participant payment status for backward compatibility
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

  // New registration flow: participants are created automatically during signup at /register
  // with registrationStatus='draft'. This is now a valid state for enrollment (draft = hasn't paid yet).
  // Only redirect if participant record doesn't exist (orphaned user scenario).
  if (!participant) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Subject Enrollment
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">Enrollment</h1>
        </div>
        <div className="border border-border bg-muted/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
            Registration Required
          </p>
          <p className="text-sm font-light text-foreground/65 leading-[1.9]">
            You must complete your registration before enrolling in a subject area.
          </p>
          <Button variant="gold" size="sm" asChild className="w-fit">
            <Link href="/register">Complete Registration</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Fetch existing enrollments for this participant
  const existingEnrollments = await getParticipantEnrollments(participant.id);

  // Get the set of round IDs user is already enrolled in
  const enrolledRoundIds = new Set(
    existingEnrollments.map((enrollment) => enrollment.roundId)
  );

  // Phase 3: if a program slug is provided in the URL, look up the target round
  // and decide if the user is already enrolled in it (banner) or needs onboarding.
  const programSlug = sp.program?.trim().toLowerCase() ?? null;
  let targetRound: typeof rounds.$inferSelect | null = null;
  let alreadyEnrolledInProgram = false;
  if (programSlug) {
    try {
      targetRound =
        (await db.query.rounds.findFirst({
          where: eq(rounds.slug, programSlug),
        })) ?? null;
    } catch (err) {
      console.error("[enrollment] rounds.findFirst failed for slug:", programSlug, err);
      throw err;
    }
    if (!targetRound) notFound();
    if (targetRound.registrationStatus !== "open") notFound();

    const targetEnrollment = existingEnrollments.find(
      (e) => e.roundId === targetRound!.id
    );
    alreadyEnrolledInProgram = targetEnrollment?.paymentStatus === "paid";

    if (!targetEnrollment) {
      try {
        await db.insert(enrollments).values({
          participantId: participant.id,
          roundId: targetRound.id,
          subjectId: null,
          enrollmentStatus: "draft",
          paymentStatus: "unpaid",
        });
      } catch (err) {
        console.error("[enrollment] insert draft enrollment failed:", { participantId: participant.id, roundId: targetRound.id }, err);
        throw err;
      }
    }
  }

  const activeCycle = await db.query.cycles.findFirst({
    where: eq(cycles.status, "registration_open"),
    with: {
      subjects: { with: { subject: true } },
      rounds: { orderBy: (r, { asc }) => [asc(r.order)] },
    },
  });

  const openRounds = activeCycle?.rounds.filter((r) => r.registrationStatus === "open") ?? [];

  // For backward compatibility: show old single enrollment data if exists
  const selectedSubjectId = participant.subjects[0]?.subjectId ?? null;
  const selectedSubject = participant.subjects[0]?.subject ?? null;
  const selectedRoundId = participant.roundId ?? null;
  const selectedRound = activeCycle?.rounds.find((r) => r.id === selectedRoundId) ?? null;
  const isPaid = participant.paymentStatus === "paid";

  const grossAmount = selectedRound
    ? Math.ceil(
        (selectedRound.feeUsd + (activeCycle?.stripeFeeFixedCents ?? 30)) /
          (1 - (activeCycle?.stripeFeePercent ?? 290) / 10000)
      )
    : 0;
  const feeAmount = selectedRound ? grossAmount - selectedRound.feeUsd : 0;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Subject Enrollment
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">
          Enrollment &amp; Payment
        </h1>
      </div>

      {sp.payment === "success" && (
        <div className="border border-green-200 bg-green-50 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-green-700">
            Payment Successful
          </p>
          <p className="text-sm font-light text-green-800/70 mt-1">
            Your registration fee has been received. Your enrollment is confirmed.
          </p>
        </div>
      )}

      {targetRound && alreadyEnrolledInProgram && (
        <div className="border border-gate-gold/30 bg-gate-gold/5 px-5 py-4 flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
            Already Enrolled
          </p>
          <p className="text-sm font-light text-foreground/80">
            You're already enrolled in <span className="font-medium">{targetRound.name}</span>. Choose another open program below to enroll in additional opportunities.
          </p>
        </div>
      )}

      {targetRound && !alreadyEnrolledInProgram && activeCycle && (
        <form
          action={enrollAndPay}
          className="border border-gate-gold/40 bg-card p-6 flex flex-col gap-6"
        >
          <input type="hidden" name="programSlug" value={(targetRound as any).slug} />

          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
              Enrolling in
            </p>
            <h2 className="font-serif text-2xl font-light text-foreground">{targetRound.name}</h2>
            <p className="text-sm font-light text-foreground/60">
              Total fee: ${(
                Math.ceil(
                  (targetRound.feeUsd + (activeCycle.stripeFeeFixedCents ?? 30)) /
                    (1 - (activeCycle.stripeFeePercent ?? 290) / 10000)
                ) / 100
              ).toFixed(2)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
              Choose subject *
            </p>
            {activeCycle.subjects.length === 0 ? (
              <p className="text-sm font-light text-foreground/60">
                No subjects available yet. Please contact support.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeCycle.subjects.map(({ subject: s }) =>
                  s ? (
                    <label
                      key={s.id}
                      className="flex items-center gap-3 border border-border bg-background px-4 py-3 cursor-pointer hover:border-gate-gold transition-colors"
                    >
                      <input
                        type="radio"
                        name="subjectId"
                        value={s.id}
                        required
                        className="accent-gate-gold"
                      />
                      <span className="text-sm font-light text-foreground">{s.name}</span>
                    </label>
                  ) : null
                )}
              </div>
            )}
          </div>

          <PaymentSubmitButton label="Continue to Payment" />
        </form>
      )}

      {sp.payment === "cancelled" && (
        <div className="border border-border bg-muted/30 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
            Payment Cancelled
          </p>
          <p className="text-sm font-light text-foreground/65 mt-1">
            Your payment was not completed. Your selections are saved — you can pay below.
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

      {/* Current Enrollments */}
      {existingEnrollments.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border flex-1">
              Current Enrollments
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingEnrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment as any}
                onPaymentClick={(enrollmentId) => {
                  // Payment will be handled by the EnrollmentCard component
                  // This could navigate to a payment page or open a modal
                }}
              />
            ))}
          </div>
          <div className="border-t border-border pt-2">
            <Link
              href="/participant/enrollments"
              className="text-sm text-gate-gold hover:underline"
            >
              View All Enrollments →
            </Link>
          </div>
        </div>
      )}

      {/* Backward compatibility: Show old single enrollment if exists and no new enrollments */}
      {activeCycle && isPaid && existingEnrollments.length === 0 && (
        <div className="border border-gate-gold/30 bg-gate-gold/5 p-6 flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
            Enrolled
          </p>
          <p className="text-sm font-light text-foreground">
            Round: <span className="font-semibold">{selectedRound?.name ?? "—"}</span>
          </p>
          <p className="text-sm font-light text-foreground">
            Subject: <span className="font-semibold">{selectedSubject?.name ?? "—"}</span>
          </p>
          <p className="text-sm font-light text-foreground/60">
            Payment confirmed. Your enrollment is complete.
          </p>
        </div>
      )}

      {/* New Enrollment Form (hidden when a focused program flow is active and unpaid) */}
      {activeCycle && (!targetRound || alreadyEnrolledInProgram) && (
        <div className="flex flex-col gap-6 border border-border p-6 bg-muted/10">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
              {existingEnrollments.length > 0 ? "Enroll in Another Program" : "Select Program"}
            </p>
            {existingEnrollments.length > 0 && (
              <p className="text-sm font-light text-foreground/60">
                You can enroll in multiple programs simultaneously.
              </p>
            )}
          </div>

          {/* Round selection */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
              Select Round
            </p>
            {openRounds.length === 0 ? (
              <div className="border border-border bg-muted/30 p-5">
                <p className="text-sm font-light text-foreground/60">
                  No rounds are currently open for registration.
                </p>
              </div>
            ) : (
              <form action={selectRound} className="flex flex-col gap-3">
                <input type="hidden" name="participantId" value={participant.id} />
                <div className="flex flex-col gap-2">
                  {openRounds.map((r) => {
                    const isEnrolled = enrolledRoundIds.has(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-start gap-3 border border-border p-4 ${
                          isEnrolled
                            ? "opacity-60 cursor-not-allowed bg-muted/50"
                            : "cursor-pointer hover:border-gate-gold/50 hover:bg-gate-gold/5 transition-colors has-[:checked]:border-gate-gold has-[:checked]:bg-gate-gold/8"
                        }`}
                      >
                        <input
                          type="radio"
                          name="roundId"
                          value={r.id}
                          defaultChecked={r.id === selectedRoundId}
                          disabled={isEnrolled}
                          className="mt-1 accent-[#C9993A] disabled:opacity-50"
                        />
                        <div className="flex flex-col gap-0.5 flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {r.name}
                              </span>
                              {isEnrolled && (
                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] px-2 py-0.5 bg-gate-gold/10 text-gate-800 border border-gate-gold/30">
                                  Already Enrolled
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-light text-foreground">
                              {r.feeUsd > 0 ? `$${(r.feeUsd / 100).toFixed(2)}` : "Free"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-light text-foreground/50 capitalize">
                              {r.format}
                            </span>
                            {r.startDate && (
                              <span className="text-xs font-light text-foreground/50">
                                <LocalDate date={r.startDate} />
                              </span>
                            )}
                            {r.venue && (
                              <span className="text-xs font-light text-foreground/50">{r.venue}</span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="pt-1">
                  <Button type="submit" variant="outline" size="sm">
                    Save Round Selection
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Subject selection - Only show if round is selected and not already enrolled */}
          {!isPaid && activeCycle.subjects.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
                Select Subject
              </p>
              <form action={selectSubject} className="flex flex-col gap-3">
                <input type="hidden" name="participantId" value={participant.id} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeCycle.subjects.map(({ subject: s }) =>
                    s ? (
                      <label
                        key={s.id}
                        className="flex items-start gap-3 border border-border p-4 cursor-pointer hover:border-gate-gold/50 hover:bg-gate-gold/5 transition-colors has-[:checked]:border-gate-gold has-[:checked]:bg-gate-gold/8"
                      >
                        <input
                          type="radio"
                          name="subjectId"
                          value={s.id}
                          defaultChecked={s.id === selectedSubjectId}
                          className="mt-1 accent-[#C9993A]"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-foreground">{s.name}</span>
                          {s.description && (
                            <span className="text-xs font-light text-foreground/55 leading-[1.7]">
                              {s.description}
                            </span>
                          )}
                        </div>
                      </label>
                    ) : null
                  )}
                </div>
                <div className="pt-1">
                  <Button type="submit" variant="outline" size="sm">
                    Save Subject Selection
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Payment - Only show if round and subject are selected and not already paid */}
          {!isPaid && selectedRoundId && selectedSubjectId && (
            <div className="border border-border p-6 flex flex-col gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
                Payment
              </p>
              {selectedRound && selectedRound.feeUsd > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm font-light text-foreground/65">
                    <span>Registration fee</span>
                    <span>${(selectedRound.feeUsd / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-light text-foreground/50">
                    <span>Service fee</span>
                    <span>${(feeAmount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground border-t border-border pt-2 mt-1">
                    <span>Total</span>
                    <span>${(grossAmount / 100).toFixed(2)} USD</span>
                  </div>
                  <p className="text-xs font-light text-foreground/40 mt-1">
                    Round:{" "}
                    <span className="text-foreground/65">{selectedRound.name}</span>
                    {" · "}Subject:{" "}
                    <span className="text-foreground/65">{selectedSubject?.name}</span>
                  </p>
                </div>
              ) : (
                <p className="text-sm font-light text-foreground/65 leading-[1.9]">
                  This round has no registration fee. Click below to confirm enrollment.
                </p>
              )}
              <form action={initiatePayment}>
                <input type="hidden" name="cycleId" value={activeCycle.id} />
                <input type="hidden" name="roundId" value={selectedRoundId} />
                <input type="hidden" name="participantId" value={participant.id} />
                <PaymentSubmitButton
                  label={
                    selectedRound && selectedRound.feeUsd > 0
                      ? `Pay $${(grossAmount / 100).toFixed(2)} & Confirm`
                      : "Confirm Enrollment"
                  }
                />
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
