import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, results } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CertificatesPage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  const certResults = participant
    ? await db.query.results.findMany({
        where: and(
          eq(results.participantId, participant.id),
          isNotNull(results.publishedAt),
        ),
        with: { subject: true, cycle: true, round: true },
        orderBy: results.publishedAt,
      })
    : [];

  const hasCertificates = certResults.length > 0;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          My Certificates
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Certificates</h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">
          Verifiable certificates for all completed assessment rounds.
        </p>
      </div>

      {!participant || participant.paymentStatus !== "paid" ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/60">
            Enrollment Required
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            Certificates will be issued once you complete an assessment round.
          </p>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/participant/enrollment">Go to Enrollment</Link>
          </Button>
        </div>
      ) : !hasCertificates ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/60 mb-2">
            No Certificates Issued
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            Certificates are issued after results are published. A Certificate of Participation will
            be issued to all participants who complete the Preliminary Round.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {certResults.map((r) => (
            <div key={r.id} className="border border-gate-fog bg-white p-6 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
                  {r.award
                    ? r.award.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : "Certificate of Participation"}
                </p>
                <p className="text-sm font-light text-gate-800">
                  {r.subject?.name} вЂ” {r.cycle?.name}
                </p>
                <p className="text-xs font-light text-gate-800/50">
                  {r.round?.name ?? "Assessment Round"}
                </p>
              </div>
              <div>
                {r.certificateUrl ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={r.certificateUrl} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </Button>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/40">
                    Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

