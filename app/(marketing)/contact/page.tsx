import { Building2, GraduationCap, Mail, MapPin, Users } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/brand-icons";
import { CONTACT } from "@/lib/site";
import { PageHero } from "@/components/site/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion/reveal";
import { getCurrentEdition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { getLocale, pageMetadata } from "@/lib/i18n/server";
import { ContactForm } from "./contact-form";

export const generateMetadata = () =>
  pageMetadata("/contact", {
    en: {
      title: "Contact",
      description: "Get in touch with the G.A.T.E. team — registration, programs, partnerships and careers.",
    },
    ru: {
      title: "Контакты",
      description: "Свяжитесь с командой G.A.T.E.: регистрация, программы, партнёрство и вакансии.",
    },
  });

const T = {
  en: {
    topics: [
      { icon: GraduationCap, title: "Programs & registration", body: "Eligibility, subjects, dates, what's included and how to join." },
      { icon: Building2, title: "Institutional partnerships", body: "Universities, schools and organisations interested in working with G.A.T.E." },
      { icon: Users, title: "Careers", body: "Interested in a role with the G.A.T.E. team? Mention it in your message." },
    ],
    eyebrow: "Get in touch",
    title: "Let's talk",
    lead: "Questions about a program, registration or partnerships? Write to us — a real person on the team answers every message.",
    email: "Email",
    next: "Next program",
  },
  ru: {
    topics: [
      { icon: GraduationCap, title: "Программы и регистрация", body: "Кто может участвовать, предметы, даты, что входит в стоимость и как записаться." },
      { icon: Building2, title: "Институциональное партнёрство", body: "Для университетов, школ и организаций, которые хотят работать с G.A.T.E." },
      { icon: Users, title: "Вакансии", body: "Хотите работать в команде G.A.T.E.? Напишите об этом в сообщении." },
    ],
    eyebrow: "Связаться с нами",
    title: "Давайте поговорим",
    lead: "Есть вопросы о программе, регистрации или партнёрстве? Напишите нам — на каждое сообщение отвечает живой человек из команды.",
    email: "Почта",
    next: "Ближайшая программа",
  },
};

export default async function ContactPage() {
  const locale = await getLocale();
  const t = T[locale];
  const TOPICS = t.topics;
  const current = localizeEdition(getCurrentEdition(), locale);

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <section className="bg-ivory px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Stagger className="flex flex-col gap-3">
              {TOPICS.map((topic) => (
                <StaggerItem key={topic.title} className="flex items-start gap-4 rounded-[1.5rem] bg-white p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ivory-2 text-gate-gold">
                    <topic.icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[15px] font-semibold text-ink">{topic.title}</h2>
                    <p className="text-[13px] leading-relaxed text-ink-2">{topic.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={CONTACT.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 rounded-[1.5rem] bg-[#25D366] p-5 text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon className="h-5 w-5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">WhatsApp</span>
                <span className="text-[14px] font-semibold">{CONTACT.whatsapp.display}</span>
              </a>
              <a
                href={CONTACT.email.href}
                className="group flex flex-col gap-2 rounded-[1.5rem] bg-ink p-5 text-ivory transition-colors hover:bg-gate-700"
              >
                <Mail className="h-5 w-5 text-gate-gold-2" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/60">{t.email}</span>
                <span className="break-all text-[13px] font-semibold">{CONTACT.email.display}</span>
              </a>
              <a
                href={CONTACT.instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-[1.5rem] bg-white p-4 sm:col-span-2"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_30%_110%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] text-white">
                  <InstagramIcon className="h-5 w-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">Instagram</span>
                  <span className="text-[14px] font-semibold text-ink">{CONTACT.instagram.display}</span>
                </span>
              </a>
            </Reveal>

            <Reveal className="glass flex items-start gap-4 rounded-[1.5rem] p-5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gate-gold" />
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">{t.next}</span>
                <span className="text-[14px] font-semibold text-ink">
                  {current.name} · {current.host}, {current.city}
                </span>
                <span className="text-[13px] text-ink-2">{current.dateLabel}</span>
              </div>
            </Reveal>
          </div>

          <Reveal className="rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-50px_rgba(11,31,58,0.45)] md:p-10">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
