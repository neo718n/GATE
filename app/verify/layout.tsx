import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground hover:text-gate-gold transition-colors"
          >
            <ShieldCheck className="h-5 w-5 text-gate-gold" aria-hidden />
            <span className="font-serif text-base">G.A.T.E.</span>
            <span className="text-foreground/40 font-sans font-light hidden sm:inline">
              · Verification Portal
            </span>
          </Link>
          <Link
            href="/verify/bulk"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60 hover:text-gate-gold transition-colors"
          >
            Bulk Verify
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-foreground/50">
          <p>Verification powered by G.A.T.E. Assessment Authority.</p>
          <p className="font-mono">
            <Link href="/" className="hover:text-foreground transition-colors">
              gate-assessment.org
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
