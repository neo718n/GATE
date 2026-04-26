import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, cycles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ExamPage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
    with: { subjects: { with: { subject: true } } },
  });

  const isPaid = participant?.paymentStatus === "paid";
  const activeCycle = isPaid
    ? await db.query.cycles.findFirst({
        where: eq(cycles.id, participant!.cycleId!),
      })
    : null;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Exam Instructions
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">
          Round I — Preliminary
        </h1>
      </div>

      {!isPaid ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/60">
            Enrollment Required
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            Exam instructions are available once your enrollment is confirmed and payment is received.
          </p>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/participant/enrollment">Go to Enrollment</Link>
          </Button>
        </div>
      ) : (
        <>
          {activeCycle && (
            <div className="border border-gate-gold/30 bg-gate-gold/5 p-6 flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
                You Are Enrolled
              </p>
              <p className="text-sm font-light text-gate-800">
                Subject:{" "}
                <span className="font-semibold">
                  {participant?.subjects[0]?.subject?.name ?? "—"}
                </span>
              </p>
              {activeCycle.prelimStart && (
                <p className="text-sm font-light text-gate-800/60">
                  Exam window:{" "}
                  {new Date(activeCycle.prelimStart).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  —{" "}
                  {activeCycle.prelimEnd
                    ? new Date(activeCycle.prelimEnd).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "TBA"}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-6">
            {[
              {
                heading: "Format",
                body: "Round I is a theory-based written examination conducted online. It consists of structured problems requiring written solutions, proofs, and analytical reasoning. Duration varies by subject — typically 3–4 hours.",
              },
              {
                heading: "Permitted Materials",
                body: "No calculators, reference materials, or external assistance is permitted. All examinations are conducted without aids. Solutions must be derived from first principles.",
              },
              {
                heading: "Submission",
                body: "Solutions are submitted as scanned or photographed handwritten documents through the examination portal. A clear, readable scan is required. Illegible submissions may not be graded.",
              },
              {
                heading: "Academic Integrity",
                body: "Any form of external assistance, collaboration, or use of unauthorized materials constitutes academic misconduct and results in immediate disqualification. All submitted work must be the participant's own.",
              },
              {
                heading: "Results",
                body: "Examinations are independently scored by subject-matter experts. Results are published in your portal. Participants who achieve the qualifying threshold receive an official invitation to Round II.",
              },
            ].map((item) => (
              <div key={item.heading} className="flex flex-col gap-2 border-b border-gate-fog pb-6 last:border-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800">
                  {item.heading}
                </p>
                <p className="text-sm font-light text-gate-800/65 leading-[1.9]">{item.body}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
