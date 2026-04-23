import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/site/faq-accordion";

export const metadata: Metadata = {
  title: "Academic Information",
  description: "G.A.T.E. Assessment eligibility, registration, exam format, rules, and frequently asked questions.",
};

const FAQS = [
  {
    section: "Eligibility",
    items: [
      { q: "Who can participate in G.A.T.E.?", a: "Any student currently enrolled in secondary or pre-university education (equivalent to grades 9–12 or ages 14–19). There are no nationality, language, or geographic restrictions." },
      { q: "Is there an age limit?", a: "Participants must be 14–19 years of age at the time of the Preliminary Round. Students currently enrolled in the final year of secondary school are eligible regardless of age if they meet the academic criteria." },
      { q: "Can a student participate in more than one subject?", a: "No. Each participant registers in a single subject area. Subject selection is made during the registration process and cannot be changed after submission." },
      { q: "Are homeschooled students eligible?", a: "Yes. Students who are homeschooled or enrolled in non-traditional academic programs may participate if they can provide documentation of secondary-level academic enrollment." },
    ],
  },
  {
    section: "Registration",
    items: [
      { q: "How do I register?", a: "Create an account on the G.A.T.E. platform, complete your profile, select your subject area, and submit your application. Applications are reviewed before confirmation." },
      { q: "Is there a registration fee?", a: "Registration fees vary by country and participation tier. Fee details are provided during the application process. Waivers are available for participants from qualifying circumstances." },
      { q: "What documents are required?", a: "A valid student ID or enrollment confirmation from your school or institution. Coordinators may request additional documentation for verification purposes." },
      { q: "Can I register without a school coordinator?", a: "Yes. Individual participants may register directly. However, participants registered through an official school coordinator benefit from facilitated access and regional support." },
    ],
  },
  {
    section: "Examination Format",
    items: [
      { q: "What format does Round I take?", a: "Round I is a theory-based written examination conducted online. It consists of structured problems requiring written solutions, proofs, and analytical reasoning. Duration varies by subject." },
      { q: "What format does Round II take?", a: "Round II is conducted in-person at Xidian University, Hangzhou. It uses university examination conditions — supervised, timed, written. The format is comparable to international assessment standards." },
      { q: "Are calculators or reference materials allowed?", a: "No. Examinations at both stages are conducted without calculators or reference materials. This is a theoretical assessment; solutions must be derived from first principles." },
      { q: "In what language are the examinations?", a: "Examinations are available in English. Additional language versions may be provided for specific regions — confirmed during the registration cycle." },
    ],
  },
  {
    section: "Results & Integrity",
    items: [
      { q: "How are results determined?", a: "Examinations are independently scored by subject-matter experts. Scores are calculated based on accuracy, method, and proof quality. Rankings are determined per discipline." },
      { q: "How are Round II participants selected?", a: "Participants who achieve a score at or above the qualifying threshold in Round I receive an official invitation to the Global Onsite Assessment. The threshold is determined per cycle." },
      { q: "What constitutes academic misconduct?", a: "Any form of external assistance during examination, impersonation, unauthorized materials, or communication with other participants. Violations result in immediate disqualification." },
      { q: "How can I verify my certificate?", a: "All certificates include a unique verification code. Certificates can be verified through the G.A.T.E. platform using this code." },
    ],
  },
];

export default function AcademicInfoPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Academic Information</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">Eligibility, Rules<br />& Frequently Asked Questions</h1>
        </div>
      </section>

      <section className="py-12 px-6 bg-gate-fog/40 border-b border-gate-fog/60">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30">
          {[
            { label: "Eligibility", href: "#eligibility" },
            { label: "Registration", href: "#registration" },
            { label: "Exam Format", href: "#examination-format" },
            { label: "Results & Integrity", href: "#results-integrity" },
          ].map((item) => (
            <a key={item.label} href={item.href} className="flex items-center justify-center bg-gate-white px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gray hover:text-gate-gold transition-colors">
              {item.label}
            </a>
          ))}
        </div>
      </section>

      {FAQS.map((section) => (
        <section key={section.section} id={section.section.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "").replace(/--/g, "-")} className="py-24 px-6 border-b border-gate-fog/60">
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
          <h2 className="font-serif text-4xl font-light text-gate-800">Still have questions?</h2>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">Our academic team is available to assist with any questions regarding eligibility, registration, or examination procedures.</p>
          <div className="flex gap-4">
            <Button variant="outline" size="md" asChild><Link href="/contact">Contact Us</Link></Button>
            <Button variant="gold" size="md" asChild><Link href="/register">Apply Now</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}

