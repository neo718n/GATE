import Image from "next/image";
import { ArrowUpRight, Check, X } from "lucide-react";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { ButtonLink, Eyebrow, PageHero, Section, SectionHeader } from "@/components/site/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion/reveal";
import { ScrollText } from "@/components/site/motion/scroll-text";
import { StructuredData, faqJsonLd } from "@/components/seo/json-ld";
import { getCurrentEdition, getEditions, isPast } from "@/lib/editions";
import { localizeEdition, subjectLabel } from "@/lib/editions-ru";
import { Link } from "@/lib/i18n/client";
import { getLocale, pageMetadata } from "@/lib/i18n/server";
import { NOT_TO_CONFUSE, OLYMPIAD_FAQ } from "@/lib/site";

export const generateMetadata = () =>
  pageMetadata("/about", {
    en: {
      title: "About G.A.T.E. (GATE)",
      description:
        "What G.A.T.E. (GATE, Global Academic & Theoretical Excellence) is: an international academic program for students in Grades 1–12, held at partner universities in China. Mission, format, recognition and program years.",
    },
    ru: {
      title: "О G.A.T.E. (GATE)",
      description:
        "Что такое G.A.T.E. (GATE, Global Academic & Theoretical Excellence): международная академическая программа для школьников 1–12 классов на базе университетов-партнёров в Китае. Миссия, формат, награды и годы программы.",
    },
  });

