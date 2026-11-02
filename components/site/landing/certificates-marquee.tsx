import Link from "next/link";
import { Medal, BadgeCheck, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { getCountryByName, flagUrl } from "@/lib/phone-codes";

const AWARD_META: Record<string, { label: string; color: string }> = {
  gold: { label: "Gold Medal", color: "#C9993A" },
  silver: { label: "Silver Medal", color: "#9AA5B1" },
  bronze: { label: "Bronze Medal", color: "#B08D57" },
  participation: { label: "Certificate of Completion", color: "#6B7C8C" },
};

const SUBJECT_LABEL: Record<string, string> = {
  math: "MAT",
  english: "ENG",
};

function toTitleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function anonymizeName(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "GATE Student";
  if (words.length === 1) return toTitleCase(words[0]!);
  const first = toTitleCase(words[0]!);
  const lastInitial = words[words.length - 1]!.charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

export async function CertificatesMarquee() {
  const results = await db.query.eventBadgeResults.findMany({
    with: { eventBadge: true },
  });

  if (results.length === 0) return null;

  const cards = results.map((r) => {
    const meta = AWARD_META[r.award] ?? AWARD_META.participation!;
    const country = getCountryByName(r.eventBadge.country);
    return {
      id: r.id,
      name: anonymizeName(r.eventBadge.fullName),
      countryIso: country?.iso2,
      countryName: r.eventBadge.country,
      subject: SUBJECT_LABEL[r.subject] ?? r.subject.toUpperCase(),
      award: r.award,
      awardLabel: meta.label,
      color: meta.color,
    };
  });

  // Duplicated for a seamless infinite loop.
  const track = [...cards, ...cards];

  return (
    <section className="bg-card py-24 border-b border-border overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-12 flex flex-col items-center gap-4 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
          Hangzhou 2026 · Real Outcomes
        </span>
        <h2 className="font-serif text-3xl font-medium text-foreground md:text-5xl">
          Certificates, Already Earned
        </h2>
        <p className="max-w-lg text-sm font-normal leading-[1.7] text-foreground/65">
          Every one of these is a real GATE student from the August cohort — recognized in
          Mathematics or English at Xidian University, Hangzhou.
        </p>
        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gate-gold transition-colors hover:text-gate-gold-2"
        >
          Verify a certificate
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>

      <div
        className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        <div className="flex w-max gap-4 animate-[marquee-scroll_54s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
          {track.map((c, i) => (
            <div
              key={`${c.id}-${i}`}
              className="flex w-[260px] shrink-0 flex-col gap-4 rounded-2xl border border-border bg-background p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.25em] text-gate-gold">
                  {c.subject}
                </span>
                {c.award === "participation" ? (
                  <BadgeCheck className="h-5 w-5" style={{ color: c.color }} strokeWidth={1.75} />
                ) : (
                  <Medal className="h-5 w-5" style={{ color: c.color }} strokeWidth={1.75} />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-serif text-lg font-medium text-foreground">{c.name}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: c.color }}>
                  {c.awardLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 border-t border-border pt-3">
                {c.countryIso && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={flagUrl(c.countryIso)}
                    alt={c.countryName}
                    width={18}
                    height={13}
                    className="rounded-[2px]"
                  />
                )}
                <span className="text-xs font-light text-foreground/55">{c.countryName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
