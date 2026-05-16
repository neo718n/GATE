import Link from "next/link";
import { eq } from "drizzle-orm";
import { Award, ExternalLink, ShieldAlert } from "lucide-react";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  certificates,
  participants,
  results,
} from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { ShareLinkButton } from "@/components/verify/share-link-button";
import { verifyUrlFor } from "@/lib/certificates/render-pdf";

const AWARD_LABELS: Record<string, string> = {
  gold: "Gold Medal",
  silver: "Silver Medal",
  bronze: "Bronze Medal",
  honorable_mention: "Honorable Mention",
  participation: "Certificate of Participation",
};

export default async function CertificatesPage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  const issued = participant
    ? await db
        .select({
          certificateId: certificates.id,
          verificationCode: certificates.verificationCode,
          participantName: certificates.participantName,
          subjectName: certificates.subjectName,
          award: certificates.award,
          cycleYear: certificates.cycleYear,
          issuedAt: certificates.issuedAt,
          revokedAt: certificates.revokedAt,
        })
        .from(certificates)
        .innerJoin(results, eq(results.id, certificates.resultId))
        .where(eq(results.participantId, participant.id))
    : [];

  const hasCertificates = issued.length > 0;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          My Certificates
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">
          Certificates
        </h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Independently verifiable certificates for all completed assessments.
          Each carries a unique verification code anyone can check at{" "}
          <Link href="/verify" className="text-gate-gold hover:underline">
            /verify
          </Link>
          .
        </p>
      </div>

      {!participant || participant.paymentStatus !== "paid" ? (
        <div className="border border-border bg-muted/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
            Enrollment Required
          </p>
          <p className="text-sm font-light text-foreground/65 leading-[1.9]">
            Certificates will be issued once you complete an assessment round.
          </p>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/participant/enrollment">Go to Enrollment</Link>
          </Button>
        </div>
      ) : !hasCertificates ? (
        <div className="border border-border bg-muted/30 p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/60 mb-2">
            No Certificates Yet
          </p>
          <p className="text-sm font-light text-foreground/65 leading-[1.9]">
            Certificates are issued by the G.A.T.E. Assessment Authority after
            results are published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {issued.map((c) => {
            const verifyUrl = verifyUrlFor(c.verificationCode);
            const revoked = !!c.revokedAt;
            return (
              <div
                key={c.certificateId}
                className="border border-border bg-card p-6 flex flex-col gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    aria-hidden
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                      revoked
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-gate-gold/10 text-gate-gold"
                    }`}
                  >
                    {revoked ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : (
                      <Award className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
                      {AWARD_LABELS[c.award] ?? c.award}
                    </p>
                    <p className="text-sm font-light text-foreground mt-1">
                      {c.subjectName} &mdash; {c.cycleYear}
                    </p>
                    <p className="font-mono text-xs text-foreground/50 mt-1.5 tracking-wider">
                      {c.verificationCode}
                    </p>
                    {revoked && (
                      <p className="text-xs text-amber-700 dark:text-amber-500 mt-2">
                        This certificate has been revoked.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                  <Button variant="primary" size="sm" asChild>
                    <a
                      href={`/api/participant/certificates/${c.certificateId}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PDF
                    </a>
                  </Button>
                  <ShareLinkButton url={verifyUrl} />
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open verify page
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
