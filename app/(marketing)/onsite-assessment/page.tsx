import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CHINA_CAMP_PHOTOS } from "@/lib/marketing/china-camp-photos";

export const metadata: Metadata = {
  title: "Hangzhou Academic Training Camp",
  description:
    "The G.A.T.E. Hangzhou Academic Training Camp — a 7-day onsite educational program at Xidian University, Hangzhou Institute of Technology. 19–25 July 2026.",
};

const PROGRAM = [
  { day: "Day 1", date: "19 Jul", title: "Arrival", desc: "Airport transfer, dormitory check-in, welcome dinner, and campus tour at sunset." },
  { day: "Day 2", date: "20 Jul", title: "Opening", desc: "Opening ceremony, faculty introduction, diagnostic assessment part 1, and welcome lecture." },
  { day: "Day 3", date: "21 Jul", title: "Intensive I", desc: "Morning workshop, diagnostic assessment part 2, library study hours." },
  { day: "Day 4", date: "22 Jul", title: "Intensive II", desc: "Specialized lecture series, group problem-solving sessions, evening cultural program." },
  { day: "Day 5", date: "23 Jul", title: "Hangzhou", desc: "West Lake excursion, historical sites tour, networking dinner with Chinese students." },
  { day: "Day 6", date: "24 Jul", title: "Capstone", desc: "Capstone seminar, individual academic consultation, performance report distribution, awards ceremony." },
  { day: "Day 7", date: "25 Jul", title: "Departure", desc: "Closing ceremony, certificate distribution, group photo, airport transfer." },
];

const STANDARDS = [
  { title: "University Faculty", body: "All lectures are delivered by Xidian University academic staff, drawn from the School of International Education and partner faculties." },
  { title: "Modern Facilities", body: "Multimedia classrooms, computer labs, professional auditoriums, and study halls on a riverside campus with advanced educational facilities." },
  { title: "Diagnostic Evaluation", body: "Independent academic evaluation calibrated to grade level. Every participant receives a personalized performance report." },
  { title: "Official Certification", body: "Certificate of Completion issued upon program completion. Outstanding performance receives additional academic recognition." },
];

export default function OnsiteAssessmentPage() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[480px] w-full overflow-hidden">
        <Image
          src={CHINA_CAMP_PHOTOS.campusAerial.src}
          alt={CHINA_CAMP_PHOTOS.campusAerial.alt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gate-900/85 via-gate-900/40 to-gate-900/30" />

        <div className="relative z-10 h-full flex items-end">
          <div className="mx-auto max-w-7xl w-full px-6 pb-14 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-gate-gold-2/60" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-gate-gold-2">
                Program 02 · Onsite
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-light text-gate-white leading-[1.1] max-w-3xl">
              Hangzhou Academic<br />Training Camp
            </h1>
            <p className="text-sm md:text-base font-light text-gate-white/70 max-w-2xl leading-relaxed">
              A 7-day onsite educational program at Xidian University&apos;s
              Hangzhou Institute of Technology, on the bank of the Qiantang
              River. Faculty lectures, diagnostic evaluation, cultural program,
              and a Certificate of Completion.
            </p>
            <div className="flex flex-wrap items-center gap-5 mt-3 text-[11px] font-light text-gate-white/65 uppercase tracking-[0.2em]">
              <span>19–25 July 2026</span>
              <span className="h-3 w-px bg-gate-gold-2/40" />
              <span>Hangzhou, China</span>
              <span className="h-3 w-px bg-gate-gold-2/40" />
              <span>All-Inclusive</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2 relative aspect-[4/3] overflow-hidden">
            <Image
              src={CHINA_CAMP_PHOTOS.campusLandmark.src}
              alt={CHINA_CAMP_PHOTOS.campusLandmark.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
              About the Program
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-gate-800 dark:text-gate-white leading-tight">
              Academic Immersion at<br />Xidian University
            </h2>
            <div className="flex flex-col gap-4 text-sm font-light text-gate-800/65 dark:text-gate-white/65 leading-[1.9]">
              <p>
                The Hangzhou Academic Training Camp is a 7-day educational
                program co-organized by the G.A.T.E. team and the School of
                International Education at Xidian University. It is an
                independent program — registration is open directly, with no
                prerequisite from the online assessment.
              </p>
              <p>
                Participants attend faculty lectures, complete a diagnostic
                academic evaluation, explore the Xidian campus and the city of
                Hangzhou, and earn a Certificate of Completion from the program.
              </p>
            </div>
            <div className="flex flex-col gap-0 mt-2">
              {[
                { label: "Host University", value: "Xidian University · Hangzhou Institute of Technology" },
                { label: "Location", value: "Hangzhou, China · Qiantang River bank" },
                { label: "Duration", value: "7 Days — 19 to 25 July 2026" },
                { label: "Format", value: "Onsite — full academic immersion" },
                { label: "Eligibility", value: "Open to Grades 1–12 worldwide" },
              ].map((item) => (
                <div key={item.label} className="flex gap-6 border-b border-border py-3 last:border-0">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold w-32 shrink-0 pt-0.5">
                    {item.label}
                  </span>
                  <span className="text-sm font-light text-gate-800/70 dark:text-gate-white/70">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-fog/40 border-y border-gate-fog/60 dark:bg-card dark:border-border">
        <div className="mx-auto max-w-7xl flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
              Daily Program
            </span>
            <h2 className="font-serif text-4xl font-light text-foreground">
              Seven-Day Schedule
            </h2>
            <p className="text-xs font-light text-foreground/45 max-w-md">
              Provisional structure. Final schedule confirmed upon registration.
            </p>
          </div>
          <div className="flex flex-col border border-border bg-card">
            {PROGRAM.map((d, i) => (
              <div
                key={d.day}
                className={"grid grid-cols-[140px_1fr] gap-6 p-8" + (i < PROGRAM.length - 1 ? " border-b border-border" : "")}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-serif text-3xl font-light text-gate-gold">{d.day.replace("Day ", "")}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/40">{d.date}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold tracking-[0.05em] text-foreground">{d.title}</h3>
                  <p className="text-sm font-light text-foreground/65 leading-[1.9]">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gate-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col gap-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
              Standards
            </span>
            <h2 className="font-serif text-4xl font-light text-foreground">
              Academic Quality
            </h2>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STANDARDS.map((item) => (
              <div key={item.title} className="flex flex-col gap-3 border border-border bg-card p-6">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground">{item.title}</h3>
                <p className="text-sm font-light text-foreground/65 leading-[1.9]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gate-fog/40 border-t border-gate-fog/60 dark:bg-card dark:border-border">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-4xl font-light text-foreground">
            Apply for the Camp
          </h2>
          <p className="text-sm font-light text-foreground/65 leading-[1.9]">
            Registration is open now. Application includes program tuition,
            accommodation, meals, and all academic activities. Visa and travel
            arrangements are the participant&apos;s responsibility.
          </p>
          <div className="flex gap-4">
            <Button variant="gold" size="md" asChild>
              <Link href="/register?program=camp">Apply for Camp</Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href="/structure">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
