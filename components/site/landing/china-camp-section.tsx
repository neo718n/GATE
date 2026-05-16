import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CHINA_CAMP_PHOTOS, PHOTO_GALLERY } from "@/lib/marketing/china-camp-photos";
import { PROGRAM_SLUGS, programCtaHref } from "@/lib/program-cta";

type Round = {
  feeUsd: number;
  startDate: Date | null;
  endDate: Date | null;
};

function dollarsFromCents(cents: number) {
  return `$${Math.floor(cents / 100).toLocaleString()}`;
}

const PROGRAM_COMPONENTS = [
  {
    label: "Lectures",
    title: "Faculty Lectures",
    desc: "Specialized lectures delivered by Xidian University professors across multiple academic tracks.",
    photo: CHINA_CAMP_PHOTOS.lectureHall1,
  },
  {
    label: "Workshops",
    title: "Classroom Workshops",
    desc: "Intensive small-group sessions in modern multimedia classrooms with collaborative problem-solving.",
    photo: CHINA_CAMP_PHOTOS.classroom1,
  },
  {
    label: "Assessment",
    title: "Diagnostic Evaluation",
    desc: "Structured academic assessment to identify individual strengths and provide a personalized growth report.",
    photo: CHINA_CAMP_PHOTOS.computerLab1,
  },
  {
    label: "Campus",
    title: "University Immersion",
    desc: "Full access to campus facilities — library, study halls, sports complex, and academic buildings.",
    photo: CHINA_CAMP_PHOTOS.campusLandmark,
  },
  {
    label: "Cultural",
    title: "Hangzhou Program",
    desc: "Guided cultural excursions to West Lake and historic Hangzhou — a UNESCO city of academic heritage.",
    photo: CHINA_CAMP_PHOTOS.campusAerial,
  },
  {
    label: "Recognition",
    title: "Ceremony & Certificate",
    desc: "Closing ceremony at the main auditorium, with certificate distribution and academic recognition.",
    photo: CHINA_CAMP_PHOTOS.lectureHall3,
  },
];

const DAILY_SCHEDULE = [
  { day: "Day 1", date: "19 Jul", title: "Arrival", items: ["Airport transfer", "Dormitory check-in", "Welcome dinner", "Campus tour at sunset"] },
  { day: "Day 2", date: "20 Jul", title: "Opening", items: ["Opening ceremony", "Faculty introduction", "Diagnostic Assessment — Part 1", "Welcome lecture"] },
  { day: "Day 3", date: "21 Jul", title: "Intensive I", items: ["Morning workshop", "Diagnostic Assessment — Part 2", "Library study hours"] },
  { day: "Day 4", date: "22 Jul", title: "Intensive II", items: ["Lecture series (3 sessions)", "Group problem-solving", "Evening cultural program"] },
  { day: "Day 5", date: "23 Jul", title: "Hangzhou", items: ["West Lake excursion", "Historical sites tour", "Networking dinner with Chinese students"] },
  { day: "Day 6", date: "24 Jul", title: "Capstone", items: ["Capstone seminar with faculty panel", "Individual academic consultation", "Performance report distribution", "Awards ceremony"] },
  { day: "Day 7", date: "25 Jul", title: "Departure", items: ["Closing ceremony", "Certificate distribution", "Group photo", "Airport transfer"] },
];

const INCLUDES = [
  "Accommodation in 4-person dormitory",
  "Three meals daily at university canteen",
  "All lectures, workshops, and materials",
  "Full campus access (library, study halls, sports)",
  "Diagnostic assessment + personalized report",
  "Certificate of Completion + Experience certificate",
  "Hangzhou cultural excursion",
  "Local airport transfer (arrival & departure)",
];

const NOT_INCLUDED = [
  "International airfare to Hangzhou",
  "Visa application fees",
  "Travel insurance",
  "Personal expenses",
];

