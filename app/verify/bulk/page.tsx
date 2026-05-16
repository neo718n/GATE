import type { Metadata } from "next";
import { Users } from "lucide-react";
import { BulkVerifyForm } from "@/components/verify/bulk-verify-form";

export const metadata: Metadata = {
  title: "Bulk Verify · G.A.T.E.",
  description:
    "Verify up to 100 G.A.T.E. certificates at once — built for university admissions teams and partner institutions.",
};

export default function BulkVerifyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
      <div className="space-y-3 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          <Users className="h-3 w-3 text-gate-gold" aria-hidden />
          For Institutions
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Bulk Certificate Verification
        </h1>
        <p className="text-sm sm:text-base text-foreground/60 max-w-xl">
          Paste a list of codes (one per line) or upload a CSV. Results are
          authoritative and refreshed live from the G.A.T.E. registry.
        </p>
      </div>
      <BulkVerifyForm />
      <section className="mt-12 border-t border-border/60 pt-8 text-sm text-foreground/60 space-y-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
          Programmatic access
        </h2>
        <p>
          Partner institutions can request an API key for high-volume
          verification via{" "}
          <code className="font-mono text-foreground bg-foreground/5 px-1.5 py-0.5 rounded text-xs">
            POST /api/v1/verify/bulk
          </code>
          . Contact{" "}
          <a
            href="mailto:partnerships@gate-assessment.org"
            className="text-gate-gold hover:underline"
          >
            partnerships@gate-assessment.org
          </a>{" "}
          to get started.
        </p>
      </section>
    </div>
  );
}
