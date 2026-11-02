import { Building, Eye, Landmark, MapPinned, Network, School, UserPlus, Users } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/site/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion/reveal";
import { getLocale, pageMetadata } from "@/lib/i18n/server";
import { PartnershipForm } from "./partnership-form";

export const generateMetadata = () =>
  pageMetadata("/partnerships", {
    en: { title: "Partnerships", description: "Partner with G.A.T.E. — universities, schools, and academic institutions." },
    ru: { title: "Партнёрство", description: "Партнёрство с G.A.T.E. для университетов, школ и академических учреждений." },
  });

const T = {
  en: {
    benefits: [
      { icon: Eye, title: "Global visibility", body: "Your institution is listed as an official G.A.T.E. partner across program materials, certificates and the platform." },
      { icon: UserPlus, title: "Student access", body: "Partner institutions can bring their students to G.A.T.E. programs through coordinated group registration." },
      { icon: Network, title: "Academic network", body: "Join an international network of universities, schools and academic organizations committed to rigorous assessment." },
      { icon: MapPinned, title: "Regional representation", body: "Qualified partners may represent G.A.T.E. in their region — informing families and bringing groups to each program." },
    ],
    types: [
      { icon: Landmark, title: "Universities", desc: "Higher education institutions offering school students meaningful academic evaluation." },
      { icon: School, title: "Schools", desc: "Schools seeking official participation channels and recognition for their students." },
      { icon: Building, title: "Academic institutions", desc: "Educational centers, research institutes and academic foundations aligned with G.A.T.E. values." },
      { icon: Users, title: "Organizations", desc: "Educational NGOs, foundations and national bodies interested in cooperation." },
    ],
    steps: ["Submit application", "Review (5–7 days)", "Approval confirmation", "Partnership agreement", "Onboarding & orientation"],
    heroEyebrow: "Institutional cooperation",
    heroTitle: "Partner with G.A.T.E.",
    heroLead: "Bring international academic programs to your students and community — partnership is designed to be meaningful, not ceremonial.",
    whyEyebrow: "Why partner",
    whyTitle: "Join the global academic network",
    typesEyebrow: "Partnership types",
    typesTitle: "Who can partner",
    applyEyebrow: "Apply",
    applyTitle: "Become a partner",
    applyLead: "All applications are reviewed by the G.A.T.E. team. You will be contacted within 5–7 business days.",
  },
  ru: {
    benefits: [
      { icon: Eye, title: "Международная известность", body: "Ваше учреждение указывается как официальный партнёр G.A.T.E. в материалах программы, на сертификатах и на платформе." },
      { icon: UserPlus, title: "Доступ для учеников", body: "Партнёры могут привозить своих учеников на программы G.A.T.E. через групповую регистрацию." },
      { icon: Network, title: "Академическая сеть", body: "Международное сообщество университетов, школ и организаций, для которых важна честная и строгая оценка знаний." },
      { icon: MapPinned, title: "Региональное представительство", body: "Партнёры могут представлять G.A.T.E. в своём регионе: рассказывать семьям о программе и собирать группы." },
    ],
    types: [
      { icon: Landmark, title: "Университеты", desc: "Вузы, которые хотят предложить школьникам содержательную академическую диагностику." },
      { icon: School, title: "Школы", desc: "Школы, которым нужен официальный канал участия и признание достижений учеников." },
      { icon: Building, title: "Академические учреждения", desc: "Образовательные центры, научные институты и фонды, разделяющие ценности G.A.T.E." },
      { icon: Users, title: "Организации", desc: "Образовательные НКО, фонды и государственные структуры, открытые к сотрудничеству." },
    ],
    steps: ["Подача заявки", "Рассмотрение (5–7 дней)", "Подтверждение", "Партнёрское соглашение", "Знакомство и запуск"],
    heroEyebrow: "Институциональное сотрудничество",
    heroTitle: "Станьте партнёром G.A.T.E.",
    heroLead: "Откройте своим ученикам и сообществу доступ к международным академическим программам. Партнёрство у нас — это реальная совместная работа, а не формальность.",
    whyEyebrow: "Зачем это вам",
    whyTitle: "Международная академическая сеть",
    typesEyebrow: "Форматы партнёрства",
    typesTitle: "Кто может стать партнёром",
    applyEyebrow: "Заявка",
    applyTitle: "Стать партнёром",
    applyLead: "Каждую заявку рассматривает команда G.A.T.E. Мы свяжемся с вами в течение 5–7 рабочих дней.",
  },
};

export default async function PartnershipsPage() {
  const t = T[await getLocale()];
  return (
    <>
      <PageHero eyebrow={t.heroEyebrow} title={t.heroTitle} lead={t.heroLead} />

      <Section tone="ivory">
        <SectionHeader eyebrow={t.whyEyebrow} title={t.whyTitle} />
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.benefits.map((b) => (
            <StaggerItem key={b.title} className="glass flex flex-col gap-4 rounded-[1.75rem] p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-gate-gold-2">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-2xl font-medium text-ink">{b.title}</h3>
              <p className="text-[14px] leading-[1.75] text-ink-2">{b.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section tone="ivory-2">
        <SectionHeader eyebrow={t.typesEyebrow} title={t.typesTitle} align="left" />
        <Stagger className="grid grid-cols-1 gap-px overflow-hidden rounded-[2rem] border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {t.types.map((ty) => (
            <StaggerItem key={ty.title} className="flex flex-col gap-4 bg-ivory-2 p-8 transition-colors hover:bg-white">
              <ty.icon className="h-7 w-7 text-gate-gold" />
              <h3 className="font-serif text-2xl font-medium text-ink">{ty.title}</h3>
              <p className="text-[14px] leading-[1.75] text-ink-2">{ty.desc}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section tone="ivory">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeader align="left" eyebrow={t.applyEyebrow} title={t.applyTitle} lead={t.applyLead} className="mb-0 md:mb-0" />
            <Stagger as="ol" className="flex flex-col">
              {t.steps.map((s, i) => (
                <StaggerItem as="li" key={s} className="flex items-center gap-4 border-b border-line py-4 last:border-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gate-gold/15 font-serif text-lg font-medium text-gate-gold">
                    {i + 1}
                  </span>
                  <span className="text-[15px] font-medium text-ink">{s}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Reveal className="rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-50px_rgba(11,31,58,0.45)] md:p-10">
            <PartnershipForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
