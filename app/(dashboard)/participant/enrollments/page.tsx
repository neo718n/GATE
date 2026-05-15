import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, cycles } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getParticipantEnrollments } from "@/lib/actions/enrollments";
import { EnrollmentsGrid } from "@/components/participant/enrollments-grid";

export default async function EnrollmentsPage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  // Fetch participant record
  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  // If no participant record exists, redirect to registration
  if (!participant) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            My Enrollments
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">Enrollments</h1>
        </div>
        <div className="border border-border bg-muted/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
            Registration Required
          </p>
          <p className="text-sm font-light text-foreground/65 leading-[1.9]">
            You must complete your registration before enrolling in programs.
          </p>
          <Button variant="gold" size="sm" asChild className="w-fit">
            <Link href="/register">Complete Registration</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Fetch all enrollments for this participant
  const enrollments = await getParticipantEnrollments(participant.id);

  // Determine whether there are still open programs the participant hasn't enrolled in.
  // We treat any existing enrollment (draft, paid, etc.) as "taken" — drafts are resumable
  // from the card itself, no need to "enroll again" in the same round.
  const activeCycle = await db.query.cycles.findFirst({
    where: or(eq(cycles.status, "registration_open"), eq(cycles.status, "active")),
    with: { rounds: true },
  });
  const enrolledRoundIds = new Set(enrollments.map((e) => e.roundId));
  const availableRounds =
    activeCycle?.rounds.filter(
      (r) => r.registrationStatus === "open" && !enrolledRoundIds.has(r.id),
    ) ?? [];
  const hasMoreToEnroll = availableRounds.length > 0;

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            My Enrollments
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">
            Program Enrollments
          </h1>
          {enrollments.length > 0 && (
            <p className="text-sm font-light text-foreground/55 mt-1">
              {enrollments.length === 1
                ? "1 enrollment"
                : `${enrollments.length} enrollments`}
              {" · "}
              {hasMoreToEnroll
                ? `${availableRounds.length} more program${availableRounds.length > 1 ? "s" : ""} available`
                : "All open programs added"}
            </p>
          )}
        </div>
        {hasMoreToEnroll ? (
          <Button variant="gold" size="sm" asChild>
            <Link href="/participant/enrollment">Enroll in Another Program</Link>
          </Button>
        ) : enrollments.length > 0 ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/40 border border-border px-3 py-1.5">
            All Programs Added
          </span>
        ) : null}
      </div>

      {/* No enrollments state */}
      {enrollments.length === 0 && (
        <div className="border border-border bg-muted/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
            No Enrollments Yet
          </p>
          <p className="text-sm font-light text-foreground/65 leading-[1.9]">
            You haven&apos;t enrolled in any programs yet. Start by selecting a program to enroll in.
          </p>
          <Button variant="gold" size="sm" asChild className="w-fit">
            <Link href="/participant/enrollment">Enroll in a Program</Link>
          </Button>
        </div>
      )}

      {/* Enrollments grid */}
      {enrollments.length > 0 && (
        <EnrollmentsGrid enrollments={enrollments as any} />
      )}

      {/* Help text — only when it's actually new info (single enrollment, no context yet) */}
      {enrollments.length === 1 && hasMoreToEnroll && (
        <p className="text-xs font-light text-foreground/45 border-t border-border pt-4">
          Each enrollment has its own subject choice and payment. Drafts can be resumed from the card above.
        </p>
      )}
    </div>
  );
}
