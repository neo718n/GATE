import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const SUBJECTS = [
  { code: "MAT", name: "Mathematics" },
  { code: "PHY", name: "Physics" },
  { code: "CHM", name: "Chemistry" },
  { code: "BIO", name: "Biology" },
  { code: "CS", name: "Computer Science" },
  { code: "ECO", name: "Economics" },
];

const PHASES = [
  {
    phase: "Phase I",
    title: "Online Preliminary Round",
    detail:
      "Open to students worldwide. Theoretical examinations across chosen subject areas conducted remotely under verified conditions.",
  },
  {
    phase: "Phase II",
    title: "Global Onsite Olympiad",
    detail:
      "Top performers from the Preliminary Round are invited to Xidian University, Hangzhou Campus, China, for the in-person final competition.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--gate-800)_0%,_var(--gate-900)_70%)] opacity-60" />
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl">
          <Logo size="xl" variant="dark" showTagline />
          <p className="text-base md:text-lg font-light text-gate-white/60 leading-relaxed max-w-2xl mt-4">
            An international academic competition for exceptional students across
            six disciplines — from an open online preliminary to a prestigious
            onsite final at Xidian University, Hangzhou.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Button variant="gold" size="lg" asChild>
              <Link href="/register">Apply Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/structure">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="h-10 w-px bg-gradient-to-b from-transparent to-gate-gold" />
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-6 border-t border-border/30">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
              About the Olympiad
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-white leading-tight">
              Where Academic Excellence Meets Global Community
            </h2>
          </div>
          <div className="flex flex-col gap-5 text-sm font-light text-gate-white/60 leading-relaxed">
            <p>
              G.A.T.E. — the Global Academic &amp; Theoretical Excellence
              Olympiad — is an international competition designed to discover
              and celebrate intellectual talent across the sciences, mathematics,
              and economics.
            </p>
            <p>
              Participants compete through two structured rounds: an open online
              preliminary accessible to students worldwide, followed by an
              invitation-only global final held at the prestigious Xidian
              University in Hangzhou, China.
            </p>
            <p>
              Beyond competition, G.A.T.E. builds a lasting international
              network of scholars and institutions committed to theoretical
              excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Competition Phases */}
      <section className="py-24 px-6 bg-gate-800/20 border-y border-border/30">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
              Competition Structure
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-white">
              Two Rounds, One Goal
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PHASES.map((item, i) => (
              <div
                key={item.phase}
                className="relative flex flex-col gap-4 border border-border/50 bg-gate-800/30 p-8"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center border border-gate-gold/40 text-[10px] font-semibold tracking-widest text-gate-gold">
                    {i + 1}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-gate-gold/70">
                    {item.phase}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-light text-gate-white">
                  {item.title}
                </h3>
                <p className="text-sm font-light text-gate-white/55 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button variant="outline" size="md" asChild>
              <Link href="/structure">Full Structure Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
              Subject Areas
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-white">
              Six Disciplines
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border/30">
            {SUBJECTS.map((subject) => (
              <div
                key={subject.code}
                className="flex flex-col items-center justify-center gap-3 bg-gate-900 p-8 text-center hover:bg-gate-800/40 transition-colors"
              >
                <span className="text-[10px] font-semibold tracking-[0.3em] text-gate-gold/60">
                  {subject.code}
                </span>
                <span className="text-sm font-light text-gate-white/80">
                  {subject.name}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button variant="outline" size="md" asChild>
              <Link href="/subjects">View All Subjects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 bg-gate-800/30 border-t border-border/30">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-8 text-center">
          <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
            Join the Olympiad
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-white leading-tight">
            Ready to Compete on a Global Stage?
          </h2>
          <p className="text-sm font-light text-gate-white/55 leading-relaxed max-w-xl">
            Applications are now open. Register your interest, select your
            subject area, and begin your journey toward the global final at
            Xidian University, Hangzhou.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link href="/register">Apply Now</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
