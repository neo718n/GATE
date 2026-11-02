import { cn } from "@/lib/utils";

/** A single shimmering placeholder block (see `.skeleton` in globals.css). */
export function Bone({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-2xl", className)} />;
}

/** Hero-shaped skeleton: badge, headline, lead, buttons and facts beside a globe. */
export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen overflow-hidden px-6 pb-16 pt-32 md:pt-36">
      <div className="gold-aura pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-4">
        <div className="flex flex-col gap-7">
          <Bone className="h-9 w-56 rounded-full" />
          <div className="flex flex-col gap-4">
            <Bone className="h-14 w-[85%] md:h-20" />
            <Bone className="h-14 w-[95%] md:h-20" />
            <Bone className="h-14 w-[70%] md:h-20" />
          </div>
          <div className="flex max-w-xl flex-col gap-2.5">
            <Bone className="h-4 w-full rounded-full" />
            <Bone className="h-4 w-[92%] rounded-full" />
            <Bone className="h-4 w-[60%] rounded-full" />
          </div>
          <div className="flex gap-3">
            <Bone className="h-12 w-40 rounded-full" />
            <Bone className="h-12 w-48 rounded-full" />
          </div>
          <div className="grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Bone key={i} className="h-20" />
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-[640px] lg:-mt-20">
          <GlobeSkeleton />
        </div>
      </div>
    </section>
  );
}

/** Circular placeholder in the globe's exact footprint (cobe draws at radius 0.8). */
export function GlobeSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative aspect-square w-full", className)}>
      <div className="skeleton absolute inset-[10%] rounded-full" />
    </div>
  );
}

/** Generic inner-page skeleton: page hero then a grid of cards. */
export function PageSkeleton() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line px-6 pb-20 pt-36 md:pb-28 md:pt-44">
        <div className="gold-aura pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6">
          <Bone className="h-4 w-40 rounded-full" />
          <Bone className="h-16 w-[75%] md:h-24" />
          <div className="flex max-w-2xl flex-col gap-2.5">
            <Bone className="h-4 w-full rounded-full" />
            <Bone className="h-4 w-[80%] rounded-full" />
          </div>
        </div>
      </section>
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Bone key={i} className="h-56 rounded-[1.75rem]" />
          ))}
        </div>
      </section>
    </div>
  );
}
