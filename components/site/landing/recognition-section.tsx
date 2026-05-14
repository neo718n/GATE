const EVERYONE = [
  { title: "Detailed Performance Report", desc: "Score breakdown per discipline, strengths and growth areas, percentile ranking." },
  { title: "Certificate of Completion", desc: "Verified academic certificate issued to every participant who completes the program." },
  { title: "Camp Experience Certificate", desc: "Additional certificate for Hangzhou Camp participants documenting the immersion program." },
];

const AWARDS = [
  { tier: "Certificate of Distinction", percentile: "Top 5%", hex: "#C9993A", desc: "Highest level of academic recognition for exceptional performance." },
  { tier: "Certificate of High Achievement", percentile: "Top 15%", hex: "#8A9BB0", desc: "Distinguished academic achievement above peer cohort." },
  { tier: "Certificate of Merit", percentile: "Top 30%", hex: "#A07040", desc: "Notable performance demonstrating strong academic competence." },
];

export function RecognitionSection() {
  return (
    <section className="py-28 px-6 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl flex flex-col gap-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Recognition & Certificates
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground leading-[1.15]">
            Every Participant<br />Is Recognized
          </h2>
          <p className="text-sm font-light text-foreground/50 max-w-lg mt-1">
            Outcomes are guaranteed for everyone. Outstanding performance receives additional academic recognition.
          </p>
        </div>

        {/* EVERYONE RECEIVES */}
        <div className="flex flex-col gap-8">
          <div className="flex items-baseline gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
              Everyone Receives
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {EVERYONE.map((e) => (
              <div key={e.title} className="flex flex-col gap-3 bg-card p-8">
                <div className="flex h-9 w-9 items-center justify-center border border-gate-gold/35">
                  <div className="h-3 w-3 bg-gate-gold/60" />
                </div>
                <h3 className="font-serif text-lg font-light text-foreground">{e.title}</h3>
                <p className="text-[12px] font-light text-foreground/55 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AWARDS FOR TOP PERFORMERS */}
        <div className="flex flex-col gap-8 mt-6">
          <div className="flex items-baseline gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
              Outstanding Performance · Additional Recognition
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {AWARDS.map((a) => (
              <div key={a.tier} className="flex flex-col items-center gap-5 bg-card p-10 text-center">
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: `${a.hex}55`, backgroundColor: `${a.hex}10` }}
                >
                  <div className="w-5 h-5 rounded-full" style={{ background: a.hex, opacity: 0.9 }} />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
                    {a.percentile}
                  </span>
                  <span className="font-serif text-xl font-light text-foreground">{a.tier}</span>
                  <span className="text-[11px] font-light text-foreground/50 leading-relaxed max-w-[220px]">
                    {a.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] font-light text-foreground/40 italic">
            Certificates are academic honors — not competitive prizes. They recognize individual academic achievement.
          </p>
        </div>
      </div>
    </section>
  );
}
