import { Globe2, GraduationCap, Rocket, Users } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/site/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion/reveal";
import { getLocale, pageMetadata } from "@/lib/i18n/server";
import { CareerForm } from "./career-form";

export const generateMetadata = () =>
  pageMetadata("/careers", {
    en: {
      title: "Careers",
      description: "Open positions at G.A.T.E. — join the team building international academic programs for school students.",
    },
    ru: {
      title: "Вакансии",
      description: "Вакансии G.A.T.E. — присоединяйтесь к команде, которая создаёт международные академические программы для школьников.",
    },
  });

const T = {
  en: {
    positions: [
      {
        title: "Academic Coordinator",
        type: "Full-Time / Remote",
        location: "Global (Remote)",
        desc: "Coordinate academic content, examination design review, and liaise with subject-matter experts across disciplines. You will play a central role in maintaining examination quality and academic integrity.",
        requirements: [
          "Background in mathematics, sciences, or educational assessment",
          "Experience with academic program coordination or examinations",
          "Strong written communication in English",
          "Ability to work across time zones with international teams",
        ],
      },
      {
        title: "Country Representative",
        type: "Part-Time / Contract",
        location: "Your Country",
        desc: "Represent G.A.T.E. in your country or region. Responsibilities include recruiting school coordinators, assisting with participant registration, and acting as the local point of contact for participants, parents, and institutions.",
        requirements: [
          "Fluency in English and local language",
          "Understanding of the local academic and secondary education landscape",
          "Strong organizational and communication skills",
          "Network within schools or academic institutions (preferred)",
        ],
      },
      {
        title: "Operations Assistant",
        type: "Part-Time / Remote",
        location: "Remote",
        desc: "Support the G.A.T.E. operations team with participant data management, communication scheduling, platform support, and administrative tasks during registration and examination cycles.",
        requirements: [
          "Organized and detail-oriented",
          "Comfortable working with spreadsheets, data entry, and task management tools",
          "Responsive and reliable during peak periods",
          "Prior experience in academic or assessment program administration is a plus",
        ],
      },
    ],
    values: [
      { icon: Globe2, title: "Remote-first", body: "All positions are remote or hybrid. We are a global team and work that way." },
      { icon: GraduationCap, title: "Academic mission", body: "Our work directly supports students taking part in meaningful academic evaluation." },
      { icon: Rocket, title: "Small team", body: "No bureaucracy. You will have direct influence and see the results of your work." },
      { icon: Users, title: "International scope", body: "Work with participants, coordinators and partners from across the world." },
    ],
    heroEyebrow: "Join the team",
    heroTitle: "Build something that matters",
    heroLead:
      "G.A.T.E. is a small, focused team building international academic programs. Every role here has direct impact on how students experience academic evaluation.",
    openEyebrow: "Open positions",
    openTitle: "Current openings",
    requirements: "Requirements",
    applyEyebrow: "Apply",
    applyTitle: "Submit your application",
    applyLead:
      "Select the position you are applying for and submit your application. CV submission becomes available after your initial application is reviewed. We respond within 7–10 business days.",
  },
  ru: {
    positions: [
      {
        title: "Академический координатор",
        type: "Полная занятость / удалённо",
        location: "Любая страна (удалённо)",
        desc: "Координация академического контента, экспертиза экзаменационных заданий и работа с предметными специалистами. Вы будете отвечать за качество заданий и академическую честность программы.",
        requirements: [
          "Образование в области математики, естественных наук или педагогических измерений",
          "Опыт координации академических программ или экзаменов",
          "Грамотный письменный английский",
          "Готовность работать с международной командой в разных часовых поясах",
        ],
      },
      {
        title: "Представитель в стране",
        type: "Частичная занятость / договор",
        location: "Ваша страна",
        desc: "Представляйте G.A.T.E. в своей стране или регионе: находите школьных координаторов, помогайте с регистрацией участников и будьте контактным лицом для ребят, родителей и учебных заведений.",
        requirements: [
          "Свободный английский и местный язык",
          "Понимание местной системы школьного образования",
          "Организованность и умение общаться с людьми",
          "Связи в школах или академических учреждениях (желательно)",
        ],
      },
      {
        title: "Ассистент по операционной работе",
        type: "Частичная занятость / удалённо",
        location: "Удалённо",
        desc: "Помощь операционной команде G.A.T.E.: работа с данными участников, планирование рассылок, поддержка платформы и административные задачи в периоды регистрации и экзаменов.",
        requirements: [
          "Организованность и внимание к деталям",
          "Уверенная работа с таблицами, вводом данных и таск-трекерами",
          "Отзывчивость и надёжность в пиковые периоды",
          "Опыт администрирования академических программ — плюс",
        ],
      },
    ],
    values: [
      { icon: Globe2, title: "Удалёнка по умолчанию", body: "Все позиции — удалённые или гибридные. Мы международная команда и так работаем." },
      { icon: GraduationCap, title: "Академическая миссия", body: "Наша работа напрямую помогает школьникам получить честную и содержательную оценку знаний." },
      { icon: Rocket, title: "Небольшая команда", body: "Никакой бюрократии. Вы напрямую влияете на результат и видите плоды своей работы." },
      { icon: Users, title: "Международный масштаб", body: "Работа с участниками, координаторами и партнёрами со всего мира." },
    ],
    heroEyebrow: "Присоединяйтесь к команде",
    heroTitle: "Делайте то, что имеет значение",
    heroLead:
      "G.A.T.E. — небольшая сфокусированная команда, которая создаёт международные академические программы. Каждый из нас напрямую влияет на то, каким школьники запомнят свою первую серьёзную оценку знаний.",
    openEyebrow: "Открытые вакансии",
    openTitle: "Кого мы ищем",
    requirements: "Требования",
    applyEyebrow: "Отклик",
    applyTitle: "Отправить отклик",
    applyLead:
      "Выберите вакансию и отправьте отклик. Резюме можно будет прислать после первичного рассмотрения. Мы отвечаем в течение 7–10 рабочих дней.",
  },
};

