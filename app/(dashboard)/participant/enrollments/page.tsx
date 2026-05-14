import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            My Enrollments
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">
            Program Enrollments
          </h1>
        </div>
        <Button variant="gold" size="sm" asChild>
          <Link href="/participant/enrollment">Enroll in Another Program</Link>
        </Button>
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

      {/* Help text */}
      {enrollments.length > 0 && (
        <div className="border-t border-border pt-6 mt-4">
          <p className="text-xs font-light text-foreground/50 leading-[1.8]">
            You can enroll in multiple programs simultaneously. Each enrollment has independent payment
            status and subject selection. To view details or manage an enrollment, click &quot;View Details&quot;
            on the enrollment card.
          </p>
        </div>
      )}
    </div>
  );
}
