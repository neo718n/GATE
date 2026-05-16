import Link from "next/link";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { LandingHero } from "@/components/site/landing/hero";
import { ProgramCards } from "@/components/site/landing/program-cards";
import { OnlineProgramSection } from "@/components/site/landing/online-program-section";
import { ChinaCampSection } from "@/components/site/landing/china-camp-section";
import { RecognitionSection } from "@/components/site/landing/recognition-section";
import { TrustSection } from "@/components/site/landing/trust-section";
import { FinalCta } from "@/components/site/landing/final-cta";
import { db } from "@/lib/db";
import { cycles } from "@/lib/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { getCurrentSession } from "@/lib/authz";
import { PROGRAM_SLUGS } from "@/lib/program-cta";

const FAQS = [
  {
    q: "Is this a competition or olympiad?",
    a: "No. Both programs are academic diagnostic and educational programs — not competitions. The goal is to evaluate each participant's individual strengths and provide a personalized performance report and certificate. Outstanding performance receives academic recognition (Distinction/Honors/Merit), but no participant 'loses' — every participant receives a detailed report and certificate.",
  },
  {
    q: "Are the two programs connected? Do I need to take the online assessment to attend the camp?",
    a: "No. The Online Diagnostic Assessment and the Hangzhou Academic Camp are fully independent programs. You can register for either, the other, or both — there is no qualifier relationship. Each program has its own registration, fee, and outcomes.",
  },
  {
    q: "Who is eligible to participate?",
    a: "Both programs are open to students in Grades 1–12 worldwide. The assessment difficulty is calibrated to each grade level. Participants under 18 require parental consent. For the Hangzhou camp, a valid passport is required.",
  },
  {
    q: "What does the Hangzhou camp tuition include?",
    a: "The $1,000 tuition is all-inclusive of: dormitory accommodation, three meals daily, all lectures and learning materials, full campus access, diagnostic assessment, certificate of completion, and the Hangzhou cultural program. International airfare, visa fees, and travel insurance are not included.",
  },
  {
    q: "What language is the program taught in?",
    a: "Both programs are conducted in English. Lectures at Xidian University are delivered in English by the School of International Education faculty.",
  },
  {
    q: "What if I cannot travel to China? Can I still receive a certificate?",
    a: "Yes. The Online Diagnostic Assessment is a complete, independent program. Every participant who completes the online assessment receives a detailed performance report and Certificate of Completion — regardless of whether they attend the Hangzhou camp.",
  },
  {
    q: "What kind of recognition do top performers receive?",
    a: "Outstanding performance receives academic distinction in three tiers: Academic Distinction (Top 5%), Honors (Top 15%), and Merit Recognition (Top 30%). These are academic honors — not competition prizes — recognizing individual excellence within the diagnostic framework.",
  },
];

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

  const rounds = activeCycle?.rounds ?? [];
  const onlineRound = rounds.find((r) => (r as any).slug === PROGRAM_SLUGS.ONLINE);
  const campRound = rounds.find((r) => (r as any).slug === PROGRAM_SLUGS.CHINA_CAMP);
  const registrationOpen = activeCycle?.status === "registration_open";
  const session = await getCurrentSession();
  const isAuthenticated = !!session;

  return (
    <>
      {/* ANNOUNCEMENT STRIP */}
      {registrationOpen && activeCycle && (
        <div className="bg-gate-gold text-gate-800">
          <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center justify-center gap-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
              GATE 2026 — Registration is now open
            </span>
            <Link
              href="/register"
              className="text-[11px] font-semibold uppercase tracking-[0.15em] underline underline-offset-2 hover:no-underline"
            >
              Register →
            </Link>
          </div>
        </div>
      )}

      <LandingHero />

      <ProgramCards rounds={rounds as any} isAuthenticated={isAuthenticated} />

      <OnlineProgramSection round={onlineRound as any} isAuthenticated={isAuthenticated} />

      <ChinaCampSection round={campRound as any} isAuthenticated={isAuthenticated} />

      <RecognitionSection />

      <TrustSection />

      {/* FAQ */}
      <section className="py-28 px-6 bg-card border-b border-border">
        <div className="mx-auto max-w-4xl flex flex-col gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
              Frequently Asked
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground">
              Common Questions
            </h2>
          </div>
          <FaqAccordion items={FAQS} />
        </div>
      </section>

      <FinalCta isAuthenticated={isAuthenticated} />
    </>
  );
}
