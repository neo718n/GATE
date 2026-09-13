import type { Metadata } from "next";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { LandingHero } from "@/components/site/landing/hero";
import { MomentsSection } from "@/components/site/landing/moments-section";
import { SampleProblemsSection } from "@/components/site/landing/sample-problems-section";
import { ChinaCampSection } from "@/components/site/landing/china-camp-section";
import { RecognitionSection } from "@/components/site/landing/recognition-section";
import { TrustSection } from "@/components/site/landing/trust-section";
import { NextEditionSection } from "@/components/site/landing/next-edition-section";
import { db } from "@/lib/db";
import { cycles } from "@/lib/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { PROGRAM_SLUGS } from "@/lib/program-cta";

const OG_IMAGE =
  "https://pub-f2dcb2bc241340699d740b25ab172313.r2.dev/marketing/hangzhou-gallery/moment-01.jpg";

export const metadata: Metadata = {
  title: "Hangzhou 2026 — the week, the papers, and what comes next",
  description:
    "In August 2026, students from across the region spent seven days at Xidian University, Hangzhou: lectures, assessment and a closing ceremony. The next edition has no date yet — join the list to hear first.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "G.A.T.E. Hangzhou 2026 — it already happened once",
    description:
      "Seven days at Xidian University, Hangzhou: 18–24 August 2026. The next edition has no date yet — join the list to hear first.",
    images: [{ url: OG_IMAGE, width: 1200, height: 900, alt: "GATE students during the Hangzhou week" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "G.A.T.E. Hangzhou 2026 — it already happened once",
    description:
      "Seven days at Xidian University, Hangzhou: 18–24 August 2026. The next edition has no date yet.",
    images: [OG_IMAGE],
  },
};

const FAQS = [
  {
    q: "Is this a competition or olympiad?",
    a: "No. GATE is an academic diagnostic and educational program — not a competition. The goal is to evaluate each participant's individual strengths and provide a personalized performance report and certificate. Outstanding performance receives academic recognition (Distinction/Honors/Merit), but no participant 'loses' — every participant receives a detailed report and certificate.",
  },
  {
    q: "Who can take part?",
    a: "The program is open to students in Grades 1–11 worldwide, assessed in five grade bands: Grades 1–2, 3–4, 5–6, 7–8 and 9–11. Difficulty is calibrated to each band. Participants under 18 require parental consent, and a valid passport is required for travel.",
  },
  {
    q: "What did the 2026 tuition cover?",
    a: "The August 2026 edition cost $1,000 per participant, and that was all-inclusive of: dormitory accommodation, three meals daily, all lectures and learning materials, full campus access, the diagnostic assessment, certificate of completion, and the Hangzhou cultural program. International airfare, visa fees and travel insurance were not included. Pricing for the next edition will be confirmed when its dates and host city are announced.",
  },
  {
    q: "What language is the program taught in?",
    a: "The program is conducted in English. Lectures at Xidian University were delivered in English by the School of International Education faculty.",
  },
  {
    q: "What kind of recognition do top performers receive?",
    a: "Outstanding performance receives academic distinction in three tiers: Academic Distinction (Top 5%), Honors (Top 15%), and Merit Recognition (Top 30%). These are academic honors — not competition prizes — recognizing individual excellence within the diagnostic framework.",
  },
  {
    q: "When is the next edition?",
    a: "No date yet. The host city and dates for the next onsite edition are still being finalized. Everyone on the notify list hears first, and registration opens to that list before it opens publicly.",
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

  const campRound = activeCycle?.rounds.find((r) => r.slug === PROGRAM_SLUGS.CHINA_CAMP);

  return (
    <>
      <LandingHero />

      <MomentsSection />

      <ChinaCampSection round={campRound} />

      <RecognitionSection />

      <SampleProblemsSection />

      <TrustSection />

      {/* FAQ */}
      <section className="py-28 px-6 bg-background border-b border-border">
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

      <NextEditionSection />
    </>
  );
}
