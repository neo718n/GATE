import { ButtonLink, PageHero, Section } from "@/components/site/kit";
import { Reveal } from "@/components/site/motion/reveal";
import { SubjectsStage } from "@/components/site/subjects/subjects-stage";
import { getCurrentEdition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { getLocale, pageMetadata } from "@/lib/i18n/server";
import { SUBJECTS, getSubjects } from "@/lib/subjects";

export const generateMetadata = () =>
  pageMetadata("/subjects", {
    en: {
      title: "Subject Areas",
      description: "Explore the five academic disciplines in G.A.T.E.: Mathematics, English, Physics, Chemistry and Informatics.",
    },
    ru: {
      title: "Предметы",
      description: "Пять дисциплин G.A.T.E.: математика, английский язык, физика, химия и информатика.",
    },
  });

const T = {
  en: {
    eyebrow: "Subject areas",
    title: "Five disciplines, one standard",
    lead: "Participants register in one subject area and are evaluated through papers designed and graded by university academics. Scroll to explore each one.",
    grades: (a: number, b: number) => `Grades ${a}–${b}`,
    ctaTitle: "Choose your discipline",
    ctaLead:
      "Each participant registers in a single subject area. Your subject selection is made during the application process and cannot be changed after submission.",
    see: (name: string) => `See ${name}`,
    practice: "Practice by subject",
  },
  ru: {
    eyebrow: "Предметы",
    title: "Пять дисциплин — один стандарт",
    lead: "Участник выбирает один предмет и выполняет задания, которые составляют и проверяют преподаватели университета. Прокрутите страницу, чтобы познакомиться с каждым.",
    grades: (a: number, b: number) => `${a}–${b} классы`,
    ctaTitle: "Выберите свой предмет",
    ctaLead: "Каждый участник выбирает один предмет при подаче заявки. После отправки заявки изменить его нельзя.",
    see: (name: string) => `Смотреть: ${name}`,
    practice: "Задания по предметам",
  },
};

export default async function SubjectsPage() {
  const locale = await getLocale();
  const t = T[locale];
  const base = getCurrentEdition();
  const current = localizeEdition(base, locale);
  const localized = getSubjects(locale);
  const subjects = SUBJECTS.map((s) => {
    const g = base.subjects.find((x) => x.name === s.name)?.grades;
    const l = localized.find((x) => x.key === s.key) ?? s;
    return { ...l, grades: g, gradeLabel: g ? `${current.name} · ${t.grades(g[0], g[1])}` : undefined };
  });

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <SubjectsStage subjects={subjects} />

      <Section tone="ivory-2">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-3xl font-serif text-4xl font-medium leading-[1.05] text-ink md:text-6xl">{t.ctaTitle}</h2>
          <p className="max-w-xl text-base leading-[1.8] text-ink-2">{t.ctaLead}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href={`/${current.slug}`}>{t.see(current.name)}</ButtonLink>
            <ButtonLink href="/prepare" variant="outline">
              {t.practice}
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
