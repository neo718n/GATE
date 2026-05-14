import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, results } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getParticipantEnrollments } from "@/lib/actions/enrollments";
import { ResultsWithEnrollmentFilter } from "@/components/participant/results-with-enrollment-filter";

export default async function ResultsPage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  const myResults = participant
    ? await db.query.results.findMany({
        where: eq(results.participantId, participant.id),
        with: { subject: true, cycle: true, round: true },
        orderBy: results.publishedAt,
      })
    : [];

  // Fetch enrollments for filtering
  const enrollments = participant ? await getParticipantEnrollments(participant.id) : [];

  // Check if participant has at least one paid enrollment
  const hasPaidEnrollment = enrollments.some((e) => e.paymentStatus === "paid");

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          My Results
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Results</h1>
      </div>

      <ResultsWithEnrollmentFilter
        enrollments={enrollments as any}
        results={myResults as any}
        hasPaidEnrollment={hasPaidEnrollment}
      />
    </div>
  );
}
