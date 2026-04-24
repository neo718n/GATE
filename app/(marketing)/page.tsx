import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/site/faq-accordion";

const SUBJECTS = [
  { code: "MAT", name: "Mathematics" },
  { code: "PHY", name: "Physics" },
  { code: "CHM", name: "Chemistry" },
  { code: "BIO", name: "Biology" },
  { code: "CP", name: "Competitive Programming" },
  { code: "ENG", name: "English" },
];

const PHASES = [
  {
    num: "I", phase: "Round I", title: "Preliminary Round", subtitle: "Global Qualification · Online",
    points: ["Open to students worldwide — no geographic restriction","Theory-based academic assessment per discipline","Objective evaluation by independent reviewers","Results determine onsite Assessment eligibility"],
  },
  {
    num: "II", phase: "Round II", title: "Global Onsite Assessment", subtitle: "Xidian University, Hangzhou",
    points: ["Invitation-only based on Round I qualifying score","Conducted at Xidian University examination halls","Supervised by international academic jury","Official medals and certificates awarded"],
  },
];

const AWARDS = [
  { tier: "Gold Medal", hex: "#C9993A", desc: "Top performers across all disciplines" },
  { tier: "Silver Medal", hex: "#8A9BB0", desc: "Distinguished academic achievement" },
  { tier: "Bronze Medal", hex: "#A07040", desc: "Commendable performance" },
  { tier: "Honorable Mention", hex: "#2B5591", desc: "Notable results in Round II" },
];

const STATS = [
  { value: "50+", label: "Participating Countries" },
  { value: "6", label: "Academic Disciplines" },
  { value: "2", label: "Assessment Rounds" },
  { value: "Xidian", label: "University Partner" },
];

const FAQS = [
  { q: "Who is eligible to participate?", a: "Students currently enrolled in secondary or pre-university education are eligible. G.A.T.E. is open to participants worldwide — there are no nationality restrictions." },
  { q: "How is Round I conducted?", a: "The Preliminary Round is conducted online under verified conditions. Participants complete a theory-based assessment in their chosen discipline remotely." },
  { q: "What are the criteria for Round II qualification?", a: "Participants who achieve a qualifying score in Round I receive an official invitation to the Global Onsite Assessment at Xidian University." },
  { q: "Are certificates awarded to all participants?", a: "Yes. All participants who complete the Preliminary Round receive a Certificate of Participation. Medals and Honorable Mention distinctions are awarded at the onsite final." },
];