export function ChinaCampSection({ round, isAuthenticated = false }: { round: Round | undefined; isAuthenticated?: boolean }) {
  return (
    <section id="hangzhou-camp" className="bg-card border-b border-border">
      {/* HERO BANNER */}
      <div className="relative h-[60vh] min-h-[480px] w-full overflow-hidden">
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gate-gold-2">
                Program 02 · Onsite Academic Camp
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl font-medium text-gate-white leading-[1.1] max-w-3xl">
              Seven Days of Academic Immersion<br />in Hangzhou, China
            </h2>
            <p className="text-base md:text-lg font-normal text-gate-white/85 max-w-2xl leading-[1.65]">
              An onsite educational program at Xidian University&apos;s Hangzhou Institute of
              Technology — located on the bank of the Qiantang River, with advanced
              educational facilities and a leading Chinese academic environment.
            </p>
            <div className="flex flex-wrap items-center gap-5 mt-3 text-[12px] font-medium text-gate-white/85 uppercase tracking-[0.18em]">
              <span>19–25 July 2026</span>
              <span className="h-3 w-px bg-gate-gold-2/40" />
              <span>Hangzhou, China</span>
              <span className="h-3 w-px bg-gate-gold-2/40" />
              <span>{round ? `${dollarsFromCents(round.feeUsd)} all-inclusive` : "Tuition TBA"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ABOUT THE UNIVERSITY */}
      <div className="mx-auto max-w-7xl px-6 py-24 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center border-b border-border">
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
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            Host University
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-medium text-foreground leading-[1.2]">
            Xidian University<br />
            <span className="text-foreground/65 font-normal">Hangzhou Institute of Technology</span>
          </h3>
          <div className="h-px w-14 bg-gate-gold/40" />
          <p className="text-base font-normal text-foreground/80 leading-[1.75]">
            Xidian University is one of China&apos;s leading institutions in information
            technology, electronics, and the foundational sciences. The Hangzhou campus
            holds a superior geographical location and modern educational facilities — a
            premium setting for international academic programs.
          </p>
          <div className="flex flex-col gap-2 pt-2 text-[13px] font-normal text-foreground/80">
            <div className="flex gap-3">
              <span className="text-foreground/60 font-medium w-24 shrink-0">Location</span>
              <span>Hangzhou · Qiantang River</span>
            </div>
            <div className="flex gap-3">
              <span className="text-foreground/60 font-medium w-24 shrink-0">Original name</span>
              <span>西安电子科技大学杭州研究院</span>
            </div>
            <div className="flex gap-3">
              <span className="text-foreground/60 font-medium w-24 shrink-0">Established</span>
              <span>1931 (Xidian University)</span>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRAM COMPONENTS GRID */}
      <div className="mx-auto max-w-7xl px-6 py-24 border-b border-border">
        <div className="flex flex-col items-center gap-4 text-center mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            Program Components
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            What the Camp Includes
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {PROGRAM_COMPONENTS.map((c) => (
            <article key={c.title} className="flex flex-col bg-card overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={c.photo.src}
                  alt={c.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-3 p-7">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
                  {c.label}
                </span>
                <h4 className="font-serif text-xl font-medium text-foreground">{c.title}</h4>
                <p className="text-[13px] font-normal text-foreground/80 leading-[1.7]">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* DAILY SCHEDULE */}
      <div className="mx-auto max-w-7xl px-6 py-24 border-b border-border">
        <div className="flex flex-col items-center gap-4 text-center mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            Daily Program
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Seven-Day Schedule
          </h3>
          <p className="text-sm font-normal text-foreground/75 max-w-md leading-[1.65]">
            Provisional structure. Final schedule confirmed upon registration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-px bg-border">
          {DAILY_SCHEDULE.map((d) => (
            <div key={d.day} className="flex flex-col gap-3 bg-card p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-2xl font-medium text-gate-gold">{d.day.replace("Day ", "")}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/65">
                  {d.date}
                </span>
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-foreground/90">
                {d.title}
              </span>
              <ul className="flex flex-col gap-1.5 pt-1">
                {d.items.map((item) => (
                  <li key={item} className="text-[12px] font-normal text-foreground/75 leading-snug flex items-start gap-2">
                    <span className="mt-[6px] h-px w-2 shrink-0 bg-gate-gold/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ACCOMMODATIONS */}
      <div className="mx-auto max-w-7xl px-6 py-24 border-b border-border">
        <div className="flex flex-col items-center gap-4 text-center mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            Where You&apos;ll Stay
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            On-Campus Accommodation
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {[
            { label: "Dormitory", desc: "4-person room with study area", photo: CHINA_CAMP_PHOTOS.dormitoryRoom },
            { label: "Dining Hall", desc: "Three meals daily, multiple cuisines", photo: CHINA_CAMP_PHOTOS.canteenMain },
            { label: "Bath & Shower", desc: "Modern facilities, premium standards", photo: CHINA_CAMP_PHOTOS.dormBathroom },
            { label: "Laundry", desc: "On-site self-service laundry room", photo: CHINA_CAMP_PHOTOS.laundry },
          ].map((a) => (
            <div key={a.label} className="flex flex-col bg-card overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={a.photo.src}
                  alt={a.photo.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1.5 p-5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
                  {a.label}
                </span>
                <span className="text-[13px] font-normal text-foreground/80 leading-snug">{a.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GALLERY */}
      <div className="mx-auto max-w-7xl px-6 py-24 border-b border-border">
        <div className="flex flex-col items-center gap-4 text-center mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            Gallery
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Inside the Campus
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {PHOTO_GALLERY.map((p) => (
            <div key={p.src} className="relative bg-card overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INCLUDES + CTA */}
      <div className="mx-auto max-w-7xl px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col gap-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            What&apos;s Included
          </span>
          <h3 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
            All-inclusive tuition
          </h3>
          <ul className="flex flex-col gap-2.5 mt-2">
            {INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[14px] font-normal text-foreground/85">
                <span className="mt-[8px] h-px w-3 shrink-0 bg-gate-gold/70" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-border">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/65 block mb-3">
              Not Included
            </span>
            <ul className="flex flex-col gap-1.5">
              {NOT_INCLUDED.map((item) => (
                <li key={item} className="text-[13px] font-normal text-foreground/70">— {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:items-end lg:text-right">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            Ready to Apply
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-medium text-foreground leading-[1.15]">
            Join the Hangzhou<br />Academic Camp
          </h3>
          <div className="flex flex-col gap-3 mt-3 lg:items-end">
            <div className="flex items-center gap-3 text-[12px] font-semibold text-foreground/80 uppercase tracking-[0.18em]">
              <span>19–25 July 2026</span>
              <span className="h-3 w-px bg-foreground/30" />
              <span>{round ? dollarsFromCents(round.feeUsd) : "TBA"}</span>
            </div>
            <p className="text-[14px] font-normal text-foreground/80 max-w-sm leading-[1.65]">
              Open to students Grades 1–12 worldwide. Parental consent and valid passport
              required for participants under 18.
            </p>
            <div className="flex flex-wrap gap-3 mt-3 lg:justify-end">
              <Button variant="gold" size="lg" asChild>
                <Link href={programCtaHref(PROGRAM_SLUGS.CHINA_CAMP, isAuthenticated)}>{isAuthenticated ? "Enroll in Camp" : "Apply for Camp"}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact for Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
