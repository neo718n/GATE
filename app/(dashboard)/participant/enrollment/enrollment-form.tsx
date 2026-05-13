"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PaymentSubmitButton } from "@/components/payment-submit-button";
import { enrollAndPay } from "@/lib/actions/participant";

type Round = {
  id: number;
  name: string;
  order: number;
  format: string;
  startDate: Date | null;
  endDate: Date | null;
  feeUsd: number;
  venue: string | null;
};

type Subject = {
  id: number;
  name: string;
  description: string | null;
};

type ParticipantSnapshot = {
  id: number;
  roundId: number | null;
  selectedSubjectId: number | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  parentalConsent: boolean;
  dietaryNeeds: string | null;
  emergencyContact: string | null;
};

function fmtDateRange(start: Date | null, end: Date | null) {
  if (!start && !end) return null;
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  if (start && end) {
    const sameMonth = start.getUTCMonth() === end.getUTCMonth();
    return sameMonth
      ? `${start.getUTCDate()}–${end.getUTCDate()} ${end.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}`
      : `${fmt(start)} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`;
  }
  return start ? fmt(start) : fmt(end!);
}

function fmtMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function EnrollmentForm({
  participant,
  cycleId,
  rounds,
  subjects,
  stripeFeePercent,
  stripeFeeFixedCents,
}: {
  participant: ParticipantSnapshot;
  cycleId: number;
  rounds: Round[];
  subjects: Subject[];
  stripeFeePercent: number;
  stripeFeeFixedCents: number;
}) {
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(
    participant.roundId ?? rounds[0]?.id ?? null,
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    participant.selectedSubjectId ?? null,
  );

  const selectedRound = useMemo(
    () => rounds.find((r) => r.id === selectedRoundId) ?? null,
    [rounds, selectedRoundId],
  );

  const isCamp = selectedRound?.order === 2;

  const { net, fee, gross } = useMemo(() => {
    if (!selectedRound || selectedRound.feeUsd === 0) {
      return { net: 0, fee: 0, gross: 0 };
    }
    const grossAmount = Math.ceil(
      (selectedRound.feeUsd + stripeFeeFixedCents) / (1 - stripeFeePercent / 10000),
    );
    return {
      net: selectedRound.feeUsd,
      fee: grossAmount - selectedRound.feeUsd,
      gross: grossAmount,
    };
  }, [selectedRound, stripeFeePercent, stripeFeeFixedCents]);

  const canSubmit = selectedRoundId !== null && selectedSubjectId !== null;

  return (
    <form action={enrollAndPay} className="flex flex-col gap-10">
      <input type="hidden" name="participantId" value={participant.id} />
      <input type="hidden" name="cycleId" value={cycleId} />

      {/* PROGRAM */}
      <section className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
            1. Choose Your Program
          </span>
          <span className="text-[10px] font-light text-foreground/40">Required</span>
        </header>

        <div className="flex flex-col gap-3">
          {rounds.map((r) => {
            const range = fmtDateRange(r.startDate, r.endDate);
            const isSelected = r.id === selectedRoundId;
            return (
              <label
                key={r.id}
                className={`flex items-start gap-4 border p-5 cursor-pointer transition-colors ${
                  isSelected
                    ? "border-gate-gold bg-gate-gold/8"
                    : "border-border hover:border-gate-gold/50 hover:bg-gate-gold/5"
                }`}
              >
                <input
                  type="radio"
                  name="roundId"
                  value={r.id}
                  checked={isSelected}
                  onChange={() => setSelectedRoundId(r.id)}
                  className="mt-1 accent-[#C9993A]"
                />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm font-semibold text-foreground">{r.name}</span>
                    <span className="text-sm font-semibold text-gate-gold">
                      {r.feeUsd > 0 ? fmtMoney(r.feeUsd) : "Free"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs font-light text-foreground/55">
                    <span className="capitalize">{r.format}</span>
                    {range && (
                      <>
                        <span className="h-3 w-px bg-foreground/20" />
                        <span>{range}</span>
                      </>
                    )}
                    {r.venue && (
                      <>
                        <span className="h-3 w-px bg-foreground/20" />
                        <span>{r.venue}</span>
                      </>
                    )}
                  </div>
                  {r.order === 2 && (
                    <p className="text-[11px] font-light text-foreground/55 leading-relaxed mt-1">
                      All-inclusive: dormitory accommodation, three meals daily, faculty lectures,
                      cultural program, certificate of completion.
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* SUBJECT */}
      <section className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
            2. Choose Your Subject
          </span>
          <span className="text-[10px] font-light text-foreground/40">Required</span>
        </header>

        {subjects.length === 0 ? (
          <div className="border border-border bg-muted/30 p-5">
            <p className="text-sm font-light text-foreground/60">
              No subjects are currently open for this cycle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map((s) => {
              const isSelected = s.id === selectedSubjectId;
              return (
                <label
                  key={s.id}
                  className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? "border-gate-gold bg-gate-gold/8"
                      : "border-border hover:border-gate-gold/50 hover:bg-gate-gold/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="subjectId"
                    value={s.id}
                    checked={isSelected}
                    onChange={() => setSelectedSubjectId(s.id)}
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
              );
            })}
          </div>
        )}
      </section>

      {/* CAMP EXTRAS — only when Hangzhou Camp selected */}
      {isCamp && (
        <section className="flex flex-col gap-5 border border-gate-gold/30 bg-gate-gold/5 p-6">
          <header className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
              3. Camp Participant Information
            </span>
            <p className="text-xs font-light text-foreground/55">
              Required for Hangzhou camp registration. Used for visa documentation and on-site safety.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="passportNumber"
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/65"
              >
                Passport Number
              </label>
              <input
                id="passportNumber"
                name="passportNumber"
                type="text"
                required={isCamp}
                defaultValue={participant.passportNumber ?? ""}
                className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gate-gold"
                placeholder="e.g. AB1234567"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="passportExpiry"
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/65"
              >
                Passport Expiry Date
              </label>
              <input
                id="passportExpiry"
                name="passportExpiry"
                type="date"
                required={isCamp}
                defaultValue={participant.passportExpiry ?? ""}
                className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gate-gold"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label
                htmlFor="emergencyContact"
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/65"
              >
                Emergency Contact (Parent/Guardian)
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                type="text"
                required={isCamp}
                defaultValue={participant.emergencyContact ?? ""}
                className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gate-gold"
                placeholder="Name and phone number (with country code)"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label
                htmlFor="dietaryNeeds"
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/65"
              >
                Dietary Needs <span className="text-foreground/40 font-light normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                id="dietaryNeeds"
                name="dietaryNeeds"
                rows={2}
                defaultValue={participant.dietaryNeeds ?? ""}
                className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gate-gold resize-none"
                placeholder="Halal, vegetarian, allergies, medical needs..."
              />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-gate-gold/20">
            <input
              type="checkbox"
              name="parentalConsent"
              defaultChecked={participant.parentalConsent}
              required={isCamp}
              className="mt-0.5 accent-[#C9993A]"
            />
            <span className="text-xs font-light text-foreground/70 leading-relaxed">
              I confirm I have parental/guardian consent to participate in the Hangzhou Academic
              Training Camp. I understand the camp runs 19–25 July 2026 at Xidian University, China.
            </span>
          </label>
        </section>
      )}

      {/* ORDER SUMMARY + PAY */}
      <section className="flex flex-col gap-4 border border-border p-6 bg-card">
        <header className="border-b border-border pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
            Order Summary
          </span>
        </header>

        {!selectedRound ? (
          <p className="text-sm font-light text-foreground/55">
            Select a program above to see pricing.
          </p>
        ) : selectedRound.feeUsd === 0 ? (
          <p className="text-sm font-light text-foreground/65">
            This program has no registration fee. Click below to confirm your enrollment.
          </p>
        ) : (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between font-light text-foreground/65">
              <span>Program fee</span>
              <span>{fmtMoney(net)}</span>
            </div>
            <div className="flex items-center justify-between font-light text-foreground/50">
              <span>Service fee</span>
              <span>{fmtMoney(fee)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-foreground border-t border-border pt-2 mt-1">
              <span>Total</span>
              <span>{fmtMoney(gross)} USD</span>
            </div>
          </div>
        )}

        <PaymentSubmitButton
          label={
            !selectedRound
              ? "Select a program to continue"
              : selectedRound.feeUsd === 0
              ? "Confirm Enrollment"
              : `Pay ${fmtMoney(gross)} & Continue to Stripe`
          }
          disabled={!canSubmit}
        />

        {!canSubmit && (
          <p className="text-[11px] font-light text-foreground/45 text-center">
            Choose a program and a subject to enable payment.
          </p>
        )}
      </section>
    </form>
  );
}
