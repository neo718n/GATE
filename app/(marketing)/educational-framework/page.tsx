import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/site/faq-accordion";

export const metadata: Metadata = {
  title: "Educational Framework",
  description: "G.A.T.E. Educational Assessment Framework — diagnostic evaluation program for academic growth and individual performance analysis.",
};

const FAQS = [
  {
    section: "Educational Philosophy",
    items: [
      { q: "Is G.A.T.E. a competition or olympiad?", a: "No. G.A.T.E. is a diagnostic educational assessment program designed to evaluate individual academic performance and provide detailed feedback for growth. Unlike competitions where participants are ranked against each other to determine winners and losers, our program focuses on individual skill assessment and personalized performance reports. Every participant receives a Certificate of Completion and a detailed diagnostic report regardless of their performance level." },
      { q: "What is the purpose of this assessment?", a: "The purpose is threefold: (1) to provide students with an objective diagnostic evaluation of their academic skills in specific subject areas, (2) to offer detailed performance reports identifying strengths and areas for improvement, and (3) to recognize outstanding academic achievement through certificates of distinction. This is an educational tool for growth, not a competitive ranking system." },
      { q: "How does this differ from academic competitions?", a: "Traditional academic competitions focus on ranking participants, determining winners, and awarding prizes based on relative performance. G.A.T.E. is structured as a diagnostic assessment where each participant is evaluated against established academic standards, not against other participants. There are no 'winners' or 'losers' — only individuals receiving personalized feedback on their academic proficiency." },
      { q: "What do participants receive?", a: "All participants receive: (1) a Certificate of Completion documenting their participation, (2) a detailed performance report analyzing their responses and identifying strengths and growth areas, and (3) if performance meets established academic standards, additional recognition certificates (Certificate of Distinction, Certificate of High Achievement, or Certificate of Merit). These are academic credentials, not competition prizes." },
    ],
  },
  {
    section: "China Regulatory Compliance",
    items: [
      { q: "Is this program compliant with China's regulations on academic competitions?", a: "Yes. G.A.T.E. is structured as a diagnostic educational assessment program, not an academic competition. China's regulations target competitive olympiad-style programs that rank students for admission advantages. Our program does not rank participants competitively, does not determine winners/losers, and does not provide admission linkage or recruitment pathways. All participants receive educational feedback and certificates documenting their individual performance." },
      { q: "Can students from China participate?", a: "Yes. Students from China and all other countries are eligible to participate in G.A.T.E. as an educational assessment program. Participation is voluntary, and the program is designed to complement formal education through diagnostic feedback and skill evaluation. Parents and students should review local education policies, but our program structure aligns with educational assessment frameworks rather than competitive olympiad models." },
      { q: "Does this program provide admission advantages or recruitment linkages?", a: "No. G.A.T.E. does not coordinate with universities for admissions, does not provide recruitment pathways, and does not guarantee admission advantages. Certificates of distinction are academic credentials documenting individual achievement, similar to course completion certificates or standardized test score reports. How universities or institutions evaluate these credentials is at their independent discretion — we do not manage or influence admission processes." },
      { q: "What is the legal basis for this program?", a: "G.A.T.E. operates as an international educational services provider offering diagnostic assessment programs. The program structure follows established educational assessment frameworks used globally by organizations such as PISA (OECD), TIMSS, and Cambridge Assessment. Our legal framework is based on providing educational diagnostic services, not organizing competitive events. Participants engage voluntarily for self-assessment and skill development purposes." },
    ],
  },
  {
    section: "Assessment Structure",
    items: [
      { q: "How are performance levels determined?", a: "Performance is evaluated against pre-established academic standards and rubrics developed by subject-matter experts. The assessment measures proficiency in theoretical knowledge, analytical reasoning, and problem-solving methodology. Performance levels (Distinction, High Achievement, Merit) are determined by whether responses meet specific quality and accuracy thresholds — not by ranking relative to other participants." },
      { q: "Are results compared between participants?", a: "No. While aggregate anonymized data may be used for program improvement and statistical analysis, individual results are not compared for ranking purposes. Each participant's performance is evaluated independently against the academic standards. Certificates of distinction reflect individual achievement of high academic standards, not competitive ranking." },
      { q: "What subjects are assessed?", a: "G.A.T.E. offers diagnostic assessments in multiple academic disciplines including Mathematics, Physics, Chemistry, Biology, and Computer Science. Each assessment is calibrated to secondary and pre-university academic levels (equivalent to grades 9–12). Participants select a single subject area during registration based on their academic interests and strengths." },
      { q: "Is this program accredited?", a: "G.A.T.E. is an independent educational assessment program. While we are not an accredited examination board like Cambridge or IB, our assessment framework follows internationally recognized standards for academic evaluation. Certificates issued document participation and individual performance in a structured diagnostic assessment — they are academic credentials, not formal qualifications or degree prerequisites." },
    ],
  },
];

export default function EducationalFrameworkPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Educational Framework</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">Diagnostic Assessment<br />Not a Competition</h1>
          <p className="mt-4 text-base font-light text-gate-800/70 max-w-3xl leading-[1.9]">
            G.A.T.E. is an educational assessment program designed for diagnostic evaluation and academic growth — not a competitive olympiad.
            Every participant receives personalized feedback and certification documenting their individual academic performance.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-gate-white border-b border-gate-fog/60">
        <div className="mx-auto max-w-4xl flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Non-Competitive Positioning</span>
            <h2 className="font-serif text-3xl font-light text-gate-800">Official Statement</h2>
          </div>
          <div className="prose prose-sm max-w-none text-gate-800/80 font-light leading-[1.9]">
            <p>
              The Global Academic Talent Evaluation (G.A.T.E.) program is a <strong>diagnostic educational assessment framework</strong>,
              not an academic competition or olympiad. Our mission is to provide students worldwide with objective evaluation of their
              academic skills and detailed performance feedback for educational growth.
            </p>
            <p>
              Unlike competitive olympiad programs that rank participants to determine winners and award competitive prizes, G.A.T.E.
              evaluates each participant individually against established academic standards. There are no winners or losers — every
              participant receives a Certificate of Completion, a detailed diagnostic report, and recognition certificates if their
              performance meets academic distinction thresholds.
            </p>
            <p>
              This program structure complies with international educational assessment frameworks and aligns with regulatory guidance
              in jurisdictions that distinguish between competitive academic events and diagnostic educational programs. Participation
              is voluntary, assessment-focused, and designed to complement formal education through skill evaluation and personalized feedback.
            </p>
          </div>
        </div>
      </section>

      {FAQS.map((section) => (
        <section key={section.section} id={section.section.toLowerCase().replace(/\s+/g, "-")} className="py-24 px-6 border-b border-gate-fog/60">
          <div className="mx-auto max-w-4xl flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">{section.section}</span>
              <div className="h-px w-12 bg-gate-gold/30" />
            </div>
            <FaqAccordion items={section.items} />
          </div>
        </section>
      ))}

      <section className="py-20 px-6 bg-gate-fog/40">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-4xl font-light text-gate-800">Questions about our framework?</h2>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">Our team is available to answer questions regarding the educational assessment structure, compliance framework, or participation process.</p>
          <div className="flex gap-4">
            <Button variant="outline" size="md" asChild><Link href="/contact">Contact Us</Link></Button>
            <Button variant="gold" size="md" asChild><Link href="/academic-info">Academic Information</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
