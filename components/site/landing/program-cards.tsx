import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CHINA_CAMP_PHOTOS } from "@/lib/marketing/china-camp-photos";
import { PROGRAM_SLUGS, programCtaHref } from "@/lib/program-cta";

type Round = {
  id: number;
  name: string;
  order: number;
  format: string;
  startDate: Date | null;
  endDate: Date | null;
  feeUsd: number;
  venue: string | null;
};

function fmtDateRange(start: Date | null, end: Date | null) {
  if (!start && !end) return "Dates announced";
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  if (start && end) {
    const sameMonth = start.getUTCMonth() === end.getUTCMonth();
    return sameMonth
      ? `${start.getUTCDate()}–${end.getUTCDate()} ${end.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}`
      : `${fmt(start)} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`;
  }
  return start ? fmt(start) : fmt(end!);
}

function dollarsFromCents(cents: number) {
  return `$${Math.floor(cents / 100).toLocaleString()}`;
}

export function ProgramCards({ rounds, isAuthenticated = false }: { rounds: Round[]; isAuthenticated?: boolean }) {
  const online = rounds.find((r) => r.order === 1);
  const camp = rounds.find((r) => r.order === 2);

  return (
    <section id="programs" className="py-24 px-6 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl flex flex-col gap-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Two Programs · Now Open
          </span>
          <h2
            className="font-serif text-4xl md:text-5xl font-light text-foreground leading-[1.15]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Choose Your Path<br />of Academic Growth
          </h2>
          <p className="text-sm font-light text-foreground/55 max-w-lg mt-2 leading-relaxed">
            Both programs are independent — register for one, the other, or both.
            Each delivers a personalized assessment and a recognized certificate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ONLINE DIAGNOSTIC */}
          <article className="group flex flex-col bg-card border border-border overflow-hidden transition-shadow hover:shadow-[0_8px_40px_-12px_rgba(11,31,58,0.15)] dark:hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]">
            <div className="relative h-64 bg-gate-800 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(201,153,58,0.18),transparent)]" />
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(201,153,58,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(201,153,58,0.6) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <span className="font-serif text-7xl font-light text-gate-gold">01</span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-white/55">
                    Online · Hybrid
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-8">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
                  Online Diagnostic Assessment
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground leading-tight">
                  Discover Your Academic Profile
                </h3>
              </div>

              <p className="text-sm font-light text-foreground/60 leading-[1.8]">
                A structured academic evaluation across six disciplines. Every participant
                receives a detailed performance report identifying strengths and growth areas.
              </p>

              <ul className="flex flex-col gap-2.5 pt-1">
                {[
                  "Six subject areas · single discipline focus",
                  "Open to Grades 1–12 worldwide",
                  "Detailed personalized report",
                  "Certificate of Completion",
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-[13px] font-light text-foreground/65">
                    <span className="mt-[8px] h-px w-3 shrink-0 bg-gate-gold/50" />
                    {pt}
                  </li>
                ))}
              </ul>

              <div className="flex items-end justify-between gap-4 pt-3 border-t border-border">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-foreground/40">
                    Dates · Fee
                  </span>
                  <span className="text-sm font-light text-foreground/75">
                    {online ? fmtDateRange(online.startDate, online.endDate) : "TBA"}
                    {online && (
                      <span className="text-gate-gold"> · {dollarsFromCents(online.feeUsd)}</span>
                    )}
                  </span>
                </div>
                <Button variant="gold" size="md" asChild>
                  <Link href={programCtaHref(PROGRAM_SLUGS.ONLINE, isAuthenticated)}>{isAuthenticated ? "Enroll" : "Register"}</Link>
                </Button>
              </div>
            </div>
          </article>

          {/* CHINA SUMMER CAMP */}
          <article className="group flex flex-col bg-card border border-border overflow-hidden transition-shadow hover:shadow-[0_8px_40px_-12px_rgba(11,31,58,0.15)] dark:hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]">
            <div className="relative h-64 overflow-hidden bg-gate-800">
              <Image
                src={CHINA_CAMP_PHOTOS.campusAerial.src}
                alt={CHINA_CAMP_PHOTOS.campusAerial.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gate-900/80 via-gate-900/15 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gate-gold-2">
                    Hangzhou · Onsite
                  </span>
                  <span className="text-xs font-light text-gate-white/80">
                    Xidian University · Hangzhou Institute of Technology
                  </span>
                </div>
                <span className="font-serif text-5xl font-light text-gate-gold-2/90">02</span>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-8">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
                  Hangzhou Academic Training Camp
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground leading-tight">
                  Seven Days at Xidian University
                </h3>
              </div>

              <p className="text-sm font-light text-foreground/60 leading-[1.8]">
                An onsite academic immersion at a leading Chinese university. Lectures with
                faculty, diagnostic evaluation, cultural program, and a completion certificate.
              </p>

              <ul className="flex flex-col gap-2.5 pt-1">
                {[
                  "Lectures by Xidian University faculty",
                  "Diagnostic academic evaluation",
                  "Dormitory + meals included",
                  "Hangzhou cultural program",
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-[13px] font-light text-foreground/65">
                    <span className="mt-[8px] h-px w-3 shrink-0 bg-gate-gold/50" />
                    {pt}
                  </li>
                ))}
              </ul>

              <div className="flex items-end justify-between gap-4 pt-3 border-t border-border">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-foreground/40">
                    Dates · Tuition
                  </span>
                  <span className="text-sm font-light text-foreground/75">
                    {camp ? fmtDateRange(camp.startDate, camp.endDate) : "TBA"}
                    {camp && (
                      <span className="text-gate-gold"> · {dollarsFromCents(camp.feeUsd)}</span>
                    )}
                  </span>
                </div>
                <Button variant="gold" size="md" asChild>
                  <Link href={programCtaHref(PROGRAM_SLUGS.CHINA_CAMP, isAuthenticated)}>Apply</Link>
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
