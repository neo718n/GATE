export function TrustSection() {
  return (
    <section className="py-20 px-6 bg-card border-b border-border">
      <div className="mx-auto max-w-7xl flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Endorsement & Partnership
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-foreground">
            Trusted Institutional Backing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
          {/* Ministry endorsement */}
          <div className="flex flex-col gap-4 bg-card p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-gate-gold/35 shrink-0">
                <span className="font-serif text-base font-light text-gate-gold">MoE</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
                Government Endorsement
              </span>
            </div>
            <h3 className="font-serif text-xl font-light text-foreground leading-tight">
              Ministry of Education and Science<br />
              <span className="text-foreground/55">Republic of Tajikistan</span>
            </h3>
            <p className="text-[12px] font-light text-foreground/55 leading-relaxed">
              The GATE 2026 program operates with official communication to the Ministry of
              Education and Science of the Republic of Tajikistan, ensuring institutional
              alignment for the national qualification round.
            </p>
          </div>

          {/* University partnership */}
          <div className="flex flex-col gap-4 bg-card p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-gate-gold/35 shrink-0">
                <span className="font-serif text-base font-light text-gate-gold">XU</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
                Academic Partnership
              </span>
            </div>
            <h3 className="font-serif text-xl font-light text-foreground leading-tight">
              Xidian University<br />
              <span className="text-foreground/55">Hangzhou Institute of Technology</span>
            </h3>
            <p className="text-[12px] font-light text-foreground/55 leading-relaxed">
              The onsite academic program is co-organized by the School of International
              Education at Xidian University — a leading Chinese institution in information
              technology and the foundational sciences.
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] font-light text-foreground/35 uppercase tracking-[0.2em]">
          Operated by Chongqing Xinshijie Technology Service Co., LTD
        </p>
      </div>
    </section>
  );
}