const T = {
  en: {
    faqs: [
      OLYMPIAD_FAQ,
      {
        q: "What does G.A.T.E. stand for?",
        a: "Global Academic & Theoretical Excellence. The name is also written GATE, G.A.T.E or G.A.T.E. Assessment. The official website is gate-assessment.org.",
      },
      {
        q: "What does every participant receive?",
        a: "A personal diagnostic report — strengths, areas to develop and recommended resources — and a certificate of completion that can be verified online at gate-assessment.org/verify. In every subject and grade band, 1st, 2nd and 3rd place receive gold, silver and bronze medals, a Certificate of Distinction, High Achievement or Merit, and prizes.",
      },
      {
        q: "Is there a qualifying round?",
        a: "No. Students register directly for a program; the assessment takes place in person at the host university during the program week.",
      },
    ],
    is: [
      "An international academic program for Grades 1–12",
      "A week at a partner university in China",
      "An assessment graded by university professors",
      "A diagnostic report and a verifiable certificate for everyone",
    ],
    notToConfuse: NOT_TO_CONFUSE.map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
    founded: "Founded",
    grades: "Grades",
    format: "Format",
    formatValue: "One-week onsite program at a partner university in China",
    subjects: "Subjects",
    awards: "Awards",
    awardsValue: "Gold, silver & bronze medals and prizes",
    operated: "Operated by",
    heroEyebrow: "About G.A.T.E.",
    heroLead:
      "G.A.T.E. — often written GATE or G.A.T.E. Assessment — is an international academic program for students in Grades 1–12. Each program is one week at a partner university in China.",
    mission: "Mission",
    missionText:
      "We give school students a credible, transparent and rigorous way to measure their level internationally — and to experience university life while doing it. Assessments evaluate depth of understanding: reasoning and problem-solving, not memorized procedures.",
    glance: "At a glance",
    glanceTitle: "The program in six facts",
    years: "Program years",
    yearsTitle: "Every G.A.T.E. program",
    completed: "Completed",
    upcoming: "Upcoming",
    gradesRange: (a: number, b: number) => `Grades ${a}–${b}`,
    open: (name: string) => `Open ${name}`,
    clarity: "Clarity",
    clarityTitle: "What G.A.T.E. is — and isn't",
    clarityLead: "“GATE” is a common name. The official G.A.T.E. website is gate-assessment.org, and the program is operated by EdSquare.",
    isTitle: "G.A.T.E. is",
    notTitle: "Not affiliated with",
    faqEyebrow: "Frequently asked",
    faqTitle: "Questions about G.A.T.E.",
    ctaEyebrow: "Open to students everywhere",
    ctaTitle: "No qualifying round. Apply directly.",
    see: (name: string) => `See ${name}`,
    prepare: "Prepare",
  },
  ru: {
    faqs: [
      {
        q: "G.A.T.E. — это олимпиада?",
        a: "Многие ищут нас как «GATE олимпиаду» — и G.A.T.E. действительно больше, чем олимпиада. Как и на олимпиаде, за 1, 2 и 3 места в каждом предмете и возрастной группе вручаются золотые, серебряные и бронзовые медали, сертификаты и подарки. Но главное, что получает каждый участник, — диагностический отчёт: в чём ребёнок силён, что стоит подтянуть и какие материалы помогут закрыть пробелы.",
      },
      {
        q: "Как расшифровывается G.A.T.E.?",
        a: "Global Academic & Theoretical Excellence. Название также пишут как GATE, G.A.T.E или G.A.T.E. Assessment. Официальный сайт — gate-assessment.org.",
      },
      {
        q: "Что получает каждый участник?",
        a: "Персональный диагностический отчёт — сильные стороны, зоны роста и рекомендованные материалы — и сертификат участника, подлинность которого можно проверить на gate-assessment.org/verify. В каждом предмете и возрастной группе за 1, 2 и 3 места вручаются золотые, серебряные и бронзовые медали, сертификаты Distinction, High Achievement или Merit и подарки.",
      },
      {
        q: "Есть ли отборочный тур?",
        a: "Нет. Записаться на программу можно напрямую, а сама диагностика проходит очно в принимающем университете во время программы.",
      },
    ],
    is: [
      "Международная академическая программа для 1–12 классов",
      "Неделя в университете-партнёре в Китае",
      "Диагностика, которую проверяют преподаватели университета",
      "Диагностический отчёт и сертификат с онлайн-проверкой для каждого",
    ],
    notToConfuse: [
      "Экзамен GATE для поступления в инженерные вузы Индии (Graduate Aptitude Test in Engineering)",
      "Криптобиржа Gate.io",
      "Школьные программы для одарённых детей (GATE) в США",
    ],
    founded: "Основана",
    grades: "Классы",
    format: "Формат",
    formatValue: "Недельная очная программа в университете-партнёре в Китае",
    subjects: "Предметы",
    awards: "Награды",
    awardsValue: "Золотые, серебряные и бронзовые медали и подарки",
    operated: "Оператор",
    heroEyebrow: "О G.A.T.E.",
    heroLead:
      "G.A.T.E. — также GATE или G.A.T.E. Assessment — международная академическая программа для школьников 1–12 классов. Каждая программа — это неделя в университете-партнёре в Китае.",
    mission: "Миссия",
    missionText:
      "Мы даём школьникам честный, прозрачный и строгий способ узнать свой уровень на международной шкале — и заодно почувствовать, что такое университетская жизнь. Мы проверяем глубину понимания: умение рассуждать и решать задачи, а не заученные алгоритмы.",
    glance: "Коротко",
    glanceTitle: "Программа в шести фактах",
    years: "Годы программы",
    yearsTitle: "Все программы G.A.T.E.",
    completed: "Завершена",
    upcoming: "Скоро",
    gradesRange: (a: number, b: number) => `${a}–${b} классы`,
    open: (name: string) => `Открыть: ${name}`,
    clarity: "Чтобы не путать",
    clarityTitle: "Что такое G.A.T.E. — и чем он не является",
    clarityLead: "«GATE» — распространённое название. Официальный сайт G.A.T.E. — gate-assessment.org, оператор программы — EdSquare.",
    isTitle: "G.A.T.E. — это",
    notTitle: "Не имеет отношения к",
    faqEyebrow: "Частые вопросы",
    faqTitle: "Вопросы о G.A.T.E.",
    ctaEyebrow: "Для школьников из любой страны",
    ctaTitle: "Без отборочного тура. Заявка напрямую.",
    see: (name: string) => `Смотреть: ${name}`,
    prepare: "Подготовка",
  },
};

