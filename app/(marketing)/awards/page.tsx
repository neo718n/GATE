import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Awards & Certificates",
  description: "G.A.T.E. Olympiad medals, distinctions, and certificates — Gold, Silver, Bronze, Honorable Mention.",
};

const MEDALS = [
  {
    tier: "Gold Medal",
    hex: "#C9993A",
    eligibility: "Top performers at the Global Onsite Olympiad",
    desc: "Awarded to participants who achieve the highest scores at the onsite final. The Gold Medal represents the pinnacle of academic achievement in G.A.T.E.",
  },
  {
    tier: "Silver Medal",
    hex: "#8A9BB0",
    eligibility: "Distinguished performance at the onsite final",
    desc: "Awarded to participants demonstrating exceptional theoretical command and problem-solving ability across the examination.",
  },
  {
    tier: "Bronze Medal",
    hex: "#A07040",
    eligibility: "Commendable performance at the onsite final",
    desc: "Awarded to participants whose performance reflects strong academic preparation and consistent achievement across subjects.",
  },
  {
    tier: "Honorable Mention",
    hex: "#2B5591",
    eligibility: "Notable performance — onsite final participants",
    desc: "Awarded to participants who demonstrate exceptional ability in specific problem areas or show outstanding effort relative to performance.",
  },
];

const CERTIFICATES = [
  { title: "Certificate of Excellence", desc: "Issued to all medal and Honorable Mention recipients at the Global Final. Includes medal tier, subject, and academic year." },
  { title: "Certificate of Participation", desc: "Issued to all participants who complete the Preliminary Round. Verifiable and suitable for academic portfolios and university applications." },
  { title: "Certificate of Qualification", desc: "Issued to participants who qualify for Round II. Confirms successful completion of the global qualification stage." },
];

export default function AwardsPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Recognition</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">Awards &amp; Certificates</h1>
          <p className="text-base font-light text-gate-800/45 mt-2 max-w-2xl">Academic achievement formally recognized — medals, distinctions, and verifiable certificates for all participants.</p>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Onsite Olympiad Awards</span>
            <h2 className="font-serif text-4xl font-light text-gate-800">Medal Hierarchy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MEDALS.map((medal) => (
              <div key={medal.tier} className="flex gap-6 border border-gate-fog p-8">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: medal.hex }}>
                    <div className="w-5 h-5 rounded-full" style={{ background: medal.hex, opacity: 0.75 }} />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-base font-semibold tracking-[0.05em] text-gate-800">{medal.tier}</h3>
                    <p className="text-[10px] font-light text-gate-gold/60 mt-1">{medal.eligibility}</p>
                  </div>
                  <p className="text-sm font-light text-gate-800/55 leading-[1.9]">{medal.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-fog/40 border-y border-gate-fog/60">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Certificates</span>
            <h2 className="font-serif text-4xl font-light text-gate-800">For Every Stage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CERTIFICATES.map((cert) => (
              <div key={cert.title} className="flex flex-col gap-4 border border-gate-fog p-8">
                <div className="flex flex-col gap-0">
                  <div className="h-px w-12 bg-gate-gold/40 mb-4" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gate-800">{cert.title}</h3>
                </div>
                <p className="text-sm font-light text-gate-800/55 leading-[1.9]">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Certificate Standards</span>
            <h2 className="font-serif text-4xl font-light text-gate-800 leading-tight">Verifiable and Internationally Recognized</h2>
            <div className="flex flex-col gap-4 text-sm font-light text-gate-800/60 leading-[1.9]">
              <p>All G.A.T.E. certificates are formally issued documents suitable for inclusion in academic portfolios, university applications, and professional CVs.</p>
              <p>Each certificate includes a unique verification code, participant details, discipline, award level, and official G.A.T.E. seal.</p>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            {["Unique certificate verification code per recipient","Includes participant name, discipline, and academic year","Official G.A.T.E. seal and authorized signature","Available in both digital and printable format","Suitable for university applications and scholarship programs"].map((pt) => (
              <div key={pt} className="flex items-start gap-4 py-4 border-b border-gate-fog/70 last:border-0">
                <span className="mt-2 h-px w-5 shrink-0 bg-gate-gold/50" />
                <span className="text-sm font-light text-gate-800/65 leading-relaxed">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gate-fog/40 border-t border-gate-fog/60">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-4xl font-light text-gate-800">Begin Your Path to Recognition</h2>
          <p className="text-sm font-light text-gate-800/55 leading-[1.9]">Apply for the G.A.T.E. Olympiad. Every participant receives a certificate. The top performers earn medals at the Global Final in Hangzhou.</p>
          <Button variant="gold" size="md" asChild><Link href="/register">Apply Now</Link></Button>
        </div>
      </section>
    </>
  );
}
