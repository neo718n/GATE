import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ParticipantDashboard() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
    with: {
      subjects: { with: { subject: true } },
    },
  });

  const registrationLabel =
    participant?.registrationStatus === "submitted"
      ? "Submitted"
      : participant?.registrationStatus === "verified"
        ? "Verified"
        : participant?.registrationStatus === "rejected"
          ? "Rejected"
          : "Not Submitted";

  const subjectLabel = participant?.subjects[0]?.subject?.name ?? "Not Selected";

  const paymentLabel =
    participant?.paymentStatus === "paid"
      ? "Paid"
      : participant?.paymentStatus === "waived"
        ? "Waived"
        : "Unpaid";

  const registrationNote =
    participant?.registrationStatus === "submitted"
      ? "Awaiting verification"
      : participant?.registrationStatus === "verified"
        ? "Registration confirmed"
        : participant?.registrationStatus === "rejected"
          ? "Contact support"
          : "Complete your profile to begin";

  const profileComplete = !!participant && participant.registrationStatus !== "draft";
  const hasSubject = (participant?.subjects.length ?? 0) > 0;
  const isPaid = participant?.paymentStatus === "paid";

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Participant Portal
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">My Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Registration Status", value: registrationLabel, note: registrationNote },
          {
            label: "Subject Area",
            value: subjectLabel,
            note: hasSubject ? "Subject selected" : "Select during enrollment",
          },
          {
            label: "Payment Status",
            value: paymentLabel,
            note: isPaid ? "Payment confirmed" : "Complete enrollment to pay",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-gate-fog bg-white p-6 flex flex-col gap-2 shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gate-800/60">
              {stat.label}
            </p>
            <p className="text-lg font-light text-gate-800">{stat.value}</p>
            <p className="text-xs font-light text-gate-800/60">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="border border-gate-fog bg-white p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-800">
            My Profile
          </h2>
          <p className="text-sm font-light text-gate-800/60 leading-[1.8]">
            {profileComplete
              ? "Your profile is on file. You can update it at any time."
              : "Complete your participant profile including personal details, school information, and guardian contact."}
          </p>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/participant/profile">
              {profileComplete ? "View / Edit Profile" : "Complete Profile"}
            </Link>
          </Button>
        </div>

        <div className="border border-gate-fog bg-white p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-800">
            Subject Enrollment
          </h2>
          <p className="text-sm font-light text-gate-800/60 leading-[1.8]">
            {isPaid
              ? `Enrolled in ${subjectLabel}. Payment confirmed.`
              : hasSubject
                ? `Subject selected: ${subjectLabel}. Complete payment to confirm enrollment.`
                : "Select your subject area for the Preliminary Round."}
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild={profileComplete}
            className="w-fit"
            disabled={!profileComplete}
          >
            <Link href="/participant/enrollment">
              {isPaid ? "View Enrollment" : "Go to Enrollment"}
            </Link>
          </Button>
        </div>

        <div className="border border-gate-fog bg-white p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-800">
            Exam Instructions
          </h2>
          <p className="text-sm font-light text-gate-800/60 leading-[1.8]">
            {isPaid
              ? "View examination guidelines, schedule, and submission instructions."
              : "Available once registration and payment are confirmed."}
          </p>
          {isPaid ? (
            <Button variant="outline" size="sm" asChild className="w-fit">
              <Link href="/participant/exam">View Instructions</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="w-fit opacity-40">
              Available after enrollment
            </Button>
          )}
        </div>

        <div className="border border-gate-fog bg-white p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-800">
            Results &amp; Certificates
          </h2>
          <p className="text-sm font-light text-gate-800/60 leading-[1.8]">
            View your examination results and download certificates once published.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild={isPaid}
              disabled={!isPaid}
              className="w-fit opacity-40 disabled:opacity-40"
            >
              <Link href="/participant/results">Results</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild={isPaid}
              disabled={!isPaid}
              className="w-fit opacity-40 disabled:opacity-40"
            >
              <Link href="/participant/certificates">Certificates</Link>
            </Button>
          </div>
        </div>
      </div>

      {!profileComplete && (
        <div className="border border-gate-gold/25 bg-gate-gold/5 p-6 flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
            Next Step
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            Complete your participant profile to begin the registration process.
          </p>
          <Button variant="gold" size="sm" asChild className="w-fit mt-1">
            <Link href="/participant/profile">Complete Profile Now</Link>
          </Button>
        </div>
      )}

      {profileComplete && !isPaid && (
        <div className="border border-gate-gold/25 bg-gate-gold/5 p-6 flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
            Next Step
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            {hasSubject
              ? "Your subject is selected. Complete payment to confirm your enrollment."
              : "Select your subject area and complete payment to confirm your enrollment."}
          </p>
          <Button variant="gold" size="sm" asChild className="w-fit mt-1">
            <Link href="/participant/enrollment">
              {hasSubject ? "Complete Payment" : "Select Subject & Enroll"}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
