import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How G.A.T.E. Academic Programs work — two independent programs (Online Diagnostic Assessment and Hangzhou Academic Training Camp), the assessment process, and what every participant receives.",
};

const PROGRAMS = [
  {
    n: "01",
    label: "Program 01",
    title: "Online Diagnostic Assessment",
    description:
      "A structured academic evaluation conducted online. Every participant receives a personalized performance report identifying strengths and growth areas across their chosen discipline.",
    details: [
      { label: "Format", value: "Hybrid — online, supervised stations" },
      { label: "Audience", value: "Open to Grades 1–12 worldwide" },
      { label: "Subjects", value: "Mathematics, Physics, Chemistry, Biology, Competitive Programming, English" },
      { label: "Outcome", value: "Detailed Performance Report + Certificate of Completion" },
      { label: "Independent of Camp", value: "This is a complete, standalone program — no qualifier link" },
    ],
  },
  {
    n: "02",
    label: "Program 02",
    title: "Hangzhou Academic Training Camp",
    description:
      "A 7-day onsite educational program at Xidian University, Hangzhou. Faculty lectures, structured study, a diagnostic evaluation, a cultural program, and a Certificate of Completion.",
    details: [
      { label: "Venue", value: "Xidian University · Hangzhou Institute of Technology" },
      { label: "Duration", value: "7 Days — 19 to 25 July 2026" },
      { label: "Format", value: "Onsite — full academic immersion" },
      { label: "Audience", value: "Open to Grades 1–12 worldwide (parental consent required)" },
      { label: "Inclusions", value: "Dormitory, three meals, lectures, materials, cultural program" },
      { label: "Independent of Online", value: "Direct registration — no prerequisite from the online program" },
    ],
  },
];

const PROCESS = [
  { n: "01", title: "Register", desc: "Create an account, complete your participant profile, and pick the program that fits your goals." },
  { n: "02", title: "Choose Subject", desc: "Select one discipline. The assessment is calibrated to your grade level." },
  { n: "03", title: "Participate", desc: "Take the online assessment, or travel to Hangzhou for the onsite camp — whichever you registered for." },
  { n: "04", title: "Receive Report & Certificate", desc: "Every participant gets a detailed performance report and an official Certificate of Completion." },
  { n: "05", title: "Earn Distinction (optional)", desc: "Outstanding performance is recognized with academic awards — Top 5% Distinction, Top 15% Honors, Top 30% Merit." },
];

export default function StructurePage() {
  return (
    <>
      <section className="py-20 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            How It Works
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800 dark:text-gate-white">
            Two Programs, Independent Paths
          </h1>
          <p className="text-base font-light text-gate-800/65 dark:text-gate-white/65 leading-relaxed max-w-2xl mt-2">
            G.A.T.E. runs two academic programs in 2026 — an online diagnostic
            assessment and an onsite training camp at Xidian University. Each
            program is complete on its own; participants register for whichever
            (or both) fits their goals.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          {PROGRAMS.map((item) => (
            <div
              key={item.n}
              className="grid grid-cols-1 lg:grid-cols-5 gap-10 border border-gate-fog bg-gate-fog/40 p-10"
            >
              <div className="lg:col-span-2 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-gate-gold/50 font-serif text-base font-light text-gate-gold">
                    {item.n}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
                    {item.label}
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-light text-gate-800 dark:text-gate-white">
                  {item.title}
                </h2>
                <p className="text-sm font-light text-gate-800/65 dark:text-gate-white/65 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="lg:col-span-3 flex flex-col divide-y divide-border/30">
                {item.details.map((d) => (
                  <div key={d.label} className="flex flex-col sm:flex-row sm:items-start gap-2 py-4 first:pt-0 last:pb-0">
                    <span className="shrink-0 w-44 text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gray pt-0.5">
                      {d.label}
                    </span>
                    <span className="text-sm font-light text-gate-800/70 dark:text-gate-white/70">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 border-t border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
              Process
            </span>
            <h2 className="font-serif text-4xl font-light text-gate-800 dark:text-gate-white">
              From Registration to Certificate
            </h2>
            <p className="text-sm font-light text-gate-800/55 dark:text-gate-white/55 max-w-xl mt-1">
              The same five-step process whether you register for the online
              program, the camp, or both.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border">
            {PROCESS.map((p) => (
              <div key={p.n} className="flex flex-col gap-3 bg-card p-7">
                <span className="font-serif text-3xl font-light text-gate-gold/70">{p.n}</span>
                <span className="font-serif text-base font-light text-foreground">{p.title}</span>
                <p className="text-[11px] font-light text-foreground/55 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gate-white border-t border-gate-fog/60">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-4xl font-light text-gate-800 dark:text-gate-white">
            Ready to Register?
          </h2>
          <p className="text-sm font-light text-gate-800/65 dark:text-gate-white/65">
            Create your account and choose the program that fits your goals.
            Both are open now for 2026.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link href="/register">Register</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/subjects">View Subjects</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
