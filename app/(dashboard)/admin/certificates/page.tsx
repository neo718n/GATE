import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { results } from "@/lib/db/schema";
import { desc, isNotNull } from "drizzle-orm";

export default async function CertificatesPage() {
  await requireRole(["admin", "super_admin"]);

  const publishedResults = await db.query.results.findMany({
    where: isNotNull(results.publishedAt),
    with: { participant: true, subject: true, cycle: true },
    orderBy: desc(results.publishedAt),
  });

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Certificates</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          {publishedResults.length} results published В· certificate issuance managed here.
        </p>
      </div>

      <div className="border bg-gate-gold/5 border-gate-gold/25 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold mb-2">
          Certificate Generation
        </p>
        <p className="text-sm font-light text-foreground/65 leading-[1.9]">
          Certificates are generated and issued to participants once results are published.
          Each certificate includes a unique verification code, the participant&apos;s name, subject,
          cycle, award level, and official G.A.T.E. seal. Certificate generation pipeline is
          managed by the operations team вЂ” upload the certificate URL to each result record to
          make it available for download.
        </p>
      </div>

      {publishedResults.length === 0 ? (
        <div className="border border-border bg-muted/30 p-8 text-center">
          <p className="text-sm font-light text-foreground/60">
            No published results yet. Add results in the Results section first.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 px-5 py-3 bg-muted/30">
            {["Participant", "Subject", "Cycle", "Award", "Certificate"].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
                {h}
              </span>
            ))}
          </div>
          {publishedResults.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 px-5 py-4 items-center"
            >
              <p className=”text-sm font-light text-foreground truncate”>
                {(r.participant as any)?.fullName ?? “—“}
              </p>
              <p className=”text-xs font-light text-foreground/70”>{(r.subject as any)?.name ?? “—“}</p>
              <p className=”text-xs font-light text-foreground/70”>{(r.cycle as any)?.name ?? “—“}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gate-gold">
                {r.award ? r.award.replace("_", " ") : "Participation"}
              </p>
              <div>
                {r.certificateUrl ? (
                  <a
                    href={r.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-gold hover:underline"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/30">
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
