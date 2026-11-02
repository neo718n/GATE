import Image from "next/image";
import { ArrowUpRight, Check, Minus } from "lucide-react";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { Eyebrow, Section, SectionHeader } from "@/components/site/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion/reveal";
import { ItineraryReel } from "@/components/site/motion/itinerary-reel";
import { ParallaxGallery, PinnedOutcomes, ZoomMedia } from "@/components/site/motion/pinned";
import { ScrollIsland, type IslandSection } from "@/components/site/motion/scroll-island";
import { UpcomingHero, VideoHero } from "./edition-hero";
import { SubjectsStage } from "@/components/site/subjects/subjects-stage";
import { SUBJECTS, getSubjects } from "@/lib/subjects";
import { JourneyMap } from "./journey-map";
import { APPLY_URL } from "@/lib/portal-urls";
import { getEditions, isPast, type Edition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { Link } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { plural } from "@/lib/i18n/plural";
import type { Locale } from "@/lib/i18n/config";

const T = {
  en: {
    week: "The week",
    why: "Why take part",
    weekTitle: "What the week held",
    whyTitle: "One week, three outcomes",
    host: "Host university",
    wentPast: "Where we went",
    wentNext: "Where you'll go",
    subjectsNav: "Subjects & grades",
    tookPart: "Who took part",
    canTake: "Who can take part",
    grades: (a: number, b: number) => `Grades ${a}–${b}`,
    itinerary: "Itinerary",
    daysTitle: (n: number) => `${n} days, day by day`,
    stayedPast: "Where we stayed",
    stayNext: "Where you stay",
    gallery: "Gallery",
    beyond: (city: string) => `${city} and beyond`,
    included: "What's included",
    coveredPast: "What the tuition covered",
    coveredNext: "Everything is taken care of",
    coveredLead: "One package — families don't have to organise anything in China.",
    tuition: "Tuition",
    fee: "Program fee",
    perParticipant: "per participant",
    allIncluded: "everything below included",
    notIncluded: "Not included",
    apply: "Apply now",
    faqEyebrow: "Frequently asked",
    faqTitle: (e: Edition) => `About ${e.name}`,
    questions: "Questions",
    nextProgram: "Next program",
    happened: "It has already happened",
    see: (name: string) => `See ${name}`,
    howWent: "See how it went",
  },
  ru: {
    week: "Как это было",
    why: "Зачем ехать",
    weekTitle: "Чем запомнилась неделя",
    whyTitle: "Одна неделя — три результата",
    host: "Принимающий университет",
    wentPast: "Где мы побывали",
    wentNext: "Куда вы поедете",
    subjectsNav: "Предметы и классы",
    tookPart: "Кто участвовал",
    canTake: "Кто может участвовать",
    grades: (a: number, b: number) => `${a}–${b} классы`,
    itinerary: "Программа",
    daysTitle: (n: number) => `${n} ${plural(n, "ru", ["day", "days"], ["день", "дня", "дней"])}: день за днём`,
    stayedPast: "Где мы жили",
    stayNext: "Где вы будете жить",
    gallery: "Галерея",
    beyond: (city: string) => `${city} и не только`,
    included: "Что входит в стоимость",
    coveredPast: "Что входило в стоимость",
    coveredNext: "Мы позаботились обо всём",
    coveredLead: "Всё в одном пакете — родителям не нужно ничего организовывать в Китае.",
    tuition: "Стоимость",
    fee: "Стоимость программы",
    perParticipant: "за участника",
    allIncluded: "всё перечисленное включено",
    notIncluded: "Не входит в стоимость",
    apply: "Подать заявку",
    faqEyebrow: "Частые вопросы",
    faqTitle: (e: Edition) => `О программе ${e.name}`,
    questions: "Вопросы",
    nextProgram: "Следующая программа",
    happened: "Это уже было",
    see: (name: string) => `Подробнее о ${name}`,
    howWent: "Как это было",
  },
};

/**
 * Data-driven page for one program year. Everything comes from the Edition
 * entry in lib/editions.ts (and its Russian copy in lib/editions-ru.ts);
 * `extras` lets a year add bespoke sections after "What's included".
 */
export async function EditionView({
  edition: source,
  headingLevel = "h1",
  extras,
  extraSections = [],
  faqs: faqsOverride,
}: {
  edition: Edition;
  headingLevel?: "h1" | "h2";
  extras?: React.ReactNode;
  extraSections?: IslandSection[];
  faqs?: { q: string; a: string }[];
}) {
  const locale: Locale = await getLocale();
  const t = T[locale];
  const edition = localizeEdition(source, locale);
  const faqs = faqsOverride ?? edition.faqs;
  const past = isPast(edition);
  const all = getEditions();
  const otherSource = past ? all.find((e) => !isPast(e)) : all.find((e) => e.startDate < edition.startDate);
  const other = otherSource ? localizeEdition(otherSource, locale) : undefined;
  const subjects = getSubjects(locale);

  const sections: IslandSection[] = [
    edition.highlights.length > 0 && { id: "why", title: past ? t.week : t.why },
    edition.hostStory && { id: "host", title: t.host },
    edition.journey && { id: "journey", title: past ? t.wentPast : t.wentNext },
    { id: "subjects", title: t.subjectsNav },
    edition.itinerary.length > 0 && { id: "itinerary", title: t.itinerary },
    edition.stay && { id: "stay", title: past ? t.stayedPast : t.stayNext },
    edition.gallery.length > 0 && { id: "gallery", title: t.gallery },
    edition.includes.length > 0 && { id: "included", title: t.included },
    ...extraSections,
    faqs.length > 0 && { id: "faq", title: t.questions },
  ].filter(Boolean) as IslandSection[];

  const subjectCount = `${edition.subjects.length} ${plural(edition.subjects.length, locale, ["subject", "subjects"], ["предмет", "предмета", "предметов"])}`;

  return (
    <>
      {edition.heroVideo ? (
        <VideoHero edition={edition} headingLevel={headingLevel} />
      ) : (
        <UpcomingHero edition={edition} headingLevel={headingLevel} />
      )}

      {/* WHY — pinned storytelling */}
      {edition.highlights.length > 0 && (
        <section id="why" className="scroll-mt-0">
          <PinnedOutcomes eyebrow={past ? t.week : t.why} title={past ? t.weekTitle : t.whyTitle} items={edition.highlights} />
        </section>
      )}

      {/* HOST — zooms to full-bleed */}
      {edition.hostStory && (
        <section id="host">
          <ZoomMedia
            overlay={
              <div className="flex h-full w-full items-end bg-gradient-to-t from-ink/85 via-ink/30 to-transparent p-6 md:p-14">
                <div className="grid w-full max-w-7xl grid-cols-1 items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
                  <div className="flex flex-col gap-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gate-gold-2">{t.host}</span>
                    <h2 className="font-serif text-4xl font-medium leading-[1.02] text-white md:text-7xl">{edition.host}</h2>
                    <p className="max-w-xl text-sm leading-[1.8] text-white/80 md:text-base">{edition.hostStory.body}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {edition.hostStory.facts.map(([v, l]) => (
                      <div key={l} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                        <span className="block font-serif text-3xl font-medium text-white md:text-4xl">{v}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
          >
            <Image src={edition.hostStory.image.src} alt={edition.hostStory.image.alt} fill sizes="100vw" className="object-cover" />
          </ZoomMedia>
        </section>
      )}

      {/* JOURNEY — route map + destination scenes */}
      {edition.journey && (
        <section id="journey">
          <JourneyMap start={edition.journey.start} stops={edition.journey.stops} title={past ? t.wentPast : t.wentNext} />
        </section>
      )}

      {/* SUBJECTS × GRADES */}
      <section id="subjects">
        <SubjectsStage
          heading={{ eyebrow: past ? t.tookPart : t.canTake, title: `${t.grades(edition.grades[0], edition.grades[1])} · ${subjectCount}` }}
          showTopics={false}
          subjects={edition.subjects.flatMap((es) => {
            const key = SUBJECTS.find((x) => x.name === es.name)?.key;
            const s = subjects.find((x) => x.key === key);
            return s ? [{ ...s, grades: es.grades }] : [];
          })}
        />
      </section>

      {/* ITINERARY — self-moving reel */}
      {edition.itinerary.length > 0 && (
        <section id="itinerary" className="scroll-mt-0">
          <ItineraryReel eyebrow={t.itinerary} title={t.daysTitle(edition.itinerary.length)} days={edition.itinerary} />
        </section>
      )}

      {/* STAY */}
      {edition.stay && (
        <Section id="stay" tone="ivory">
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeader
              align="left"
              eyebrow={past ? t.stayedPast : t.stayNext}
              title={edition.stay.name}
              lead={edition.stay.body}
              className="mb-0 md:mb-0"
            />
            <Stagger className="grid grid-cols-2 gap-3 md:gap-4">
              {edition.stay.photos.map((p, i) => (
                <StaggerItem
                  key={p.src}
                  className={`group relative overflow-hidden rounded-[1.5rem] bg-ivory-3 ${i === 0 ? "col-span-2 aspect-[16/8]" : "aspect-square"} ${i === 3 ? "hidden md:block" : ""}`}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-[1.06]"
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Section>
      )}

      {/* GALLERY — parallax columns */}
      {edition.gallery.length > 0 && (
        <section id="gallery" className="scroll-mt-20 overflow-hidden bg-ivory-2 px-6 pb-12 pt-24 md:pt-36">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow={t.gallery} title={t.beyond(edition.city)} />
            <ParallaxGallery photos={edition.gallery} />
          </div>
        </section>
      )}

      {/* INCLUDED */}
      {edition.includes.length > 0 && (
        <Section id="included" tone="ivory">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <SectionHeader
              align="left"
              eyebrow={t.included}
              title={past ? t.coveredPast : t.coveredNext}
              lead={past ? undefined : t.coveredLead}
              className="mb-0 md:mb-0"
            />
            <Reveal className="glass flex flex-col gap-8 rounded-[2rem] p-7 md:p-10">
              {edition.price && (
                <div className="flex flex-wrap items-end justify-between gap-4 rounded-[1.5rem] bg-ink p-6 md:p-7">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-gold-2">{past ? t.tuition : t.fee}</span>
                    <span className="font-serif text-6xl font-medium leading-none text-white md:text-7xl">{edition.price.label}</span>
                  </div>
                  <span className="text-[13px] leading-relaxed text-white/70">
                    {t.perParticipant}
                    <br />
                    {t.allIncluded}
                  </span>
                </div>
              )}
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {edition.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] leading-relaxed text-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gate-gold/20 text-gate-gold">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 border-t border-line pt-6">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">{t.notIncluded}</span>
                <ul className="flex flex-wrap gap-2">
                  {edition.notIncluded.map((item) => (
                    <li key={item} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] text-ink-2">
                      <Minus className="h-3 w-3" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              {!past && (
                <Link
                  href={APPLY_URL}
                  className="group inline-flex h-12 w-fit items-center gap-2 rounded-full bg-ink px-6 text-[13px] font-semibold text-ivory transition-colors hover:bg-gate-700"
                >
                  {t.apply}
                  {edition.price ? ` · ${edition.price.label}` : ""}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              )}
            </Reveal>
          </div>
        </Section>
      )}

      {extras}

      {/* FAQ */}
      {faqs.length > 0 && (
        <Section id="faq" tone="ivory-2">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <SectionHeader align="left" eyebrow={t.faqEyebrow} title={t.faqTitle(edition)} className="mb-0 md:mb-0" />
            <Reveal>
              <FaqAccordion items={faqs} />
            </Reveal>
          </div>
        </Section>
      )}

      {/* OTHER YEAR */}
      {other && (
        <section className="bg-ivory px-6 py-24 md:py-32">
          <Reveal className="mx-auto max-w-7xl">
            <Link href={`/${other.slug}`} className="group relative block overflow-hidden rounded-[2.5rem] bg-ink">
              <div className="absolute inset-0">
                <Image
                  src={other.heroImage.src}
                  alt={other.heroImage.alt}
                  fill
                  sizes="100vw"
                  className="object-cover opacity-60 transition-transform duration-[1.5s] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
              </div>
              <div className="relative flex min-h-[420px] flex-col justify-end gap-5 p-8 md:p-14">
                <Eyebrow className="text-gate-gold-2">{past ? t.nextProgram : t.happened}</Eyebrow>
                <h2 className="max-w-2xl font-serif text-4xl font-medium leading-[1.02] text-white md:text-7xl">
                  {other.name} · {other.city}
                </h2>
                <p className="max-w-xl text-sm leading-[1.8] text-white/75 md:text-base">{other.summary}</p>
                <span className="mt-2 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-ink transition-colors group-hover:bg-gate-gold-2">
                  {past ? t.see(other.name) : t.howWent}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      <ScrollIsland sections={sections} />
    </>
  );
}
