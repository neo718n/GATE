import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Competition Structure",
  description:
    "Learn about the G.A.T.E. Olympiad two-phase structure: an online preliminary round followed by the global onsite final at Xidian University, Hangzhou.",
};

const PHASES = [
  {
    phase: "Phase I",
    label: "Online Preliminary Round",
    description:
      "The Preliminary Round is an open, globally accessible examination conducted online. Students from any country may register and attempt the subject examination of their choice under remotely proctored conditions.",
    details: [
      { label: "Format", value: "Theoretical examination — written problems" },
      { label: "Mode", value: "Online, remotely proctored" },
      { label: "Eligibility", value: "Open to all qualifying students worldwide" },
      { label: "Subjects", value: "Mathematics, Physics, Chemistry, Biology, Computer Science, Economics" },
      { label: "Outcome", value: "Top scorers per subject advance to the Global Final" },
    ],
  },
  {
    phase: "Phase II",
    label: "Global Onsite Olympiad",
    description:
      "Finalists are invited to compete in person at the Xidian University Hangzhou Campus, China. The onsite olympiad features more advanced theoretical problems, collaboration events, and a formal awards ceremony.",
    details: [
      { label: "Location", value: "Xidian University · Hangzhou Campus · China" },
      { label: "Format", value: "Onsite theoretical examination + awards ceremony" },
      { label: "Eligibility", value: "Invitation only — top performers from Phase I" },
      { label: "Hospitality", value: "Accommodation and local transport arrangements provided for finalists" },
      { label: "Outcome", value: "Gold, Silver, Bronze medals awarded per subject" },
    ],
  },
];

const TIMELINE = [
  { period: "Registration Opens", detail: "Applications open to participants worldwide" },
  { period: "Preliminary Round", detail: "Online examination across all subject areas" },
  { period: "Results Announced", detail: "Phase I results published; finalists notified" },
  { period: "Global Onsite Olympiad", detail: "Finals at Xidian University, Hangzhou Campus" },
  { period: "Awards Ceremony", detail: "Medal presentation and closing celebration" },
];

export default function StructurePage() {
  return (
    <>
      {/* Header */}
      <section className="py-20 px-6 border-b border-border/30 bg-gate-800/10">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
            How It Works
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-white">
            Competition Structure
          </h1>
          <p className="text-base font-light text-gate-white/55 leading-relaxed max-w-2xl mt-2">
            G.A.T.E. operates across two distinct phases — an open online
            preliminary accessible to students everywhere, followed by a
            prestigious in-person final hosted at Xidian University, Hangzhou.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          {PHASES.map((item, i) => (
            <div
              key={item.phase}
              className="grid grid-cols-1 lg:grid-cols-5 gap-10 border border-border/40 bg-gate-800/15 p-10"
            >
              <div className="lg:col-span-2 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-gate-gold/50 text-[11px] font-semibold tracking-widest text-gate-gold">
                    {i + 1}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-gate-gold/70">
                    {item.phase}
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-light text-gate-white">
                  {item.label}
                </h2>
                <p className="text-sm font-light text-gate-white/55 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="lg:col-span-3 flex flex-col divide-y divide-border/30">
                {item.details.map((d) => (
                  <div key={d.label} className="flex flex-col sm:flex-row sm:items-start gap-2 py-4 first:pt-0 last:pb-0">
                    <span className="shrink-0 w-40 text-[9px] font-semibold uppercase tracking-[0.3em] text-gate-gray pt-0.5">
                      {d.label}
                    </span>
                    <span className="text-sm font-light text-gate-white/70">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6 border-t border-border/30 bg-gate-800/10">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
              Timeline
            </span>
            <h2 className="font-serif text-4xl font-light text-gate-white">
              Competition Calendar
            </h2>
          </div>
          <div className="relative flex flex-col gap-0">
            <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-gate-gold/40 via-gate-gold/20 to-transparent" />
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-6 py-6">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                  <div className="h-3 w-3 rounded-full border border-gate-gold bg-gate-900" />
                </div>
                <div className="flex flex-col gap-1 pt-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
                    {item.period}
                  </span>
                  <span className="text-sm font-light text-gate-white/55">
                    {item.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-4xl font-light text-gate-white">
            Ready to Register?
          </h2>
          <p className="text-sm font-light text-gate-white/55">
            Create your account and complete your application to participate in
            the next G.A.T.E. Olympiad cycle.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link href="/register">Apply Now</Link>
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
