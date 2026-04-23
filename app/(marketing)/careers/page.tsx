import type { Metadata } from "next";
import { CareerForm } from "./career-form";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open positions at G.A.T.E. Olympiad — join the team building a global academic competition.",
};

const POSITIONS = [
  {
    title: "Academic Coordinator",
    type: "Full-Time / Remote",
    location: "Global (Remote)",
    desc: "Coordinate academic content, examination design review, and liaise with subject-matter experts across disciplines. You will play a central role in maintaining examination quality and academic integrity.",
    requirements: ["Background in mathematics, sciences, or competitive programming","Experience with academic program coordination or examinations","Strong written communication in English","Ability to work across time zones with international teams"],
  },
  {
    title: "Country Representative",
    type: "Part-Time / Contract",
    location: "Your Country",
    desc: "Represent G.A.T.E. in your country or region. Responsibilities include recruiting school coordinators, assisting with participant registration, and acting as the local point of contact for participants, parents, and institutions.",
    requirements: ["Fluency in English and local language","Understanding of the local academic and secondary education landscape","Strong organizational and communication skills","Network within schools or academic institutions (preferred)"],
  },
  {
    title: "Operations Assistant",
    type: "Part-Time / Remote",
    location: "Remote",
    desc: "Support the G.A.T.E. operations team with participant data management, communication scheduling, platform support, and administrative tasks during registration and examination cycles.",
    requirements: ["Organized and detail-oriented","Comfortable working with spreadsheets, data entry, and task management tools","Responsive and reliable during peak periods","Prior experience in academic or competition administration is a plus"],
  },
];

export default function CareersPage() {
  return (
    <>
      <section className="py-24 px-6 border-b border-gate-fog/60 bg-gate-fog/20">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Join the Team</span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-gate-800">Careers</h1>
          <p className="text-base font-light text-gate-800/45 mt-2 max-w-2xl">Work with a global team building the infrastructure for international academic excellence.</p>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">About Working at G.A.T.E.</span>
            <h2 className="font-serif text-4xl font-light text-gate-800 leading-tight">Build Something That Matters</h2>
            <div className="flex flex-col gap-4 text-sm font-light text-gate-800/60 leading-[1.9]">
              <p>G.A.T.E. is a small, focused team building a rigorous international academic platform. Every role here has direct impact on how thousands of students around the world access and experience academic competition at the highest level.</p>
              <p>We work remotely across multiple time zones. We value clarity, reliability, and genuine care for academic integrity above all.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Remote-First", body: "All positions are remote or hybrid. We are a global team and expect to work that way." },
              { title: "Academic Mission", body: "Our work directly supports students competing for meaningful academic recognition." },
              { title: "Small Team", body: "No bureaucracy. You will have direct influence and see the results of your work." },
              { title: "International Scope", body: "You will work with participants, coordinators, and partners from across the world." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-2 border border-gate-fog p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gate-800">{item.title}</h3>
                <p className="text-xs font-light text-gate-800/50 leading-[1.8]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-fog/40 border-y border-gate-fog/60">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 mb-12">
          <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Open Positions</span>
          <h2 className="font-serif text-4xl font-light text-gate-800">Current Openings</h2>
        </div>
        <div className="mx-auto max-w-7xl flex flex-col gap-8">
          {POSITIONS.map((pos) => (
            <div key={pos.title} className="border border-gate-fog bg-gate-white">
              <div className="border-b border-gate-fog/60 px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-serif text-2xl font-light text-gate-800">{pos.title}</h3>
                <div className="flex gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gate-gold/70 border border-gate-gold/25 px-3 py-1.5">{pos.type}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gate-gray border border-gate-fog px-3 py-1.5">{pos.location}</span>
                </div>
              </div>
              <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-light text-gate-800/60 leading-[1.9]">{pos.desc}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gate-gray">Requirements</p>
                  <ul className="flex flex-col gap-2">
                    {pos.requirements.map((r) => (
                      <li key={r} className="flex items-start gap-3 text-sm font-light text-gate-800/55">
                        <span className="mt-2 h-px w-4 shrink-0 bg-gate-gold/40" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-gate-gold">Apply</span>
            <h2 className="font-serif text-4xl font-light text-gate-800 leading-tight">Submit Your Application</h2>
            <div className="flex flex-col gap-4 text-sm font-light text-gate-800/60 leading-[1.9]">
              <p>Select the position you are applying for and submit your application below. CV submission will be available after your initial application is reviewed.</p>
              <p>Our HR team reviews all applications and responds within 7–10 business days.</p>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gate-gray">Applying for</label>
                <div className="flex flex-wrap gap-2">
                  {POSITIONS.map((pos) => (
                    <span key={pos.title} className="text-[9px] font-bold uppercase tracking-[0.2em] border border-gate-gold/30 text-gate-gold/70 px-3 py-1.5">{pos.title}</span>
                  ))}
                </div>
              </div>
              <CareerForm positionTitle={POSITIONS[0].title} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
