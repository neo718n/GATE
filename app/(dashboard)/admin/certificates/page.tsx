import Link from "next/link";
import { desc, isNotNull } from "drizzle-orm";
import {
  Download,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { certificates, results } from "@/lib/db/schema";
import { IssueCertificateButton } from "@/components/admin/issue-certificate-button";
import { RevokeCertificateButton } from "@/components/admin/revoke-certificate-button";
import { verifyUrlFor } from "@/lib/certificates/render-pdf";

export default async function AdminCertificatesPage() {
  await requireRole(["admin", "super_admin"]);

  const rows = await db.query.results.findMany({
    where: isNotNull(results.publishedAt),
    with: { participant: true, subject: true, cycle: true },
    orderBy: desc(results.publishedAt),
  });

  const certRows = await db
    .select()
    .from(certificates)
    .orderBy(desc(certificates.issuedAt));
  const certByResult = new Map(certRows.map((c) => [c.resultId, c]));

  const issuedCount = certRows.length;
  const revokedCount = certRows.filter((c) => c.revokedAt).length;
  const pendingCount = rows.filter(
    (r) => r.award && !certByResult.has(r.id),
  ).length;

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Admin
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">
            Certificates
          </h1>
          <p className="text-sm font-light text-foreground/60 mt-1">
            Issue, revoke, and audit G.A.T.E. verification certificates.
          </p>
        </div>
        <Link
          href="/admin/certificates/verifications"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          View verification analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="Issued" value={issuedCount} />
        <StatTile label="Awaiting Issue" value={pendingCount} accent="gold" />
        <StatTile label="Revoked" value={revokedCount} accent="amber" />
      </div>

      {rows.length === 0 ? (
        <div className="border border-border bg-muted/30 p-8 text-center">
          <p className="text-sm font-light text-foreground/60">
            No published results yet. Add results in the Results section first.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border overflow-x-auto">
          <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1.4fr_1.4fr] gap-4 px-5 py-3 bg-muted/30 min-w-[900px]">
            {[
              "Participant",
              "Subject",
              "Cycle",
              "Award",
              "Certificate",
              "Actions",
            ].map((h) => (
              <span
                key={h}
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50"
              >
                {h}
              </span>
            ))}
          </div>
          {rows.map((r) => {
            const cert = certByResult.get(r.id);
            const revoked = !!cert?.revokedAt;
            return (
              <div
                key={r.id}
                className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1.4fr_1.4fr] gap-4 px-5 py-4 items-center min-w-[900px]"
              >
                <p className="text-sm font-light text-foreground truncate">
                  {r.participant?.fullName ?? "—"}
                </p>
                <p className="text-xs font-light text-foreground/70 truncate">
                  {r.subject?.name ?? "—"}
                </p>
                <p className="text-xs font-light text-foreground/70 truncate">
                  {r.cycle?.name ?? "—"}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gate-gold">
                  {r.award ? r.award.replace(/_/g, " ") : "—"}
                </p>
                <div className="flex flex-col gap-0.5">
                  {cert ? (
                    <>
                      <span className="font-mono text-[10px] text-foreground/80 tracking-wider truncate">
                        {cert.verificationCode}
                      </span>
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${
                          revoked
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {revoked ? (
                          <span className="inline-flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" aria-hidden />
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" aria-hidden />
                            Active
                          </span>
                        )}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/30">
                      Not issued
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cert ? (
                    <>
                      <Link
                        href={`/api/admin/certificates/${cert.id}/download`}
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                        target="_blank"
                      >
                        <Download className="h-3 w-3" aria-hidden />
                        PDF
                      </Link>
                      <a
                        href={verifyUrlFor(cert.verificationCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden />
                        Verify
                      </a>
                      <RevokeCertificateButton
                        certificateId={cert.id}
                        isRevoked={revoked}
                      />
                    </>
                  ) : r.award ? (
                    <IssueCertificateButton resultId={r.id} />
                  ) : (
                    <span className="text-[10px] font-light text-foreground/40">
                      Award required
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "gold" | "amber";
}) {
  const accentClass =
    accent === "gold"
      ? "text-gate-gold"
      : accent === "amber"
        ? "text-amber-600"
        : "text-foreground";
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
        {label}
      </p>
      <p className={`mt-2 font-serif text-3xl font-light ${accentClass}`}>
        {value}
      </p>
    </div>
  );
}