export default async function CareersPage() {
  const locale = await getLocale();
  const t = T[locale];
  return (
    <>
      <PageHero eyebrow={t.heroEyebrow} title={t.heroTitle} lead={t.heroLead} />

      <Section tone="ivory">
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.values.map((v) => (
            <StaggerItem key={v.title} className="glass flex flex-col gap-4 rounded-[1.75rem] p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-gate-gold-2">
                <v.icon className="h-5 w-5" />
              </span>
              <h2 className="font-serif text-2xl font-medium text-ink">{v.title}</h2>
              <p className="text-[14px] leading-[1.75] text-ink-2">{v.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section tone="ivory-2">
        <SectionHeader eyebrow={t.openEyebrow} title={t.openTitle} align="left" />
        <div className="flex flex-col gap-4">
          {t.positions.map((pos, i) => (
            <Reveal key={pos.title} delay={i * 0.06}>
              <article className="grid grid-cols-1 gap-8 rounded-[2rem] bg-white p-8 transition-shadow hover:shadow-[0_30px_60px_-40px_rgba(11,31,58,0.45)] md:p-10 lg:grid-cols-[1fr_1fr]">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-gate-gold/15 px-3 py-1 text-[11px] font-semibold text-gate-gold">{pos.type}</span>
                    <span className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-ink-3">{pos.location}</span>
                  </div>
                  <h3 className="font-serif text-3xl font-medium text-ink md:text-4xl">{pos.title}</h3>
                  <p className="text-[15px] leading-[1.85] text-ink-2">{pos.desc}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-3">{t.requirements}</span>
                  <ul className="flex flex-col gap-3">
                    {pos.requirements.map((r) => (
                      <li key={r} className="flex items-start gap-3 text-[14px] leading-relaxed text-ink-2">
                        <span className="mt-[10px] h-px w-4 shrink-0 bg-gate-gold" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="ivory">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <SectionHeader align="left" eyebrow={t.applyEyebrow} title={t.applyTitle} lead={t.applyLead} className="mb-0 md:mb-0" />
          <Reveal className="rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-50px_rgba(11,31,58,0.45)] md:p-10">
            {/* The stored position title stays in English for the admin team. */}
            <CareerForm positionTitle={T.en.positions[0].title} />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
