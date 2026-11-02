"use client";

import { useActionState } from "react";
import { submitCareerApplication, type CareerFormState } from "@/app/actions/career";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/client";

const INITIAL: CareerFormState = { success: false, error: null, fieldErrors: {} };

const T = {
  en: {
    received: "Application Received",
    thanks: "Thank you for applying to G.A.T.E. Our HR team will review your application and be in touch within 7–10 business days.",
    fullName: "Full Name",
    fullNamePh: "Your full name",
    email: "Email",
    country: "Country",
    countryPh: "Country of residence",
    phone: "Phone (Optional)",
    motivation: "Motivation Letter",
    motivationPh: "Tell us about your background, why you want to work with G.A.T.E., and what you would bring to this role...",
    submitting: "Submitting...",
    submit: "Submit Application",
  },
  ru: {
    received: "Отклик получен",
    thanks: "Спасибо за интерес к G.A.T.E.! Мы рассмотрим ваш отклик и свяжемся с вами в течение 7–10 рабочих дней.",
    fullName: "Имя и фамилия",
    fullNamePh: "Ваше имя и фамилия",
    email: "Электронная почта",
    country: "Страна",
    countryPh: "Страна проживания",
    phone: "Телефон (необязательно)",
    motivation: "Сопроводительное письмо",
    motivationPh: "Расскажите о своём опыте, почему хотите работать в G.A.T.E. и что принесёте в команду…",
    submitting: "Отправляем…",
    submit: "Отправить отклик",
  },
};

export function CareerForm({ positionTitle }: { positionTitle: string }) {
  const t = T[useLocale()];
  const [state, action, pending] = useActionState(submitCareerApplication, INITIAL);

  if (state.success) {
    return (
      <div className="border border-gate-gold/30 bg-gate-gold/5 p-8 flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">{t.received}</p>
        <p className="text-sm font-light text-gate-800/65 leading-[1.9]">{t.thanks}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="positionTitle" value={positionTitle} />

      {state.error && (
        <p className="text-xs text-red-400 border border-red-400/30 bg-red-400/5 px-4 py-3">{state.error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">{t.fullName}</Label>
          <Input id="fullName" name="fullName" placeholder={t.fullNamePh} required />
          {state.fieldErrors.fullName && <p className="text-xs text-red-400">{state.fieldErrors.fullName}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t.email}</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          {state.fieldErrors.email && <p className="text-xs text-red-400">{state.fieldErrors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="country">{t.country}</Label>
          <Input id="country" name="country" placeholder={t.countryPh} required />
          {state.fieldErrors.country && <p className="text-xs text-red-400">{state.fieldErrors.country}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">{t.phone}</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+44 20 7946 0958" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="motivationText">{t.motivation}</Label>
        <Textarea id="motivationText" name="motivationText" placeholder={t.motivationPh} rows={6} required />
        {state.fieldErrors.motivationText && <p className="text-xs text-red-400">{state.fieldErrors.motivationText}</p>}
      </div>

      <TurnstileWidget className="mt-1" />

      <Button type="submit" variant="gold" size="md" disabled={pending} className="mt-1">
        {pending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
