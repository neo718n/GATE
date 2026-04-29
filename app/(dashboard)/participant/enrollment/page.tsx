import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, cycles, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { LocalDate } from "@/components/ui/local-date";
import Link from "next/link";
import { selectSubject, initiatePayment } from "@/lib/actions/participant";
import { stripe } from "@/lib/stripe";

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

  // Verify Stripe payment when redirected back from checkout (webhook fallback)
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
    } catch {}
  }

  if (!participant || participant.registrationStatus === "draft") {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Subject Enrollment
          </span>
          <h1 className="font-serif text-4xl font-light text-gate-800">Enrollment</h1>
        </div>
        <div className="border border-gate-fog bg-gate-fog/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/60">
            Profile Required
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            You must complete your participant profile before selecting a subject area.
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

  const cycleSubjects = activeCycle?.subjects ?? [];
  const selectedSubjectId = participant.subjects[0]?.subjectId ?? null;
  const selectedSubject = participant.subjects[0]?.subject ?? null;
  const isPaid = participant.paymentStatus === "paid";

  const grossAmount = activeCycle
    ? Math.ceil(
        (activeCycle.registrationFeeUsd + activeCycle.stripeFeeFixedCents) /
          (1 - activeCycle.stripeFeePercent / 10000)
      )
    : 0;
  const feeAmount = activeCycle ? grossAmount - activeCycle.registrationFeeUsd : 0;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Subject Enrollment
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">
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

      {sp.payment === "cancelled" && (
        <div className="border border-gate-fog bg-gate-fog/30 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/60">
            Payment Cancelled
          </p>
          <p className="text-sm font-light text-gate-800/65 mt-1">
            Your payment was not completed. Your subject selection is saved — you can pay below.
          </p>
        </div>
      )}

      {!activeCycle && (
        <div className="border border-gate-fog bg-gate-fog/30 p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/60 mb-2">
            Registration Not Open
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            There is no active registration cycle at this time. Check back when the next cycle opens.
          </p>
        </div>
      )}

      {activeCycle && (
        <>
          <div className="border border-gate-fog p-6 flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
              Active Cycle
            </p>
            <p className="text-sm font-light text-gate-800">{activeCycle.name}</p>
            {activeCycle.description && (
              <p className="text-xs font-light text-gate-800/55">{activeCycle.description}</p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
              {activeCycle.registrationFeeUsd > 0 ? (
                <span className="text-sm font-light text-gate-800/60">
                  Registration fee: ${(activeCycle.registrationFeeUsd / 100).toFixed(2)} USD
                </span>
              ) : (
                <span className="text-sm font-light text-gate-gold">Free enrollment</span>
              )}
            </div>
            {activeCycle.rounds.length > 0 && (
              <div className="flex flex-col gap-1 pt-1 border-t border-gate-fog/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/40 mb-1">Rounds</p>
                {activeCycle.rounds.map((r) => (
                  <p key={r.id} className="text-xs font-light text-gate-800/60">
                    {r.name}
                    {" — "}
                    <LocalDate date={r.startDate} />
                    {` (${r.format})`}
                    {r.venue ? ` · ${r.venue}` : ""}
                    {r.feeUsd > 0 ? ` · $${(r.feeUsd / 100).toFixed(2)}` : ""}
                  </p>
                ))}
              </div>
            )}
          </div>

          {isPaid ? (
            <div className="border border-gate-gold/30 bg-gate-gold/5 p-6 flex flex-col gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
                Enrolled
              </p>
              <p className="text-sm font-light text-gate-800">
                Subject: <span className="font-semibold">{selectedSubject?.name ?? "—"}</span>
              </p>
              <p className="text-sm font-light text-gate-800/60">
                Payment confirmed. Your enrollment is complete.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/50 pb-1 border-b border-gate-fog">
                  Select Your Subject
                </p>
                {cycleSubjects.length === 0 ? (
                  <p className="text-sm font-light text-gate-800/60">
                    No subjects have been configured for this cycle yet. Contact support.
                  </p>
                ) : (
                  <form action={selectSubject} className="flex flex-col gap-3">
                    <input type="hidden" name="participantId" value={participant.id} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cycleSubjects.map(({ subject: s }) =>
                        s ? (
                          <label
                            key={s.id}
                            className="flex items-start gap-3 border border-gate-fog p-4 cursor-pointer hover:border-gate-gold/50 hover:bg-gate-gold/5 transition-colors has-[:checked]:border-gate-gold has-[:checked]:bg-gate-gold/8"
                          >
                            <input
                              type="radio"
                              name="subjectId"
                              value={s.id}
                              defaultChecked={s.id === selectedSubjectId}
                              className="mt-1 accent-[#C9993A]"
                            />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-gate-800">{s.name}</span>
                              {s.description && (
                                <span className="text-xs font-light text-gate-800/55 leading-[1.7]">
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
                )}
              </div>

              {selectedSubjectId && (
                <div className="border border-gate-fog p-6 flex flex-col gap-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/50 pb-1 border-b border-gate-fog">
                    Payment
                  </p>
                  {activeCycle.registrationFeeUsd > 0 ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm font-light text-gate-800/65">
                        <span>Registration fee</span>
                        <span>${(activeCycle.registrationFeeUsd / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-light text-gate-800/50">
                        <span>Payment processing</span>
                        <span>${(feeAmount / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-semibold text-gate-800 border-t border-gate-fog pt-2 mt-1">
                        <span>Total</span>
                        <span>${(grossAmount / 100).toFixed(2)} USD</span>
                      </div>
                      <p className="text-xs font-light text-gate-800/40 mt-1">
                        Selected subject:{" "}
                        <span className="text-gate-800/65">{selectedSubject?.name}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
                      This cycle has no registration fee. Click below to confirm enrollment.
                    </p>
                  )}
                  <form action={initiatePayment}>
                    <input type="hidden" name="cycleId" value={activeCycle.id} />
                    <input type="hidden" name="participantId" value={participant.id} />
                    <Button type="submit" variant="gold" size="md">
                      {activeCycle.registrationFeeUsd > 0
                        ? `Pay $${(grossAmount / 100).toFixed(2)} & Confirm`
                        : "Confirm Enrollment"}
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
