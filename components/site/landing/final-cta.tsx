import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PROGRAM_SLUGS, programCtaHref } from "@/lib/program-cta";

export function FinalCta({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <section className="py-36 px-6 bg-gate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_50%,rgba(201,153,58,0.13),transparent)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gate-gold/20 to-transparent" />

      <div className="relative mx-auto max-w-4xl flex flex-col items-center gap-8 text-center">
        <span className="text-[9px] font-semibold uppercase tracking-[0.45em] text-gate-gold/70">
          Begin Your Academic Journey
        </span>
        <h2 className="font-serif text-4xl md:text-6xl font-light text-gate-white leading-[1.1]">
          Two Programs.<br />One Platform.
        </h2>
        <p className="text-sm font-light text-gate-white/50 leading-[1.9] max-w-lg">
          Register for the online diagnostic, apply for the Hangzhou camp, or pursue both —
          each program is independent and delivers personalized academic recognition.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Button variant="gold" size="lg" asChild>
            <Link href={programCtaHref(PROGRAM_SLUGS.ONLINE, isAuthenticated)}>{isAuthenticated ? "Enroll in Online Assessment" : "Register for Online Assessment"}</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="border-gate-white/20 text-gate-white/70 bg-transparent hover:bg-gate-white/5 hover:border-gate-white/35 hover:text-gate-white"
          >
            <Link href={programCtaHref(PROGRAM_SLUGS.CHINA_CAMP, isAuthenticated)}>{isAuthenticated ? "Enroll in Hangzhou Camp" : "Apply for Hangzhou Camp"}</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-6 text-[10px] font-light text-gate-white/35 uppercase tracking-[0.25em]">
          <span>Open to Grades 1–12</span>
          <span className="h-3 w-px bg-gate-gold/30" />
          <span>Worldwide Participation</span>
          <span className="h-3 w-px bg-gate-gold/30" />
          <span>Issued Certificates</span>
        </div>
      </div>
    </section>
  );
}