export default async function AboutPage() {
  const locale = await getLocale();
  const t = T[locale];
  const current = localizeEdition(getCurrentEdition(), locale);
  const editions = getEditions().map((e) => localizeEdition(e, locale));
  const subjectList = (e: typeof current, sep: string) => e.subjects.map((s) => subjectLabel(s.name, locale)).join(sep);

  const facts: { label: string; value: string; wide?: boolean }[] = [
    { label: t.founded, value: "2025" },
    { label: t.grades, value: "1–12" },
    { label: t.format, value: t.formatValue, wide: true },
    { label: `${t.subjects} · ${current.year}`, value: subjectList(current, " · "), wide: true },
    { label: t.awards, value: t.awardsValue },
    { label: t.operated, value: "EdSquare" },
  ];

  return (
    <>
      <StructuredData items={[faqJsonLd(t.faqs)]} />

      <PageHero eyebrow={t.heroEyebrow} title="Global Academic & Theoretical Excellence" lead={t.heroLead} />

      {/* MISSION */}
      <Section tone="ivory">
        <div className="flex flex-col gap-10">
          <Reveal>
            <Eyebrow>{t.mission}</Eyebrow>
          </Reveal>
          <ScrollText text={t.missionText} className="max-w-6xl font-serif text-3xl font-medium leading-[1.2] text-ink md:text-5xl" />
        </div>
      </Section>

      {/* FACTS — bento */}
      <Section tone="ivory-2">
        <SectionHeader eyebrow={t.glance} title={t.glanceTitle} />
        <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {facts.map((f) => (
            <StaggerItem
              key={f.label}
              className={`glass flex min-h-[170px] flex-col justify-between gap-6 rounded-[1.75rem] p-6 md:p-8 ${f.wide ? "col-span-2" : ""}`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-gold">{f.label}</span>
              <span className="font-serif text-2xl font-medium leading-snug text-ink md:text-3xl">{f.value}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* YEARS — timeline */}
      <Section tone="ivory">
        <SectionHeader eyebrow={t.years} title={t.yearsTitle} align="left" />
        <div className="relative flex flex-col gap-6 border-l border-line pl-8 md:pl-12">
          {editions.map((e, i) => (
            <Reveal key={e.slug} delay={i * 0.08}>
              <Link
                href={`/${e.slug}`}
                className="group relative grid grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-40px_rgba(11,31,58,0.4)] md:grid-cols-[1fr_1.3fr]"
              >
                <span
                  className={`absolute -left-[2.6rem] top-10 h-3 w-3 rounded-full ring-4 ring-ivory md:-left-[3.6rem] ${isPast(e) ? "bg-ink/30" : "bg-gate-gold"}`}
                />
                <div className="relative aspect-[16/10] md:aspect-auto">
                  <Image
                    src={e.heroImage.src}
                    alt={e.heroImage.alt}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="flex flex-col justify-center gap-3 p-7 md:p-10">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-gold">
                    {isPast(e) ? t.completed : t.upcoming} · {e.dateLabel}
                  </span>
                  <h3 className="font-serif text-4xl font-medium text-ink">{e.name}</h3>
                  <p className="text-[14px] leading-[1.8] text-ink-2">
                    {e.host}, {e.city} · {t.gradesRange(e.grades[0], e.grades[1])} · {subjectList(e, ", ")}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                    {t.open(e.name)} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* IS / ISN'T */}
      <Section tone="white">
        <SectionHeader eyebrow={t.clarity} title={t.clarityTitle} lead={t.clarityLead} />
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StaggerItem className="flex flex-col gap-6 rounded-[2rem] bg-ivory p-8 md:p-10">
            <h3 className="font-serif text-3xl font-medium text-ink">{t.isTitle}</h3>
            <ul className="flex flex-col gap-4">
              {t.is.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gate-gold/20 text-gate-gold">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </StaggerItem>
          <StaggerItem className="flex flex-col gap-6 rounded-[2rem] border border-line p-8 md:p-10">
            <h3 className="font-serif text-3xl font-medium text-ink">{t.notTitle}</h3>
            <ul className="flex flex-col gap-4">
              {t.notToConfuse.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-3">
                    <X className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </StaggerItem>
        </Stagger>
      </Section>

      {/* FAQ */}
      <Section tone="ivory-2">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <SectionHeader align="left" eyebrow={t.faqEyebrow} title={t.faqTitle} className="mb-0 md:mb-0" />
          <Reveal>
            <FaqAccordion items={t.faqs} />
          </Reveal>
        </div>
      </Section>

      {/* CTA */}
      <Section tone="ivory">
        <Reveal className="flex flex-col items-start justify-between gap-8 rounded-[2.5rem] bg-ink p-10 md:flex-row md:items-end md:p-16">
          <div className="flex max-w-2xl flex-col gap-4">
            <Eyebrow className="text-gate-gold-2">{t.ctaEyebrow}</Eyebrow>
            <h2 className="font-serif text-4xl font-medium leading-[1.05] text-white md:text-6xl">{t.ctaTitle}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={`/${current.slug}`} variant="gold">
              {t.see(current.name)}
            </ButtonLink>
            <ButtonLink href="/prepare" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              {t.prepare}
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
