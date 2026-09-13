import { Lock } from "lucide-react";

const CATEGORIES = [
  { n: 1, grades: "Grades 1–2" },
  { n: 2, grades: "Grades 3–4" },
  { n: 3, grades: "Grades 5–6" },
  { n: 4, grades: "Grades 7–8" },
  { n: 5, grades: "Grades 9–11" },
];

const SUBJECTS = ["Mathematics", "English"] as const;

function AssetChips({ subject }: { subject: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only">{subject}</span>
      {["Paper", "Answers"].map((kind) => (
        <span
          key={kind}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-[10px] font-semibold uppercase text-foreground/40"
        >
          <Lock className="h-3 w-3 shrink-0" strokeWidth={2} />
          {kind}
        </span>
      ))}
    </div>
  );
}

export function SampleProblemsSection() {
  return (
    <section id="papers" className="bg-card py-24 px-6 border-b border-border">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <div className="flex flex-col gap-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            Sample Problems
          </span>
          <h2 className="font-serif text-3xl font-medium text-foreground md:text-5xl">
            The Papers
          </h2>
          <p className="max-w-sm text-sm font-normal leading-[1.75] text-foreground/65">
            Every category below was assessed at the August 2026 cohort — Mathematics and English,
            calibrated by grade band. Each problem set will be published here together with its
            full answer key.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-5 border-b border-border bg-muted/40 px-6 py-3.5 sm:grid">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/55">
              Category
            </span>
            {SUBJECTS.map((s, idx) => (
              <span
                key={s}
                className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/55 ${
                  idx === 1 ? "border-l border-border pl-5" : ""
                }`}
              >
                {s}
              </span>
            ))}
          </div>

          {CATEGORIES.map((c, i) => (
            <div
              key={c.n}
              className={`flex flex-col gap-3 px-6 py-5 sm:grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-5 sm:py-4 ${
                i < CATEGORIES.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold text-foreground">Category {c.n}</span>
                <span className="text-xs font-normal text-foreground/55">{c.grades}</span>
              </div>

              {SUBJECTS.map((s, idx) => (
                <div
                  key={s}
                  className={`flex items-center justify-between gap-3 sm:justify-start ${
                    idx === 1 ? "sm:border-l sm:border-border sm:pl-5" : ""
                  }`}
                >
                  <span className="text-xs font-medium text-foreground/60 sm:hidden">{s}</span>
                  <AssetChips subject={s} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
