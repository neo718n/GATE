"use client";

import { useActionState } from "react";
import { submitPartnerApplication, type PartnerFormState } from "@/app/actions/partnership";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/client";

const INITIAL: PartnerFormState = { success: false, error: null, fieldErrors: {} };

const SELECT_CLS =
  "flex h-10 w-full border border-border/50 bg-gate-white px-3 py-2 text-sm font-light text-gate-800 placeholder:text-gate-gray/50 focus:outline-none focus:ring-1 focus:ring-gate-gold/40";

// Stored values stay in English; only the labels are translated.
const COOP_TYPES = [
  { value: "Official Partner School", ru: "Официальная школа-партнёр" },
  { value: "Exam Center", ru: "Экзаменационный центр" },
  { value: "Sponsor", ru: "Спонсор" },
  { value: "Academic Advisor", ru: "Академический консультант" },
  { value: "Regional Representative", ru: "Региональный представитель" },
  { value: "Other", ru: "Другое" },
];

const T = {
  en: {
    types: [
      { value: "university", label: "University" },
      { value: "school", label: "School" },
      { value: "academic_institution", label: "Academic Institution" },
      { value: "organization", label: "Educational Organization" },
    ],
    received: "Application Received",
    thanks:
      "Thank you for your interest in partnering with G.A.T.E. Our team will review your application and contact you within 5–7 business days.",
    orgName: "Organization Name",
    orgNamePh: "Institution name",
    orgType: "Organization Type",
    selectType: "Select type",
    country: "Country",
    city: "City",
    cityPh: "City (optional)",
    website: "Website",
    websitePh: "https://example.com (optional)",
    contactName: "Contact Person",
    contactNamePh: "Full name",
    contactEmail: "Contact Email",
    coop: "Partnership Type Interest",
    selectOptional: "Select (optional)",
    message: "Message (Optional)",
    messagePh: "Tell us about your institution and how you see the partnership developing...",
    submitting: "Submitting...",
    submit: "Submit Partnership Application",
  },
  ru: {
    types: [
      { value: "university", label: "Университет" },
      { value: "school", label: "Школа" },
      { value: "academic_institution", label: "Академическое учреждение" },
      { value: "organization", label: "Образовательная организация" },
    ],
    received: "Заявка получена",
    thanks: "Спасибо за интерес к партнёрству с G.A.T.E. Мы рассмотрим заявку и свяжемся с вами в течение 5–7 рабочих дней.",
    orgName: "Название организации",
    orgNamePh: "Название учреждения",
    orgType: "Тип организации",
    selectType: "Выберите тип",
    country: "Страна",
    city: "Город",
    cityPh: "Город (необязательно)",
    website: "Сайт",
    websitePh: "https://example.com (необязательно)",
    contactName: "Контактное лицо",
    contactNamePh: "Имя и фамилия",
    contactEmail: "Электронная почта",
    coop: "Интересующий формат партнёрства",
    selectOptional: "Выберите (необязательно)",
    message: "Сообщение (необязательно)",
    messagePh: "Расскажите о вашем учреждении и о том, каким вы видите наше сотрудничество…",
    submitting: "Отправляем…",
    submit: "Отправить заявку на партнёрство",
  },
};

export function PartnershipForm() {
  const locale = useLocale();
  const t = T[locale];
  const [state, action, pending] = useActionState(submitPartnerApplication, INITIAL);

  if (state.success) {
    return (
      <div className="border border-gate-gold/30 bg-gate-gold/5 p-8 flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">{t.received}</p>
        <p className="text-sm font-light text-gate-800/65 leading-[1.9]">{t.thanks}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {state.error && (
        <p className="text-xs text-red-400 border border-red-400/30 bg-red-400/5 px-4 py-3">{state.error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="organizationName">{t.orgName}</Label>
          <Input id="organizationName" name="organizationName" placeholder={t.orgNamePh} required />
          {state.fieldErrors.organizationName && <p className="text-xs text-red-400">{state.fieldErrors.organizationName}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">{t.orgType}</Label>
          <select id="type" name="type" required className={SELECT_CLS}>
            <option value="">{t.selectType}</option>
            {t.types.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {state.fieldErrors.type && <p className="text-xs text-red-400">{state.fieldErrors.type}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="country">{t.country}</Label>
          <Input id="country" name="country" placeholder={t.country} required />
          {state.fieldErrors.country && <p className="text-xs text-red-400">{state.fieldErrors.country}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">{t.city}</Label>
          <Input id="city" name="city" placeholder={t.cityPh} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="website">{t.website}</Label>
        <Input id="website" name="website" type="url" placeholder={t.websitePh} />
        {state.fieldErrors.website && <p className="text-xs text-red-400">{state.fieldErrors.website}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactName">{t.contactName}</Label>
          <Input id="contactName" name="contactName" placeholder={t.contactNamePh} required />
          {state.fieldErrors.contactName && <p className="text-xs text-red-400">{state.fieldErrors.contactName}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactEmail">{t.contactEmail}</Label>
          <Input id="contactEmail" name="contactEmail" type="email" placeholder="email@institution.com" required />
          {state.fieldErrors.contactEmail && <p className="text-xs text-red-400">{state.fieldErrors.contactEmail}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cooperationType">{t.coop}</Label>
        <select id="cooperationType" name="cooperationType" className={SELECT_CLS}>
          <option value="">{t.selectOptional}</option>
          {COOP_TYPES.map((c) => <option key={c.value} value={c.value}>{locale === "ru" ? c.ru : c.value}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">{t.message}</Label>
        <Textarea id="message" name="message" placeholder={t.messagePh} rows={4} />
      </div>

      <Button type="submit" variant="gold" size="md" disabled={pending}>
        {pending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
