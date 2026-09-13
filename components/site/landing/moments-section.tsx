import Image from "next/image";
import { GALLERY_PHOTOS } from "@/lib/marketing/hangzhou-media";

export function MomentsSection() {
  return (
    <section id="the-week" className="bg-gate-900 py-24 px-6 border-b border-border">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col items-center gap-4 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold-2">
            From Last Cohort
          </span>
          <h2 className="font-serif text-3xl font-medium text-gate-white md:text-5xl">
            Real Students, Real Moments
          </h2>
          <p className="max-w-md text-sm font-normal leading-[1.7] text-gate-white/60">
            No stock photography — every frame here is from a GATE student who lived this program.
          </p>
        </div>

        <div className="grid auto-rows-[160px] grid-cols-2 gap-2 sm:auto-rows-[200px] sm:gap-3 md:grid-cols-4 md:[grid-auto-flow:dense]">
          {GALLERY_PHOTOS.map((photo, i) => (
            <div
              key={photo.src}
              className={`group relative overflow-hidden rounded-2xl bg-gate-800 ${
                i === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gate-900/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
