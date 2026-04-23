import type { Metadata } from "next";
import { PartnershipForm } from "./partnership-form";

export const metadata: Metadata = {
  title: "Partnerships",
  description: "Partner with G.A.T.E. Olympiad — universities, schools, and academic institutions.",
};

const BENEFITS = [
  { title: "Global Visibility", body: "Your institution is listed as an official G.A.T.E. partner across all program materials, certificates, and the platform." },
  { title: "Student Access", body: "Partner institutions gain facilitated access to bring their students into the Olympiad through coordinated registration channels." },
  { title: "Academic Network", body: "Join an international network of universities, schools, and academic organizations committed to excellence in theoretical education." },
  { title: "Exam Center Status", body: "Qualified partner institutions may apply to serve as official examination centers for the Preliminary Round in their region." },
];

const TYPES = [
  { title: "Universities", desc: "Research universities and higher education institutions seeking to engage top secondary students and support academic talent pipelines." },
  { title: "Schools", desc: "Secondary schools and high schools seeking official olympiad participation channels and recognition for their students." },
  { title: "Academic Institutions", desc: "Educational centers, research institutes, and academic foundations aligned with G.A.T.E. values." },
  { title: "Organizations", desc: "Educational NGOs, foundations, and national olympiad bodies interested in cooperation and official representation." },
];

export default function PartnershipsPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/35">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Institutional Cooperation</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">Partnerships</h1>
          <p className="text-base font-light text-gate-800/45 mt-2 max-w-2xl">Partner with G.A.T.E. to extend the Olympiad's reach and bring world-class academic competition to your students and community.</p>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Why Partner</span>
            <h2 className="font-serif text-4xl font-light text-gate-800 leading-tight">Join the Global Academic Network</h2>
            <div className="flex flex-col gap-4 text-sm font-light text-gate-800/60 leading-[1.9]">
              <p>G.A.T.E. is building a long-term international network of institutions committed to academic excellence. Our partners play a direct role in identifying, supporting, and recognizing exceptional student talent.</p>
              <p>From facilitating registrations to hosting examination centers, G.A.T.E. partnership is designed to be meaningful — not ceremonial.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex flex-col gap-3 border border-gate-fog p-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gate-800">{b.title}</h3>
                <p className="text-sm font-light text-gate-800/55 leading-[1.9]">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-fog/40 border-y border-gate-fog/60">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Partnership Types</span>
            <h2 className="font-serif text-4xl font-light text-gate-800">Who Can Partner</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TYPES.map((t) => (
              <div key={t.title} className="flex flex-col gap-3 border border-gate-fog p-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gate-800">{t.title}</h3>
                <p className="text-sm font-light text-gate-800/55 leading-[1.9]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Apply</span>
            <h2 className="font-serif text-4xl font-light text-gate-800 leading-tight">Become a Partner</h2>
            <div className="flex flex-col gap-4 text-sm font-light text-gate-800/60 leading-[1.9]">
              <p>Submit your partnership application below. All applications are reviewed by the G.A.T.E. administration team.</p>
              <p>You will be contacted within 5–7 business days of submission.</p>
            </div>
            <div className="flex flex-col gap-0 mt-4">
              {["Submit application","Admin review (5–7 days)","Approval confirmation","Partnership agreement","Onboarding & orientation"].map((step, i) => (
                <div key={step} className="flex items-start gap-4 py-3 border-b border-border/20 last:border-0">
                  <span className="text-[9px] font-bold text-gate-gold/50 w-5 shrink-0">{i + 1}.</span>
                  <span className="text-sm font-light text-gate-800/55">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <PartnershipForm />
          </div>
        </div>
      </section>
    </>
  );
}
