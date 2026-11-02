import { BadgeCheck, FileText, QrCode, ScrollText } from "lucide-react";
import { ButtonLink, PageHero, Section, SectionHeader } from "@/components/site/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion/reveal";
import { TiltCard } from "@/components/site/motion/tilt";
import { getCurrentEdition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { getLocale, pageMetadata } from "@/lib/i18n/server";

export const generateMetadata = () =>
  pageMetadata("/awards", {
    en: {
      title: "Awards & Certificates",
      description:
        "G.A.T.E. awards: 1st, 2nd and 3rd place in every subject and grade band receive gold, silver and bronze medals, a Certificate of Distinction, High Achievement or Merit, and prizes. Every participant receives a certificate and a diagnostic report.",
    },
    ru: {
      title: "Награды и сертификаты",
      description:
        "Награды G.A.T.E.: за 1, 2 и 3 места в каждом предмете и возрастной группе — золотые, серебряные и бронзовые медали, сертификаты Distinction, High Achievement или Merit и подарки. Каждый участник получает сертификат и диагностический отчёт.",
    },
  });

// Places are awarded separately in every subject and grade band. The
// certificate names are the formal titles of 1st, 2nd and 3rd place.
const MEDAL_COLORS = [
  { from: "#f8e7b0", to: "#c9993a" },
  { from: "#f4f6f9", to: "#8a9bb0" },
  { from: "#f3dcc2", to: "#a0663a" },
];

const T = {
  en: {
    places: [
      { place: "1st", label: "1st place", medal: "Gold medal", certificate: "Certificate of Distinction" },
      { place: "2nd", label: "2nd place", medal: "Silver medal", certificate: "Certificate of High Achievement" },
      { place: "3rd", label: "3rd place", medal: "Bronze medal", certificate: "Certificate of Merit" },
    ],
    prizes: "Prizes",
    everyone: [
      {
        icon: ScrollText,
        title: "Certificate of Completion",
        desc: "Issued to every participant who completes a G.A.T.E. program. Suitable for portfolios and university applications.",
      },
      {
        icon: FileText,
        title: "Diagnostic Report",
        desc: "A personal report: score breakdown, strengths, areas to develop and recommended resources to close those gaps.",
      },
    ],
    standards: [
      "Unique verification code per recipient",
      "Participant name, discipline and program year",
      "Official G.A.T.E. seal and authorized signature",
      "Digital and printable formats",
      "Accepted for university and scholarship applications",
    ],
    heroEyebrow: "Recognition",
    heroTitle: "Awards & certificates",
    heroLead:
      "Medals, place certificates and prizes for the top three in every subject and grade band — and a verifiable certificate with a diagnostic report for every participant.",
    medalsEyebrow: "Medals & prizes",
    medalsTitle: "1st, 2nd and 3rd place",
    medalsLead: "Awarded in every subject and every grade band, at the program's closing ceremony.",
    everyoneEyebrow: "For every participant",
    everyoneTitle: "Nobody leaves empty-handed",
    standardsEyebrow: "Certificate standards",
    standardsTitle: "Verifiable, anywhere",
    standardsLead:
      "Every G.A.T.E. certificate carries a QR code and a unique code that anyone — a school, a university, a scholarship office — can check online.",
    verify: "Verify a certificate",
    ctaTitle: "Begin your path to recognition",
    ctaLead:
      "Every participant receives a verifiable certificate and a diagnostic report. The top three in each subject and grade band receive medals, place certificates and prizes.",
    see: (name: string) => `See ${name}`,
  },
  ru: {
    places: [
      { place: "1", label: "1 место", medal: "Золотая медаль", certificate: "Certificate of Distinction" },
      { place: "2", label: "2 место", medal: "Серебряная медаль", certificate: "Certificate of High Achievement" },
      { place: "3", label: "3 место", medal: "Бронзовая медаль", certificate: "Certificate of Merit" },
    ],
    prizes: "Подарки",
    everyone: [
      {
        icon: ScrollText,
        title: "Сертификат участника",
        desc: "Выдаётся каждому, кто прошёл программу G.A.T.E. Подходит для портфолио и поступления в университет.",
      },
      {
        icon: FileText,
        title: "Диагностический отчёт",
        desc: "Персональный отчёт: баллы по разделам, сильные стороны, зоны роста и материалы, которые помогут закрыть пробелы.",
      },
    ],
    standards: [
      "Уникальный код проверки для каждого получателя",
      "Имя участника, предмет и год программы",
      "Официальная печать G.A.T.E. и подпись уполномоченного лица",
      "Электронная и печатная версии",
      "Принимается при поступлении в вузы и на стипендиальные программы",
    ],
    heroEyebrow: "Признание",
    heroTitle: "Награды и сертификаты",
    heroLead:
      "Медали, сертификаты и подарки для тройки лучших в каждом предмете и возрастной группе — и сертификат с онлайн-проверкой и диагностическим отчётом для каждого участника.",
    medalsEyebrow: "Медали и подарки",
    medalsTitle: "1, 2 и 3 места",
    medalsLead: "Вручаются в каждом предмете и каждой возрастной группе на церемонии закрытия программы.",
    everyoneEyebrow: "Каждому участнику",
    everyoneTitle: "Без наград не уходит никто",
    standardsEyebrow: "Стандарты сертификатов",
    standardsTitle: "Проверка из любой точки мира",
    standardsLead:
      "На каждом сертификате G.A.T.E. есть QR-код и уникальный номер — школа, университет или стипендиальный фонд могут проверить его онлайн за минуту.",
    verify: "Проверить сертификат",
    ctaTitle: "Первый шаг к признанию",
    ctaLead:
      "Каждый участник получает сертификат с онлайн-проверкой и диагностический отчёт. Тройка лучших в каждом предмете и возрастной группе — медали, сертификаты и подарки.",
    see: (name: string) => `Смотреть: ${name}`,
  },
};

export default async function AwardsPage() {
  const locale = await getLocale();
  const t = T[locale];
  const current = localizeEdition(getCurrentEdition(), locale);

  return (
    <>
      <PageHero eyebrow={t.heroEyebrow} title={t.heroTitle} lead={t.heroLead} />

      <Section tone="ivory">
        <SectionHeader eyebrow={t.medalsEyebrow} title={t.medalsTitle} lead={t.medalsLead} />
        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {t.places.map((p, i) => {
            const c = MEDAL_COLORS[i];
            return (
              <StaggerItem key={p.place} className="h-full">
                <TiltCard className="overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_40px_80px_-50px_rgba(11,31,58,0.5)] md:p-10">
                  <div className="flex h-full flex-col gap-8" style={{ transform: "translateZ(30px)" }}>
                    <div className="flex items-start justify-between">
                      <div
                        className="relative flex h-28 w-28 items-center justify-center rounded-full shadow-[inset_0_2px_6px_rgba(255,255,255,0.8),0_20px_40px_-15px_rgba(11,31,58,0.4)]"
                        style={{ background: `radial-gradient(circle at 30% 25%, ${c.from}, ${c.to})` }}
                      >
                        <div className="absolute inset-2 rounded-full border border-white/50" />
                        <span className="font-serif text-4xl font-medium text-white drop-shadow">{p.place}</span>
                      </div>
                      <span className="rounded-full bg-ivory-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-2">
                        {p.label}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {[p.medal, p.certificate, t.prizes].map((item) => (
                        <li key={item} className="flex items-center gap-3 border-b border-line pb-3 text-[15px] font-medium text-ink last:border-0 last:pb-0">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.to }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>

      <Section tone="ivory-2">
        <SectionHeader eyebrow={t.everyoneEyebrow} title={t.everyoneTitle} />
        <Stagger className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {t.everyone.map((e) => (
            <StaggerItem key={e.title} className="glass flex flex-col gap-5 rounded-[1.75rem] p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-gate-gold-2">
                <e.icon className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-2xl font-medium text-ink">{e.title}</h3>
              <p className="text-[14px] leading-[1.8] text-ink-2">{e.desc}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section tone="ivory">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-6">
            <SectionHeader align="left" eyebrow={t.standardsEyebrow} title={t.standardsTitle} lead={t.standardsLead} className="mb-0 md:mb-0" />
            <Reveal delay={0.2}>
              <ButtonLink href="/verify">{t.verify}</ButtonLink>
            </Reveal>
          </div>
          <Reveal className="glass relative overflow-hidden rounded-[2rem] p-8 md:p-10">
            <QrCode className="absolute -right-6 -top-6 h-40 w-40 text-gate-gold/10" />
            <ul className="relative flex flex-col">
              {t.standards.map((s) => (
                <li key={s} className="flex items-center gap-4 border-b border-line py-4 text-[15px] text-ink last:border-0">
                  <BadgeCheck className="h-5 w-5 shrink-0 text-gate-gold" />
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section tone="ivory-2">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-3xl font-serif text-4xl font-medium leading-[1.05] text-ink md:text-6xl">{t.ctaTitle}</h2>
          <p className="max-w-xl text-base leading-[1.8] text-ink-2">{t.ctaLead}</p>
          <ButtonLink href={`/${current.slug}`}>{t.see(current.name)}</ButtonLink>
        </Reveal>
      </Section>
    </>
  );
}
