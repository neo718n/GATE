export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gate-800 px-6 py-24 text-gate-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 120%, rgba(201,153,58,0.08), transparent), repeating-linear-gradient(90deg, transparent, transparent 119px, rgba(201,153,58,0.03) 120px), repeating-linear-gradient(0deg, transparent, transparent 119px, rgba(201,153,58,0.03) 120px)",
        }}
      />

      <div className="relative w-full max-w-3xl text-center">
        <p className="mb-10 text-[10px] font-semibold uppercase tracking-[0.4em] text-gate-gold">
          Brand System · Initialized
        </p>

        <div className="inline-flex flex-col items-center">
          <h1 className="font-sans text-[clamp(56px,11vw,108px)] font-black leading-none tracking-[0.22em] text-gate-white">
            G<Dot />A<Dot />T<Dot />E<Dot />
          </h1>

          <div
            className="my-4 h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #C9993A 30%, #E8C060 50%, #C9993A 70%, transparent)",
            }}
          />

          <p className="text-[clamp(8px,1.4vw,11px)] font-light uppercase tracking-[0.4em] text-gate-white/60">
            Global Academic &amp; Theoretical Excellence Olympiad
          </p>
        </div>

        <div className="mt-20 grid gap-6 text-left sm:grid-cols-3">
          <Card label="Framework">Next.js 16 · App Router · TS</Card>
          <Card label="Database">Neon · Drizzle ORM</Card>
          <Card label="Email">Resend</Card>
        </div>

        <p className="mt-16 text-[10px] font-light uppercase tracking-[0.3em] text-gate-white/40">
          Preliminary Round → Global Onsite Olympiad · Xidian University, Hangzhou Campus
        </p>
      </div>
    </main>
  );
}

function Dot() {
  return <span className="text-gate-gold">.</span>;
}

function Card({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l-2 border-gate-gold/40 pl-4">
      <div className="text-[8px] font-bold uppercase tracking-[0.35em] text-gate-gold">
        {label}
      </div>
      <div className="mt-2 text-sm font-light tracking-wide text-gate-white/80">
        {children}
      </div>
    </div>
  );
}
