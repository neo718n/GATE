import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Onsite Olympiad",
  description: "The G.A.T.E. Global Final at Xidian University, Hangzhou Campus — 7-day academic program.",
};

const PROGRAM = [
  { day: "Day 1", title: "Arrival & Orientation", desc: "Participant registration, venue orientation, opening ceremony, and introduction to the international academic committee." },
  { day: "Day 2", title: "Academic Workshops", desc: "Subject-specific preparatory sessions led by academic supervisors. Introduction to examination format and conduct procedures." },
  { day: "Day 3–4", title: "Main Examinations", desc: "Core competitive examinations conducted in university halls under full academic supervision and international jury oversight." },
  { day: "Day 5", title: "Academic Activities", desc: "University campus tours, faculty lectures, and academic exchange with Xidian University researchers and graduate students." },
  { day: "Day 6", title: "Cultural Program", desc: "Guided cultural experience in Hangzhou — one of China's most historically significant and academically rich cities." },
  { day: "Day 7", title: "Award Ceremony & Closing", desc: "Official awards ceremony, medal and certificate presentation, closing address, and participant departure." },
];

export default function OnsiteOlympiadPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Global Final</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">Onsite Olympiad</h1>
          <p className="text-base font-light text-gate-800/45 mt-2">Xidian University, Hangzhou Campus, China</p>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="flex flex-col gap-6">
            <h2 className="font-serif text-4xl font-light text-gate-800 leading-tight">The Global Academic Final</h2>
            <div className="flex flex-col gap-4 text-sm font-light text-gate-800/60 leading-[1.9]">
              <p>Participants who qualify through the Preliminary Round are invited to the Global Onsite Olympiad — a 7-day academic program held at Xidian University, Hangzhou Campus, one of China's leading research and technology universities.</p>
              <p>The onsite program combines competitive examination with academic exposure, cultural exchange, and international scholarly interaction. It represents the pinnacle of the G.A.T.E. Olympiad experience.</p>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            {[
              { label: "Host Institution", value: "Xidian University" },
              { label: "Campus", value: "Hangzhou Campus, Zhejiang, China" },
              { label: "Duration", value: "7 Days" },
              { label: "Format", value: "In-person — University Examination Halls" },
              { label: "Supervision", value: "International Academic Jury" },
              { label: "Eligibility", value: "Qualifying score in Round I" },
            ].map((item) => (
              <div key={item.label} className="flex gap-6 border-b border-gate-fog/70 py-4 last:border-0">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gate-gold/60 w-32 shrink-0 pt-0.5">{item.label}</span>
                <span className="text-sm font-light text-gate-800/70">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-fog/40 border-y border-gate-fog/60">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Program Overview</span>
            <h2 className="font-serif text-4xl font-light text-gate-800">7-Day Academic Program</h2>
          </div>
          <div className="flex flex-col border border-gate-fog">
            {PROGRAM.map((day, i) => (
              <div key={day.day} className={"grid grid-cols-[120px_1fr] gap-6 p-8" + (i < PROGRAM.length - 1 ? " border-b border-gate-fog/60" : "")}>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gate-gold pt-0.5">{day.day}</span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold tracking-[0.05em] text-gate-800">{day.title}</h3>
                  <p className="text-sm font-light text-gate-800/55 leading-[1.9]">{day.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col gap-5">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Standards</span>
            <h2 className="font-serif text-4xl font-light text-gate-800">Academic Supervision</h2>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: "International Jury", body: "All examinations are overseen by an international academic jury composed of subject-matter experts from multiple countries." },
              { title: "Verified Conditions", body: "Examination conditions meet international academic standards, including identity verification and supervised conduct protocols." },
              { title: "Independent Scoring", body: "Results are scored independently with no affiliation to any participant institution or national committee." },
              { title: "Official Certification", body: "All medals, distinctions, and certificates are formally issued by G.A.T.E. with verifiable authenticity." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-3 border border-gate-fog p-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gate-800">{item.title}</h3>
                <p className="text-sm font-light text-gate-800/55 leading-[1.9]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gate-fog/40 border-t border-gate-fog/60">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-4xl font-light text-gate-800">Qualify for the Global Final</h2>
          <p className="text-sm font-light text-gate-800/55 leading-[1.9]">Begin with the Preliminary Round. Top qualifying participants receive an invitation to the onsite final at Xidian University, Hangzhou.</p>
          <div className="flex gap-4">
            <Button variant="gold" size="md" asChild><Link href="/register">Apply Now</Link></Button>
            <Button variant="outline" size="md" asChild><Link href="/structure">View Structure</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
