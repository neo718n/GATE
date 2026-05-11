import Link from "next/link";
import { ThemeAwareLogo } from "@/components/brand/theme-aware-logo";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[min(82vh,820px)] flex-col items-center justify-center px-6 py-20 text-center overflow-hidden bg-card">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_115%,rgba(201,153,58,0.07),transparent)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gate-gold/25 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gate-gold/15 to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: "radial-gradient(rgba(201,153,58,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full">
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-gate-gold/40" />
          <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold/70">
            International Academic Programs
          </p>
          <div className="h-px w-10 bg-gate-gold/40" />
        </div>

        <ThemeAwareLogo size="xl" showTagline />

        <p className="text-base md:text-lg font-light text-foreground/55 leading-relaxed max-w-2xl mt-2">
          Diagnostic assessments and educational programs that help ambitious students
          discover their academic strengths and grow at internationally renowned institutions.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Button variant="gold" size="lg" asChild>
            <Link href="#programs">Explore Programs</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">About G.A.T.E.</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-foreground/35">
            In partnership with
          </span>
          <span className="text-[11px] font-light text-foreground/55">
            Xidian University · Hangzhou Institute of Technology
          </span>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="h-10 w-px bg-gradient-to-b from-transparent to-gate-gold/25" />
      </div>
    </section>
  );
}
