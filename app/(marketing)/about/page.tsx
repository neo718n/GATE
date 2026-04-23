import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Olympiad",
  description: "G.A.T.E. Olympiad vision, mission, and academic positioning.",
};

export default function AboutPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">About the Olympiad</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800 leading-tight">A Global Standard for<br />Academic Excellence</h1>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-gate-800/70">Vision</h2>
              <p className="font-serif text-2xl font-light text-gate-800/90 leading-relaxed">A world in which academic talent is recognized and nurtured without regard for geography — where the most rigorous minds meet on equal terms.</p>
            </div>
            <div className="h-px bg-border/30" />
            <div className="flex flex-col gap-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-gate-800/70">Mission</h2>
              <div className="flex flex-col gap-4 text-sm font-light text-gate-800/60 leading-[1.9]">
                <p>G.A.T.E. — the Global Academic and Theoretical Excellence Olympiad — was founded to create a credible, transparent, and academically rigorous platform for international competition across five core disciplines.</p>
                <p>We believe that competition, when conducted with integrity and at the highest academic standard, is one of the most powerful tools for identifying and developing talent. Our Olympiad is structured to reward depth of understanding — emphasizing theoretical reasoning, rigorous proof, and creative problem-solving.</p>
                <p>By partnering with Xidian University, Hangzhou Campus, for the Global Final, G.A.T.E. places its participants within one of the world's leading academic environments — creating an experience that extends beyond examination into genuine scholarly exchange.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {[
              { label: "Founded", value: "2025" },
              { label: "Global Final Host", value: "Xidian University\nHangzhou Campus, China" },
              { label: "Disciplines", value: "5 Academic Areas" },
              { label: "Format", value: "Two-Round System\nOnline + Onsite" },
              { label: "Recognition", value: "Gold, Silver, Bronze\nHonorable Mention\nCertificates" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1 border-b border-gate-fog/70 pb-5 last:border-0">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gate-gold/60">{item.label}</span>
                <span className="text-sm font-light text-gate-800/70 whitespace-pre-line">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-fog/40 border-y border-gate-fog/60">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Academic Positioning</span>
            <h2 className="font-serif text-4xl font-light text-gate-800 max-w-2xl">Designed for the Highest Level of Academic Rigor</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Theoretical Depth", body: "Examinations assess theoretical understanding and the ability to apply first principles — not memorized procedures or surface familiarity." },
              { title: "Independent Evaluation", body: "Results are evaluated by subject-matter experts with no connection to applicant institutions, ensuring objective and verifiable outcomes." },
              { title: "Certified Recognition", body: "All certificates and medals are officially issued with verifiable credentials, designed to be recognized by universities internationally." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-4 border border-gate-fog p-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gate-800">{item.title}</h3>
                <p className="text-sm font-light text-gate-800/55 leading-[1.9]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">International Scope</span>
            <h2 className="font-serif text-4xl font-light text-gate-800 leading-tight">Open to Students Everywhere</h2>
            <div className="flex flex-col gap-4 text-sm font-light text-gate-800/60 leading-[1.9]">
              <p>G.A.T.E. imposes no geographic restrictions on participation. The Preliminary Round is designed to be accessible to any qualified student, regardless of country, institution, or background.</p>
              <p>Language accessibility, inclusive examination design, and transparent scoring are foundational principles. Every participant competes on the same terms.</p>
            </div>
            <div className="flex gap-4 mt-2">
              <Button variant="gold" size="md" asChild><Link href="/register">Apply Now</Link></Button>
              <Button variant="outline" size="md" asChild><Link href="/academic-info">Eligibility Requirements</Link></Button>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            {["No geographic restrictions on participation","Round I conducted fully online","Available to all enrolled secondary students","Transparent, independently verified results","Official credentials recognized internationally"].map((pt) => (
              <div key={pt} className="flex items-start gap-4 py-4 border-b border-gate-fog/70 last:border-0">
                <span className="mt-2 h-px w-5 shrink-0 bg-gate-gold/50" />
                <span className="text-sm font-light text-gate-800/65 leading-relaxed">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