export default function HomePage() {
  return (
    <>
      {/* 1. HERO */}
      <section className="relative flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gate-mist" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_110%,rgba(201,153,58,0.12),transparent)]" />
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-gate-gold/50" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">International Academic Assessment</p>
            <div className="h-px w-8 bg-gate-gold/50" />
          </div>
          <Logo size="xl" variant="light" showTagline />
          <p className="text-base md:text-lg font-light text-gate-800/60 leading-relaxed max-w-2xl mt-2">
            A rigorous international academic assessment across six disciplines — from an open global Preliminary Round to an invitation-only onsite final at{" "}
            <span className="text-gate-800/85">Xidian University, Hangzhou Campus, China.</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button variant="gold" size="lg" asChild><Link href="/register">Apply Now</Link></Button>
            <Button variant="outline" size="lg" asChild><Link href="/structure">Explore Structure</Link></Button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40">
          <div className="h-12 w-px bg-gradient-to-b from-transparent to-gate-gold" />
        </div>
      </section>

      {/* 2. ABOUT */}
      <section className="py-28 px-6 bg-gate-white border-t border-gate-fog/60">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">About the Assessment</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800 leading-[1.2]" style={{ textWrap: "balance" } as React.CSSProperties}>
              A Global Standard for Academic Excellence
            </h2>
            <div className="h-px w-16 bg-gate-gold/40" />
          </div>
          <div className="flex flex-col gap-5 text-sm font-light text-gate-800/60 leading-[1.9]">
            <p>G.A.T.E. is an international assessment program designed to identify and recognize exceptional intellectual talent across the sciences, mathematics, and technology.</p>
            <p>Structured in two stages, it begins with an open online Preliminary Round accessible to students worldwide, followed by an invitation-only Global Final at Xidian University, Hangzhou Campus.</p>
            <p>Beyond the assessment, G.A.T.E. builds a lasting international community of scholars and institutions committed to the highest standards of theoretical excellence.</p>
            <div className="pt-2"><Button variant="outline" size="sm" asChild><Link href="/about">Read More About G.A.T.E.</Link></Button></div>
          </div>
        </div>
      </section>

      {/* 3. SUBJECTS */}
      <section className="py-28 px-6 bg-gate-fog/40 border-y border-gate-fog/60">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Academic Disciplines</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800">Six Disciplines</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-px bg-gate-fog">
            {SUBJECTS.map((s) => (
              <div key={s.code} className="flex flex-col items-center justify-center gap-3 bg-gate-white p-8 text-center hover:bg-gate-fog/50 transition-colors">
                <span className="text-[10px] font-semibold tracking-[0.3em] text-gate-gold">{s.code}</span>
                <span className="text-sm font-light text-gate-800/80">{s.name}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center"><Button variant="outline" size="md" asChild><Link href="/subjects">View Subject Details</Link></Button></div>
        </div>
      </section>

      {/* 4. STRUCTURE */}
      <section className="py-28 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl flex flex-col gap-14">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Assessment Structure</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800">Two Rounds, One Path</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PHASES.map((item) => (
              <div key={item.phase} className="flex flex-col gap-5 border border-gate-fog bg-gate-white p-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center border border-gate-gold/40 font-serif text-lg font-light text-gate-gold shrink-0">{item.num}</span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">{item.phase}</p>
                    <p className="text-[10px] font-light uppercase tracking-[0.2em] text-gate-800/65">{item.subtitle}</p>
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-light text-gate-800">{item.title}</h3>
                <ul className="flex flex-col gap-2.5">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-sm font-light text-gate-800/60">
                      <span className="mt-2 h-px w-4 shrink-0 bg-gate-gold/40" />{pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex justify-center"><Button variant="outline" size="md" asChild><Link href="/structure">Full Structure Details</Link></Button></div>
        </div>
      </section>

      {/* 5. ONSITE */}
      <section className="py-28 px-6 bg-gate-fog/40 border-y border-gate-fog/60">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Global Final</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800 leading-tight">Xidian University<br /><span className="text-gate-800/70">Hangzhou Campus</span></h2>
            <div className="h-px w-16 bg-gate-gold/40" />
            <p className="text-sm font-light text-gate-800/60 leading-[1.9]">Qualified participants are invited to the Global Onsite Assessment at Xidian University, Hangzhou Campus. The 7-day academic program combines rigorous examination with international scholarly exchange.</p>
            <Button variant="outline" size="sm" asChild className="w-fit"><Link href="/onsite-assessment">Program Details</Link></Button>
          </div>
          <div className="flex flex-col gap-0 border border-gate-fog">
            {[
              { label: "Venue", value: "Xidian University, Hangzhou Campus, China" },
              { label: "Format", value: "In-person — University Examination Halls" },
              { label: "Supervision", value: "International Academic Jury" },
              { label: "Duration", value: "7-Day Academic Program" },
              { label: "Recognition", value: "Official Medals and Certificates" },
            ].map((item) => (
              <div key={item.label} className="flex gap-6 border-b border-gate-fog/70 px-6 py-4 last:border-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold w-28 shrink-0 pt-0.5">{item.label}</span>
                <span className="text-sm font-light text-gate-800/65">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. AWARDS */}
      <section className="py-28 px-6 bg-gate-white">
        <div className="mx-auto max-w-5xl flex flex-col gap-14">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Recognition</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800">Academic Achievement,<br />Formally Recognized</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gate-fog">
            {AWARDS.map((a) => (
              <div key={a.tier} className="flex flex-col items-center gap-6 bg-gate-white hover:bg-gate-fog/50 transition-colors p-10 text-center">
                <div className="w-14 h-14 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: `${a.hex}55` }}>
                  <div className="w-6 h-6 rounded-full" style={{ background: a.hex, opacity: 0.85 }} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold tracking-[0.05em] text-gate-800">{a.tier}</span>
                  <span className="text-[10px] font-light text-gate-800/70 leading-relaxed">{a.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs font-light text-gate-800/65">All participants receive a Certificate of Participation upon completing the Preliminary Round.</p>
          <div className="flex justify-center"><Button variant="outline" size="md" asChild><Link href="/awards">Awards and Certificates</Link></Button></div>
        </div>
      </section>

      {/* 7. TRUST */}
      <section className="py-28 px-6 bg-gate-fog/40 border-y border-gate-fog/60">
        <div className="mx-auto max-w-7xl flex flex-col gap-14">
          <div className="flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Academic Credibility</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800">Built for the Long Term</h2>
            <p className="text-sm font-light text-gate-800/60 leading-[1.9]">G.A.T.E. is designed to meet international academic standards — offering verifiable results, certified recognition, and institutional partnerships built on transparency.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gate-fog">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center gap-3 bg-gate-white p-12 text-center">
                <span className="font-serif text-5xl font-light text-gate-gold">{s.value}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-800/70">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-28 px-6 bg-gate-white">
        <div className="mx-auto max-w-4xl flex flex-col gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Academic Information</span>
            <h2 className="font-serif text-4xl font-light text-gate-800">Frequently Asked Questions</h2>
          </div>
          <FaqAccordion items={FAQS} />
          <div className="flex justify-center"><Button variant="outline" size="md" asChild><Link href="/academic-info">Full Academic Information</Link></Button></div>
        </div>
      </section>

      {/* 9. CTA */}
      <section className="py-28 px-6 bg-gate-fog/50 border-t border-gate-fog/60">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-8 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Begin Your Journey</span>
          <h2 className="font-serif text-5xl md:text-6xl font-light text-gate-800 leading-tight">Ready to Compete<br />on a Global Stage?</h2>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9] max-w-lg">Applications are open. Register your interest, select your discipline, and begin your path toward the Global Final at Xidian University, Hangzhou.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button variant="gold" size="lg" asChild><Link href="/register">Apply Now</Link></Button>
            <Button variant="outline" size="lg" asChild><Link href="/contact">Get in Touch</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}

