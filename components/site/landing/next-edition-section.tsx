import { NotifyMeForm } from "@/components/site/landing/notify-me";

export function NextEditionSection() {
  return (
    <section id="next-edition" className="bg-card px-6 py-28 border-b border-border">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Next Edition
        </span>
        <h2 className="font-serif text-4xl font-medium leading-[1.02] text-foreground md:text-6xl lg:text-7xl">
          Dates not announced.
        </h2>
        <p className="max-w-lg text-base font-normal leading-[1.7] text-foreground/70 md:text-lg">
          One email when the host city and dates are confirmed. Registration opens to this list
          first.
        </p>

        <div className="mt-6 w-full rounded-3xl border border-border bg-background p-6 text-left sm:p-8">
          <NotifyMeForm
            source="homepage_next_edition"
            layout="grid"
            submitLabel="Notify Me When Dates Are Set"
          />
        </div>
      </div>
    </section>
  );
}
