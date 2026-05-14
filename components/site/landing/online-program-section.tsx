import Link from "next/link";
import { Button } from "@/components/ui/button";

type Round = {
  feeUsd: number;
  startDate: Date | null;
  endDate: Date | null;
};

function dollarsFromCents(cents: number) {
  return `$${Math.floor(cents / 100).toLocaleString()}`;
}

const SUBJECTS = [
  { code: "MAT", name: "Mathematics", desc: "Algebra, analysis, combinatorics, geometry, number theory" },
  { code: "PHY", name: "Physics", desc: "Classical mechanics, electrodynamics, thermodynamics, optics" },
  { code: "CHM", name: "Chemistry", desc: "Organic, inorganic, physical and analytical chemistry" },
  { code: "BIO", name: "Biology", desc: "Molecular biology, genetics, biochemistry, cell biology" },
  { code: "CP", name: "Competitive Programming", desc: "Algorithms, data structures, computational problem-solving" },
  { code: "ENG", name: "English", desc: "Academic English — reading, writing, language analysis" },
];

const STEPS = [
  { n: "01", title: "Register", desc: "Create an account and select your subject of focus." },
  { n: "02", title: "Take the Assessment", desc: "Complete the academic evaluation during the open window." },
  { n: "03", title: "Receive Your Report", desc: "Get a detailed performance breakdown — strengths, growth areas, percentile." },
  { n: "04", title: "Earn Your Certificate", desc: "Receive your Certificate of Completion and any awarded distinctions." },
];

export function OnlineProgramSection({ round }: { round: Round | undefined }) {
  return (
    <section id="online-program" className="bg-background border-b border-border">
      {/* INTRO */}
      <div className="mx-auto max-w-7xl px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center border-b border-border">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="font-serif text-5xl font-light text-gate-gold/70">01</span>
            <div className="h-px w-10 bg-gate-gold/40" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Program 01 · Online Diagnostic
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground leading-[1.15]">
            A Personalized<br />Academic Profile
          </h2>
          <div className="h-px w-14 bg-gate-gold/40" />
          <p className="text-sm font-light text-foreground/60 leading-[1.9] max-w-md">
            The Online Diagnostic Assessment is a structured evaluation in a single discipline.
            Every participant receives a detailed performance report identifying their academic
            strengths, growth areas, and percentile across an international cohort.
          </p>
          <p className="text-sm font-light text-foreground/60 leading-[1.9] max-w-md">
            This is diagnostic and educational — not competitive. The goal is self-knowledge: where
            you stand academically, and where to focus your growth.
          </p>
        </div>

        <div className="flex flex-col gap-px bg-border border border-border">
          {[
            { label: "Format", value: "Hybrid · Online + supervised stations" },
            { label: "Dates", value: round?.startDate && round?.endDate
              ? `${round.startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })} – ${round.endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`
              : "TBA" },
            { label: "Duration", value: "6-day assessment window" },
            { label: "Eligibility", value: "Grades 1–12 · Worldwide" },
            { label: "Fee", value: round ? `${dollarsFromCents(round.feeUsd)} per participant` : "TBA" },
            { label: "Outcomes", value: "Performance Report + Certificate" },
          ].map((r) => (
            <div key={r.label} className="flex gap-6 bg-card px-6 py-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold w-24 shrink-0 pt-0.5">
                {r.label}
              </span>
              <span className="text-sm font-light text-foreground/70">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="mx-auto max-w-7xl px-6 py-24 border-b border-border">
        <div className="flex flex-col items-center gap-4 text-center mb-14">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            How It Works
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-light text-foreground">
            Four-Step Process
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-4 bg-card p-8">
              <span className="font-serif text-4xl font-light text-gate-gold/70">{s.n}</span>
              <span className="font-serif text-lg font-light text-foreground">{s.title}</span>
              <p className="text-[12px] font-light text-foreground/55 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DISCIPLINES */}
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-center gap-4 text-center mb-14">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Choose Your Discipline
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-light text-foreground">
            Six Subject Areas
          </h3>
          <p className="text-sm font-light text-foreground/50 max-w-md mt-1">
            Each participant selects one discipline. The assessment is calibrated to your grade level.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {SUBJECTS.map((s) => (
            <div key={s.code} className="flex flex-col gap-3 bg-card p-8 hover:bg-muted/30 transition-colors">
              <span className="text-[9px] font-semibold tracking-[0.35em] text-gate-gold">{s.code}</span>
              <span className="font-serif text-xl font-light text-foreground">{s.name}</span>
              <span className="text-[11px] font-light text-foreground/45 leading-relaxed">{s.desc}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button variant="gold" size="lg" asChild>
            <Link href="/register">Register for Online Assessment</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
