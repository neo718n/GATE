import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { db } from "@/lib/db";
import { cycles } from "@/lib/db/schema";
import { eq, or, desc } from "drizzle-orm";

const SUBJECTS = [
  { code: "MAT", name: "Mathematics", desc: "Algebra, analysis, combinatorics, geometry, number theory" },
  { code: "PHY", name: "Physics", desc: "Classical mechanics, electrodynamics, thermodynamics, optics" },
  { code: "CHM", name: "Chemistry", desc: "Organic, inorganic, physical and analytical chemistry" },
  { code: "BIO", name: "Biology", desc: "Molecular biology, genetics, biochemistry, cell biology" },
  { code: "CP", name: "Competitive Programming", desc: "Algorithms, data structures, computational problem-solving" },
  { code: "ENG", name: "English", desc: "Academic English — reading, writing, language analysis" },
];

const AWARDS = [
  { tier: "Gold Medal", hex: "#C9993A", desc: "Top performers across all disciplines" },
  { tier: "Silver Medal", hex: "#8A9BB0", desc: "Distinguished academic achievement" },
  { tier: "Bronze Medal", hex: "#A07040", desc: "Commendable performance" },
  { tier: "Honorable Mention", hex: "#2B5591", desc: "Notable results in the Global Final" },
];

const STATS = [
  { value: "50+", label: "Participating Countries" },
  { value: "6", label: "Academic Disciplines" },
  { value: "2", label: "Assessment Rounds" },
  { value: "Top 1%", label: "Global Talent" },
];

const FAQS = [
  { q: "Who is eligible to participate?", a: "Students currently enrolled in secondary or pre-university education are eligible. G.A.T.E. is open to participants worldwide — there are no nationality restrictions." },
  { q: "How is the Preliminary Round conducted?", a: "Round I is conducted online under verified conditions. Participants complete a theory-based assessment in their chosen discipline remotely, within a defined submission window." },
  { q: "What are the criteria for Round II qualification?", a: "Participants who achieve a qualifying score in Round I receive an official invitation to the Global Onsite Final. The host venue for each edition is announced per cycle." },
  { q: "Are certificates awarded to all participants?", a: "Yes. All participants who complete the Preliminary Round receive a Certificate of Participation. Medals and Honorable Mention distinctions are awarded at the Global Final." },
  { q: "Can I participate in multiple subjects?", a: "Each participant registers for one discipline per cycle. This ensures depth of evaluation and fair comparison within each subject area." },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  registration_open: { label: "Registration Open", color: "text-emerald-700", dot: "bg-emerald-500" },
  active: { label: "Assessment In Progress", color: "text-gate-gold", dot: "bg-gate-gold" },
  planning: { label: "Upcoming", color: "text-gate-800/50", dot: "bg-gate-800/25" },
  completed: { label: "Completed", color: "text-gate-800/40", dot: "bg-gate-800/20" },
  archived: { label: "Archived", color: "text-gate-800/30", dot: "bg-gate-800/15" },
};

const FORMAT_LABEL: Record<string, string> = {
  online: "Online",
  onsite: "Onsite",
  hybrid: "Hybrid",
};

