import { Lock } from "lucide-react";
import { ButtonLink, Section, SectionHeader } from "@/components/site/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion/reveal";
import { getCurrentEdition, getEdition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import { EditionView } from "./edition-view";

export function summer2026Faqs(locale: Locale = "en") {
  const next = localizeEdition(getCurrentEdition(), locale);
  if (locale === "ru") {
    return [
      {
        q: "Это соревнование?",
        a: "Нет. GATE — академическая диагностическая и образовательная программа, а не соревнование. Её цель — выявить сильные стороны каждого участника и дать персональный отчёт и сертификат. За выдающиеся результаты вручаются академические награды (Distinction, High Achievement, Merit), но проигравших нет: каждый участник получает подробный отчёт и сертификат.",
      },
      {
        q: "Кто участвовал?",
        a: "Школьники 1–11 классов в пяти возрастных группах: 1–2, 3–4, 5–6, 7–8 и 9–11 классы. Сложность заданий подбиралась под каждую группу.",
      },
      {
        q: "Что входило в стоимость программы 2026 года?",
        a: "Участие в августовской программе 2026 года стоило 1 000 $ и включало проживание в общежитии, трёхразовое питание, все лекции и материалы, полный доступ к кампусу, диагностическую оценку, сертификат об участии, культурную программу в Ханчжоу и страховку на время программы в Китае. Международный перелёт и визовый сбор оплачивались отдельно.",
      },
      {
        q: "На каком языке шли занятия?",
        a: "На английском. Лекции в Сидяньском университете читали преподаватели Школы международного образования.",
      },
      {
        q: "Что получили лучшие участники?",
        a: "В каждом предмете и возрастной группе за 1, 2 и 3 места вручались золотые, серебряные и бронзовые медали вместе с сертификатами Distinction, High Achievement или Merit.",
      },
      {
        q: "Когда следующая программа?",
        a: `${next.name}: ${next.dateLabel}, ${next.host}, ${next.city}, ${next.country}.`,
      },
    ];
  }
  return [
    {
      q: "Is this a competition?",
      a: "No. GATE is an academic diagnostic and educational program — not a competition. The goal is to evaluate each participant's individual strengths and provide a personalized performance report and certificate. Outstanding performance receives academic recognition (Distinction/High Achievement/Merit), but no participant 'loses' — every participant receives a detailed report and certificate.",
    },
    {
      q: "Who took part?",
      a: "Students in Grades 1–11, assessed in five grade bands: Grades 1–2, 3–4, 5–6, 7–8 and 9–11. Difficulty was calibrated to each band.",
    },
    {
      q: "What did the 2026 tuition cover?",
      a: "The August 2026 edition cost $1,000 per participant, all-inclusive of: dormitory accommodation, three meals daily, all lectures and learning materials, full campus access, the diagnostic assessment, certificate of completion, the Hangzhou cultural program, and travel accident and medical insurance in China. International airfare and visa fees were not included.",
    },
    {
      q: "What language was the program taught in?",
      a: "English. Lectures at Xidian University were delivered in English by the School of International Education faculty.",
    },
    {
      q: "What did top performers receive?",
      a: "In every subject and grade band, 1st, 2nd and 3rd place received gold, silver and bronze medals with a Certificate of Distinction, High Achievement or Merit.",
    },
    {
      q: "When is the next program?",
      a: `${next.name}: ${next.dateLabel} at ${next.host}, ${next.city}, ${next.country}.`,
    },
  ];
}

const T = {
  en: {
    recognition: "Recognition",
    medalsTitle: "Medals for the top three",
    medalsLead:
      "In every subject and grade band, 1st, 2nd and 3rd place received medals and place certificates at the closing ceremony — and every participant received a report and certificate.",
    places: [
      { place: "1st", label: "1st place · Gold medal", certificate: "Certificate of Distinction", hex: "#C9993A" },
      { place: "2nd", label: "2nd place · Silver medal", certificate: "Certificate of High Achievement", hex: "#8A9BB0" },
      { place: "3rd", label: "3rd place · Bronze medal", certificate: "Certificate of Merit", hex: "#A0663A" },
    ],
    everyoneLabel: "Everyone received",
    everyone: [
      { title: "Performance report", desc: "Score breakdown, strengths, areas to grow and recommended resources." },
      { title: "Certificate of completion", desc: "Issued to every participant, verifiable online." },
      { title: "Camp experience certificate", desc: "Documents the week of academic immersion in Hangzhou." },
    ],
    papers: "The papers",
    papersTitle: "Mathematics and English, by grade band",
    papersLead: "Every paper from the August 2026 week will be published with its full answer key — for anyone preparing for the next program.",
    toPrepare: "Go to Prepare",
    grades: "Grades",
    math: "Mathematics",
    english: "English",
    category: (n: number) => `Category ${n}`,
    gradesBand: (b: string) => `Grades ${b}`,
    soon: "Soon",
    partnersEyebrow: "Endorsement & partnership",
    partnersTitle: "Institutional backing",
    govLabel: "Government communication",
    govTitle: "Ministry of Education and Science",
    govSub: "Republic of Tajikistan",
    govBody:
      "The GATE 2026 program operated with official communication to the Ministry of Education and Science of the Republic of Tajikistan, ensuring institutional alignment.",
    acadLabel: "Academic partnership",
    acadTitle: "Xidian University",
    acadSub: "Hangzhou Institute of Technology",
    acadBody:
      "The onsite program was co-organized by the School of International Education at Xidian University — a leading Chinese institution in information technology and the foundational sciences.",
    nav: { recognition: "Recognition", papers: "The papers", partners: "Partners" },
  },
  ru: {
    recognition: "Награды",
    medalsTitle: "Медали для лучших",
    medalsLead:
      "В каждом предмете и возрастной группе за 1, 2 и 3 места на церемонии закрытия вручались медали и сертификаты, а каждый участник получил отчёт и сертификат.",
    places: [
      { place: "1", label: "1 место · Золотая медаль", certificate: "Certificate of Distinction", hex: "#C9993A" },
      { place: "2", label: "2 место · Серебряная медаль", certificate: "Certificate of High Achievement", hex: "#8A9BB0" },
      { place: "3", label: "3 место · Бронзовая медаль", certificate: "Certificate of Merit", hex: "#A0663A" },
    ],
    everyoneLabel: "Получил каждый",
    everyone: [
      { title: "Отчёт о результатах", desc: "Баллы по разделам, сильные стороны, зоны роста и подборка полезных ресурсов." },
      { title: "Сертификат участника", desc: "Выдаётся каждому, подлинность проверяется онлайн." },
      { title: "Сертификат программы", desc: "Подтверждает неделю академического погружения в Ханчжоу." },
    ],
    papers: "Задания",
    papersTitle: "Математика и английский по возрастным группам",
    papersLead: "Все задания августовской программы 2026 года мы опубликуем вместе с ответами — для тех, кто готовится к следующей программе.",
    toPrepare: "Перейти к подготовке",
    grades: "Классы",
    math: "Математика",
    english: "Английский",
    category: (n: number) => `Категория ${n}`,
    gradesBand: (b: string) => `${b} классы`,
    soon: "Скоро",
    partnersEyebrow: "Поддержка и партнёрство",
    partnersTitle: "Институциональная поддержка",
    govLabel: "Взаимодействие с государством",
    govTitle: "Министерство образования и науки",
    govSub: "Республики Таджикистан",
    govBody:
      "Программа GATE 2026 проходила при официальном взаимодействии с Министерством образования и науки Республики Таджикистан.",
    acadLabel: "Академический партнёр",
    acadTitle: "Сидяньский университет",
    acadSub: "Ханчжоуский технологический институт",
    acadBody:
      "Очную программу совместно организовала Школа международного образования Сидяньского университета — одного из ведущих вузов Китая в области информационных технологий и фундаментальных наук.",
    nav: { recognition: "Награды", papers: "Задания", partners: "Партнёры" },
  },
};

const BANDS = ["1–2", "3–4", "5–6", "7–8", "9–11"];

function Summer2026Extras({ locale }: { locale: Locale }) {
  const t = T[locale];
  return (
    <>
      {/* RECOGNITION */}
      <Section id="recognition" tone="white">
        <SectionHeader eyebrow={t.recognition} title={t.medalsTitle} lead={t.medalsLead} />
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {t.places.map((p) => (
            <StaggerItem key={p.place} className="group relative overflow-hidden rounded-[2rem] border border-line bg-ivory p-8">
              <div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
                style={{ background: p.hex }}
              />
              <div className="relative flex flex-col gap-6">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 font-serif text-2xl font-medium"
                  style={{ borderColor: p.hex, color: p.hex }}
                >
                  {p.place}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">{p.label}</span>
                  <h3 className="font-serif text-3xl font-medium text-ink">{p.certificate}</h3>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Stagger className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {t.everyone.map((e) => (
            <StaggerItem key={e.title} className="flex flex-col gap-2 rounded-[1.5rem] bg-ivory-2 p-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">{t.everyoneLabel}</span>
              <h3 className="font-serif text-2xl font-medium text-ink">{e.title}</h3>
              <p className="text-[14px] leading-relaxed text-ink-2">{e.desc}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* PAPERS */}
      <Section id="papers" tone="ivory">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeader align="left" eyebrow={t.papers} title={t.papersTitle} lead={t.papersLead} className="mb-0 md:mb-0" />
            <Reveal delay={0.2}>
              <ButtonLink href="/prepare" variant="outline">
                {t.toPrepare}
              </ButtonLink>
            </Reveal>
          </div>
          <Reveal className="glass overflow-hidden rounded-[2rem]">
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-line px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3">
              <span>{t.grades}</span>
              <span>{t.math}</span>
              <span>{t.english}</span>
            </div>
            {BANDS.map((b, i) => (
              <div key={b} className="grid grid-cols-[1fr_1fr_1fr] items-center border-b border-line px-6 py-4 last:border-0">
                <span className="flex flex-col">
                  <span className="font-serif text-xl font-medium text-ink">{t.category(i + 1)}</span>
                  <span className="text-[12px] text-ink-3">{t.gradesBand(b)}</span>
                </span>
                {[0, 1].map((k) => (
                  <span key={k} className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-ink-3">
                    <Lock className="h-3 w-3" /> {t.soon}
                  </span>
                ))}
              </div>
            ))}
          </Reveal>
        </div>
      </Section>

      {/* PARTNERS */}
      <Section id="partners" tone="ivory-2">
        <SectionHeader eyebrow={t.partnersEyebrow} title={t.partnersTitle} />
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StaggerItem className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 md:p-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">{t.govLabel}</span>
            <h3 className="font-serif text-3xl font-medium leading-tight text-ink">
              {t.govTitle}
              <span className="block text-ink-3">{t.govSub}</span>
            </h3>
            <p className="text-[14px] leading-[1.8] text-ink-2">{t.govBody}</p>
          </StaggerItem>
          <StaggerItem className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 md:p-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">{t.acadLabel}</span>
            <h3 className="font-serif text-3xl font-medium leading-tight text-ink">
              {t.acadTitle}
              <span className="block text-ink-3">{t.acadSub}</span>
            </h3>
            <p className="text-[14px] leading-[1.8] text-ink-2">{t.acadBody}</p>
          </StaggerItem>
        </Stagger>
      </Section>
    </>
  );
}

export async function Summer2026View({ headingLevel }: { headingLevel?: "h1" | "h2" }) {
  const locale = await getLocale();
  const t = T[locale];
  const edition = getEdition("2026-summer")!;
  return (
    <EditionView
      edition={edition}
      headingLevel={headingLevel}
      faqs={summer2026Faqs(locale)}
      extras={<Summer2026Extras locale={locale} />}
      extraSections={[
        { id: "recognition", title: t.nav.recognition },
        { id: "papers", title: t.nav.papers },
        { id: "partners", title: t.nav.partners },
      ]}
    />
  );
}
