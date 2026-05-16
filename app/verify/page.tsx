import type { Metadata } from "next";
import { ShieldCheck, Hash, FileCheck2 } from "lucide-react";
import { VerifyCodeForm } from "@/components/verify/verify-code-form";

export const metadata: Metadata = {
  title: "Verify a Certificate · G.A.T.E.",
  description:
    "Independently verify any G.A.T.E. certificate issued by the G.A.T.E. Assessment Authority.",
};

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center space-y-3 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          <ShieldCheck className="h-3 w-3 text-gate-gold" aria-hidden />
          Official Verification
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Verify a G.A.T.E. Certificate
        </h1>
        <p className="text-sm sm:text-base text-foreground/60 max-w-md mx-auto">
          Enter the verification code printed on the certificate, or scan its QR
          code, to confirm authenticity.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm">
        <VerifyCodeForm />
      </div>

      <section
        aria-labelledby="how-it-works"
        className="mt-12 sm:mt-16 border-t border-border/60 pt-10"
      >
        <h2
          id="how-it-works"
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50 text-center mb-6"
        >
          How verification works
        </h2>
        <ol className="grid sm:grid-cols-3 gap-6 text-sm">
          <li className="space-y-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gate-gold/10 text-gate-gold">
              <Hash className="h-4 w-4" aria-hidden />
            </div>
            <h3 className="font-semibold text-foreground">Unique code</h3>
            <p className="text-foreground/60 leading-relaxed">
              Every certificate carries an unguessable code with a cryptographic
              signature.
            </p>
          </li>
          <li className="space-y-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gate-gold/10 text-gate-gold">
              <FileCheck2 className="h-4 w-4" aria-hidden />
            </div>
            <h3 className="font-semibold text-foreground">Authoritative source</h3>
            <p className="text-foreground/60 leading-relaxed">
              Results are matched against the official G.A.T.E. Assessment
              registry — not the certificate file itself.
            </p>
          </li>
          <li className="space-y-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gate-gold/10 text-gate-gold">
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </div>
            <h3 className="font-semibold text-foreground">Tamper-evident</h3>
            <p className="text-foreground/60 leading-relaxed">
              Any modification to a code or its embedded signature will fail
              verification.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