export default async function HomePage() {
  const activeCycle = await db.query.cycles.findFirst({
    where: or(
      eq(cycles.status, "registration_open"),
      eq(cycles.status, "active"),
      eq(cycles.status, "planning"),
    ),
    orderBy: [desc(cycles.year)],
    with: {
      rounds: {
        orderBy: (t, { asc }) => [asc(t.order)],
      },
    },
  });

  const cycleStatus = activeCycle ? STATUS_CONFIG[activeCycle.status] : null;
  const registrationOpen = activeCycle?.status === "registration_open";

  return (
    <>
      {/* ANNOUNCEMENT STRIP */}
      {registrationOpen && activeCycle && (
        <div className="bg-gate-gold text-gate-800">
          <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center justify-center gap-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">
              {activeCycle.name} — Registration is now open
            </span>
            <Link
              href="/register"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] underline underline-offset-2 hover:no-underline"
            >
              Apply Now →
            </Link>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center overflow-hidden bg-gate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_115%,rgba(201,153,58,0.16),transparent)]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gate-gold/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gate-gold/15 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(rgba(201,153,58,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gate-gold/40" />
            <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold/70">
              International Academic Assessment
            </p>
            <div className="h-px w-10 bg-gate-gold/40" />
          </div>

          <Logo size="xl" variant="dark" showTagline />

          <p className="text-base md:text-lg font-light text-gate-white/50 leading-relaxed max-w-xl mt-2">
            A rigorous multi-discipline academic assessment — open to students worldwide. From a global online Preliminary Round to an invitation-only onsite Final.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button variant="gold" size="lg" asChild>
              <Link href="/register">Apply Now</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-gate-white/20 text-gate-white/65 bg-transparent hover:bg-gate-white/5 hover:border-gate-white/35 hover:text-gate-white/90"
            >
              <Link href="/structure">How It Works</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-10 w-px bg-gradient-to-b from-transparent to-gate-gold/25" />
        </div>
      </section>

      {/* CURRENT EDITION */}
      {activeCycle && (
        <section className="py-14 px-6 bg-gate-white border-b border-gate-fog">
          <div className="mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-start gap-10">
            <div className="flex-1 flex flex-col gap-5">
              {cycleStatus && (
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${cycleStatus.dot} ${
                      activeCycle.status === "registration_open" ? "animate-pulse" : ""
                    }`}
                  />
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${cycleStatus.color}`}>
                    {cycleStatus.label}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-800/35">
                  Current Edition
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-gate-800">
                  {activeCycle.name}
                </h2>
              </div>
              {activeCycle.description && (
                <p className="text-sm font-light text-gate-800/55 leading-[1.85] max-w-md">
                  {activeCycle.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                {registrationOpen && (
                  <Button variant="gold" size="sm" asChild>
                    <Link href="/register">Register Now</Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Sign In to Dashboard</Link>
                </Button>
              </div>
            </div>

            {activeCycle.rounds.length > 0 && (
              <div className="lg:w-[420px] flex flex-col border border-gate-fog">
                <div className="px-5 py-3 bg-gate-fog/40 border-b border-gate-fog">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gate-800/45">
                    Assessment Schedule
                  </span>
                </div>
                {activeCycle.rounds.map((round, i) => (
                  <div
                    key={round.id}
                    className={`flex items-start gap-5 px-5 py-4 ${
                      i < activeCycle.rounds.length - 1 ? "border-b border-gate-fog/60" : ""
                    }`}
                  >
                    <div className="flex h-7 w-7 items-center justify-center border border-gate-gold/35 shrink-0 mt-0.5">
                      <span className="font-serif text-sm font-light text-gate-gold">{i + 1}</span>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-light text-gate-800 truncate">{round.name}</span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gate-gold/75 shrink-0">
                          {FORMAT_LABEL[round.format]}
                        </span>
                      </div>
                      {(round.startDate || round.endDate) && (
                        <span className="text-xs font-light text-gate-800/40">
                          {round.startDate
                            ? new Date(round.startDate).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : ""}
                          {round.startDate && round.endDate ? " – " : ""}
                          {round.endDate
                            ? new Date(round.endDate).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : ""}
                        </span>
                      )}
                      {round.venue && (
                        <span className="text-[11px] font-light text-gate-800/35">{round.venue}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section className="py-28 px-6 bg-gate-mist border-b border-gate-fog/60">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
              About the Assessment
            </span>
            <h2
              className="font-serif text-4xl md:text-5xl font-light text-gate-800 leading-[1.2]"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              A Global Standard<br />for Academic Excellence
            </h2>
            <div className="h-px w-14 bg-gate-gold/40" />
          </div>
          <div className="flex flex-col gap-5 text-sm font-light text-gate-800/60 leading-[1.9]">
            <p>
              G.A.T.E. is an international assessment program designed to identify and recognize exceptional intellectual talent across the sciences, mathematics, and technology.
            </p>
            <p>
              Structured in two stages, it begins with an open online Preliminary Round accessible to students worldwide, followed by an invitation-only Global Final at the edition's designated host venue.
            </p>
            <p>
              Beyond the assessment, G.A.T.E. builds a lasting international community of scholars and institutions committed to the highest standards of theoretical excellence.
            </p>
            <div className="pt-1">
              <Button variant="outline" size="sm" asChild>
                <Link href="/about">Read More About G.A.T.E.</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* DISCIPLINES */}
      <section className="py-28 px-6 bg-gate-white border-b border-gate-fog/60">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
              Academic Disciplines
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800">Six Subject Areas</h2>
            <p className="text-sm font-light text-gate-800/50 max-w-md mt-1">
              Each participant selects one discipline and competes with peers from around the world within that field.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gate-fog">
            {SUBJECTS.map((s) => (
              <div
                key={s.code}
                className="flex flex-col gap-3 bg-gate-white p-8 hover:bg-gate-mist transition-colors"
              >
                <span className="text-[9px] font-semibold tracking-[0.35em] text-gate-gold">{s.code}</span>
                <span className="font-serif text-xl font-light text-gate-800">{s.name}</span>
                <span className="text-[11px] font-light text-gate-800/45 leading-relaxed">{s.desc}</span>
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

      {/* STRUCTURE */}
      <section className="py-28 px-6 bg-gate-mist border-b border-gate-fog/60">
        <div className="mx-auto max-w-7xl flex flex-col gap-14">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
              Assessment Structure
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800">Two Rounds. One Path.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                num: "I",
                tag: "Round I",
                title: "Preliminary Round",
                subtitle: "Global Qualification · Online",
                points: [
                  "Open to students worldwide — no geographic restriction",
                  "Theory-based academic assessment per discipline",
                  "Objective evaluation by independent reviewers",
                  "Results determine Global Final eligibility",
                ],
              },
              {
                num: "II",
                tag: "Round II",
                title: "Global Onsite Final",
                subtitle: "Invitation-only · Host Venue Per Edition",
                points: [
                  "Invitation-only based on Preliminary Round score",
                  "Conducted at the edition's designated host venue",
                  "Supervised by an international academic jury",
                  "Official medals and certificates awarded",
                ],
              },
            ].map((item) => (
              <div key={item.tag} className="flex flex-col gap-5 border border-gate-fog bg-gate-white p-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center border border-gate-gold/35 font-serif text-lg font-light text-gate-gold shrink-0">
                    {item.num}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">{item.tag}</p>
                    <p className="text-[10px] font-light uppercase tracking-[0.18em] text-gate-800/55">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-light text-gate-800">{item.title}</h3>
                <ul className="flex flex-col gap-2.5">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-sm font-light text-gate-800/60">
                      <span className="mt-[9px] h-px w-4 shrink-0 bg-gate-gold/40" />
                      {pt}
                    </li>
                  ))}
                </ul>
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

      {/* GLOBAL FINAL */}
      <section className="py-28 px-6 bg-gate-white border-b border-gate-fog/60">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Global Final</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800 leading-tight">
              Onsite Final<br />
              <span className="text-gate-800/55">Host Venue Per Edition</span>
            </h2>
            <div className="h-px w-14 bg-gate-gold/40" />
            <p className="text-sm font-light text-gate-800/60 leading-[1.9]">
              Qualified participants are invited to the Global Onsite Final at a leading international institution. The multi-day program combines rigorous examination with international scholarly exchange.
            </p>
            <Button variant="outline" size="sm" asChild className="w-fit">
              <Link href="/onsite-assessment">Program Details</Link>
            </Button>
          </div>
          <div className="flex flex-col border border-gate-fog">
            {[
              { label: "Venue", value: "Announced per edition" },
              { label: "Format", value: "In-person — University Examination Halls" },
              { label: "Supervision", value: "International Academic Jury" },
              { label: "Program", value: "Multi-Day Academic Program" },
              { label: "Recognition", value: "Official Medals and Certificates" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex gap-6 border-b border-gate-fog/60 px-6 py-4 last:border-0"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold w-28 shrink-0 pt-0.5">
                  {row.label}
                </span>
                <span className="text-sm font-light text-gate-800/65">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AWARDS */}
      <section className="py-28 px-6 bg-gate-mist border-b border-gate-fog/60">
        <div className="mx-auto max-w-5xl flex flex-col gap-14">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Recognition</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-gate-800">
              Academic Achievement,<br />Formally Recognized
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gate-fog">
            {AWARDS.map((a) => (
              <div
                key={a.tier}
                className="flex flex-col items-center gap-5 bg-gate-white hover:bg-gate-mist transition-colors p-10 text-center"
              >
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: `${a.hex}50`, backgroundColor: `${a.hex}0e` }}
                >
                  <div className="w-5 h-5 rounded-full" style={{ background: a.hex, opacity: 0.88 }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold tracking-[0.05em] text-gate-800">{a.tier}</span>
                  <span className="text-[10px] font-light text-gate-800/50 leading-relaxed">{a.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs font-light text-gate-800/45">
            All participants who complete the Preliminary Round receive an official Certificate of Participation.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" size="md" asChild>
              <Link href="/awards">Awards &amp; Certificates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gate-800">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-px bg-gate-700/40">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center gap-3 bg-gate-800 px-6 py-16 text-center"
            >
              <span className="font-serif text-5xl font-light text-gate-gold">{s.value}</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gate-white/40">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 px-6 bg-gate-white border-b border-gate-fog/60">
        <div className="mx-auto max-w-4xl flex flex-col gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Questions</span>
            <h2 className="font-serif text-4xl font-light text-gate-800">Frequently Asked Questions</h2>
          </div>
          <FaqAccordion items={FAQS} />
          <div className="flex justify-center">
            <Button variant="outline" size="md" asChild>
              <Link href="/academic-info">Full Academic Information</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-36 px-6 bg-gate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_50%,rgba(201,153,58,0.13),transparent)]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gate-gold/20 to-transparent" />
        <div className="relative mx-auto max-w-3xl flex flex-col items-center gap-8 text-center">
          <span className="text-[9px] font-semibold uppercase tracking-[0.45em] text-gate-gold/70">
            Begin Your Journey
          </span>
          <h2 className="font-serif text-5xl md:text-6xl font-light text-gate-white leading-[1.15]">
            Compete on a<br />Global Stage
          </h2>
          <p className="text-sm font-light text-gate-white/45 leading-[1.9] max-w-md">
            Register your interest, select your discipline, and begin your path toward the Global Final.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button variant="gold" size="lg" asChild>
              <Link href="/register">Apply Now</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-gate-white/20 text-gate-white/60 bg-transparent hover:bg-gate-white/5 hover:border-gate-white/35 hover:text-gate-white/85"
            >
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
