export function TrustSection() {
  return (
    <section className="py-20 px-6 bg-card border-b border-border">
      <div className="mx-auto max-w-7xl flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            Endorsement & Partnership
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
                Government Endorsement
              </span>
            </div>
            <h3 className="font-serif text-2xl font-medium text-foreground leading-tight">
              Ministry of Education and Science<br />
              <span className="text-foreground/65 font-normal">Republic of Tajikistan</span>
            </h3>
            <p className="text-[14px] font-normal text-foreground/80 leading-[1.7]">
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
                Academic Partnership
              </span>
            </div>
            <h3 className="font-serif text-2xl font-medium text-foreground leading-tight">
              Xidian University<br />
              <span className="text-foreground/65 font-normal">Hangzhou Institute of Technology</span>
            </h3>
            <p className="text-[14px] font-normal text-foreground/80 leading-[1.7]">
              The onsite academic program is co-organized by the School of International
              Education at Xidian University — a leading Chinese institution in information
              technology and the foundational sciences.
            </p>
          </div>
        </div>

        <p className="text-center text-[12px] font-medium text-foreground/65 uppercase tracking-[0.15em]">
          Operated by Chongqing Xinshijie Technology Service Co., LTD
        </p>
      </div>
    </section>
  );
}
