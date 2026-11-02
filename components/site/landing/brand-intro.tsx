import { ButtonLink, Eyebrow } from "@/components/site/kit";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/site/motion/reveal";
import { Marquee, ScrollText } from "@/components/site/motion/scroll-text";
import { getEditions } from "@/lib/editions";
import { getLocale } from "@/lib/i18n/server";
import { plural } from "@/lib/i18n/plural";

const T = {
  en: {
    subjects: ["Mathematics", "English", "Physics", "Chemistry", "Informatics"],
    grades: "Grades, from 1 to 12",
    subjectsLabel: "Subjects",
    years: ["Program year", "Program years"] as [string, string],
    verifiable: "Certificates verifiable online",
    eyebrow: "What is G.A.T.E.?",
    body: "G.A.T.E. — Global Academic & Theoretical Excellence — is an international academic program for students in Grades 1–12. A week at a partner university in China: an assessment graded by professors, lectures, campus life and cultural excursions. Every participant leaves with a diagnostic report and a verifiable certificate.",
    more: "More about G.A.T.E.",
  },
  ru: {
    subjects: ["Математика", "Английский", "Физика", "Химия", "Информатика"],
    grades: "Классов — с 1 по 12",
    subjectsLabel: "Предметов",
    verifiable: "Сертификатов проверяются онлайн",
    eyebrow: "Что такое G.A.T.E.?",
    body: "G.A.T.E. — Global Academic & Theoretical Excellence — международная академическая программа для школьников 1–12 классов. Неделя в университете-партнёре в Китае: диагностика, которую проверяют профессора, лекции, жизнь в кампусе и экскурсии. Каждый участник уезжает с персональным диагностическим отчётом и сертификатом, подлинность которого можно проверить онлайн.",
    more: "Подробнее о G.A.T.E.",
  },
};

/** "What is GATE" band so the homepage answers the brand query itself. */
export async function BrandIntro() {
  const locale = await getLocale();
  const t = T[locale];
  const years = getEditions().length;
  const stats: [string, string][] = [
    ["12", t.grades],
    ["5", t.subjectsLabel],
    [String(years), plural(years, locale, ["Program year", "Program years"], ["Год программы", "Года программы", "Лет программы"])],
    ["100%", t.verifiable],
  ];

  return (
    <section className="relative overflow-hidden bg-ivory py-24 md:py-36">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-6">
        <Reveal>
          <Eyebrow>{t.eyebrow}</Eyebrow>
        </Reveal>
        <ScrollText text={t.body} className="max-w-6xl font-serif text-3xl font-medium leading-[1.2] text-ink md:text-5xl lg:text-6xl" />
        <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-line bg-line md:grid-cols-4">
          {stats.map(([v, l]) => (
            <StaggerItem key={l} className="flex flex-col gap-2 bg-ivory p-6 md:p-8">
              <Counter value={v} className="font-serif text-5xl font-medium text-ink md:text-6xl" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-3">{l}</span>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal>
          <ButtonLink href="/about" variant="outline">
            {t.more}
          </ButtonLink>
        </Reveal>
      </div>
      <Marquee items={t.subjects} className="mt-20 py-4" />
    </section>
  );
}
